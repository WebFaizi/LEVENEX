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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.updatePremiumListingData = exports.getPremiumListingDetails = exports.deletePremiumListingList = exports.getPremiumListingList = exports.importPremiumListing = exports.storePremiumListingData = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const premiumListing_schema_1 = __importDefault(require("../../domain/schema/premiumListing.schema"));
const premiumListing_model_1 = require("../../domain/models/premiumListing.model");
const XLSX = __importStar(require("xlsx"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const storePremiumListingData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, premiumListing_model_1.storePremiumListingModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Premium listing Stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storePremiumListingData = storePremiumListingData;
const importPremiumListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            premium_type: String(item["Premium Type"] || ""),
            listing_unique_id: String(item["Listing Unique Id"] || ""),
            start_date: String(item["Start Date"] || null),
            end_date: String(item["End Date"] || null)
        }));
        const totalRecords = data.length - 1;
        const avgTimePerRecord = 0.01; // seconds per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        console.log('data:', data);
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                (0, premiumListing_model_1.importPremiumListingDataModel)(data, (error, result) => __awaiter(void 0, void 0, void 0, function* () {
                    if (!error) {
                        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Premium Listing", "Import", "Featured listings imported.");
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
exports.importPremiumListing = importPremiumListing;
const getPremiumListingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, premiumListing_model_1.premiumListingList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get premium list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getPremiumListingList = getPremiumListingList;
const deletePremiumListingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listing_ids } = req.body;
        if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Quotation ID.");
        }
        const result = yield premiumListing_schema_1.default.deleteMany({ _id: { $in: listing_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No premium found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  premium Listings(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deletePremiumListingList = deletePremiumListingList;
const getPremiumListingDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listing_id } = req.params;
        (0, premiumListing_model_1.premiumListingDetail)(listing_id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "premium Listing details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.getPremiumListingDetails = getPremiumListingDetails;
const updatePremiumListingData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, premiumListing_model_1.updatePremiumListingModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "premium Stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updatePremiumListingData = updatePremiumListingData;
//# sourceMappingURL=premiumListing.controller.js.map