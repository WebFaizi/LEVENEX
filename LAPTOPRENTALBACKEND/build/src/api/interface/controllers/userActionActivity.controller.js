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
exports.userActionActivityList = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const setting_model_1 = require("../../domain/models/setting.model");
const userActionActivityList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, setting_model_1.userActionActivityListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get Job category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.userActionActivityList = userActionActivityList;
//# sourceMappingURL=userActionActivity.controller.js.map