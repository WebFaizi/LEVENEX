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
exports.getAdsBanners = void 0;
const bannersTheme_schema_1 = __importDefault(require("../domain/schema/bannersTheme.schema"));
const banners_schema_1 = __importDefault(require("../domain/schema/banners.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const tryObjectId = (id) => {
    try {
        return new mongoose_1.default.Types.ObjectId(id);
    }
    catch (_a) {
        return id; // if not valid ObjectId, return as string
    }
};
const extractIds = (htmlArray) => {
    const regex = /data-id="(.*?)"/g;
    const bannerIds = [];
    for (const html of htmlArray) {
        let match;
        while ((match = regex.exec(html)) !== null) {
            bannerIds.push(match[1]);
        }
    }
    return bannerIds;
};
const getAdsBanners = (category_id, user_current_location, banners_type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners_theme = yield bannersTheme_schema_1.default.findOne({
            banner_theme_slug: banners_type
        }).exec();
        if (!banners_theme || !banners_theme.banner_type_code) {
            return { message: "No banner theme found", randomBanner: null };
        }
        const html = banners_theme.banner_type_code;
        const bannerIds = extractIds(html);
        const queryConditions = [];
        // 📌 Category filters
        if (category_id && category_id !== '') {
            queryConditions.push({
                $or: [
                    { select_all_categories: true },
                    {
                        select_all_categories: false,
                        category_ids: { $in: [category_id] }
                    }
                ]
            });
        }
        else {
            queryConditions.push({
                $or: [
                    { select_all_categories: true },
                    { select_all_categories: false }
                ]
            });
        }
        // 📌 City filters
        if (user_current_location === null || user_current_location === void 0 ? void 0 : user_current_location.current_city_unique_id) {
            const currentCityUniqueId = Number(user_current_location.current_city_unique_id);
            queryConditions.push({
                $or: [
                    { hide_banner_city_ids: { $exists: false } },
                    { hide_banner_city_ids: { $size: 0 } },
                    { hide_banner_city_ids: { $nin: [currentCityUniqueId] } }
                ]
            });
            queryConditions.push({
                $or: [
                    { select_all_cities: true },
                    {
                        select_all_cities: false,
                        city_ids: { $in: [currentCityUniqueId] }
                    }
                ]
            });
        }
        else {
            queryConditions.push({ select_all_cities: true });
        }
        // 📌 Banner Type ID
        if (bannerIds.length > 0) {
            const objectIdBannerIds = bannerIds.map(id => new mongoose_1.default.Types.ObjectId(id));
            queryConditions.push({
                banner_type_id: { $in: objectIdBannerIds }
            });
        }
        const banners_data_list = yield banners_schema_1.default.find({ $and: queryConditions });
        let randomBanner = null;
        if (banners_data_list.length > 0) {
            randomBanner = banners_data_list[Math.floor(Math.random() * banners_data_list.length)];
            randomBanner.banner_image = `${process.env.BASE_URL}/${randomBanner.banner_image}`;
        }
        return { randomBanner };
    }
    catch (error) {
        console.error("Error fetching banners for type:", banners_type, error);
        return { randomBanner: null, error: error instanceof Error ? error.message : "Unknown error" };
    }
});
exports.getAdsBanners = getAdsBanners;
exports.default = exports.getAdsBanners;
//# sourceMappingURL=banners.service.js.map