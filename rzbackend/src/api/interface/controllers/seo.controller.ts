import { updateHomepageSeoModel, serverSideMetaDetailsModel} from "../../domain/models/homepageSeo.model";
import { updateCategorySeoModel } from "../../domain/models/categorySeo.model";
import { updateSubdomainCategorySeoModel } from "../../domain/models/subdomainCategorySeo.model";
import { updateListingSeoModel } from "../../domain/models/listingSeo.model";
import { Request, Response } from "express";
import {insertOrUpdateExportTaskService} from "../../services/insertExportTaskService.service";
import { successResponse,ErrorResponse } from "../../helper/apiResponse";
import HomepageSeoSchema from "../../domain/schema/homepage_seo.schema";
import categoryseoSchema from "../../domain/schema/categoryseo.schema";
import listingseoSchema from "../../domain/schema/listingseo.schema";
import subdomaincategoryseoSchema from "../../domain/schema/subdomainCategorySeo.schema";
import categorySchema from "../../domain/schema/category.schema";
import listingSchema from "../../domain/schema/listing.schema";
import {storeUserActionActivity} from "../../services/userActionActivity.service";
import SettingSchema from '../../domain/schema/setting.schema';
import * as XLSX from "xlsx";
import path from "path";

export const serverSideMetaDetails = async (req: Request, res: Response) => {
    try {
        serverSideMetaDetailsModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Fetched SEO meta details successfully!", result);
        });
    } catch (error) {
        console.error(error);
        return ErrorResponse(res, "An error occurred while fetching SEO meta details.");
    }
};

