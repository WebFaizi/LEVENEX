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
exports.sitemapData = exports.getStaticPage = exports.submitContactUsForm = exports.getSeachCategory = exports.getAllBlogsSlug = exports.getAllListingWithSlug = exports.getListingStaticData = exports.getListingDetails = exports.getListingDetails_data = exports.extractCategoryAndLocation = exports.getListingWiseProductList = exports.getCategoryWiseProductList = exports.getListingCategoryWise = exports.getBlogWiseReviewList = exports.getListingWiseReviewList = exports.sitemapFronendUrls = exports.storePremiumRequest = exports.unsubscribeSite = exports.getSlugWiseResponse = exports.storeCategorySearchCount = exports.categorySearchCountList = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const slugify_1 = __importDefault(require("slugify"));
const apiResponse_1 = require("../../helper/apiResponse");
const frontend_model_1 = require("../../domain/models/frontend.model");
const category_schema_1 = __importDefault(require("../../domain/schema/category.schema"));
const categoryseo_schema_1 = __importDefault(require("../../domain/schema/categoryseo.schema"));
const staticPage_schema_1 = __importDefault(require("../../domain/schema/staticPage.schema"));
const city_schema_1 = __importDefault(require("../../domain/schema/city.schema"));
const listing_schema_1 = __importDefault(require("../../domain/schema/listing.schema"));
const subscribers_schema_1 = __importDefault(require("../../domain/schema/subscribers.schema"));
const area_schema_1 = __importDefault(require("../../domain/schema/area.schema"));
const currentLocation_service_1 = require("../../services/currentLocation.service");
const categoryDetails_service_1 = require("../../services/categoryDetails.service");
const populerAreaList_service_1 = require("../../services/populerAreaList.service");
const listingDetailsData_service_1 = require("../../services/listingDetailsData.service");
const productListingByCategory_service_1 = require("../../services/productListingByCategory.service");
const productListByListing_service_1 = require("../../services/productListByListing.service");
const productListById_service_1 = require("../../services/productListById.service");
const categoryListing_service_1 = require("../../services/categoryListing.service");
const getLocationDetailsByName_service_1 = require("../../services/getLocationDetailsByName.service");
const listing_model_1 = require("../../domain/models/listing.model");
const blog_model_1 = require("../../domain/models/blog.model");
const contactus_model_1 = require("../../domain/models/contactus.model");
const JobCategory_model_1 = require("../../domain/models/JobCategory.model");
const jobs_schema_1 = __importDefault(require("../../domain/schema/jobs.schema"));
const blog_schema_1 = __importDefault(require("../../domain/schema/blog.schema"));
const categoryDetailswithreled_service_1 = __importDefault(require("../../services/categoryDetailswithreled.service"));
const product_schema_1 = __importDefault(require("../../domain/schema/product.schema"));
const cache = new node_cache_1.default({ stdTTL: 300 }); // Cache entries expire after 5 minutes
exports.default = cache;
const categorySearchCountList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, url_slug } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, frontend_model_1.categorySearchCountListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category wise Listing list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.categorySearchCountList = categorySearchCountList;
const storeCategorySearchCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, frontend_model_1.storeCategorySearchCountModel)(req.body.category_id, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Store search count Successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.storeCategorySearchCount = storeCategorySearchCount;
const getSlugWiseResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, url_slug } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, frontend_model_1.listingSlugWiseResponse)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category wise Listing list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getSlugWiseResponse = getSlugWiseResponse;
const unsubscribeSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const subscriber = yield subscribers_schema_1.default.findOne({ email });
        if (!subscriber) {
            return (0, apiResponse_1.ErrorResponse)(res, "Email not found in subscribers list.");
        }
        subscriber.status = false;
        yield subscriber.save();
        return (0, apiResponse_1.successResponse)(res, "Unsubscribed from site successfully.", {});
    }
    catch (error) {
        console.error("Unsubscribe error:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during unsubscription.");
    }
});
exports.unsubscribeSite = unsubscribeSite;
const resolveCityAreaFromSlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const slugWords = slug.toLowerCase().split("-");
    const slugJoined = slugWords.join("");
    // Load all cities and areas
    const cities = yield city_schema_1.default.find({}, "name");
    const areas = yield area_schema_1.default.find({}, "name");
    const cityList = cities.map((c) => c.name.toLowerCase());
    const areaList = areas.map((a) => a.name.toLowerCase());
    const matchedCities = [];
    const matchedAreas = [];
    // Try to match city names in the slug
    for (const city of cityList) {
        const citySlug = city.replace(/\s+/g, ""); // remove spaces
        if (slugJoined.includes(citySlug)) {
            matchedCities.push(city);
        }
    }
    // Try to match area names in the slug
    for (const area of areaList) {
        const areaSlug = area.replace(/\s+/g, ""); // remove spaces
        if (slugJoined.includes(areaSlug)) {
            matchedAreas.push(area);
        }
    }
    // Get all keyword templates from category
    const categories = yield categoryseo_schema_1.default.find({}, "search_by_keyword");
    for (const category of categories) {
        for (const template of category === null || category === void 0 ? void 0 : category.search_by_keyword) {
            const templateSlug = template
                .toLowerCase()
                .replace(/%city%/g, ((_a = matchedCities[0]) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, "")) || "")
                .replace(/%area%/g, ((_b = matchedAreas[0]) === null || _b === void 0 ? void 0 : _b.replace(/\s+/g, "")) || "");
            const templateSlugJoined = templateSlug.split("-").join("");
            if (slugJoined === templateSlugJoined) {
                return {
                    city: matchedCities[0] || null,
                    area: matchedAreas[0] || null,
                    matchedCategory: category._id,
                };
            }
        }
    }
    return {
        city: matchedCities[0] || null,
        area: matchedAreas[0] || null,
        matchedCategory: null,
    };
});
const storePremiumRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, frontend_model_1.storePremiumRequestModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Admin User register Successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.storePremiumRequest = storePremiumRequest;
const sitemapFronendUrls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const product_data = yield (0, frontend_model_1.generateFrontendSitemapUrl)(page, limit);
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", product_data);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.sitemapFronendUrls = sitemapFronendUrls;
const getListingWiseReviewList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listing_id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (!listing_id || typeof listing_id !== "string") {
            return (0, apiResponse_1.ErrorResponse)(res, "Invalid provided listing id");
        }
        let data = {};
        const listing_review_list = yield (0, listing_model_1.ListingWiseReviewList)(listing_id, page, limit);
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", listing_review_list);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getListingWiseReviewList = getListingWiseReviewList;
const getBlogWiseReviewList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blog_id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (!blog_id || typeof blog_id !== "string") {
            return (0, apiResponse_1.ErrorResponse)(res, "Invalid provided listing id");
        }
        let data = {};
        const listing_review_list = yield (0, blog_model_1.BlogWiseReviewList)(blog_id, page, limit);
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", listing_review_list);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getBlogWiseReviewList = getBlogWiseReviewList;
const getQueryString = (value) => {
    if (typeof value === "string")
        return value;
    if (Array.isArray(value) && typeof value[0] === "string")
        return value[0];
    return null;
};
const getListingCategoryWise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id, current_location_id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (!category_id) {
            return (0, apiResponse_1.ErrorResponse)(res, "Category ID is required");
        }
        const cacheKey = `listing:${category_id}:location:${current_location_id || "none"}:page:${page}:limit:${limit}`;
        let current_location = {};
        if (current_location_id) {
            current_location = yield (0, currentLocation_service_1.getLocationDetails)(current_location_id);
        }
        const cet_details = yield category_schema_1.default
            .findOne({ _id: category_id })
            .lean();
        if (!cet_details) {
            return (0, apiResponse_1.ErrorResponse)(res, "Category not found");
        }
        const categoryIdStr = getQueryString(req.query.category_id);
        if (!categoryIdStr) {
            return res.status(400).json({ message: "Invalid category_id" });
        }
        const cat_iid = cet_details.unique_id;
        const listing_data = yield (0, categoryListing_service_1.searchListings)([cat_iid], current_location, page, limit);
        // Save to cache with 10-minute expiry
        // await cache.set(cacheKey, listing_data);
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", listing_data);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getListingCategoryWise = getListingCategoryWise;
const getCategoryWiseProductList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_unique_id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (!category_unique_id) {
            return (0, apiResponse_1.ErrorResponse)(res, "Category ID is required");
        }
        const cacheKey = `category_unique_id:${category_unique_id}:page:${page}:limit:${limit}`;
        const cachedData = yield cache.get(cacheKey);
        if (cachedData) {
            return (0, apiResponse_1.successResponse)(res, "Data retrieved from cache", cachedData);
        }
        const listing_data = yield (0, productListingByCategory_service_1.getProductsByCategory)(category_unique_id, page, limit);
        // Save to cache with 10-minute expiry
        yield cache.set(cacheKey, listing_data);
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", listing_data);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getCategoryWiseProductList = getCategoryWiseProductList;
const getListingWiseProductList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listing_id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (!listing_id) {
            return (0, apiResponse_1.ErrorResponse)(res, "listing ID is required");
        }
        const cacheKey = `product_listing_id:${listing_id}:page:${page}:limit:${limit}`;
        const cachedData = yield cache.get(cacheKey);
        if (cachedData) {
            return (0, apiResponse_1.successResponse)(res, "Data retrieved from cache", cachedData);
        }
        const product_data = yield (0, productListByListing_service_1.getProductsByListing)(listing_id, page, limit);
        // Save to cache with 10-minute expiry
        yield cache.set(cacheKey, product_data);
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", product_data);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getListingWiseProductList = getListingWiseProductList;
const extractCategoryAndLocation = (url_slug) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url_slug || typeof url_slug !== "string") {
        throw new Error("Invalid slug provided");
    }
    let category = null;
    let category_name = "";
    let category_unique_id = null;
    let location = null;
    const parts = url_slug.split("-");
    for (let i = parts.length; i > 0; i--) {
        const possibleCategorySlug = parts.slice(0, i).join("-");
        let possibleLocationSlug = parts.slice(i).join("-");
        const categoryCheck = yield category_schema_1.default
            .findOne({ slug: possibleCategorySlug })
            .lean();
        if (categoryCheck) {
            category = categoryCheck._id;
            category_name = categoryCheck.name;
            category_unique_id = Number(categoryCheck.unique_id);
            possibleLocationSlug = possibleLocationSlug.replace(/-/g, " ");
            location = yield area_schema_1.default
                .findOne({
                name: { $regex: new RegExp(`^${possibleLocationSlug}$`, "i") },
            })
                .lean();
            if (!location) {
                location = yield city_schema_1.default
                    .findOne({
                    name: { $regex: new RegExp(`^${possibleLocationSlug}$`, "i") },
                })
                    .lean();
                if (location) {
                }
            }
            if (location) {
                location = location._id;
            }
            break;
        }
    }
    return { category, category_name, location, category_unique_id };
});
exports.extractCategoryAndLocation = extractCategoryAndLocation;
const getCitiesFromState = (state_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cities = yield city_schema_1.default.find({ state_id }).select("_id").lean(); // Get city IDs from the state
        return cities.map((city) => city._id); // Return an array of city IDs
    }
    catch (error) {
        console.error("Error fetching cities from state:", error);
        return [];
    }
});
const getAreaFromCity = (city_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cities = yield area_schema_1.default.find({ city_id }).select("_id").lean(); // Get city IDs from the state
        return cities.map((city) => city._id); // Return an array of city IDs
    }
    catch (error) {
        console.error("Error fetching cities from state:", error);
        return [];
    }
});
const getAreaDetails = (area_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const area = yield area_schema_1.default
            .findOne({ unique_id: area_id })
            .select("_id")
            .lean();
        return (area === null || area === void 0 ? void 0 : area._id) || null;
    }
    catch (error) {
        console.error("Error fetching area:", error);
        return [];
    }
});
const getCityDetails = (city_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = yield city_schema_1.default
            .findOne({ unique_id: city_id })
            .select("_id")
            .lean();
        return (city === null || city === void 0 ? void 0 : city._id) || null;
    }
    catch (error) {
        console.error("Error fetching city:", error);
        return [];
    }
});
const extractLocationFromSlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const cleanedSlug = slug
        .replace(/^jobs-/, "") // remove "jobs-" prefix
        .replace(/-\d+$/, "") // remove trailing ID
        .toLowerCase();
    const slugWords = new Set(cleanedSlug.split("-")); // use Set for faster lookup
    // Cache cities and areas to avoid repeated DB calls
    const cities = yield city_schema_1.default.find({}, "name"); // just get name field
    const areas = yield area_schema_1.default.find({}, "name");
    let matchedCity = "";
    let matchedArea = "";
    // Match area (support multi-word like "central mumbai")
    for (const area of areas) {
        const areaWords = area.name.toLowerCase().split(" ");
        // Check if all area words exist in the slugWords Set
        if (areaWords.every((word) => slugWords.has(word))) {
            matchedArea = area.name;
            break;
        }
    }
    // Match city
    for (const city of cities) {
        const cityName = city.name.toLowerCase();
        // Check if the city exists in the slugWords Set
        if (slugWords.has(cityName)) {
            matchedCity = city.name;
            break;
        }
    }
    // Return matched area if available, else return matched city
    return matchedArea || matchedCity || "mumbai"; // return null if neither matched
});
const getListingDetails_data = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url_slug, location_query } = req.query;
        const check_result = yield resolveCityAreaFromSlug(url_slug);
        return check_result;
    }
    catch (error) {
        return error;
    }
});
exports.getListingDetails_data = getListingDetails_data;
const getListingDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const { url_slug, location_query } = req.query;
        const cacheKey = `listingDetails:${url_slug}:${location_query}`;
        let location_query_id = location_query || "";
        let current_location = {};
        // Check if data is in cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully (from cache)", cachedData);
        }
        if (!url_slug || typeof url_slug !== "string") {
            return (0, apiResponse_1.ErrorResponse)(res, "Invalid slug provided");
        }
        let data = {};
        if (url_slug.includes("/") &&
            !url_slug.startsWith("product-list-") &&
            !url_slug.startsWith("pro-") &&
            !url_slug.includes("-jobs-in-") &&
            !url_slug.includes("jobs-")) {
            data.type = "category_location";
            const [categorySlug] = url_slug.split("/");
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const category_type = 1;
            const { category, location, category_unique_id } = yield (0, exports.extractCategoryAndLocation)(categorySlug);
            if (location) {
                current_location = yield (0, currentLocation_service_1.getLocationDetails)(location);
                data.current_location = current_location;
            }
            if (page == 1) {
                const [category_details, populer_areas_res, listing_data_res] = yield Promise.all([
                    (0, categoryDetails_service_1.getCategoryDetails)(category, category_type, current_location),
                    (0, populerAreaList_service_1.getPopulerArealist)(category, category_type, current_location),
                    (0, categoryListing_service_1.searchListings)([category_unique_id], current_location, page, limit),
                ]);
                data.populer_areas = populer_areas_res;
                data.listing_data = listing_data_res;
                data.category_details = category_details;
            }
            else {
                data.listing_data = yield (0, categoryListing_service_1.searchListings)([category_unique_id], current_location, page, limit);
            }
        }
        else if (typeof url_slug == "string" &&
            url_slug.includes("product-list-")) {
            const [categorySlug, category_id] = url_slug
                .replace("product-list-", "")
                .split("/");
            const category_details = yield category_schema_1.default
                .findOne({ unique_id: category_id })
                .lean();
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (/^\d+$/.test(category_id)) {
                data = {
                    type: "product_listing",
                    category_id,
                    category_details,
                    products: yield (0, productListingByCategory_service_1.getProductsByCategory)(category_id, page, limit),
                };
            }
        }
        else if (typeof url_slug == "string" && url_slug.includes("-jobs-in-")) {
            const [categorySlug, category_id] = url_slug.split("/");
            const parts = categorySlug.split("jobs-in-");
            const converted_location = parts.length > 1 ? parts[1] : "";
            const current_location = converted_location
                .replace(/-/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
            const location_details = yield (0, getLocationDetailsByName_service_1.getLocationDetailsByName)(current_location);
            if (/^\d+$/.test(category_id)) {
                const category_list = yield (0, JobCategory_model_1.categoryListFrontend)("", 1, 1000, location_details.current_location_id);
                let current_location_string;
                if (location_details.area_name) {
                    current_location_string = location_details.area_name;
                }
                else {
                    current_location_string = location_details.city_name;
                }
                data = {
                    type: "job_listing",
                    category_list: category_list.data,
                    categorty_details: yield (0, JobCategory_model_1.getJobDetailByUniqueId)(category_id),
                    current_location: location_details,
                    job_list: yield (0, JobCategory_model_1.getJoblistingFrontendModel)(location_details !== null && location_details !== void 0 ? location_details : {}, category_id, 1, 10),
                };
            }
        }
        else if (typeof url_slug == "string" && url_slug.includes("jobs-")) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const slugParts = url_slug.split("-");
            const jobId = slugParts[slugParts.length - 1];
            const find_location = yield extractLocationFromSlug(url_slug);
            current_location = yield (0, getLocationDetailsByName_service_1.getLocationDetailsByName)(find_location);
            // Fetch ads and products in parallel
            const [job_detail] = yield Promise.all([
                (0, JobCategory_model_1.getJobDetailFrontendModel)(jobId, current_location),
            ]);
            data = {
                type: "job_details",
                current_location,
                job_detail,
            };
        }
        else if (url_slug.startsWith("pro-")) {
            const slugParts = url_slug.split("-");
            const lastPart = slugParts[slugParts.length - 1];
            if (/^\d+$/.test(lastPart)) {
                const product_id = parseInt(lastPart);
                const product_details = yield (0, productListById_service_1.getProductById)(product_id);
                if (!product_details)
                    return;
                const product_data = product_details.product_listing_id;
                let listing_details = {};
                listing_details = yield (0, listingDetailsData_service_1.getListingDetailsData)(parseInt(product_data, 10));
                // Determine locationPromise based on listing settings
                let locationPromise = Promise.resolve("");
                if (listing_details.is_area_all_selected &&
                    listing_details.is_city_all_selected) {
                    locationPromise = getCitiesFromState((_c = listing_details.state_id) === null || _c === void 0 ? void 0 : _c.unique_id).then((cities) => String((cities === null || cities === void 0 ? void 0 : cities[0]) || ""));
                }
                else if (listing_details.is_area_all_selected) {
                    locationPromise = getAreaFromCity((_d = listing_details.city_id[0]) === null || _d === void 0 ? void 0 : _d.unique_id).then((areas) => { var _a; return String((areas === null || areas === void 0 ? void 0 : areas[0]) || ((_a = listing_details === null || listing_details === void 0 ? void 0 : listing_details.area_id) === null || _a === void 0 ? void 0 : _a._id) || ""); });
                }
                else if (!listing_details.is_area_all_selected) {
                    locationPromise = Promise.resolve(String(listing_details.area_id._id || ""));
                }
                else if (!listing_details.is_city_all_selected) {
                    locationPromise = Promise.resolve(String(((_f = (_e = listing_details.city_id) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f._id) || ""));
                }
                // Fetch review + location in parallel
                const [location_id] = yield Promise.all([locationPromise]);
                const current_location = yield (0, currentLocation_service_1.getLocationDetails)(location_query_id || location_id);
                data = {
                    type: "product_details",
                    product_details,
                    current_location,
                    listing_details,
                };
            }
        }
        else if (url_slug.includes("-")) {
            const slugParts = url_slug.split("-");
            const lastPart = slugParts[slugParts.length - 1];
            if (/^\d+$/.test(lastPart)) {
                const listing_id = parseInt(lastPart);
                let listing_details = {};
                listing_details = yield (0, listingDetailsData_service_1.getListingDetailsData)(listing_id);
                if (!listing_details)
                    return; // Early return on failure
                // Prepare review promise
                const reviewPromise = (0, listing_model_1.ListingWiseReviewList)(listing_details._id, 1, 10);
                // Determine locationPromise based on listing settings
                let locationPromise = Promise.resolve("");
                if (listing_details.is_area_all_selected &&
                    listing_details.is_city_all_selected) {
                    locationPromise = getCitiesFromState((_g = listing_details.state_id) === null || _g === void 0 ? void 0 : _g.unique_id).then((cities) => String((cities === null || cities === void 0 ? void 0 : cities[0]) || ""));
                }
                else if (listing_details.is_area_all_selected) {
                    locationPromise = getAreaFromCity((_h = listing_details.city_id[0]) === null || _h === void 0 ? void 0 : _h.unique_id).then((areas) => String((areas === null || areas === void 0 ? void 0 : areas[0]) || listing_details.area_id));
                }
                else if (!listing_details.is_area_all_selected) {
                    locationPromise = Promise.resolve(String(((_j = listing_details === null || listing_details === void 0 ? void 0 : listing_details.area_id) === null || _j === void 0 ? void 0 : _j._id) || ""));
                }
                else if (!listing_details.is_city_all_selected) {
                    locationPromise = Promise.resolve(String(((_l = (_k = listing_details === null || listing_details === void 0 ? void 0 : listing_details.city_id) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l._id) || ""));
                }
                // Fetch review + location in parallel
                const [listing_review_list, location_id] = yield Promise.all([
                    reviewPromise,
                    locationPromise,
                ]);
                const current_location = yield (0, currentLocation_service_1.getLocationDetails)(location_query_id || location_id);
                // Fetch ads and products in parallel
                const [product_data] = yield Promise.all([
                    (0, productListByListing_service_1.getProductsByListing)(listing_details === null || listing_details === void 0 ? void 0 : listing_details.listing_unique_id, 1, 10),
                ]);
                data = {
                    type: "listing_details",
                    current_location,
                    listing_details,
                    listing_review_list,
                    product_data,
                };
            }
        }
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", data);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getListingDetails = getListingDetails;
const getListingStaticData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url_slug, location_query } = req.query;
        let current_location = {};
        let data = {};
        if (!url_slug || typeof url_slug !== "string") {
            return (0, apiResponse_1.ErrorResponse)(res, "Invalid slug provided");
        }
        if (url_slug === null || url_slug === void 0 ? void 0 : url_slug.includes("/")) {
            const [categorySlug] = url_slug.split("/");
            const { category, category_name, location } = yield (0, exports.extractCategoryAndLocation)(categorySlug);
            let my_cat_array = (category_name === null || category_name === void 0 ? void 0 : category_name.split(" ")) || [];
            my_cat_array = my_cat_array.filter((item) => item.toLowerCase() !== "in" &&
                item.toLowerCase() !== "rental" &&
                item.toLowerCase() !== "rent" &&
                item.toLowerCase() !== "on");
            const regexKeywords = my_cat_array.map((word) => new RegExp(`\\b${word}\\b`, "i"));
            const matchedCategories = yield category_schema_1.default.find({
                name: { $in: regexKeywords },
            }, {
                name: 1,
                slug: 1,
                _id: 1,
                unique_id: 1,
            });
            const top_city = city_schema_1.default.aggregate([
                {
                    $match: {
                        is_top_city: true,
                    },
                },
                {
                    $lookup: {
                        from: "states",
                        let: {
                            stateIdObjectId: "$state_id",
                            stateIdNumber: "$state_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            { $eq: ["$_id", "$$stateIdObjectId"] }, // for ObjectId
                                            { $eq: ["$unique_id", "$$stateIdNumber"] }, // for string "1" to match numeric unique_id
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    unique_id: 1,
                                },
                            },
                        ],
                        as: "state_id",
                    },
                },
                {
                    $unwind: {
                        path: "$state_id",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $sort: { createdAt: -1 } },
            ]);
            if (location) {
                current_location = yield (0, currentLocation_service_1.getLocationDetails)(location);
                data.current_location = current_location;
            }
            const [top_city_details, category_details, populer_area] = yield Promise.all([
                top_city,
                (0, categoryDetailswithreled_service_1.default)(category, 1, {}),
                (0, populerAreaList_service_1.getPopulerArealist)(category, 1, current_location),
            ]);
            data.top_city = top_city_details;
            data.category_details = category_details;
            data.similer_category = matchedCategories;
            data.populer_area = populer_area;
        }
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", data);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getListingStaticData = getListingStaticData;
function generateSlug(name, listing_unique_id) {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");
    return `${slug}-${listing_unique_id}`;
}
const getAllListingWithSlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [listings, jobs, blogs, products] = yield Promise.all([
            listing_schema_1.default.find({}, "name listing_unique_id"),
            jobs_schema_1.default.find({}, "job_title unique_id"),
            blog_schema_1.default.find({}, "_id, blog_title"),
            product_schema_1.default.find({}, "_id product_name unique_id"),
        ]);
        const listingsWithSlugs = listings.map((item) => ({
            listing_unique_id: item.listing_unique_id,
            name: item.name,
            slug: generateSlug(item.name, item.listing_unique_id),
        }));
        const jobsWithSlugs = jobs.map((job) => ({
            unique_id: job.unique_id,
            job_title: job.job_title,
            slug: generateJobSlug(job.job_title, job.unique_id),
        }));
        const blogsWithSlugs = blogs.map((blog) => ({
            _id: blog._id,
            blog_title: blog.blog_title,
            slug: generateBlogSlug(blog._id),
        }));
        const productsWithSlugs = products.map((product) => ({
            _id: product._id,
            name: product.product_name,
            slug: generateProductSlug(product.product_name, product.unique_id),
        }));
        const data = {
            listing: listingsWithSlugs,
            jobs: jobsWithSlugs,
            blogs: blogsWithSlugs,
            products: productsWithSlugs,
        };
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", data);
    }
    catch (error) {
        console.error("Error fetching data:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getAllListingWithSlug = getAllListingWithSlug;
function generateJobSlug(title, job_unique_id) {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
    return `jobs-${slug}-${job_unique_id}`;
}
function generateBlogSlug(id) {
    return `blog-details/${id}`;
}
function generateProductSlug(title, unique_id) {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
    return `pro-${slug}-${unique_id}`;
}
const getAllBlogsSlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [blogs] = yield Promise.all([
            blog_schema_1.default.find({}, "_id, blog_title")
        ]);
        const blogsWithSlugs = blogs.map((blog) => ({
            _id: blog._id,
            blog_title: blog.blog_title,
            slug: generateBlogSlug(blog._id),
        }));
        const data = {
            blogs: blogsWithSlugs
        };
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", data);
    }
    catch (error) {
        console.error("Error fetching data:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getAllBlogsSlug = getAllBlogsSlug;
const getSeachCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location } = req.query;
        const locationName = location;
        if (!locationName) {
            return (0, apiResponse_1.ErrorResponse)(res, "Location name is required");
        }
        const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";
        const imageBaseUrl = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.latoprental.co";
        // Get all active categories sorted by 'sorting' field
        const home_page_category = yield category_schema_1.default
            .find({ status: true, name: { $regex: new RegExp(name, "i") } })
            .sort({ sorting: 1 })
            .limit(5)
            .select("name slug desktop_image mobile_image unique_id")
            .lean();
        const locationSlug = (0, slugify_1.default)(locationName, { lower: true });
        const category_result = home_page_category.map((category) => {
            const categorySlug = (0, slugify_1.default)(category.slug, { lower: true });
            const categoryImageBaseUrl = `${imageBaseUrl}/${category.desktop_image || "default.jpg"}`;
            const mobileImageBaseUrl = `${imageBaseUrl}/${category.mobile_image || "default.jpg"}`;
            const defaultImageUrl = `${imageBaseUrl}/uploads/default.jpg`;
            return Object.assign(Object.assign({}, category), { desktop_image: category.desktop_image
                    ? categoryImageBaseUrl
                    : defaultImageUrl, mobile_image: category.mobile_image
                    ? mobileImageBaseUrl
                    : defaultImageUrl, current_url: `${baseUrl}/${categorySlug}-${locationSlug}/${category.unique_id}` });
        });
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", category_result);
    }
    catch (error) {
        console.error("Error fetching category data:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getSeachCategory = getSeachCategory;
const submitContactUsForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, contactus_model_1.submitContactUsFormModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Submited contact us form  in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.submitContactUsForm = submitContactUsForm;
const getStaticPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page_name } = req.query;
        if (!page_name) {
            return (0, apiResponse_1.ErrorResponse)(res, "Page name is required");
        }
        const static_page_data = yield staticPage_schema_1.default
            .findOne({ page_name: { $regex: new RegExp(page_name, "i") } })
            .lean();
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", static_page_data);
    }
    catch (error) {
        console.error("Error fetching category data:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getStaticPage = getStaticPage;
const sitemapData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await categoryListFrontend('',1,1000);
        return (0, apiResponse_1.successResponse)(res, "Data retrieved successfully", []);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.sitemapData = sitemapData;
// export const getListingDetails = async (req: Request, res: Response) => {
//     try {
//         const { url_slug } = req.query;
//         const page = parseInt(req.query.page as string) || 1;
//         const limit = parseInt(req.query.limit as string) || 10;
//         let category_type = 1;
//         let page_type = "categroy_listing";
//         if (!url_slug || typeof url_slug !== "string") {
//             return ErrorResponse(res, "Invalid slug provided");
//         }
//         let categorySlug = "";
//         let listingId = "";
//         if (url_slug.includes("/") && !url_slug.includes("product-list")) {
//             const parts = url_slug.split("/");
//             if (parts.length === 2) {
//                 categorySlug = parts[0];
//                 listingId = parts[1];
//             }
//         } else {
//             categorySlug = url_slug;
//         }
//         const { category, location } = await extractCategoryAndLocation(categorySlug);
//         let current_location = {};
//         if (location) {
//             current_location = await getLocationDetails(location);
//         }
//         let category_details: Record<string, any> = {};
//         let listing_data: Record<string, any> | null = null; // ✅ Declared outside to maintain scope
//         if (category) {
//             category_details = await getCategoryDetails(category, category_type, current_location);
//         }
//         if (page_type === "categroy_listing") {
//             if (category_details?.category_id) {
//                 listing_data = await searchListings([category_details.category_id], current_location, page, limit);
//             }
//         }
//         if (!category && !location) {
//             return ErrorResponse(res, "No matching category or location found");
//         }
//         const cat_data = category_details ?? null;
//         const data = { category, current_location, cat_data, listing_data }; // ✅ Now listing_data is accessible
//         return successResponse(res, "Category-wise listing retrieved successfully", data);
//     } catch (error) {
//         console.error("Error fetching listing details:", error);
//         return ErrorResponse(res, "Something went wrong");
//     }
// };
//# sourceMappingURL=frontend.controller.js.map