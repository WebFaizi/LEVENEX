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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const jobCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: false },
    sorting: { type: Number, required: false, default: 0 },
    unique_id: {
        type: Number,
        unique: true,
        required: true
    },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true,
});
function getNextAvailableId() {
    return __awaiter(this, void 0, void 0, function* () {
        const records = yield JobCategory.find().sort({ unique_id: 1 }).select('unique_id');
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
jobCategorySchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && !this.unique_id) {
            this.unique_id = yield getNextAvailableId();
        }
        next();
    });
});
jobCategorySchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            this.unique_id = yield getNextAvailableId();
        }
        next();
    });
});
const JobCategory = mongoose_1.default.model("JobCategory", jobCategorySchema);
exports.default = JobCategory;
//# sourceMappingURL=jobCategory.schema.js.map