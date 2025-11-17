import { Request, Response } from 'express';
import { 
    getIpBlacklistModel,
    addIpBlacklistModel,
    updateIpBlacklistModel,
    deleteIpBlacklistModel,
    checkIpBannedModel,
    getIpBlacklistStatsModel
} from '../../domain/models/ipBlacklist.model';
import { successResponse, ErrorResponse } from '../../helper/apiResponse';

// Get IP Blacklist
export const getIpBlacklist = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10, status } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const ipBlacklists = await getIpBlacklistModel(
            search as string,
            pageNum,
            limitNum,
            status as string
        );

        return successResponse(res, "IP blacklist retrieved successfully.", ipBlacklists);
    } catch (error: any) {
        console.error("Error fetching IP blacklist:", error);
        return ErrorResponse(res, error.message || "An error occurred while fetching IP blacklist.");
    }
};

// Add IP to Blacklist
export const addIpBlacklist = async (req: Request, res: Response) => {
    try {
        await addIpBlacklistModel(req.body, (error: any, result: any) => {
            if (error) {
                console.error("Error adding IP to blacklist:", error);
                return ErrorResponse(res, error.message || "An error occurred while adding IP to blacklist.");
            }
            return successResponse(res, "IP added to blacklist successfully.", result);
        });
    } catch (error: any) {
        console.error("Error adding IP to blacklist:", error);
        return ErrorResponse(res, error.message || "An error occurred while adding IP to blacklist.");
    }
};

// Update IP Blacklist
export const updateIpBlacklist = async (req: Request, res: Response) => {
    try {
        await updateIpBlacklistModel(req.body, (error: any, result: any) => {
            if (error) {
                console.error("Error updating IP blacklist:", error);
                return ErrorResponse(res, error.message || "An error occurred while updating IP blacklist.");
            }
            return successResponse(res, "IP blacklist updated successfully.", result);
        });
    } catch (error: any) {
        console.error("Error updating IP blacklist:", error);
        return ErrorResponse(res, error.message || "An error occurred while updating IP blacklist.");
    }
};

// Delete IP Blacklist
export const deleteIpBlacklist = async (req: Request, res: Response) => {
    try {
        const { ip_blacklist_ids } = req.body;

        if (!ip_blacklist_ids || !Array.isArray(ip_blacklist_ids) || ip_blacklist_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid IP blacklist ID.");
        }

        const deletedCount = await deleteIpBlacklistModel(ip_blacklist_ids);

        return successResponse(
            res,
            `Successfully deleted ${deletedCount} IP blacklist entry(ies).`,
            { deletedCount }
        );
    } catch (error: any) {
        console.error("Error deleting IP blacklist:", error);
        return ErrorResponse(res, error.message || "An error occurred while deleting IP blacklist entries.");
    }
};

// Check if IP is Banned
export const checkIpBanned = async (req: Request, res: Response) => {
    try {
        const { ip_address } = req.query;

        if (!ip_address) {
            return ErrorResponse(res, "IP address is required.");
        }

        const result = await checkIpBannedModel(ip_address as string);

        return successResponse(res, "IP ban status checked successfully.", result);
    } catch (error: any) {
        console.error("Error checking IP ban status:", error);
        return ErrorResponse(res, error.message || "An error occurred while checking IP ban status.");
    }
};

// Get IP Blacklist Statistics
export const getIpBlacklistStats = async (req: Request, res: Response) => {
    try {
        const stats = await getIpBlacklistStatsModel();

        return successResponse(res, "IP blacklist statistics retrieved successfully.", stats);
    } catch (error: any) {
        console.error("Error fetching IP blacklist statistics:", error);
        return ErrorResponse(res, error.message || "An error occurred while fetching IP blacklist statistics.");
    }
};
