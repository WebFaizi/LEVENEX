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
exports.getGeoLocationFromIp = getGeoLocationFromIp;
exports.getBasicGeoLocationFromIp = getBasicGeoLocationFromIp;
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const country_list_1 = require("country-list");
const node_geocoder_1 = __importDefault(require("node-geocoder"));
const options = {
    provider: "openstreetmap",
    formatter: null
};
const geocoder = (0, node_geocoder_1.default)(options);
/**
 * Get geographical information from IP address
 * @param ip - IP address to lookup
 * @returns GeoLocationData object with location information
 */
function getGeoLocationFromIp(ip) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            // Default values
            const defaultData = {
                country: "Unknown",
                countryCode: "Unknown",
                region: "Unknown",
                city: "Unknown",
                zipcode: "Unknown",
                latitude: 0,
                longitude: 0,
                timezone: "Unknown"
            };
            // Skip localhost and invalid IPs
            if (!ip || ip === 'UNKNOWN' || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
                console.log(`Skipping geolocation for local/private IP: ${ip}`);
                return defaultData;
            }
            // Get basic geo info from geoip-lite
            const geo = geoip_lite_1.default.lookup(ip);
            if (!geo) {
                console.log(`No geo data found for IP: ${ip}`);
                return defaultData;
            }
            console.log(`GeoIP lookup for ${ip}:`, {
                country: geo.country,
                region: geo.region,
                city: geo.city,
                ll: geo.ll,
                timezone: geo.timezone
            });
            const countryCode = geo.country || "Unknown";
            const countryName = (0, country_list_1.getName)(countryCode) || countryCode;
            const latitude = (_b = (_a = geo.ll) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : 0;
            const longitude = (_d = (_c = geo.ll) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : 0;
            // Start with geoip-lite data
            let zipcode = "Unknown";
            let detailedCity = geo.city || "Unknown";
            let region = geo.region || "Unknown";
            // Try reverse geocoding for more detailed info if we have valid coordinates
            if (latitude && longitude && latitude !== 0 && longitude !== 0) {
                try {
                    const res = yield geocoder.reverse({ lat: latitude, lon: longitude });
                    console.log(`Reverse geocoding result for ${ip}:`, res === null || res === void 0 ? void 0 : res[0]);
                    if (res && res.length > 0) {
                        const geocodedData = res[0];
                        // Get zipcode from reverse geocoding
                        zipcode = (geocodedData === null || geocodedData === void 0 ? void 0 : geocodedData.zipcode) || "Unknown";
                        // If geoip-lite didn't provide a city, use the reverse geocoded one
                        if (!geo.city || geo.city === "Unknown") {
                            detailedCity = (geocodedData === null || geocodedData === void 0 ? void 0 : geocodedData.city) || (geocodedData === null || geocodedData === void 0 ? void 0 : geocodedData.county) || (geocodedData === null || geocodedData === void 0 ? void 0 : geocodedData.state) || "Unknown";
                        }
                        console.log(`Geocoded data - City: ${geocodedData === null || geocodedData === void 0 ? void 0 : geocodedData.city}, County: ${geocodedData === null || geocodedData === void 0 ? void 0 : geocodedData.county}, State: ${geocodedData === null || geocodedData === void 0 ? void 0 : geocodedData.state}, Zipcode: ${zipcode}`);
                    }
                }
                catch (geocodeError) {
                    console.warn(`Geocoding failed for ${ip}:`, geocodeError instanceof Error ? geocodeError.message : 'Unknown error');
                    // Continue with basic geo data
                }
            }
            console.log(`Final geo data for ${ip}: City=${detailedCity}, Region=${region}, Zipcode=${zipcode}, Country=${countryName}`);
            return {
                country: countryName,
                countryCode: countryCode,
                region: region,
                city: detailedCity,
                zipcode: zipcode,
                latitude: latitude,
                longitude: longitude,
                timezone: geo.timezone || "Unknown"
            };
        }
        catch (error) {
            console.error('Error in getGeoLocationFromIp:', error);
            return {
                country: "Unknown",
                countryCode: "Unknown",
                region: "Unknown",
                city: "Unknown",
                zipcode: "Unknown",
                latitude: 0,
                longitude: 0,
                timezone: "Unknown"
            };
        }
    });
}
/**
 * Get geographical information synchronously from IP (without zipcode lookup)
 * Use this when you need faster response and don't need precise zipcode
 * @param ip - IP address to lookup
 * @returns Basic GeoLocationData object
 */
function getBasicGeoLocationFromIp(ip) {
    var _a, _b, _c, _d;
    try {
        // Default values
        const defaultData = {
            country: "Unknown",
            countryCode: "Unknown",
            region: "Unknown",
            city: "Unknown",
            zipcode: "Unknown",
            latitude: 0,
            longitude: 0,
            timezone: "Unknown"
        };
        // Skip localhost and invalid IPs
        if (!ip || ip === 'UNKNOWN' || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return defaultData;
        }
        // Get basic geo info from geoip-lite
        const geo = geoip_lite_1.default.lookup(ip);
        if (!geo) {
            return defaultData;
        }
        const countryCode = geo.country || "Unknown";
        const countryName = (0, country_list_1.getName)(countryCode) || countryCode;
        return {
            country: countryName,
            countryCode: countryCode,
            region: geo.region || "Unknown",
            city: geo.city || "Unknown",
            zipcode: "Unknown", // Not available without geocoding
            latitude: (_b = (_a = geo.ll) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : 0,
            longitude: (_d = (_c = geo.ll) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : 0,
            timezone: geo.timezone || "Unknown"
        };
    }
    catch (error) {
        console.error('Error in getBasicGeoLocationFromIp:', error);
        return {
            country: "Unknown",
            countryCode: "Unknown",
            region: "Unknown",
            city: "Unknown",
            zipcode: "Unknown",
            latitude: 0,
            longitude: 0,
            timezone: "Unknown"
        };
    }
}
//# sourceMappingURL=geolocation.js.map