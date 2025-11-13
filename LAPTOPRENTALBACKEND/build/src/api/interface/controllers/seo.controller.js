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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.importListingSeo = exports.getListingSeoList = exports.getListingSeoDetails = exports.exportListingSeoDetails = exports.updateListingSeo = exports.importHomepageSeoData = exports.exportHomepageSeoData = exports.getHomePageSeo = exports.updateHomePageSeo = exports.importCategorySeo = exports.getCategorySeoList = exports.getCategorySeoDetails = exports.exportCategorySeoDetails = exports.updateCategorySeo = exports.importSubdomainCategorySeo = exports.getSubdomainCategorySeoList = exports.getSubdomainCategorySeoDetails = exports.exportSubcategoryCategorySeoDetails = exports.updateSubdomainCategorySeo = exports.serverSideMetaDetails = void 0;
const homepageSeo_model_1 = require("../../domain/models/homepageSeo.model");
const categorySeo_model_1 = require("../../domain/models/categorySeo.model");
const subdomainCategorySeo_model_1 = require("../../domain/models/subdomainCategorySeo.model");
const listingSeo_model_1 = require("../../domain/models/listingSeo.model");
const insertExportTaskService_service_1 = require("../../services/insertExportTaskService.service");
const apiResponse_1 = require("../../helper/apiResponse");
const homepage_seo_schema_1 = __importDefault(require("../../domain/schema/homepage_seo.schema"));
const categoryseo_schema_1 = __importDefault(require("../../domain/schema/categoryseo.schema"));
const listingseo_schema_1 = __importDefault(require("../../domain/schema/listingseo.schema"));
const subdomainCategorySeo_schema_1 = __importDefault(require("../../domain/schema/subdomainCategorySeo.schema"));
const category_schema_1 = __importDefault(require("../../domain/schema/category.schema"));
const listing_schema_1 = __importDefault(require("../../domain/schema/listing.schema"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const setting_schema_1 = __importDefault(require("../../domain/schema/setting.schema"));
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const serverSideMetaDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, homepageSeo_model_1.serverSideMetaDetailsModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Fetched SEO meta details successfully!", result);
        });
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching SEO meta details.");
    }
});
exports.serverSideMetaDetails = serverSideMetaDetails;
//subdomain seo
const updateSubdomainCategorySeo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, subdomainCategorySeo_model_1.updateSubdomainCategorySeoModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "SubdomainSeo", "Update", `Update subdomain category Seo Details successfully`);
            return (0, apiResponse_1.successResponse)(res, "Update Subdomain Category Seo successfully!", []);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateSubdomainCategorySeo = updateSubdomainCategorySeo;
const exportSubcategoryCategorySeoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorySeoData = yield category_schema_1.default.aggregate([
            {
                $lookup: {
                    from: "subdomaincategoryseos",
                    localField: "unique_id",
                    foreignField: "category_id",
                    as: "seoData",
                },
            },
            {
                $unwind: {
                    path: "$seoData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    name: 1,
                    page_title: { $ifNull: ["$seoData.page_title", "N/A"] },
                    meta_title: { $ifNull: ["$seoData.meta_title", "N/A"] },
                    meta_description: { $ifNull: ["$seoData.meta_description", "N/A"] },
                    meta_keywords: { $ifNull: ["$seoData.meta_keywords", "N/A"] },
                    search_by_keyword: { $ifNull: ["$seoData.search_by_keyword", "N/A"] },
                    search_by_keyword_meta_des: { $ifNull: ["$seoData.search_by_keyword_meta_des", "N/A"] },
                    search_by_keyword_meta_keyword: { $ifNull: ["$seoData.search_by_keyword_meta_keyword", "N/A"] },
                    product_title: { $ifNull: ["$seoData.product_title", "N/A"] },
                    product_meta_description: { $ifNull: ["$seoData.product_meta_description", "N/A"] },
                    product_meta_keywords: { $ifNull: ["$seoData.product_meta_keywords", "N/A"] },
                }
            }
        ]);
        console.log(categorySeoData);
        if (!categorySeoData.length) {
            return res.status(404).json({ message: "No category SEO data found." });
        }
        const excelData = categorySeoData.map(item => ({
            CategoryName: item.name,
            PageTitle: item.page_title,
            MetaTitle: item.meta_title,
            MetaKeywords: item.meta_keywords,
            MetaDescription: item.meta_description,
            SearchByKeyword: item.search_by_keyword,
            SearchByKeywordMetaDes: item.search_by_keyword_meta_des,
            SearchByKeywordMetaKeywords: item.search_by_keyword_meta_keyword,
            ProductTitle: item.product_title,
            ProductMetaDescription: item.product_meta_description,
            ProductMetaKeywords: item.product_meta_keywords
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CategorySEO");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=subDomaincategory_seo_data.xlsx");
        return res.send(buffer);
    }
    catch (error) {
        console.error("Export Error:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Error exporting category SEO data.");
    }
});
exports.exportSubcategoryCategorySeoDetails = exportSubcategoryCategorySeoDetails;
const getSubdomainCategorySeoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.query;
        const category_details = yield category_schema_1.default.findOne({
            unique_id: category_id,
        });
        const category_seo_details = yield subdomainCategorySeo_schema_1.default.findOne({
            category_id: category_id,
        });
        let data = {
            category_details,
            category_seo_details
        };
        return (0, apiResponse_1.successResponse)(res, "Homepage Seo fetched successfully", data);
    }
    catch (error) {
        console.error("Error fetching homepage seo:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the homepage seo.");
    }
});
exports.getSubdomainCategorySeoDetails = getSubdomainCategorySeoDetails;
const getSubdomainCategorySeoList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const pageNumber = Math.max(1, parseInt(page, 10));
        const limitNumber = Math.max(1, parseInt(limit, 10));
        const skip = (pageNumber - 1) * limitNumber;
        const searchTerm = search.trim();
        const matchStage = searchTerm
            ? {
                $match: {
                    name: { $regex: new RegExp(searchTerm, "i") }, // case-insensitive match
                },
            }
            : null;
        const pipeline = [];
        if (matchStage) {
            pipeline.push(matchStage);
        }
        pipeline.push({
            $lookup: {
                from: "subdomaincategoryseos",
                let: { categoryId: "$unique_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$category_id", "$$categoryId"] } } },
                    { $sort: { _id: 1 } }, // or any field to define priority
                    { $limit: 1 }
                ],
                as: "seoData"
            }
        }, {
            $unwind: {
                path: "$seoData",
                preserveNullAndEmptyArrays: true
            }
        }, {
            $project: {
                name: 1,
                _id: 1,
                unique_id: 1,
                "seoData.page_title": { $ifNull: ["$seoData.page_title", null] },
                "seoData.meta_title": { $ifNull: ["$seoData.meta_title", null] },
                "seoData.meta_description": { $ifNull: ["$seoData.meta_description", null] },
                "seoData.meta_keywords": { $ifNull: ["$seoData.meta_keywords", null] },
                "seoData.search_by_keyword": { $ifNull: ["$seoData.search_by_keyword", null] },
                "seoData.search_by_keyword_meta_des": {
                    $ifNull: ["$seoData.search_by_keyword_meta_des", null],
                },
                "seoData.search_by_keyword_meta_keyword": {
                    $ifNull: ["$seoData.search_by_keyword_meta_keyword", null],
                },
                "seoData.product_title": { $ifNull: ["$seoData.product_title", null] },
                "seoData.product_meta_description": {
                    $ifNull: ["$seoData.product_meta_description", null],
                },
                "seoData.product_meta_keywords": {
                    $ifNull: ["$seoData.product_meta_keywords", null],
                },
            },
        }, { $skip: skip }, { $limit: limitNumber });
        const categorySeoData = yield category_schema_1.default.aggregate(pipeline);
        const totalRecords = yield category_schema_1.default.countDocuments(matchStage ? matchStage.$match : {});
        const totalPages = Math.ceil(totalRecords / limitNumber);
        const excelData = categorySeoData.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return ({
                CategoryName: item.name,
                categoryId: item.unique_id || null,
                PageTitle: ((_a = item.seoData) === null || _a === void 0 ? void 0 : _a.page_title) || null,
                MetaTitle: ((_b = item.seoData) === null || _b === void 0 ? void 0 : _b.meta_title) || null,
                MetaKeywords: ((_c = item.seoData) === null || _c === void 0 ? void 0 : _c.meta_keywords) || null,
                MetaDescription: ((_d = item.seoData) === null || _d === void 0 ? void 0 : _d.meta_description) || null,
                SearchByKeyword: ((_e = item.seoData) === null || _e === void 0 ? void 0 : _e.search_by_keyword) || null,
                SearchByKeywordMetaDes: ((_f = item.seoData) === null || _f === void 0 ? void 0 : _f.search_by_keyword_meta_des) || null,
                SearchByKeywordMetaKeywords: ((_g = item.seoData) === null || _g === void 0 ? void 0 : _g.search_by_keyword_meta_keyword) || null,
                ProductTitle: ((_h = item.seoData) === null || _h === void 0 ? void 0 : _h.product_title) || null,
                ProductMetaDescription: ((_j = item.seoData) === null || _j === void 0 ? void 0 : _j.product_meta_description) || null,
                ProductMetaKeywords: ((_k = item.seoData) === null || _k === void 0 ? void 0 : _k.product_meta_keywords) || null,
            });
        });
        return (0, apiResponse_1.successResponse)(res, "Subdomain category SEO fetched successfully", {
            data: excelData,
            totalLists: totalRecords,
            totalPages,
            currentPage: pageNumber,
        });
    }
    catch (error) {
        console.error("Error fetching subdomain category SEO:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the subdomain category SEO.");
    }
});
exports.getSubdomainCategorySeoList = getSubdomainCategorySeoList;
const importSubdomainCategorySeo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const totalRecords = data.length;
        const avgTimePerRecord = 0.02; // Slightly heavier operation
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        res.status(200).json({
            message: `Your file with ${totalRecords} subdomain category SEO record(s) is being processed. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            for (const row of data) {
                const { CategoryName, PageTitle, MetaTitle, MetaKeywords, MetaDescription, SearchByKeyword, SearchByKeywordMetaDes, SearchByKeywordMetaKeywords, ProductTitle, ProductMetaTitle, ProductMetaDescription, ProductMetaKeywords } = row;
                try {
                    const existingCategory = yield category_schema_1.default.findOne({ name: CategoryName });
                    if (!existingCategory) {
                        console.warn(`Subdomain category not found for name: ${CategoryName}`);
                        continue;
                    }
                    const category_id = existingCategory.unique_id;
                    const seoData = {
                        category_id,
                        category_seo_type: 1,
                        page_title: PageTitle || "",
                        meta_title: MetaTitle || "",
                        meta_description: MetaDescription || "",
                        meta_keywords: MetaKeywords || "",
                        search_by_keyword: SearchByKeyword || "",
                        search_by_keyword_meta_des: SearchByKeywordMetaDes || "",
                        search_by_keyword_meta_keyword: SearchByKeywordMetaKeywords || "",
                        product_title: ProductTitle || "",
                        product_meta_title: ProductMetaTitle || "",
                        product_meta_description: ProductMetaDescription || "",
                        product_meta_keywords: ProductMetaKeywords || ""
                    };
                    const existingSeo = yield subdomainCategorySeo_schema_1.default.findOne({ category_id });
                    if (existingSeo) {
                        yield subdomainCategorySeo_schema_1.default.findByIdAndUpdate(existingSeo._id, seoData, { new: true });
                    }
                    else {
                        yield subdomainCategorySeo_schema_1.default.create(seoData);
                    }
                }
                catch (err) {
                    console.error(`Error updating SEO for subdomain category: ${CategoryName}`, err);
                }
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "SubdomainSeo", "Import", `Import data of subdomain successfully!`);
            console.log("Subdomain category SEO import completed.");
        }), 100); // Small delay before starting background task
    }
    catch (error) {
        console.error("Error in importSubdomainCategorySeo:", error);
        return res.status(500).json({ message: "Error importing subdomain category SEO", error: error.message });
    }
});
exports.importSubdomainCategorySeo = importSubdomainCategorySeo;
//category seo
const updateCategorySeo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, categorySeo_model_1.updateCategorySeoModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "CategorySeo", "Update", `Update category Seo Details successfully`);
            return (0, apiResponse_1.successResponse)(res, "Update Category Seo successfully!", []);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateCategorySeo = updateCategorySeo;
const exportCategorySeoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorySeoData = yield category_schema_1.default.aggregate([
            {
                $lookup: {
                    from: "categoryseos",
                    localField: "unique_id",
                    foreignField: "category_id",
                    as: "seoData"
                }
            },
            {
                $unwind: {
                    path: "$seoData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    name: 1,
                    page_title: { $ifNull: ["$seoData.page_title", "N/A"] },
                    meta_title: { $ifNull: ["$seoData.meta_title", "N/A"] },
                    meta_description: { $ifNull: ["$seoData.meta_description", "N/A"] },
                    meta_keywords: { $ifNull: ["$seoData.meta_keywords", "N/A"] },
                    search_by_keyword: { $ifNull: ["$seoData.search_by_keyword", "N/A"] },
                    search_by_keyword_meta_des: { $ifNull: ["$seoData.search_by_keyword_meta_des", "N/A"] },
                    search_by_keyword_meta_keyword: { $ifNull: ["$seoData.search_by_keyword_meta_keyword", "N/A"] },
                    product_title: { $ifNull: ["$seoData.product_title", "N/A"] },
                    product_meta_description: { $ifNull: ["$seoData.product_meta_description", "N/A"] },
                    product_meta_keywords: { $ifNull: ["$seoData.product_meta_keywords", "N/A"] },
                }
            }
        ]);
        if (!categorySeoData.length) {
            return res.status(404).json({ message: "No category SEO data found." });
        }
        const excelData = categorySeoData.map(item => ({
            CategoryName: item.name,
            PageTitle: item.page_title,
            MetaTitle: item.meta_title,
            MetaKeywords: item.meta_keywords,
            MetaDescription: item.meta_description,
            SearchByKeyword: item.search_by_keyword,
            SearchByKeywordMetaDes: item.search_by_keyword_meta_des,
            SearchByKeywordMetaKeywords: item.search_by_keyword_meta_keyword,
            ProductTitle: item.product_title,
            ProductMetaDescription: item.product_meta_description,
            ProductMetaKeywords: item.product_meta_keywords
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CategorySEO");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=category_seo_data.xlsx");
        return res.send(buffer);
    }
    catch (error) {
        console.error("Export Error:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Error exporting category SEO data.");
    }
});
exports.exportCategorySeoDetails = exportCategorySeoDetails;
const getCategorySeoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_seo_type, category_id } = req.query;
        let homepageSeo = yield categoryseo_schema_1.default.findOne({
            category_seo_type: category_seo_type,
            category_id: category_id,
        });
        if (!homepageSeo) {
            homepageSeo = {
                uniqueId: category_id,
                categoryId: category_id,
                PageTitle: null,
                MetaTitle: null,
                MetaKeywords: null,
                MetaDescription: null,
                SearchByKeyword: null,
                SearchByKeywordMetaDes: null,
                SearchByKeywordMetaKeywords: null,
                ProductTitle: null,
                ProductMetaDescription: null,
                ProductMetaKeywords: null
            };
        }
        return (0, apiResponse_1.successResponse)(res, "Homepage Seo fetched successfully", homepageSeo);
    }
    catch (error) {
        console.error("Error fetching homepage seo:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the homepage seo.");
    }
});
exports.getCategorySeoDetails = getCategorySeoDetails;
const getCategorySeoList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const searchTerm = search.trim();
        const matchStage = searchTerm
            ? {
                $match: {
                    name: { $regex: new RegExp(searchTerm, "i") }, // Case-insensitive partial match
                },
            }
            : null;
        const pipeline = [];
        if (matchStage) {
            pipeline.push(matchStage);
        }
        pipeline.push({
            $lookup: {
                from: "categoryseos",
                localField: "unique_id",
                foreignField: "category_id",
                as: "seoData",
            },
        }, {
            $unwind: {
                path: "$seoData",
                preserveNullAndEmptyArrays: true,
            },
        }, {
            $group: {
                _id: "$unique_id",
                name: { $first: "$name" },
                unique_id: { $first: "$unique_id" },
                seoData: { $first: "$seoData" }
            }
        }, {
            $project: {
                name: 1,
                unique_id: 1,
                "seoData.category_id": { $ifNull: ["$seoData.category_id", null] },
                "seoData.page_title": { $ifNull: ["$seoData.page_title", null] },
                "seoData.meta_title": { $ifNull: ["$seoData.meta_title", null] },
                "seoData.meta_description": { $ifNull: ["$seoData.meta_description", null] },
                "seoData.meta_keywords": { $ifNull: ["$seoData.meta_keywords", null] },
                "seoData.search_by_keyword": { $ifNull: ["$seoData.search_by_keyword", null] },
                "seoData.search_by_keyword_meta_des": {
                    $ifNull: ["$seoData.search_by_keyword_meta_des", null],
                },
                "seoData.search_by_keyword_meta_keyword": {
                    $ifNull: ["$seoData.search_by_keyword_meta_keyword", null],
                },
                "seoData.product_title": { $ifNull: ["$seoData.product_title", null] },
                "seoData.product_meta_description": {
                    $ifNull: ["$seoData.product_meta_description", null],
                },
                "seoData.product_meta_keywords": {
                    $ifNull: ["$seoData.product_meta_keywords", null],
                },
            },
        }, { $skip: (pageNumber - 1) * limitNumber }, { $limit: limitNumber });
        const categorySeoData = yield category_schema_1.default.aggregate(pipeline);
        const totalRecords = yield category_schema_1.default.countDocuments(matchStage ? matchStage.$match : {});
        const totalPages = Math.ceil(totalRecords / limitNumber);
        const excelData = categorySeoData.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            return ({
                CategoryName: item.name,
                uniqueId: (item === null || item === void 0 ? void 0 : item.unique_id) || null,
                categoryId: ((_a = item.seoData) === null || _a === void 0 ? void 0 : _a.category_id) || (item === null || item === void 0 ? void 0 : item.unique_id),
                PageTitle: ((_b = item.seoData) === null || _b === void 0 ? void 0 : _b.page_title) || null,
                MetaTitle: ((_c = item.seoData) === null || _c === void 0 ? void 0 : _c.meta_title) || null,
                MetaKeywords: ((_d = item.seoData) === null || _d === void 0 ? void 0 : _d.meta_keywords) || null,
                MetaDescription: ((_e = item.seoData) === null || _e === void 0 ? void 0 : _e.meta_description) || null,
                SearchByKeyword: ((_f = item.seoData) === null || _f === void 0 ? void 0 : _f.search_by_keyword) || null,
                SearchByKeywordMetaDes: ((_g = item.seoData) === null || _g === void 0 ? void 0 : _g.search_by_keyword_meta_des) || null,
                SearchByKeywordMetaKeywords: ((_h = item.seoData) === null || _h === void 0 ? void 0 : _h.search_by_keyword_meta_keyword) || null,
                ProductTitle: ((_j = item.seoData) === null || _j === void 0 ? void 0 : _j.product_title) || null,
                ProductMetaDescription: ((_k = item.seoData) === null || _k === void 0 ? void 0 : _k.product_meta_description) || null,
                ProductMetaKeywords: ((_l = item.seoData) === null || _l === void 0 ? void 0 : _l.product_meta_keywords) || null,
            });
        });
        return (0, apiResponse_1.successResponse)(res, "Category SEO list fetched successfully", {
            data: excelData,
            totalLists: totalRecords,
            totalPages,
            currentPage: pageNumber,
        });
    }
    catch (error) {
        console.error("Error fetching category SEO list:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the category SEO list.");
    }
});
exports.getCategorySeoList = getCategorySeoList;
const importCategorySeo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // ~10ms per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Category Seo Import", "processing");
        // Send immediate response
        res.status(200).json({
            message: `Your file with ${totalRecords} category SEO records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });
        // Background import
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            for (const row of data) {
                const { CategoryName, PageTitle, MetaTitle, MetaKeywords, MetaDescription, SearchByKeyword, SearchByKeywordMetaDes, SearchByKeywordMetaKeywords, ProductTitle, ProductMetaTitle, ProductMetaDescription, ProductMetaKeywords } = row;
                if (!CategoryName || typeof CategoryName !== "string")
                    continue;
                try {
                    const existingCategory = yield category_schema_1.default.findOne({ name: CategoryName.trim() });
                    if (!existingCategory) {
                        console.warn(`Category not found: ${CategoryName}`);
                        continue;
                    }
                    const seoData = {
                        category_id: existingCategory.unique_id,
                        category_seo_type: 1,
                        page_title: PageTitle || "",
                        meta_title: MetaTitle || "",
                        meta_description: MetaDescription || "",
                        meta_keywords: MetaKeywords || "",
                        search_by_keyword: SearchByKeyword || "",
                        search_by_keyword_meta_des: SearchByKeywordMetaDes || "",
                        search_by_keyword_meta_keyword: SearchByKeywordMetaKeywords || "",
                        product_title: ProductTitle || "",
                        product_meta_title: ProductTitle || "",
                        product_meta_description: ProductMetaDescription || "",
                        product_meta_keywords: ProductMetaKeywords || ""
                    };
                    const existingSeo = yield categoryseo_schema_1.default.findOne({ category_id: existingCategory.unique_id });
                    if (existingSeo) {
                        yield categoryseo_schema_1.default.findByIdAndUpdate(existingSeo._id, seoData, { new: true });
                    }
                    else {
                        yield categoryseo_schema_1.default.create(seoData);
                    }
                }
                catch (err) {
                    console.error(`Error processing SEO for category: ${CategoryName}`, err);
                }
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "CategorySeo", "Import", `Import category Seo Details successfully`);
            console.log("Category SEO import complete.");
            const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Category Seo Import", "completed");
        }), 100); // Slight delay to avoid blocking
    }
    catch (error) {
        console.error("Top-level import error:", error);
        return res.status(500).json({ message: "Error importing category SEO", error: error.message });
    }
});
exports.importCategorySeo = importCategorySeo;
//homepage seo 
const updateHomePageSeo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, homepageSeo_model_1.updateHomepageSeoModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "HomePage", "Update", `Update Home Page Seo Details successfully`);
            return (0, apiResponse_1.successResponse)(res, "Update Homepage Seo successfully!", []);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateHomePageSeo = updateHomePageSeo;
