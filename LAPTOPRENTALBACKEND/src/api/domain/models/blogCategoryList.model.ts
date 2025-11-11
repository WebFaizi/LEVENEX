import { loggerMsg } from "../../lib/logger";
import countrySchema from "../schema/country.schema";
import stateSchema from "../schema/state.schema";
import citySchema from "../schema/city.schema";
import blogCategorySchema from "../schema/blogcategory.schema";
import { storeUserActionActivity } from "../../services/userActionActivity.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  multer from "multer";
import path  from "mongoose";
import mongoose from "mongoose";

interface loginUserDetailsSchema{
    userId:mongoose.Types.ObjectId;
}

interface blogCategorySchema{
    name:string;
    slug:string;
    sorting:number;
    blog_category_id?:string;
}

export const storeBlogCategoryModel = async (userData: loginUserDetailsSchema,blogCategoryData:blogCategorySchema,  callback: (error:any, result: any) => void) => {
   try{

    const slug = blogCategoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existingCategory = await blogCategorySchema.findOne({ slug: slug });
        if (existingCategory) {
            const error = new Error("Blog Category already exists.");
            return callback(error, null);
        }

        const lastCategory = await blogCategorySchema.findOne().sort({ sorting: -1 });
        const newSortingValue = lastCategory ? lastCategory.sorting + 1 : 1;

        const newCategory = new blogCategorySchema({ 
            ...blogCategoryData, 
            slug:slug,
            sorting: newSortingValue 
        });
        
        await newCategory.save();

        await storeUserActionActivity(
            userData.userId,
            "Blog Category",
            "Create",
            `New Blog categorie Added.`
        );

        return callback(null, newCategory);

    } catch (error) {
        const errors = new Error('Error fetching users');
        return callback(errors, null);
    }   

};

export const blogCategoryList = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const users = await blogCategorySchema.find(searchQuery)
            .skip(skip)
            .limit(limit) 
            .exec();

        const totalUsers = await blogCategorySchema.countDocuments(searchQuery);
        blogCategorySchema
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error('Error fetching blog category');
    }
};

export const updateBlogCategoryModel = async (
    userData: loginUserDetailsSchema,
    blogCategoryData: blogCategorySchema,
    callback: (error: any, result: any) => void
) => {
    try {
        const slug = blogCategoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        // Check if a category with the same slug already exists, excluding the current one
        const existingCategory = await blogCategorySchema.findOne({
            _id: { $ne: blogCategoryData.blog_category_id },
            slug: slug
        });

        if (existingCategory) {
            return callback(new Error("Blog Category already exists or category not found."), null);
        }

        // Find and update the existing category
        const updatedCategory = await blogCategorySchema.findByIdAndUpdate(
            blogCategoryData.blog_category_id,
            { ...blogCategoryData, slug: slug },
            { new: true } // Return updated document
        );

        if (!updatedCategory) {
            return callback(new Error("Blog Category not found."), null);
        }

        await storeUserActionActivity(
            userData.userId,
            "Blog Category",
            "Update",
            `Blog categorie details updated.`
        );

        return callback(null, updatedCategory);
    } catch (error) {
        return callback(new Error("Error updating blog category"), null);
    }
};
