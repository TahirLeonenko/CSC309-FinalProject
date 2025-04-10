const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { jwtAuth } = require('../middleware/token_auth');

router.post('/', jwtAuth, async (req, res) => {

    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required and must be a string' });
    }
    if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: 'Description is required and must be a string' });
    }
    if (!type || (type !== 'automatic' && type !== 'one-time')) {
        return res.status(400).json({ error: 'Type must be "automatic" or "one-time"' });
    }
    if (type === 'one-time') { type = 'onetime'; }
    if (!startTime || typeof startTime !== 'string') {
        return res.status(400).json({ error: 'Start time is required and must be a string' });
    }
    if (!endTime || typeof endTime !== 'string') {
        return res.status(400).json({ error: 'End time is required and must be a string' });
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Start time and end time must be in ISO 8601 format' });
    }
    const now = new Date();
    if (start < now) {
        return res.status(400).json({ error: 'Start time cannot be in the past' });
    }
    if (start >= end) {
        return res.status(400).json({ error: 'End time must be after start time' });
    }
    if (minSpending !== undefined && minSpending !== null && (typeof minSpending !== 'number' || minSpending <= 0)) {
        return res.status(400).json({ error: 'Min spending must be a positive number' });
    }
    if (rate !== undefined && rate !== null && (typeof rate !== 'number' || rate <= 0)) {
        return res.status(400).json({ error: 'Rate must be a positive number' });
    }
    if (points !== undefined && points !== null && (typeof points !== 'number' || points < 0 || !Number.isInteger(points))) {
        return res.status(400).json({ error: 'Points must be a positive integer' });
    }
    const promotion = await prisma.promotion.create({
        data: {
            name: name,
            description,
            type: type.toUpperCase(),
            startTime: start,
            endTime: end,
            minSpending,
            rate,
            points
        }
    });
    return res.status(201).json({
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type.toLowerCase(),
        startTime: promotion.startTime.toISOString(),
        endTime: promotion.endTime.toISOString(),
        minSpending: promotion.minSpending,
        rate: promotion.rate,
        points: promotion.points
    });
});

router.get('/', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    let { name, type, started, ended, page, limit } = req.query;
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
    if (req.clearance >= 3 && started !== undefined && ended !== undefined) {
        return res.status(400).json({ error: 'Cannot specify both started and ended' });
    }
    const where = {};
    if (name !== undefined && name !== null && typeof name !== 'string') {
        return res.status(400).json({ error: 'Name must be a string' });
    }
    if (type !== undefined && type !== null && typeof type !== 'string') {
        return res.status(400).json({ error: 'Type must be a string' });
    }
    if (name) where.name = { contains: name };
    if (type) where.type = type.toUpperCase();
    const now = new Date();
    if (req.clearance >= 3) {
        if (started !== undefined && started !== null) {
            started = started === 'true';
            if (typeof started !== 'boolean' && typeof started !== 'string') {
                return res.status(400).json({ error: 'Started must be a boolean' });
            }
            where.startTime = started ? { lte: now } : { gt: now };
        }
        if (ended !== undefined && ended !== null) {
            ended = ended === 'true';
            if (typeof ended !== 'boolean' && typeof ended !== 'string') {
                return res.status(400).json({ error: 'Ended must be a boolean' });
            }
            where.endTime = ended ? { lte: now } : { gt: now };
        }
    } else {
        where.startTime = { lte: now };
        where.endTime = { gt: now };
        where.transactions = { none: { userId: req.user.id } };
    }
    const promotions = await prisma.promotion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit
    });
    const count = await prisma.promotion.count({ where });
    const results = promotions.map(p => {
        const promoData = {
            id: p.id,
            name: p.name,
            type: p.type.toLowerCase(),
            endTime: p.endTime.toISOString(),
            minSpending: p.minSpending,
            rate: p.rate,
            points: p.points
        };
        if (req.clearance >= 3) {
            promoData.startTime = p.startTime.toISOString();
        }
        return promoData;
    });
    return res.status(200).json({ count, results });
});

router.get('/:promotionId', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const promotionId = parseInt(req.params.promotionId);
    if (isNaN(promotionId)) {
        return res.status(400).json({ error: 'Invalid promotion ID' });
    }
    const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
    }
    const now = new Date();
    if (req.clearance >= 3) {
        return res.status(200).json({
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type.toLowerCase(),
            startTime: promotion.startTime.toISOString(),
            endTime: promotion.endTime.toISOString(),
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        });
    } else {
        if (promotion.startTime > now || promotion.endTime < now) {
            return res.status(404).json({ error: 'Promotion not found' });
        }
        const transaction = await prisma.transaction.findFirst({
            where: { userId: req.user.id, promotions: { some: { id: promotion.id } } }
        });
        if (transaction) {
            return res.status(404).json({ error: 'Promotion not found' });
        }
        return res.status(200).json({
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type.toLowerCase(),
            endTime: promotion.endTime.toISOString(),
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        });
    }
});

