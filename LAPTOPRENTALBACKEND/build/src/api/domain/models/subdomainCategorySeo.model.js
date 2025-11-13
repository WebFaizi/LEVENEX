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
exports.insertCategorySeoModel = exports.updateSubdomainCategorySeoModel = void 0;
const subdomainCategorySeo_schema_1 = __importDefault(require("../schema/subdomainCategorySeo.schema"));
const updateSubdomainCategorySeoModel = (categoryseoData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategorySeo = yield subdomainCategorySeo_schema_1.default.findOne({
            category_id: categoryseoData.category_id,
        });
        let result;
        if (existingCategorySeo) {
            result = yield subdomainCategorySeo_schema_1.default.findByIdAndUpdate(existingCategorySeo._id, categoryseoData, { new: true });
        }
        else {
            result = yield subdomainCategorySeo_schema_1.default.create(categoryseoData);
        }
        return callback(null, result);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.updateSubdomainCategorySeoModel = updateSubdomainCategorySeoModel;
const insertCategorySeoModel = (categoryseoData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategorySeo = yield subdomainCategorySeo_schema_1.default.findOne({
            category_id: categoryseoData.category_id,
        });
        let result;
        if (existingCategorySeo) {
            result = yield subdomainCategorySeo_schema_1.default.findByIdAndUpdate(existingCategorySeo._id, categoryseoData, { new: true });
        }
        else {
            result = yield subdomainCategorySeo_schema_1.default.create(categoryseoData);
        }
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.insertCategorySeoModel = insertCategorySeoModel;
//# sourceMappingURL=subdomainCategorySeo.model.js.map