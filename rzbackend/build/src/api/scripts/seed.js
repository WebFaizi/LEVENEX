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
const mongoose_1 = __importDefault(require("mongoose"));
const bannersTheme_schema_1 = __importDefault(require("../../api/domain/schema/bannersTheme.schema")); // Adjust the import path
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = yield bannersTheme_schema_1.default.countDocuments();
        if (existing === 0) {
            yield bannersTheme_schema_1.default.insertMany([
                {
                    banner_theme_slug: "category_listing",
                    banner_theme_size: "728x90",
                    provide_name: "test user",
                    status: true,
                    banner_type_code: [
                        '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
                    ],
                },
                {
                    banner_theme_slug: "listing_side_bar",
                    banner_theme_size: "728x90",
                    provide_name: "test user",
                    status: true,
                    banner_type_code: [
                        '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
                    ],
                },
                {
                    banner_theme_slug: "footer_bottom",
                    banner_theme_size: "728x90",
                    provide_name: "banner",
                    status: true,
                    banner_type_code: [
                        '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
                    ],
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
                    banner_type_code: [
                        '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
                    ],
                },
                {
                    banner_theme_slug: "header_bottom",
                    banner_theme_size: "728x90",
                    provide_name: "google",
                    status: true,
                    banner_type_code: [
                        '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
                    ],
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
            ]);
        }
        else {
            console.log("BannersTheme already has data. Skipping seed.");
        }
    }
    catch (error) {
        console.error("Seeding failed:", error);
    }
    finally {
        yield mongoose_1.default.disconnect();
    }
});
seed();
//# sourceMappingURL=seed.js.map