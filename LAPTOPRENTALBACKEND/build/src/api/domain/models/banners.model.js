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
exports.updateBannerThemeModel = exports.bannerThemeDetailModel = exports.updateBannerModel = exports.bannerDetailModel = exports.getBannerModel = exports.storeBannerModel = void 0;
const banners_schema_1 = __importDefault(require("../schema/banners.schema"));
const bannersTheme_schema_1 = __importDefault(require("../schema/bannersTheme.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const storeBannerModel = (bannerData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryObjectIds = Array.isArray(bannerData.category_ids)
            ? bannerData.category_ids
                .filter(id => Number(id))
                .map(id => Number(id))
            : [];
        const cityObjectIds = Array.isArray(bannerData.city_ids)
            ? bannerData.city_ids
                .filter(id => Number(id))
                .map(id => Number(id))
            : [];
        const hideBannerCityIds = Array.isArray(bannerData.hide_banner_city_ids)
            ? bannerData.hide_banner_city_ids
                .filter(id => Number(id))
                .map(id => new Number(id))
            : [];
        const bannerTypeId = new mongoose_1.default.Types.ObjectId(bannerData.banner_type_id);
        const newBanner = new banners_schema_1.default({
            banner_type_id: bannerTypeId,
            country_id: bannerData.country_id,
            state_id: bannerData.state_id,
            banner_title: bannerData.banner_title,
            banner_url: bannerData.banner_url,
            banner_image: bannerData.banner_image,
            display_period_in_days: bannerData.display_period_in_days,
            banner_email: bannerData.banner_email,
            hide_banner_city_ids: hideBannerCityIds,
            category_ids: categoryObjectIds,
            select_all_categories: bannerData.select_all_categories,
            select_all_cities: bannerData.select_all_cities,
            city_ids: cityObjectIds,
        });
        const savedBanner = yield newBanner.save();
        return callback(null, { savedBanner });
    }
    catch (error) {
        console.error("Error storing banner:", error);
        return callback(error, null);
    }
});
exports.storeBannerModel = storeBannerModel;
const getBannerModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
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
        const banners = yield banners_schema_1.default.find(searchQuery)
            .populate('banner_type_id')
            .limit(limit)
            .exec();
        const updatedBanners = banners.map(banner => {
            banner.banner_image = `${process.env.BASE_URL}/${banner.banner_image}`;
            return banner;
        });
        const totalUsers = yield banners_schema_1.default.countDocuments(searchQuery);
        return {
            data: updatedBanners,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) {
    }
});
exports.getBannerModel = getBannerModel;
const bannerDetailModel = (banners_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BannerTypeDetails = yield banners_schema_1.default.findOne({ _id: banners_id }).exec();
        if (!BannerTypeDetails) {
            return callback({ message: "Banner not found" }, null);
        }
        if (BannerTypeDetails.banner_image) {
            BannerTypeDetails.banner_image = `${process.env.BASE_URL}/${BannerTypeDetails.banner_image}`;
        }
        else {
            BannerTypeDetails.banner_image = `${process.env.BASE_URL}/default-image.png`;
        }
        return callback(null, { BannerTypeDetails });
    }
    catch (error) {
        console.error("Error fetching banner details:", error);
        return callback(error, null);
    }
});
exports.bannerDetailModel = bannerDetailModel;
const updateBannerModel = (bannerData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryObjectIds = Array.isArray(bannerData.category_ids)
            ? bannerData.category_ids
                .filter(id => Number(id))
                .map(id => new Number(id))
            : [];
        const cityObjectIds = Array.isArray(bannerData.city_ids)
            ? bannerData.city_ids
                .filter(id => Number(id))
                .map(id => new Number(id))
            : [];
        const hideBannerCityIds = Array.isArray(bannerData.hide_banner_city_ids)
            ? bannerData.hide_banner_city_ids
                .filter(id => Number(id))
                .map(id => new Number(id))
            : [];
        const bannerTypeId = new mongoose_1.default.Types.ObjectId(bannerData.banner_type_id);
        const bannerToUpdate = yield banners_schema_1.default.findById(bannerData.banners_id);
        if (!bannerToUpdate) {
            return callback({ message: "Banner not found" }, null);
        }
        const updatedData = {
            banner_type_id: bannerTypeId,
            country_id: bannerData.country_id,
            state_id: bannerData.state_id,
            banner_title: bannerData.banner_title,
            banner_url: bannerData.banner_url,
            display_period_in_days: bannerData.display_period_in_days,
            banner_email: bannerData.banner_email,
            hide_banner_city_ids: hideBannerCityIds,
            category_ids: categoryObjectIds,
            select_all_categories: bannerData.select_all_categories,
            select_all_cities: bannerData.select_all_cities,
            city_ids: cityObjectIds,
        };
        if (bannerData.banner_image) {
            updatedData.banner_image = bannerData.banner_image;
        }
        const updatedBanner = yield banners_schema_1.default.findByIdAndUpdate(bannerData.banners_id, updatedData, { new: true });
        return callback(null, { updatedBanner });
    }
    catch (error) {
        console.error("Error updating banner:", error);
        return callback(error, null);
    }
});
exports.updateBannerModel = updateBannerModel;
const bannerThemeDetailModel = (banners_theme_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BannerThemeDetails = yield bannersTheme_schema_1.default.findOne({ _id: banners_theme_id }).exec();
        if (!BannerThemeDetails) {
            return callback({ message: "Banner Theme not found" }, null);
        }
        return callback(null, { BannerThemeDetails });
    }
    catch (error) {
        console.error("Error fetching banner details:", error);
        return callback(error, null);
    }
});
exports.bannerThemeDetailModel = bannerThemeDetailModel;
const updateBannerThemeModel = (banner_themeData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bannerToUpdate = yield bannersTheme_schema_1.default.findById(banner_themeData.banner_theme_id);
        if (!bannerToUpdate) {
            return callback({ message: "Banner theme not found" }, null);
        }
        const updatedData = {
            provide_name: banner_themeData.provide_name,
            banner_type_code: banner_themeData.banner_type_code || null, // Set null if empty
            status: banner_themeData.status,
        };
        const updatedBanner = yield bannersTheme_schema_1.default.findByIdAndUpdate(banner_themeData.banner_theme_id, updatedData, { new: true });
        return callback(null, { updatedBanner });
    }
    catch (error) {
        console.error("Error updating banner theme:", error);
        return callback(error, null);
    }
});
exports.updateBannerThemeModel = updateBannerThemeModel;
//# sourceMappingURL=banners.model.js.map