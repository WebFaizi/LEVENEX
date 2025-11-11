import { loggerMsg } from "../../lib/logger"; 
import BannerTypesSchema from "../schema/bannerTypes.schema"; 
import BannersSchema from "../schema/banners.schema";
import BannersThemeSchema from "../schema/bannersTheme.schema";
import mongoose from "mongoose";

interface Banner {
    banner_type_id: string;
    category_ids: string[];       
    country_id: string;           
    state_id: string;            
    city_ids: string[];          
    banner_title: string;         
    banner_url: string;           
    banner_image: string;        
    display_period_in_days: string;  
    banner_email: string;         
    hide_banner_city_ids: string[]; 
    select_all_categories: boolean; 
    select_all_cities: boolean; 
    banners_id?:string;  
}

interface BannerTheme {
    provide_name: string;
    banner_type_code: string[];       
    status: boolean;   
    banner_theme_id:string;  
}

export const storeBannerModel = async (bannerData: Banner, callback: (error: any, result: any) => void) => {
    try {

        const categoryObjectIds = Array.isArray(bannerData.category_ids) 
            ? bannerData.category_ids
                .filter(id => Number(id)) 
                .map(id => Number(id))
            : [];

        const cityObjectIds = Array.isArray(bannerData.city_ids) 
            ? bannerData.city_ids
                .filter(id => Number(id)) 
                .map(id => Number(id))
            : [];

        const hideBannerCityIds = Array.isArray(bannerData.hide_banner_city_ids) 
            ? bannerData.hide_banner_city_ids
                .filter(id => Number(id)) 
                .map(id => new Number(id))
            : [];

        const bannerTypeId = new mongoose.Types.ObjectId(bannerData.banner_type_id);    

        const newBanner = new BannersSchema({
            banner_type_id: bannerTypeId,
            country_id: bannerData.country_id,
            state_id: bannerData.state_id,
            banner_title: bannerData.banner_title,
            banner_url: bannerData.banner_url,
            banner_image: bannerData.banner_image,
            display_period_in_days: bannerData.display_period_in_days,
            banner_email: bannerData.banner_email,
            hide_banner_city_ids: hideBannerCityIds, 
            category_ids: categoryObjectIds,         
            select_all_categories: bannerData.select_all_categories, 
            select_all_cities: bannerData.select_all_cities,        
            city_ids: cityObjectIds,                   
        });

        const savedBanner = await newBanner.save();

        return callback(null, { savedBanner });

    } catch (error) {
        console.error("Error storing banner:", error);
        return callback(error, null);
    }
};

export const getBannerModel = async (search: string, page: number, limit: number) => {
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

        const banners = await BannersSchema.find(searchQuery)
            .populate('banner_type_id')
            .limit(limit) 
            .exec();

    const updatedBanners = banners.map(banner => {
        banner.banner_image = `${process.env.BASE_URL}/${banner.banner_image}`;
        return banner;
        });

        const totalUsers = await BannersSchema.countDocuments(searchQuery);
        
        return {
            data: updatedBanners,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    } catch (error) {
    }
};

export const bannerDetailModel = async (banners_id:string, callback: (error: any, result: any) => void) => {
    try {
        const BannerTypeDetails = await BannersSchema.findOne({ _id: banners_id }).exec();
        
        if (!BannerTypeDetails) {
          return callback({ message: "Banner not found" }, null);
        }
    
        if (BannerTypeDetails.banner_image) {
          BannerTypeDetails.banner_image = `${process.env.BASE_URL}/${BannerTypeDetails.banner_image}`;
        } else {
          BannerTypeDetails.banner_image = `${process.env.BASE_URL}/default-image.png`; 
        }            
        return callback(null, { BannerTypeDetails });
      } catch (error) {
        console.error("Error fetching banner details:", error);
        return callback(error, null);
      }
};

export const updateBannerModel = async (bannerData: Banner, callback: (error: any, result: any) => void) => {
    try {
        const categoryObjectIds = Array.isArray(bannerData.category_ids)
            ? bannerData.category_ids
                .filter(id => Number(id))
                .map(id => new Number(id))
            : [];

        const cityObjectIds = Array.isArray(bannerData.city_ids)
            ? bannerData.city_ids
                .filter(id => Number(id))
                .map(id => new Number(id))
            : [];

        const hideBannerCityIds = Array.isArray(bannerData.hide_banner_city_ids)
            ? bannerData.hide_banner_city_ids
                .filter(id => Number(id))
                .map(id => new Number(id))
            : [];

        const bannerTypeId = new mongoose.Types.ObjectId(bannerData.banner_type_id);

        const bannerToUpdate = await BannersSchema.findById(bannerData.banners_id);
        if (!bannerToUpdate) {
            return callback({ message: "Banner not found" }, null);
        }

        const updatedData: any = {
            banner_type_id: bannerTypeId,
            country_id: bannerData.country_id,
            state_id: bannerData.state_id,
            banner_title: bannerData.banner_title,
            banner_url: bannerData.banner_url,
            display_period_in_days: bannerData.display_period_in_days,
            banner_email: bannerData.banner_email,
            hide_banner_city_ids: hideBannerCityIds,
            category_ids: categoryObjectIds,
            select_all_categories: bannerData.select_all_categories,
            select_all_cities: bannerData.select_all_cities,
            city_ids: cityObjectIds,
        };

        if (bannerData.banner_image) {
            updatedData.banner_image = bannerData.banner_image;
        }

        const updatedBanner = await BannersSchema.findByIdAndUpdate(bannerData.banners_id, updatedData, { new: true });

        return callback(null, { updatedBanner });
    } catch (error) {
        console.error("Error updating banner:", error);
        return callback(error, null);
    }
};

export const bannerThemeDetailModel = async (banners_theme_id:string, callback: (error: any, result: any) => void) => {
    try {
        const BannerThemeDetails = await BannersThemeSchema.findOne({ _id: banners_theme_id }).exec();
        
        if (!BannerThemeDetails) {
          return callback({ message: "Banner Theme not found" }, null);
        }
    
        return callback(null, { BannerThemeDetails });
      } catch (error) {
        console.error("Error fetching banner details:", error);
        return callback(error, null);
      }
};

export const updateBannerThemeModel = async (banner_themeData: BannerTheme, callback: (error: any, result: any) => void) => {
    try {
      

        const bannerToUpdate = await BannersThemeSchema.findById(banner_themeData.banner_theme_id);
        if (!bannerToUpdate) {
            return callback({ message: "Banner theme not found" }, null);
        }

        const updatedData: any = {
            provide_name: banner_themeData.provide_name,
            banner_type_code: banner_themeData.banner_type_code || null,  // Set null if empty
            status: banner_themeData.status,
        };


        const updatedBanner = await BannersThemeSchema.findByIdAndUpdate(banner_themeData.banner_theme_id, updatedData, { new: true });

        return callback(null, { updatedBanner });
    } catch (error) {
        console.error("Error updating banner theme:", error);
        return callback(error, null);
    }
};






