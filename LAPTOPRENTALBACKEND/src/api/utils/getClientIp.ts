import { Request } from 'express';

/**
 * Extracts the real client IP address from the request
 * Handles various proxy configurations and headers
 * @param req - Express Request object
 * @returns Client IP address as string
 */
export function getClientIp(req: Request): string {
    // Check for Cloudflare specific header
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    if (cfConnectingIp) {
        return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
    }

    // Check for X-Real-IP (nginx proxy)
    const xRealIp = req.headers['x-real-ip'];
    if (xRealIp) {
        return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
    }

    // Check X-Forwarded-For (most common proxy header)
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        const ips = Array.isArray(xForwardedFor) 
            ? xForwardedFor[0].split(',')
            : xForwardedFor.split(',');
        
        // First IP in the list is usually the client IP
        return ips[0].trim();
    }

    // Check for X-Client-IP
    const xClientIp = req.headers['x-client-ip'];
    if (xClientIp) {
        return Array.isArray(xClientIp) ? xClientIp[0] : xClientIp;
    }

    // Check for X-Forwarded
    const xForwarded = req.headers['x-forwarded'];
    if (xForwarded) {
        return Array.isArray(xForwarded) ? xForwarded[0] : xForwarded;
    }

    // Check for Forwarded-For
    const forwardedFor = req.headers['forwarded-for'];
    if (forwardedFor) {
        return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    }

    // Check for Forwarded
    const forwarded = req.headers['forwarded'];
    if (forwarded) {
        const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        const match = forwardedValue.match(/for=([^;,\s]+)/);
        if (match) {
            return match[1].replace(/"/g, '');
        }
    }

    // Fallback to connection-level properties
    const socketAddress = req.socket?.remoteAddress;
    if (socketAddress) {
        // Remove IPv6 prefix if present (::ffff:)
        return socketAddress.replace(/^::ffff:/, '');
    }

    // Last resort fallbacks
    const connectionAddress = (req.connection as any)?.remoteAddress;
    if (connectionAddress) {
        return connectionAddress.replace(/^::ffff:/, '');
    }

    const connectionSocketAddress = (req.connection as any)?.socket?.remoteAddress;
    if (connectionSocketAddress) {
        return connectionSocketAddress.replace(/^::ffff:/, '');
    }

    // Express req.ip as final fallback
    if (req.ip) {
        return req.ip.replace(/^::ffff:/, '');
    }

    // If all else fails, return unknown
    return 'UNKNOWN';
}

/**
 * Validates if a string is a valid IP address
 * @param ip - IP address to validate
 * @returns boolean indicating if IP is valid
 */
export function isValidIp(ip: string): boolean {
    if (!ip || ip === 'UNKNOWN') return false;
    
    // IPv4 pattern
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(ip)) {
        const parts = ip.split('.');
        return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
    }
    
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i;
    return ipv6Pattern.test(ip);
}

/**
 * Gets client IP and validates it
 * Returns a sanitized IP or 'UNKNOWN' if invalid
 */
export function getSafeClientIp(req: Request): string {
    const ip = getClientIp(req);
    
    // If localhost or private IP in development, return as is
    if (process.env.NODE_ENV === 'development') {
        return ip;
    }
    
    // Validate IP
    if (!isValidIp(ip)) {
        console.warn(`Invalid or unknown IP detected: ${ip}`);
        return 'UNKNOWN';
    }
    
    return ip;
}
