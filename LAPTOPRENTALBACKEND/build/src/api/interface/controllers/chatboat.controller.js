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
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatboatListing = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const chatboatListing_model_1 = require("../../domain/models/chatboatListing.model");
const chatboatListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, chatboatListing_model_1.chatboatListingModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully sdsdsd", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.chatboatListing = chatboatListing;
//# sourceMappingURL=chatboat.controller.js.map