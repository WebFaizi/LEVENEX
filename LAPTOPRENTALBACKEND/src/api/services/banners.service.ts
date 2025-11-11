import BannersThemeSchema from '../domain/schema/bannersTheme.schema';
import BannersTypeSchema from '../domain/schema/bannerTypes.schema'
import bannersSchema from '../domain/schema/banners.schema'
import City from '../domain/schema/city.schema';
import Area from '../domain/schema/area.schema';
import mongoose from 'mongoose';

interface LocationData{
    location_type: string,
    city_name: string,
    current_location_id: string,
    current_area_id:string,
    current_city_id:string,
}

const tryObjectId = (id: string) => {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return id; // if not valid ObjectId, return as string
    }
};

const extractIds = (htmlArray: string[]): string[] => {
    const regex = /data-id="(.*?)"/g;
    const bannerIds: string[] = [];

    for (const html of htmlArray) {
        let match;
        while ((match = regex.exec(html)) !== null) {
            bannerIds.push(match[1]);
        }
    }

    return bannerIds;
};

export const getAdsBanners = async (
    category_id: string | null,
    user_current_location: any,
    banners_type: string
) => {
    try {
        const banners_theme = await BannersThemeSchema.findOne({
            banner_theme_slug: banners_type
        }).exec();        
        

        if (!banners_theme || !banners_theme.banner_type_code) {
            return { message: "No banner theme found", randomBanner: null };
        }

        const html = banners_theme.banner_type_code;
        const bannerIds = extractIds(html);

        const queryConditions: any[] = [];

        // 📌 Category filters
        if (category_id && category_id !== '') {
            queryConditions.push({
                $or: [
                    { select_all_categories: true },
                    { 
                        select_all_categories: false, 
                        category_ids: { $in: [category_id] } 
                    }
                ]
            });
        } else {
            queryConditions.push({
                $or: [
                    { select_all_categories: true },
                    { select_all_categories: false }
                ]
            });
        }

        // 📌 City filters
        if (user_current_location?.current_city_unique_id) {
            const currentCityUniqueId = Number(user_current_location.current_city_unique_id);

            queryConditions.push({
                $or: [
                    { hide_banner_city_ids: { $exists: false } },
                    { hide_banner_city_ids: { $size: 0 } },
                    { hide_banner_city_ids: { $nin: [currentCityUniqueId] } }
                ]
            });

            queryConditions.push({
                $or: [
                    { select_all_cities: true },
                    { 
                        select_all_cities: false, 
                        city_ids: { $in: [currentCityUniqueId] } 
                    }
                ]
            });
        } else {
            queryConditions.push({ select_all_cities: true });
        }

        // 📌 Banner Type ID
        if (bannerIds.length > 0) {
            const objectIdBannerIds = bannerIds.map(id => new mongoose.Types.ObjectId(id));
            queryConditions.push({
                banner_type_id: { $in: objectIdBannerIds }
            });
        }

        const banners_data_list = await bannersSchema.find({ $and: queryConditions });
        
        let randomBanner = null;

        if (banners_data_list.length > 0) {
            randomBanner = banners_data_list[Math.floor(Math.random() * banners_data_list.length)];
            randomBanner.banner_image = `${process.env.BASE_URL}/${randomBanner.banner_image}`;
        }

        return { randomBanner };
    } catch (error) {
        console.error("Error fetching banners for type:", banners_type, error);
        return { randomBanner: null, error: error instanceof Error ? error.message : "Unknown error" };
    }
};

export default getAdsBanners;
