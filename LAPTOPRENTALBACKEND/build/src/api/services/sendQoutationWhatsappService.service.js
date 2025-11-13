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
exports.sendQoutationWhatsappService = void 0;
const city_schema_1 = __importDefault(require("../domain/schema/city.schema"));
const category_schema_1 = __importDefault(require("../domain/schema/category.schema"));
const listing_schema_1 = __importDefault(require("../domain/schema/listing.schema"));
const premiumListing_schema_1 = __importDefault(require("../domain/schema/premiumListing.schema"));
const setting_schema_1 = __importDefault(require("../domain/schema/setting.schema"));
const axios_1 = __importDefault(require("axios"));
// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const sendQoutationWhatsappService = (quotationSchema) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryIds = quotationSchema.category_ids;
        const categories = yield category_schema_1.default.find({
            unique_id: { $in: categoryIds }
        }).select('name');
        const categoryNames = categories.map(c => c.name).join(', ');
        const city = yield city_schema_1.default.findOne({
            name: { $regex: `^${quotationSchema.location}$`, $options: 'i' }
        });
        const messageText = `
      📝 *New Quotation Request*

      *Type:* ${quotationSchema.quotation_type}
      *Name:* ${quotationSchema.name}
      *Phone:* ${quotationSchema.phone_number}
      *Location:* ${quotationSchema.location}
      *Quantity:* ${quotationSchema.quantity}
      *Categories:* ${categoryNames}
      *Message:* ${quotationSchema.message}
    `.trim();
        const settings = yield setting_schema_1.default.findOne({});
        if ((settings === null || settings === void 0 ? void 0 : settings.send_whatsapp_message) == 'yes') {
            const quotationNumbers = (settings === null || settings === void 0 ? void 0 : settings.quotation_number)
                ? settings.quotation_number.split(',').map(num => num.trim())
                : [];
            const sendWhatsappMessage = (phoneNumber, message) => __awaiter(void 0, void 0, void 0, function* () {
                const apiKey = (settings === null || settings === void 0 ? void 0 : settings.whatsapp_key) || 'your-default-apikey';
                const url = `http://api.textmebot.com/send.php?recipient=${encodeURIComponent(phoneNumber)}&apikey=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(message)}`;
                try {
                    const response = yield axios_1.default.get(url);
                }
                catch (err) {
                    console.error(`Failed to send message to ${phoneNumber}`, err);
                }
            });
            if ((settings === null || settings === void 0 ? void 0 : settings.send_whatsapp_message) == 'yes') {
                for (const phoneNumber of quotationNumbers) {
                    if (phoneNumber) {
                        yield sendWhatsappMessage(phoneNumber, messageText);
                        yield sleep(6000); // 6-second delay
                    }
                }
            }
            if (city) {
                const cityId = city.id.toString();
                const today = new Date();
                const premiumListings = yield premiumListing_schema_1.default.find({
                    city_id: { $in: [cityId] },
                    $or: [
                        { premium_type: { $ne: "epremium" } },
                        { premium_type: "epremium", end_date: { $gt: today } }
                    ]
                }).select("listing_id");
                const premiumListingIds = premiumListings.map(item => { var _a; return (_a = item.listing_id) === null || _a === void 0 ? void 0 : _a.toString(); });
                const normal_listings = yield listing_schema_1.default.find({
                    approved: true,
                    city_id: { $in: [cityId] },
                    _id: { $nin: premiumListingIds }
                });
                const premiumListings_datas = yield listing_schema_1.default.find({
                    _id: { $in: premiumListingIds }
                });
                const uniquePremiumPhones = [...new Set(premiumListings_datas.map(l => l.phone_number).filter(Boolean))];
                const uniqueNormalPhones = [...new Set(normal_listings.map(l => l.phone_number).filter(Boolean))];
                if ((settings === null || settings === void 0 ? void 0 : settings.send_whatsapp_message) == 'yes') {
                    for (const NormalPhone of uniqueNormalPhones) {
                        if (NormalPhone) {
                            yield sendWhatsappMessage(NormalPhone, messageText);
                            yield sleep(6000); // 6-second delay
                        }
                    }
                    for (const PremiumPhone of uniquePremiumPhones) {
                        if (PremiumPhone) {
                            yield sendWhatsappMessage(PremiumPhone, messageText);
                            yield sleep(6000); // 6-second delay
                        }
                    }
                }
            }
        }
        return true;
    }
    catch (error) {
        console.error("Error in sendQoutationWhatsappService:", error);
        throw new Error("Failed to send WhatsApp message");
    }
});
exports.sendQoutationWhatsappService = sendQoutationWhatsappService;
exports.default = exports.sendQoutationWhatsappService;
//# sourceMappingURL=sendQoutationWhatsappService.service.js.map