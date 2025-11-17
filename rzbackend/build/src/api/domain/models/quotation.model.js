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
exports.quotationListExport = exports.updateQuotationModel = exports.quotationList = exports.subscriberList = exports.storeQuotationModel = void 0;
const quotation_schema_1 = __importDefault(require("../schema/quotation.schema"));
const user_schema_1 = __importDefault(require("../schema/user.schema"));
const subscribers_schema_1 = __importDefault(require("../schema/subscribers.schema"));
const sendQuotationMail_service_1 = require("../../services/sendQuotationMail.service");
const sendQoutationWhatsappService_service_1 = require("../../services/sendQoutationWhatsappService.service");
const newsLetter_schema_1 = __importDefault(require("../schema/newsLetter.schema"));
const featuredListing_schema_1 = __importDefault(require("../schema/featuredListing.schema"));
const storeQuotationModel = (quotationData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryIds = quotationData.category_ids.map(Number);
    const listing = yield featuredListing_schema_1.default.aggregate([
        { $sort: { position: 1 } },
        {
            $match: {
                category_ids: { $in: categoryIds }
            }
        },
        {
            $lookup: {
                from: "listings",
                localField: "listing_id",
                foreignField: "listing_unique_id",
                as: "listingData"
            }
        },
        {
            $unwind: {
                path: "$listingData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "cities",
                let: { cityIds: "$listingData.city_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$unique_id", "$$cityIds"] }
                        }
                    }
                ],
                as: "listingData.city"
            }
        },
        {
            $lookup: {
                from: "categories",
                let: { catIds: "$category_ids" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$unique_id", "$$catIds"] }
                        }
                    }
                ],
                as: "listingData.category"
            }
        },
        {
            $limit: 5
        },
        {
            $project: {
                _id: 0,
                title: 1,
                listing_id: 1,
                category_ids: 1,
                listingData: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);
    quotationData.listing = listing;
    // quotationData.category_ids = categories;
    try {
        const newQuotation = new quotation_schema_1.default(Object.assign(Object.assign({}, quotationData), { status: "pending" }));
        const lists = yield subscribers_schema_1.default.findOne({ email: quotationData.email });
        if (!lists) {
            const newSubscriber = new subscribers_schema_1.default({
                name: quotationData.name,
                email: quotationData.email,
                status: true
            });
            yield newSubscriber.save();
        }
        yield newQuotation.save();
        let newsletter_schema = yield newsLetter_schema_1.default.aggregate([
            {
                $lookup: {
                    from: "listings",
                    localField: "newsletter_listing_id",
                    foreignField: "listing_unique_id",
                    as: "listingData"
                }
            },
            { $unwind: "$listingData" },
            {
                $unwind: {
                    path: "$listingData.city_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "listingData.city_id",
                    foreignField: "unique_id",
                    as: "listingData.city"
                }
            },
            {
                $unwind: {
                    path: "$listingData.category_ids",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "listingData.category_ids",
                    foreignField: "unique_id",
                    as: "listingData.category"
                }
            },
            {
                $unwind: {
                    path: "$listingData.category",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$listingData.city",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        newsletterId: "$_id",
                        listingId: "$listingData._id"
                    },
                    newsletter_description: { $first: "$newsletter_description" },
                    newsletter_banner_image: { $first: "$newsletter_banner_image" },
                    listingName: { $first: "$listingData.name" },
                    phone_number: { $first: "$listingData.phone_number" },
                    email: { $first: "$listingData.email" },
                    cities: {
                        $addToSet: "$listingData.city"
                    },
                    category_ids: {
                        $addToSet: "$listingData.category"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.newsletterId",
                    newsletter_description: { $first: "$newsletter_description" },
                    newsletter_banner_image: { $first: "$newsletter_banner_image" },
                    listings: {
                        $push: {
                            _id: "$_id.listingId",
                            name: "$listingName",
                            cities: "$cities",
                            phone_number: "$phone_number",
                            email: "$email",
                            category_ids: "$category_ids"
                        }
                    }
                }
            },
            // Step 8: Optional sort
            { $sort: { title: 1 } }
        ]);
        callback(null, newQuotation);
        (0, sendQuotationMail_service_1.sendQoutationMailService)(quotationData, newsletter_schema)
            .then(() => {
            console.log("Quotation mail sent successfully");
        })
            .catch((err) => {
            console.error("Failed to send quotation mail:", err);
        });
        (0, sendQoutationWhatsappService_service_1.sendQoutationWhatsappService)(quotationData)
            .then(() => {
            console.log("Quotation whatsapp sent successfully");
        })
            .catch((err) => {
            console.error("Failed to send quotation whatsapp:", err);
        });
    }
    catch (error) {
        callback(error, null);
    }
});
exports.storeQuotationModel = storeQuotationModel;
const subscriberList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }
            : {};
        const skip = (page - 1) * limit;
        const lists = yield subscribers_schema_1.default.find(searchQuery).skip(skip).limit(limit).exec();
        const totalLists = yield subscribers_schema_1.default.countDocuments(searchQuery);
        return {
            data: lists,
            totalLists,
            totalPages: Math.ceil(totalLists / limit),
            currentPage: page
        };
    }
    catch (error) {
        console.error(error);
        throw new Error("Error fetching users");
    }
});
exports.subscriberList = subscriberList;
const quotationList = (search, page, limit, quotation_list_type, start_date, end_date) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skip = (page - 1) * limit;
        const matchQuery = {};
        // Date filters
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            endDate.setHours(23, 59, 59, 999);
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                matchQuery.createdAt = { $gte: startDate, $lte: endDate };
            }
        }
        // Aggregation pipeline
        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: "categories",
                    let: { listingCategoryIds: "$category_ids" }, // these are strings
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: [{ $toString: "$unique_id" }, "$$listingCategoryIds"]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                unique_id: 1,
                                name: 1
                            }
                        }
                    ],
                    as: "category_ids" // ✅ this replaces the original category_ids with full category objects
                }
            }
        ];
        // Apply search filter (including category name)
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { message: { $regex: search, $options: "i" } },
                        { phone_number: { $regex: search, $options: "i" } },
                        { quotation_type: { $regex: search, $options: "i" } },
                        { "categories.name": { $regex: search, $options: "i" } } // ✅ category name search
                    ]
                }
            });
        }
        pipeline.push({ $sort: { createdAt: -1 } });
        const allQuotations = yield quotation_schema_1.default.aggregate(pipeline);
        // Extract emails for filtering
        const quotationEmails = allQuotations.map((q) => q.email);
        const existingUsers = yield user_schema_1.default.find({ email: { $in: quotationEmails } }, { email: 1, _id: 0 }).lean();
        const userEmailSet = new Set(existingUsers.map((user) => user.email));
        // Apply quotation_list_type filter
        const filteredQuotations = allQuotations.filter((quotation) => {
            const emailExists = userEmailSet.has(quotation.email);
            if (quotation_list_type == 1)
                return !emailExists;
            if (quotation_list_type == 2)
                return emailExists;
            return true;
        });
        // Pagination
        const paginatedQuotations = filteredQuotations.slice(skip, skip + limit);
        // Format results
        const results = paginatedQuotations.map((quotation) => {
            const categoryNames = (quotation.categories || []).map((cat) => cat.name).join(", ");
            const emailExists = userEmailSet.has(quotation.email);
            return Object.assign(Object.assign({}, quotation), { category_names: categoryNames, type: emailExists ? "seller" : "user" });
        });
        return {
            data: results,
            totalLists: filteredQuotations.length,
            totalPages: Math.ceil(filteredQuotations.length / limit),
            currentPage: page
        };
    }
    catch (error) {
        console.error(error);
        throw new Error("Error fetching quotations");
    }
});
exports.quotationList = quotationList;
const updateQuotationModel = (quotationData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quotation_id, status, type } = quotationData;
        const quotation = yield quotation_schema_1.default.findById(quotation_id);
        if (!quotation) {
            return callback(new Error("Quotation not found"), null);
        }
        if (type == "1") {
            if (status !== "pending" && status !== "approved") {
                return callback(new Error('Invalid status value. It must be either "pending" or "approved".'), null);
            }
            quotation.status = status;
        }
        else {
            if (status !== "yes" && status !== "no") {
                return callback(new Error('Invalid status value. It must be either "pending" or "approved".'), null);
            }
            quotation.view_by_admin = status;
        }
        yield quotation.save();
        return callback(null, quotation);
    }
    catch (error) {
        console.error("Error updating quotation:", error);
        return callback(new Error("Error updating quotation"), null);
    }
});
exports.updateQuotationModel = updateQuotationModel;
const quotationListExport = (search, start_date, end_date, quotation_list_type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
                { phone_number: { $regex: search, $options: "i" } },
                { quotation_type: { $regex: search, $options: "i" } }
            ];
        }
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }
        const quotations = yield quotation_schema_1.default.find(query)
            .sort({ createdAt: -1 })
            .populate("category_ids", "name")
            .exec();
        const emails = quotations.map((q) => q.email);
        const existingUsers = yield user_schema_1.default.find({ email: { $in: emails } }, { email: 1, _id: 0 }).lean();
        const userEmailSet = new Set(existingUsers.map((user) => user.email));
        const filteredQuotations = quotations.filter((q) => {
            const emailExists = userEmailSet.has(q.email);
            if (quotation_list_type == 1)
                return !emailExists;
            if (quotation_list_type == 2)
                return emailExists;
            return true;
        });
        const data = filteredQuotations.map((quotation) => (Object.assign(Object.assign({}, quotation.toObject()), { category_names: quotation.category_ids.map((category) => category.name).join(", "), type: userEmailSet.has(quotation.email) ? "seller" : "user" })));
        return { data };
    }
    catch (error) {
        console.error("Error fetching quotations:", error);
        throw new Error("Error fetching quotations from the database.");
    }
});
exports.quotationListExport = quotationListExport;
//# sourceMappingURL=quotation.model.js.map