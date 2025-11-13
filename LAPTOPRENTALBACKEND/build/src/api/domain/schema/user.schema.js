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
const baseUrl = "https://macbookrent.in/";
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    user_name: { type: String, required: false },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    sub_role: { type: String, required: false, default: "0" },
    phone_number: { type: String, required: false },
    profile_pic: { type: String, required: false },
    profile_banner: { type: String, required: false },
    website: { type: String, required: false },
    country_id: {
        type: Number,
        ref: 'Country',
        required: false,
    },
    state_id: {
        type: Number,
        ref: 'State',
        required: false,
    },
    city_id: {
        type: Number,
        ref: 'City',
        required: false,
    },
    area_id: {
        type: Number,
        ref: 'Area',
        required: false,
    },
    show_website: { type: String, required: false, default: "false" },
    is_approved: { type: String, required: false, default: "No" },
    is_verified: { type: String, required: false, default: "No" },
    is_blocked: { type: String, required: false, default: "No" },
    resetPasswordToken: { type: String },
    login_status: { type: Boolean, default: true },
    resetPasswordExpires: { type: Date, default: null },
}, {
    timestamps: true,
});
// Remove duplicate index - email field already has unique: true which creates the index
// userSchema.index({ email: 1 }, { unique: true }); // This line is causing the duplicate warning
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    if (user.profile_pic) {
        user.profile_pic = `${baseUrl}/${user.profile_pic.replace(/\\/g, '/')}`;
    }
    if (user.profile_banner) {
        user.profile_banner = `${baseUrl}/${user.profile_banner.replace(/\\/g, '/')}`;
    }
    return user;
};
const User = mongoose_1.default.model("User", userSchema);
function insertDefaultUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield User.countDocuments();
        if (count === 0) {
            yield User.create({
                _id: new mongoose_1.default.Types.ObjectId("679cc80efee9b7091ad808e1"),
                name: "Super Admin",
                email: "faizimohdindia@gmail.com",
                password: "$2b$10$KvJHo/rvLlioYhkw5WYp2OUar2RDmU965mRwKzaTbDHy.8Mt2gdb.",
                phone_number: "sjdhb",
                profile_pic: "sd",
                show_website: "Yes",
                is_approved: "Yes",
                is_verified: "Yes",
                is_blocked: "No",
                createdAt: new Date("2025-01-31T12:47:08Z"),
                updatedAt: new Date("2025-04-30T11:01:50.489Z"),
                website: "s df",
                role: "0",
                sub_role: "0",
                resetPasswordToken: "",
                resetPasswordExpires: new Date("2025-04-25T09:04:41.764Z"),
                login_status: true,
            });
            console.log("✅ Default admin user inserted.");
        }
    });
}
insertDefaultUser().catch((err) => console.error("❌ Error inserting default user:", err));
exports.default = User;
//# sourceMappingURL=user.schema.js.map