router.patch('/:promotionId', jwtAuth, async (req, res) => {
    if (req.clearance < 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const promotionId = parseInt(req.params.promotionId);
    if (isNaN(promotionId)) {
        return res.status(400).json({ error: 'Invalid promotion ID' });
    }
    const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
    }
    const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;
    const changes = {};
    const now = new Date();
    if (name !== undefined && name !== null) {
        if (typeof name !== 'string') {
            return res.status(400).json({ error: 'Name must be a string' });
        }
        if (promotion.startTime < now) {
            return res.status(400).json({ error: 'Cannot update name after start time' });
        }
        changes.name = name;
    }
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            return res.status(400).json({ error: 'Description must be a string' });
        }
        if (promotion.startTime < now) {
            return res.status(400).json({ error: 'Cannot update description after start time' });
        }
        changes.description = description;
    }
    if (type !== undefined && type !== null) {
        if (type !== 'automatic' && type !== 'one-time') {
            return res.status(400).json({ error: 'Type must be "automatic" or "one-time"' });
        }
        if (type === 'one-time') { type = 'onetime'; }
        if (promotion.startTime < now) {
            return res.status(400).json({ error: 'Cannot update type after start time' });
        }
        changes.type = type.toUpperCase();
    }
    if (startTime !== undefined && startTime !== null) {
        if (typeof startTime !== 'string') {
            return res.status(400).json({ error: 'Start time must be a string' });
        }
        const newStart = new Date(startTime);
        if (isNaN(newStart.getTime())) {
            return res.status(400).json({ error: 'Start time must be in ISO 8601 format' });
        }
        if (newStart < now) {
            return res.status(400).json({ error: 'Start time cannot be in the past' });
        }
        if (promotion.startTime < now) {
            return res.status(400).json({ error: 'Cannot update start time after original start time' });
        }
        changes.startTime = newStart;
    }
    if (endTime !== undefined && endTime !== null) {
        if (typeof endTime !== 'string') {
            return res.status(400).json({ error: 'End time must be a string' });
        }
        const newEnd = new Date(endTime);
        if (isNaN(newEnd.getTime())) {
            return res.status(400).json({ error: 'End time must be in ISO 8601 format' });
        }
        if (newEnd < now) {
            return res.status(400).json({ error: 'End time cannot be in the past' });
        }
        if (promotion.endTime < now) {
            return res.status(400).json({ error: 'Cannot update end time after original end time' });
        }
        changes.endTime = newEnd;
    }
    if (minSpending !== undefined && minSpending !== null) {
        if (typeof minSpending !== 'number' || minSpending <= 0) {
            return res.status(400).json({ error: 'Min spending must be a positive number' });
        }
        if (promotion.startTime < now) {
            return res.status(400).json({ error: 'Cannot update minSpending after start time' });
        }
        changes.minSpending = minSpending;
    }
    if (rate !== undefined && rate !== null) {
        if (typeof rate !== 'number' || rate <= 0) {
            return res.status(400).json({ error: 'Rate must be a positive number' });
        }
        if (promotion.startTime < now) {
            return res.status(400).json({ error: 'Cannot update rate after start time' });
        }
        changes.rate = rate;
    }
    if (points !== undefined && points !== null) {
        if (typeof points !== 'number' || points <= 0 || !Number.isInteger(points)) {
            return res.status(400).json({ error: 'Points must be a positive integer' });
        }
        if (promotion.startTime < now) {
            return res.status(400).json({ error: 'Cannot update points after start time' });
        }
        changes.points = points;
    }
    if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: 'No changes provided' });
    }
    const updatedPromotion = await prisma.promotion.update({
        where: { id: promotionId },
        data: changes
    });
    const response = { id: updatedPromotion.id, name: updatedPromotion.name, type: updatedPromotion.type.toLowerCase() };
    if ('description' in changes) response.description = changes.description;
    if ('startTime' in changes) response.startTime = changes.startTime.toISOString();
    if ('endTime' in changes) response.endTime = changes.endTime.toISOString();
    if ('minSpending' in changes) response.minSpending = changes.minSpending;
    if ('rate' in changes) response.rate = changes.rate;
    if ('points' in changes) response.points = changes.points;
    return res.status(200).json(response);
});

router.delete('/:promotionId', jwtAuth, async (req, res) => {
    if (req.clearance < 1) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.clearance < 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const promotionId = parseInt(req.params.promotionId);
    if (isNaN(promotionId)) {
        return res.status(400).json({ error: 'Invalid promotion ID' });
    }
    const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
    }
    if (promotion.startTime < new Date()) {
        return res.status(403).json({ error: 'Cannot delete started promotion' });
    }
    await prisma.promotion.delete({ where: { id: promotionId } });
    return res.status(204).send();
});

module.exports = router;