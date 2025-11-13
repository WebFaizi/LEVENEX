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
exports.listingSlugWiseResponse = exports.storePremiumRequestModel = exports.generateFrontendSitemapUrl = exports.storeCategorySearchCountModel = exports.categoriesTopListing = exports.categorySearchCountListModel = void 0;
const category_schema_1 = __importDefault(require("../schema/category.schema"));
const city_schema_1 = __importDefault(require("../schema/city.schema"));
const area_schema_1 = __importDefault(require("../schema/area.schema"));
const premiumRequest_schema_1 = __importDefault(require("../schema/premiumRequest.schema"));
const categorySearch_schema_1 = __importDefault(require("../schema/categorySearch.schema"));
/**
 * Convert a string into a URL-friendly slug
 */
const slugify = (text) => text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^a-z0-9\-]/g, "") // Remove all non-alphanumeric and -
    .replace(/-+/g, "-"); // Replace multiple - with single -
/**
 * Generate a paginated slice of sitemap entries for category + location combinations,
 * without building the full list in memory.
 * @param page - 1-based page number of the slice
 * @param limit - number of entries per page
 * @returns Array of SitemapEntry objects for the given page
 */
const categorySearchCountListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const skip = (page - 1) * limit;
        // Search match condition
        const matchStage = [];
        if (search) {
            matchStage.push({
                $match: {
                    "category.name": { $regex: search, $options: "i" },
                },
            });
        }
        const pipeline = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            ...matchStage,
            {
                $group: {
                    _id: {
                        category_id: "$category._id",
                        name: "$category.name",
                        slug: "$category.slug",
                        unique_id: "$category.unique_id",
                        image: "$category.image",
                        year: { $year: "$search_date" },
                        month: { $month: "$search_date" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    category_id: "$_id.category_id",
                    category_name: "$_id.name",
                    slug: "$_id.slug",
                    unique_id: "$_id.unique_id",
                    image: "$_id.image",
                    count: 1,
                    formatted_month: {
                        $concat: [
                            {
                                $arrayElemAt: [
                                    [
                                        "",
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December",
                                    ],
                                    "$_id.month",
                                ],
                            },
                            ", ",
                            { $toString: "$_id.year" },
                        ],
                    },
                },
            },
            { $sort: { count: -1, formatted_month: -1, category_name: 1 } },
            { $skip: skip },
            { $limit: limit },
        ];
        // Count pipeline (for pagination)
        const countPipeline = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            ...matchStage,
            {
                $group: {
                    _id: {
                        category_id: "$category._id",
                        year: { $year: "$search_date" },
                        month: { $month: "$search_date" },
                    },
                },
            },
            { $count: "total" },
        ];
        const [results, countResult] = yield Promise.all([
            categorySearch_schema_1.default.aggregate(pipeline),
            categorySearch_schema_1.default.aggregate(countPipeline),
        ]);
        const totalCategories = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        return {
            data: results,
            totalCategories,
            totalPages: Math.ceil(totalCategories / limit),
            currentPage: page,
        };
    }
    catch (error) {
        console.error("Error in categorySearchCountListModel:", error);
        throw new Error("Error fetching month-wise category search count");
    }
});
exports.categorySearchCountListModel = categorySearchCountListModel;
const categoriesTopListing = () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const pipeline = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: {
                        category_id: "$category._id",
                        name: "$category.name",
                        slug: "$category.slug",
                        unique_id: "$category.unique_id",
                        image: "$category.image",
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    category_id: "$_id.category_id",
                    category_name: "$_id.name",
                    slug: "$_id.slug",
                    unique_id: "$_id.unique_id",
                    image: "$_id.image",
                    count: 1,
                },
            },
            { $sort: { count: -1, category_name: 1 } },
            { $limit: 15 },
        ];
        // Count pipeline (for pagination)
        const countPipeline = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category._id",
                },
            },
            { $count: "total" },
        ];
        const [results, countResult] = yield Promise.all([
            categorySearch_schema_1.default.aggregate(pipeline),
            categorySearch_schema_1.default.aggregate(countPipeline),
        ]);
        const totalCategories = ((_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
        return {
            data: results,
            totalCategories,
        };
    }
    catch (error) {
        console.error("Error in categorySearchCountListModel:", error);
        throw new Error("Error fetching month-wise category search count");
    }
});
exports.categoriesTopListing = categoriesTopListing;
const storeCategorySearchCountModel = (categoryId, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield category_schema_1.default
            .findOne({ unique_id: categoryId })
            .lean();
        if (!category) {
            return callback(new Error("Category not found"), null);
        }
        const today = new Date();
        const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const newSearch = new categorySearch_schema_1.default({
            category_id: category._id,
            search_date: dateOnly,
        });
        const savedEntry = yield newSearch.save();
        return callback(null, savedEntry);
    }
    catch (error) {
        console.error("Error storing category search count:", error);
        return callback(error, null);
    }
});
exports.storeCategorySearchCountModel = storeCategorySearchCountModel;
const generateFrontendSitemapUrl = (page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all categories, cities, and areas
        const [categories, cities, areas] = yield Promise.all([
            category_schema_1.default.find().lean(),
            city_schema_1.default.find().select("name").lean(),
            area_schema_1.default.find().select("name").lean(),
        ]);
        const basePath = process.env.BASE_URL_TWO || "basedd";
        // Build locations array
        const locations = [
            ...cities.map((c) => c.name),
            ...areas.map((a) => a.name),
        ];
        const catCount = categories.length;
        const locCount = locations.length;
        const totalCombinations = catCount * locCount;
        const totalPages = Math.ceil(totalCombinations / limit);
        // Calculate start and end index
        const startIdx = (page - 1) * limit;
        if (startIdx >= totalCombinations) {
            return {
                entries: [],
                totalPages,
                currentPage: page,
                totalUrls: totalCombinations,
            };
        }
        const endIdx = Math.min(startIdx + limit, totalCombinations);
        const entries = [];
        // Generate only the required slice
        for (let idx = startIdx; idx < endIdx; idx++) {
            const catIndex = Math.floor(idx / locCount);
            const locIndex = idx % locCount;
            const cat = categories[catIndex];
            const loc = locations[locIndex];
            const catSlug = slugify(cat.slug);
            const locSlug = slugify(loc);
            const title = `${cat.name} in ${loc}`;
            const url = `${basePath}/${catSlug}-${locSlug}/1`;
            entries.push({ title, url });
        }
        return {
            entries,
            totalPages,
            currentPage: page,
            totalUrls: totalCombinations,
        };
    }
    catch (error) {
        console.error("Error generating paginated sitemap URLs:", error);
        throw error;
    }
});
exports.generateFrontendSitemapUrl = generateFrontendSitemapUrl;
const storePremiumRequestModel = (premiumDetails, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newBlog = new premiumRequest_schema_1.default({
            first_name: premiumDetails.first_name,
            last_name: premiumDetails.last_name,
            email: premiumDetails.email,
            phone_number: premiumDetails.phone_number,
            subject: premiumDetails.subject,
        });
        const savedBlog = yield newBlog.save();
        return callback(null, { savedBlog });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.storePremiumRequestModel = storePremiumRequestModel;
const listingSlugWiseResponse = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { slug: { $regex: search, $options: "i" } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield category_schema_1.default
            .find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield category_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) {
        // return callback(error, null);
    }
});
exports.listingSlugWiseResponse = listingSlugWiseResponse;
//# sourceMappingURL=frontend.model.js.map