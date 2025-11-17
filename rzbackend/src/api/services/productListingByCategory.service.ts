import productSchema from "../domain/schema/product.schema";
import categorySchema from "../domain/schema/category.schema";
import { replacePlaceholders } from "./ReplaceText.service";
import mongoose from "mongoose";
 
export const getProductsByCategory = async (
    category_id: any | null,
    page: number = 1,
    limit: number = 10
): Promise<object> => {
    try {
        if (!category_id) {
            return { error: "Category ID is required" };
        }
 
        const category_details = await categorySchema.findOne({ unique_id: category_id }).lean();
        if (!category_details) {
            return { error: "Category not found" };
        }
 
        const pageNumber = Math.max(1, page);
        const limitNumber = Math.max(1, limit);
        const skip = (pageNumber - 1) * limitNumber;
 
        const pipeline: any[] = [
            {
                $match: {
                    product_category_id: category_details.unique_id
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
                    path: "$listing_details",
                    preserveNullAndEmptyArrays: true
                }
            },
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
                    path: "$category_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: skip },
                        { $limit: limitNumber },
                        {
                            $addFields: {
                                product_images: {
                                    $map: {
                                        input: "$product_images",
                                        as: "img",
                                        in: { $concat: [process.env.BASE_URL || "", "$$img"] }
                                    }
                                }
                            }
                        }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];
 
        const result = await productSchema.aggregate(pipeline).exec();
 
        const formattedProducts = result[0]?.paginatedResults || [];
        const totalRecords = result[0]?.totalCount?.[0]?.count || 0;
        const totalPages = Math.ceil(totalRecords / limitNumber);
 
        return {
            data: formattedProducts,
            currentPage: pageNumber,
            totalPages,
            totalRecords,
            limit: limitNumber
        };
 
    } catch (error) {
        console.error("Error fetching category details:", error);
        return { error: "Failed to fetch category details" };
    }
};
 
export default getProductsByCategory;
 