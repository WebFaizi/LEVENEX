import { loggerMsg } from "../../lib/logger"; 
import BannerTypesSchema from "../schema/bannerTypes.schema"; 
import BannersSchema from "../schema/banners.schema";
import BannersThemeSchema from "../schema/bannersTheme.schema";
import mongoose from "mongoose";
interface homepagePerams {
    test:string
}

export const homePageModels = async (homePageData: homepagePerams, callback: (error: any, result: any) => void) => {
    try {

        return callback(null, {  });

    } catch (error) {
        console.error("Error storing banner:", error);
        return callback(error, null);
    }
};







