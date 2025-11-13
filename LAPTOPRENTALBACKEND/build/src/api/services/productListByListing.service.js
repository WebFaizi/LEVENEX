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
exports.getProductsByListing = void 0;
const product_schema_1 = __importDefault(require("../domain/schema/product.schema"));
const getProductsByListing = (listing_id_1, ...args_1) => __awaiter(void 0, [listing_id_1, ...args_1], void 0, function* (listing_id, page = 1, limit = 10) {
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
        const listing_details = yield product_schema_1.default.aggregate([
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
        const totalRecords = yield product_schema_1.default.countDocuments({ product_listing_id: listing_id });
        const totalPages = Math.ceil(totalRecords / limitNumber);
        const formattedListingDetails = listing_details.map(product => {
            const obj = product;
            return Object.assign(Object.assign({}, obj), { product_images: Array.isArray(obj.product_images) && obj.product_images.length > 0
                    ? obj.product_images.map((img) => `${process.env.BASE_URL}${img}`)
                    : [`${process.env.BASE_URL}/uploads/default.jpg`] });
        });
        return {
            data: formattedListingDetails,
            currentPage: pageNumber,
            totalPages,
            totalRecords,
            limit: limitNumber,
        };
    }
    catch (error) {
        console.error("Error fetching category details:", error);
        return { error: "Failed to fetch category details" };
    }
});
exports.getProductsByListing = getProductsByListing;
exports.default = exports.getProductsByListing;
//# sourceMappingURL=productListByListing.service.js.map