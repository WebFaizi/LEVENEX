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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIpBlacklistStatsModel = exports.checkIpBannedModel = exports.deleteIpBlacklistModel = exports.updateIpBlacklistModel = exports.addIpBlacklistModel = exports.getIpBlacklistModel = void 0;
const ipBlacklist_schema_1 = __importDefault(require("../schema/ipBlacklist.schema"));
// Get IP Blacklist with pagination and search
const getIpBlacklistModel = (search, page, limit, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skip = (page - 1) * limit;
        const query = {};
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
        const ipBlacklists = yield ipBlacklist_schema_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
        const totalRecords = yield ipBlacklist_schema_1.default.countDocuments(query);
        return {
            data: ipBlacklists,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        };
    }
    catch (error) {
        console.error("Error fetching IP blacklist:", error);
        throw new Error("Error fetching IP blacklist from the database.");
    }
});
exports.getIpBlacklistModel = getIpBlacklistModel;
// Add IP to blacklist
const addIpBlacklistModel = (ipData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if IP already exists
        const existingIp = yield ipBlacklist_schema_1.default.findOne({ ip_address: ipData.ip_address });
        if (existingIp) {
            return callback(new Error("IP address already exists in the blacklist."), null);
        }
        const newIpBlacklist = new ipBlacklist_schema_1.default(Object.assign(Object.assign({}, ipData), { banned_at: ipData.status === 'banned' ? new Date() : undefined }));
        yield newIpBlacklist.save();
        return callback(null, newIpBlacklist);
    }
    catch (error) {
        console.error("Error adding IP to blacklist:", error);
        return callback(error, null);
    }
});
exports.addIpBlacklistModel = addIpBlacklistModel;
// Update IP blacklist status
const updateIpBlacklistModel = (updateData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ip_blacklist_id, status, reason, banned_by } = updateData;
        const ipBlacklist = yield ipBlacklist_schema_1.default.findById(ip_blacklist_id);
        if (!ipBlacklist) {
            return callback(new Error("IP blacklist entry not found."), null);
        }
        // Update fields
        if (status) {
            ipBlacklist.status = status;
            if (status === 'banned') {
                ipBlacklist.banned_at = new Date();
                if (banned_by)
                    ipBlacklist.banned_by = banned_by;
            }
            else if (status === 'allowed') {
                ipBlacklist.banned_at = undefined;
                ipBlacklist.banned_by = undefined;
            }
        }
        if (reason !== undefined) {
            ipBlacklist.reason = reason;
        }
        yield ipBlacklist.save();
        return callback(null, ipBlacklist);
    }
    catch (error) {
        console.error("Error updating IP blacklist:", error);
        return callback(error, null);
    }
});
exports.updateIpBlacklistModel = updateIpBlacklistModel;
// Delete IP blacklist entries
const deleteIpBlacklistModel = (ipBlacklistIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield ipBlacklist_schema_1.default.deleteMany({
            _id: { $in: ipBlacklistIds }
        });
        if (result.deletedCount === 0) {
            throw new Error("No IP blacklist entries found with the provided IDs.");
        }
        return result.deletedCount;
    }
    catch (error) {
        console.error("Error deleting IP blacklist entries:", error);
        throw new Error("Error deleting IP blacklist entries from the database.");
    }
});
exports.deleteIpBlacklistModel = deleteIpBlacklistModel;
// Check if IP is banned
const checkIpBannedModel = (ipAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ipBlacklist = yield ipBlacklist_schema_1.default.findOne({
            ip_address: ipAddress,
            status: 'banned'
        }).lean();
        return {
            isBanned: !!ipBlacklist,
            reason: (ipBlacklist === null || ipBlacklist === void 0 ? void 0 : ipBlacklist.reason) || '',
            banned_at: (ipBlacklist === null || ipBlacklist === void 0 ? void 0 : ipBlacklist.banned_at) || null
        };
    }
    catch (error) {
        console.error("Error checking IP ban status:", error);
        throw new Error("Error checking IP ban status.");
    }
});
exports.checkIpBannedModel = checkIpBannedModel;
// Get IP blacklist statistics
const getIpBlacklistStatsModel = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalIps = yield ipBlacklist_schema_1.default.countDocuments();
        const bannedIps = yield ipBlacklist_schema_1.default.countDocuments({ status: 'banned' });
        const allowedIps = yield ipBlacklist_schema_1.default.countDocuments({ status: 'allowed' });
        return {
            totalIps,
            bannedIps,
            allowedIps
        };
    }
    catch (error) {
        console.error("Error fetching IP blacklist stats:", error);
        throw new Error("Error fetching IP blacklist statistics.");
    }
});
exports.getIpBlacklistStatsModel = getIpBlacklistStatsModel;
//# sourceMappingURL=ipBlacklist.model.js.map