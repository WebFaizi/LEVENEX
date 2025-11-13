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
// Schema definition
const ListingReviewSchema = new mongoose_1.Schema({
    listing_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Listings', required: true },
    user_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5
    comment: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: false }, // Pending admin approval
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});
// Create model
const ListingReview = mongoose_1.default.model('ListingReview', ListingReviewSchema);
exports.default = ListingReview;
//# sourceMappingURL=listingReview.schema.js.map