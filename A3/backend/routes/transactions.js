const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { jwtAuth } = require('../middleware/token_auth');

router.post('/', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { utorid, type, spent, amount, relatedId, promotionIds, remark } = req.body;
    if (type !== 'purchase' && type !== 'adjustment') {
        return res.status(400).json({ error: 'Type must be "purchase" or "adjustment"' });
    }

    if (typeof utorid !== 'string' || utorid === undefined || utorid === null) {
        return res.status(400).json({ error: 'utorid must be a string' });
    }
    const user = await prisma.user.findUnique({ where: { utorid } });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'purchase') {
        // Check clearance: Cashier or higher
        if (req.clearance < 2) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (typeof spent !== 'number' || spent <= 0 || spent === undefined || spent === null) {
            return res.status(400).json({ error: 'Spent must be a positive number' });
        }

        // Validate promotionIds if provided
        let appliedPromotions = [];
        if (promotionIds) {
            if (!Array.isArray(promotionIds)) {
                return res.status(400).json({ error: 'promotionIds must be an array' });
            }
            for (const id of promotionIds) {
                const promotion = await prisma.promotion.findUnique({ where: { id } });
                if (!promotion) {
                    return res.status(400).json({ error: `Promotion ${id} does not exist` });
                }
                const now = new Date();
                if (promotion.startTime > now || promotion.endTime < now) {
                    return res.status(400).json({ error: `Promotion ${id} is not active` });
                }
                // Only check if user has already used this promotion if it's a one-time promotion
                if (promotion.type === 'ONETIME') {
                    const existingTransaction = await prisma.transaction.findFirst({
                        where: {
                            userId: user.id,
                            promotions: { some: { id: promotion.id } }
                        }
                    });
                    if (existingTransaction) {
                        return res.status(400).json({ error: `Promotion ${id} has already been used by this user` });
                    }
                }
                
                appliedPromotions.push(promotion);
            }
        }

        // Calculate points: 1 point per 25 cents (spent is in dollars, so spent * 100 / 25)
        const basePoints = Math.round((spent * 100) / 25);
        let totalEarned = basePoints;
        for (const promotion of appliedPromotions) {
            if (promotion.minSpending && spent < promotion.minSpending) {
                return res.status(400).json({ error: `Promotion ${promotion.id} requires a minimum spending of $${promotion.minSpending}` });
            }
            if (promotion.points) {
                totalEarned += promotion.points;
            }
            if (promotion.rate) {
                totalEarned += spent * 100 * promotion.rate;
            }
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                type: 'PURCHASE',
                spent,
                points: totalEarned,
                remark,
                suspicious: req.user.suspicious,
                userId: user.id,
                createdById: req.user.id,
                promotions: {
                    connect: appliedPromotions.map(p => ({ id: p.id }))
                }
            }
        });
        
        let held = false;
        if (!req.user.suspicious) {
            await prisma.user.update({
                where: { id: user.id },
                data: { points: { increment: totalEarned } }
            });
        } else {
            held = true;
        }

        return res.status(201).json({
            id: transaction.id,
            utorid: user.utorid,
            type: 'purchase',
            spent: transaction.spent,
            earned: held ? 0 : transaction.points,
            remark: transaction.remark || '',
            promotionIds: appliedPromotions.map(p => p.id),
            createdBy: req.user.utorid
        });
    } else if (type === 'adjustment') {
        // Check clearance: Manager or higher
        if (req.clearance < 3) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Validate amount and relatedId
        if (amount === undefined || typeof amount !== 'number' || amount === null) {
            return res.status(400).json({ error: 'Amount must be a number' });
        }
        if (relatedId === undefined || typeof relatedId !== 'number' || relatedId === null) {
            return res.status(400).json({ error: 'Related ID is required' });
        }
        const relatedTransaction = await prisma.transaction.findUnique({ where: { id: relatedId } });
        if (!relatedTransaction) {
            return res.status(404).json({ error: 'Related transaction not found' });
        }

        // Validate promotionIds if provided (optional)
        let appliedPromotions = [];
        if (promotionIds) {
            if (!Array.isArray(promotionIds)) {
                return res.status(400).json({ error: 'promotionIds must be an array' });
            }
            for (const id of promotionIds) {
                const promotion = await prisma.promotion.findUnique({ where: { id } });
                if (!promotion) {
                    return res.status(400).json({ error: `Promotion ${id} does not exist` });
                }
                const now = new Date();
                if (promotion.startTime > now || promotion.endTime < now) {
                    return res.status(400).json({ error: `Promotion ${id} is not active` });
                }
                appliedPromotions.push(promotion);
            }
        }
        if (user.points + amount < 0) {
            return res.status(400).json({ error: 'User does not have enough points' });
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                type: 'ADJUSTMENT',
                points: amount,
                remark,
                suspicious: req.user.suspicious,
                userId: user.id,
                createdById: req.user.id,
                AdjustedTransactionId: relatedId,
                promotions: {
                    connect: appliedPromotions.map(p => ({ id: p.id }))
                }
            }
        });

        // Update user's points
        await prisma.user.update({
            where: { id: user.id },
            data: { points: { increment: amount } }
        });

        return res.status(201).json({
            id: transaction.id,
            utorid: user.utorid,
            amount: transaction.points,
            type: 'adjustment',
            relatedId: transaction.AdjustedTransactionId,
            remark: transaction.remark || '',
            promotionIds: appliedPromotions.map(p => p.id),
            createdBy: req.user.utorid
        });
    }
});

