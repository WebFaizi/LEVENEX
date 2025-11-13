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
exports.deleteIpAddress = exports.listIpAddress = exports.deleteAllIp = exports.storeIpAddress = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const ipAddress_schema_1 = __importDefault(require("../../domain/schema/ipAddress.schema"));
const ipAddress_model_1 = require("../../domain/models/ipAddress.model");
const storeIpAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, ipAddress_model_1.StoreIpAddressModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Ip Address Stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeIpAddress = storeIpAddress;
const deleteAllIp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield ipAddress_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No IpAddress found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all IpAddress.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all IpAddress.");
    }
});
exports.deleteAllIp = deleteAllIp;
const listIpAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, ipAddress_model_1.listIpAddressModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.listIpAddress = listIpAddress;
const deleteIpAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, ip_address_id } = req.body;
        if (type == 1) {
            if (!ip_address_id || !Array.isArray(ip_address_id) || ip_address_id.length === 0) {
                return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Ip Address ID.");
            }
            const result = yield ipAddress_schema_1.default.deleteMany({ _id: { $in: ip_address_id } });
            if (result.deletedCount === 0) {
                return (0, apiResponse_1.ErrorResponse)(res, "No Ip Address found with the provided IDs.");
            }
            return (0, apiResponse_1.successResponse)(res, `${result.deletedCount} Ip Address(es) deleted successfully.`, []);
        }
        else {
            const result = yield ipAddress_schema_1.default.deleteMany({});
            if (result.deletedCount === 0) {
                return (0, apiResponse_1.ErrorResponse)(res, "No Ip Address records found to delete.");
            }
            return (0, apiResponse_1.successResponse)(res, `All ${result.deletedCount} IP Addresses deleted successfully.`, []);
        }
    }
    catch (error) {
        console.error("Error deleting IP Address:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting IP addresses.");
    }
});
exports.deleteIpAddress = deleteIpAddress;
//# sourceMappingURL=ipAddress.controller.js.map