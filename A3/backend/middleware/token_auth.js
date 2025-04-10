const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
SECRET_KEY = 'secretkey';

const CLEARANCE_LEVELS = {
  ANY: 0,
  REGULAR: 1,
  CASHIER: 2,
  MANAGER: 3,
  SUPERUSER: 4
};

function mapRoleToClearance(role) {
  // role is typically stored as "REGULAR", "CASHIER", "MANAGER", or "SUPERUSER".
  // Adjust if your DB column is spelled differently or in lowercase, etc.
  role = role.toUpperCase();
  switch (role) {
    case 'REGULAR':
      return CLEARANCE_LEVELS.REGULAR;
    case 'CASHIER':
      return CLEARANCE_LEVELS.CASHIER;
    case 'MANAGER':
      return CLEARANCE_LEVELS.MANAGER;
    case 'SUPERUSER':
      return CLEARANCE_LEVELS.SUPERUSER;
    default:
      // fallback if the role is unknown
      return CLEARANCE_LEVELS.ANY;
  }
}

const jwtAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token => treat as ANY
      req.user = null;
      req.clearance = CLEARANCE_LEVELS.ANY;
      return next();
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, async (err, data) => {
        if (err) {
            req.user = null;
            req.clearance = CLEARANCE_LEVELS.ANY;
            return next();
        }
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: data.id
                }
            });
            if (!user) {
                req.user = null;
                req.clearance = CLEARANCE_LEVELS.ANY;
                return next();
            }
            req.user = user;
            req.clearance = mapRoleToClearance(user.role);
            return next();
        } catch (error) {
            req.user = null;
            req.clearance = CLEARANCE_LEVELS.ANY;
            return next();
        }
    });
};

module.exports = {
    jwtAuth,
    CLEARANCE_LEVELS
}
