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
exports.updateBlogCategoryModel = exports.blogCategoryList = exports.storeBlogCategoryModel = void 0;
const blogcategory_schema_1 = __importDefault(require("../schema/blogcategory.schema"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const storeBlogCategoryModel = (userData, blogCategoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = blogCategoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const existingCategory = yield blogcategory_schema_1.default.findOne({ slug: slug });
        if (existingCategory) {
            const error = new Error("Blog Category already exists.");
            return callback(error, null);
        }
        const lastCategory = yield blogcategory_schema_1.default.findOne().sort({ sorting: -1 });
        const newSortingValue = lastCategory ? lastCategory.sorting + 1 : 1;
        const newCategory = new blogcategory_schema_1.default(Object.assign(Object.assign({}, blogCategoryData), { slug: slug, sorting: newSortingValue }));
        yield newCategory.save();
        yield (0, userActionActivity_service_1.storeUserActionActivity)(userData.userId, "Blog Category", "Create", `New Blog categorie Added.`);
        return callback(null, newCategory);
    }
    catch (error) {
        const errors = new Error('Error fetching users');
        return callback(errors, null);
    }
});
exports.storeBlogCategoryModel = storeBlogCategoryModel;
const blogCategoryList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
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
        const users = yield blogcategory_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield blogcategory_schema_1.default.countDocuments(searchQuery);
        blogcategory_schema_1.default;
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching blog category');
    }
});
exports.blogCategoryList = blogCategoryList;
const updateBlogCategoryModel = (userData, blogCategoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = blogCategoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        // Check if a category with the same slug already exists, excluding the current one
        const existingCategory = yield blogcategory_schema_1.default.findOne({
            _id: { $ne: blogCategoryData.blog_category_id },
            slug: slug
        });
        if (existingCategory) {
            return callback(new Error("Blog Category already exists or category not found."), null);
        }
        // Find and update the existing category
        const updatedCategory = yield blogcategory_schema_1.default.findByIdAndUpdate(blogCategoryData.blog_category_id, Object.assign(Object.assign({}, blogCategoryData), { slug: slug }), { new: true } // Return updated document
        );
        if (!updatedCategory) {
            return callback(new Error("Blog Category not found."), null);
        }
        yield (0, userActionActivity_service_1.storeUserActionActivity)(userData.userId, "Blog Category", "Update", `Blog categorie details updated.`);
        return callback(null, updatedCategory);
    }
    catch (error) {
        return callback(new Error("Error updating blog category"), null);
    }
});
exports.updateBlogCategoryModel = updateBlogCategoryModel;
//# sourceMappingURL=blogCategoryList.model.js.map