// GET /transactions - Retrieve a list of transactions
router.get('/', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    let { name, createdBy, suspicious, promotionId, type, relatedId, amount, operator, page, limit } = req.query;
    if (page !== undefined && page !== null) {
        page = parseInt(page, 10);
        if (isNaN(page) || page < 1) {
            return res.status(400).json({ error: 'Invalid page number' });
        }
    }
    
    if (limit !== undefined && limit !== null) {
        limit = parseInt(limit, 10);
        if (isNaN(limit) || limit < 1) {
            return res.status(400).json({ error: 'Invalid limit number' });
        }
    }

    if (page === undefined || page === null) {
        page = 1;
    }
    if (limit === undefined || limit === null) {
        limit = 10;
    }
    if (name !== undefined && typeof name !== 'string' && name!==null) {
        return res.status(400).json({ error: 'Name must be a string' });
    }
    if (createdBy !== undefined && typeof createdBy !== 'string' && createdBy!==null) {
        return res.status(400).json({ error: 'CreatedBy must be a string' });
    }
    if (suspicious !== undefined && suspicious !== null){
        if (suspicious == 'true') {
            suspicious = true;
        } else if (suspicious == 'false') {
            suspicious = false;
        }
        if (typeof suspicious !== 'boolean') {
            return res.status(400).json({ error: 'Suspicious must be a boolean' });
        }
    }
    if (promotionId !== undefined && promotionId!==null) {
        promotionId = parseInt(promotionId, 10);
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }
    }
    if (type !== undefined && typeof type !== 'string' && type!==null) {
        return res.status(400).json({ error: 'Type must be a string' });
    }
    if (relatedId !== undefined && relatedId!==null) {
        relatedId = parseInt(relatedId, 10);
        if (isNaN(relatedId)) {
            return res.status(400).json({ error: 'Invalid related ID' });
        }
    }
    if (amount !== undefined && amount !== null) {
        amount = parseInt(amount, 10);
        if (isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
    }
    if (operator !== undefined && typeof operator !== 'string' && operator!==null) {
        return res.status(400).json({ error: 'Operator must be a string' });
    }

    const where = {};
    if (name) {
        where.user = {
            OR: [
                { utorid: { contains: name } },
                { name: { contains: name } }
            ]
        };
    }
    if (createdBy) {
        where.createdBy = { utorid: createdBy };
    }
    if (suspicious !== undefined && suspicious !== null) {
        where.suspicious = suspicious;
    }
    if (promotionId) {
        where.promotions = { some: { id: promotionId } };
    }
    if (type) {
        where.type = type.toUpperCase();
    }
    if (relatedId!==undefined && relatedId!==null) {
        if (!type) {
            return res.status(400).json({ error: 'relatedId must be used with type' });
        }
        const relatedIdNum = relatedId;
        if (type.toLowerCase() === 'adjustment') {
            where.AdjustedTransactionId = relatedIdNum;
        } else if (type.toLowerCase() === 'transfer') {
            where.relatedUserId = relatedIdNum;
        } else if (type.toLowerCase() === 'redemption') {
            where.processedById = relatedIdNum;
        } else if (type.toLowerCase() === 'event') {
            where.eventId = relatedIdNum;
        } else {
            return res.status(400).json({ error: 'Invalid type for relatedId' });
        }
    }
    if (amount !== undefined && amount !== null) {
        if (!operator || !['gte', 'lte'].includes(operator)) {
            return res.status(400).json({ error: 'Operator must be "gte" or "lte"' });
        }
        where.points = operator === 'gte' ? { gte: amount } : { lte: amount };
    }

    const transactions = await prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true, createdBy: true, promotions: true }
    });
    const count = await prisma.transaction.count({ where });

    const results = transactions.map(t => {
        const resultObj = {
            id: t.id,
            utorid: t.user.utorid,
            amount: t.points,
            type: t.type.toLowerCase(),
            spent: t.spent,
            promotionIds: t.promotions.map(p => p.id),
            suspicious: t.suspicious,
            remark: t.remark || '',
            createdBy: t.createdBy.utorid,
            redeemed: t.redeemed,
        };
        if (t.type === 'ADJUSTMENT') {
            resultObj.relatedId = t.AdjustedTransactionId;
        } else if (t.type === 'TRANSFER') {
            resultObj.relatedId = t.relatedUserId;
        } else if (t.type === 'REDEMPTION') {
            resultObj.relatedId = t.processedById;
        } else if (t.type === 'EVENT') {
            resultObj.relatedId = t.eventId;
        }
        return resultObj;
    });

    return res.status(200).json({ count, results });
});

