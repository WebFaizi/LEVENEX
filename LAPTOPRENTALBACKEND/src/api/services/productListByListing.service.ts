import productSchema from "../domain/schema/product.schema";
import categorySchema from "../domain/schema/category.schema";
import { replacePlaceholders } from "./ReplaceText.service";
import mongoose from "mongoose";

export const getProductsByListing = async (
    listing_id: any | null,
    page: number = 1,
    limit: number = 10
): Promise<object> => {
    try {
        if (!listing_id) {
            return { error: "listing ID is required" };
        }

        const pageNumber = Math.max(1, page);
        const limitNumber = Math.max(1, limit);
        const skip = (pageNumber - 1) * limitNumber;

        // const listing_details = await productSchema.find({ product_listing_id: listing_id })
        //     .populate("product_listing_id")
        //     .populate("product_category_id")
        //     .skip(skip)
        //     .limit(limitNumber)
        //     .exec();

        const listing_details = await productSchema.aggregate([
        {
            $match: {
            product_listing_id: listing_id // This should be a string or number matching listing_unique_id
            }
        },
        {
            $lookup: {
            from: "listings",
            localField: "product_listing_id",
            foreignField: "listing_unique_id",
            as: "listing_details"
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
            as: "category_details"
            }
        },
        {
            $unwind: {
            path: "$category_details",
            preserveNullAndEmptyArrays: true
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        }
        ]);


        if (!listing_details || listing_details.length === 0) {
            return { error: "No products found" };
        }

        const totalRecords = await productSchema.countDocuments({ product_listing_id: listing_id });
        const totalPages = Math.ceil(totalRecords / limitNumber);

        const formattedListingDetails = listing_details.map(product => {
            const obj = product;
        
            return {
                ...obj,
                product_images: Array.isArray(obj.product_images) && obj.product_images.length > 0
                    ? obj.product_images.map((img: any) => `${process.env.BASE_URL}${img}`)
                    : [`${process.env.BASE_URL}/uploads/default.jpg`]
            };
        })

        return {
            data: formattedListingDetails,
            currentPage: pageNumber,
            totalPages,
            totalRecords,
            limit: limitNumber,
        };
    } catch (error) {
        console.error("Error fetching category details:", error);
        return { error: "Failed to fetch category details" };
    }
};

export default getProductsByListing;