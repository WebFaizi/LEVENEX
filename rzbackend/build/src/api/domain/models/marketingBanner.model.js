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
exports.getMarketingBannerDetail = exports.storeMarketingBannerModel = void 0;
const marketingBanner_schema_1 = __importDefault(require("../schema/marketingBanner.schema"));
const listing_schema_1 = __importDefault(require("../schema/listing.schema"));
const storeMarketingBannerModel = (marketingBannerData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingMarketingBanner = yield marketingBanner_schema_1.default.findOne();
        if (existingMarketingBanner) {
            if (marketingBannerData.marketingbanner_image != undefined &&
                marketingBannerData.marketingbanner_image != "") {
                marketingBannerData.marketingbanner_image = marketingBannerData.marketingbanner_image;
            }
            else {
                marketingBannerData.marketingbanner_image = existingMarketingBanner.marketingbanner_image;
            }
            yield marketingBanner_schema_1.default.deleteOne({ _id: existingMarketingBanner._id });
        }
        const listingIds = marketingBannerData.marketingbanner_listing_id;
        const newMarketingBanner = new marketingBanner_schema_1.default({
            marketingbanner_description: marketingBannerData.marketingbanner_description,
            marketingbanner_image: marketingBannerData.marketingbanner_image,
            marketingbanner_listing_id: listingIds
        });
        yield newMarketingBanner.save();
        return callback(null, newMarketingBanner);
    }
    catch (error) {
        console.error("Error storing banner:", error);
        return callback(error, null);
    }
});
exports.storeMarketingBannerModel = storeMarketingBannerModel;
const getMarketingBannerDetail = (listing_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [marketingBanner] = yield marketingBanner_schema_1.default.aggregate([
            {
                $lookup: {
                    from: "listings",
                    localField: "marketingbanner_listing_id",
                    foreignField: "listing_unique_id",
                    pipeline: [{ $project: { _id: 1, name: 1, listing_unique_id: 1 } }],
                    as: "marketingbanner_listing_id"
                }
            }
        ]);
        if (!marketingBanner) {
            return callback(null, { message: "Marketing banner not found" });
        }
        marketingBanner.marketingbanner_image = `${process.env.BASE_URL}/${marketingBanner.marketingbanner_image}`;
        const allListings = yield listing_schema_1.default.find({}, "_id name listing_unique_id").exec();
        const marketingListingIds = marketingBanner.marketingbanner_listing_id.map((listing) => listing._id.toString());
        const availableListings = allListings.filter((listing) => !marketingListingIds.includes(listing._id.toString()));
        return callback(null, {
            marketing_banner: marketingBanner,
            available_listings: availableListings
        });
    }
    catch (error) {
        console.error("Error fetching marketing banner:", error);
        return callback(error, null);
    }
});
exports.getMarketingBannerDetail = getMarketingBannerDetail;
//# sourceMappingURL=marketingBanner.model.js.map