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
exports.getLocationDetailsByName = void 0;
const city_schema_1 = __importDefault(require("../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../domain/schema/area.schema"));
const getLocationDetailsByName = (locationName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Search for the Area first
        const area = yield area_schema_1.default.findOne({
            name: { $regex: new RegExp(`^${locationName}$`, "i") },
        }); // Case-insensitive match
        if (area) {
            const city_name = yield city_schema_1.default.findOne({ unique_id: area.city_id });
            return {
                location_type: "area",
                area_name: area.name,
                city_name: area.city_id ? city_name === null || city_name === void 0 ? void 0 : city_name.name : null,
                current_location_id: area.id,
                current_location_name: area.name,
                current_area_id: area.id,
                current_city_id: area.city_id ? area.city_id.toString() : "",
                current_location_unique_id: area.unique_id,
                current_city_unique_id: city_name === null || city_name === void 0 ? void 0 : city_name.unique_id,
            };
        }
        // If no Area found, search for City
        const city = yield city_schema_1.default.findOne({
            name: { $regex: new RegExp(`^${locationName}$`, "i") },
        });
        if (city) {
            return {
                location_type: "city",
                city_name: city.name,
                current_location_id: city.id,
                current_location_name: city.name,
                current_location_unique_id: city.unique_id,
                current_area_id: "",
                current_city_id: city.id,
                current_city_unique_id: city === null || city === void 0 ? void 0 : city.unique_id,
            };
        }
        return {
            location_type: "unknown",
            current_location_name: "unknown",
            message: "Location not found",
            current_location_id: "",
        };
    }
    catch (error) {
        console.error("Error fetching location details by name:", error);
        throw new Error("Failed to fetch location details");
    }
});
exports.getLocationDetailsByName = getLocationDetailsByName;
exports.default = exports.getLocationDetailsByName;
//# sourceMappingURL=getLocationDetailsByName.service.js.map