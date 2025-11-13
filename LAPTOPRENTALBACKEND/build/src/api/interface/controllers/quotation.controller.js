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
exports.exportQuotationToExcel = exports.deleteSubscribers = exports.deleteQuotation = exports.getQuotationList = exports.updateQuotationStatus = exports.addQoutation = exports.storeQuotation = exports.getSubscribersExcelFormet = exports.getSubscriberList = exports.ImportSubscribers = exports.ExportSubscribers = exports.sendMailSubscribers = void 0;
const XLSX = __importStar(require("xlsx"));
const quotation_schema_1 = __importDefault(require("../../domain/schema/quotation.schema"));
const listing_schema_1 = __importDefault(require("../../domain/schema/listing.schema"));
const subscribers_schema_1 = __importDefault(require("../../domain/schema/subscribers.schema"));
const marketingBanner_model_1 = require("../../domain/models/marketingBanner.model");
const apiResponse_1 = require("../../helper/apiResponse");
const sendEmail_service_1 = require("../../services/sendEmail.service");
const quotation_model_1 = require("../../domain/models/quotation.model");
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
const sendMailSubscribers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscribers = yield subscribers_schema_1.default.find({});
        if (!subscribers || subscribers.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No subscribers found.");
        }
        (0, marketingBanner_model_1.getMarketingBannerDetail)(req.user, (error, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            const listings = yield listing_schema_1.default.find({
                _id: { $in: result.marketing_banner.marketingbanner_listing_id }
            }).lean();
            const listingsHtml = listings.map((listing) => `
             
                <tr>
                    <td width="80" style="padding-right:15px;">
                        <img src="${listing.listing_image ? `${process.env.BASE_URL}/${listing.listing_image}` : 'https://via.placeholder.com/80'}" alt="User Image" style="width:80px; height:80px; border-radius:50%; border:1px solid #ccc;" />
                    </td>
                    <td style="vertical-align:top;">
                        <div style="font-size:16px; font-weight:bold; color:#333;">${listing.name || 'Unnamed Listing'}</div>
                        <div style="font-size:14px; color:#666;">${listing.address || 'Member'}</div>
                    </td>
                </tr>
            `).join("");
            console.log("result.marketing_banner.marketingbanner_image", result.marketing_banner.marketingbanner_image);
            const html = `
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; font-family:Arial, sans-serif; border:1px solid #ddd; border-radius:8px;">
                    <tr>
                        <td style="background-color:#f4f4f4; padding:20px; text-align:center; font-size:22px; font-weight:bold; border-bottom:1px solid #ddd;">
                            📢 Latest Marketing Update
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center; padding:16px;">
                            <img src="${result.marketing_banner.marketingbanner_image}" alt="Marketing Banner" style="max-width:100%; border-radius:6px;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px; font-size:16px; color:#333;">
                            <div style="line-height:1.6;">
                                ${result.marketing_banner.marketingbanner_description}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f9f9f9; padding:16px; text-align:center; font-size:12px; color:#777; border-top:1px solid #ddd;">
                            You are receiving this email because you subscribed to our updates.
                        </td>
                    </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; font-family:Arial, sans-serif; border:1px solid #ddd; border-radius:8px;">
                    <tr>
                        <td style="background-color:#f4f4f4; padding:20px; text-align:center; font-size:20px; font-weight:bold;">
                            Listings
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px; border-bottom:1px solid #eee;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial, sans-serif;">
                                ${listingsHtml}
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f9f9f9; padding:12px; text-align:center; font-size:12px; color:#888; border-top:1px solid #ddd;">
                            You received this listing update because you're subscribed to our service.
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center; padding:20px;">
                            <a href="${process.env.BASE_URL_TWO}/unsubscribe/bhavin@freshcodes.in " 
                            style="display:inline-block; padding:10px 20px; background-color:#d9534f; color:#fff; text-decoration:none; border-radius:4px; font-size:14px;">
                            Unsubscribe
                            </a>
                            <div style="margin-top:10px; font-size:12px; color:#888;">
                            Click here if you no longer want to receive these updates.
                            </div>
                        </td>
                        </tr>
                </table>
            `;
            console.log(html);
            for (const subscriber of subscribers) {
                const email = subscriber.email;
                if (isValidEmail(email)) {
                    yield sendEmail_service_1.EmailService.sendEmail(email, "Latest Marketing Update", html);
                }
            }
            return (0, apiResponse_1.successResponse)(res, "Marketing emails sent successfully", subscribers.length);
        }));
    }
    catch (error) {
        console.error("Error sending marketing emails:", error);
        res.status(500).json({ message: "Error sending marketing emails", error: error.message });
    }
});
exports.sendMailSubscribers = sendMailSubscribers;
const ExportSubscribers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exportLimit = Number(1000) || 10000;
        const listings = yield subscribers_schema_1.default.find({}, {
            name: 1,
            email: 1,
        })
            .sort({ sortingOrder: -1 })
            .limit(exportLimit)
            .lean();
        // Format data
        const listingsData = listings.length > 0
            ? listings.map((listing) => ({
                name: (listing === null || listing === void 0 ? void 0 : listing.name) || "N/A",
                email: (listing === null || listing === void 0 ? void 0 : listing.email) || "N/A",
            }))
            : [{ name: "", email: "" }]; // 👈 Adds just header row if empty
        // Create Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(listingsData, { header: ["name", "email"] });
        XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        // Set headers
        res.setHeader("Content-Disposition", "attachment; filename=subscribers.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error exporting listings:", error);
        res.status(500).json({ message: "Error exporting listings", error: error.message });
    }
});
exports.ExportSubscribers = ExportSubscribers;
const ImportSubscribers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        // Parse Excel data
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const totalRecords = data.length;
        const avgTimePerRecord = 0.015; // seconds per row
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        // Immediate response to user
        res.status(200).json({
            message: `Your file with ${totalRecords} job categories is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });
        // Background import process
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                for (const row of data) {
                    const { name, email } = row;
                    const existingCategory = yield subscribers_schema_1.default.findOne({ email: email });
                    if (existingCategory) {
                    }
                    else {
                        yield subscribers_schema_1.default.create({
                            name: name,
                            email: email,
                        });
                    }
                }
                console.log(`Subscribers Import Done. Total records: ${totalRecords}`);
            }
            catch (err) {
                console.error("Background job category import error:", err.message);
            }
        }), 100);
    }
    catch (error) {
        return res.status(500).json({ message: "Error importing job categories", error: error.message });
    }
});
exports.ImportSubscribers = ImportSubscribers;
const getSubscriberList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const users = yield (0, quotation_model_1.subscriberList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get subscribers list successfully", users);
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getSubscriberList = getSubscriberList;
const getSubscribersExcelFormet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use .lean() for faster DB performance
        const data = yield subscribers_schema_1.default.find({}, {
            name: 1,
            email: 1,
            _id: 0
        }).lean();
        // No need for optional chaining if using .lean()
        const formattedData = data.map(item => ({
            name: item.name,
            email: item.email,
        }));
        // Create worksheet and workbook
        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ["name", "email"],
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        // Generate Excel buffer
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
        // Set headers and return buffer
        res.setHeader("Content-Disposition", "attachment; filename=Subscribers.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error creating excel file:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while creating excel file.");
    }
});
exports.getSubscribersExcelFormet = getSubscribersExcelFormet;
const storeQuotation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, quotation_model_1.storeQuotationModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Thank you! Your quotation has been successfully recorded.", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeQuotation = storeQuotation;
const addQoutation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, quotation_model_1.storeQuotationModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Quotation Stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.addQoutation = addQoutation;
const updateQuotationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, quotation_model_1.updateQuotationModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category Stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateQuotationStatus = updateQuotationStatus;
const getQuotationList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10, quotation_list_type = 0, start_date, end_date } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return (0, apiResponse_1.ErrorResponse)(res, "Invalid start date or end date.");
            }
            if (endDate < startDate) {
                return (0, apiResponse_1.ErrorResponse)(res, "End date cannot be earlier than start date.");
            }
        }
        const users = yield (0, quotation_model_1.quotationList)(search, pageNum, limitNum, quotation_list_type, start_date, end_date);
        return (0, apiResponse_1.successResponse)(res, "get admin User list successfully", users);
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getQuotationList = getQuotationList;
const deleteQuotation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quotation_ids } = req.body;
        if (!quotation_ids || !Array.isArray(quotation_ids) || quotation_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Quotation ID.");
        }
        const result = yield quotation_schema_1.default.deleteMany({ _id: { $in: quotation_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No quotation found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Quotation(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteQuotation = deleteQuotation;
const deleteSubscribers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subscribe_id } = req.body;
        if (!subscribe_id || !Array.isArray(subscribe_id) || subscribe_id.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Quotation ID.");
        }
        const result = yield subscribers_schema_1.default.deleteMany({ _id: { $in: subscribe_id } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No quotation found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Subscribers(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteSubscribers = deleteSubscribers;
const exportQuotationToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', start_date, end_date, quotation_list_type } = req.body;
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return (0, apiResponse_1.ErrorResponse)(res, "Invalid start date or end date.");
            }
            // Ensure both dates are at midnight to compare only the day, or use full precision
            if (endDate.getTime() < startDate.getTime()) {
                return (0, apiResponse_1.ErrorResponse)(res, "End date cannot be earlier than start date.");
            }
        }
        const users = yield (0, quotation_model_1.quotationListExport)(search, start_date, end_date, quotation_list_type);
        if (users.data.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No quotations found with the provided search criteria.");
        }
        const data = users.data.map((quotation) => ({
            Name: quotation.name,
            Email: quotation.email,
            CategoryName: quotation.category_names,
            QuotationType: quotation.quotation_type,
            Quantity: quotation.quantity,
            'Phone Number': quotation.phone_number,
            Location: quotation.location,
            Message: quotation.message,
            Status: quotation.status,
            'View By Admin': quotation.view_by_admin,
            'Created At': quotation.createdAt,
            'Updated At': quotation.updatedAt,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Quotations');
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('quotations.xlsx');
        return res.send(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during the quotation export process.');
    }
});
exports.exportQuotationToExcel = exportQuotationToExcel;
//# sourceMappingURL=quotation.controller.js.map