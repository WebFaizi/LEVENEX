import { loggerMsg } from "../../lib/logger"; 
import BannerTypesSchema from "../schema/bannerTypes.schema"; 
import BannersSchema from "../schema/banners.schema"; 

interface bannerType{
    banner_title: string;
    banner_size: string;
    banner_price:string;
    banner_slots: string;
    banner_preview_url:string;
    banner_type_id?:string;
}

interface banner{
    banner_type: string;
    category_ids: string[];
    country_id:string;
    state_id: string;
    city_ids:string[];
    banner_title:string;
    banner_url:string;
    banner_image:string;
    display_period_in_days:string;
    banner_email:string;
    hide_banner_city_ids:string[];
}

export const storeBannerTypeModel = async (bannerTypeData: bannerType, callback: (error: any, result: any) => void) => {
    try {

        const newBanner = new BannerTypesSchema({
            banner_title: bannerTypeData.banner_title,
            banner_size: bannerTypeData.banner_size,
            banner_price: bannerTypeData.banner_price,
            banner_slots: bannerTypeData.banner_slots,
            banner_preview_url: bannerTypeData.banner_preview_url,
        });

        const savedBannerType = await newBanner.save();

        const bannerHtml = `<a class="ubm-banner" data-id="${savedBannerType._id}"></a>`;

        savedBannerType.banner_sortcode = bannerHtml;

        await savedBannerType.save();

        return callback(null, { savedBannerType });

    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const getBannerTypeModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { banner_title: { $regex: search, $options: 'i' } },
                      { banner_size: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const users = await BannerTypesSchema.find(searchQuery)
            .limit(limit) 
            .exec();

        const totalUsers = await BannerTypesSchema.countDocuments(searchQuery);
        
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    } catch (error) {
    }
};

export const bannerTypeDetailModel = async (banner_type_id:string, callback: (error: any, result: any) => void) => {
    try {
        const BannerTypeDetails = await BannerTypesSchema.findOne({ _id: banner_type_id });        
        return callback(null, { BannerTypeDetails });
    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const updateBannerTypeModel = async (bannerTypeData: bannerType, callback: (error: any, result: any) => void) => {
    try {
        let savedBannerType;

        if (bannerTypeData.banner_type_id) {
            savedBannerType = await BannerTypesSchema.findById(bannerTypeData.banner_type_id);
            
            if (savedBannerType) {
                savedBannerType.banner_title = bannerTypeData.banner_title;
                savedBannerType.banner_size = bannerTypeData.banner_size;
                savedBannerType.banner_price = bannerTypeData.banner_price;
                savedBannerType.banner_slots = bannerTypeData.banner_slots;
                savedBannerType.banner_preview_url = bannerTypeData.banner_preview_url;
    
                const bannerHtml = `<a class="ubm-banner" data-id="${savedBannerType._id}"></a>`;
                savedBannerType.banner_sortcode = bannerHtml;
    
                await savedBannerType.save();
                return callback(null, { savedBannerType });
            } else {
                return callback("Banner type not found.", null);
            }
        }
    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

