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
exports.areaDetail = exports.deleteArea = exports.cityDetail = exports.storeCityModel = exports.cityUpdateModel = exports.deleteCity = exports.cityStoreModel = exports.getAdminCityListModel = exports.getAdminTopCityListModel = exports.stateDetail = exports.updateStateModel = exports.storeStateModel = exports.getAdminStateListModel = exports.countryDetail = exports.updateCountryModel = exports.storeCountryModel = exports.getAdminCounrtyList = exports.updateAreaModel = exports.getAdminAreaListModel = exports.storeAreaModel = exports.adminCityAction = void 0;
const country_schema_1 = __importDefault(require("../schema/country.schema"));
const state_schema_1 = __importDefault(require("../schema/state.schema"));
const city_schema_1 = __importDefault(require("../schema/city.schema"));
const area_schema_1 = __importDefault(require("../schema/area.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const adminCityAction = (city_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = yield city_schema_1.default.findById(city_id);
        if (!city) {
            return callback({ message: 'City not found' }, null);
        }
        city.is_top_city = !city.is_top_city; // Toggle the value
        yield city.save();
        return callback(null, `is_top_city set to ${city.is_top_city}`);
    }
    catch (error) {
        console.error('Error toggling is_top_city:', error);
        return callback(error, null);
    }
});
exports.adminCityAction = adminCityAction;
const storeAreaModel = (areaData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingState = yield state_schema_1.default.findOne({ name: areaData.name, city_id: areaData.city_id });
        if (existingState) {
            const error = new Error("City already exists.");
            return callback(error, null);
        }
        const lastCountry = yield area_schema_1.default.findOne().sort({ sorting: -1 });
        const newState = new area_schema_1.default(Object.assign({}, areaData));
        yield newState.save();
        return callback(null, newState);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.storeAreaModel = storeAreaModel;
const getAdminAreaListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        // const users = await areaSchema.find(searchQuery)
        //     .sort({ createdAt: -1 })
        //     .skip(skip)
        //     .limit(limit) 
        //     .populate('city_id', 'name')
        //     .exec();
        const users = yield area_schema_1.default.aggregate([
            { $match: searchQuery },
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: 1 } },
            {
                $lookup: {
                    from: 'cities',
                    let: {
                        cityIdObjectId: '$city_id',
                        cityIdNumber: '$city_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$cityIdObjectId'] }, // for ObjectId
                                        { $eq: ['$unique_id', '$$cityIdNumber'] } // for string "1" to match numeric unique_id
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                unique_id: 1
                            }
                        }
                    ],
                    as: 'city_id'
                }
            },
            {
                $unwind: {
                    path: '$city_id',
                    preserveNullAndEmptyArrays: true
                }
            },
        ]);
        const totalCountry = yield area_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.getAdminAreaListModel = getAdminAreaListModel;
