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
exports.getChatboatListing = exports.homePage = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const setting_model_1 = require("../../domain/models/setting.model");
const homePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, setting_model_1.homePageModels)(req.body, (error, result) => {
            if (error) {
                console.log(error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Login User Successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.homePage = homePage;
const getChatboatListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, setting_model_1.getChatboatListingModel)(req.body, (error, result) => {
            if (error) {
                console.log(error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Listing information list", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getChatboatListing = getChatboatListing;
//# sourceMappingURL=homepage.controller.js.map