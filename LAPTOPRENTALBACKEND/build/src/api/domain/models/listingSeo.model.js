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
exports.insertListingSeoModel = exports.updateListingSeoModel = void 0;
const listingseo_schema_1 = __importDefault(require("../schema/listingseo.schema"));
const updateListingSeoModel = (listingseoData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingListingSeo = yield listingseo_schema_1.default.findOne({
            listing_id: listingseoData.listing_id,
        });
        let result;
        if (existingListingSeo) {
            result = yield listingseo_schema_1.default.findByIdAndUpdate(existingListingSeo._id, listingseoData, { new: true });
        }
        else {
            result = yield listingseo_schema_1.default.create(listingseoData);
        }
        return callback(null, result);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.updateListingSeoModel = updateListingSeoModel;
const insertListingSeoModel = (listingseoData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingListingSeo = yield listingseo_schema_1.default.findOne({
            listing_id: listingseoData.listing_id,
        });
        let result;
        if (existingListingSeo) {
            result = yield listingseo_schema_1.default.findByIdAndUpdate(existingListingSeo._id, listingseoData, { new: true });
        }
        else {
            result = yield listingseo_schema_1.default.create(listingseoData);
        }
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.insertListingSeoModel = insertListingSeoModel;
//# sourceMappingURL=listingSeo.model.js.map