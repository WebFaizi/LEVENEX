import { loggerMsg } from "../../lib/logger";
import categorySchema from "../schema/category.schema";
import { storeUserActionActivity } from "../../services/userActionActivity.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "mongoose";
import mongoose from "mongoose";

interface categorySchema {
  name: string;
  slug: string;
  subdomain_slug: string;
  desktop_image: string;
  mobile_image: string;
  description: string;
  subdomain_description: string;
  page_top_keyword: string;
  page_top_descritpion: string;
  sorting: number;
  ratingvalue?: number;
  ratingcount?: number;
  related_categories: [];
}

interface categoryActionInterface {
  category_id: string;
  type: string;
}

interface loginUserDetailsSchema {
  userId: mongoose.Types.ObjectId;
}

export const allAdminCategoryList = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const users = await categorySchema
      .find({ status: true })
      .sort({ sorting: 1 })
      .exec();

    return {
      data: users,
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const categoryActionModel = async (
  categoryData: categoryActionInterface,
  callback: (error: any, result: any) => void
) => {
  try {
    const category = await categorySchema.findOne({
      _id: categoryData.category_id,
    });

    if (!category) {
      return callback({ message: "Category not found" }, null);
    }

    category.status = categoryData.type === "1";

    await category.save();

    return callback(null, category);
  } catch (error) {
    console.error("Error updating category:", error);
    return callback({ message: "Error updating category" }, null);
  }
};

export const categoryList = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
            { subdomain_slug: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const users = await categorySchema
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await categorySchema.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const disableCategoryList = async (
  categoryData: categorySchema,
  callback: (error: any, result: any) => void
) => {
  try {
    const category_list = await categorySchema.find({ status: false });
    return callback(null, category_list);
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const storeCategoryModel = async (
  userData: loginUserDetailsSchema,
  categoryData: categorySchema,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingCategory = await categorySchema.findOne({
      slug: categoryData.slug,
    });

    if (existingCategory) {
      const error = new Error("Category already exists.");
      return callback(error, null);
    }

    const lastCategory = await categorySchema.findOne().sort({ sorting: -1 });
    const newSortingValue = lastCategory ? lastCategory.sorting + 1 : 1;

    const newCategory = new categorySchema({
      ...categoryData,
      sorting: newSortingValue,
    });

    await newCategory.save();    

    await storeUserActionActivity(
      userData.userId,
      "Category",
      "Create",
      `New Category Added .`
    );

    return callback(null, newCategory);
  } catch (error) {    
    throw new Error("Error fetching users");
  }
};

export const getCategoryDetailModel = async (
  category_id: string,
  callback: (error: any, result: any) => void
) => {
  try {
     const existingCategory: any = await categorySchema
      .aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(category_id),
          },
        },
        {
          $addFields: {
            related_categories_numbers: {
              $map: {
                input: "$related_categories",
                as: "rc",
                in: { $toInt: "$$rc" },
              },
            },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "related_categories_numbers",
            foreignField: "unique_id",
            as: "related_categories",
          },
        },
        {
          $project: {
            related_categories_numbers: 0, // hide temp field
          },
        },
      ])
      .exec();    

    if (!existingCategory) {
      return callback(new Error("Category not found"), null);
    }
    const imageBaseUrl = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.laptoprental.co";
    existingCategory[0].desktop_image = `${imageBaseUrl}/${existingCategory?.desktop_image}`;
    existingCategory[0].mobile_image = `${imageBaseUrl}/${existingCategory?.mobile_image}`;

    return callback(null, existingCategory[0]);
  } catch (error) {
    return callback(error, null);
  }
};

export const UpdateCategoryDetailModel = async (
  userData: loginUserDetailsSchema,
  category_id: string,
  categoryData: categorySchema,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingCategory = await categorySchema.findOne({ _id: category_id });

    if (!existingCategory) {
      return callback(new Error("Category not found."), null);
    }

    const slugExist = await categorySchema.findOne({
      slug: categoryData.slug,
      _id: { $ne: category_id },
    });

    if (slugExist) {
      return callback(new Error(" already exists."), null);
    }
    existingCategory.name = categoryData.name || existingCategory.name;
    existingCategory.slug = categoryData.slug || existingCategory.slug;
    existingCategory.subdomain_slug =
      categoryData.subdomain_slug || existingCategory.subdomain_slug;
    existingCategory.desktop_image =
      categoryData.desktop_image || existingCategory.desktop_image;
    existingCategory.mobile_image =
      categoryData.mobile_image || existingCategory.mobile_image;
    existingCategory.description =
      categoryData.description || existingCategory.description;
    existingCategory.subdomain_description =
      categoryData.subdomain_description ||
      existingCategory.subdomain_description;
    existingCategory.page_top_keyword =
      categoryData.page_top_keyword || existingCategory.page_top_keyword;
    existingCategory.page_top_descritpion =
      categoryData.page_top_descritpion ||
      existingCategory.page_top_descritpion;
    existingCategory.ratingvalue =
      categoryData.ratingvalue || existingCategory.ratingvalue;
    existingCategory.ratingcount =
      categoryData.ratingcount || existingCategory.ratingcount;
    existingCategory.related_categories =
      categoryData.related_categories || existingCategory.related_categories;
    await existingCategory.save();

    await storeUserActionActivity(
      userData.userId,
      "Category",
      "Update",
      `categorie data Updated .`
    );

    return callback(null, existingCategory);
  } catch (error) {
    return callback(error, null);
  }
};

export const getSortedCategoryList = async (
  callback: (error: any, result: any) => void
) => {
  try {
    const users = await categorySchema
      .find({ status: true })
      .sort({ sorting: 1 })
      .lean();
    return callback(null, users);
  } catch (error) {
    return callback(error, null);
  }
};

export const updateSortingList = async (
  category_ids: any[],
  callback: (error: any, result: any) => void
) => {
  if (!Array.isArray(category_ids) || category_ids.length === 0) {
    return callback(new Error("Invalid category IDs"), null);
  }

  try {
    const bulkOps = category_ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sorting: index + 1 } },
      },
    }));

    await categorySchema.bulkWrite(bulkOps);

    const updatedCategories = await categorySchema.find().sort({ sorting: 1 });

    return callback(null, updatedCategories);
  } catch (error) {
    return callback(error, null);
  }
};
