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
exports.storeChatboatListingModel = exports.chatBoatListingCityWise = exports.chatboatListingModel = exports.chatboatListingDetails = exports.chatboatUserListModel = void 0;
const chatboatUser_schema_1 = __importDefault(require("../schema/chatboatUser.schema"));
const listing_schema_1 = __importDefault(require("../schema/listing.schema"));
const chatboat_schema_1 = __importDefault(require("../schema/chatboat.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const chatboatUserListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const skip = (page - 1) * limit;
        const result = yield chatboatUser_schema_1.default.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category_ids",
                    foreignField: "unique_id",
                    as: "category_ids"
                }
            },
            {
                $match: {
                    $or: [
                        { "category_ids.name": { $regex: search || "", $options: "i" } },
                        { phone_number: { $regex: search || "", $options: "i" } },
                        { city_name: { $regex: search || "", $options: "i" } }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    "category_ids.name": 1,
                    city_name: 1,
                    phone_number: 1,
                    createdAt: 1
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
            data: result[0].data,
            totalUsers: ((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalCount[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
            totalPages: Math.ceil(((_d = (_c = result[0]) === null || _c === void 0 ? void 0 : _c.totalCount[0]) === null || _d === void 0 ? void 0 : _d.count) / limit) || 0,
            currentPage: page
        };
    }
    catch (error) {
        console.error(error);
    }
});
exports.chatboatUserListModel = chatboatUserListModel;
const chatboatListingDetails = (chatboat_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch ChatboatListing as plain object
        const chatboat_listing = yield chatboat_schema_1.default.findOne({ _id: chatboat_id }).lean();
        if (!chatboat_listing) {
            return callback(new Error("Chatboat listing not found"), null);
        }
        // Handle city_id enrichment
        const cityId = chatboat_listing.city_id;
        let enrichedCity = null;
        if (typeof cityId !== "undefined" && cityId !== null) {
            enrichedCity = yield mongoose_1.default.connection.collection("cities").findOne({ unique_id: cityId }, {
                projection: { _id: 1, unique_id: 1, name: 1 }
            });
        }
        // Extract listing IDs from the new structure and create order map
        const listingIds = [];
        const listingOrderMap = new Map();
        if (Array.isArray(chatboat_listing.listing_id)) {
            chatboat_listing.listing_id.forEach((item, index) => {
                const id = typeof item === 'object' && item.id ? item.id : item;
                const order = typeof item === 'object' && item.order !== undefined ? item.order : index;
                listingIds.push(id);
                listingOrderMap.set(String(id), order);
            });
        }
        // Fetch listings by listing_unique_id
        const listingsFromSchema = yield listing_schema_1.default.aggregate([
            {
                $match: {
                    listing_unique_id: { $in: listingIds }
                }
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city_info"
                }
            },
            {
                $addFields: {
                    city_id: {
                        $map: {
                            input: "$city_info",
                            as: "city",
                            in: {
                                _id: "$$city._id",
                                unique_id: "$$city.unique_id",
                                name: "$$city.name"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    city_info: 0
                }
            }
        ]);
        // Sort listings and add order field
        const sortedListingsWithOrder = listingsFromSchema
            .map((listing) => {
            var _a;
            return (Object.assign(Object.assign({}, listing), { order: (_a = listingOrderMap.get(String(listing.listing_unique_id))) !== null && _a !== void 0 ? _a : 999 }));
        })
            .sort((a, b) => a.order - b.order);
        console.log(sortedListingsWithOrder);
        const chatboat_listing_response = Object.assign(Object.assign({}, chatboat_listing), { city_id: enrichedCity, listing_id: sortedListingsWithOrder });
        return callback(null, { chatboat_listing: chatboat_listing_response });
    }
    catch (error) {
        console.error("Error in chatboatListingDetails:", error);
        return callback(error, null);
    }
});
exports.chatboatListingDetails = chatboatListingDetails;
const chatboatListingModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h, _j;
    try {
        const skip = (page - 1) * limit;
        const pipeline = [
            // Stage 1: Add a field to extract listing IDs from the new structure
            {
                $addFields: {
                    listing_ids_extracted: {
                        $map: {
                            input: "$listing_id",
                            as: "item",
                            in: {
                                $cond: {
                                    if: { $eq: [{ $type: "$$item" }, "object"] },
                                    then: "$$item.id",
                                    else: "$$item"
                                }
                            }
                        }
                    }
                }
            },
            // Stage 2: Lookup Listings using extracted IDs
            {
                $lookup: {
                    from: "listings",
                    localField: "listing_ids_extracted",
                    foreignField: "listing_unique_id",
                    as: "listing_info_array"
                }
            },
            // Stage 3: Lookup Cities
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city_info_array"
                }
            },
            // Stage 4: Apply initial Match condition
            {
                $match: {
                    $or: [
                        { "listing_info_array.name": { $regex: search || "", $options: "i" } },
                        { "city_info_array.name": { $regex: search || "", $options: "i" } }
                    ]
                }
            },
            // Stage 5: Deconstruct listing_info_array
            {
                $unwind: {
                    path: "$listing_info_array",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Stage 6: Deconstruct city_info_array
            {
                $unwind: {
                    path: "$city_info_array",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Stage 7: Group back to collect all matched names as arrays
            {
                $group: {
                    _id: "$_id",
                    is_city_select_all: { $first: "$is_city_select_all" },
                    createdAt: { $first: "$createdAt" },
                    listing_id_original: { $first: "$listing_id" },
                    listing_names: {
                        $addToSet: {
                            _id: "$listing_info_array._id",
                            listing_unique_id: "$listing_info_array.listing_unique_id",
                            name: "$listing_info_array.name"
                        }
                    },
                    city_names: {
                        $addToSet: {
                            _id: "$city_info_array._id",
                            unique_id: "$city_info_array.unique_id",
                            name: "$city_info_array.name"
                        }
                    }
                }
            },
            // Stage 8: Project the final desired fields
            {
                $project: {
                    _id: 1,
                    listing_id: "$listing_names",
                    listing_id_with_order: "$listing_id_original",
                    city_id: "$city_names",
                    is_city_select_all: 1,
                    createdAt: 1
                }
            },
            // Stage 9: Sort before pagination
            {
                $sort: { createdAt: -1 }
            },
            // Stage 10: Facet for total count and paginated data
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            }
        ];
        const result = yield chatboat_schema_1.default.aggregate(pipeline);
        return {
            data: (_e = result[0]) === null || _e === void 0 ? void 0 : _e.data,
            totalUsers: ((_g = (_f = result[0]) === null || _f === void 0 ? void 0 : _f.totalCount[0]) === null || _g === void 0 ? void 0 : _g.count) || 0,
            totalPages: Math.ceil(((_j = (_h = result[0]) === null || _h === void 0 ? void 0 : _h.totalCount[0]) === null || _j === void 0 ? void 0 : _j.count) / limit) || 0,
            currentPage: page
        };
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
exports.chatboatListingModel = chatboatListingModel;
const chatBoatListingCityWise = (city_id, chat_boat_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let listings;
        if (mongoose_1.default.isValidObjectId(chat_boat_id)) {
            const chatboatListing = yield chatboat_schema_1.default.findById(chat_boat_id).exec();
            if (!chatboatListing) {
                throw new Error("Chatboat listing not found.");
            }
            // Extract listing IDs from the new structure
            const excludedListingIds = Array.isArray(chatboatListing.listing_id)
                ? chatboatListing.listing_id.map((item) => {
                    // Handle both new format {id, order} and old format
                    return typeof item === 'object' && item.id ? item.id : item;
                })
                : [];
            const cityidNum = Number(city_id);
            const cityFilter = !isNaN(cityidNum)
                ? { city_id: { $in: [cityidNum] } }
                : {};
            listings = yield listing_schema_1.default.aggregate([
                {
                    $match: Object.assign(Object.assign({}, cityFilter), { listing_unique_id: { $nin: excludedListingIds } })
                },
                {
                    $lookup: {
                        from: "cities",
                        localField: "city_id",
                        foreignField: "unique_id",
                        as: "city_info"
                    }
                },
                {
                    $unwind: {
                        path: "$city_info",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        city_id: {
                            _id: "$city_info._id",
                            unique_id: "$city_info.unique_id",
                            name: "$city_info.name"
                        }
                    }
                },
                {
                    $project: {
                        city_info: 0
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        doc: { $first: "$$ROOT" }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                }
            ]);
        }
        else {
            const cityidNum = Number(city_id);
            const cityFilter = !isNaN(cityidNum)
                ? { city_id: { $in: [cityidNum] } }
                : {};
            listings = yield listing_schema_1.default.aggregate([
                { $match: cityFilter },
                {
                    $lookup: {
                        from: "cities",
                        localField: "city_id",
                        foreignField: "unique_id",
                        as: "city_info"
                    }
                },
                {
                    $unwind: {
                        path: "$city_info",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        city_id: {
                            _id: "$city_info._id",
                            unique_id: "$city_info.unique_id",
                            name: "$city_info.name"
                        }
                    }
                },
                {
                    $project: {
                        city_info: 0
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        doc: { $first: "$$ROOT" }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                }
            ]);
        }
        return listings;
    }
    catch (error) {
        console.error("Error in chatBoatListingCityWise:", error);
        throw error;
    }
});
exports.chatBoatListingCityWise = chatBoatListingCityWise;
const storeChatboatListingModel = (body, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { city_id, listing_id, chat_boat_id = "" } = body;
        let is_city_select_all;
        if (body.is_city_select_all == "true") {
            is_city_select_all = true;
        }
        else {
            is_city_select_all = false;
        }
        // Validate city ID
        let numericCityId = null;
        if (city_id && !is_city_select_all) {
            const parsedCityId = Number(city_id);
            if (isNaN(parsedCityId)) {
                return callback(new Error("Invalid city ID"), null);
            }
            numericCityId = parsedCityId;
        }
        // Validate and format listing IDs with order
        let formattedListingIds = [];
        listing_id = JSON.parse(listing_id);
        if (Array.isArray(listing_id) && listing_id.length > 0) {
            // Parse listing_id if it's a string
            let parsedListingId = listing_id;
            if (typeof listing_id === 'string') {
                try {
                    parsedListingId = JSON.parse(listing_id);
                }
                catch (e) {
                    console.error("Error parsing listing_id:", e);
                }
            }
            formattedListingIds = parsedListingId
                .map((item) => {
                // Handle both new format {id, order} and old format (plain id)
                if (typeof item === 'object' && item.id !== undefined) {
                    return {
                        id: String(item.id), // Ensure id is stored as string
                        order: item.order !== undefined ? Number(item.order) : 0
                    };
                }
                else if (typeof item === 'string' || typeof item === 'number') {
                    // Backward compatibility for old format
                    return {
                        id: String(item),
                        order: 0
                    };
                }
                return null;
            })
                .filter((item) => item !== null);
        }
        let result;
        if (chat_boat_id && mongoose_1.default.isValidObjectId(chat_boat_id)) {
            // ✅ UPDATE existing record
            result = yield chatboat_schema_1.default.findByIdAndUpdate(chat_boat_id, {
                city_id: numericCityId,
                is_city_select_all: is_city_select_all,
                listing_id: formattedListingIds
            }, { new: true });
        }
        else {
            // ✅ CREATE new record
            const chatboat = new chatboat_schema_1.default({
                city_id: numericCityId,
                is_city_select_all: is_city_select_all,
                listing_id: formattedListingIds
            });
            result = yield chatboat.save();
        }
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
});
exports.storeChatboatListingModel = storeChatboatListingModel;
//# sourceMappingURL=chatboatListing.model.js.map