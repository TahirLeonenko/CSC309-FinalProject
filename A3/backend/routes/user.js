const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {v4: uuidv4} = require('uuid');
const {jwtAuth, CLEARANCE_LEVELS} = require('../middleware/token_auth');

// Define routes
router.post('/', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 2) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const {utorid, name, email} = req.body;
    // Validate required fields
    if (!utorid || !name || !email) {
        return res.status(400).json({ 
            error: 'Missing required fields: utorid, name, and email are required' 
        });
    }
    
    // Validate utorid: Alphanumeric, 8 characters
    if (typeof utorid !== 'string' || !/^[a-zA-Z0-9]{8}$/.test(utorid)) {
        return res.status(400).json({ 
            error: 'UTORid must be alphanumeric and exactly 8 characters long' 
        });
    }
    
    // Validate name: 1-50 characters
    if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
        return res.status(400).json({ 
            error: 'Name must be between 1 and 50 characters' 
        });
    }

    // utorid must be unique
    const existingUser = await prisma.user.findUnique({
        where: { utorid }
    });
    if (existingUser) {
        return res.status(409).json({ 
            error: 'User with this UTORid already exists' 
        });
    }

    if (typeof email !== 'string' || !email.endsWith('@mail.utoronto.ca')) {
        return res.status(400).json({ 
            error: 'Email must be a valid UofT email ending with @mail.utoronto.ca' 
        });
    }

    // const existingEmail = await prisma.user.findUnique({
    //     where: { email }
    // });
    // if (existingEmail) {
    //     return res.status(409).json({ 
    //         error: 'User with this email already exists'
    //     });
    // }

    // Create user
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24 * 7);
    const user = await prisma.user.create({
        data: { 
            utorid,
            name,
            email,
            resetToken: token,
            expiresAt
        }
    });

    return res.status(201).json({
        id: user.id,
        utorid: user.utorid,
        name: user.name,
        email: user.email,
        verified: user.verified,
        expiresAt: user.expiresAt,
        resetToken: user.resetToken
    });

});

