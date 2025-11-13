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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    subdomain_slug: { type: String, required: false },
    desktop_image: { type: String, required: false },
    mobile_image: { type: String, required: false },
    description: { type: String, required: false },
    subdomain_description: { type: String, required: false },
    page_top_keyword: { type: String, required: false },
    page_top_descritpion: { type: String, required: false },
    sorting: { type: Number, required: false },
    unique_id: { type: Number, unique: true, required: true },
    status: { type: Boolean, required: true, default: false },
    ratingvalue: { type: Number, min: 1, max: 5, default: null },
    ratingcount: { type: Number, trim: true },
    related_categories: [{ type: String, required: false }],
}, {
    timestamps: true,
});
// Auto-increment logic for unique_id
function getNextAvailableCategoryId() {
    return __awaiter(this, void 0, void 0, function* () {
        const records = yield Category.find().sort({ unique_id: 1 }).select('unique_id');
        let expectedId = 1;
        for (let record of records) {
            if (record.unique_id !== expectedId) {
                return expectedId;
            }
            expectedId++;
        }
        return expectedId;
    });
}
// Set unique_id only on create
categorySchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && !this.unique_id) {
            this.unique_id = yield getNextAvailableCategoryId();
        }
        next();
    });
});
categorySchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            this.unique_id = yield getNextAvailableCategoryId();
        }
        next();
    });
});
const Category = mongoose_1.default.model("Category", categorySchema);
exports.default = Category;
//# sourceMappingURL=category.schema.js.map