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
exports.getDefaultLoactionDetails = exports.getLocationDetails = void 0;
const city_schema_1 = __importDefault(require("../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../domain/schema/area.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const getLocationDetails = (locationId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(locationId)) {
            return {
                location_type: "unknown",
                message: "Invalid location ID",
                current_location_id: "",
            };
        }
        // Try area first
        const area = yield area_schema_1.default.findById(locationId).lean();
        if (area) {
            const city = area.city_id
                ? yield city_schema_1.default.findOne({ unique_id: area.city_id }).lean()
                : null;
            return {
                location_type: "area",
                area_name: area.name,
                city_name: (city === null || city === void 0 ? void 0 : city.name) || null,
                current_location_id: area._id.toString(),
                current_area_id: area._id.toString(),
                current_city_id: ((_a = city === null || city === void 0 ? void 0 : city._id) === null || _a === void 0 ? void 0 : _a.toString()) || "",
                current_location_unique_id: area.unique_id,
                current_city_unique_id: city === null || city === void 0 ? void 0 : city.unique_id,
            };
        }
        // Fallback to city
        const city = yield city_schema_1.default.findById(locationId).lean();
        if (city) {
            return {
                location_type: "city",
                city_name: city.name,
                current_location_id: city._id.toString(),
                current_location_unique_id: city.unique_id,
                current_area_id: "",
                current_city_id: city._id.toString(),
                current_city_unique_id: city === null || city === void 0 ? void 0 : city.unique_id,
            };
        }
        return {
            location_type: "unknown",
            message: "Location not found",
            current_location_id: "",
        };
    }
    catch (error) {
        throw new Error("Failed to fetch location details");
    }
});
exports.getLocationDetails = getLocationDetails;
const getDefaultLoactionDetails = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = yield city_schema_1.default.findOne({ name: process.env.DEFAULT_CITY }).lean();
        if (city) {
            return {
                location_type: "city",
                city_name: city.name,
                current_location_id: city._id.toString(),
                current_area_id: "",
                current_city_id: city._id.toString(),
                current_location_unique_id: city.unique_id,
                current_city_unique_id: city.unique_id,
            };
        }
        return {
            location_type: "unknown",
            message: "Location not found",
            current_location_id: "",
            current_area_id: "",
            current_city_id: "",
            current_location_unique_id: "",
            current_city_unique_id: "",
        };
    }
    catch (error) {
        throw new Error("Failed to fetch location details");
    }
});
exports.getDefaultLoactionDetails = getDefaultLoactionDetails;
exports.default = exports.getLocationDetails;
//# sourceMappingURL=currentLocation.service.js.map