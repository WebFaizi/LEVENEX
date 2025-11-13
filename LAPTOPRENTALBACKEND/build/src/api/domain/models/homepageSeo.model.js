"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.updateHomepageSeoModel = exports.serverSideMetaDetailsModel = exports.extractCategoryAndLocation = void 0;
const homepage_seo_schema_1 = __importDefault(require("../schema/homepage_seo.schema"));
const setting_schema_1 = __importDefault(require("../schema/setting.schema"));
const category_schema_1 = __importDefault(require("../schema/category.schema"));
const city_schema_1 = __importDefault(require("../schema/city.schema"));
const area_schema_1 = __importDefault(require("../schema/area.schema"));
const jobCategory_schema_1 = __importDefault(require("../schema/jobCategory.schema"));
const blog_schema_1 = __importDefault(require("../schema/blog.schema"));
const jobs_schema_1 = __importDefault(require("../schema/jobs.schema"));
const ReplaceText_service_1 = require("../../services/ReplaceText.service");
const currentLocation_service_1 = __importStar(require("../../services/currentLocation.service"));
const categoryDetails_service_1 = require("../../services/categoryDetails.service");
const categorySeoDetails_service_1 = require("../../services/categorySeoDetails.service");
const productListById_service_1 = require("../../services/productListById.service");
const getLocationDetailsByName_service_1 = require("../../services/getLocationDetailsByName.service");
const listingDetailsData_service_1 = require("../../services/listingDetailsData.service");
const extractCategoryAndLocation = (url_slug) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url_slug || typeof url_slug !== "string") {
        throw new Error("Invalid slug provided");
    }
    let category = null;
    let category_unique_id = null;
    let location = null;
    const parts = url_slug.split("-");
    for (let i = parts.length; i > 0; i--) {
        const possibleCategorySlug = parts.slice(0, i).join("-");
        let possibleLocationSlug = parts.slice(i).join("-");
        const categoryCheck = yield category_schema_1.default.findOne({ slug: possibleCategorySlug }).lean();
        if (categoryCheck) {
            category = categoryCheck._id;
            category_unique_id = categoryCheck.unique_id;
            possibleLocationSlug = possibleLocationSlug.replace(/-/g, " ");
            location =
                (yield city_schema_1.default.findOne({ name: { $regex: new RegExp(`^${possibleLocationSlug}$`, "i") } }).lean()) ||
                    (yield area_schema_1.default.findOne({ name: { $regex: new RegExp(`^${possibleLocationSlug}$`, "i") } }).lean());
            if (location) {
                location = location._id;
            }
            break;
        }
    }
    return { category, location, category_unique_id };
});
exports.extractCategoryAndLocation = extractCategoryAndLocation;
const serverSideMetaDetailsModel = (serverSideMetaData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const common_settingData = setting_schema_1.default.findOne();
        let current_location = yield (0, currentLocation_service_1.getDefaultLoactionDetails)();
        const { type, slug, current_url } = serverSideMetaData;
        let meta_details = {};
        const generateMeta = (data, image = "", location) => ({
            page_title: (0, ReplaceText_service_1.replacePlaceholders)((data === null || data === void 0 ? void 0 : data.page_title) || "Homepage", location),
            meta_title: (0, ReplaceText_service_1.replacePlaceholders)((data === null || data === void 0 ? void 0 : data.meta_title) || "Homepage", location),
            meta_description: (0, ReplaceText_service_1.replacePlaceholders)((data === null || data === void 0 ? void 0 : data.meta_description) || "Homepage", location),
            meta_keywords: (0, ReplaceText_service_1.replacePlaceholders)((data === null || data === void 0 ? void 0 : data.meta_keywords) || "Homepage", location),
            ogTitle: (0, ReplaceText_service_1.replacePlaceholders)((data === null || data === void 0 ? void 0 : data.meta_title) || "Homepage", location),
            ogDescription: (0, ReplaceText_service_1.replacePlaceholders)((data === null || data === void 0 ? void 0 : data.meta_description) || "Homepage", location),
            ogImage: image,
            canonical: current_url || "",
        });
        if (type === "homepage") {
            const replacements_location = {
                area: (current_location === null || current_location === void 0 ? void 0 : current_location.area_name) || "",
                city: (current_location === null || current_location === void 0 ? void 0 : current_location.city_name) || "",
                location: (current_location === null || current_location === void 0 ? void 0 : current_location.area_name) || (current_location === null || current_location === void 0 ? void 0 : current_location.city_name) || "",
                location1: (current_location === null || current_location === void 0 ? void 0 : current_location.area_name) || (current_location === null || current_location === void 0 ? void 0 : current_location.city_name) || ""
            };
            const [existingdata, settingData] = yield Promise.all([homepage_seo_schema_1.default.findOne(), setting_schema_1.default.findOne()]);
            meta_details = generateMeta(existingdata, (settingData === null || settingData === void 0 ? void 0 : settingData.website_logo) ? `${process.env.BASE_URL}/${settingData === null || settingData === void 0 ? void 0 : settingData.website_logo}` : "", replacements_location);
        }
        else if (type === "slug") {
            if (slug.includes("/") && !slug.startsWith("product-list-") && !slug.startsWith("pro-") && !slug.includes("-jobs-in-") && !slug.includes("jobs-")) {
                const [categorySlug] = slug.split("/");
                const { category, location, category_unique_id } = yield (0, exports.extractCategoryAndLocation)(categorySlug);
                let current_location = {};
                current_location = location ? yield (0, currentLocation_service_1.default)(location) : "mumbai";
                let category_details = {};
                let category_seo_details = {};
                [category_seo_details, category_details] = yield Promise.all([
                    (0, categorySeoDetails_service_1.getCategorySeoDetails)(category_unique_id, 1, current_location),
                    (0, categoryDetails_service_1.getCategoryDetails)(category, 1, current_location),
                ]);
                meta_details = generateMeta(category_seo_details, category_details === null || category_details === void 0 ? void 0 : category_details.desktop_image, current_location);
            }
            else if (slug.startsWith("pro-")) {
                const slugParts = slug.split("-");
                const lastPart = slugParts[slugParts.length - 1];
                if (/^\d+$/.test(lastPart)) {
                    const product_id = parseInt(lastPart);
                    const product_details = yield (0, productListById_service_1.getProductById)(product_id);
                    if (!product_details)
                        return; // Early return on failure
                    const product_data = product_details.product_listing_id;
                    const seo_object = {
                        page_title: (product_data === null || product_data === void 0 ? void 0 : product_data.product_name) || "Default Title",
                        meta_title: (product_data === null || product_data === void 0 ? void 0 : product_data.product_name) || "Default Meta Title",
                        meta_description: (product_data === null || product_data === void 0 ? void 0 : product_data.meta_description) || "Default Meta Description",
                        meta_keywords: (product_data === null || product_data === void 0 ? void 0 : product_data.product_description) || "",
                    };
                    const replacements_location = {
                        area: (current_location === null || current_location === void 0 ? void 0 : current_location.area_name) || "",
                        city: (current_location === null || current_location === void 0 ? void 0 : current_location.city_name) || "",
                        location: (current_location === null || current_location === void 0 ? void 0 : current_location.area_name) || (current_location === null || current_location === void 0 ? void 0 : current_location.city_name) || "",
                        location1: (current_location === null || current_location === void 0 ? void 0 : current_location.area_name) || (current_location === null || current_location === void 0 ? void 0 : current_location.city_name) || "",
                    };
                    const imageBaseUrl = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.laptoprental.co";
                    meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.desktop_image) ? `${imageBaseUrl}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.desktop_image}` : "", replacements_location);
                }
            }
            else if (typeof slug == "string" && slug.includes("product-list-")) {
                const [categorySlug, category_id] = slug.replace("product-list-", "").split("/");
                const category_details = yield category_schema_1.default.findOne({ unique_id: category_id }).lean();
                let current_location = {};
                let location = "mumbai";
                current_location = location ? yield (0, currentLocation_service_1.default)(location) : "mumbai";
                const product_seo = yield (0, categorySeoDetails_service_1.getCategorySeoDetails)(category_details === null || category_details === void 0 ? void 0 : category_details.unique_id, 1, current_location);
                const seo_object = {
                    page_title: (product_seo === null || product_seo === void 0 ? void 0 : product_seo.product_title) || "Default Title",
                    meta_title: (product_seo === null || product_seo === void 0 ? void 0 : product_seo.product_title) || "Default Meta Title",
                    meta_description: (product_seo === null || product_seo === void 0 ? void 0 : product_seo.product_meta_description) || "Default Meta Description",
                    meta_keywords: (product_seo === null || product_seo === void 0 ? void 0 : product_seo.product_meta_keywords) || "",
                };
                const imageBaseUrl2 = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.laptoprental.co";
                meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.desktop_image) ? `${imageBaseUrl2}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.desktop_image}` : "", current_location);
            }
            else if (typeof slug == "string" && slug.includes("-jobs-in-")) {
                const [categorySlug, category_id] = slug.split("/");
                const parts = categorySlug.split("jobs-in-");
                const converted_location = parts.length > 1 ? parts[1] : "";
                const current_location = converted_location.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
                const location_details = yield (0, getLocationDetailsByName_service_1.getLocationDetailsByName)(current_location);
                if (/^\d+$/.test(category_id)) {
                    let current_location_string;
                    if (location_details.area_name) {
                        current_location_string = location_details.area_name;
                    }
                    else {
                        current_location_string = location_details.city_name;
                    }
                }
                const category_details = yield jobCategory_schema_1.default.findOne({
                    unique_id: Number(category_id),
                });
                if (category_details) {
                    const seo_object = {
                        page_title: (category_details === null || category_details === void 0 ? void 0 : category_details.name) || "Default Title",
                        meta_title: (category_details === null || category_details === void 0 ? void 0 : category_details.name) || "Default Meta Title",
                        meta_description: (category_details === null || category_details === void 0 ? void 0 : category_details.name) || "Default Meta Description",
                        meta_keywords: (category_details === null || category_details === void 0 ? void 0 : category_details.name) || "",
                    };
                    const ogImage = (_a = common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.desktop_image) !== null && _a !== void 0 ? _a : "";
                    meta_details = generateMeta(seo_object, ogImage ? `${process.env.BASE_URL}/${ogImage}` : "", location_details);
                }
            }
            else if (typeof slug == "string" && slug.includes("jobs-")) {
                const slugParts = slug.split("-");
                const jobId = slugParts[slugParts.length - 1];
                const find_location = yield extractLocationFromSlug(slug);
                const current_location = yield (0, getLocationDetailsByName_service_1.getLocationDetailsByName)(find_location);
                const job_detail = yield jobs_schema_1.default.findOne({ unique_id: jobId }).populate("job_category_id").lean();
                const seo_object = {
                    page_title: (job_detail === null || job_detail === void 0 ? void 0 : job_detail.job_title) || "Default Title",
                    meta_title: (job_detail === null || job_detail === void 0 ? void 0 : job_detail.meta_title) || "Default Meta Title",
                    meta_description: (job_detail === null || job_detail === void 0 ? void 0 : job_detail.meta_description) || "Default Meta Description",
                    meta_keywords: ((_b = job_detail === null || job_detail === void 0 ? void 0 : job_detail.keywords_tag) === null || _b === void 0 ? void 0 : _b.join(", ")) || "",
                };
                const ogImage = (_c = common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.desktop_image) !== null && _c !== void 0 ? _c : "";
                meta_details = generateMeta(seo_object, ogImage ? `${process.env.BASE_URL}/${ogImage}` : "", current_location);
            }
            else if (slug.includes("-")) {
                const slugParts = slug.split("-");
                const lastPart = slugParts[slugParts.length - 1];
                if (/^\d+$/.test(lastPart)) {
                    const listing_id = parseInt(lastPart);
                    let listing_details = {};
                    listing_details = yield (0, listingDetailsData_service_1.getListingDetailsData)(listing_id);
                    const seo_object = {
                        page_title: (listing_details === null || listing_details === void 0 ? void 0 : listing_details.name) || "Default Title",
                        meta_title: (listing_details === null || listing_details === void 0 ? void 0 : listing_details.name) || "Default Meta Title",
                        meta_description: (listing_details === null || listing_details === void 0 ? void 0 : listing_details.description) || "Default Meta Description",
                        meta_keywords: (listing_details === null || listing_details === void 0 ? void 0 : listing_details.name) || "",
                    };
                    const ogImage = (_d = listing_details === null || listing_details === void 0 ? void 0 : listing_details.listig_image_url) !== null && _d !== void 0 ? _d : "";
                    meta_details = generateMeta(seo_object, ogImage ? `${process.env.BASE_URL}/${ogImage}` : "", current_location);
                }
            }
        }
        else if (type === "static_page") {
            if (slug === "about-us") {
                const seo_object = {
                    page_title: "About Us - Your Go-To Rental Platform",
                    meta_title: "About Us | Trusted Rental Marketplace for Category-Wise Product Rentals",
                    meta_description: "Learn more about our mission, team, and how we simplify renting products across categories like electronics, furniture, vehicles, and more. Discover why thousands trust us for reliable rentals.",
                    meta_keywords: "about rental website, product rental service, rent electronics, rent furniture, category-wise rentals, rental platform",
                };
                meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo) ? `${process.env.BASE_URL}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo}` : "", current_location);
            }
            else if (slug === "terms-and-conditions") {
                const seo_object = {
                    page_title: "Terms and Conditions - Rental Service Policies",
                    meta_title: "Terms and Conditions | Rules for Using Our Rental Services",
                    meta_description: "Read the terms and conditions that govern your use of our rental platform. Understand your rights, responsibilities, and the policies for renting products securely and fairly.",
                    meta_keywords: "rental terms, rental conditions, product rental policies, rental agreement, rental service rules",
                };
                meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo) ? `${process.env.BASE_URL}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo}` : "", current_location);
            }
            else if (slug === "privacy-policy") {
                const seo_object = {
                    page_title: "Privacy Policy - Your Data Is Safe With Us",
                    meta_title: "Privacy Policy | How We Protect Your Information",
                    meta_description: "Read our privacy policy to understand how we collect, use, and safeguard your personal information when you use our rental services. Your data privacy and security are our priority.",
                    meta_keywords: "privacy policy, rental website privacy, data protection, user data policy, information security",
                };
                meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo) ? `${process.env.BASE_URL}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo}` : "", current_location);
            }
            else if (slug === "contact-us") {
                const seo_object = {
                    page_title: "Contact Us - We're Here to Help",
                    meta_title: "Contact Us | Get in Touch with Our Rental Support Team",
                    meta_description: "Have questions or need help with a rental? Contact our support team for quick assistance. We’re here to help you with product inquiries, bookings, and more.",
                    meta_keywords: "contact rental service, rental support, get in touch, product rental help, customer service",
                };
                meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo) ? `${process.env.BASE_URL}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo}` : "", current_location);
            }
            else if (slug === "login") {
                const seo_object = {
                    page_title: "Login - Manage or List Your Rental Products",
                    meta_title: "Login | Access Your Rental Account or List Your Product",
                    meta_description: "Login to your account to manage rentals, add new product listings, and connect with users looking to rent. Secure access to your rental dashboard starts here.",
                    meta_keywords: "login rental account, list product for rent, user dashboard, rental login, manage rental listings",
                };
                meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo) ? `${process.env.BASE_URL}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo}` : "", current_location);
            }
            else if (slug === "register") {
                const seo_object = {
                    page_title: "Register - Start Renting or Listing Products",
                    meta_title: "Register | Create Your Rental Account and Start Listing",
                    meta_description: "Sign up now to create your rental account, list products for rent, and manage your bookings. Join our rental community and start earning today.",
                    meta_keywords: "register rental account, sign up rental site, list for rent, create rental profile, start renting",
                };
                meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo) ? `${process.env.BASE_URL}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.website_logo}` : "", current_location);
            }
        }
        else if (type === "blog") {
            if (slug == "blog_listing") {
                const seo_object = {
                    page_title: "Blog - Renting Tips and Insights",
                    meta_title: "Blog | Latest Articles and Tips for Renting Products",
                    meta_description: "Explore our latest blog posts featuring tips, guides, and insights about renting products across categories like furniture, electronics, vehicles, and more.",
                    meta_keywords: "blog, rental tips, product rental articles, renting advice, rental industry blog, rental guides",
                };
                const imageBaseUrl3 = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.latoprental.co";
                meta_details = generateMeta(seo_object, (common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.desktop_image) ? `${imageBaseUrl3}/${common_settingData === null || common_settingData === void 0 ? void 0 : common_settingData.desktop_image}` : "", current_location);
            }
            else {
                const BlogDetails = yield blog_schema_1.default.findOne({ _id: slug });
                if (!BlogDetails)
                    return; // Early return on failure
                const seo_object = {
                    page_title: BlogDetails.blog_title,
                    meta_title: BlogDetails.blog_title,
                    meta_description: BlogDetails.content,
                    meta_keywords: "",
                };
                const image = BlogDetails.images;
                meta_details = generateMeta(seo_object, image ? `${process.env.BASE_URL}/${image}` : "", current_location);
            }
        }
        else {
            meta_details = {
                title: "Default Title",
                description: "Default description",
                keywords: "default,keywords",
                ogTitle: "Default OG Title",
                ogDescription: "Default OG Description",
                ogImage: `${process.env.BASE_URL}/default-image-url.jpg`,
                canonical: current_url || "",
            };
        }
        callback(null, meta_details);
    }
    catch (error) {
        callback(error, null);
    }
});
exports.serverSideMetaDetailsModel = serverSideMetaDetailsModel;
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
const updateHomepageSeoModel = (homepageSeoData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingdata = yield homepage_seo_schema_1.default.findOne();
        if (existingdata) {
            const updateddata = yield homepage_seo_schema_1.default.findByIdAndUpdate(existingdata._id, homepageSeoData, { new: true });
            return callback(null, { updateddata });
        }
        else {
            const newhomepageSeo = new homepage_seo_schema_1.default(homepageSeoData);
            yield newhomepageSeo.save();
            return callback(null, { newhomepageSeo });
        }
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.updateHomepageSeoModel = updateHomepageSeoModel;
//# sourceMappingURL=homepageSeo.model.js.map