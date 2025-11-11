import { Request, Response, NextFunction } from "express";
import { checkIpBannedModel } from "../domain/models/ipBlacklist.model";

/**
 * Get client IP address from request
 */
const getClientIp = (req: Request): string => {
    // Try various headers that might contain the real IP
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
    
    let ip = '';
    
    if (forwarded) {
        // x-forwarded-for can be a comma-separated list, take the first one
        ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
    } else if (realIp) {
        ip = Array.isArray(realIp) ? realIp[0] : realIp.toString();
    } else if (cfConnectingIp) {
        ip = Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp.toString();
    } else {
        ip = req.ip || req.socket.remoteAddress || req.connection.remoteAddress || '';
    }
    
    // Clean IPv6 localhost notation
    return ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
};

/**
 * Check if IP is localhost
 * Note: Set ALLOW_LOCALHOST_BAN=true in env to test IP banning on localhost
 */
const isLocalhost = (ip: string): boolean => {
    // Allow banning localhost if environment variable is set
    if (process.env.ALLOW_LOCALHOST_BAN === 'true') {
        return false;
    }
    
    return ip === '127.0.0.1' || 
           ip === 'localhost' || 
           ip === '::1' || 
           ip.startsWith('192.168.') || 
           ip.startsWith('10.') ||
           ip.startsWith('172.16.') ||
           ip === '';
};

/**
 * Middleware to check if the requesting IP is banned
 * This should be applied to all routes that need IP ban protection
 */
export const checkIpBanned = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Skip IP check for certain routes
        const skipRoutes = ['/check-ip-banned', '/api-docs', '/health'];
        if (skipRoutes.some(route => req.path.includes(route))) {
            return next();
        }

        // Get client IP address
        const clientIp = getClientIp(req);
        
        console.log('Checking IP ban for:', clientIp, 'Path:', req.path);

        // Skip check for localhost in development
        if (isLocalhost(clientIp)) {
            console.log('Skipping localhost IP:', clientIp);
            return next();
        }

        // Check if IP is banned
        const banStatus = await checkIpBannedModel(clientIp);

        if (banStatus.isBanned) {
            console.log('IP is banned:', clientIp);
            return res.status(403).json({
                status: 0,
                message: 'Access denied. Your IP address has been banned.',
                error: 'IP_BANNED',
                reason: banStatus.reason || 'Violation of terms of service',
                banned_at: banStatus.banned_at
            });
        }

        // IP is not banned, continue
        next();
    } catch (error) {
        console.error('Error in IP ban check middleware:', error);
        // Don't block request if there's an error checking ban status
        next();
    }
};

/**
 * Middleware specifically for frontend routes
 * More lenient error handling to avoid disrupting user experience
 */
export const checkIpBannedFrontend = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Skip IP check for certain routes
        const skipRoutes = ['/check-ip-banned', '/api-docs', '/health'];
        if (skipRoutes.some(route => req.path.includes(route))) {
            return next();
        }

        const clientIp = getClientIp(req);

        // Skip localhost
        if (isLocalhost(clientIp)) {
            return next();
        }

        const banStatus = await checkIpBannedModel(clientIp);

        if (banStatus.isBanned) {
            return res.status(403).json({
                status: 0,
                message: 'Your access has been restricted.',
                error: 'IP_BANNED',
                reason: banStatus.reason
            });
        }

        next();
    } catch (error) {
        console.error('Error in frontend IP ban check:', error);
        next();
    }
};
