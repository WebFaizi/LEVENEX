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
exports.storeFrontendListingReview = exports.storeFrontendBlogReview = exports.frontendBlogDetails = exports.frontendBlogList = exports.updateBlogModel = exports.blogDetail = exports.storeBlogModel = exports.blogList = exports.blogReviewList = exports.importBlogReviewDataModel = exports.getAllBlogModel = exports.storeBlogReviewModel = exports.BlogWiseReviewList = void 0;
const blog_schema_1 = __importDefault(require("../schema/blog.schema"));
const user_schema_1 = __importDefault(require("../schema/user.schema"));
const blogReview_schema_1 = __importDefault(require("../schema/blogReview.schema"));
const listingReview_schema_1 = __importDefault(require("../schema/listingReview.schema"));
const node_cache_1 = __importDefault(require("node-cache"));
const slugify_1 = __importDefault(require("slugify"));
const mongoose_1 = __importDefault(require("mongoose"));
const banners_service_1 = __importDefault(require("../../services/banners.service"));
const cache = new node_cache_1.default({ stdTTL: 300 }); // TTL = 300 seconds = 5 minutes
exports.default = cache;
const BlogWiseReviewList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingObjectId = new mongoose_1.default.Types.ObjectId(search);
        const searchQuery = { blog_id: listingObjectId, isApproved: true };
        const skip = (page - 1) * limit;
        // Fetch paginated reviews
        const users = yield blogReview_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .populate('user_id')
            .lean();
        // Count total reviews
        const totalUsers = yield blogReview_schema_1.default.countDocuments(searchQuery);
        // Aggregate to get rating distribution
        const ratingStats = yield blogReview_schema_1.default.aggregate([
            { $match: { blog_id: listingObjectId } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);
        // Initialize and calculate breakdown
        let totalRating = 0;
        let ratingCount = 0;
        const ratingDistribution = {
            1: { count: 0, percent: 0 },
            2: { count: 0, percent: 0 },
            3: { count: 0, percent: 0 },
            4: { count: 0, percent: 0 },
            5: { count: 0, percent: 0 },
        };
        for (const stat of ratingStats) {
            const rating = stat._id;
            const count = stat.count;
            if (ratingDistribution[rating] !== undefined) {
                ratingDistribution[rating].count = count;
                totalRating += rating * count;
                ratingCount += count;
            }
        }
        // Percent calculation
        if (ratingCount > 0) {
            for (let i = 1; i <= 5; i++) {
                ratingDistribution[i].percent = parseFloat(((ratingDistribution[i].count / ratingCount) * 100).toFixed(2));
            }
        }
        const averageRating = ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(2)) : 0;
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            averageRating,
            ratingBreakdown: ratingDistribution,
        };
    }
    catch (error) {
        console.error('Error in BlogReviewSchema:', error);
        return {
            data: [],
            totalUsers: 0,
            totalPages: 0,
            currentPage: page,
            averageRating: 0,
            ratingBreakdown: {},
            message: 'Something went wrong',
        };
    }
});
exports.BlogWiseReviewList = BlogWiseReviewList;
const storeBlogReviewModel = (userDetails, blogData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newBlog = new blogReview_schema_1.default({
            blog_id: blogData.blog_id,
            user_id: blogData.user_id,
            rating: blogData.rating,
            comment: blogData.comment,
            isApproved: true,
        });
        const savedBlog = yield newBlog.save();
        // await storeUserActionActivity(userDetails.userId, "BLog", "Create", `Craete new reviewo for blog`)
        return callback(null, { savedBlog });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.storeBlogReviewModel = storeBlogReviewModel;
const getAllBlogModel = (search) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const users = yield blog_schema_1.default.find(searchQuery)
            .exec();
        return {
            data: users,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.getAllBlogModel = getAllBlogModel;
const importBlogReviewDataModel = (userDetails, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transformedData = yield Promise.all(listingData.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const listing = yield blog_schema_1.default.findOne({ blog_title: item.blog_name });
            const user = yield user_schema_1.default.findOne({ name: item.user_name });
            if (!listing || !user) {
                console.warn(`Skipping row: Blog or User not found for ${item.blog_name}, ${item.user_name}`);
                return null; // Skip this entry
            }
            return {
                blog_id: listing._id,
                user_id: user._id,
                rating: item.rating,
                comment: item.comment
            };
        })));
        yield blogReview_schema_1.default.insertMany(transformedData);
        // await storeUserActionActivity(userDetails.userId, "BLog Review", "Import", `Import Successfully Import blog review`)
        return callback(null, transformedData);
    }
    catch (error) {
        console.error("Error updating listing:", error);
        return callback(error, null);
    }
});
exports.importBlogReviewDataModel = importBlogReviewDataModel;
const blogReviewList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield blogReview_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .populate('blog_id user_id')
            .exec();
        const totalUsers = yield blogReview_schema_1.default.countDocuments(searchQuery);
        blogReview_schema_1.default;
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
exports.blogReviewList = blogReviewList;
const blogList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield blog_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield blog_schema_1.default.countDocuments(searchQuery);
        blog_schema_1.default;
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
exports.blogList = blogList;
const storeBlogModel = (userDetails, blogData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug_data = (0, slugify_1.default)(blogData.blog_title, { lower: true, strict: true });
        const existingBlog = yield blog_schema_1.default.findOne({ slug: slug_data });
        if (existingBlog) {
            return callback({ message: "Blog with this title already exists!", status: 409 }, null);
        }
        const categoryObjectIds = Array.isArray(blogData.categoryIds)
            ? blogData.categoryIds
                .filter(id => mongoose_1.default.Types.ObjectId.isValid(id))
                .map(id => new mongoose_1.default.Types.ObjectId(id))
            : [];
        const newBlog = new blog_schema_1.default({
            author_name: blogData.author_name,
            contact_no: blogData.contact_no,
            content: blogData.content,
            slug: slug_data,
            blog_title: blogData.blog_title,
            images: blogData.images,
            email: blogData.email,
            categoryIds: categoryObjectIds,
            blog_id: blogData.blog_id,
        });
        const savedBlog = yield newBlog.save();
        // await storeUserActionActivity(userDetails.userId, "BLog", "Create", `Craete new  blog!`)
        return callback(null, { savedBlog });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.storeBlogModel = storeBlogModel;
const blogDetail = (blog_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Blog = yield blog_schema_1.default.findOne({ _id: blog_id });
        if (Blog) {
            Blog.images = `${process.env.BASE_URL}/${Blog.images}`;
        }
        return callback(null, { Blog });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.blogDetail = blogDetail;
const updateBlogModel = (userDetails, blogData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug_data = (0, slugify_1.default)(blogData.blog_title, { lower: true, strict: true });
        const existingBlog = yield blog_schema_1.default.findOne({ slug: slug_data });
        if (existingBlog && existingBlog.id.toString() !== blogData.blog_id) {
            return callback({ message: "Blog with this title already exists!", status: 409 }, null);
        }
        const categoryObjectIds = Array.isArray(blogData.categoryIds)
            ? blogData.categoryIds
                .filter(id => mongoose_1.default.Types.ObjectId.isValid(id))
                .map(id => new mongoose_1.default.Types.ObjectId(id))
            : [];
        const blogToUpdate = yield blog_schema_1.default.findById(blogData.blog_id);
        if (!blogToUpdate) {
            return callback({ message: "Blog not found", status: 404 }, null);
        }
        blogToUpdate.author_name = blogData.author_name;
        blogToUpdate.contact_no = blogData.contact_no;
        blogToUpdate.content = blogData.content;
        blogToUpdate.slug = slug_data;
        blogToUpdate.blog_title = blogData.blog_title;
        blogToUpdate.images = blogData.images ? blogData.images : blogToUpdate.images;
        blogToUpdate.email = blogData.email;
        blogToUpdate.categoryIds = categoryObjectIds;
        const updatedBlog = yield blogToUpdate.save();
        // await storeUserActionActivity(userDetails.userId, "BLog", "update", `Update blog details!`)
        return callback(null, { updatedBlog });
    }
    catch (error) {
        console.error("Error updating blog:", error);
        return callback(error, null);
    }
});
exports.updateBlogModel = updateBlogModel;
const frontendBlogList = (search, page, limit, current_location_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skip = (page - 1) * limit;
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const [blogs, totalUsers] = yield Promise.all([
            blog_schema_1.default.find(searchQuery).skip(skip).limit(limit).lean(),
            blog_schema_1.default.countDocuments(searchQuery),
        ]);
        const blogs_data = blogs.map(blog => (Object.assign(Object.assign({}, blog), { images: blog.images ? `${process.env.BASE_URL}/${blog.images}` : undefined })));
        const data = {
            blogs_data,
            title: "Blog Listing",
            meta_title: "Blog Listing Meta",
            meta_description: "Blog meta description",
            meta_keywords: "Meta keywords",
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
        // Store the result in cache for future use
        // cache.set(cacheKey, data);
        return callback(null, data);
    }
    catch (error) {
        console.error("Error in frontendBlogList:", error);
        return callback(error, null);
    }
});
exports.frontendBlogList = frontendBlogList;
const frontendBlogDetails = (blog_id, current_city_id, page, limit, callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const cacheKey = `blog:${blog_id}:${page}:${limit}`;
    const cached = cache.get(cacheKey);
    // if (cached) return callback(null, cached);
    try {
        const skip = (page - 1) * limit;
        const [blog, blogs_reviews, recent_blogs, total_blog_reviews] = yield Promise.all([
            blog_schema_1.default.findById(blog_id).lean(),
            (0, exports.BlogWiseReviewList)(blog_id, page, limit),
            blog_schema_1.default.find({ _id: { $ne: blog_id } })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
            blog_schema_1.default.countDocuments({ _id: blog_id }),
        ]);
        if (!blog)
            return callback(new Error("Blog not found"), null);
        const ads_banner_data = yield (0, banners_service_1.default)('', current_city_id, 'header_bottom');
        const banner_image = (_a = ads_banner_data === null || ads_banner_data === void 0 ? void 0 : ads_banner_data.randomBanner) === null || _a === void 0 ? void 0 : _a.banner_image;
        blog.images = blog.images ? `${process.env.BASE_URL}/${blog.images}` : undefined;
        if (blog.content) {
            const imgTag = `<div style="text-align:center;"><img src="${banner_image}" style="max-width:100%; margin: 20px 0;" /></div>`;
            // Split content by </p> and insert image after each paragraph
            const paragraphs = blog.content.split('</p>');
            blog.content = paragraphs
                .map((para, index) => {
                if (!para.trim())
                    return '';
                let result = para + '</p>';
                if ((index + 1) % 3 === 0) {
                    result += imgTag;
                }
                return result;
            })
                .join('');
        }
        const recent_blogs_data = recent_blogs.map(rb => (Object.assign(Object.assign({}, rb), { images: rb.images ? `${process.env.BASE_URL}/${rb.images}` : undefined })));
        const totalPages = Math.ceil(total_blog_reviews / limit);
        const data = {
            Blog: blog,
            recent_blogs_data,
            blogs_reviews,
            title: blog.blog_title,
            meta_title: blog.blog_title,
            meta_description: blog.blog_title,
            meta_keywords: blog.blog_title,
            total_blog_reviews,
            totalPages,
            currentPage: page,
        };
        // Store result in cache
        cache.set(cacheKey, { data });
        return callback(null, { data });
    }
    catch (error) {
        console.error("Error fetching blog details:", error);
        return callback(error, null);
    }
});
exports.frontendBlogDetails = frontendBlogDetails;
const storeFrontendBlogReview = (userData, reviewData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newBlogReview = new blogReview_schema_1.default({
            user_id: userData.userId,
            blog_id: reviewData.blog_id,
            rating: reviewData.rating,
            comment: reviewData.comment,
        });
        const savedBlogReview = yield newBlogReview.save();
        return callback(null, { savedBlogReview });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.storeFrontendBlogReview = storeFrontendBlogReview;
const storeFrontendListingReview = (userData, reviewData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newBlogReview = new listingReview_schema_1.default({
            user_id: userData.userId,
            listing_id: reviewData.listing_id,
            rating: reviewData.rating,
            comment: reviewData.comment,
        });
        const savedBlogReview = yield newBlogReview.save();
        return callback(null, { savedBlogReview });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.storeFrontendListingReview = storeFrontendListingReview;
//# sourceMappingURL=blog.model.js.map