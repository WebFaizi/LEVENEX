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
exports.updateBannerTypeModel = exports.bannerTypeDetailModel = exports.getBannerTypeModel = exports.storeBannerTypeModel = void 0;
const bannerTypes_schema_1 = __importDefault(require("../schema/bannerTypes.schema"));
const storeBannerTypeModel = (bannerTypeData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newBanner = new bannerTypes_schema_1.default({
            banner_title: bannerTypeData.banner_title,
            banner_size: bannerTypeData.banner_size,
            banner_price: bannerTypeData.banner_price,
            banner_slots: bannerTypeData.banner_slots,
            banner_preview_url: bannerTypeData.banner_preview_url,
        });
        const savedBannerType = yield newBanner.save();
        const bannerHtml = `<a class="ubm-banner" data-id="${savedBannerType._id}"></a>`;
        savedBannerType.banner_sortcode = bannerHtml;
        yield savedBannerType.save();
        return callback(null, { savedBannerType });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.storeBannerTypeModel = storeBannerTypeModel;
const getBannerTypeModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { banner_title: { $regex: search, $options: 'i' } },
                    { banner_size: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield bannerTypes_schema_1.default.find(searchQuery)
            .limit(limit)
            .exec();
        const totalUsers = yield bannerTypes_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) {
    }
});
exports.getBannerTypeModel = getBannerTypeModel;
const bannerTypeDetailModel = (banner_type_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BannerTypeDetails = yield bannerTypes_schema_1.default.findOne({ _id: banner_type_id });
        return callback(null, { BannerTypeDetails });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.bannerTypeDetailModel = bannerTypeDetailModel;
const updateBannerTypeModel = (bannerTypeData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let savedBannerType;
        if (bannerTypeData.banner_type_id) {
            savedBannerType = yield bannerTypes_schema_1.default.findById(bannerTypeData.banner_type_id);
            if (savedBannerType) {
                savedBannerType.banner_title = bannerTypeData.banner_title;
                savedBannerType.banner_size = bannerTypeData.banner_size;
                savedBannerType.banner_price = bannerTypeData.banner_price;
                savedBannerType.banner_slots = bannerTypeData.banner_slots;
                savedBannerType.banner_preview_url = bannerTypeData.banner_preview_url;
                const bannerHtml = `<a class="ubm-banner" data-id="${savedBannerType._id}"></a>`;
                savedBannerType.banner_sortcode = bannerHtml;
                yield savedBannerType.save();
                return callback(null, { savedBannerType });
            }
            else {
                return callback("Banner type not found.", null);
            }
        }
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.updateBannerTypeModel = updateBannerTypeModel;
//# sourceMappingURL=bannerTypes.model.js.map