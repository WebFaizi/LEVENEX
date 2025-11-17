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
exports.searchListings = void 0;
const listing_schema_1 = __importDefault(require("../domain/schema/listing.schema"));
const city_schema_1 = __importDefault(require("../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../domain/schema/area.schema"));
const featuredListing_schema_1 = __importDefault(require("../domain/schema/featuredListing.schema")); // Import Featured Listings Schema
const slugify_1 = __importDefault(require("slugify"));
const mongoose_1 = __importDefault(require("mongoose"));
const searchListings = (categoryInputs_1, locationDetails_1, ...args_1) => __awaiter(void 0, [categoryInputs_1, locationDetails_1, ...args_1], void 0, function* (categoryInputs, locationDetails, page = 1, limit = 20) {
    try {
        const filters = { approved: true };
        const cityIds = [];
        let areaId = null;
        // 🔹 Resolve city & area
        if (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.area_name) {
            const area = yield area_schema_1.default.findOne({
                name: locationDetails.area_name,
            }).lean();
            if (area) {
                areaId = area.unique_id;
                filters.$or = [
                    { area_id: areaId, is_area_all_selected: false },
                    { is_area_all_selected: true },
                ];
            }
        }
        if (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.city_name) {
            const city = yield city_schema_1.default.findOne({
                name: locationDetails.city_name,
            }).lean();
            if (city) {
                cityIds.push(city.unique_id);
                if (!areaId) {
                    filters.$or = [
                        {
                            city_id: { $in: cityIds },
                            is_city_all_selected: false,
                        },
                        { is_city_all_selected: true },
                    ];
                }
            }
        }
        if (categoryInputs.length > 0) {
            filters.category_ids = { $in: categoryInputs };
        }
        const allListings = [];
        let featureCount = 0;
        // 🔹 Featured Listings
        const featuredFilters = {
            category_ids: { $in: categoryInputs },
        };
        if (cityIds.length > 0)
            featuredFilters.city_id = { $in: cityIds };
        // if (areaId) {
        //   featuredFilters.area_id = { $in: [areaId] };
        // }
        if (page === 1) {
            const featured = yield featuredListing_schema_1.default.aggregate([
                { $match: featuredFilters },
                { $sort: { position: 1 } },
                { $limit: 7 },
                {
                    $lookup: {
                        from: "listings",
                        localField: "listing_id",
                        foreignField: "listing_unique_id",
                        as: "listing",
                    },
                },
                { $unwind: { path: "$listing", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "listing.category_ids",
                        foreignField: "unique_id",
                        as: "category_ids",
                    },
                },
                {
                    $lookup: {
                        from: "cities",
                        localField: "listing.city_id",
                        foreignField: "unique_id",
                        as: "city",
                    },
                },
                {
                    $lookup: {
                        from: "areas",
                        localField: "listing.area_id",
                        foreignField: "unique_id",
                        as: "area",
                    },
                },
                {
                    $project: {
                        city: 1,
                        area: 1,
                        category_ids: 1,
                        _id: "$listing._id",
                        user_id: "$listing.user_id",
                        listing_image: "$listing.listing_image",
                        name: "$listing.name",
                        address: "$listing.address",
                        listing_views: "$listing.listing_views",
                        country_id: "$listing.country_id",
                        state_id: "$listing.state_id",
                        city_id: "$listing.city_id",
                        is_city_all_selected: "$listing.is_city_all_selected",
                        area_id: "$listing.area_id",
                        is_area_all_selected: "$listing.is_area_all_selected",
                        phone_number: "$listing.phone_number",
                        email: "$listing.email",
                        contact_person: "$listing.contact_person",
                        second_phone_no: "$listing.second_phone_no",
                        second_email: "$listing.second_email",
                        website: "$listing.website",
                        listing_type: "$listing.listing_type",
                        price: "$listing.price",
                        time_duration: "$listing.time_duration",
                        cover_image: "$listing.cover_image",
                        video_url: "$listing.video_url",
                        description: "$listing.description",
                        status: "$listing.status",
                        approved: "$listing.approved",
                        mobile_cover_image: "$listing.mobile_cover_image",
                        createdAt: "$listing.createdAt",
                        updatedAt: "$listing.updatedAt",
                        listing_unique_id: "$listing.listing_unique_id",
                        listing_avg_rating: "$listing.listing_avg_rating",
                        listing_reviews_count: "$listing.listing_reviews_count",
                        is_featured: { $literal: true },
                    },
                },
            ]);
            allListings.push(...featured);
            featureCount = featured.length;
        }
        else {
            featureCount = yield featuredListing_schema_1.default.find(featuredFilters).countDocuments();
        }
        const listingMatch = Object.assign({}, filters);
        // Filter only valid ObjectIds from allListings
        const excludedIds = allListings.map((l) => new mongoose_1.default.Types.ObjectId(l === null || l === void 0 ? void 0 : l._id));
        if (excludedIds.length > 0) {
            listingMatch._id = { $nin: excludedIds };
        }
        let skip = page === 1
            ? (Math.max(1, page) - 1) * limit
            : (Math.max(1, page) - 1) * limit - featureCount;
        limit = page == 1 ? limit - featureCount : limit;
        // 🔹 Regular Listings
        const regularListings = yield listing_schema_1.default.aggregate([
            { $match: listingMatch },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_ids",
                    foreignField: "unique_id",
                    as: "category_ids",
                },
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "_id",
                    as: "city",
                },
            },
            {
                $lookup: {
                    from: "areas",
                    localField: "area_id",
                    foreignField: "_id",
                    as: "area",
                },
            },
            { $unwind: { path: "$area", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    listing_image: 1,
                    name: 1,
                    address: 1,
                    listing_views: 1,
                    country_id: 1,
                    state_id: 1,
                    city_id: 1,
                    is_city_all_selected: 1,
                    area_id: 1,
                    is_area_all_selected: 1,
                    phone_number: 1,
                    email: 1,
                    contact_person: 1,
                    second_phone_no: 1,
                    second_email: 1,
                    website: 1,
                    listing_type: 1,
                    price: 1,
                    time_duration: 1,
                    cover_image: 1,
                    video_url: 1,
                    description: 1,
                    status: 1,
                    approved: 1,
                    mobile_cover_image: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    listing_unique_id: 1,
                    category_ids: 1,
                    city: 1,
                    area: 1,
                    listing_avg_rating: 1,
                    listing_reviews_count: 1,
                    is_featured: { $literal: false },
                },
            },
        ]);
        allListings.push(...regularListings);
        const totalListings = yield listing_schema_1.default.countDocuments(filters);
        const totalPages = Math.ceil(totalListings / limit);
        // 🔹 Format with image URLs
        const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";
        const formattedListings = allListings.map((listing) => {
            var _a, _b;
            const categorySlug = ((_b = (_a = listing.category_ids) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.slug) || "category";
            const locationSlug = (0, slugify_1.default)((locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.area_name) || (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.city_name) || "location", { lower: true });
            const currentUrl = `${baseUrl}/${(0, slugify_1.default)(categorySlug)}-${locationSlug}/${listing._id}`;
            const defaultImageUrl = `${baseUrl}/uploads/default.jpg`;
            return Object.assign(Object.assign({}, listing), { image_url: listing.listing_image
                    ? `${baseUrl}/${listing.listing_image}`
                    : defaultImageUrl, current_url: currentUrl });
        });
        return {
            page,
            limit,
            totalListings,
            totalPages,
            listings: formattedListings,
        };
    }
    catch (err) {
        console.error("Error searching listings:", err);
        return { success: false, error: "Failed to search listings" };
    }
});
exports.searchListings = searchListings;
//# sourceMappingURL=categoryListing.service.js.map