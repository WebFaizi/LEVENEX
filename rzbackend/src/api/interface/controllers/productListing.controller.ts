import e, { Request, Response } from "express";
import { successResponse,ErrorResponse } from "../../helper/apiResponse";
import { storeProductModel,listingProductListModel,productgDetailsModel,updateProductModel,importProductModel,userProductListModel,removeProductImageModel} from "../../domain/models/product.model";
import { upload } from "../../services/upload.service";
import ListingsSchema from "../../domain/schema/listing.schema";
import { convertToWebpAndSave } from "../../services/imageService";
import ProductSchema from "../../domain/schema/product.schema";
import {storeUserActionActivity} from "../../services/userActionActivity.service";
import importFileStatusSchema from "../../domain/schema/importFileStatus.schema";
import path from "path"
import mongoose from 'mongoose';
import fs from "fs";
import { env } from "process";
import * as XLSX from "xlsx";

interface FileWithBuffer extends Express.Multer.File {
    buffer: Buffer;
}

interface importListingData{
    product_name: string;
    product_description: string;
    product_price: string;
    product_listing_id: string;
    product_category_id: string;
}

export const removeProductImage = async (req: Request, res: Response) => {
    try {
        const { image_name } = req.body;

        if (!image_name) {
            return ErrorResponse(res, "Image name is required.");
        }

        // Assuming images are stored in this folder
        const uploadDir = path.join(__dirname, '../../../../uploads/product');
        const imagePath = path.join(uploadDir, image_name);

        // Delete image file if exists
        if (fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
            } catch (error) {
                console.error("Error deleting image file:", error);
                return ErrorResponse(res, "Failed to delete image file.");
            }
        } else {
            console.warn("Image file not found:", imagePath);
            // Optionally: You can treat this as error or ignore
        }

        // Call model to remove image data from DB or perform further cleanup
        await removeProductImageModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Product image removed successfully", result);
        });
    } catch (err: any) {
        return ErrorResponse(res, err.message || "An unexpected error occurred");
    }
};

