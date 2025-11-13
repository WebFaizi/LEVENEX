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
exports.getIpBlacklistStats = exports.checkIpBanned = exports.deleteIpBlacklist = exports.updateIpBlacklist = exports.addIpBlacklist = exports.getIpBlacklist = void 0;
const ipBlacklist_model_1 = require("../../domain/models/ipBlacklist.model");
const apiResponse_1 = require("../../helper/apiResponse");
// Get IP Blacklist
const getIpBlacklist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10, status } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const ipBlacklists = yield (0, ipBlacklist_model_1.getIpBlacklistModel)(search, pageNum, limitNum, status);
        return (0, apiResponse_1.successResponse)(res, "IP blacklist retrieved successfully.", ipBlacklists);
    }
    catch (error) {
        console.error("Error fetching IP blacklist:", error);
        return (0, apiResponse_1.ErrorResponse)(res, error.message || "An error occurred while fetching IP blacklist.");
    }
});
exports.getIpBlacklist = getIpBlacklist;
// Add IP to Blacklist
const addIpBlacklist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, ipBlacklist_model_1.addIpBlacklistModel)(req.body, (error, result) => {
            if (error) {
                console.error("Error adding IP to blacklist:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message || "An error occurred while adding IP to blacklist.");
            }
            return (0, apiResponse_1.successResponse)(res, "IP added to blacklist successfully.", result);
        });
    }
    catch (error) {
        console.error("Error adding IP to blacklist:", error);
        return (0, apiResponse_1.ErrorResponse)(res, error.message || "An error occurred while adding IP to blacklist.");
    }
});
exports.addIpBlacklist = addIpBlacklist;
// Update IP Blacklist
const updateIpBlacklist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, ipBlacklist_model_1.updateIpBlacklistModel)(req.body, (error, result) => {
            if (error) {
                console.error("Error updating IP blacklist:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message || "An error occurred while updating IP blacklist.");
            }
            return (0, apiResponse_1.successResponse)(res, "IP blacklist updated successfully.", result);
        });
    }
    catch (error) {
        console.error("Error updating IP blacklist:", error);
        return (0, apiResponse_1.ErrorResponse)(res, error.message || "An error occurred while updating IP blacklist.");
    }
});
exports.updateIpBlacklist = updateIpBlacklist;
// Delete IP Blacklist
const deleteIpBlacklist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ip_blacklist_ids } = req.body;
        if (!ip_blacklist_ids || !Array.isArray(ip_blacklist_ids) || ip_blacklist_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid IP blacklist ID.");
        }
        const deletedCount = yield (0, ipBlacklist_model_1.deleteIpBlacklistModel)(ip_blacklist_ids);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted ${deletedCount} IP blacklist entry(ies).`, { deletedCount });
    }
    catch (error) {
        console.error("Error deleting IP blacklist:", error);
        return (0, apiResponse_1.ErrorResponse)(res, error.message || "An error occurred while deleting IP blacklist entries.");
    }
});
exports.deleteIpBlacklist = deleteIpBlacklist;
// Check if IP is Banned
const checkIpBanned = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ip_address } = req.query;
        if (!ip_address) {
            return (0, apiResponse_1.ErrorResponse)(res, "IP address is required.");
        }
        const result = yield (0, ipBlacklist_model_1.checkIpBannedModel)(ip_address);
        return (0, apiResponse_1.successResponse)(res, "IP ban status checked successfully.", result);
    }
    catch (error) {
        console.error("Error checking IP ban status:", error);
        return (0, apiResponse_1.ErrorResponse)(res, error.message || "An error occurred while checking IP ban status.");
    }
});
exports.checkIpBanned = checkIpBanned;
// Get IP Blacklist Statistics
const getIpBlacklistStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield (0, ipBlacklist_model_1.getIpBlacklistStatsModel)();
        return (0, apiResponse_1.successResponse)(res, "IP blacklist statistics retrieved successfully.", stats);
    }
    catch (error) {
        console.error("Error fetching IP blacklist statistics:", error);
        return (0, apiResponse_1.ErrorResponse)(res, error.message || "An error occurred while fetching IP blacklist statistics.");
    }
});
exports.getIpBlacklistStats = getIpBlacklistStats;
//# sourceMappingURL=ipBlacklist.controller.js.map