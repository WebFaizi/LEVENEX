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
const BannersThemeSchema = new mongoose_1.Schema({
    banner_theme_slug: { type: String, required: true },
    banner_theme_size: { type: String, required: true },
    provide_name: { type: String, required: true },
    status: { type: Boolean, default: false },
    banner_type_code: { type: [String], default: [] }, // Explicitly defining it as an array of strings
}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
});
const BannersTheme = mongoose_1.default.model("BannersTheme", BannersThemeSchema);
// 🌱 Default banner themes to insert
const defaultThemes = [
    {
        banner_theme_slug: "category_listing",
        banner_theme_size: "728x90",
        provide_name: "test user",
        status: true,
        banner_type_code: [],
    },
    {
        banner_theme_slug: "listing_side_bar",
        banner_theme_size: "728x90",
        provide_name: "test user",
        status: true,
        banner_type_code: [],
    },
    {
        banner_theme_slug: "footer_bottom",
        banner_theme_size: "728x90",
        provide_name: "banner",
        status: true,
        banner_type_code: [],
    },
    {
        banner_theme_slug: "blog_paragraphs",
        banner_theme_size: "728x90",
        provide_name: "Google AdSense",
        status: true,
        banner_type_code: [],
    },
    {
        banner_theme_slug: "after_blog_image",
        banner_theme_size: "728x90",
        provide_name: "test user",
        status: true,
        banner_type_code: [
            '<a class="ubm-banner" data-id="67d7f973a69cbe3bd93ae66d"></a>',
        ],
    },
    {
        banner_theme_slug: "chat_boat",
        banner_theme_size: "728x90",
        provide_name: "chat",
        status: true,
        banner_type_code: [],
    },
    {
        banner_theme_slug: "header_bottom",
        banner_theme_size: "728x90",
        provide_name: "google",
        status: true,
        banner_type_code: [],
    },
    {
        banner_theme_slug: "left_side_banner",
        banner_theme_size: "728x90",
        provide_name: "side bar",
        status: true,
        banner_type_code: [
            '<a class="ubm-banner" data-id="6810728a2f36d411e432351c"></a>',
        ],
    },
];
// 🧠 Insert default themes if none exist
function insertDefaultThemes() {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield BannersTheme.countDocuments();
        if (count === 0) {
            yield BannersTheme.insertMany(defaultThemes);
            console.log("✅ Default banner themes inserted.");
        }
    });
}
// Run the seeding logic when this model is imported
insertDefaultThemes().catch((err) => console.error("❌ Error inserting default banners:", err));
exports.default = BannersTheme;
//# sourceMappingURL=bannersTheme.schema.js.map