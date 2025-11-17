import { loggerMsg } from "../../lib/logger"; 
import BannerTypesSchema from "../schema/bannerTypes.schema"; 
import BannersSchema from "../schema/banners.schema";
import BannersThemeSchema from "../schema/bannersTheme.schema";
import mongoose from "mongoose";

interface Banner {
    banner_theme_id?: string;
    banner_theme_slug: string; 
    banner_theme_size: string;
    provide_name:string;
    status:boolean;
    banner_type_code:string[];
}

export const getBannerThemeModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { banner_title: { $regex: search, $options: 'i' } },
                      { banner_url: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const banners = await BannersThemeSchema.find(searchQuery)
            .limit(limit) 
            .exec();


        const totalUsers = await BannersThemeSchema.countDocuments(searchQuery);
        
        return {
            data: banners,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    } catch (error) {
    }
};