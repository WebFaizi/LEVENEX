import BannersThemeSchema from '../domain/schema/bannersTheme.schema';
import BannersTypeSchema from '../domain/schema/bannerTypes.schema'
import bannersSchema from '../domain/schema/banners.schema'
import City from '../domain/schema/city.schema';
import Area from '../domain/schema/area.schema';

export const getCategorywiseLocation = async  (category_slug: string | null,user_current_location: any) => {
    try {   
        
        return {  };
    } catch (error) {        
        throw new Error("Failed to fetch location details");
    } 
};
export default getCategorywiseLocation;