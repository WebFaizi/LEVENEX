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
exports.updateKeywords = exports.deleteKeywords = exports.deleteAllKeywords = exports.importKeyword = exports.exportKeywordExcel = exports.getKeywords = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const keywords_schema_1 = __importDefault(require("../../domain/schema/keywords.schema"));
const keywords_model_1 = require("../../domain/models/keywords.model");
const XLSX = __importStar(require("xlsx"));
const getKeywords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, keywords_model_1.getKeywordsModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getKeywords = getKeywords;
const exportKeywordExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keywords = yield keywords_schema_1.default.find();
        var i = 0;
        const keywordsData = keywords.map((keyword, index) => ({
            Keyword: keyword === null || keyword === void 0 ? void 0 : keyword.words,
        }));
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(keywordsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Keywords");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=keywords.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        return res.status(500).json({ message: "Error exporting countries", error: error.message });
    }
});
exports.exportKeywordExcel = exportKeywordExcel;
const importKeyword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const data = rawData.map((item) => ({
            words: String(item["Keyword"] || ""),
        }));
        const categories = yield (0, keywords_model_1.importKeywordsDataModel)(data, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Listuing stored in Database successfully", result);
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Error importing categories", error: error.message });
    }
});
exports.importKeyword = importKeyword;
const deleteAllKeywords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield keywords_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Keywords found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Keywords.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Keywords.");
    }
});
exports.deleteAllKeywords = deleteAllKeywords;
const deleteKeywords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyword_ids } = req.body;
        if (!keyword_ids || !Array.isArray(keyword_ids) || keyword_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Ip Address ID.");
        }
        const result = yield keywords_schema_1.default.deleteMany({ _id: { $in: keyword_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Ip Address found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `${result.deletedCount} Keywords deleted successfully.`, []);
    }
    catch (error) {
        console.error("Error deleting IP Address:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting IP addresses.");
    }
});
exports.deleteKeywords = deleteKeywords;
const updateKeywords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield (0, keywords_model_1.updateKeywordModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Country Stored in Database successfully", result);
        });
    }
    catch (error) {
        console.log(error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateKeywords = updateKeywords;
//# sourceMappingURL=keywords.controller.js.map