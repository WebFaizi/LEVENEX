"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIpBannedFrontend = exports.checkIpBanned = void 0;
const ipBlacklist_model_1 = require("../domain/models/ipBlacklist.model");
/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
    // Try various headers that might contain the real IP
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
    let ip = '';
    if (forwarded) {
        // x-forwarded-for can be a comma-separated list, take the first one
        ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
    }
    else if (realIp) {
        ip = Array.isArray(realIp) ? realIp[0] : realIp.toString();
    }
    else if (cfConnectingIp) {
        ip = Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp.toString();
    }
    else {
        ip = req.ip || req.socket.remoteAddress || req.connection.remoteAddress || '';
    }
    // Clean IPv6 localhost notation
    return ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
};
/**
 * Check if IP is localhost
 * Note: Set ALLOW_LOCALHOST_BAN=true in env to test IP banning on localhost
 */
const isLocalhost = (ip) => {
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
const checkIpBanned = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const banStatus = yield (0, ipBlacklist_model_1.checkIpBannedModel)(clientIp);
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
    }
    catch (error) {
        console.error('Error in IP ban check middleware:', error);
        // Don't block request if there's an error checking ban status
        next();
    }
});
exports.checkIpBanned = checkIpBanned;
/**
 * Middleware specifically for frontend routes
 * More lenient error handling to avoid disrupting user experience
 */
const checkIpBannedFrontend = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const banStatus = yield (0, ipBlacklist_model_1.checkIpBannedModel)(clientIp);
        if (banStatus.isBanned) {
            return res.status(403).json({
                status: 0,
                message: 'Your access has been restricted.',
                error: 'IP_BANNED',
                reason: banStatus.reason
            });
        }
        next();
    }
    catch (error) {
        console.error('Error in frontend IP ban check:', error);
        next();
    }
});
exports.checkIpBannedFrontend = checkIpBannedFrontend;
//# sourceMappingURL=ipBan.middleware.js.map