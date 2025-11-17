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
exports.getListingDetailsData = void 0;
const listing_schema_1 = __importDefault(require("../domain/schema/listing.schema"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getListingDetailsData = (listing_unique_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!listing_unique_id) {
            return { error: "Category ID is required" };
        }
        const [listing_details] = yield listing_schema_1.default.aggregate([
            { $match: { listing_unique_id: listing_unique_id.toString() } },
            {
                $lookup: {
                    from: "areas",
                    localField: "area_id",
                    foreignField: "unique_id",
                    as: "area_id"
                }
            },
            {
                $lookup: {
                    from: "states",
                    localField: "state_id",
                    foreignField: "unique_id",
                    as: "state_id"
                }
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city_id"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_ids",
                    foreignField: "unique_id",
                    as: "category_ids"
                }
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "country_id",
                    foreignField: "unique_id",
                    as: "country_id"
                }
            },
            { $unwind: { path: "$area_id", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$state_id", preserveNullAndEmptyArrays: true } },
            // { $unwind: { path: '$city_id', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$country_id", preserveNullAndEmptyArrays: true } }
        ]);
        if (!listing_details) {
            return { error: "Listing not found" };
        }
        if (listing_details) {
            yield listing_schema_1.default.updateOne({ listing_unique_id: listing_unique_id.toString() }, { $inc: { listing_views: 1 } });
            listing_details.listing_views = (listing_details.listing_views || 0) + 1;
        }
        const grandparentDir = path_1.default.join(__dirname, "..", "..", "..", "..");
        const defaultImageUrl = `${process.env.BASE_URL}/uploads/default.jpg`;
        const listingImagePath = path_1.default.join(grandparentDir, listing_details.listing_image || "");
        const coverImagePath = path_1.default.join(grandparentDir, listing_details.cover_image || "");
        const mobilecoverImagePath = path_1.default.join(grandparentDir, listing_details.mobile_cover_image || "");
        const listingImageExists = listing_details.listing_image && fs_1.default.existsSync(listingImagePath);
        const coverImageExists = listing_details.cover_image && fs_1.default.existsSync(coverImagePath);
        const mobilecoverImageExists = listing_details.mobile_cover_image && fs_1.default.existsSync(mobilecoverImagePath);
        // Assign image URLs
        listing_details.listing_image = listingImageExists
            ? `${process.env.BASE_URL}/${listing_details.listing_image}`
            : defaultImageUrl;
        listing_details.cover_image = coverImageExists
            ? `${process.env.BASE_URL}/${listing_details.cover_image}`
            : defaultImageUrl;
        listing_details.mobile_cover_image = mobilecoverImageExists
            ? `${process.env.BASE_URL}/${listing_details.mobile_cover_image}`
            : defaultImageUrl;
        return listing_details;
    }
    catch (error) {
        console.error("Error fetching category details:", error);
        return { error: "Failed to fetch category details" };
    }
});
exports.getListingDetailsData = getListingDetailsData;
exports.default = exports.getListingDetailsData;
//# sourceMappingURL=listingDetailsData.service.js.map