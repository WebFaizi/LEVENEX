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
exports.getProductById = void 0;
const product_schema_1 = __importDefault(require("../domain/schema/product.schema"));
const getProductById = (product_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const baseUrl = process.env.BASE_URL;
        if (!product_id) {
            return { error: "Product ID is required" };
        }
        const product_details = yield product_schema_1.default
            .findOne({ unique_id: product_id })
            .exec();
        if (!product_details) {
            return { error: "Product not found" };
        }
        if (Array.isArray(product_details.product_images)) {
            product_details.product_images = product_details.product_images.map((img) => {
                const normalizedPath = img.replace(/\\/g, "/");
                return `${baseUrl}${normalizedPath}`;
            });
        }
        return product_details;
    }
    catch (error) {
        console.error("Error fetching product details:", error);
        return { error: "Failed to fetch product details" };
    }
});
exports.getProductById = getProductById;
exports.default = exports.getProductById;
//# sourceMappingURL=productListById.service.js.map