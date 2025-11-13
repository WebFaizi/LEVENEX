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
// 🔢 Random 6-digit generator
function generateRandomNumber(length = 6) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}
// 📦 Define schema
const ListingsSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Users', required: true },
    listing_unique_id: { type: String, unique: true }, // filled by hook
    category_ids: [{ type: Number, required: true }],
    listing_image: { type: String, default: "null" },
    name: { type: String, required: true },
    address: { type: String },
    locality: { type: String },
    pincode: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    country_id: { type: Number, ref: 'Country', required: true },
    state_id: { type: Number, ref: 'State', required: true },
    city_id: [{ type: Number, ref: 'City' }],
    area_id: { type: Number, ref: 'Area' },
    is_city_all_selected: { type: Boolean, default: false },
    is_area_all_selected: { type: Boolean, default: false },
    phone_number: { type: String },
    email: { type: String, required: true },
    contact_person: { type: String },
    second_phone_no: { type: String },
    second_email: { type: String },
    website: { type: String },
    listing_type: { type: String, default: "Free" },
    price: { type: String },
    time_duration: { type: String, default: "Per Day" },
    cover_image: { type: String, default: "null" },
    mobile_cover_image: { type: String, default: "null" },
    video_url: { type: String },
    description: { type: String },
    status: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    listing_views: { type: Number, default: 0 },
    listing_reviews_count: { type: Number, default: 0 },
    listing_avg_rating: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// 🪝 Hook for .save()
ListingsSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.listing_unique_id) {
            let isUnique = false;
            while (!isUnique) {
                const id = generateRandomNumber();
                const exists = yield mongoose_1.default.model('Listings').exists({ listing_unique_id: id });
                if (!exists) {
                    this.listing_unique_id = id;
                    isUnique = true;
                }
            }
        }
        next();
    });
});
// 🪝 Hook for .insertMany()
ListingsSchema.pre('insertMany', function (next, docs) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (const doc of docs) {
                if (!doc.listing_unique_id) {
                    let isUnique = false;
                    while (!isUnique) {
                        const id = generateRandomNumber();
                        const exists = yield mongoose_1.default.model('Listings').exists({ listing_unique_id: id });
                        if (!exists) {
                            doc.listing_unique_id = id;
                            isUnique = true;
                        }
                    }
                }
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
});
// 📤 Export model
const Listings = mongoose_1.default.model("Listings", ListingsSchema);
exports.default = Listings;
//# sourceMappingURL=listing.schema.js.map