router.get('/', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let {name, role, verified, activated, page, limit, sortBy, sortOrder} = req.query;
    const where = {};
    if (name!==undefined && name!==null) {
        where.name = { contains: name };
    }
    if (role!==undefined && role!==null) {
        where.role = role.toUpperCase();
    }
    if (verified!==undefined && verified!==null) {
        if (verified === 'true') {
            verified = true;
        } else if (verified === 'false') {
            verified = false;
        }
        if (typeof verified !== 'boolean' && typeof verified !== 'string') {
            return res.status(400).json({ error: 'Invalid verified flag' });
        }
        where.verified = verified;
    }
    if (activated!==undefined && activated!==null) {
        if (activated === 'true') {
            where.lastLogin = { not: null };
        } else if (activated === 'false') {
            where.lastLogin = null;
        }
        if (typeof activated !== 'boolean' && typeof activated !== 'string') {
            return res.status(400).json({ error: 'Invalid activated flag' });
        }
    }
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

    const validSortFields = ['name', 'createdAt', 'lastLogin', 'role', 'points', 'utorid'];
    let orderBy = {};
    if (sortBy !== undefined && sortBy !== null) {
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({ error: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}` });
        }
        
        const order = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        orderBy[sortBy] = order;
    } else {
        orderBy = { createdAt: 'desc' };
    }
    if (page === undefined) {
        page = 1;
    }
    if (limit === undefined) {
        limit = 10;
    }
    const users = await prisma.user.findMany({ 
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy
    });
    const count = await prisma.user.count({ where });
    const results = [];
    for (const user of users) {
        results.push({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday,
            role: user.role.toLocaleLowerCase(),
            points: user.points,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.verified,
            activated: user.lastLogin ? true : false
        });
    }
    return res.status(200).json({ count, results });
});

router.get('/me', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = req.user;
    const validPromotions = await prisma.promotion.findMany({
        where: {
          // Promotion must be active: startTime before now, endTime after now
          startTime: { lt: new Date() },
          endTime: { gt: new Date() },
          
          // No transaction from this particular user
          OR: [
            // For AUTOMATIC promotions, don't check usage
            { type: 'AUTOMATIC' },
            
            // For ONETIME promotions, check if user hasn't used it yet
            {
                type: 'ONETIME',
                transactions: {
                    none: {
                        userId: user.id
                    }
                }
            }
          ]
        }
    });
    const promotions = [];
    for (const promotion of validPromotions) {
        promotions.push({
            id: promotion.id,
            name: promotion.title,
            minSpendging: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points,
        });
    }
    return res.status(200).json({
        id: user.id,
        utorid: user.utorid,
        name: user.name,
        email: user.email,
        birthday: user.birthday,
        role: user.role.toLowerCase(),
        points: user.points,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        verified: user.verified,
        avatarUrl: user.avatarUrl,
        promotions: promotions
    });
});

router.patch('/me', jwtAuth, async (req, res) => {
    console.log("patch me");
    console.log(req.clearance);
    console.log(req.body);
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = req.user;
    let changes = {};
    const {email, name, birthday, avatar} = req.body;
    if (email!==undefined && email!==null && email!=='') {
        if (typeof email !== 'string' || !email.endsWith('@mail.utoronto.ca')) {
            console.log("email error");
            return res.status(400).json({ 
                error: 'Email must be a valid UofT email ending with @mail.utoronto.ca' 
            });
        }
    
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });
        if (existingEmail) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        user.email = email;
        changes.email = email;
    } 
    if (name!==undefined && name!==null) {
        if (typeof name !== 'string') {
            return res.status(400).json({ error: 'Invalid name' });
        }
        if (name.length < 1 || name.length > 50) {
            return res.status(400).json({ error: 'name must be between 1 and 50 characters' });
        }
        user.name = name;
        changes.name = name;
    } 
    if (birthday!==undefined && birthday!==null) {
        if (typeof birthday !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
            console.log("birthday error");
            return res.status(400).json({ error: 'Birthday must be in YYYY-MM-DD format' });
          }

        // Then check if it's a valid date
        const date = new Date(birthday);
        if (isNaN(date.getTime())) {
            console.log("date error");
            return res.status(400).json({ error: 'Invalid date' });
        }
        
        // Use UTC methods to prevent timezone issues
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        if (formattedDate !== birthday) {
            console.log("formatted date error");
            console.log(formattedDate);
            console.log(birthday);
            return res.status(400).json({ error: 'Invalid date' });
        }


        user.birthday = birthday;
        changes.birthday = birthday;
    } 
    if (avatar!==undefined && avatar!==null) {
        if (typeof avatar !== 'string') {
            console.log("avatar error");
            return res.status(400).json({ error: 'Invalid avatar URL' });
        }
        user.avatarUrl = avatar;
        changes.avatarUrl = avatar;
    } 

    if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: 'No changes provided' });
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: changes
    });
    const response = {
        id: updatedUser.id,
        utorid: updatedUser.utorid,
        name: updatedUser.name,
        email: updatedUser.email,
        birthday: updatedUser.birthday,
        role: updatedUser.role.toLowerCase(),
        points: updatedUser.points,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        verified: updatedUser.verified,
        avatarUrl: updatedUser.avatarUrl
    }
    return res.status(200).json(response);
});

router.patch('/me/password', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = req.user;
    const {old, new: newPassword} = req.body;
    if (old === undefined || newPassword === undefined || old === null || newPassword === null) {
        return res.status(400).json({ error: 'Missing required fields: old and newPassword are required' });
    }
    if (user.password !== old) {
        return res.status(403).json({ error: 'Incorrect password' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'Password must be 8-20 characters with uppercase, lowercase, number, and special character'
      });
    }
  
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: newPassword }
    });
    return res.status(200).json({ message: 'Password updated successfully' });
});


router.get('/:userid', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 2) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let userid = req.params.userid;
    userid = parseInt(userid);
    if (isNaN(userid)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await prisma.user.findUnique({
        where: { id: userid }
    });
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }
    const validPromotions = await prisma.promotion.findMany({
        where: {
          // Promotion must be active: startTime before now, endTime after now
          startTime: { lt: new Date() },
          endTime: { gt: new Date() },
          
          // No transaction from this particular user
          transactions: {
            none: {
              userId: userid
            }
          }
        }
    });
    const promotions = [];
    for (const promotion of validPromotions) {
        promotions.push({
            id: promotion.id,
            name: promotion.title,
            minSpendging: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points,
        });
    }
    if (req.clearance < 3) {
        return res.status(200).json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            points: user.points,
            verified: user.verified,
            promotions: promotions
        });
    } else {
        return res.status(200).json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday,
            role: user.role.toLocaleLowerCase(),
            points: user.points,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.verified,
            avatarUrl: user.avatarUrl,
            promotions: promotions
        });
    }

});

router.patch('/:userid', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let userid = req.params.userid;
    userid = parseInt(userid);
    if (isNaN(userid)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const {email, verified, suspicious, role} = req.body;
    const user = await prisma.user.findUnique({
        where: { id: userid }
    });
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }
    let changes = {};
    changes.id = user.id
    changes.utorid = user.utorid;
    changes.name = user.name;
    if (email!==undefined && email!==null) {
        if (typeof email !== 'string' || !email.endsWith('@mail.utoronto.ca')) {
            return res.status(400).json({ 
                error: 'Email must be a valid UofT email ending with @mail.utoronto.ca' 
            });
        }
        changes.email = email;
    } 
    if (verified!==undefined && verified!==null) {
        if (verified === 'true') {
            verified = true;
        } else if (verified === 'false') {
            verified = false;
        }
        if (typeof verified !== 'boolean' && typeof verified !== 'string') {
            return res.status(400).json({ error: 'Invalid verified flag' });
        }
        if (!verified) {
            return res.status(400).json({ error: 'Cannot unverify user' });
        }
        changes.verified = verified
    }
    if (suspicious !== undefined && suspicious !== null) {
        if (suspicious === 'true') {
            suspicious = true;
        } else if (suspicious === 'false') {
            suspicious = false;
        }
        if (typeof suspicious !== 'boolean' && typeof suspicious !== 'string') {
            return res.status(400).json({ error: 'Invalid suspicious flag' });
        }
        changes.suspicious = suspicious;
    }
    if (role !== undefined && role !== null) {
        if (typeof role !== 'string') {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Manager can only set "cashier" or "regular"
        // Superuser can set any valid role
        const managerRoles = ['cashier', 'regular'];
        const superuserRoles = ['regular', 'cashier', 'manager', 'superuser'];
        if (req.clearance === 3 && !managerRoles.includes(role.toLowerCase())) {
            return res.status(403).json({ error: 'Managers can only set role to cashier or regular' });
        }
        // If clearance=4 (Superuser), allow superuserRoles
        if (req.clearance === 4 && !superuserRoles.includes(role.toLowerCase())) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // If role is cashier, suspicious defaults to false (if not already specified)
        if (role.toLowerCase() === 'cashier' && suspicious === undefined) {
            changes.suspicious = false;
        }

        changes.role = role.toUpperCase();
    }
    if (Object.keys(changes).length <= 3) {
        return res.status(400).json({ error: 'No changes provided' });
    }

    const updatedUser = await prisma.user.update({
        where: { id: userid },
        data: changes
    });
    if ('role' in changes) {
        changes.role = role.toLowerCase();
    }
    return res.status(200).json(changes);

});



// POST /users/me/transactions - Create a redemption transaction
router.post('/me/transactions', jwtAuth, async (req, res) => {
    console.log("redemption");
    console.log(req.clearance);
    console.log(req.body);
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, amount, remark } = req.body;
    if (type !== 'redemption') {
        return res.status(400).json({ error: 'Type must be "redemption"' });
    }
    if (amount !== undefined && amount !== null) {
        if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
            return res.status(400).json({ error: 'Amount must be a positive integer' });
        }
    }

    const user = req.user;
    if (!user.verified) {
        return res.status(403).json({ error: 'User must be verified' });
    }
    if (user.points < amount) {
        return res.status(400).json({ error: 'Insufficient points' });
    }

    const transaction = await prisma.transaction.create({
        data: {
            type: 'REDEMPTION',
            points: -amount,
            redeemed: amount,
            remark,
            userId: user.id,
            createdById: user.id
        }
    });

    return res.status(201).json({
        id: transaction.id,
        utorid: user.utorid,
        type: 'redemption',
        processedBy: null,
        amount: amount,
        remark: transaction.remark || '',
        createdBy: user.utorid
    });
});

router.get('/me/transactions', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let { type, relatedId, promotionId, amount, operator, page, limit } = req.query;
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

    if (relatedId !== undefined && relatedId !== null) {
        relatedId = parseInt(relatedId, 10);
        if (isNaN(relatedId)) {
            return res.status(400).json({ error: 'Invalid relatedId' });
        }
    }
    if (promotionId !== undefined && promotionId !== null) {
        promotionId = parseInt(promotionId, 10);
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: 'Invalid promotionId' });
        }
    }
    if (amount !== undefined && amount !== null) {
        amount = parseInt(amount, 10);
        if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
    }
    if (operator !== undefined && operator !== null && operator !== 'gte' && operator !== 'lte') {
        return res.status(400).json({ error: 'Operator must be "gte" or "lte"' });
    }

    const where = { userId: req.user.id };
    if (type) {
        where.type = type.toUpperCase();
    }
    if (relatedId) {
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
    if (promotionId) {
        where.promotions = { some: { id: promotionId } };
    }
    if (amount !== undefined && amount !== null) {
        if (!operator || !['gte', 'lte'].includes(operator)) {
            return res.status(400).json({ error: 'Operator must be "gte" or "lte"' });
        }
        const amountNum = amount;
        where.points = operator === 'gte' ? { gte: amountNum } : { lte: amountNum };
    }

    const transactions = await prisma.transaction.findMany({
        where,
        include: { promotions: true, createdBy: true },
        skip: (page - 1) * limit,
        take: limit
    });
    const count = await prisma.transaction.count({ where });

    const results = transactions.map(t => ({
        id: t.id,
        type: t.type.toLowerCase(),
        spent: t.spent,
        amount: t.points,
        promotionIds: t.promotions.map(p => p.id),
        remark: t.remark || '',
        createdBy: t.createdBy ? t.createdBy.utorid : null,
        relatedId: t.AdjustedTransactionId || t.relatedUserId || t.processedById || t.eventId || null
    }));

    return res.status(200).json({ count, results });
});

router.post('/:userId/transactions', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, amount, remark } = req.body;
    if (type !== 'transfer') {
        return res.status(400).json({ error: 'Type must be "transfer"' });
    }
    if (amount !== undefined && amount !== null && (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount))) {
        return res.status(400).json({ error: 'Amount must be a positive integer' });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    const sender = req.user;
    const recipient = await prisma.user.findUnique({ where: { id: userId } });
    if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
    }
    if (!sender.verified) {
        return res.status(403).json({ error: 'Sender must be verified' });
    }
    if (sender.points < amount) {
        return res.status(400).json({ error: 'Insufficient points' });
    }

    const senderTransaction = await prisma.transaction.create({
        data: {
            type: 'TRANSFER',
            points: -amount,
            remark,
            userId: sender.id,
            createdById: sender.id,
            relatedUserId: recipient.id
        }
    });

    await prisma.transaction.create({
        data: {
            type: 'TRANSFER',
            points: amount,
            remark,
            userId: recipient.id,
            createdById: sender.id,
            relatedUserId: sender.id
        }
    });

    await prisma.user.update({
        where: { id: sender.id },
        data: { points: { decrement: amount } }
    });
    await prisma.user.update({
        where: { id: recipient.id },
        data: { points: { increment: amount } }
    });

    return res.status(201).json({
        id: senderTransaction.id,
        sender: sender.utorid,
        recipient: recipient.utorid,
        type: 'transfer',
        sent: amount,
        remark: senderTransaction.remark || '',
        createdBy: sender.utorid
    });
});




module.exports = router;
