"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.exportListing = exports.importFreshListing = exports.importListing = exports.importUserListing = exports.listingExportFormetDownload = exports.listingsStatusUpdate = exports.deleteListings = exports.listingDetails = exports.getUserListingList = exports.getListingList = exports.getListingReviewList = exports.updateListingBanners = exports.deleteDuplicateListing = exports.listingBanners = exports.updateListingData = exports.storeListingData = exports.deleteReviewList = exports.importListingReview = exports.addAdminListingReview = exports.userAllListingList = exports.categoryWiseExport = exports.getAllListingList = exports.importCategoryWiseListing = exports.deleteAllListings = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const listing_model_1 = require("../../domain/models/listing.model");
const listing_schema_1 = __importDefault(require("../../domain/schema/listing.schema"));
const category_schema_1 = __importDefault(require("../../domain/schema/category.schema"));
const listingReview_schema_1 = __importDefault(require("../../domain/schema/listingReview.schema"));
const importFileStatus_schema_1 = __importDefault(require("../../domain/schema/importFileStatus.schema"));
const path_1 = __importDefault(require("path"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const insertExportTaskService_service_1 = require("../../services/insertExportTaskService.service");
const mongoose_1 = __importDefault(require("mongoose"));
const imageService_1 = require("../../services/imageService");
const fs_1 = __importDefault(require("fs"));
const XLSX = __importStar(require("xlsx"));
const featuredListing_schema_1 = __importDefault(require("../../domain/schema/featuredListing.schema"));
const premiumListing_schema_1 = __importDefault(require("../../domain/schema/premiumListing.schema"));
const deleteAllListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield listing_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No listings found to delete.");
        }
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Delete", `Delete All listing `);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all listings.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all listings.");
    }
});
exports.deleteAllListings = deleteAllListings;
const importCategoryWiseListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const baseUploadDir = "uploads/listing/";
        const mainLIstinImageDir = "uploads/listing_main_image/";
        const data = rawData.map((item) => {
            const listingId = String(item["Listing Id"]);
            const uploadDir = listingId ? path_1.default.join(baseUploadDir, listingId, "/") : baseUploadDir;
            return {
                listing_unique_id: String(item["Listing Id"] || ""),
                category_ids: String(item["Categories"] || ""),
                name: String(item["Company"] || ""),
                description: String(item["Description"] || ""),
                email: String(item["Email address"] || ""),
                second_email: String(item["Email address Two"] || ""),
                phone_number: String(item["Phone Number"] || ""),
                second_phone_no: String(item["Phone Number Two"] || ""),
                country_id: String(item["Country"] || ""),
                state_id: String(item["State"] || ""),
                city_id: String(item["City"] || ""),
                area_id: String(item["Area"] || ""),
                address: String(item["Address"] || ""),
                pincode: String(item["Pincode"] || ""),
                latitude: String(item["Lattitude"] || ""),
                longitude: String(item["Longitude"] || ""),
                website: String(item["Website"] || ""),
                price: String(item["Price"] || ""),
                time_duration: String(item["Time Duration"] || ""),
                approved: item["Verified"] === "Yes",
                listing_type: String(item["Paid"] || ""),
                contact_person: String(item["Contact Person Name"] || ""),
                listing_image: item["Listing Image"]
                    ? mainLIstinImageDir + String(item["Listing Image"] || "")
                    : "",
                cover_image: item["Desktop Cover Image"] ? uploadDir + item["Desktop Cover Image"] : "",
                mobile_cover_image: item["Mobile Cover Image"]
                    ? uploadDir + String(item["Mobile Cover Image"] || "")
                    : ""
            };
        });
        const totalRecords = data.length;
        const avgTimePerRecord = 0.05;
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Category Wise Listing Import", "processing");
        // ✅ Respond immediately
        res.status(200).json({
            message: `Your category-wise listing file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // ✅ Background processing
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const loginUser = req.user;
                const chunkSize = 100;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);
                    yield new Promise((resolve, reject) => {
                        (0, listing_model_1.importCategoryListingDataModel)(loginUser, chunk, (error, result) => {
                            if (error) {
                                console.error("Chunk import error:", error);
                                return reject(error);
                            }
                            resolve(result);
                        });
                    });
                }
                yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Import", `Import listing category wise data!`);
                console.log("✅ Category-wise listing background import completed.");
                const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Category Wise Listing Import", "completed");
            }
            catch (err) {
                console.error("❌ Error during background import:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("❌ Category-wise listing import failed:", error);
        return res.status(500).json({ message: "Error importing listings", error: error.message });
    }
});
exports.importCategoryWiseListing = importCategoryWiseListing;
const getAllListingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "" } = req.query;
        const users = yield (0, listing_model_1.getAllListingModel)(search);
        return (0, apiResponse_1.successResponse)(res, "get admin User list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getAllListingList = getAllListingList;
const categoryWiseExport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.params;
        if (!category_id || typeof category_id !== "string") {
            return res.status(400).json({ message: "Invalid category_id" });
        }
        const categoryIdsArray = category_id.split(",").map((id) => Number(id.trim()));
        const filter = { category_ids: { $in: categoryIdsArray } };
        const [categoryDetails, listings] = yield Promise.all([
            category_schema_1.default.find({ unique_id: category_id }).lean(),
            listing_schema_1.default.aggregate([
                { $match: filter },
                { $sort: { sortingOrder: -1 } },
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
                        from: "cities",
                        localField: "city_id",
                        foreignField: "unique_id",
                        as: "city_id"
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
                        from: "areas",
                        localField: "area_id",
                        foreignField: "unique_id",
                        as: "area_id"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        listing_unique_id: 1,
                        name: 1,
                        description: 1,
                        email: 1,
                        second_email: 1,
                        phone_number: 1,
                        second_phone_no: 1,
                        category_ids: 1,
                        city_id: { $arrayElemAt: ["$city_id", 0] },
                        country_id: { $arrayElemAt: ["$country_id", 0] },
                        state_id: { $arrayElemAt: ["$state_id", 0] },
                        area_id: { $arrayElemAt: ["$area_id", 0] },
                        address: 1,
                        pincode: 1,
                        latitude: 1,
                        longitude: 1,
                        website: 1,
                        price: 1,
                        time_duration: 1,
                        approved: 1,
                        listing_type: 1,
                        contact_person: 1,
                        listing_image: 1,
                        cover_image: 1,
                        mobile_cover_image: 1
                    }
                }
            ])
        ]);
        if (!categoryDetails || categoryDetails.length === 0) {
            return res.status(404).json({ message: "Category not found aasdd!" });
        }
        const headers = {
            "Listing Id": "N/A",
            Categories: "N/A",
            Company: "N/A",
            Description: "N/A",
            "Email address": "N/A",
            "Email address Two": "N/A",
            "Phone Number": "N/A",
            "Phone Number Two": "N/A",
            City: "All",
            Country: "N/A",
            State: "N/A",
            Area: "N/A",
            Address: "N/A",
            Pincode: "N/A",
            Latitude: "N/A",
            Longitude: "N/A",
            Website: "N/A",
            Price: "N/A",
            "Time Duration": "N/A",
            Verified: "No",
            Paid: "No",
            "Contact Person Name": "N/A",
            "Listing Image": "N/A",
            "Desktop Cover Image": "N/A",
            "Mobile Cover Image": "N/A",
            "Is Featured": "N/A",
            "Is Premium": "N/A"
        };
        const listingsData = listings.length > 0
            ? yield Promise.all(listings.map((listing) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                let categoryNames = ((_a = listing === null || listing === void 0 ? void 0 : listing.category_ids) === null || _a === void 0 ? void 0 : _a.map((cat) => cat.name)) || [];
                if (categoryIdsArray.length > 0) {
                    categoryNames = listing.category_ids
                        .filter((cat) => categoryIdsArray.includes(cat._id.toString()))
                        .map((cat) => cat.name);
                }
                const reviewPromise = (0, listing_model_1.ListingWiseReviewList)(listing._id, 1, 10);
                const listing_review_list = yield Promise.all([reviewPromise]);
                let isFeatured = false;
                const existingListing = yield featuredListing_schema_1.default.findOne({
                    listing_id: listing.listing_unique_id
                }).lean();
                if (existingListing) {
                    isFeatured = true;
                }
                let isPremium = false;
                const existingPremiumListing = yield premiumListing_schema_1.default.findOne({
                    listing_id: listing.listing_unique_id
                }).lean();
                if (existingPremiumListing) {
                    isPremium = true;
                }
                console.log("categoryDetailscategoryDetails", categoryDetails);
                return {
                    "Listing Id": (listing === null || listing === void 0 ? void 0 : listing.listing_unique_id) || "N/A",
                    Categories: categoryDetails.map((cat) => cat.name).join(", ") || "N/A",
                    Company: (listing === null || listing === void 0 ? void 0 : listing.name) || "N/A",
                    Description: (listing === null || listing === void 0 ? void 0 : listing.description) || "N/A",
                    "Email address": (listing === null || listing === void 0 ? void 0 : listing.email) || "N/A",
                    "Email address Two": (listing === null || listing === void 0 ? void 0 : listing.second_email) || "N/A",
                    "Phone Number": (listing === null || listing === void 0 ? void 0 : listing.phone_number) || "N/A",
                    "Phone Number Two": (listing === null || listing === void 0 ? void 0 : listing.second_phone_no) || "N/A",
                    City: Array.isArray(listing === null || listing === void 0 ? void 0 : listing.city_id)
                        ? listing.city_id.map((c) => c.name).join(", ")
                        : ((_b = listing.city_id) === null || _b === void 0 ? void 0 : _b.name) || "All",
                    Country: (_d = (_c = listing.country_id) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "N/A",
                    State: (_f = (_e = listing.state_id) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : "N/A",
                    Area: (_h = (_g = listing.area_id) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : "N/A",
                    Address: (listing === null || listing === void 0 ? void 0 : listing.address) || "N/A",
                    Pincode: (listing === null || listing === void 0 ? void 0 : listing.pincode) || "N/A",
                    Latitude: (listing === null || listing === void 0 ? void 0 : listing.latitude) || "N/A",
                    Longitude: (listing === null || listing === void 0 ? void 0 : listing.longitude) || "N/A",
                    Website: (listing === null || listing === void 0 ? void 0 : listing.website) || "N/A",
                    Price: (listing === null || listing === void 0 ? void 0 : listing.price) || "N/A",
                    "Time Duration": (listing === null || listing === void 0 ? void 0 : listing.time_duration) || "N/A",
                    Verified: (listing === null || listing === void 0 ? void 0 : listing.approved) ? "Yes" : "No",
                    Paid: (listing === null || listing === void 0 ? void 0 : listing.listing_type) === "Free" ? "No" : "Yes",
                    "Contact Person Name": (listing === null || listing === void 0 ? void 0 : listing.contact_person) || "N/A",
                    "Listing Image": (listing === null || listing === void 0 ? void 0 : listing.listing_image) &&
                        (listing === null || listing === void 0 ? void 0 : listing.listing_image) !== "null" &&
                        (listing === null || listing === void 0 ? void 0 : listing.listing_image) !== "N/A"
                        ? path_1.default.basename(listing === null || listing === void 0 ? void 0 : listing.listing_image)
                        : "",
                    "Desktop Cover Image": (listing === null || listing === void 0 ? void 0 : listing.cover_image) &&
                        (listing === null || listing === void 0 ? void 0 : listing.cover_image) !== "null" &&
                        (listing === null || listing === void 0 ? void 0 : listing.cover_image) !== "N/A" &&
                        (listing === null || listing === void 0 ? void 0 : listing.cover_image) !== ""
                        ? path_1.default.basename(listing === null || listing === void 0 ? void 0 : listing.cover_image)
                        : "",
                    "Mobile Cover Image": (listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image) &&
                        (listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image) !== "null" &&
                        (listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image) !== "N/A" &&
                        (listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image) !== ""
                        ? path_1.default.basename(listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image)
                        : "",
                    "Average Rating": (listing_review_list && ((_j = listing_review_list[0]) === null || _j === void 0 ? void 0 : _j.averageRating)) || 0,
                    "Is Featured": isFeatured ? "Yes" : "No",
                    "Is Premium": isPremium ? "Yes" : "No"
                };
            })))
            : [headers];
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(listingsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=categorywise_listings.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error exporting listings:", error);
        return res.status(500).json({ message: "Error exporting listings", error: error.message });
    }
});
exports.categoryWiseExport = categoryWiseExport;
const userAllListingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "" } = req.query;
        const users = yield (0, listing_model_1.getUserAllListingModel)(req.user, search);
        return (0, apiResponse_1.successResponse)(res, "get admin User list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.userAllListingList = userAllListingList;
const addAdminListingReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, listing_model_1.storeListingReviewModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Create", `Add listing review data!`);
            return (0, apiResponse_1.successResponse)(res, "Listing review add in database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.addAdminListingReview = addAdminListingReview;
const importListingReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const data = rawData.map((item) => ({
            listing_name: String(item["Listing Name"] || ""),
            user_name: String(item["User Name"] || ""),
            rating: String(item["Rating"] || ""),
            comment: String(item["Comment"] || "")
        }));
        // Calculate time
        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds per row
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        // Send immediate response
        res.status(200).json({
            message: `Your file with ${totalRecords} listing review(s) is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });
        // Background processing
        setTimeout(() => {
            (0, listing_model_1.importListingReviewDataModel)(req.user, data, (error, result) => {
                if (error) {
                    console.error("Import error:", error.message);
                }
                else {
                    console.log("Listing reviews stored successfully:", result);
                }
            });
        }, 100);
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Import", `Import listing review data!`);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error importing listing reviews", error: error.message });
    }
});
exports.importListingReview = importListingReview;
const deleteReviewList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { review_ids } = req.body;
        if (!review_ids || !Array.isArray(review_ids) || review_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Quotation ID.");
        }
        const result = yield listingReview_schema_1.default.deleteMany({ _id: { $in: review_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No quotation found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Listings review (ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.deleteReviewList = deleteReviewList;
const storeListingData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        yield (0, listing_model_1.storeListingModel)(req.user, req.body, (error, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            const uploadDir = `uploads/listing/${result.listing_unique_id}/`;
            const mainLIstinImageDir = "uploads/listing_main_image/";
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
                fs_1.default.mkdirSync(mainLIstinImageDir, { recursive: true });
            }
            const image_details = {};
            if (files && files.length > 0) {
                for (const file of files) {
                    const field_name = file.fieldname;
                    let savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, field_name === "listing_image" ? mainLIstinImageDir : uploadDir);
                    image_details[field_name] = savePath;
                }
            }
            yield listing_schema_1.default.updateOne({ _id: result._id }, { $set: image_details });
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Create", `Create new listing!`);
            return (0, apiResponse_1.successResponse)(res, "Listuing stored in Database successfully", result);
        }));
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.storeListingData = storeListingData;
const updateListingData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const blogToUpdate = yield listing_schema_1.default.findById(req.body.listing_id);
        if (!blogToUpdate) {
            return (0, apiResponse_1.ErrorResponse)(res, "Listing not found");
        }
        const mainLIstinImageDir = "uploads/listing_main_image/";
        const uploadDir = `uploads/listing/${blogToUpdate.listing_unique_id}/`;
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        for (const file of files) {
            const field_name = file.fieldname;
            // Convert to webp and save
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, field_name === "listing_image" ? mainLIstinImageDir : uploadDir);
            req.body[field_name] = savePath;
            // Delete old image if field exists
            const oldImage = blogToUpdate[field_name];
            if (oldImage) {
                const oldImagePath = path_1.default.join(__dirname, "../../../../", oldImage);
                if (fs_1.default.existsSync(oldImagePath)) {
                    try {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                    catch (error) {
                        console.error(`Error deleting old image (${field_name}):`, error);
                        return (0, apiResponse_1.ErrorResponse)(res, `Failed to delete old ${field_name} image.`);
                    }
                }
            }
        }
        (0, listing_model_1.updateListingModel)(req.user, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Listing updated in Database successfully", result);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during listing update.");
    }
});
exports.updateListingData = updateListingData;
const listingBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, listing_model_1.listingBannersList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.listingBanners = listingBanners;
const deleteDuplicateListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, listing_model_1.deleteDuplicateListingModel)();
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Delete", `Delete Duplicate listing details!`);
        return (0, apiResponse_1.successResponse)(res, "duplicate entry deleted successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.deleteDuplicateListing = deleteDuplicateListing;
const updateListingBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const blogToUpdate = yield listing_schema_1.default.findById(req.body.listing_id);
        const uploadDir = `uploads/listing/${blogToUpdate === null || blogToUpdate === void 0 ? void 0 : blogToUpdate.listing_unique_id}/`;
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        if (files && files.length > 0) {
            for (const file of files) {
                const field_name = file.fieldname;
                let savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
                req.body[field_name] = savePath;
            }
        }
        if (req.body.cover_image) {
            if (!blogToUpdate) {
                return (0, apiResponse_1.ErrorResponse)(res, "Blog not found");
            }
            const oldImage = blogToUpdate.cover_image;
            if (oldImage) {
                const oldImagePath = path_1.default.join(__dirname, "../../../../", uploadDir, path_1.default.basename(oldImage));
                if (fs_1.default.existsSync(oldImagePath)) {
                    try {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                    catch (error) {
                        console.error("Error deleting old image:", error);
                        return (0, apiResponse_1.ErrorResponse)(res, "Failed to delete old image.");
                    }
                }
            }
        }
        if (req.body.mobile_cover_image) {
            if (!blogToUpdate) {
                return (0, apiResponse_1.ErrorResponse)(res, "Blog not found");
            }
            const oldImage = blogToUpdate.mobile_cover_image;
            if (oldImage) {
                const oldImagePath = path_1.default.join(__dirname, "../../../../", oldImage);
                if (fs_1.default.existsSync(oldImagePath)) {
                    try {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                    catch (error) {
                        console.error("Error deleting old image:", error);
                        return (0, apiResponse_1.ErrorResponse)(res, "Failed to delete old image.");
                    }
                }
            }
        }
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Update", `some listing banner updated`);
        yield (0, listing_model_1.updateListingBannersList)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Listuing stored in Database successfully", result);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.updateListingBanners = updateListingBanners;
const getListingReviewList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, listing_model_1.ListingReviewList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getListingReviewList = getListingReviewList;
const getListingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, type = 2 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, listing_model_1.ListingList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get listing list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getListingList = getListingList;
const getUserListingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, type = 2 } = req.query;
        const user_email = req.user.email;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, listing_model_1.UserListingList)(user_email, search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getUserListingList = getUserListingList;
const listingDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listing_id } = req.params;
        (0, listing_model_1.listingDetail)(listing_id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Listing details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.listingDetails = listingDetails;
const deleteListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listing_ids } = req.body;
        if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Quotation ID.");
        }
        const result = yield listing_schema_1.default.deleteMany({ _id: { $in: listing_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No quotation found with the provided IDs.");
        }
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Delete", `Delete listing details!`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Listings(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.deleteListings = deleteListings;
const listingsStatusUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update_status = yield (0, listing_model_1.updateListingStatusModel)(req.user, req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Listing Status updated successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.listingsStatusUpdate = listingsStatusUpdate;
const listingExportFormetDownload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workbook = XLSX.utils.book_new();
        const headers = [
            {
                "User Email": "",
                Categories: "",
                Company: "",
                Description: "",
                "Email address": "",
                "Email address Two": "",
                "Phone Number": "",
                "Phone Number Two": "",
                Country: "",
                State: "",
                City: "",
                Area: "",
                Address: "",
                Pincode: "",
                Lattitude: "",
                Longitude: "",
                Website: "",
                Price: "",
                "Time Duration": "",
                Verified: "",
                Paid: "",
                "Contact Person Name": "",
                "Listing Image": "",
                "Desktop Cover Image": "",
                "Mobile Cover Image": "",
            }
        ];
        const worksheet = XLSX.utils.json_to_sheet(headers, {
            header: [
                "User Email",
                "Categories",
                "Company",
                "Description",
                "Email address",
                "Email address Two",
                "Phone Number",
                "Phone Number Two",
                "Country",
                "State",
                "City",
                "Area",
                "Address",
                "Pincode",
                "Lattitude",
                "Longitude",
                "Website",
                "Price",
                "Time Duration",
                "Verified",
                "Paid",
                "Contact Person Name",
                "Listing Image",
                "Desktop Cover Image",
                "Mobile Cover Image",
            ],
            skipHeader: false
        });
        worksheet["!cols"] = [
            { wch: 40 },
            { wch: 40 },
            { wch: 40 },
            { wch: 30 },
            { wch: 40 },
            { wch: 40 },
            { wch: 30 },
            { wch: 30 },
            { wch: 30 },
            { wch: 30 },
            { wch: 30 },
            { wch: 30 },
            { wch: 60 },
            { wch: 10 },
            { wch: 20 },
            { wch: 20 },
            { wch: 30 },
            { wch: 30 },
            { wch: 30 },
            { wch: 10 },
            { wch: 10 },
            { wch: 30 },
            { wch: 10 },
            { wch: 10 },
            { wch: 30 }
        ];
        XLSX.utils.book_append_sheet(workbook, worksheet, "CategorySEO");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="listing_import_formet.xlsx"');
        res.send(buffer);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.listingExportFormetDownload = listingExportFormetDownload;
const importUserListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const baseUploadDir = "uploads/listing/";
        const mainLIstinImageDir = "uploads/listing_main_image/";
        const data = rawData.map((item) => {
            const listingId = String(item["Listing Id"]);
            const uploadDir = listingId ? path_1.default.join(baseUploadDir, listingId, "/") : baseUploadDir;
            return {
                user_email: String(item["User Email"] || ""),
                listing_unique_id: String(item["Listing Id"] || ""),
                category_ids: String(item["Categories"] || ""),
                name: String(item["Company"] || ""),
                description: String(item["Description"] || ""),
                email: String(item["Email address"] || ""),
                second_email: String(item["Email address Two"] || ""),
                phone_number: String(item["Phone Number"] || ""),
                second_phone_no: String(item["Phone Number Two"] || ""),
                country_id: String(item["Country"] || ""),
                state_id: String(item["State"] || ""),
                city_id: String(item["City"] || ""),
                area_id: String(item["Area"] || ""),
                address: String(item["Address"] || ""),
                pincode: String(item["Pincode"] || ""),
                latitude: String(item["Lattitude"] || ""),
                longitude: String(item["Longitude"] || ""),
                website: String(item["Website"] || ""),
                price: String(item["Price"] || ""),
                time_duration: String(item["Time Duration"] || ""),
                approved: item["Verified"] === "Yes",
                listing_type: String(item["Paid"] || ""),
                contact_person: String(item["Contact Person Name"] || ""),
                listing_image: item["Listing Image"]
                    ? mainLIstinImageDir + String(item["Listing Image"] || "")
                    : "",
                cover_image: item["Desktop Cover Image"] ? uploadDir + item["Desktop Cover Image"] : "",
                mobile_cover_image: item["Mobile Cover Image"]
                    ? uploadDir + String(item["Mobile Cover Image"] || "")
                    : ""
            };
        });
        const totalRecords = data.length;
        const avgTimePerRecord = 0.05; // seconds (adjust if needed)
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        yield importFileStatus_schema_1.default.create({
            module_name: "Listing",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("User Wise Listing Import", "processing");
        // ✅ Immediate response to user
        res.status(200).json({
            message: `Your listing file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // ✅ Background processing
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const loginUser = req.user; // must be available from auth middleware
                const chunkSize = 100; // process in smaller chunks
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);
                    console.log(chunk);
                    yield new Promise((resolve, reject) => {
                        (0, listing_model_1.importUserListingDataModel)(loginUser, chunk, (error, result) => {
                            if (error) {
                                console.error("Chunk import error:", error);
                                return reject(error);
                            }
                            resolve(result);
                        });
                    });
                }
                yield importFileStatus_schema_1.default.deleteOne({ module_name: "Listing" });
                console.log("✅ Listing background import completed.");
                const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("User Wise Listing Import", "completed");
            }
            catch (err) {
                console.error("❌ Error during background import:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("❌ Listing import failed:", error);
        return res.status(500).json({ message: "Error importing listings", error: error.message });
    }
});
exports.importUserListing = importUserListing;
const importListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const baseUploadDir = "uploads/listing/";
        const mainLIstinImageDir = "uploads/listing_main_image/";
        // Set upload directory path with listing ID for each record
        const data = rawData.map((item) => {
            const listingId = String(item["Listing Id"]);
            const uploadDir = listingId ? path_1.default.join(baseUploadDir, listingId, "/") : baseUploadDir;
            return {
                listing_unique_id: String(item["Listing Id"] || ""),
                category_ids: String(item["Categories"] || ""),
                name: String(item["Company"] || ""),
                description: String(item["Description"] || ""),
                email: String(item["Email address"] || ""),
                second_email: String(item["Email address Two"] || ""),
                phone_number: String(item["Phone Number"] || ""),
                second_phone_no: String(item["Phone Number Two"] || ""),
                country_id: String(item["Country"] || ""),
                state_id: String(item["State"] || ""),
                city_id: String(item["City"] || ""),
                area_id: String(item["Area"] || ""),
                address: String(item["Address"] || ""),
                pincode: String(item["Pincode"] || ""),
                latitude: String(item["Lattitude"] || ""),
                longitude: String(item["Longitude"] || ""),
                website: String(item["Website"] || ""),
                price: String(item["Price"] || ""),
                time_duration: String(item["Time Duration"] || ""),
                approved: item["Verified"] === "Yes",
                listing_type: String(item["Paid"] || ""),
                contact_person: String(item["Contact Person Name"] || ""),
                listing_image: item["Listing Image"]
                    ? mainLIstinImageDir + String(item["Listing Image"] || "")
                    : "",
                cover_image: item["Desktop Cover Image"] ? uploadDir + item["Desktop Cover Image"] : "",
                mobile_cover_image: item["Mobile Cover Image"]
                    ? uploadDir + String(item["Mobile Cover Image"] || "")
                    : ""
            };
        });
        const totalRecords = data.length;
        const avgTimePerRecord = 0.05; // seconds (adjust if needed)
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        yield importFileStatus_schema_1.default.create({
            module_name: "Listing",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Listing Import", "processing");
        // ✅ Immediate response to user
        res.status(200).json({
            message: `Your listing file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // ✅ Background processing
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const loginUser = req.user; // must be available from auth middleware
                const chunkSize = 100; // process in smaller chunks
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);
                    yield new Promise((resolve, reject) => {
                        (0, listing_model_1.importListingDataModel)(loginUser, chunk, (error, result) => {
                            if (error) {
                                console.error("Chunk import error:", error);
                                return reject(error);
                            }
                            resolve(result);
                        });
                    });
                }
                yield importFileStatus_schema_1.default.deleteOne({ module_name: "Listing" });
                console.log("✅ Listing background import completed.");
                const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Listing Import", "completed");
            }
            catch (err) {
                console.error("❌ Error during background import:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("❌ Listing import failed:", error);
        return res.status(500).json({ message: "Error importing listings", error: error.message });
    }
});
exports.importListing = importListing;
const importFreshListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const baseUploadDir = "uploads/listing/";
        const mainLIstinImageDir = "uploads/listing_main_image/";
        // Set upload directory path with listing ID for each record
        const data = rawData.map((item) => {
            const listingId = String(item["Listing Id"]);
            const uploadDir = listingId ? path_1.default.join(baseUploadDir, listingId, "/") : baseUploadDir;
            return {
                user_email: String(item["User Email"] || ""),
                category_ids: String(item["Categories"] || ""),
                name: String(item["Company"] || ""),
                description: String(item["Description"] || ""),
                email: String(item["Email address"] || ""),
                second_email: String(item["Email address Two"] || ""),
                phone_number: String(item["Phone Number"] || ""),
                second_phone_no: String(item["Phone Number Two"] || ""),
                country_id: String(item["Country"] || ""),
                state_id: String(item["State"] || ""),
                city_id: String(item["City"] || ""),
                area_id: String(item["Area"] || ""),
                address: String(item["Address"] || ""),
                pincode: String(item["Pincode"] || ""),
                latitude: String(item["Lattitude"] || ""),
                longitude: String(item["Longitude"] || ""),
                website: String(item["Website"] || ""),
                price: String(item["Price"] || ""),
                time_duration: String(item["Time Duration"] || ""),
                approved: item["Verified"] === "Yes",
                listing_type: String(item["Paid"] || ""),
                contact_person: String(item["Contact Person Name"] || ""),
                listing_image: item["Listing Image"]
                    ? mainLIstinImageDir + String(item["Listing Image"] || "")
                    : "",
                cover_image: item["Desktop Cover Image"] ? uploadDir + item["Desktop Cover Image"] : "",
                mobile_cover_image: item["Mobile Cover Image"]
                    ? uploadDir + String(item["Mobile Cover Image"] || "")
                    : ""
            };
        });
        const totalRecords = data.length;
        const avgTimePerRecord = 0.05; // seconds (adjust if needed)
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Fresh Listing Import", "processing");
        // ✅ Immediate response to user
        res.status(200).json({
            message: `Your listing file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // ✅ Background processing
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const loginUser = req.user; // must be available from auth middleware
                const chunkSize = 100; // process in smaller chunks
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);
                    yield new Promise((resolve, reject) => {
                        (0, listing_model_1.importFreshListingDataModel)(loginUser, chunk, (error, result) => {
                            if (error) {
                                console.error("Chunk import error:", error);
                                return reject(error);
                            }
                            resolve(result);
                        });
                    });
                }
                console.log("✅ Listing background import completed.");
                const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Fresh Listing Import", "completed");
            }
            catch (err) {
                console.error("❌ Error during background import:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("❌ Listing import failed:", error);
        return res.status(500).json({ message: "Error importing listings", error: error.message });
    }
});
exports.importFreshListing = importFreshListing;
const exportListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id, limit } = req.query;
        const filter = {};
        let categoryIdsArray = [];
        // Parse category_id if provided
        if (category_id && typeof category_id === "string") {
            categoryIdsArray = category_id.split(",").map((id) => id.trim());
            const objectIdArray = categoryIdsArray.map((id) => new mongoose_1.default.Types.ObjectId(id));
            filter.category_ids = { $in: objectIdArray };
        }
        // Set export limit (default 10000)
        const exportLimit = Number(limit) || 10000;
        // const exportLimit =  10;
        const listings = yield listing_schema_1.default.aggregate([
            { $match: filter },
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
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city_id"
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
                    from: "areas",
                    localField: "area_id",
                    foreignField: "unique_id",
                    as: "area_id"
                }
            },
            {
                $project: {
                    listing_unique_id: 1,
                    name: 1,
                    description: 1,
                    email: 1,
                    second_email: 1,
                    phone_number: 1,
                    second_phone_no: 1,
                    city_id: { $arrayElemAt: ["$city_id", 0] },
                    country_id: { $arrayElemAt: ["$country_id", 0] },
                    state_id: { $arrayElemAt: ["$state_id", 0] },
                    area_id: { $arrayElemAt: ["$area_id", 0] },
                    address: 1,
                    pincode: 1,
                    latitude: 1,
                    longitude: 1,
                    website: 1,
                    price: 1,
                    time_duration: 1,
                    approved: 1,
                    listing_type: 1,
                    contact_person: 1,
                    category_ids: 1,
                    sortingOrder: 1,
                    listing_image: 1,
                    cover_image: 1,
                    mobile_cover_image: 1
                }
            },
            { $sort: { sortingOrder: -1 } },
            { $limit: exportLimit }
        ]);
        // Format data
        const listingsData = yield Promise.all(listings.map((listing) => __awaiter(void 0, void 0, void 0, function* () {
            var _k, _l, _m, _o, _p, _q, _r, _s, _t;
            let categoryNames = ((_k = listing === null || listing === void 0 ? void 0 : listing.category_ids) === null || _k === void 0 ? void 0 : _k.map((cat) => cat.name)) || [];
            const reviewPromise = (0, listing_model_1.ListingWiseReviewList)(listing._id, 1, 10);
            const listing_review_list = yield Promise.all([reviewPromise]);
            let isFeatured = false;
            const existingListing = yield featuredListing_schema_1.default.findOne({
                listing_id: listing.listing_unique_id
            }).lean();
            if (existingListing) {
                isFeatured = true;
            }
            let isPremium = false;
            const existingPremiumListing = yield premiumListing_schema_1.default.findOne({
                listing_id: listing.listing_unique_id
            }).lean();
            if (existingPremiumListing) {
                isPremium = true;
            }
            if (categoryIdsArray.length > 0) {
                categoryNames = listing.category_ids
                    .filter((cat) => categoryIdsArray.includes(cat._id.toString()))
                    .map((cat) => cat.name);
            }
            return {
                "Listing Id": (listing === null || listing === void 0 ? void 0 : listing.listing_unique_id) || "N/A",
                Categories: categoryNames.length ? categoryNames.join(", ") : "N/A",
                Company: (listing === null || listing === void 0 ? void 0 : listing.name) || "N/A",
                Description: (listing === null || listing === void 0 ? void 0 : listing.description) || "N/A",
                "Email address": (listing === null || listing === void 0 ? void 0 : listing.email) || "N/A",
                "Email address Two": (listing === null || listing === void 0 ? void 0 : listing.second_email) || "N/A",
                "Phone Number": (listing === null || listing === void 0 ? void 0 : listing.phone_number) || "N/A",
                "Phone Number Two": (listing === null || listing === void 0 ? void 0 : listing.second_phone_no) || "N/A",
                City: Array.isArray(listing === null || listing === void 0 ? void 0 : listing.city_id)
                    ? listing.city_id.map((c) => c.name).join(", ")
                    : ((_l = listing.city_id) === null || _l === void 0 ? void 0 : _l.name) || "All",
                Country: (_o = (_m = listing.country_id) === null || _m === void 0 ? void 0 : _m.name) !== null && _o !== void 0 ? _o : "N/A",
                State: (_q = (_p = listing.state_id) === null || _p === void 0 ? void 0 : _p.name) !== null && _q !== void 0 ? _q : "N/A",
                Area: (_s = (_r = listing.area_id) === null || _r === void 0 ? void 0 : _r.name) !== null && _s !== void 0 ? _s : "N/A",
                Address: (listing === null || listing === void 0 ? void 0 : listing.address) || "N/A",
                Pincode: (listing === null || listing === void 0 ? void 0 : listing.pincode) || "N/A",
                Latitude: (listing === null || listing === void 0 ? void 0 : listing.latitude) || "N/A",
                Longitude: (listing === null || listing === void 0 ? void 0 : listing.longitude) || "N/A",
                Website: (listing === null || listing === void 0 ? void 0 : listing.website) || "N/A",
                Price: (listing === null || listing === void 0 ? void 0 : listing.price) || "N/A",
                "Time Duration": (listing === null || listing === void 0 ? void 0 : listing.time_duration) || "N/A",
                Verified: (listing === null || listing === void 0 ? void 0 : listing.approved) ? "Yes" : "No",
                Paid: (listing === null || listing === void 0 ? void 0 : listing.listing_type) === "Free" ? "No" : "Yes",
                "Contact Person Name": (listing === null || listing === void 0 ? void 0 : listing.contact_person) || "N/A",
                "Listing Image": (listing === null || listing === void 0 ? void 0 : listing.listing_image) &&
                    (listing === null || listing === void 0 ? void 0 : listing.listing_image) !== "null" &&
                    (listing === null || listing === void 0 ? void 0 : listing.listing_image) !== "N/A"
                    ? path_1.default.basename(listing === null || listing === void 0 ? void 0 : listing.listing_image)
                    : "",
                "Desktop Cover Image": (listing === null || listing === void 0 ? void 0 : listing.cover_image) &&
                    (listing === null || listing === void 0 ? void 0 : listing.cover_image) !== "null" &&
                    (listing === null || listing === void 0 ? void 0 : listing.cover_image) !== "N/A" &&
                    (listing === null || listing === void 0 ? void 0 : listing.cover_image) !== ""
                    ? path_1.default.basename(listing === null || listing === void 0 ? void 0 : listing.cover_image)
                    : "",
                "Mobile Cover Image": (listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image) &&
                    (listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image) !== "null" &&
                    (listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image) !== "N/A" &&
                    (listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image) !== ""
                    ? path_1.default.basename(listing === null || listing === void 0 ? void 0 : listing.mobile_cover_image)
                    : "",
                "Average Rating": (listing_review_list && ((_t = listing_review_list[0]) === null || _t === void 0 ? void 0 : _t.averageRating)) || 0,
                "Is Featured": isFeatured ? "Yes" : "No",
                "Is Premium": isPremium ? "Yes" : "No"
            };
        })));
        // Create Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(listingsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        // Set headers
        res.setHeader("Content-Disposition", "attachment; filename=listings.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error exporting listings:", error);
        res.status(500).json({ message: "Error exporting listings", error: error.message });
    }
});
exports.exportListing = exportListing;
//# sourceMappingURL=listing.controller.js.map