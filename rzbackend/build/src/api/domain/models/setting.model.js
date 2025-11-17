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
exports.getExportTasksByModuleName = exports.updateSettingModel = exports.userActionActivityListModel = exports.getPremiumRequestList = exports.frontendAdsModel = exports.frontendFooterModel = exports.frontendSettingModel = exports.homePageModels = exports.getChatboatListingModel = exports.clearSettingModel = exports.checkRedirectCurrentUrlModel = void 0;
const setting_schema_1 = __importDefault(require("../schema/setting.schema"));
const area_schema_1 = __importDefault(require("../../domain/schema/area.schema"));
const city_schema_1 = __importDefault(require("../../domain/schema/city.schema"));
const category_schema_1 = __importDefault(require("../../domain/schema/category.schema"));
const blogcategory_schema_1 = __importDefault(require("../../domain/schema/blogcategory.schema"));
const redircetsUrl_schema_1 = __importDefault(require("../../domain/schema/redircetsUrl.schema"));
const chatboat_schema_1 = __importDefault(require("../../domain/schema/chatboat.schema"));
const setting_schema_2 = __importDefault(require("../../domain/schema/setting.schema"));
const premiumRequest_schema_1 = __importDefault(require("../schema/premiumRequest.schema"));
const homepage_seo_schema_1 = __importDefault(require("../schema/homepage_seo.schema"));
const chatboatUser_schema_1 = __importDefault(require("../schema/chatboatUser.schema"));
const keywords_schema_1 = __importDefault(require("../schema/keywords.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_cache_1 = __importDefault(require("node-cache"));
const slugify_1 = __importDefault(require("slugify"));
const path = require("path");
const fs = require("fs");
const currentLocation_service_1 = require("../../services/currentLocation.service");
const ReplaceText_service_1 = require("../../services/ReplaceText.service");
const banners_service_1 = __importDefault(require("../../services/banners.service"));
const userActionActivity_schema_1 = __importDefault(require("../schema/userActionActivity.schema"));
const exportTask_schema_1 = __importDefault(require("../schema/exportTask.schema"));
const featuredListing_schema_1 = __importDefault(require("../schema/featuredListing.schema"));
const product_schema_1 = __importDefault(require("../schema/product.schema"));
const listingseo_schema_1 = __importDefault(require("../schema/listingseo.schema"));
const subdomainCategorySeo_schema_1 = __importDefault(require("../schema/subdomainCategorySeo.schema"));
const listingReview_schema_1 = __importDefault(require("../schema/listingReview.schema"));
const quotation_schema_1 = __importDefault(require("../schema/quotation.schema"));
const premiumListing_schema_1 = __importDefault(require("../schema/premiumListing.schema"));
const chatboatUser_schema_2 = __importDefault(require("../schema/chatboatUser.schema"));
const chatboat_schema_2 = __importDefault(require("../../domain/schema/chatboat.schema"));
const banners_schema_1 = __importDefault(require("../schema/banners.schema"));
const bannerTypes_schema_1 = __importDefault(require("../schema/bannerTypes.schema"));
const jobCategory_schema_1 = __importDefault(require("../schema/jobCategory.schema"));
const jobApplication_schema_1 = __importDefault(require("../schema/jobApplication.schema"));
const jobs_schema_1 = __importDefault(require("../schema/jobs.schema"));
const redircetsUrl_schema_2 = __importDefault(require("../../domain/schema/redircetsUrl.schema"));
const blogReview_schema_1 = __importDefault(require("../schema/blogReview.schema"));
const listing_schema_1 = __importDefault(require("../schema/listing.schema"));
const usersOtp_schema_1 = __importDefault(require("../schema/usersOtp.schema"));
const user_schema_1 = __importDefault(require("../schema/user.schema"));
const blog_schema_1 = __importDefault(require("../schema/blog.schema"));
const blogcategory_schema_2 = __importDefault(require("../schema/blogcategory.schema"));
const subscribers_schema_1 = __importDefault(require("../schema/subscribers.schema"));
const userActionActivity_schema_2 = __importDefault(require("../schema/userActionActivity.schema"));
const userActivity_schema_1 = __importDefault(require("../schema/userActivity.schema"));
const ipAddress_schema_1 = __importDefault(require("../schema/ipAddress.schema"));
const keywords_schema_2 = __importDefault(require("../schema/keywords.schema"));
const newsLetter_schema_1 = __importDefault(require("../schema/newsLetter.schema"));
const city_schema_2 = __importDefault(require("../../domain/schema/city.schema"));
// Initialize in-memory cache with a TTL of 5 minutes
const cache = new node_cache_1.default({ stdTTL: 300 });
// Helper function to get data from cache or fetch and cache it
// const getCachedData = async (key: string, fetchFunction: () => Promise<any>) => {
//   const cached = cache.get(key);
//   if (cached) return cached;
//   const data = await fetchFunction();
//   cache.set(key, data);
//   return data;
// };
const checkRedirectCurrentUrlModel = (from_url, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redirectEntry = yield redircetsUrl_schema_1.default.findOne({ from_url });
        if (redirectEntry) {
            return callback(null, {
                message: "Redirect found.",
                status: true,
                to_url: redirectEntry.to_url,
            });
        }
        else {
            return callback(null, {
                message: "No redirect found.",
                status: false,
            });
        }
    }
    catch (err) {
        return callback({
            message: "Failed to check redirect",
            error: err.message || err,
            status: false,
        }, null);
    }
});
exports.checkRedirectCurrentUrlModel = checkRedirectCurrentUrlModel;
const clearSettingModel = (type, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (type == "1") {
            const settings = yield keywords_schema_1.default.find();
            const updatePromises = settings.map((setting) => __awaiter(void 0, void 0, void 0, function* () {
                const clearedValues = {};
                // Set each field value to an empty string (or null) but keep keys
                Object.keys(setting._doc).forEach((key) => {
                    if (key !== "_id" && key !== "__v") {
                        clearedValues[key] = ""; // or null or default
                    }
                });
                // Delete all collections in parallel
                const collectionsToDelete = [
                    listing_schema_1.default, featuredListing_schema_1.default, premiumRequest_schema_1.default, category_schema_1.default,
                    product_schema_1.default, listingseo_schema_1.default, quotation_schema_1.default, listingReview_schema_1.default,
                    subdomainCategorySeo_schema_1.default, homepage_seo_schema_1.default, premiumListing_schema_1.default,
                    chatboatUser_schema_1.default, chatboatUser_schema_2.default, chatboat_schema_2.default, banners_schema_1.default,
                    bannerTypes_schema_1.default, jobCategory_schema_1.default, jobApplication_schema_1.default, jobs_schema_1.default, redircetsUrl_schema_2.default,
                    blogReview_schema_1.default, usersOtp_schema_1.default, blog_schema_1.default, blogcategory_schema_2.default, subscribers_schema_1.default,
                    userActionActivity_schema_2.default, userActivity_schema_1.default, ipAddress_schema_1.default, newsLetter_schema_1.default, keywords_schema_2.default, user_schema_1.default,
                ];
                yield Promise.all(collectionsToDelete.map((collection) => collection.deleteMany({})));
                console.log("delete all data");
                return keywords_schema_1.default.updateOne({ _id: setting._id }, { $set: clearedValues });
            }));
            yield Promise.all(updatePromises);
        }
        else {
        }
        return callback(null, {
            success: true,
            message: "Settings cleared successfully.",
        });
    }
    catch (err) {
        return callback({
            success: false,
            message: "Failed to clear settings data",
            error: err.message || err,
        }, null);
    }
});
exports.clearSettingModel = clearSettingModel;
const getChatboatListingModel = (ChatBoatListingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Save user if not exists
        const existingUser = yield chatboatUser_schema_1.default.findOne({
            category_ids: Number(ChatBoatListingData.category),
            city_name: ChatBoatListingData.location,
            phone_number: ChatBoatListingData.mobile_number,
        }).lean();
        if (!existingUser) {
            yield new chatboatUser_schema_1.default({
                category_ids: Number(ChatBoatListingData.category),
                city_name: ChatBoatListingData.location,
                phone_number: ChatBoatListingData.mobile_number,
            }).save();
        }
        // Find city data
        let city_data = yield city_schema_1.default
            .findOne({
            name: { $regex: new RegExp(`^${ChatBoatListingData.location}$`, "i") },
        })
            .lean();
        if (!city_data) {
            city_data = yield city_schema_1.default.findOne({ name: "All" }).lean();
        }
        if (!city_data) {
            console.log("City not found");
            return callback(null, []);
        }
        console.log("Searching for city_id:", city_data.unique_id, typeof city_data.unique_id);
        const listing_list = yield chatboat_schema_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { city_id: city_data.unique_id },
                        { city_id: String(city_data.unique_id) },
                        { city_id: Number(city_data.unique_id) },
                        { is_city_select_all: true },
                    ],
                },
            },
            {
                $addFields: {
                    listing_items: {
                        $map: {
                            input: { $ifNull: ["$listing_id", []] },
                            as: "item",
                            in: {
                                id: {
                                    $cond: {
                                        if: { $eq: [{ $type: "$$item" }, "object"] },
                                        then: "$$item.id",
                                        else: "$$item"
                                    }
                                },
                                order: {
                                    $cond: {
                                        if: { $eq: [{ $type: "$$item" }, "object"] },
                                        then: { $ifNull: ["$$item.order", 999] },
                                        else: 999
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    listing_ids: {
                        $map: {
                            input: "$listing_items",
                            as: "item",
                            in: "$$item.id"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "listings",
                    let: { listingIds: "$listing_ids" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$listing_unique_id", "$$listingIds"]
                                }
                            }
                        }
                    ],
                    as: "listings_data"
                }
            },
            {
                $addFields: {
                    listing_id: {
                        $map: {
                            input: "$listing_items",
                            as: "listingItem",
                            in: {
                                $let: {
                                    vars: {
                                        matchedListing: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$listings_data",
                                                        as: "listing",
                                                        cond: {
                                                            $eq: ["$$listing.listing_unique_id", "$$listingItem.id"]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $ne: ["$$matchedListing", null] },
                                            then: {
                                                $mergeObjects: [
                                                    "$$matchedListing",
                                                    { order: "$$listingItem.order" }
                                                ]
                                            },
                                            else: null
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    listing_id: {
                        $sortArray: {
                            input: {
                                $filter: {
                                    input: "$listing_id",
                                    as: "item",
                                    cond: { $ne: ["$$item", null] }
                                }
                            },
                            sortBy: { order: 1 }
                        }
                    }
                }
            },
            {
                $project: {
                    listing_items: 0,
                    listing_ids: 0,
                    listings_data: 0
                }
            },
            {
                $sort: { created_at: -1 }
            }
        ]);
        console.log(`Found ${listing_list.length} chatboat listings`);
        if (!listing_list || listing_list.length === 0) {
            return callback(null, []);
        }
        return callback(null, listing_list);
    }
    catch (err) {
        console.error("Homepage Error:", err.message || err);
        return callback({
            success: false,
            message: "Failed to load homepage data",
            error: err.message || err,
        }, null);
    }
});
exports.getChatboatListingModel = getChatboatListingModel;
const homePageModels = (homeData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let locationId = homeData.current_location_id;
        if (!locationId || !mongoose_1.default.Types.ObjectId.isValid(locationId)) {
            const city = yield city_schema_2.default.findOne({
                name: process.env.DEFAULT_CITY,
            }).lean();
            locationId = city === null || city === void 0 ? void 0 : city._id;
        }
        const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";
        const baseUrl2 = process.env.BASE_URL_TWO || "https://api.latoprental.co";
        const imageBaseUrl = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.latoprental.co";
        const defaultImageUrl = `${imageBaseUrl}/uploads/default.jpg`;
        // Fetch all required data in parallel
        const [current_location, home_page_category, setting_data, homepage_seo] = yield Promise.all([
            (0, currentLocation_service_1.getLocationDetails)(locationId),
            category_schema_1.default
                .find({ status: true })
                .sort({ sorting: 1 })
                .select("name slug desktop_image mobile_image unique_id subdomain_slug")
                .lean(),
            setting_schema_2.default.findOne().lean(),
            homepage_seo_schema_1.default.findOne().lean(),
        ]);
        // Replace placeholders in all data at once
        const locationName = (current_location === null || current_location === void 0 ? void 0 : current_location.area_name) || (current_location === null || current_location === void 0 ? void 0 : current_location.city_name) || "Location";
        const replacements = {
            area: current_location === null || current_location === void 0 ? void 0 : current_location.area_name,
            city: current_location === null || current_location === void 0 ? void 0 : current_location.city_name,
            location: locationName,
            location1: locationName
        };
        const [home_page_content, page_title, meta_keywords, meta_description, meta_title,] = yield Promise.all([
            (0, ReplaceText_service_1.replacePlaceholders)((setting_data === null || setting_data === void 0 ? void 0 : setting_data.desktop_description) || "", replacements),
            (0, ReplaceText_service_1.replacePlaceholders)((homepage_seo === null || homepage_seo === void 0 ? void 0 : homepage_seo.page_title) || "Default Title", replacements),
            (0, ReplaceText_service_1.replacePlaceholders)((homepage_seo === null || homepage_seo === void 0 ? void 0 : homepage_seo.meta_keywords) || "Default keywords", replacements),
            (0, ReplaceText_service_1.replacePlaceholders)((homepage_seo === null || homepage_seo === void 0 ? void 0 : homepage_seo.meta_description) || "Default description", replacements),
            (0, ReplaceText_service_1.replacePlaceholders)((homepage_seo === null || homepage_seo === void 0 ? void 0 : homepage_seo.meta_title) || "Default Meta Title", replacements),
        ]);
        const locationSlug = (0, slugify_1.default)(locationName, { lower: true });
        // Build category data and URL quickly
        const category_result = home_page_category.map((category) => {
            const categorySlug = (0, slugify_1.default)(category.slug, { lower: true }); // Slugify category name
            const categoryImageBaseUrl = `${imageBaseUrl}/${category.desktop_image || "default.jpg"}`;
            const mobileImageBaseUrl = `${imageBaseUrl}/${category.mobile_image || "default.jpg"}`;
            // Return mapped data
            if ((setting_data === null || setting_data === void 0 ? void 0 : setting_data.category_box_links) == "regular") {
                return Object.assign(Object.assign({}, category), { desktop_image: category.desktop_image
                        ? categoryImageBaseUrl
                        : defaultImageUrl, mobile_image: category.mobile_image
                        ? mobileImageBaseUrl
                        : defaultImageUrl, current_url: `${baseUrl2}/${categorySlug}-${locationSlug}/${category.unique_id}` });
            }
            else {
                // Remove protocol (https://), split domain parts
                const urlObj = new URL(baseUrl2);
                const hostnameParts = urlObj.hostname.split(".");
                // Construct the subdomain URL
                const subdomainUrl = `https://${category.subdomain_slug}.${hostnameParts.join(".")}${urlObj.pathname}`;
                return Object.assign(Object.assign({}, category), { desktop_image: category.desktop_image
                        ? categoryImageBaseUrl
                        : defaultImageUrl, mobile_image: category.mobile_image
                        ? mobileImageBaseUrl
                        : defaultImageUrl, current_url: `${subdomainUrl}/${locationSlug}` });
            }
        });
        // // Generate schema
        // const schema = {
        //   '@context': 'https://schema.org',
        //   '@graph': [
        //     {
        //       '@type': 'WebPage',
        //       '@id': baseUrl, // Use your website's base URL
        //       name: page_title || 'Default Page Title',
        //       description: meta_description || 'Default description for homepage.',
        //       url: baseUrl, // URL of your home page
        //       mainEntityOfPage: baseUrl, // Points to the main entity of the page
        //     },
        //     {
        //       '@type': 'Organization',
        //       name: process.env.SITE_NAME || 'Default Organization Name',
        //       url: baseUrl,
        //       logo: `${baseUrl}/${setting_data?.website_logo || 'default-logo.png'}`,
        //       contactPoint: {
        //         '@type': 'ContactPoint',
        //         telephone: setting_data?.phone_number || '+1234567890',
        //         contactType: 'customer service',
        //         areaServed: 'Global', // Can be dynamic based on your location info
        //         availableLanguage: 'English',
        //       },
        //     },
        //     {
        //       '@type': 'BreadcrumbList',
        //       itemListElement: [
        //         {
        //           '@type': 'ListItem',
        //           position: 1,
        //           name: 'Home',
        //           item: baseUrl,
        //         },
        //         ...home_page_category.map((category, index) => ({
        //           '@type': 'ListItem',
        //           position: index + 2,
        //           name: category.name,
        //           item: `${baseUrl}/${category.slug}-${locationSlug}`, // Example category URL
        //         })),
        //       ],
        //     },
        //     {
        //       '@type': 'ItemList',
        //       name: 'Categories on Homepage',
        //       itemListElement: home_page_category.map((category) => ({
        //         '@type': 'ListItem',
        //         position: home_page_category.indexOf(category) + 1,
        //         item: {
        //           '@type': 'Thing',
        //           name: category.name,
        //           url: `${baseUrl}/${category.slug}-${locationSlug}`, // Example category URL
        //         },
        //       })),
        //     },
        //   ],
        // };
        // Response object
        const result = {
            home_page_category: category_result,
            current_location,
            homePage: home_page_content,
            title: page_title,
            meta_keywords,
            meta_description,
            meta_title,
        };
        console.timeEnd("Homepage Load");
        return callback(null, result);
    }
    catch (err) {
        console.error("Homepage Error:", err.message || err);
        return callback({
            success: false,
            message: "Failed to load homepage data",
            error: err.message || err,
        }, null);
    }
});
exports.homePageModels = homePageModels;
const frontendSettingModel = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (current_city_id = null, category_id = null) {
    try {
        if (!current_city_id) {
            const city = yield city_schema_2.default.findOne({
                name: process.env.DEFAULT_CITY,
            }).lean();
            current_city_id = city === null || city === void 0 ? void 0 : city._id.toString();
        }
        // Fetch settings and related data
        const settings = yield setting_schema_1.default.findOne()
            .populate({ path: "theme_id" })
            .exec();
        if (settings) {
            const baseURL = process.env.BASE_URL;
            // Function to check if an image exists and return its URL or a default image
            const getImageUrl = (imagePath) => {
                const imageFilePath = path.join(__dirname, "..", "..", "..", "..", "..", imagePath || "");
                const defaultImageUrl = `${baseURL}/uploads/default.jpg`;
                return fs.existsSync(imageFilePath)
                    ? `${baseURL}/${imagePath}`
                    : defaultImageUrl;
            };
            // Update settings with the appropriate image URLs
            if (settings.website_logo) {
                settings.website_logo = getImageUrl(settings.website_logo);
            }
            if (settings.mobile_logo) {
                settings.mobile_logo = getImageUrl(settings.mobile_logo);
            }
            if (settings.fav_icon) {
                settings.fav_icon = getImageUrl(settings.fav_icon);
            }
            if (settings.pre_loader) {
                settings.pre_loader = getImageUrl(settings.pre_loader);
            }
            if (settings.mobile_listing_banner) {
                settings.mobile_listing_banner = getImageUrl(settings.mobile_listing_banner);
            }
            if (settings.desktop_listing_banner) {
                settings.desktop_listing_banner = getImageUrl(settings.desktop_listing_banner);
            }
        }
        const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";
        const current_location = yield (0, currentLocation_service_1.getLocationDetails)(current_city_id);
        const result = {
            success: true,
            site_data: settings || {},
            current_location: current_location,
        };
        return result;
    }
    catch (error) {
        console.error("Error fetching frontend settings:", error);
        return {
            success: false,
            message: "Failed to fetch frontend settings.",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
});
exports.frontendSettingModel = frontendSettingModel;
const frontendFooterModel = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (current_city_id = null, category_id = null) {
    try {
        const mumbai_data_name = yield city_schema_1.default
            .findOne({
            name: "Mumbai",
        })
            .lean();
        const navi_mumbai_name = yield city_schema_1.default
            .findOne({
            name: "Navi Mumbai",
        })
            .lean();
        const thane_name = yield city_schema_1.default
            .findOne({
            name: "Thane",
        })
            .lean();
        if (!current_city_id) {
            current_city_id = mumbai_data_name === null || mumbai_data_name === void 0 ? void 0 : mumbai_data_name._id;
        }
        const cityFilters = {
            mumbai: mumbai_data_name === null || mumbai_data_name === void 0 ? void 0 : mumbai_data_name.unique_id,
            navi_mumbai: navi_mumbai_name === null || navi_mumbai_name === void 0 ? void 0 : navi_mumbai_name.unique_id,
            thane: thane_name === null || thane_name === void 0 ? void 0 : thane_name.unique_id,
        };
        let category_data = null;
        if (category_id != "" &&
            mongoose_1.default.Types.ObjectId.isValid(category_id)) {
            category_data = yield category_schema_1.default
                .findOne({ _id: new mongoose_1.default.Types.ObjectId(category_id) })
                .lean();
        }
        if (!category_data) {
            category_data = yield category_schema_1.default
                .findOne({ name: "Laptop Rental" })
                .lean();
        }
        if (!category_data) {
            const randomCategory = yield category_schema_1.default.aggregate([
                { $sample: { size: 1 } },
            ]);
            category_data = randomCategory[0] || null;
        }
        const [category_list, blog_category_list] = yield Promise.all([
            category_schema_1.default.find({ status: true }).sort({ sorting: 1 }).lean(),
            blogcategory_schema_1.default.find().lean(),
        ]);
        if (!category_data)
            throw new Error("Category data not found");
        const buildAreaWithUrl = (cityId) => __awaiter(void 0, void 0, void 0, function* () {
            return yield area_schema_1.default.find({ city_id: cityId }).lean();
        });
        // Parallel fetching for areas and keywords
        const [mumbai_data, navi_mumbai, thane, keywords] = yield Promise.all([
            buildAreaWithUrl(cityFilters.mumbai),
            buildAreaWithUrl(cityFilters.navi_mumbai),
            buildAreaWithUrl(cityFilters.thane),
            keywords_schema_1.default.find({}).lean(),
        ]);
        return {
            success: true,
            mumbai_data,
            navi_mumbai,
            thane,
            category_list,
            blog_category_list,
            category_data,
            keywordsdata: keywords.map((item) => item.words),
        };
    }
    catch (error) {
        console.error("Error fetching frontend settings:", error);
        return {
            success: false,
            message: "Failed to fetch frontend settings.",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
});
exports.frontendFooterModel = frontendFooterModel;
const frontendAdsModel = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (current_city_id = null, category_id = null) {
    try {
        if (!current_city_id) {
            const current_location_data = yield city_schema_2.default.findOne({
                name: process.env.DEFAULT_CITY,
            }).lean();
            current_city_id = current_location_data === null || current_location_data === void 0 ? void 0 : current_location_data._id.toString();
        }
        const category_list = yield category_schema_1.default
            .find({ status: true })
            .sort({ sorting: 1 })
            .lean();
        const blog_category_list = yield blogcategory_schema_1.default.find().lean();
        const current_location = yield (0, currentLocation_service_1.getLocationDetails)(current_city_id);
        // Add error handling with try-catch for each banner fetch
        const bannerTypes = [
            "header_bottom",
            "left_side_banner",
            "footer_bottom",
            "chat_boat",
            "category_listing",
            "after_blog_image",
            "blog_paragraphs",
        ];
        const bannerResults = yield Promise.allSettled(bannerTypes.map(type => (0, banners_service_1.default)(category_id, current_location, type)));
        // Extract results safely
        const extractBannerResult = (result) => {
            var _a;
            if (result.status === "fulfilled") {
                return ((_a = result.value) === null || _a === void 0 ? void 0 : _a.randomBanner) || null;
            }
            console.error("Banner fetch failed:", result.reason);
            return null;
        };
        const [ad_header_banners_data, ad_sidebar_banners_data, ad_footer_banners_data, ad_chatboat_banners_data, ad_listing_banners_data, ad_after_blog_image_banners_data, ad_blog_paragraphs_banners_data,] = bannerResults.map(extractBannerResult);
        const result = {
            success: true,
            category_list,
            blog_category_list,
            ad_header_banners_data,
            ad_sidebar_banners_data,
            ad_footer_banners_data,
            ad_chatboat_banners_data,
            ad_listing_banners_data,
            ad_after_blog_image_banners_data,
            ad_blog_paragraphs_banners_data
        };
        return result;
    }
    catch (error) {
        console.error("Error fetching frontend ads:", error);
        return {
            success: false,
            message: "Failed to fetch frontend ads.",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
});
exports.frontendAdsModel = frontendAdsModel;
const getPremiumRequestList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { first_name: { $regex: search, $options: "i" } },
                    { last_name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone_number: { $regex: search, $options: "i" } },
                    { subject: { $regex: search, $options: "i" } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield premiumRequest_schema_1.default
            .find(searchQuery)
            .skip(skip)
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
        const totalUsers = yield premiumRequest_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) { }
});
exports.getPremiumRequestList = getPremiumRequestList;
const userActionActivityListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { module_name: { $regex: search, $options: "i" } },
                    { action_type: { $regex: search, $options: "i" } },
                    { message: { $regex: search, $options: "i" } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield userActionActivity_schema_1.default
            .find(searchQuery)
            .populate({ path: "user_id", select: "name" })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield userActionActivity_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) { }
});
exports.userActionActivityListModel = userActionActivityListModel;
const updateSettingModel = (settingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingSetting = yield setting_schema_1.default.findOne();
        cache.del("frontendSettings"); // Invalidate cache
        if (existingSetting) {
            const updatedSetting = yield setting_schema_1.default.findByIdAndUpdate(existingSetting._id, settingData, { new: true });
            return callback(null, { updatedSetting });
        }
        else {
            const newSetting = new setting_schema_1.default(settingData);
            yield newSetting.save();
            return callback(null, { newSetting });
        }
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.updateSettingModel = updateSettingModel;
const getExportTasksByModuleName = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                module_name: { $regex: search, $options: "i" },
            }
            : {};
        const skip = (page - 1) * limit;
        const [lists, totalLists] = yield Promise.all([
            exportTask_schema_1.default
                .find(searchQuery)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            exportTask_schema_1.default.countDocuments(searchQuery),
        ]);
        return {
            data: lists,
            totalLists,
            totalPages: Math.ceil(totalLists / limit),
            currentPage: page,
        };
    }
    catch (error) {
        console.error("Error fetching export tasks:", error);
        throw new Error("Error fetching export tasks");
    }
});
exports.getExportTasksByModuleName = getExportTasksByModuleName;
//# sourceMappingURL=setting.model.js.map