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
exports.getPopulerArealist = void 0;
const city_schema_1 = __importDefault(require("../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../domain/schema/area.schema"));
const category_schema_1 = __importDefault(require("../domain/schema/category.schema"));
const slugify_1 = __importDefault(require("slugify"));
const getPopulerArealist = (categoryId, categoryType, locationDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!categoryId)
            return { error: "Category ID is required" };
        const city_name = (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.city_name) || "";
        if (!city_name)
            return { error: "City name is required" };
        // Fetch category details
        const category = yield category_schema_1.default.findById(categoryId);
        if (!category)
            return { error: "Category not found" };
        const categoryName = category.name;
        const categorySlug = (0, slugify_1.default)(categoryName, { lower: true });
        // Fetch city by name
        const city = yield city_schema_1.default.findOne({ name: new RegExp(`^${city_name}$`, "i") });
        if (!city)
            return { error: "City not found" };
        // Get 10 random areas from this city
        const areas = yield area_schema_1.default.aggregate([
            { $match: { city_id: city.unique_id } },
            { $sample: { size: 15 } }
        ]);
        // Format each area
        const formattedAreas = areas.map((area) => {
            const areaName = area.name;
            const combinedName = `${categoryName} in ${areaName}`;
            const areaSlug = (0, slugify_1.default)(areaName, { lower: true });
            const categorySlug = (0, slugify_1.default)(category.slug, { lower: true });
            const finalSlug = `${categorySlug}-${areaSlug}/${category.unique_id}`;
            return {
                name: combinedName,
                url: `${process.env.BASE_URL}/${finalSlug}`,
            };
        });
        return { area: formattedAreas };
    }
    catch (error) {
        console.error("Error fetching area list:", error);
        return { error: "Failed to fetch area list" };
    }
});
exports.getPopulerArealist = getPopulerArealist;
exports.default = exports.getPopulerArealist;
//# sourceMappingURL=populerAreaList.service.js.map