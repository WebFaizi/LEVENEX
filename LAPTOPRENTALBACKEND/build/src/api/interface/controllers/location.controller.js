"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.searchCityOrArea = exports.importAreaFromExcel = exports.exportAreaToExcel = exports.deleteArea = exports.updateArea = exports.storeArea = exports.areaDetails = exports.getAdminAreaList = exports.importCityFromExcel = exports.exportCityToExcel = exports.deleteCity = exports.updateCity = exports.storeCity = exports.cityDetails = exports.getAdminCityList = exports.stateDetails = exports.importStatesFromExcel = exports.exportStateToExcel = exports.deleteState = exports.updateState = exports.storeState = exports.getAdminStateList = exports.countryDetails = exports.importCountriesFromExcel = exports.exportCountryToExcel = exports.deleteCountry = exports.updateCountry = exports.storeCountry = exports.getAdminCountryList = exports.getFormArea = exports.getFormCity = exports.getFormState = exports.cityAction = exports.getTopCity = exports.getFormCountry = exports.deleteAllArea = exports.deleteAllCity = exports.deleteAllState = exports.deleteAllCountry = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const country_schema_1 = __importDefault(require("../../domain/schema/country.schema"));
const state_schema_1 = __importDefault(require("../../domain/schema/state.schema"));
const city_schema_1 = __importDefault(require("../../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../../domain/schema/area.schema"));
const country_model_1 = require("../../domain/models/country.model");
const XLSX = __importStar(require("xlsx"));
//get country list
const deleteAllCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield country_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Country found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Country .`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Country .");
    }
});
exports.deleteAllCountry = deleteAllCountry;
const deleteAllState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield state_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Country found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Country .`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Country .");
    }
});
exports.deleteAllState = deleteAllState;
const deleteAllCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield city_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No City found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all City .`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all City .");
    }
});
exports.deleteAllCity = deleteAllCity;
const deleteAllArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield area_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Area found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Area .`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Area .");
    }
});
exports.deleteAllArea = deleteAllArea;
const getFormCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield country_schema_1.default.find({});
        return (0, apiResponse_1.successResponse)(res, "Get country list successfully", countries);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getFormCountry = getFormCountry;
const getTopCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const states = yield (0, country_model_1.getAdminTopCityListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get state list successfully", states);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getTopCity = getTopCity;
const cityAction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { city_id } = req.params;
        const city_ation = yield (0, country_model_1.adminCityAction)(city_id, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category Stored in Database successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.cityAction = cityAction;
const getFormState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { country_id } = req.query;
        let states;
        if (country_id) {
            states = yield state_schema_1.default.find({ country_id: country_id });
        }
        else {
            states = yield state_schema_1.default.find();
        }
        //const states = await stateSchema.find({ country_id: country_id });
        if (states.length === 0) {
            return (0, apiResponse_1.successResponse)(res, "No states found for the given country.", []);
        }
        return (0, apiResponse_1.successResponse)(res, "Get states list successfully", states);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getFormState = getFormState;
const getFormCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state_id } = req.query;
        let cities;
        if (state_id) {
            cities = yield city_schema_1.default.find({ state_id: state_id });
        }
        else {
            cities = yield city_schema_1.default.find();
        }
        if (cities.length === 0) {
            return (0, apiResponse_1.successResponse)(res, "No cities found.", []);
        }
        return (0, apiResponse_1.successResponse)(res, "Get cities list successfully", cities);
    }
    catch (error) {
        console.error("Error fetching cities:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching cities.");
    }
});
exports.getFormCity = getFormCity;
const getFormArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { city_id, state_id } = req.query;
        let cityIds = [];
        if (state_id) {
            //const stateObjectId = new mongoose.Types.ObjectId(state_id as string);
            const cities = yield city_schema_1.default.find({ state_id: state_id }).lean();
            cityIds = cities.map(city => city.unique_id.toString()); // <-- fix: no `const` here
        }
        else if (city_id) {
            if (!Array.isArray(city_id)) {
                city_id = [city_id];
            }
            cityIds = city_id;
        }
        else {
            return (0, apiResponse_1.ErrorResponse)(res, "Either city_id or state_id is required.");
        }
        const areas = yield area_schema_1.default.find({ city_id: { $in: cityIds } });
        if (areas.length === 0) {
            return (0, apiResponse_1.successResponse)(res, "No area found for the given input.", []);
        }
        return (0, apiResponse_1.successResponse)(res, "Area list fetched successfully.", areas);
    }
    catch (error) {
        console.error("Error fetching areas:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching areas.");
    }
});
exports.getFormArea = getFormArea;
//country module
const getAdminCountryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, country_model_1.getAdminCounrtyList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get country list successfully", categories);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getAdminCountryList = getAdminCountryList;
const storeCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield (0, country_model_1.storeCountryModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Country Stored in Database successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeCountry = storeCountry;
const updateCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { country_id } = req.params;
        const countries = yield (0, country_model_1.updateCountryModel)(country_id, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Country update in Database successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateCountry = updateCountry;
const deleteCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { country_ids } = req.body;
        if (!country_ids || !Array.isArray(country_ids) || country_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid country ID.");
        }
        const result = yield country_schema_1.default.deleteMany({ _id: { $in: country_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No country found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Countries list.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user delete countries.');
    }
});
exports.deleteCountry = deleteCountry;
const exportCountryToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield country_schema_1.default.find({}, { _id: 1, unique_id: 1, name: 1 }).sort({ sortingOrder: -1, createdAt: -1 });
        const countryData = countries.map((country, index) => ({
            // ID: index + 1,
            ID: country.unique_id,
            Name: country.name,
        }));
        const worksheet = XLSX.utils.json_to_sheet(countryData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Countries");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });
        res.setHeader("Content-Disposition", "attachment; filename=countries.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return res.send(excelBuffer);
    }
    catch (error) {
        console.error("Export Error:", error);
        return res.status(500).json({
            message: "Error exporting countries",
            error: error.message,
        });
    }
});
exports.exportCountryToExcel = exportCountryToExcel;
const importCountriesFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        // Send response to user so they can continue using the app
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // Background process
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const existingCountries = yield country_schema_1.default.find({}, { unique_id: 1 });
                const usedIds = new Set();
                existingCountries.forEach((c) => usedIds.add(c.unique_id));
                const bulkOps = new Map();
                for (const row of data) {
                    let { Name, ID } = row;
                    if (!Name || typeof Name !== "string")
                        continue;
                    const normalizedName = Name.trim();
                    const numericId = Number(ID);
                    // ❌ Skip if ID is missing, invalid, or already used
                    if (!numericId || isNaN(numericId) || usedIds.has(numericId))
                        continue;
                    usedIds.add(numericId);
                    if (!bulkOps.has(normalizedName)) {
                        bulkOps.set(normalizedName, {
                            updateOne: {
                                filter: { unique_id: numericId },
                                update: {
                                    $set: {
                                        name: normalizedName,
                                        status: 1,
                                    },
                                    $setOnInsert: {
                                        unique_id: numericId,
                                    },
                                },
                                upsert: true,
                            },
                        });
                    }
                }
                const opsArray = Array.from(bulkOps.values());
                if (opsArray.length > 0) {
                    yield country_schema_1.default.bulkWrite(opsArray);
                }
                console.log("Countries import completed.");
            }
            catch (err) {
                console.error("Background Country Import Error:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("Import Error:", error);
        return res.status(500).json({ message: "Error importing countries", error: error.message });
    }
});
exports.importCountriesFromExcel = importCountriesFromExcel;
const countryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, country_model_1.countryDetail)(id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Country details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.countryDetails = countryDetails;
//state module
const getAdminStateList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const states = yield (0, country_model_1.getAdminStateListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get state list successfully", states);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getAdminStateList = getAdminStateList;
const storeState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield (0, country_model_1.storeStateModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "State Stored in Database successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeState = storeState;
const updateState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state_id } = req.params;
        const states = yield (0, country_model_1.updateStateModel)(state_id, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "State update successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during State update.');
    }
});
exports.updateState = updateState;
const deleteState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state_ids } = req.body;
        if (!state_ids || !Array.isArray(state_ids) || state_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid country ID.");
        }
        const result = yield state_schema_1.default.deleteMany({ _id: { $in: state_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No country found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  states(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteState = deleteState;
const exportStateToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Fetch all states
        const states = yield state_schema_1.default.find().sort({ sortingOrder: -1, createdAt: -1 });
        // Step 2: Fetch all countries and create a map
        const countries = yield country_schema_1.default.find({}, { _id: 1, name: 1, unique_id: 1 });
        const countryMap = new Map();
        countries.forEach((c) => {
            countryMap.set(c.unique_id.toString(), c.name);
        });
        // Step 3: Build Excel data
        const stateData = states.map((state, index) => ({
            //ID: index + 1,
            ID: state.unique_id,
            Country: countryMap.get(state.country_id.toString()) || "N/A",
            Name: state.name,
        }));
        // Step 4: Generate workbook
        const worksheet = XLSX.utils.json_to_sheet(stateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "States");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });
        res.setHeader("Content-Disposition", "attachment; filename=states.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Export Error:", error);
        return res.status(500).json({
            message: "Error exporting states",
            error: error.message,
        });
    }
});
exports.exportStateToExcel = exportStateToExcel;
const importStatesFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        // Send response immediately to allow background processing
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // Background Import Logic
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const countries = yield country_schema_1.default.find({}, { _id: 1, name: 1, unique_id: 1 });
                const countryMap = new Map();
                countries.forEach((c) => {
                    countryMap.set(c.name.trim().toLowerCase(), c.unique_id.toString());
                });
                const stateOpsMap = new Map();
                const batchSize = 1000;
                let processed = 0;
                while (processed < totalRecords) {
                    const batch = data.slice(processed, processed + batchSize);
                    for (const row of batch) {
                        const { Name, Country, ID } = row;
                        if (!Name || !Country || !ID)
                            continue;
                        const stateName = Name.trim();
                        const countryName = Country.trim().toLowerCase();
                        const uniqueId = Number(ID);
                        if (!uniqueId || isNaN(uniqueId))
                            continue;
                        const countryId = countryMap.get(countryName);
                        if (!countryId) {
                            console.log(`Skipping state "${stateName}" - Country not found: "${countryName}"`);
                            continue;
                        }
                        const uniqueKey = `${stateName.toLowerCase()}_${countryId}`;
                        if (!stateOpsMap.has(uniqueKey)) {
                            stateOpsMap.set(uniqueKey, {
                                updateOne: {
                                    filter: { name: stateName, country_id: countryId },
                                    update: {
                                        $set: { name: stateName, country_id: countryId },
                                        $setOnInsert: { unique_id: uniqueId },
                                    },
                                    upsert: true,
                                },
                            });
                        }
                    }
                    processed += batchSize;
                    console.log(`Processed ${processed} of ${totalRecords} state records...`);
                }
                const stateOps = Array.from(stateOpsMap.values());
                if (stateOps.length > 0) {
                    yield state_schema_1.default.bulkWrite(stateOps);
                }
                console.log("✅ State import finished.");
            }
            catch (err) {
                console.error("❌ State Import Error:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("State Import Error:", error);
        return res.status(500).json({ message: "Error importing states", error: error.message });
    }
});
exports.importStatesFromExcel = importStatesFromExcel;
const stateDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, country_model_1.stateDetail)(id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "State details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching state details.");
    }
});
exports.stateDetails = stateDetails;
//city module
const getAdminCityList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const states = yield (0, country_model_1.getAdminCityListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get city list successfully", states);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getAdminCityList = getAdminCityList;
const cityDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, country_model_1.cityDetail)(id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "City details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching state details.");
    }
});
exports.cityDetails = cityDetails;
const storeCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield (0, country_model_1.cityStoreModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "City Stored in Database successfully", result);
        });
    }
    catch (error) {
        console.log("errorerror", error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeCity = storeCity;
const updateCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { city_id } = req.params;
        const states = yield (0, country_model_1.cityUpdateModel)(city_id, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "City Updated successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during Update city.');
    }
});
exports.updateCity = updateCity;
const deleteCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { city_ids } = req.body;
        if (!city_ids || !Array.isArray(city_ids) || city_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid city ID.");
        }
        console.log("city_idscity_idscity_ids", city_ids);
        const result = yield city_schema_1.default.deleteMany({ _id: { $in: city_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No city found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  city(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during deleted  city.');
    }
});
exports.deleteCity = deleteCity;
const exportCityToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Fetch all cities
        const cities = yield city_schema_1.default.find().sort({ sortingOrder: -1, createdAt: -1 });
        // Step 2: Fetch all states once and create a map
        const states = yield state_schema_1.default.find({}, { _id: 1, name: 1, unique_id: 1 });
        const stateMap = new Map();
        states.forEach(state => {
            stateMap.set(state.unique_id.toString(), state.name);
        });
        // Step 3: Build export data
        const cityData = cities.map((city, index) => ({
            //ID: index + 1,
            ID: city.unique_id,
            State: stateMap.get(city.state_id.toString()) || "N/A",
            Name: city.name,
        }));
        // Step 4: Create Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(cityData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cities");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });
        // Step 5: Send the file as response
        res.setHeader("Content-Disposition", "attachment; filename=cities.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Export Error:", error);
        return res.status(500).json({ message: "Error exporting cities", error: error.message });
    }
});
exports.exportCityToExcel = exportCityToExcel;
const importCityFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        // Step 1: Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const totalRecords = data.length;
        // Step 2: Estimate time
        const avgTimePerRecord = 0.01; // seconds per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const checkAfterSeconds = estimatedSeconds + 5;
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = Math.ceil(checkAfterSeconds / 60);
        // Step 3: Send response immediately
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // Step 4: Run import in background
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const states = yield state_schema_1.default.find({}, { _id: 1, name: 1, unique_id: 1 });
                const stateMap = new Map();
                states.forEach((s) => stateMap.set(s.name.trim().toLowerCase(), s.unique_id.toString()));
                const batchSize = 1000;
                let processed = 0;
                while (processed < totalRecords) {
                    const batch = data.slice(processed, processed + batchSize);
                    const bulkOps = [];
                    for (let row of batch) {
                        const { Name, State, ID } = row;
                        if (!Name || !State || !ID)
                            continue;
                        const stateId = stateMap.get(State.trim().toLowerCase());
                        const uniqueId = Number(ID);
                        if (!stateId || !uniqueId || isNaN(uniqueId))
                            continue;
                        bulkOps.push({
                            updateOne: {
                                filter: { name: Name.trim(), state_id: stateId },
                                update: {
                                    $set: { name: Name.trim(), state_id: stateId },
                                    $setOnInsert: { unique_id: uniqueId },
                                },
                                upsert: true,
                            },
                        });
                    }
                    if (bulkOps.length > 0) {
                        yield city_schema_1.default.bulkWrite(bulkOps);
                    }
                    processed += batchSize;
                    console.log(`Processed ${processed} of ${totalRecords} city records...`);
                }
                console.log("✅ City import finished.");
            }
            catch (err) {
                console.error("❌ City Import Error:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("Import Error:", error);
        return res.status(500).json({ message: "Error importing cities", error: error.message });
    }
});
exports.importCityFromExcel = importCityFromExcel;
//area module
const getAdminAreaList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const states = yield (0, country_model_1.getAdminAreaListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get area list successfully", states);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getAdminAreaList = getAdminAreaList;
const areaDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, country_model_1.areaDetail)(id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Area details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching state details.");
    }
});
exports.areaDetails = areaDetails;
const storeArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield (0, country_model_1.storeAreaModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Area Stored in Database successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeArea = storeArea;
const updateArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { area_id } = req.params;
        const states = yield (0, country_model_1.updateAreaModel)(area_id, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Area Updated in Database successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateArea = updateArea;
const deleteArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { area_ids } = req.body;
        if (!area_ids || !Array.isArray(area_ids) || area_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid city ID.");
        }
        const result = yield area_schema_1.default.deleteMany({ _id: { $in: area_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No city found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  city(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteArea = deleteArea;
const exportAreaToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Fetch all areas
        const areas = yield area_schema_1.default.find().sort({ sortingOrder: -1, createdAt: -1 });
        // Step 2: Get all city_ids used in areas
        const cityIds = [...new Set(areas.map(a => a.city_id.toString()))];
        // Step 3: Fetch all related cities at once
        const cities = yield city_schema_1.default.find({ unique_id: { $in: cityIds } }, { _id: 1, name: 1, unique_id: 1 });
        const cityMap = new Map();
        cities.forEach(city => cityMap.set(city.unique_id.toString(), city.name));
        // Step 4: Prepare data for Excel
        const areaData = areas.map((area, index) => ({
            //ID: index + 1,
            ID: area.unique_id,
            City: cityMap.get(area.city_id.toString()) || "N/A",
            Name: area.name,
        }));
        // Step 5: Create Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(areaData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Areas");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        // Step 6: Send response
        res.setHeader("Content-Disposition", "attachment; filename=areas.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Export Error:", error);
        return res.status(500).json({ message: "Error exporting areas", error: error.message });
    }
});
exports.exportAreaToExcel = exportAreaToExcel;
const importAreaFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const recordCount = data.length;
        const avgTimePerRecord = 0.01; // in seconds
        const estimatedSeconds = Math.ceil(recordCount * avgTimePerRecord);
        const checkAfterSeconds = estimatedSeconds + 5;
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = Math.ceil(checkAfterSeconds / 60);
        // Respond immediately to user
        res.status(200).json({
            message: `Your file with ${recordCount} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // Background import
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const uniqueCityNames = [...new Set(data.map((row) => row.City).filter(Boolean))];
                const cities = yield city_schema_1.default.find({ name: { $in: uniqueCityNames } });
                const cityMap = new Map();
                cities.forEach(city => cityMap.set(city.name.trim().toLowerCase(), city.unique_id.toString()));
                const batchSize = 1000;
                let processed = 0;
                while (processed < data.length) {
                    const batch = data.slice(processed, processed + batchSize);
                    const bulkOps = [];
                    for (let row of batch) {
                        const { Name, City, ID } = row;
                        if (!Name || !City || !ID)
                            continue;
                        const cityId = cityMap.get(City.trim().toLowerCase());
                        const uniqueId = Number(ID);
                        if (!cityId || !uniqueId || isNaN(uniqueId))
                            continue;
                        bulkOps.push({
                            updateOne: {
                                filter: { name: Name.trim(), city_id: cityId },
                                update: {
                                    $set: { name: Name.trim(), city_id: cityId },
                                    $setOnInsert: { unique_id: uniqueId },
                                },
                                upsert: true,
                            },
                        });
                    }
                    if (bulkOps.length > 0) {
                        yield area_schema_1.default.bulkWrite(bulkOps);
                    }
                    processed += batchSize;
                    console.log(`Processed ${processed} of ${data.length} area records...`);
                }
                console.log("✅ Area import finished.");
            }
            catch (err) {
                console.error("❌ Area Import Error:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error('Import Error:', error);
        return res.status(500).json({ message: 'Error importing areas', error: error.message });
    }
});
exports.importAreaFromExcel = importAreaFromExcel;
const searchCityOrArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { location } = req.query;
        //   if (!location) {
        //     return res.status(400).json({ error: "Search query is required" });
        //   }
        const cityResult = yield city_schema_1.default.aggregate([
            {
                $match: { name: { $regex: location, $options: "i" } },
            },
            {
                $lookup: {
                    from: "states",
                    localField: "state_id",
                    foreignField: "unique_id",
                    as: "state",
                },
            },
            { $unwind: "$state" },
            {
                $project: {
                    type: "city",
                    city: "$name",
                    state: "$state.name",
                },
            }, { $limit: 15 }
        ]);
        const areaResult = yield area_schema_1.default.aggregate([
            {
                $match: { name: { $regex: location, $options: "i" } },
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city",
                },
            },
            { $unwind: "$city" },
            {
                $lookup: {
                    from: "states",
                    localField: "city.state_id",
                    foreignField: "unique_id",
                    as: "state",
                },
            },
            { $unwind: "$state" },
            {
                $project: {
                    type: "area",
                    area: "$name",
                    city: "$city.name",
                    state: "$state.name",
                },
            },
            { $limit: 15 }
        ]);
        const results = [...cityResult, ...areaResult];
        if (results.length === 0) {
            return res.status(404).json({ message: "No results found" });
        }
        res.status(200).json({ results });
    }
    catch (error) {
        console.error("Search API Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.searchCityOrArea = searchCityOrArea;
//# sourceMappingURL=location.controller.js.map