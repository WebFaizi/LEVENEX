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
exports.redirectUrlImport = exports.getRedirectUrlExport = exports.getUrlExcelFormet = exports.deleteRedirectUrl = exports.redirectDetails = exports.getRedircetsUrlList = exports.deleteAllRedirects = exports.storeRedirectsUrl = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const redircetsUrl_schema_1 = __importDefault(require("../../domain/schema/redircetsUrl.schema"));
const redirectsUrl_model_1 = require("../../domain/models/redirectsUrl.model");
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const XLSX = __importStar(require("xlsx"));
const storeRedirectsUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, redirectsUrl_model_1.storeRedircetsUrlModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "RedircetUrl", "Create", `Added new Redirect urls`);
            return (0, apiResponse_1.successResponse)(res, "Category Stored in Database successfully", result);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeRedirectsUrl = storeRedirectsUrl;
const deleteAllRedirects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield redircetsUrl_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Redirects found to delete.");
        }
        (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "RedircetUrl", "Delete", `Delete All Redircets url!`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Redirects.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Redirects.");
    }
});
exports.deleteAllRedirects = deleteAllRedirects;
const getRedircetsUrlList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, redirectsUrl_model_1.getRediretsUrlListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get country list successfully", categories);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getRedircetsUrlList = getRedircetsUrlList;
const redirectDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, redirectsUrl_model_1.redirectDetail)(id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Blog details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.redirectDetails = redirectDetails;
const deleteRedirectUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, url_ids } = req.body;
        if (type == 1) {
            if (!url_ids || !Array.isArray(url_ids) || url_ids.length === 0) {
                return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Url ID.");
            }
            const result = yield redircetsUrl_schema_1.default.deleteMany({ _id: { $in: url_ids } });
            if (result.deletedCount === 0) {
                return (0, apiResponse_1.ErrorResponse)(res, "No Data found with the provided IDs.");
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "RedircetUrl", "Delete", `Delete sme redirects urls!`);
            return (0, apiResponse_1.successResponse)(res, `${result.deletedCount} Data(es) deleted successfully.`, []);
        }
        else {
            const result = yield redircetsUrl_schema_1.default.deleteMany({});
            if (result.deletedCount === 0) {
                return (0, apiResponse_1.ErrorResponse)(res, "No Data records found to delete.");
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "RedircetUrl", "Delete", `Delete All Redircets url!`);
            return (0, apiResponse_1.successResponse)(res, `All ${result.deletedCount} Data deleted successfully.`, []);
        }
    }
    catch (error) {
        console.error("Error deleting Data:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting Data    .");
    }
});
exports.deleteRedirectUrl = deleteRedirectUrl;
const getUrlExcelFormet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use .lean() for faster DB performance
        const data = yield redircetsUrl_schema_1.default.find({}, {
            from_url: 1,
            to_url: 1,
            _id: 0
        }).lean();
        // No need for optional chaining if using .lean()
        const formattedData = data.map(item => ({
            from_url: item.from_url,
            to_url: item.to_url,
        }));
        // Create worksheet and workbook
        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ["from_url", "to_url"],
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        // Generate Excel buffer
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
        // Set headers and return buffer
        res.setHeader("Content-Disposition", "attachment; filename=RedirectUrl.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error creating excel file:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while creating excel file.");
    }
});
exports.getUrlExcelFormet = getUrlExcelFormet;
const getRedirectUrlExport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield redircetsUrl_schema_1.default.find({});
        if (!data || data.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No redirect URLs found.");
        }
        const formattedData = data.map(item => ({
            from_url: item.from_url,
            to_url: item.to_url,
        }));
        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ["from_url", "to_url"],
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=RedirectUrlData.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error creating excel file:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while creating the Excel file.");
    }
});
exports.getRedirectUrlExport = getRedirectUrlExport;
const redirectUrlImport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        if (!data || data.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "The Excel file is empty or contains invalid data.");
        }
        const formattedData = data.map((item) => ({
            from_url: item.from_url,
            to_url: item.to_url,
        }));
        const totalRecords = formattedData.length;
        const avgTimePerRecord = 0.01; // seconds per row
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        // Respond immediately to user
        res.status(200).json({
            message: `Your file with ${totalRecords} redirect URLs is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });
        // Background processing
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const uniqueData = [];
                for (let i = 0; i < formattedData.length; i++) {
                    const { from_url, to_url } = formattedData[i];
                    const existingRecord = yield redircetsUrl_schema_1.default.findOne({ from_url, to_url });
                    if (!existingRecord) {
                        uniqueData.push({ from_url, to_url });
                    }
                }
                if (uniqueData.length > 0) {
                    yield redircetsUrl_schema_1.default.insertMany(uniqueData);
                    (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "RedircetUrl", "Delete", `Redircet import succesfully!`);
                    console.log(`Imported ${uniqueData.length} new redirect URLs`);
                }
                else {
                    console.log("No new unique redirect URLs to import.");
                }
            }
            catch (err) {
                console.error("Background redirect import error:", err.message);
            }
        }), 100);
    }
    catch (error) {
        console.error("Error importing excel file:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while importing the Excel file.");
    }
});
exports.redirectUrlImport = redirectUrlImport;
//# sourceMappingURL=redirectsUrl.controller.js.map