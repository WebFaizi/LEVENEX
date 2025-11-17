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
exports.updateKeywordModel = exports.importKeywordsDataModel = exports.getKeywordsModel = void 0;
const keywords_schema_1 = __importDefault(require("../schema/keywords.schema"));
// export const StoreIpAddressModel = async (ipAddressData: ipAddressData, callback: (error: any, result: any) => void) => {
//     try {
//         const ipAddress = new IpAddress({
//             ip_holder_name: ipAddressData.ip_holder_name,
//             ip_address: ipAddressData.ip_address,
//             device_type: ipAddressData.device_type
//         });
//         const savedIpAddress = await ipAddress.save();
//         return callback(null, { savedIpAddress });
//     } catch (error) {
//         console.error("Error storing blog:", error);
//         return callback(error, null);
//     }
// };
const getKeywordsModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } }
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const lists = yield keywords_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalLists = yield keywords_schema_1.default.countDocuments(searchQuery);
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
exports.getKeywordsModel = getKeywordsModel;
const importKeywordsDataModel = (listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract all keyword strings
        const allKeywords = listingData
            .map(item => { var _a; return (_a = item.words) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase(); })
            .filter(word => !!word); // remove undefined/empty
        // Get already existing keywords
        const existingKeywords = yield keywords_schema_1.default.find({
            words: { $in: allKeywords }
        }).distinct("words");
        const existingSet = new Set(existingKeywords.map(k => k.toLowerCase()));
        // Filter out duplicates
        const newKeywords = listingData.filter(item => item.words && !existingSet.has(item.words.trim().toLowerCase()));
        if (newKeywords.length === 0) {
            return callback(null, { message: "All keywords already exist. Nothing to import." });
        }
        // Insert new unique keywords
        yield keywords_schema_1.default.insertMany(newKeywords, { ordered: false });
        return callback(null, {
            message: `${newKeywords.length} keyword(s) inserted successfully.`,
            inserted: newKeywords.length
        });
    }
    catch (error) {
        console.error("❌ Error inserting keywords:", error);
        return callback(error, null);
    }
});
exports.importKeywordsDataModel = importKeywordsDataModel;
const updateKeywordModel = (countryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCountry = yield keywords_schema_1.default.findOne({ _id: countryData.keyword_id });
        if (!existingCountry) {
            return callback(new Error("Country not found."), null);
        }
        existingCountry.words = countryData.words;
        yield existingCountry.save();
        return callback(null, existingCountry);
    }
    catch (error) {
        console.log(error);
        throw new Error('Error fetching users');
    }
});
exports.updateKeywordModel = updateKeywordModel;
//# sourceMappingURL=keywords.model.js.map