const getHomePageSeo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const homepageSeo = yield homepage_seo_schema_1.default.find();
        if (!homepageSeo) {
            return (0, apiResponse_1.ErrorResponse)(res, "Homepage Seo not found");
        }
        return (0, apiResponse_1.successResponse)(res, "Homepage Seo fetched successfully", homepageSeo);
    }
    catch (error) {
        console.error("Error fetching homepage seo:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the homepage seo.");
    }
});
exports.getHomePageSeo = getHomePageSeo;
const exportHomepageSeoData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const homepageData = yield homepage_seo_schema_1.default.find({}, {
            page_title: 1,
            meta_title: 1,
            meta_description: 1,
            meta_keywords: 1,
            _id: 0
        }).lean(); // lean() boosts performance by skipping Mongoose document wrapping
        if (!homepageData.length) {
            return res.status(404).json({ message: "No homepage SEO data found." });
        }
        const [settingData] = yield Promise.all([setting_schema_1.default.findOne()]);
        // Map the data for Excel output
        const excelData = homepageData.map(item => ({
            PageTitle: item.page_title || "N/A",
            MetaTitle: item.meta_title || "N/A",
            MetaDescription: item.meta_description || "N/A",
            MetaKeywords: item.meta_keywords || "N/A",
            WebsiteLogo: (settingData === null || settingData === void 0 ? void 0 : settingData.website_logo) ? path_1.default.basename(settingData.website_logo) : "",
            MobileLogo: (settingData === null || settingData === void 0 ? void 0 : settingData.mobile_logo) ? path_1.default.basename(settingData.mobile_logo) : "",
            FavIcon: (settingData === null || settingData === void 0 ? void 0 : settingData.fav_icon) ? path_1.default.basename(settingData.fav_icon) : "",
            PreLoader: (settingData === null || settingData === void 0 ? void 0 : settingData.pre_loader) ? path_1.default.basename(settingData === null || settingData === void 0 ? void 0 : settingData.pre_loader) : "",
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "HomepageSEO");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=homepage_seo.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    }
    catch (error) {
        console.error("Export Error:", error);
        return res.status(500).json({ message: "Error exporting homepage SEO data", error: error.message });
    }
});
exports.exportHomepageSeoData = exportHomepageSeoData;
const importHomepageSeoData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // ~10ms per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        // Respond immediately
        res.status(200).json({
            message: `Your file with ${totalRecords} homepage SEO record(s) is being processed in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });
        // Background task
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            for (const row of data) {
                const { PageTitle, MetaTitle, MetaDescription, MetaKeywords, WebsiteLogo, MobileLogo, FavIcon, PreLoader } = row;
                try {
                    const seoData = {
                        page_title: PageTitle || "",
                        meta_title: MetaTitle || "",
                        meta_description: MetaDescription || "",
                        meta_keywords: MetaKeywords || ""
                    };
                    const existing = yield homepage_seo_schema_1.default.findOne();
                    if (existing) {
                        yield homepage_seo_schema_1.default.updateOne({}, seoData);
                    }
                    else {
                        yield homepage_seo_schema_1.default.create(seoData);
                    }
                    const uploadDir = "uploads/website_default_images/";
                    const settingUpdate = yield setting_schema_1.default.findOne();
                    const settingFields = {
                        website_logo: WebsiteLogo ? uploadDir + WebsiteLogo : settingUpdate === null || settingUpdate === void 0 ? void 0 : settingUpdate.website_logo,
                        mobile_logo: MobileLogo ? uploadDir + MobileLogo : settingUpdate === null || settingUpdate === void 0 ? void 0 : settingUpdate.mobile_logo,
                        fav_icon: FavIcon ? uploadDir + FavIcon : settingUpdate === null || settingUpdate === void 0 ? void 0 : settingUpdate.fav_icon,
                        pre_loader: PreLoader ? uploadDir + PreLoader : settingUpdate === null || settingUpdate === void 0 ? void 0 : settingUpdate.pre_loader
                    };
                    if (settingUpdate) {
                        yield setting_schema_1.default.updateOne({}, settingFields);
                    }
                    else {
                        yield setting_schema_1.default.create(settingFields);
                    }
                }
                catch (err) {
                    console.error("Error importing homepage SEO data row:", err);
                }
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Homepage", "Import", `Import homepage Seo Details successfully`);
            console.log("Homepage SEO import completed.");
        }), 100); // slight delay for background start
    }
    catch (error) {
        console.error("Top-level error in homepage SEO import:", error);
        return res.status(500).json({ message: "Error importing homepage SEO", error: error.message });
    }
});
exports.importHomepageSeoData = importHomepageSeoData;
//end homepage seo
//lsting seo
const updateListingSeo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, listingSeo_model_1.updateListingSeoModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "ListingSeo", "Update", `Update Listing Seo Details successfully`);
            return (0, apiResponse_1.successResponse)(res, "Update Listing Seo successfully!", []);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateListingSeo = updateListingSeo;
const exportListingSeoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingSeoData = yield listing_schema_1.default.aggregate([
            {
                $lookup: {
                    from: "listingseos",
                    localField: "listing_unique_id",
                    foreignField: "listing_id",
                    as: "seoData"
                }
            },
            {
                $unwind: {
                    path: "$seoData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    name: 1,
                    page_title: { $ifNull: ["$seoData.page_title", "N/A"] },
                    meta_title: { $ifNull: ["$seoData.meta_title", "N/A"] },
                    meta_description: { $ifNull: ["$seoData.meta_description", "N/A"] },
                    meta_keywords: { $ifNull: ["$seoData.meta_keywords", "N/A"] }
                }
            }
        ]);
        if (!listingSeoData.length) {
            return res.status(404).json({ message: "No listing SEO data found." });
        }
        const excelData = listingSeoData.map(item => ({
            ListingName: item.name,
            PageTitle: item.page_title,
            MetaTitle: item.meta_title,
            MetaKeywords: item.meta_keywords,
            MetaDescription: item.meta_description
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ListingSEO");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=listing_seo_data.xlsx");
        return res.send(buffer);
    }
    catch (error) {
        console.error("Export Error:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Error exporting listing SEO data.");
    }
});
exports.exportListingSeoDetails = exportListingSeoDetails;
const getListingSeoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listing_id } = req.query;
        const listing_seo_data = yield listingseo_schema_1.default.findOne({
            listing_id: listing_id,
        });
        const listing_details = yield listing_schema_1.default.findOne({
            listing_unique_id: listing_id,
        });
        if (!listing_details) {
            return (0, apiResponse_1.ErrorResponse)(res, "listing Seo not found");
        }
        let data = {
            listing_details,
            listing_seo_data
        };
        return (0, apiResponse_1.successResponse)(res, "listing Seo fetched successfully", data);
    }
    catch (error) {
        console.error("Error fetching homepage seo:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the homepage seo.");
    }
});
exports.getListingSeoDetails = getListingSeoDetails;
const getListingSeoList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const pageNumber = Math.max(1, parseInt(page, 10));
        const limitNumber = Math.max(1, parseInt(limit, 10));
        const skip = (pageNumber - 1) * limitNumber;
        const searchTerm = search.trim();
        const matchStage = searchTerm
            ? {
                $match: {
                    name: { $regex: new RegExp(searchTerm, "i") }, // Case-insensitive listing name match
                },
            }
            : null;
        const pipeline = [];
        if (matchStage) {
            pipeline.push(matchStage);
        }
        pipeline.push({
            $lookup: {
                from: "listingseos",
                localField: "listing_unique_id",
                foreignField: "listing_id",
                as: "seoData",
            },
        }, {
            $unwind: {
                path: "$seoData",
                preserveNullAndEmptyArrays: true,
            },
        }, {
            $project: {
                name: 1,
                _id: 1,
                listing_unique_id: 1,
                "seoData.page_title": { $ifNull: ["$seoData.page_title", "N/A"] },
                "seoData.meta_title": { $ifNull: ["$seoData.meta_title", "N/A"] },
                "seoData.meta_description": { $ifNull: ["$seoData.meta_description", "N/A"] },
                "seoData.meta_keywords": { $ifNull: ["$seoData.meta_keywords", "N/A"] },
            },
        }, { $skip: skip }, { $limit: limitNumber });
        const categorySeoData = yield listing_schema_1.default.aggregate(pipeline);
        const totalRecords = yield listing_schema_1.default.countDocuments(matchStage ? matchStage.$match : {});
        const totalPages = Math.ceil(totalRecords / limitNumber);
        const excelData = categorySeoData.map((item) => {
            var _a, _b, _c, _d;
            return ({
                ListingName: item.name,
                listingId: item.listing_unique_id || "N/A",
                PageTitle: ((_a = item.seoData) === null || _a === void 0 ? void 0 : _a.page_title) || "N/A",
                MetaTitle: ((_b = item.seoData) === null || _b === void 0 ? void 0 : _b.meta_title) || "N/A",
                MetaKeywords: ((_c = item.seoData) === null || _c === void 0 ? void 0 : _c.meta_keywords) || "N/A",
                MetaDescription: ((_d = item.seoData) === null || _d === void 0 ? void 0 : _d.meta_description) || "N/A",
            });
        });
        return (0, apiResponse_1.successResponse)(res, "Listing SEO fetched successfully", {
            data: excelData,
            totalLists: totalRecords,
            totalPages,
            currentPage: pageNumber,
        });
    }
    catch (error) {
        console.error("Error fetching listing SEO:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the listing SEO.");
    }
});
exports.getListingSeoList = getListingSeoList;
const importListingSeo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // ~10ms per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Listing Seo Import", "processing");
        // Immediate response
        res.status(200).json({
            message: `Your file with ${totalRecords} listing SEO records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });
        // Background import
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            for (const row of data) {
                const { ListingName, PageTitle, MetaTitle, MetaKeywords, MetaDescription } = row;
                if (!ListingName || typeof ListingName !== "string")
                    continue;
                try {
                    const existingListing = yield listing_schema_1.default.findOne({ name: ListingName.trim() });
                    if (!existingListing) {
                        console.warn(`Listing not found: ${ListingName}`);
                        continue;
                    }
                    const seoData = {
                        listing_id: existingListing.listing_unique_id,
                        page_title: PageTitle || "",
                        meta_title: MetaTitle || "",
                        meta_description: MetaDescription || "",
                        meta_keywords: MetaKeywords || ""
                    };
                    const existingSeo = yield listingseo_schema_1.default.findOne({ listing_id: existingListing.listing_unique_id });
                    if (existingSeo) {
                        yield listingseo_schema_1.default.findByIdAndUpdate(existingSeo._id, seoData, { new: true });
                    }
                    else {
                        yield listingseo_schema_1.default.create(seoData);
                    }
                }
                catch (err) {
                    console.error(`Error processing SEO for listing: ${ListingName}`, err);
                }
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "ListingSeo", "Import", `Update Listing Seo Details successfully`);
            console.log("Listing SEO import complete.");
            const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Listing Seo Import", "completed");
        }), 100); // small delay to trigger background processing
    }
    catch (error) {
        console.error("Top-level listing SEO import error:", error);
        return res.status(500).json({ message: "Error importing listing SEO", error: error.message });
    }
});
exports.importListingSeo = importListingSeo;
//# sourceMappingURL=seo.controller.js.map