const updateAreaModel = (area_id, areaData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingState = yield area_schema_1.default.findOne({ _id: area_id });
        if (!existingState) {
            return callback(new Error("State not found."), null);
        }
        const slugExist = yield area_schema_1.default.findOne({ name: areaData.name, city_id: areaData.city_id, _id: { $ne: area_id } });
        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        existingState.name = areaData.name || existingState.name;
        yield existingState.save();
        return callback(null, existingState);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.updateAreaModel = updateAreaModel;
//country mdoles
const getAdminCounrtyList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield country_schema_1.default.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalCountry = yield country_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.getAdminCounrtyList = getAdminCounrtyList;
const storeCountryModel = (countryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCountry = yield country_schema_1.default.findOne({ name: countryData.name });
        if (existingCountry) {
            const error = new Error("Country already exists.");
            return callback(error, null);
        }
        const lastCountry = yield country_schema_1.default.findOne().sort({ sorting: -1 });
        const newCountry = new country_schema_1.default(Object.assign({}, countryData));
        yield newCountry.save();
        return callback(null, newCountry);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.storeCountryModel = storeCountryModel;
const updateCountryModel = (country_id, countryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCountry = yield country_schema_1.default.findOne({ _id: country_id });
        if (!existingCountry) {
            return callback(new Error("Country not found."), null);
        }
        const slugExist = yield country_schema_1.default.findOne({ name: countryData.name });
        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        existingCountry.name = countryData.name || existingCountry.name;
        yield existingCountry.save();
        return callback(null, existingCountry);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.updateCountryModel = updateCountryModel;
const countryDetail = (country_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Country = yield country_schema_1.default.findOne({ _id: country_id });
        return callback(null, { Country });
    }
    catch (error) {
        console.error("Error Finding country:", error);
        return callback(error, null);
    }
});
exports.countryDetail = countryDetail;
const getAdminStateListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield state_schema_1.default.aggregate([
            { $match: searchQuery },
            {
                $lookup: {
                    from: 'countries',
                    let: {
                        countryIdObjectId: '$country_id',
                        countryIdNumber: '$country_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$countryIdObjectId'] }, // for ObjectId
                                        { $eq: ['$unique_id', '$$countryIdNumber'] } // for string "1" to match numeric unique_id
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                unique_id: 1
                            }
                        }
                    ],
                    as: 'country_id'
                }
            },
            {
                $unwind: {
                    path: '$country_id',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        const countResult = yield state_schema_1.default.aggregate([
            { $match: searchQuery },
            { $count: 'total' }
        ]);
        //const totalCountry: number = countResult[0]?.total ?? 0;
        const totalCountry = yield state_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.getAdminStateListModel = getAdminStateListModel;
//state mdoles
const storeStateModel = (stateData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingState = yield state_schema_1.default.findOne({ name: stateData.name, country_id: stateData.country_id });
        if (existingState) {
            const error = new Error("State already exists.");
            return callback(error, null);
        }
        const lastCountry = yield state_schema_1.default.findOne().sort({ sorting: -1 });
        const newState = new state_schema_1.default(Object.assign({}, stateData));
        yield newState.save();
        return callback(null, newState);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.storeStateModel = storeStateModel;
const updateStateModel = (state_id, stateData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingState = yield state_schema_1.default.findOne({ _id: state_id });
        if (!existingState) {
            return callback(new Error("State not found."), null);
        }
        const slugExist = yield state_schema_1.default.findOne({ name: stateData.name, country_id: stateData.country_id, _id: { $ne: state_id } });
        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        existingState.name = stateData.name || existingState.name;
        // existingState.country_id = stateData.country_id || existingState.country_id;
        yield existingState.save();
        return callback(null, existingState);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.updateStateModel = updateStateModel;
const stateDetail = (state_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const state = yield state_schema_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(state_id)
                }
            },
            {
                $lookup: {
                    from: 'countries',
                    let: {
                        cidObj: '$country_id',
                        cidInt: '$country_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$cidObj'] },
                                        { $eq: ['$unique_id', '$$cidInt'] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                unique_id: 1
                            }
                        }
                    ],
                    as: 'country_id'
                }
            },
            { $unwind: { path: '$country_id', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _country_id_int: 0
                }
            }
        ]);
        const State = state[0] || null;
        return callback(null, { State });
    }
    catch (error) {
        console.error("Error Finding State:", error);
        return callback(error, null);
    }
});
exports.stateDetail = stateDetail;
//city mdoles
const getAdminTopCityListModel = (search_1, page_1, limit_1, ...args_1) => __awaiter(void 0, [search_1, page_1, limit_1, ...args_1], void 0, function* (search, page, limit, isTopCityOnly = true // Optional filter
) {
    try {
        const searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        if (isTopCityOnly) {
            searchQuery.is_top_city = true;
        }
        const skip = (page - 1) * limit;
        // const users = await citySchema.find(searchQuery)
        //     .skip(skip)
        //     .limit(limit)
        //     .populate('state_id', 'name')
        //     .exec();
        const users = yield city_schema_1.default.aggregate([
            { $match: searchQuery },
            {
                $lookup: {
                    from: 'states',
                    let: {
                        stateIdObjectId: '$state_id',
                        stateIdNumber: '$state_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$stateIdObjectId'] }, // for ObjectId
                                        { $eq: ['$unique_id', '$$stateIdNumber'] } // for string "1" to match numeric unique_id
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                unique_id: 1
                            }
                        }
                    ],
                    as: 'state_id'
                }
            },
            {
                $unwind: {
                    path: '$state_id',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        const totalCountry = yield city_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.getAdminTopCityListModel = getAdminTopCityListModel;
const getAdminCityListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        // const users = await citySchema.find(searchQuery)
        //  .sort({ createdAt: -1 })
        //     .skip(skip)
        //     .limit(limit) 
        //     .populate('state_id', 'name')
        //     .exec();
        const users = yield city_schema_1.default.aggregate([
            { $match: searchQuery },
            {
                $lookup: {
                    from: 'states',
                    let: {
                        stateIdObjectId: '$state_id',
                        stateIdNumber: '$state_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$stateIdObjectId'] }, // for ObjectId
                                        { $eq: ['$unique_id', '$$stateIdNumber'] } // for string "1" to match numeric unique_id
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                unique_id: 1
                            }
                        }
                    ],
                    as: 'state_id'
                }
            },
            {
                $unwind: {
                    path: '$state_id',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        const totalCountry = yield city_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.getAdminCityListModel = getAdminCityListModel;
const cityStoreModel = (cityData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCity = yield city_schema_1.default.findOne({ name: cityData.name, state_id: cityData.state_id });
        if (existingCity) {
            const error = new Error("City already exists.");
            return callback(error, null);
        }
        const lastCountry = yield city_schema_1.default.findOne().sort({ sorting: -1 });
        const newCity = new city_schema_1.default(Object.assign({}, cityData));
        yield newCity.save();
        return callback(null, newCity);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.cityStoreModel = cityStoreModel;
const deleteCity = (city_ids, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield city_schema_1.default.deleteMany({ _id: { $in: city_ids } });
        return callback(null, "City deleted successfully.");
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.deleteCity = deleteCity;
const cityUpdateModel = (city_id, cityData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCity = yield city_schema_1.default.findOne({ _id: city_id });
        if (!existingCity) {
            return callback(new Error("City not found. sdsd"), null);
        }
        const slugExist = yield city_schema_1.default.findOne({ state_id: cityData.state_id, _id: { $ne: city_id }, name: cityData.name });
        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        const stateId = typeof cityData.state_id === 'string'
            ? parseInt(cityData.state_id, 10)
            : cityData.state_id;
        existingCity.state_id = stateId || existingCity.state_id;
        existingCity.name = cityData.name || existingCity.name;
        yield existingCity.save();
        return callback(null, existingCity);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.cityUpdateModel = cityUpdateModel;
const storeCityModel = (areaData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingArea = yield city_schema_1.default.findOne({ name: areaData.name, state_id: areaData.state_id });
        if (existingArea) {
            const error = new Error("Area already exists.");
            return callback(error, null);
        }
        const lastCountry = yield city_schema_1.default.findOne().sort({ sorting: -1 });
        const newArea = new city_schema_1.default(Object.assign({}, areaData));
        yield newArea.save();
        return callback(null, newArea);
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.storeCityModel = storeCityModel;
const cityDetail = (city_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const City = await citySchema.findOne({ _id: city_id }).populate('state_id', 'name');
        const city = yield city_schema_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(city_id)
                }
            },
            {
                $lookup: {
                    from: 'states',
                    let: {
                        cidObj: '$state_id',
                        cidInt: '$state_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$cidObj'] },
                                        { $eq: ['$unique_id', '$$cidInt'] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                unique_id: 1
                            }
                        }
                    ],
                    as: 'state_id'
                }
            },
            { $unwind: { path: '$state_id', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _country_id_int: 0
                }
            }
        ]);
        const City = city[0] || null;
        return callback(null, { City });
    }
    catch (error) {
        console.error("Error Finding City:", error);
        return callback(error, null);
    }
});
exports.cityDetail = cityDetail;
const deleteArea = (area_ids, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield city_schema_1.default.deleteMany({ _id: { $in: area_ids } });
        return callback(null, "Area deleted successfully.");
    }
    catch (error) {
        throw new Error('Error fetching users');
    }
});
exports.deleteArea = deleteArea;
const areaDetail = (area_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const Area = await areaSchema.findOne({ _id: area_id }).populate('city_id', 'name');
        const area = yield area_schema_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(area_id)
                }
            },
            {
                $lookup: {
                    from: 'cities',
                    let: {
                        cidObj: '$city_id',
                        cidInt: '$city_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$cidObj'] },
                                        { $eq: ['$unique_id', '$$cidInt'] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                unique_id: 1
                            }
                        }
                    ],
                    as: 'city_id'
                }
            },
            { $unwind: { path: '$city_id', preserveNullAndEmptyArrays: true } },
        ]);
        const Area = area[0] || null;
        return callback(null, { Area });
    }
    catch (error) {
        console.error("Error Finding Area:", error);
        return callback(error, null);
    }
});
exports.areaDetail = areaDetail;
//# sourceMappingURL=country.model.js.map