//subdomain seo
export const updateSubdomainCategorySeo = async (req: Request, res: Response) => {
    try {
        
        updateSubdomainCategorySeoModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            storeUserActionActivity(req.user.userId, "SubdomainSeo", "Update", `Update subdomain category Seo Details successfully`);
            return successResponse(res, "Update Subdomain Category Seo successfully!", []);
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const exportSubcategoryCategorySeoDetails = async (req: Request, res: Response) => {
    try {
        const categorySeoData = await categorySchema.aggregate([
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

        console.log(categorySeoData)

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
    } catch (error) {
        console.error("Export Error:", error);
        return ErrorResponse(res, "Error exporting category SEO data.");
    }
};

export const getSubdomainCategorySeoDetails = async (req: Request, res: Response) => {
    try {
        const {category_id} = req.query;
        
        const category_details = await categorySchema.findOne({
            unique_id: category_id,
        });

        const category_seo_details = await subdomaincategoryseoSchema.findOne({
            category_id: category_id,
        });

        let data = {
            category_details,
            category_seo_details
        }
        return successResponse(res, "Homepage Seo fetched successfully", data);
    } catch (error) {
        console.error("Error fetching homepage seo:", error);
        ErrorResponse(res, "An error occurred while fetching the homepage seo.");
    }
}

export const getSubdomainCategorySeoList = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const pageNumber = Math.max(1, parseInt(page as string, 10));
        const limitNumber = Math.max(1, parseInt(limit as string, 10));
        const skip = (pageNumber - 1) * limitNumber;
        const searchTerm = (search as string).trim();

        const matchStage = searchTerm
            ? {
                  $match: {
                      name: { $regex: new RegExp(searchTerm, "i") }, // case-insensitive match
                  },
              }
            : null;

        const pipeline: any[] = [];

        if (matchStage) {
            pipeline.push(matchStage);
        }

        pipeline.push(
            {
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
            },
            { $skip: skip },
            { $limit: limitNumber }
        );

        const categorySeoData = await categorySchema.aggregate(pipeline);

        const totalRecords = await categorySchema.countDocuments(
            matchStage ? matchStage.$match : {}
        );
        const totalPages = Math.ceil(totalRecords / limitNumber);

        const excelData = categorySeoData.map((item) => ({
            CategoryName: item.name,
            categoryId: item.unique_id || null,
            PageTitle: item.seoData?.page_title || null,
            MetaTitle: item.seoData?.meta_title || null,
            MetaKeywords: item.seoData?.meta_keywords || null,
            MetaDescription: item.seoData?.meta_description || null,
            SearchByKeyword: item.seoData?.search_by_keyword || null,
            SearchByKeywordMetaDes: item.seoData?.search_by_keyword_meta_des || null,
            SearchByKeywordMetaKeywords: item.seoData?.search_by_keyword_meta_keyword || null,
            ProductTitle: item.seoData?.product_title || null,
            ProductMetaDescription: item.seoData?.product_meta_description || null,
            ProductMetaKeywords: item.seoData?.product_meta_keywords || null,
        }));

        return successResponse(res, "Subdomain category SEO fetched successfully", {
            data: excelData,
            totalLists: totalRecords,
            totalPages,
            currentPage: pageNumber,
        });
    } catch (error) {
        console.error("Error fetching subdomain category SEO:", error);
        ErrorResponse(res, "An error occurred while fetching the subdomain category SEO.");
    }
};


export const importSubdomainCategorySeo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.02; // Slightly heavier operation
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        res.status(200).json({
            message: `Your file with ${totalRecords} subdomain category SEO record(s) is being processed. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        setTimeout(async () => {
            for (const row of data) {
                const {
                    CategoryName,
                    PageTitle,
                    MetaTitle,
                    MetaKeywords,
                    MetaDescription,
                    SearchByKeyword,
                    SearchByKeywordMetaDes,
                    SearchByKeywordMetaKeywords,
                    ProductTitle,
                    ProductMetaTitle,
                    ProductMetaDescription,
                    ProductMetaKeywords
                } = row;

                try {
                    const existingCategory = await categorySchema.findOne({ name: CategoryName });

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

                    const existingSeo = await subdomaincategoryseoSchema.findOne({ category_id });

                    if (existingSeo) {
                        await subdomaincategoryseoSchema.findByIdAndUpdate(existingSeo._id, seoData, { new: true });
                    } else {
                        await subdomaincategoryseoSchema.create(seoData);
                    }

                } catch (err) {
                    console.error(`Error updating SEO for subdomain category: ${CategoryName}`, err);
                }
            }
            storeUserActionActivity(req.user.userId, "SubdomainSeo", "Import", `Import data of subdomain successfully!`);
            console.log("Subdomain category SEO import completed.");
        }, 100); // Small delay before starting background task

    } catch (error: any) {
        console.error("Error in importSubdomainCategorySeo:", error);
        return res.status(500).json({ message: "Error importing subdomain category SEO", error: error.message });
    }
};

//category seo

export const updateCategorySeo = async (req: Request, res: Response) => {
    try {
        
        updateCategorySeoModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            storeUserActionActivity(req.user.userId, "CategorySeo", "Update", `Update category Seo Details successfully`);
            return successResponse(res, "Update Category Seo successfully!", []);
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const exportCategorySeoDetails = async (req: Request, res: Response) => {
    try {
        const categorySeoData = await categorySchema.aggregate([
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
    } catch (error) {
        console.error("Export Error:", error);
        return ErrorResponse(res, "Error exporting category SEO data.");
    }
};

export const getCategorySeoDetails = async (req: Request, res: Response) => {
    try {
        const {category_seo_type,category_id} = req.query;
        let homepageSeo : any = await categoryseoSchema.findOne({
            category_seo_type: category_seo_type,
            category_id: category_id,
        });
        

        if (!homepageSeo) {
            homepageSeo =  { 
                uniqueId: category_id,
                categoryId:  category_id,
                PageTitle:   null,
                MetaTitle:  null,
                MetaKeywords:  null,
                MetaDescription:  null,
                SearchByKeyword:  null,
                SearchByKeywordMetaDes:  null,
                SearchByKeywordMetaKeywords:  null,
                ProductTitle:  null,
                ProductMetaDescription:  null,
                ProductMetaKeywords:  null
            }
        }

        return successResponse(res, "Homepage Seo fetched successfully", homepageSeo);
    } catch (error) {
        console.error("Error fetching homepage seo:", error);
        ErrorResponse(res, "An error occurred while fetching the homepage seo.");
    }
}

export const getCategorySeoList = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);
        const searchTerm = (search as string).trim();

        const matchStage = searchTerm
            ? {
                  $match: {
                      name: { $regex: new RegExp(searchTerm, "i") }, // Case-insensitive partial match
                  },
              }
            : null;

        const pipeline: any[] = [];

        if (matchStage) {
            pipeline.push(matchStage);
        }

        pipeline.push(
            {
                $lookup: {
                    from: "categoryseos",
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
                $group: {
                    _id: "$unique_id",
                    name: { $first: "$name" },
                    unique_id: { $first: "$unique_id" },
                    seoData: { $first: "$seoData" }
                }
            },
            {
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
            },
            { $skip: (pageNumber - 1) * limitNumber },
            { $limit: limitNumber }
        );

        const categorySeoData = await categorySchema.aggregate(pipeline);

        const totalRecords = await categorySchema.countDocuments(
            matchStage ? matchStage.$match : {}
        );

        const totalPages = Math.ceil(totalRecords / limitNumber);

        const excelData = categorySeoData.map((item) => ({
            CategoryName: item.name,
            uniqueId: item?.unique_id || null,
            categoryId: item.seoData?.category_id || item?.unique_id,
            PageTitle: item.seoData?.page_title || null,
            MetaTitle: item.seoData?.meta_title || null,
            MetaKeywords: item.seoData?.meta_keywords || null,
            MetaDescription: item.seoData?.meta_description || null,
            SearchByKeyword: item.seoData?.search_by_keyword || null,
            SearchByKeywordMetaDes: item.seoData?.search_by_keyword_meta_des || null,
            SearchByKeywordMetaKeywords: item.seoData?.search_by_keyword_meta_keyword || null,
            ProductTitle: item.seoData?.product_title || null,
            ProductMetaDescription: item.seoData?.product_meta_description || null,
            ProductMetaKeywords: item.seoData?.product_meta_keywords || null,
        }));

        return successResponse(res, "Category SEO list fetched successfully", {
            data: excelData,
            totalLists: totalRecords,
            totalPages,
            currentPage: pageNumber,
        });
    } catch (error) {
        console.error("Error fetching category SEO list:", error);
        ErrorResponse(res, "An error occurred while fetching the category SEO list.");
    }
};

export const importCategorySeo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // ~10ms per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        const startResult = await insertOrUpdateExportTaskService("Category Seo Import", "processing");
        // Send immediate response
        res.status(200).json({
            message: `Your file with ${totalRecords} category SEO records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        // Background import
        setTimeout(async () => {
            for (const row of data) {
                const {
                    CategoryName,
                    PageTitle,
                    MetaTitle,
                    MetaKeywords,
                    MetaDescription,
                    SearchByKeyword,
                    SearchByKeywordMetaDes,
                    SearchByKeywordMetaKeywords,
                    ProductTitle,
                    ProductMetaTitle,
                    ProductMetaDescription,
                    ProductMetaKeywords
                } = row;

                if (!CategoryName || typeof CategoryName !== "string") continue;

                try {
                    const existingCategory = await categorySchema.findOne({ name: CategoryName.trim() });

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
                    
                    const existingSeo = await categoryseoSchema.findOne({ category_id: existingCategory.unique_id });
                    
                   
                    if (existingSeo) {
                        await categoryseoSchema.findByIdAndUpdate(existingSeo._id, seoData, { new: true });
                    } else {
                        await categoryseoSchema.create(seoData);
                    }                

                } catch (err) {
                    console.error(`Error processing SEO for category: ${CategoryName}`, err);
                }
            }
            storeUserActionActivity(req.user.userId, "CategorySeo", "Import", `Import category Seo Details successfully`);
            console.log("Category SEO import complete.");
             const startResult = await insertOrUpdateExportTaskService("Category Seo Import", "completed");
        }, 100); // Slight delay to avoid blocking

    } catch (error: any) {
        console.error("Top-level import error:", error);
        return res.status(500).json({ message: "Error importing category SEO", error: error.message });
    }
};

//homepage seo 
export const updateHomePageSeo = async (req: Request, res: Response) => {
    try {
        
        updateHomepageSeoModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            storeUserActionActivity(req.user.userId, "HomePage", "Update", `Update Home Page Seo Details successfully`);
            return successResponse(res, "Update Homepage Seo successfully!", []);
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getHomePageSeo = async (req: Request, res: Response) => {
    try {
        const homepageSeo = await HomepageSeoSchema.find();

        if (!homepageSeo) {
            return ErrorResponse(res, "Homepage Seo not found");
        }

        return successResponse(res, "Homepage Seo fetched successfully", homepageSeo);
    } catch (error) {
        console.error("Error fetching homepage seo:", error);
        ErrorResponse(res, "An error occurred while fetching the homepage seo.");
    }
}

export const exportHomepageSeoData = async (req: Request, res: Response) => {
    try {
        const homepageData = await HomepageSeoSchema.find({}, {
            page_title: 1,
            meta_title: 1,
            meta_description: 1,
            meta_keywords: 1,
            _id: 0
        }).lean(); // lean() boosts performance by skipping Mongoose document wrapping

        if (!homepageData.length) {
            return res.status(404).json({ message: "No homepage SEO data found." });
        }

         const [settingData] = await Promise.all([SettingSchema.findOne()]);

        // Map the data for Excel output
        const excelData = homepageData.map(item => ({
            PageTitle: item.page_title || "N/A",
            MetaTitle: item.meta_title || "N/A",
            MetaDescription: item.meta_description || "N/A",
            MetaKeywords: item.meta_keywords || "N/A",
            WebsiteLogo: settingData?.website_logo ? path.basename(settingData.website_logo) : "",
            MobileLogo: settingData?.mobile_logo ? path.basename(settingData.mobile_logo) : "",
            FavIcon: settingData?.fav_icon ? path.basename(settingData.fav_icon) : "",
            PreLoader: settingData?.pre_loader ? path.basename(settingData?.pre_loader) : "",
            
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "HomepageSEO");

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        res.setHeader("Content-Disposition", "attachment; filename=homepage_seo.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(buffer);
    } catch (error: any) {
        console.error("Export Error:", error);
        return res.status(500).json({ message: "Error exporting homepage SEO data", error: error.message });
    }
};

export const importHomepageSeoData = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

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
        setTimeout(async () => {
            for (const row of data) {
                const {
                    PageTitle,
                    MetaTitle,
                    MetaDescription,
                    MetaKeywords,
                    WebsiteLogo,
                    MobileLogo,
                    FavIcon,
                    PreLoader
                } = row;

                try {
                    const seoData = {
                        page_title: PageTitle || "",
                        meta_title: MetaTitle || "",
                        meta_description: MetaDescription || "",
                        meta_keywords: MetaKeywords || ""
                    };

                    const existing = await HomepageSeoSchema.findOne();

                    if (existing) {
                        await HomepageSeoSchema.updateOne({}, seoData);
                    } else {
                        await HomepageSeoSchema.create(seoData);
                    }
                    const uploadDir = "uploads/website_default_images/";
                    const settingUpdate = await SettingSchema.findOne();
                    const settingFields = {
                        website_logo: WebsiteLogo ? uploadDir + WebsiteLogo : settingUpdate?.website_logo,
                        mobile_logo: MobileLogo ? uploadDir + MobileLogo : settingUpdate?.mobile_logo,
                        fav_icon: FavIcon ? uploadDir + FavIcon : settingUpdate?.fav_icon,
                        pre_loader: PreLoader ? uploadDir + PreLoader : settingUpdate?.pre_loader
                    };

                    if (settingUpdate) {
                        await SettingSchema.updateOne({}, settingFields);
                    } else {
                        await SettingSchema.create(settingFields);
                    }
                } catch (err) {
                    console.error("Error importing homepage SEO data row:", err);
                }
            }
            storeUserActionActivity(req.user.userId, "Homepage", "Import", `Import homepage Seo Details successfully`);
            console.log("Homepage SEO import completed.");
        }, 100); // slight delay for background start

    } catch (error: any) {
        console.error("Top-level error in homepage SEO import:", error);
        return res.status(500).json({ message: "Error importing homepage SEO", error: error.message });
    }
};

//end homepage seo


//lsting seo

export const updateListingSeo = async (req: Request, res: Response) => {
    try {
        
        updateListingSeoModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            storeUserActionActivity(req.user.userId, "ListingSeo", "Update", `Update Listing Seo Details successfully`);
            return successResponse(res, "Update Listing Seo successfully!", []);
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const exportListingSeoDetails = async (req: Request, res: Response) => {
    try {
        const listingSeoData = await listingSchema.aggregate([
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
    } catch (error: any) {
        console.error("Export Error:", error);
        return ErrorResponse(res, "Error exporting listing SEO data.");
    }
};

export const getListingSeoDetails = async (req: Request, res: Response) => {
    try {
        const {listing_id} = req.query;
        const listing_seo_data = await listingseoSchema.findOne({
            listing_id: listing_id,
        });
        const listing_details = await listingSchema.findOne({
            listing_unique_id: listing_id,
        });

        if (!listing_details) {
            return ErrorResponse(res, "listing Seo not found");
        }

        let data = {
            listing_details,
            listing_seo_data
        }

        return successResponse(res, "listing Seo fetched successfully", data);
    } catch (error) {
        console.error("Error fetching homepage seo:", error);
        ErrorResponse(res, "An error occurred while fetching the homepage seo.");
    }
}

export const getListingSeoList = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const pageNumber = Math.max(1, parseInt(page as string, 10));
        const limitNumber = Math.max(1, parseInt(limit as string, 10));
        const skip = (pageNumber - 1) * limitNumber;
        const searchTerm = (search as string).trim();

        const matchStage = searchTerm
            ? {
                  $match: {
                      name: { $regex: new RegExp(searchTerm, "i") }, // Case-insensitive listing name match
                  },
              }
            : null;

        const pipeline: any[] = [];

        if (matchStage) {
            pipeline.push(matchStage);
        }

        pipeline.push(
            {
                $lookup: {
                    from: "listingseos",
                    localField: "listing_unique_id",
                    foreignField: "listing_id",
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
                    _id: 1,
                    listing_unique_id: 1,
                    "seoData.page_title": { $ifNull: ["$seoData.page_title", "N/A"] },
                    "seoData.meta_title": { $ifNull: ["$seoData.meta_title", "N/A"] },
                    "seoData.meta_description": { $ifNull: ["$seoData.meta_description", "N/A"] },
                    "seoData.meta_keywords": { $ifNull: ["$seoData.meta_keywords", "N/A"] },
                },
            },
            { $skip: skip },
            { $limit: limitNumber }
        );

        const categorySeoData = await listingSchema.aggregate(pipeline);

        const totalRecords = await listingSchema.countDocuments(
            matchStage ? matchStage.$match : {}
        );
        const totalPages = Math.ceil(totalRecords / limitNumber);

        const excelData = categorySeoData.map((item) => ({
            ListingName: item.name,
            listingId: item.listing_unique_id || "N/A",
            PageTitle: item.seoData?.page_title || "N/A",
            MetaTitle: item.seoData?.meta_title || "N/A",
            MetaKeywords: item.seoData?.meta_keywords || "N/A",
            MetaDescription: item.seoData?.meta_description || "N/A",
        }));

        return successResponse(res, "Listing SEO fetched successfully", {
            data: excelData,
            totalLists: totalRecords,
            totalPages,
            currentPage: pageNumber,
        });
    } catch (error) {
        console.error("Error fetching listing SEO:", error);
        ErrorResponse(res, "An error occurred while fetching the listing SEO.");
    }
};

export const importListingSeo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // ~10ms per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        const startResult = await insertOrUpdateExportTaskService("Listing Seo Import", "processing");
        // Immediate response
        res.status(200).json({
            message: `Your file with ${totalRecords} listing SEO records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        // Background import
        setTimeout(async () => {
            for (const row of data) {
                const {
                    ListingName,
                    PageTitle,
                    MetaTitle,
                    MetaKeywords,
                    MetaDescription
                } = row;

                if (!ListingName || typeof ListingName !== "string") continue;

                try {
                    const existingListing = await listingSchema.findOne({ name: ListingName.trim() });

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

                    const existingSeo = await listingseoSchema.findOne({ listing_id: existingListing.listing_unique_id });

                    if (existingSeo) {
                        await listingseoSchema.findByIdAndUpdate(existingSeo._id, seoData, { new: true });
                    } else {
                        await listingseoSchema.create(seoData);
                    }

                } catch (err) {
                    console.error(`Error processing SEO for listing: ${ListingName}`, err);
                }
            }
            storeUserActionActivity(req.user.userId, "ListingSeo", "Import", `Update Listing Seo Details successfully`);
            console.log("Listing SEO import complete.");
            const startResult = await insertOrUpdateExportTaskService("Listing Seo Import", "completed");
        }, 100); // small delay to trigger background processing

    } catch (error: any) {
        console.error("Top-level listing SEO import error:", error);
        return res.status(500).json({ message: "Error importing listing SEO", error: error.message });
    }
};
