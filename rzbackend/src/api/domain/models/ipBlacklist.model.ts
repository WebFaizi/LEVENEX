import IpBlacklist from "../schema/ipBlacklist.schema";

interface IpBlacklistData {
    ip_address: string;
    status: 'allowed' | 'banned';
    reason?: string;
    banned_by?: string;
}

interface UpdateIpBlacklistData {
    ip_blacklist_id: string;
    status?: 'allowed' | 'banned';
    reason?: string;
    banned_by?: string;
}

// Get IP Blacklist with pagination and search
export const getIpBlacklistModel = async (
    search: string,
    page: number,
    limit: number,
    status?: string
) => {
    try {
        const skip = (page - 1) * limit;
        const query: any = {};

        // Search filter
        if (search) {
            query.$or = [
                { ip_address: { $regex: search, $options: "i" } },
                { reason: { $regex: search, $options: "i" } },
                { banned_by: { $regex: search, $options: "i" } }
            ];
        }

        // Status filter
        if (status && (status === 'allowed' || status === 'banned')) {
            query.status = status;
        }

        const ipBlacklists = await IpBlacklist.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        const totalRecords = await IpBlacklist.countDocuments(query);

        return {
            data: ipBlacklists,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("Error fetching IP blacklist:", error);
        throw new Error("Error fetching IP blacklist from the database.");
    }
};

// Add IP to blacklist
export const addIpBlacklistModel = async (
    ipData: IpBlacklistData,
    callback: (error: any, result: any) => void
) => {
    try {
        // Check if IP already exists
        const existingIp = await IpBlacklist.findOne({ ip_address: ipData.ip_address });
        
        if (existingIp) {
            return callback(new Error("IP address already exists in the blacklist."), null);
        }

        const newIpBlacklist = new IpBlacklist({
            ...ipData,
            banned_at: ipData.status === 'banned' ? new Date() : undefined
        });

        await newIpBlacklist.save();
        return callback(null, newIpBlacklist);
    } catch (error) {
        console.error("Error adding IP to blacklist:", error);
        return callback(error, null);
    }
};

// Update IP blacklist status
export const updateIpBlacklistModel = async (
    updateData: UpdateIpBlacklistData,
    callback: (error: any, result: any) => void
) => {
    try {
        const { ip_blacklist_id, status, reason, banned_by } = updateData;

        const ipBlacklist = await IpBlacklist.findById(ip_blacklist_id);
        
        if (!ipBlacklist) {
            return callback(new Error("IP blacklist entry not found."), null);
        }

        // Update fields
        if (status) {
            ipBlacklist.status = status;
            if (status === 'banned') {
                ipBlacklist.banned_at = new Date();
                if (banned_by) ipBlacklist.banned_by = banned_by;
            } else if (status === 'allowed') {
                ipBlacklist.banned_at = undefined;
                ipBlacklist.banned_by = undefined;
            }
        }

        if (reason !== undefined) {
            ipBlacklist.reason = reason;
        }

        await ipBlacklist.save();
        return callback(null, ipBlacklist);
    } catch (error) {
        console.error("Error updating IP blacklist:", error);
        return callback(error, null);
    }
};

// Delete IP blacklist entries
export const deleteIpBlacklistModel = async (ipBlacklistIds: string[]) => {
    try {
        const result = await IpBlacklist.deleteMany({ 
            _id: { $in: ipBlacklistIds } 
        });

        if (result.deletedCount === 0) {
            throw new Error("No IP blacklist entries found with the provided IDs.");
        }

        return result.deletedCount;
    } catch (error) {
        console.error("Error deleting IP blacklist entries:", error);
        throw new Error("Error deleting IP blacklist entries from the database.");
    }
};

// Check if IP is banned
export const checkIpBannedModel = async (ipAddress: string) => {
    try {
        const ipBlacklist = await IpBlacklist.findOne({ 
            ip_address: ipAddress,
            status: 'banned'
        }).lean();

        return {
            isBanned: !!ipBlacklist,
            reason: ipBlacklist?.reason || '',
            banned_at: ipBlacklist?.banned_at || null
        };
    } catch (error) {
        console.error("Error checking IP ban status:", error);
        throw new Error("Error checking IP ban status.");
    }
};

// Get IP blacklist statistics
export const getIpBlacklistStatsModel = async () => {
    try {
        const totalIps = await IpBlacklist.countDocuments();
        const bannedIps = await IpBlacklist.countDocuments({ status: 'banned' });
        const allowedIps = await IpBlacklist.countDocuments({ status: 'allowed' });

        return {
            totalIps,
            bannedIps,
            allowedIps
        };
    } catch (error) {
        console.error("Error fetching IP blacklist stats:", error);
        throw new Error("Error fetching IP blacklist statistics.");
    }
};