// GET /transactions/:transactionId - Retrieve a single transaction
router.get('/:transactionId', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const transactionId = parseInt(req.params.transactionId);
    if (isNaN(transactionId)) {
        return res.status(404).json({ error: 'Invalid transaction ID' });
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true, createdBy: true, promotions: true }
    });
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }
    let relatedId = null;
    if (transaction.type === 'ADJUSTMENT') {
        relatedId = transaction.AdjustedTransactionId;
    } else if (transaction.type === 'TRANSFER') {
        relatedId = transaction.relatedUserId;
    } else if (transaction.type === 'REDEMPTION') {
        relatedId = transaction.processedById;
    } else if (transaction.type === 'EVENT') {
        relatedId = transaction.eventId;
    }

    return res.status(200).json({
        id: transaction.id,
        utorid: transaction.user.utorid,
        type: transaction.type.toLowerCase(),
        spent: transaction.spent,
        amount: transaction.points,
        promotionIds: transaction.promotions.map(p => p.id),
        suspicious: transaction.suspicious,
        remark: transaction.remark || '',
        createdBy: transaction.createdBy.utorid,
        relatedId
    });
});

router.patch('/:transactionId/suspicious', jwtAuth, async (req, res) => {
    if (req.clearance < 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const transactionId = parseInt(req.params.transactionId);
    if (isNaN(transactionId)) {
        return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    const { suspicious } = req.body;
    if (suspicious === "true") {
        suspicious = true;
    } else if (suspicious === "false") {
        suspicious = false;
    }
    if (typeof suspicious !== 'boolean') {
        return res.status(400).json({ error: 'Suspicious must be a boolean' });
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true, createdBy: true, promotions: true }
    });
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { suspicious }
    });

    if (suspicious && !transaction.suspicious) {
        await prisma.user.update({
            where: { id: transaction.userId },
            data: { points: { decrement: transaction.points } }
        });
    } else if (!suspicious && transaction.suspicious) {
        await prisma.user.update({
            where: { id: transaction.userId },
            data: { points: { increment: transaction.points } }
        });
    }

    return res.status(200).json({
        id: updatedTransaction.id,
        utorid: transaction.user.utorid,
        type: updatedTransaction.type.toLowerCase(),
        spent: updatedTransaction.spent,
        amount: updatedTransaction.points,
        promotionIds: transaction.promotions.map(p => p.id),
        suspicious: updatedTransaction.suspicious,
        remark: updatedTransaction.remark || '',
        createdBy: transaction.createdBy.utorid
    });
});

router.patch('/:transactionId/processed', jwtAuth, async (req, res) => {
    console.log("transaction process patch");
    console.log(req.clearance);
    console.log(req.body);
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 2) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const transactionId = parseInt(req.params.transactionId);
    if (isNaN(transactionId)) {
        return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    const { processed } = req.body;
    if (processed === "true") {
        processed = true;
    }
    if (processed !== true) {
        return res.status(400).json({ error: 'Processed must be true' });
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true, createdBy: true, promotions: true }
    });
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }
    if (transaction.type !== 'REDEMPTION') {
        return res.status(400).json({ error: 'Transaction is not a redemption' });
    }
    if (transaction.processedById !== null) {
        return res.status(400).json({ error: 'Transaction has already been processed' });
    }

    const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { processedById: req.user.id }
    });

    await prisma.user.update({
        where: { id: transaction.userId },
        data: { points: { decrement: transaction.redeemed } }
    });

    return res.status(200).json({
        id: updatedTransaction.id,
        utorid: transaction.user.utorid,
        type: 'redemption',
        processedBy: req.user.utorid,
        redeemed: transaction.redeemed,
        remark: transaction.remark || '',
        createdBy: transaction.createdBy.utorid
    });
});


module.exports = router;