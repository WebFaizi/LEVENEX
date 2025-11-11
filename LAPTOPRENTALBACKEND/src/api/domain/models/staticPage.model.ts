import { loggerMsg } from "../../lib/logger";
import SataticPageSchema from "../schema/staticPage.schema"; 
import  multer from "multer";
import path  from "mongoose";
import slugify from "slugify";
import mongoose from "mongoose";
import { string } from "joi";
import fs from "fs";

interface StaticPagesInterFace{
    page_name:string;
    page_content:string;
    static_page_id?:string;
}

export const storeStaticPageModel = async (staticPages: StaticPagesInterFace, callback: (error: any, result: any) => void) => {
    try {

        const staticPage = new SataticPageSchema({
            page_name: staticPages.page_name,
            page_content: staticPages.page_content
        });

        const staticPageSave = await staticPage.save();
        return callback(null, { staticPageSave });

    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const staticPageListModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                      { subdomain_slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const lists = await SataticPageSchema.find(searchQuery)
            .skip(skip)
            .limit(limit) 
            .exec();

        const totalLists = await SataticPageSchema.countDocuments(searchQuery);

        return {
            data: lists,
            totalLists,
            totalPages: Math.ceil(totalLists / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const StaticPageDetailModel = async (blog_id:string, callback: (error: any, result: any) => void) => {
    try {
        
        const Blog = await SataticPageSchema.findOne({ _id: blog_id });
        
        
        return callback(null, { Blog });
    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const updateStaticPageModel = async (
    staticPages: StaticPagesInterFace,
    callback: (error: any, result: any) => void
  ) => {
    try {
      const staticPage = await SataticPageSchema.findOne({ _id: staticPages.static_page_id });
  
      if (!staticPage) {
        return callback(new Error('Static page not found'), null);
      }
  
      staticPage.page_name = staticPages.page_name;
      staticPage.page_content = staticPages.page_content;
  
      const updatedStaticPage = await staticPage.save();
  
      return callback(null, { updatedStaticPage });
    } catch (error) {
      console.error('Error updating static page:', error);
      return callback(error, null);
    }
  };

