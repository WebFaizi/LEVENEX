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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BlogSchema = new mongoose_1.Schema({
    blog_title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    content: { type: String, required: true, trim: true },
    author_name: { type: String, required: true, trim: true },
    contact_no: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    categoryIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "BlogCategory", required: true }],
    status: { type: Number, required: true, default: 1 },
    images: { type: String, required: false, default: null }, // Optional field for images
}, {
    timestamps: true,
});
BlogSchema.pre("save", function (next) {
    if (this.isModified("blog_title") || this.isNew) {
        this.slug = this.blog_title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    next();
});
const Blog = mongoose_1.default.model("Blog", BlogSchema);
exports.default = Blog;
//# sourceMappingURL=blog.schema.js.map