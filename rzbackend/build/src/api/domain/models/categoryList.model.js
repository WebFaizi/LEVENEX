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
exports.updateSortingList = exports.getSortedCategoryList = exports.UpdateCategoryDetailModel = exports.getCategoryDetailModel = exports.storeCategoryModel = exports.disableCategoryList = exports.categoryList = exports.categoryActionModel = exports.allAdminCategoryList = void 0;
const category_schema_1 = __importDefault(require("../schema/category.schema"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const mongoose_1 = __importDefault(require("mongoose"));
const allAdminCategoryList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield category_schema_1.default
            .find({ status: true })
            .sort({ sorting: 1 })
            .exec();
        return {
            data: users,
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.allAdminCategoryList = allAdminCategoryList;
const categoryActionModel = (categoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield category_schema_1.default.findOne({
            _id: categoryData.category_id,
        });
        if (!category) {
            return callback({ message: "Category not found" }, null);
        }
        category.status = categoryData.type === "1";
        yield category.save();
        return callback(null, category);
    }
    catch (error) {
        console.error("Error updating category:", error);
        return callback({ message: "Error updating category" }, null);
    }
});
exports.categoryActionModel = categoryActionModel;
const categoryList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { slug: { $regex: search, $options: "i" } },
                    { subdomain_slug: { $regex: search, $options: "i" } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield category_schema_1.default
            .find(searchQuery)
            .sort({ createdAt: -1 })
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
        throw new Error("Error fetching users");
    }
});
exports.categoryList = categoryList;
const disableCategoryList = (categoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category_list = yield category_schema_1.default.find({ status: false });
        return callback(null, category_list);
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.disableCategoryList = disableCategoryList;
const storeCategoryModel = (userData, categoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield category_schema_1.default.findOne({
            slug: categoryData.slug,
        });
        if (existingCategory) {
            const error = new Error("Category already exists.");
            return callback(error, null);
        }
        const lastCategory = yield category_schema_1.default.findOne().sort({ sorting: -1 });
        const newSortingValue = lastCategory ? lastCategory.sorting + 1 : 1;
        const newCategory = new category_schema_1.default(Object.assign(Object.assign({}, categoryData), { sorting: newSortingValue }));
        yield newCategory.save();
        yield (0, userActionActivity_service_1.storeUserActionActivity)(userData.userId, "Category", "Create", `New Category Added .`);
        return callback(null, newCategory);
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.storeCategoryModel = storeCategoryModel;
const getCategoryDetailModel = (category_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield category_schema_1.default
            .aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(category_id),
                },
            },
            {
                $addFields: {
                    related_categories_numbers: {
                        $map: {
                            input: "$related_categories",
                            as: "rc",
                            in: { $toInt: "$$rc" },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "related_categories_numbers",
                    foreignField: "unique_id",
                    as: "related_categories",
                },
            },
            {
                $project: {
                    related_categories_numbers: 0, // hide temp field
                },
            },
        ])
            .exec();
        if (!existingCategory) {
            return callback(new Error("Category not found"), null);
        }
        const imageBaseUrl = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.laptoprental.co";
        existingCategory[0].desktop_image = `${imageBaseUrl}/${existingCategory === null || existingCategory === void 0 ? void 0 : existingCategory.desktop_image}`;
        existingCategory[0].mobile_image = `${imageBaseUrl}/${existingCategory === null || existingCategory === void 0 ? void 0 : existingCategory.mobile_image}`;
        return callback(null, existingCategory[0]);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.getCategoryDetailModel = getCategoryDetailModel;
const UpdateCategoryDetailModel = (userData, category_id, categoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield category_schema_1.default.findOne({ _id: category_id });
        if (!existingCategory) {
            return callback(new Error("Category not found."), null);
        }
        const slugExist = yield category_schema_1.default.findOne({
            slug: categoryData.slug,
            _id: { $ne: category_id },
        });
        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        existingCategory.name = categoryData.name || existingCategory.name;
        existingCategory.slug = categoryData.slug || existingCategory.slug;
        existingCategory.subdomain_slug =
            categoryData.subdomain_slug || existingCategory.subdomain_slug;
        existingCategory.desktop_image =
            categoryData.desktop_image || existingCategory.desktop_image;
        existingCategory.mobile_image =
            categoryData.mobile_image || existingCategory.mobile_image;
        existingCategory.description =
            categoryData.description || existingCategory.description;
        existingCategory.subdomain_description =
            categoryData.subdomain_description ||
                existingCategory.subdomain_description;
        existingCategory.page_top_keyword =
            categoryData.page_top_keyword || existingCategory.page_top_keyword;
        existingCategory.page_top_descritpion =
            categoryData.page_top_descritpion ||
                existingCategory.page_top_descritpion;
        existingCategory.ratingvalue =
            categoryData.ratingvalue || existingCategory.ratingvalue;
        existingCategory.ratingcount =
            categoryData.ratingcount || existingCategory.ratingcount;
        existingCategory.related_categories =
            categoryData.related_categories || existingCategory.related_categories;
        yield existingCategory.save();
        yield (0, userActionActivity_service_1.storeUserActionActivity)(userData.userId, "Category", "Update", `categorie data Updated .`);
        return callback(null, existingCategory);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.UpdateCategoryDetailModel = UpdateCategoryDetailModel;
const getSortedCategoryList = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield category_schema_1.default
            .find({ status: true })
            .sort({ sorting: 1 })
            .lean();
        return callback(null, users);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.getSortedCategoryList = getSortedCategoryList;
const updateSortingList = (category_ids, callback) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Array.isArray(category_ids) || category_ids.length === 0) {
        return callback(new Error("Invalid category IDs"), null);
    }
    try {
        const bulkOps = category_ids.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { sorting: index + 1 } },
            },
        }));
        yield category_schema_1.default.bulkWrite(bulkOps);
        const updatedCategories = yield category_schema_1.default.find().sort({ sorting: 1 });
        return callback(null, updatedCategories);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.updateSortingList = updateSortingList;
//# sourceMappingURL=categoryList.model.js.map