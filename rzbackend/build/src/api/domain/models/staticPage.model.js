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
exports.updateStaticPageModel = exports.StaticPageDetailModel = exports.staticPageListModel = exports.storeStaticPageModel = void 0;
const staticPage_schema_1 = __importDefault(require("../schema/staticPage.schema"));
const storeStaticPageModel = (staticPages, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staticPage = new staticPage_schema_1.default({
            page_name: staticPages.page_name,
            page_content: staticPages.page_content
        });
        const staticPageSave = yield staticPage.save();
        return callback(null, { staticPageSave });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.storeStaticPageModel = storeStaticPageModel;
const staticPageListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                    { subdomain_slug: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const lists = yield staticPage_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalLists = yield staticPage_schema_1.default.countDocuments(searchQuery);
        return {
            data: lists,
            totalLists,
            totalPages: Math.ceil(totalLists / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.staticPageListModel = staticPageListModel;
const StaticPageDetailModel = (blog_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Blog = yield staticPage_schema_1.default.findOne({ _id: blog_id });
        return callback(null, { Blog });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.StaticPageDetailModel = StaticPageDetailModel;
const updateStaticPageModel = (staticPages, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staticPage = yield staticPage_schema_1.default.findOne({ _id: staticPages.static_page_id });
        if (!staticPage) {
            return callback(new Error('Static page not found'), null);
        }
        staticPage.page_name = staticPages.page_name;
        staticPage.page_content = staticPages.page_content;
        const updatedStaticPage = yield staticPage.save();
        return callback(null, { updatedStaticPage });
    }
    catch (error) {
        console.error('Error updating static page:', error);
        return callback(error, null);
    }
});
exports.updateStaticPageModel = updateStaticPageModel;
//# sourceMappingURL=staticPage.model.js.map