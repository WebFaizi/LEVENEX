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
exports.importFeaturedListing = exports.exportFeaturedListing = exports.getFeaturedListingDetails = exports.getFeaturedListingList = exports.storeFeaturedListing = exports.deleteAllFeaturedListings = exports.deleteFeaturedlisting = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const featuredListing_model_1 = require("../../domain/models/featuredListing.model");
const featuredListing_schema_1 = __importDefault(require("../../domain/schema/featuredListing.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const XLSX = __importStar(require("xlsx"));
const importFileStatus_schema_1 = __importDefault(require("../../domain/schema/importFileStatus.schema"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const deleteFeaturedlisting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listing_ids } = req.body;
        if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Quotation ID.");
        }
        const result = yield featuredListing_schema_1.default.deleteMany({ _id: { $in: listing_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No quotation found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Listings(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.deleteFeaturedlisting = deleteFeaturedlisting;
const deleteAllFeaturedListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield featuredListing_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Featured listings found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Featured listings.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Featured listings.");
    }
});
exports.deleteAllFeaturedListings = deleteAllFeaturedListings;
const storeFeaturedListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, featuredListing_model_1.storeFetauredListingModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category Stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.storeFeaturedListing = storeFeaturedListing;
const getFeaturedListingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, featuredListing_model_1.FeaturedListingList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getFeaturedListingList = getFeaturedListingList;
const getFeaturedListingDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { featured_listing_id } = req.params;
        (0, featuredListing_model_1.featuredListingDetails)(featured_listing_id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Featured Listing details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.getFeaturedListingDetails = getFeaturedListingDetails;
const exportFeaturedListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id, city_id } = req.query;
        const filter = {};
        if (category_id) {
            const categoryIdsArray = category_id
                .split(",")
                .map((id) => new mongoose_1.default.Types.ObjectId(id.trim()));
            filter.category_ids = { $in: categoryIdsArray };
        }
        if (city_id) {
            const cityIdsArray = city_id
                .split(",")
                .map((id) => new mongoose_1.default.Types.ObjectId(id.trim()));
            filter.city_id = { $in: cityIdsArray };
        }
        const listings = yield featuredListing_schema_1.default.aggregate([
            { $match: filter },
            { $sort: { position: -1 } },
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
                    from: "listings",
                    localField: "listing_id",
                    foreignField: "listing_unique_id",
                    as: "listing_id"
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
                $project: {
                    "category_ids.name": 1,
                    "listing_id.name": 1,
                    "city_id.name": 1,
                    is_all_city_selected: 1,
                    is_all_category_selected: 1,
                    position: 1
                }
            },
            {
                $unwind: {
                    path: "$listing_id",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).exec();
        if (!listings.length) {
            return res.status(404).json({ message: "No listings found to export." });
        }
        const listingsData = listings.map((listing) => {
            var _a, _b, _c;
            console.log("listing?.listing_id", listing === null || listing === void 0 ? void 0 : listing.listing_id);
            return {
                "Listing Name": (listing === null || listing === void 0 ? void 0 : listing.listing_id) && "name" in listing.listing_id ? listing.listing_id.name : "N/A",
                Categories: !listing.is_all_category_selected ? (_a = listing === null || listing === void 0 ? void 0 : listing.category_ids) === null || _a === void 0 ? void 0 : _a.map((cat) => cat.name).join(", ") : "All",
                Cities: !(listing === null || listing === void 0 ? void 0 : listing.is_all_city_selected) ? (_b = listing === null || listing === void 0 ? void 0 : listing.city_id) === null || _b === void 0 ? void 0 : _b.map((city) => city.name).join(", ") : "All",
                Position: (_c = listing === null || listing === void 0 ? void 0 : listing.position) !== null && _c !== void 0 ? _c : "N/A"
            };
        });
        // return res.send({ listingsData });
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(listingsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Featured Listings");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=featured_listings.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        return res.status(500).json({ message: "Error exporting listings", error: error.message });
    }
});
exports.exportFeaturedListing = exportFeaturedListing;
const importFeaturedListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            category_name: String(item["Categories"] || ""),
            city_name: String(item["Cities"] || ""),
            position: String(item["Position"] || "")
        }));
        const totalRecords = data.length - 1;
        const avgTimePerRecord = 0.01; // seconds per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        yield importFileStatus_schema_1.default.create({
            module_name: "FeaturedListing",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                (0, featuredListing_model_1.importFeaturedListingDataModel)(data, (error, result) => __awaiter(void 0, void 0, void 0, function* () {
                    if (!error) {
                        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Featured Listing", "Import", "Featured listings imported.");
                        yield importFileStatus_schema_1.default.deleteOne({ module_name: "FeaturedListing" });
                        console.log("Featured listings import completed.");
                    }
                    else {
                        console.error("Featured Listing Import Error:", error);
                    }
                }));
            }
            catch (err) {
                console.error("Featured Listing Background Import Error:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("Featured listing import error:", error);
        return res.status(500).json({ message: "Error importing listings", error: error.message });
    }
});
exports.importFeaturedListing = importFeaturedListing;
//# sourceMappingURL=featuredListing.controller.js.map