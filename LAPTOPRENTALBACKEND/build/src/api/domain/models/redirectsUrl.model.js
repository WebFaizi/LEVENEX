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
exports.redirectDetail = exports.getRediretsUrlListModel = exports.storeRedircetsUrlModel = void 0;
const redircetsUrl_schema_1 = __importDefault(require("../schema/redircetsUrl.schema"));
const storeRedircetsUrlModel = (storeRedircetsUrlData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if redirect_id exists
        if (storeRedircetsUrlData.redirect_id) {
            yield redircetsUrl_schema_1.default.deleteOne({ _id: storeRedircetsUrlData.redirect_id });
        }
        // Create and save new record
        const newUrl = new redircetsUrl_schema_1.default(Object.assign({}, storeRedircetsUrlData));
        yield newUrl.save();
        return callback(null, newUrl);
    }
    catch (error) {
        return callback(new Error('Error storing redirect URL'), null);
    }
});
exports.storeRedircetsUrlModel = storeRedircetsUrlModel;
const getRediretsUrlListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { from_url: { $regex: search, $options: 'i' } },
                    { to_url: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield redircetsUrl_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalCountry = yield redircetsUrl_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.getRediretsUrlListModel = getRediretsUrlListModel;
const redirectDetail = (redirect_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Redirect = yield redircetsUrl_schema_1.default.findOne({ _id: redirect_id });
        return callback(null, { Redirect });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.redirectDetail = redirectDetail;
//# sourceMappingURL=redirectsUrl.model.js.map