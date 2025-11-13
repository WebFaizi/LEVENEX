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
exports.listIpAddressModel = exports.StoreIpAddressModel = void 0;
const ipAddress_schema_1 = __importDefault(require("../schema/ipAddress.schema"));
const StoreIpAddressModel = (ipAddressData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ipAddress = new ipAddress_schema_1.default({
            ip_holder_name: ipAddressData.ip_holder_name,
            ip_address: ipAddressData.ip_address,
            device_type: ipAddressData.device_type
        });
        const savedIpAddress = yield ipAddress.save();
        return callback(null, { savedIpAddress });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.StoreIpAddressModel = StoreIpAddressModel;
const listIpAddressModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                    { subdomain_slug: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const lists = yield ipAddress_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalLists = yield ipAddress_schema_1.default.countDocuments(searchQuery);
        return {
            data: lists,
            totalLists,
            totalPages: Math.ceil(totalLists / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.listIpAddressModel = listIpAddressModel;
//# sourceMappingURL=ipAddress.model.js.map