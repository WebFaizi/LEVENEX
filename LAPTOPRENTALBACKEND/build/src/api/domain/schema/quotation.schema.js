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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const quotationSchema = new mongoose_1.Schema({
    category_ids: [{
            type: String,
            required: true,
        }],
    quotation_type: { type: String, required: true, enum: ['Company', 'Individual'] },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    email: { type: String, required: true, match: /.+\@.+\..+/ },
    phone_number: { type: String, required: true, match: /^\+?[1-9]\d{1,14}$/ },
    location: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'approved'], default: 'pending' },
    view_by_admin: { type: String, required: true, enum: ['yes', 'no'], default: 'no' },
    ip_address: { type: String, required: false },
}, {
    timestamps: true,
});
const Quotation = mongoose_1.default.model("Quotation", quotationSchema);
exports.default = Quotation;
//# sourceMappingURL=quotation.schema.js.map