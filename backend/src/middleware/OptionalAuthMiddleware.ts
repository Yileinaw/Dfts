import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { AuthenticatedRequest } from './AuthMiddleware'; // Import the extended Request type

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY';

export const OptionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    // Only proceed if header exists and has Bearer format
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; /* ... */ };
            // Verify user existence in DB as well
            const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

            if (user) {
                req.userId = decoded.userId; // Attach userId if token is valid and user exists
            }
        } catch (error: any) { // Add :any type
            // Invalid token? Ignore, treat as guest. Don't send 401.
            console.warn('Optional Auth: Invalid token provided, proceeding as guest.', error.message);
        }
    }
    // Always call next(), whether authenticated or not
    next();
}; 