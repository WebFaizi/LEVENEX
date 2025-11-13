"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogDeleteSchema = exports.updateBlogDetailsSchema = exports.storeBlogDetailsSchema = exports.blogCategoryDeleteSchema = exports.addUserListingReviewValidation = exports.addUserBlogReviewValidation = exports.blogCategoryUpdateSchema = exports.reviewapproveSchema = exports.reviewDeleteSchema = exports.addAdminBlogReviewValidation = exports.blogCategoryStoreSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.blogCategoryStoreSchema = joi_1.default.object({
    name: joi_1.default.any().required().messages({
        'any.required': 'Blog Category is required.',
    })
});
exports.addAdminBlogReviewValidation = joi_1.default.object({
    blog_id: joi_1.default.any().required().messages({
        'any.required': 'blog_id is required.',
    }),
    user_id: joi_1.default.any().required().messages({
        'any.required': 'user_id is required.',
    }),
    rating: joi_1.default.any().required().messages({
        'any.required': 'rating is required.',
    }),
    comment: joi_1.default.any().required().messages({
        'any.required': 'comment is required.',
    })
});
exports.reviewDeleteSchema = joi_1.default.object({
    review_ids: joi_1.default.array().required(),
});
exports.reviewapproveSchema = joi_1.default.object({
    review_id: joi_1.default.any().required(),
    type: joi_1.default.any().required().messages({
        'any.required': 'type is required.',
    }),
});
exports.blogCategoryUpdateSchema = joi_1.default.object({
    name: joi_1.default.any().required().messages({
        'any.required': 'Blog Category name is required.',
    }),
    blog_category_id: joi_1.default.any().required().messages({
        'any.required': 'Blog Category Id is required.',
    })
});
exports.addUserBlogReviewValidation = joi_1.default.object({
    blog_id: joi_1.default.any().required().messages({
        'any.required': 'Blog id is required.',
    }),
    rating: joi_1.default.any().required().messages({
        'any.required': 'Blog Rating is required.',
    }),
    comment: joi_1.default.any().required().messages({
        'any.required': 'Blog comment is required.',
    })
});
exports.addUserListingReviewValidation = joi_1.default.object({
    listing_id: joi_1.default.any().required().messages({
        'any.required': 'Blog id is required.',
    }),
    rating: joi_1.default.any().required().messages({
        'any.required': 'Blog Rating is required.',
    }),
    comment: joi_1.default.any().required().messages({
        'any.required': 'Blog comment is required.',
    })
});
exports.blogCategoryDeleteSchema = joi_1.default.object({
    blog_category_ids: joi_1.default.array().required(),
});
exports.storeBlogDetailsSchema = joi_1.default.object({
    author_name: joi_1.default.any().required().messages({
        'any.required': 'Blog Author Name is required.',
    }),
    categoryIds: joi_1.default.any().required().messages({
        'any.required': 'Blog Category is required.',
    }),
    contact_no: joi_1.default.any().required().messages({
        'any.required': 'Contact No is required.',
    }),
    email: joi_1.default.any().required().messages({
        'any.required': 'Email is required.',
    }),
    blog_title: joi_1.default.any().required().messages({
        'any.required': 'Blog Title is required.',
    }),
    content: joi_1.default.any().required().messages({
        'any.required': 'Blog content is required.',
    })
});
exports.updateBlogDetailsSchema = joi_1.default.object({
    author_name: joi_1.default.any().required().messages({
        'any.required': 'Blog Author Name is required.',
    }),
    categoryIds: joi_1.default.any().required().messages({
        'any.required': 'Blog Category is required.',
    }),
    contact_no: joi_1.default.any().required().messages({
        'any.required': 'Contact No is required.',
    }),
    email: joi_1.default.any().required().messages({
        'any.required': 'Email is required.',
    }),
    blog_title: joi_1.default.any().required().messages({
        'any.required': 'Blog Title is required.',
    }),
    content: joi_1.default.any().required().messages({
        'any.required': 'Blog content is required.',
    }),
    blog_id: joi_1.default.any().required().messages({
        'any.required': 'Blog Id is required.',
    })
});
exports.blogDeleteSchema = joi_1.default.object({
    blog_ids: joi_1.default.array().required(),
});
//# sourceMappingURL=blog.validation.js.map