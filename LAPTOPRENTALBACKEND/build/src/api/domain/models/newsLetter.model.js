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
exports.getNewsletterDetail = exports.storeNewsletterModel = void 0;
const newsLetter_schema_1 = __importDefault(require("../schema/newsLetter.schema"));
const listing_schema_1 = __importDefault(require("../schema/listing.schema"));
const storeNewsletterModel = (newsLetterData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingNewsletter = yield newsLetter_schema_1.default.findOne();
        if (existingNewsletter) {
            if (newsLetterData.newsletter_banner_image != undefined && newsLetterData.newsletter_banner_image != "") {
                newsLetterData.newsletter_banner_image = newsLetterData.newsletter_banner_image;
            }
            else {
                newsLetterData.newsletter_banner_image = existingNewsletter.newsletter_banner_image;
            }
            yield newsLetter_schema_1.default.deleteOne({ _id: existingNewsletter._id });
        }
        const newNewsletter = new newsLetter_schema_1.default({
            newsletter_description: newsLetterData.newsletter_description,
            newsletter_banner_image: newsLetterData.newsletter_banner_image,
            newsletter_listing_id: newsLetterData.newsletter_listing_id,
        });
        yield newNewsletter.save();
        return callback(null, newNewsletter);
    }
    catch (error) {
        console.error("Error storing banner:", error);
        return callback(error, null);
    }
});
exports.storeNewsletterModel = storeNewsletterModel;
const getNewsletterDetail = (listing_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let newsletter_schema = yield newsLetter_schema_1.default.findOne();
        const listing = newsletter_schema && Array.isArray(newsletter_schema.newsletter_listing_id) ? newsletter_schema.newsletter_listing_id : [];
        const listingsFromSchema = yield listing_schema_1.default.find({ listing_unique_id: { $in: listing } }, 'listing_unique_id name');
        const newsLetter = Object.assign(Object.assign({}, newsletter_schema === null || newsletter_schema === void 0 ? void 0 : newsletter_schema.toObject()), { newsletter_listing_id: listingsFromSchema });
        if (newsletter_schema) {
            newsletter_schema.newsletter_banner_image = `${process.env.BASE_URL}/${newsletter_schema.newsletter_banner_image}`;
        }
        const allListings = yield listing_schema_1.default.find({}, 'listing_unique_id name').exec();
        const newsletterListingIds = newsLetter === null || newsLetter === void 0 ? void 0 : newsLetter.newsletter_listing_id.map((listing) => listing.listing_unique_id);
        const filteredListings = allListings.filter((listing) => !(newsletterListingIds === null || newsletterListingIds === void 0 ? void 0 : newsletterListingIds.includes(listing.listing_unique_id)));
        return callback(null, { newsletter_schema: newsLetter, available_listings: filteredListings, });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.getNewsletterDetail = getNewsletterDetail;
//# sourceMappingURL=newsLetter.model.js.map