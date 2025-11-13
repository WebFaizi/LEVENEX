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
exports.frontendFaqList = exports.updateFaqModel = exports.faqDetail = exports.faqList = exports.storeFaqModel = void 0;
const faq_schema_1 = __importDefault(require("../schema/faq.schema"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300 }); // TTL = 300 seconds = 5 minutes
exports.default = cache;
const storeFaqModel = (userDetails, faqData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newFaq = new faq_schema_1.default({
            question: faqData.question,
            answer: faqData.answer
        });
        const savedFaq = yield newFaq.save();
        // await storeUserActionActivity(userDetails.userId, "BLog", "Create", `Craete new  blog!`)
        return callback(null, { savedFaq });
    }
    catch (error) {
        console.error("Error storing Faq:", error);
        return callback(error, null);
    }
});
exports.storeFaqModel = storeFaqModel;
const faqList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { question: { $regex: search, $options: 'i' } },
                    { answer: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const faqs = yield faq_schema_1.default.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalFaqs = yield faq_schema_1.default.countDocuments(searchQuery);
        return {
            data: faqs,
            totalFaqs,
            totalPages: Math.ceil(totalFaqs / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching faqs');
    }
});
exports.faqList = faqList;
const faqDetail = (faq_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Faq = yield faq_schema_1.default.findOne({ _id: faq_id });
        return callback(null, { Faq });
    }
    catch (error) {
        console.error("Error fetching faq:", error);
        return callback(error, null);
    }
});
exports.faqDetail = faqDetail;
const updateFaqModel = (userDetails, faqData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faqToUpdate = yield faq_schema_1.default.findById(faqData.faq_id);
        if (!faqToUpdate) {
            return callback({ message: "Faq not found", status: 404 }, null);
        }
        faqToUpdate.question = faqData.question;
        faqToUpdate.answer = faqData.answer;
        const updatedFaq = yield faqToUpdate.save();
        // await storeUserActionActivity(userDetails.userId, "BLog", "update", `Update blog details!`)
        return callback(null, { updatedFaq });
    }
    catch (error) {
        console.error("Error updating faq:", error);
        return callback(error, null);
    }
});
exports.updateFaqModel = updateFaqModel;
const frontendFaqList = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faq = yield faq_schema_1.default.find({}).sort({ createdAt: -1 }).lean();
        const data = {
            faq,
            title: "Faq Listing",
            meta_title: "Faq Listing Meta",
            meta_description: "Faq Meta description",
            meta_keywords: "Meta keywords"
        };
        // Store the result in cache for future use
        // cache.set(cacheKey, data);        
        return callback(null, data);
    }
    catch (error) {
        console.error("Error in frontendFaqList:", error);
        return callback(error, null);
    }
});
exports.frontendFaqList = frontendFaqList;
//# sourceMappingURL=faq.model.js.map