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
exports.getProductsByCategory = void 0;
const product_schema_1 = __importDefault(require("../domain/schema/product.schema"));
const category_schema_1 = __importDefault(require("../domain/schema/category.schema"));
const getProductsByCategory = (category_id_1, ...args_1) => __awaiter(void 0, [category_id_1, ...args_1], void 0, function* (category_id, page = 1, limit = 10) {
    var _a, _b, _c, _d;
    try {
        if (!category_id) {
            return { error: "Category ID is required" };
        }
        const category_details = yield category_schema_1.default.findOne({ unique_id: category_id }).lean();
        if (!category_details) {
            return { error: "Category not found" };
        }
        const pageNumber = Math.max(1, page);
        const limitNumber = Math.max(1, limit);
        const skip = (pageNumber - 1) * limitNumber;
        const pipeline = [
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
        const result = yield product_schema_1.default.aggregate(pipeline).exec();
        const formattedProducts = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.paginatedResults) || [];
        const totalRecords = ((_d = (_c = (_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalCount) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.count) || 0;
        const totalPages = Math.ceil(totalRecords / limitNumber);
        return {
            data: formattedProducts,
            currentPage: pageNumber,
            totalPages,
            totalRecords,
            limit: limitNumber
        };
    }
    catch (error) {
        console.error("Error fetching category details:", error);
        return { error: "Failed to fetch category details" };
    }
});
exports.getProductsByCategory = getProductsByCategory;
exports.default = exports.getProductsByCategory;
//# sourceMappingURL=productListingByCategory.service.js.map