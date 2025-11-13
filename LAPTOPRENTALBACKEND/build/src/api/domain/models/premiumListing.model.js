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
exports.updatePremiumListingModel = exports.premiumListingDetail = exports.premiumListingList = exports.storePremiumListingModel = exports.importPremiumListingDataModel = void 0;
const premiumListing_schema_1 = __importDefault(require("../schema/premiumListing.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const importPremiumListingDataModel = (listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!Array.isArray(listingData) || listingData.length === 0) {
            return callback(new Error("No data to import"), null);
        }
        // Step 2: Prepare documents to insert
        const documentsToInsert = [];
        for (const item of listingData) {
            const startDate = item.start_date && item.start_date !== "null"
                ? new Date(item.start_date)
                : null;
            const endDate = item.end_date && item.end_date !== "null"
                ? new Date(item.end_date)
                : null;
            if ((startDate && isNaN(startDate.getTime())) ||
                (endDate && isNaN(endDate.getTime()))) {
                console.warn(`Invalid dates for listing: ${item.listing_name}`);
                continue;
            }
            documentsToInsert.push({
                listing_id: item.listing_unique_id.trim(),
                premium_type: item.premium_type,
                start_date: startDate,
                end_date: endDate,
                status: true
            });
        }
        // Step 3: Insert all valid documents
        if (documentsToInsert.length > 0) {
            const result = yield premiumListing_schema_1.default.insertMany(documentsToInsert);
            return callback(null, result);
        }
        else {
            return callback(new Error("No valid records to insert"), null);
        }
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.importPremiumListingDataModel = importPremiumListingDataModel;
const storePremiumListingModel = (premiumListingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const premiumListing = new premiumListing_schema_1.default({
            listing_id: premiumListingData.listing_id,
            premium_type: premiumListingData.premium_type,
            city_id: ((_a = premiumListingData === null || premiumListingData === void 0 ? void 0 : premiumListingData.city_ids) === null || _a === void 0 ? void 0 : _a.map((id) => parseInt(id))) || [],
            start_date: premiumListingData.start_date,
            end_date: premiumListingData.end_date
        });
        const savedPremiumListing = yield premiumListing.save();
        return callback(null, { savedPremiumListing });
    }
    catch (error) {
        console.error("Error storing premium listing:", error);
        return callback(error, null);
    }
});
exports.storePremiumListingModel = storePremiumListingModel;
const premiumListingList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    try {
        const skip = (page - 1) * limit;
        const users = yield premiumListing_schema_1.default.aggregate([
            {
                $lookup: {
                    from: "listings",
                    localField: "listing_id",
                    foreignField: "listing_unique_id",
                    as: "listing_id"
                }
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city_id"
                }
            },
            {
                $match: {
                    $or: [
                        { premium_type: { $regex: search || "", $options: "i" } },
                        { "listing_id.name": { $regex: search || "", $options: "i" } }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$listing_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "listing_id._id": 1,
                    "listing_id.name": 1,
                    "city_id.unique_id": 1,
                    "city_id.name": 1,
                    premium_type: 1,
                    start_date: 1,
                    end_date: 1
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            }
        ]);
        return {
            data: (_b = users[0]) === null || _b === void 0 ? void 0 : _b.data,
            totalUsers: ((_d = (_c = users[0]) === null || _c === void 0 ? void 0 : _c.totalCount[0]) === null || _d === void 0 ? void 0 : _d.count) || 0,
            totalPages: Math.ceil(((_f = (_e = users[0]) === null || _e === void 0 ? void 0 : _e.totalCount[0]) === null || _f === void 0 ? void 0 : _f.count) / limit) || 0,
            currentPage: page
        };
    }
    catch (error) { }
});
exports.premiumListingList = premiumListingList;
const premiumListingDetail = (listing_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [Listing_details] = yield premiumListing_schema_1.default.aggregate([
            {
                $match: { _id: new mongoose_1.default.Types.ObjectId(listing_id) }
            },
            {
                $lookup: {
                    from: "listings",
                    localField: "listing_id",
                    foreignField: "listing_unique_id",
                    as: "listing_id"
                }
            },
            {
                $unwind: "$listing_id"
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city_id"
                }
            },
            {
                $project: {
                    _id: 1,
                    listing_id: 1,
                    "categories.name": 1,
                    "city_id.name": 1,
                    "city_id.unique_id": 1,
                    premium_type: 1,
                    start_date: 1,
                    end_date: 1
                }
            }
        ]);
        return callback(null, { Listing_details });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.premiumListingDetail = premiumListingDetail;
const updatePremiumListingModel = (premiumListingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const updatedPremiumListing = yield premiumListing_schema_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(premiumListingData.premium_listing_id) }, {
            premium_type: premiumListingData.premium_type,
            city_id: ((_g = premiumListingData === null || premiumListingData === void 0 ? void 0 : premiumListingData.city_ids) === null || _g === void 0 ? void 0 : _g.map((id) => parseInt(id))) || [],
            start_date: premiumListingData.start_date,
            end_date: premiumListingData.end_date
        }, { new: true, runValidators: true });
        if (!updatedPremiumListing) {
            throw new Error("Premium listing not found");
        }
        return callback(null, { updatedPremiumListing });
    }
    catch (error) {
        console.error("Error storing premium listing:", error);
        return callback(error, null);
    }
});
exports.updatePremiumListingModel = updatePremiumListingModel;
//# sourceMappingURL=premiumListing.model.js.map