export const userProductList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await userProductListModel(req.user,search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const importProduct = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const data: importListingData[] = rawData.map((item) => ({
            unique_id :  Number(item['Product Id'] || ''),
            product_name: String(item["Product Name"] || ""),
            product_category_id: String(item["Category Name"] || ""),
            product_listing_id: String(item["Listing Name"] || ""),
            product_description: String(item["Product Description"] || ""),
            product_price: String(item["Product Price"] || ""),
        }));

        const totalRecords = data.length;
        const avgTimePerRecord = 0.015; // seconds per record (adjust based on your system)
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        await importFileStatusSchema.create({
            module_name: "Product",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // ✅ Send immediate response to the user
        res.status(200).json({
           
            message: `Your file with ${totalRecords} products is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        // ✅ Background processing
        setTimeout(async () => {
            try {
                await importProductModel(req.user, data, (error: any, result: any) => {
                    if (error) {
                        console.error("Import Error:", error.message);
                    } else {
                        storeUserActionActivity(req.user.userId, "Listing", "Import", `Product imported successfully`);
                        importFileStatusSchema.deleteOne({ module_name: "Product" });
                        console.log(`Product import completed. Total records: ${totalRecords}`);
                    }
                });
            } catch (bgError: any) {
                console.error("Background import failed:", bgError.message);
            }
        }, 100);

    } catch (error: any) {
        return res.status(500).json({ message: "Error importing products", error: error.message });
    }
};

export const listingProductDetails = async (req: Request, res: Response) => {
    try {

        const { product_id } = req.params;

       productgDetailsModel(product_id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Product details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};

export const listingProductList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await listingProductListModel(search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeProductByUser = async (req: Request, res: Response) => {
    try {
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/product";

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (!req.body.product_images) {
            req.body.product_images = [];
        }

        for (const file of files) {
            // Convert to webp and save
            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            req.body.product_images.push(savePath);
        }

        const categories = await storeProductModel(req.body, (error: any, result: any) => {
            if (error) {
                ErrorResponse(res, error.message);
            }
            return successResponse(res, "Listing stored in Database successfully", result);
        });

    } catch (error) {
        ErrorResponse(res, 'An error occurred during user registration.');
    }
}

export const storeProductListing = async (req: Request, res: Response) => {
    try {

        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/product";

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (!req.body.product_images) {
            req.body.product_images = [];
        }

        for (const file of files) {
            // Convert to webp and save
            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            req.body.product_images.push(savePath);
        }

        const categories = await storeProductModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            storeUserActionActivity(req.user.userId, "Product", "Create", `new Product successfully`);
            return successResponse(res, "Listing stored in Database successfully", result);
        });

    } catch (error) {
        ErrorResponse(res, 'An error occurred during user registration.');
    }
}

export const updateProductListing = async (req: Request, res: Response) => {
    try {
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/product";

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (!req.body.product_images) {
            req.body.product_images = [];
        }

        // Convert and save new images only (no deletion of old images)
        for (const file of files) {
            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            req.body.product_images.push(savePath);
        }

        await updateProductModel(req.body, (error: any, result: any) => {
            if (error) {
                console.log(error.message);
                return ErrorResponse(res, error.message);
            }
            storeUserActionActivity(req.user.userId, "Product", "Update", `Update Product Details successfully`);
            return successResponse(res, "Listing updated in Database successfully", result);
        });

    } catch (error) {
        console.error("Error:", error);
        return ErrorResponse(res, 'An error occurred during product update.');
    }
}

export const deleteProductListing = async (req: Request, res: Response) => {
    try {
        const { product_ids } = req.body;

        if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Product ID.");
        }

        // Fetch products to delete
        const products = await ProductSchema.find({ _id: { $in: product_ids } });

        // Delete images for each product
        for (const product of products) {
            if (product.product_images && Array.isArray(product.product_images)) {
                for (const imagePath of product.product_images) {
                    if (fs.existsSync(imagePath)) {
                        try {
                            fs.unlinkSync(imagePath);
                        } catch (err) {
                            console.error(`Error deleting image file ${imagePath}:`, err);
                            // Optional: continue deleting others even if one fails
                        }
                    }
                }
            }
        }

        // Delete product documents
        const result = await ProductSchema.deleteMany({ _id: { $in: product_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No product found with the provided IDs.");
        }

        storeUserActionActivity(req.user.userId, "Product", "Delete", `Deleted Product Listing(s) successfully`);

        return successResponse(res, `Successfully deleted Listings(ies).`, result.deletedCount);

    } catch (error) {
        console.error(error);
        return ErrorResponse(res, 'An error occurred during product deletion.');
    }
};

export const deleteAllProduct = async (req: Request, res: Response) => {
    try {
        // Delete all product documents from DB
        const result = await ProductSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No products found to delete.");
        }

        // Path to product upload directory
        const uploadDir = path.join(__dirname, '../../../../uploads/product');

        // Check if folder exists
        if (fs.existsSync(uploadDir)) {
            // Read all files in the directory
            const files = fs.readdirSync(uploadDir);

            // Delete each file inside the folder
            for (const file of files) {
                const filePath = path.join(uploadDir, file);
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error(`Failed to delete file ${filePath}:`, err);
                }
            }
        }

        storeUserActionActivity(req.user.userId, "Product", "Delete", `All products deleted successfully`);

        return successResponse(res, `Successfully deleted all products and cleared images.`, result.deletedCount);

    } catch (error) {
        console.error(error);
        return ErrorResponse(res, "An error occurred while deleting all products.");
    }
};

export const exportProduct = async (req: Request, res: Response) => {
    try {
        const filter: Record<string, any> = {};

        // const products = await ProductSchema.find(filter)
        //     .select('product_name product_price product_description product_category_id product_listing_id')
        //     .populate('product_listing_id', 'name')
        //     .populate('product_category_id', 'name')
        //     .sort({ sortingOrder: -1 })
        //     .lean(); // important for performance

        const products = await ProductSchema.aggregate([
            { $match: filter },

            {
                $lookup: {
                from: "categories",
                localField: "product_category_id",
                foreignField: "unique_id",
                as: "product_category_id"
                }
            },
            {
                $unwind: {
                path: "$product_category_id",
                preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                from: "listings",
                localField: "product_listing_id",
                foreignField: "listing_unique_id",
                as: "product_listing_id"
                }
            },
            {
                $unwind: {
                path: "$product_listing_id",
                preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { sortingOrder: -1 }
            }
        ]);        

            console.log("productsproductsproducts",products)
        const listingsData = products.map((product) => ({
            'Product Id' : product.unique_id || "N/A",  
            'Product Name': product.product_name || "N/A",
            'Product Price': product.product_price || "N/A",
            'Category Name': (product.product_category_id as { name?: string })?.name ?? "N/A",
            'Listing Name': (product.product_listing_id as { name?: string })?.name ?? "N/A",
            'Product Description': product.product_description || "N/A",
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(listingsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);
    } catch (error: any) {
        console.error("Error exporting listings:", error);
        return res.status(500).json({ message: "Error exporting listings", error: error.message });
    }
};





