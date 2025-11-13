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
const SettingSchema = new mongoose_1.Schema({
    super_admin: { type: String, required: true, trim: true },
    email_for_otp: { type: String, required: true, trim: true },
    contact_email: { type: String, required: true, trim: true },
    quotation_emails: { type: String, required: true, trim: true },
    website_logo: { type: String, required: false },
    mobile_logo: { type: String, required: false },
    fav_icon: { type: String, required: false },
    pre_loader: { type: String, required: false },
    home_page_layout_style: { type: String, default: "0" },
    mobile_listing_banner: { type: String, required: false },
    desktop_listing_banner: { type: String, required: false },
    phone_number: { type: String, required: true, trim: true },
    login_page_content: { type: String, required: true },
    category_box_links: { type: String, enum: ["regular", "subdomain"], default: "regular" },
    sidebar_button_sequence: { type: String, required: true },
    facebook: { type: String, required: false },
    desktop_description: { type: String, required: false },
    footer_description: { type: String, required: false },
    twitter: { type: String, required: false },
    linkedin: { type: String, required: false },
    quotation_number: { type: String, required: false },
    whatsapp_key: { type: String, required: false },
    send_whatsapp_message: { type: String, enum: ["yes", "no"], default: "no" },
    send_quotation_mail: { type: String, enum: ["yes", "no"], default: "no" },
    premium_testing_emails: { type: String, required: false },
    send_mail_to_premium_listing: { type: String, enum: ["yes", "no"], default: "no" },
    theme_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Theme',
        required: true
    },
}, {
    timestamps: true,
});
const Setting = mongoose_1.default.model("Setting", SettingSchema);
exports.default = Setting;
//# sourceMappingURL=setting.schema.js.map