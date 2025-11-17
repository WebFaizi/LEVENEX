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
exports.getBannerThemeModel = void 0;
const bannersTheme_schema_1 = __importDefault(require("../schema/bannersTheme.schema"));
const getBannerThemeModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { banner_title: { $regex: search, $options: 'i' } },
                    { banner_url: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const banners = yield bannersTheme_schema_1.default.find(searchQuery)
            .limit(limit)
            .exec();
        const totalUsers = yield bannersTheme_schema_1.default.countDocuments(searchQuery);
        return {
            data: banners,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) {
    }
});
exports.getBannerThemeModel = getBannerThemeModel;
//# sourceMappingURL=bannersTheme.models.js.map