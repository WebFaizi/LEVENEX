import categoryseoSchema from "../schema/categoryseo.schema";

interface categoryseoInterface{
    category_id:string;
    category_seo_type:number;
    page_title?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    search_by_keyword?: string;
    search_by_keyword_meta_des?: string;
    search_by_keyword_meta_keyword?: string;
    product_title?: string;
    product_meta_description?: string;
    product_meta_keywords?: string;
}

export const updateCategorySeoModel = async (
    categoryseoData: categoryseoInterface,
    callback: (error: any, result: any) => void
) => {
    try {
        const existingCategorySeo = await categoryseoSchema.findOne({
            category_id: categoryseoData.category_id,
        });
        let result;
        if (existingCategorySeo) {
            result = await categoryseoSchema.findByIdAndUpdate(
                existingCategorySeo._id,
                categoryseoData,
                { new: true } 
            );
        } else {
            result = await categoryseoSchema.create(categoryseoData);
        }
        return callback(null, result);
    } catch (error) {
        return callback(error, null);
    }
};

export const insertCategorySeoModel = async (
    categoryseoData: categoryseoInterface
) => {
    try {
        const existingCategorySeo = await categoryseoSchema.findOne({
            category_id: categoryseoData.category_id,
        });
        let result;
        if (existingCategorySeo) {
            result = await categoryseoSchema.findByIdAndUpdate(
                existingCategorySeo._id,
                categoryseoData,
                { new: true } 
            );
        } else {
            result = await categoryseoSchema.create(categoryseoData);
        }
        return true;
    } catch (error) {
        return false;
    }
};