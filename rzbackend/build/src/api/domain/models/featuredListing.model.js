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
exports.featuredListingDetails = exports.FeaturedListingList = exports.storeFetauredListingModel = exports.importFeaturedListingDataModel = void 0;
const logger_1 = require("../../lib/logger");
const featuredListing_schema_1 = __importDefault(require("../schema/featuredListing.schema"));
const listing_schema_1 = __importDefault(require("../schema/listing.schema"));
const category_schema_1 = __importDefault(require("../schema/category.schema"));
const city_schema_1 = __importDefault(require("../schema/city.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const getIdsFromNames = (Model, names) => __awaiter(void 0, void 0, void 0, function* () {
    const nameArray = names.split(",").map((name) => name.trim());
    const records = yield Model.find({ name: { $in: nameArray } });
    return records.map((record) => record._id.toString());
});
const getSingleIdFromName = (schema, name) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schema.findOne({ name: name.trim() });
    return result ? result._id.toString() : null;
});
const importFeaturedListingDataModel = (listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield Promise.all(listingData.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const listing = yield listing_schema_1.default.findOne({ name: item.listing_name });
            const categoryNames = item.category_name.split(",").map((name) => name.trim());
            const categories = yield category_schema_1.default.find({ name: { $in: categoryNames } });
            const categoryIds = categories.map((cat) => cat.unique_id);
            const cityNames = item.city_name.split(",").map((name) => name.trim());
            const cities = yield city_schema_1.default.find({ name: { $in: cityNames } });
            const cityIds = cities.map((city) => city.unique_id);
            if (listing && categoryIds && cityIds) {
                const existingListing = yield featuredListing_schema_1.default.findOne({
                    listing_id: listing === null || listing === void 0 ? void 0 : listing.listing_unique_id
                });
                if (existingListing) {
                    yield featuredListing_schema_1.default.deleteOne({ _id: existingListing._id });
                }
                const newFeaturedListing = new featuredListing_schema_1.default({
                    listing_id: listing === null || listing === void 0 ? void 0 : listing.listing_unique_id,
                    category_ids: categoryIds,
                    city_id: cityIds,
                    position: item.position || 0,
                    is_all_category_selected: categoryIds.length > 0 ? false : true,
                    is_all_city_selected: cityIds.length > 0 ? false : true
                });
                yield newFeaturedListing.save();
            }
        })));
        return callback(null, results);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.importFeaturedListingDataModel = importFeaturedListingDataModel;
const storeFetauredListingModel = (featuredListingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_ids, city_ids, listing_id, is_all_city_selected, is_all_category_selected, position } = featuredListingData;
        yield featuredListing_schema_1.default.deleteOne({ listing_id });
        // Validate listing_id
        if (!listing_id) {
            return callback(new Error("Listing ID is required"), null);
        }
        // Check if listing already exists
        const existingListing = yield featuredListing_schema_1.default.findOne({ listing_id }).lean();
        if (existingListing) {
            return callback(new Error("Listing already exists in featured section"), null);
        }
        let cityObjectIds = [];
        cityObjectIds = (city_ids === null || city_ids === void 0 ? void 0 : city_ids.map((id) => Number(id))) || [];
        // Create and save new Featured Listing
        const newFeaturedListing = new featuredListing_schema_1.default({
            category_ids: category_ids,
            city_id: cityObjectIds,
            listing_id,
            is_all_city_selected,
            is_all_category_selected,
            position
        });
        const savedListing = yield newFeaturedListing.save();
        (0, logger_1.loggerMsg)("✅ Featured listing stored successfully.");
        return callback(null, savedListing);
    }
    catch (error) {
        console.error("❌ Error storing featured listing:", error);
        return callback(new Error("Error storing featured listing"), null);
    }
});
exports.storeFetauredListingModel = storeFetauredListingModel;
const FeaturedListingList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const skip = (page - 1) * limit;
        const searchQuery = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category_ids",
                    foreignField: "unique_id",
                    as: "category_ids"
                }
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
                        { "listing_id.name": { $regex: search || "", $options: "i" } },
                        { "category_ids.name": { $regex: search || "", $options: "i" } },
                        { "city_id.name": { $regex: search || "", $options: "i" } }
                    ]
                }
            },
            {
                $project: {
                    "category_ids.name": 1,
                    "listing_id.name": 1,
                    "city_id.name": 1,
                    is_all_city_selected: 1,
                    is_all_category_selected: 1,
                    position: 1
                }
            },
            {
                $unwind: {
                    path: "$listing_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    data: [{ $skip: skip }, { $limit: limit }, { $sort: { position: -1 } }]
                }
            }
        ];
        const result = yield featuredListing_schema_1.default.aggregate(searchQuery).exec();
        return {
            data: ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.data) || [],
            totalUsers: ((_c = (_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
            totalPages: Math.ceil(((_e = (_d = result[0]) === null || _d === void 0 ? void 0 : _d.totalCount[0]) === null || _e === void 0 ? void 0 : _e.count) / limit) || 0,
            currentPage: page
        };
    }
    catch (error) {
        console.error(error);
    }
});
exports.FeaturedListingList = FeaturedListingList;
const featuredListingDetails = (listing_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const featured_listing = yield featuredListing_schema_1.default.aggregate([
            { $match: { _id: new mongoose_1.default.Types.ObjectId(listing_id) } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_ids",
                    foreignField: "unique_id",
                    as: "category_ids"
                }
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
                    "category_ids.unique_id": 1,
                    "category_ids.name": 1,
                    "category_ids._id": 1,
                    "listing_id.listing_unique_id": 1,
                    "listing_id.name": 1,
                    "listing_id._id": 1,
                    "city_id._id": 1,
                    "city_id.name": 1,
                    "city_id.unique_id": 1,
                    is_all_city_selected: 1,
                    is_all_category_selected: 1,
                    position: 1
                }
            },
            {
                $unwind: {
                    path: "$listing_id",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).exec();
        return callback(null, { featured_listing: featured_listing[0] });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.featuredListingDetails = featuredListingDetails;
//# sourceMappingURL=featuredListing.model.js.map