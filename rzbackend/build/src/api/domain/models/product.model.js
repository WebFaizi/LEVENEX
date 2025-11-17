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
exports.importProductModel = exports.updateProductModel = exports.storeProductModel = exports.productgDetailsModel = exports.listingProductListModel = exports.userProductListModel = exports.removeProductImageModel = void 0;
const product_schema_1 = __importDefault(require("../schema/product.schema"));
const listing_schema_1 = __importDefault(require("../schema/listing.schema"));
const category_schema_1 = __importDefault(require("../schema/category.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const process_1 = require("process");
const baseUrl = process_1.env.BASE_URL || "http://localhost:3000";
const getSingleIdFromName = (schema, name) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schema.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    return result ? result._id.toString() : null;
});
const getSingleUniqueIdFromName = (schema, name, type) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schema.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (type === "listing") {
        return result ? result.listing_unique_id.toString() : null;
    }
    return result ? result.unique_id : null;
});
const removeProductImageModel = (removeImage, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_id, image_name } = removeImage;
    try {
        const updatedProduct = yield product_schema_1.default.findByIdAndUpdate(product_id, { $pull: { product_images: image_name } }, // remove just this image
        { new: true } // return updated document
        );
        if (!updatedProduct) {
            return callback(new Error("Product not found."), null);
        }
        return callback(null, updatedProduct);
    }
    catch (err) {
        return callback(err, null);
    }
});
exports.removeProductImageModel = removeProductImageModel;
const userProductListModel = (loginUser, search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const skip = (page - 1) * limit;
        const userListings = yield listing_schema_1.default.find({ email: loginUser.email });
        const listingIds = userListings.map((listing) => listing.listing_unique_id);
        const users = yield product_schema_1.default.aggregate([
            // First filter by user's listing IDs BEFORE any lookups
            {
                $match: {
                    product_listing_id: { $in: listingIds },
                    $or: [
                        { product_name: { $regex: search || "", $options: "i" } },
                        { product_description: { $regex: search || "", $options: "i" } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "product_category_id",
                    foreignField: "unique_id",
                    as: "category_ids"
                }
            },
            {
                $lookup: {
                    from: "listings",
                    localField: "product_listing_id",
                    foreignField: "listing_unique_id",
                    as: "listing_ids"
                }
            },
            {
                $unwind: {
                    path: "$listing_ids",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    unique_id: 1,
                    product_name: 1,
                    product_images: 1,
                    product_description: 1,
                    product_price: 1,
                    product_listing_id: 1,
                    product_category_id: 1,
                    listing_ids: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    data: [{ $skip: skip }, { $limit: limit }, { $sort: { createdAt: -1 } }]
                }
            }
        ]).exec();
        const updatedUsers = (_a = users[0]) === null || _a === void 0 ? void 0 : _a.data.map((user) => {
            const userObject = Object.assign({}, user);
            if (Array.isArray(user === null || user === void 0 ? void 0 : user.product_images)) {
                const updatedImages = user.product_images.map((image) => `${baseUrl}/${image.replace(/\\/g, "/")}`);
                userObject.product_images = updatedImages;
            }
            return userObject;
        });
        return {
            data: updatedUsers,
            totalUsers: ((_c = (_b = users[0]) === null || _b === void 0 ? void 0 : _b.totalCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
            totalPages: Math.ceil(((_e = (_d = users[0]) === null || _d === void 0 ? void 0 : _d.totalCount[0]) === null || _e === void 0 ? void 0 : _e.count) / limit) || 0,
            currentPage: page
        };
    }
    catch (error) {
        console.error("Error fetching user product list:", error);
        return { data: [], totalUsers: 0, totalPages: 0, currentPage: page };
    }
});
exports.userProductListModel = userProductListModel;
const listingProductListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const skip = (page - 1) * limit;
        const result = yield product_schema_1.default.aggregate([
            {
                $lookup: {
                    from: "listings",
                    localField: "product_listing_id",
                    foreignField: "listing_unique_id",
                    as: "product_listing_id"
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
                $match: {
                    $or: [
                        { "product_listing_id.name": { $regex: search || "", $options: "i" } },
                        { "product_category_id.name": { $regex: search || "", $options: "i" } },
                        { product_name: { $regex: search || "", $options: "i" } }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$product_listing_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$product_category_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    product_name: 1,
                    product_images: 1,
                    product_description: 1,
                    product_price: 1,
                    status: 1,
                    unique_id: 1,
                    product_listing_id: {
                        name: "$product_listing_id.name",
                        _id: "$product_listing_id._id"
                    },
                    product_category_id: {
                        name: "$product_category_id.name",
                        _id: "$product_category_id._id"
                    }
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    data: [{ $skip: skip }, { $limit: limit }, { $sort: { createdAt: -1 } }]
                }
            }
        ]);
        const updatedUsers = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.data.map((user) => {
            const userObject = Object.assign({}, user);
            if (Array.isArray(user === null || user === void 0 ? void 0 : user.product_images)) {
                const updatedImages = user.product_images.map((image) => `${baseUrl}/${image.replace(/\\/g, "/")}`);
                userObject.product_images = updatedImages;
            }
            return userObject;
        });
        return {
            data: updatedUsers,
            totalUsers: ((_c = (_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
            totalPages: Math.ceil(((_e = (_d = result[0]) === null || _d === void 0 ? void 0 : _d.totalCount[0]) === null || _e === void 0 ? void 0 : _e.count) / limit) || 0,
            currentPage: page
        };
    }
    catch (error) {
        console.error(error);
    }
});
exports.listingProductListModel = listingProductListModel;
const productgDetailsModel = (product_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productDetails = (yield product_schema_1.default.aggregate([
            {
                $match: { _id: new mongoose_1.default.Types.ObjectId(product_id) }
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
                $project: {
                    product_name: 1,
                    product_images: 1,
                    product_description: 1,
                    product_price: 1,
                    status: 1,
                    product_listing_id: {
                        _id: "$product_listing_id._id",
                        name: "$product_listing_id.name",
                        listing_unique_id: "$product_listing_id.listing_unique_id"
                    },
                    product_category_id: {
                        _id: "$product_category_id._id",
                        name: "$product_category_id.name",
                        unique_id: "$product_category_id.unique_id"
                    },
                    ratingvalue: 1,
                    ratingcount: 1,
                }
            }
        ])).at(0);
        const baseUrl = process.env.BASE_URL || "http://localhost:3000";
        if (Array.isArray(productDetails === null || productDetails === void 0 ? void 0 : productDetails.product_images)) {
            const updatedImages = [];
            productDetails === null || productDetails === void 0 ? void 0 : productDetails.product_images.forEach((image) => {
                const updatedPath = `${baseUrl}/${image.replace(/\\/g, "/")}`;
                updatedImages.push(updatedPath);
            });
            productDetails.product_images = updatedImages;
        }
        return callback(null, { productDetails });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.productgDetailsModel = productgDetailsModel;
const storeProductModel = (productData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newProduct = new product_schema_1.default({
            product_name: productData.product_name,
            product_images: productData.product_images,
            product_description: productData.product_description,
            product_price: productData.product_price,
            product_listing_id: productData.product_listing_id,
            product_category_id: productData.product_category_id,
            ratingvalue: productData.ratingvalue || 0,
            ratingcount: productData.ratingcount || 0,
        });
        const savedProduct = yield newProduct.save();
        return callback(null, savedProduct);
    }
    catch (error) {
        console.error("Error storing premium listing:", error);
        return callback(error, null);
    }
});
exports.storeProductModel = storeProductModel;
const updateProductModel = (productData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = {
            product_name: productData.product_name,
            product_description: productData.product_description,
            product_price: productData.product_price,
            product_listing_id: productData.product_listing_id,
            product_category_id: productData.product_category_id,
            ratingvalue: productData.ratingvalue || 0,
            ratingcount: productData.ratingcount || "",
        };
        // Only update product_images if it's provided and not empty
        if (productData.product_images && productData.product_images.length > 0) {
            updateFields.$push = {
                product_images: { $each: productData.product_images }
            };
        }
        const updatedProduct = yield product_schema_1.default.findByIdAndUpdate(productData.product_id, updateFields, { new: true, runValidators: true });
        if (!updatedProduct) {
            return callback(new Error("Product not found"), null);
        }
        return callback(null, updatedProduct);
    }
    catch (error) {
        console.error("Error updating product:", error);
        return callback(error, null);
    }
});
exports.updateProductModel = updateProductModel;
const importProductModel = (loginUser, productData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Resolve all listing/category names to IDs
        const transformedData = yield Promise.all(productData.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const listing_id = (yield getSingleUniqueIdFromName(listing_schema_1.default, item.product_listing_id, 'listing')) || null;
            const category_id = (yield getSingleUniqueIdFromName(category_schema_1.default, item.product_category_id, 'category')) || null;
            // Skip the row if either listing_id or category_id is not found
            if (!listing_id || !category_id) {
                return null; // This will be filtered out in the next step
            }
            return Object.assign(Object.assign({}, item), { product_listing_id: listing_id, product_category_id: category_id });
        })));
        // Filter out null values (skipped rows)
        const validData = transformedData.filter((item) => item !== null);
        // Step 2: Build a unique key for exact-match checking
        const uniqueKeys = validData.map((item) => `${item.product_name}__${item.product_price}__${item.product_listing_id}__${item.product_category_id}`);
        // Step 3: Find all existing exact matches in a single query
        const existingProducts = yield product_schema_1.default.find({
            $or: validData.map((item) => ({
                product_name: item.product_name,
                product_price: item.product_price,
                product_listing_id: item.product_listing_id,
                product_category_id: item.product_category_id
            }))
        })
            .select("product_name product_price product_listing_id product_category_id")
            .lean();
        // Step 4: Build key set of exact matches
        const existingKeySet = new Set(existingProducts.map((item) => `${item.product_name}__${item.product_price}__${item.product_listing_id}__${item.product_category_id}`));
        // Step 5: Filter out only exact matches
        const uniqueInserts = validData.filter((item, i) => {
            const key = uniqueKeys[i];
            return !existingKeySet.has(key);
        });
        // Step 6: Assign unique_id manually to avoid schema pre-save logic
        if (uniqueInserts.length > 0) {
            // Get current max unique_id from DB
            const last = yield product_schema_1.default.findOne().sort({ unique_id: -1 }).select("unique_id").lean();
            let nextId = (last === null || last === void 0 ? void 0 : last.unique_id) ? last.unique_id + 1 : 1;
            for (const item of uniqueInserts) {
                item.unique_id = nextId++;
            }
            yield product_schema_1.default.insertMany(uniqueInserts);
        }
        return callback(null, {
            insertedCount: uniqueInserts.length,
            skippedCount: validData.length - uniqueInserts.length
        });
    }
    catch (error) {
        console.error("Error importing products:", error);
        return callback(error, null);
    }
});
exports.importProductModel = importProductModel;
//# sourceMappingURL=product.model.js.map