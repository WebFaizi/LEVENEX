import listingseoSchema from "../schema/listingseo.schema";

interface listingseoInterface{
    listing_id:string;
    page_title?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
}

export const updateListingSeoModel = async (
    listingseoData: listingseoInterface,
    callback: (error: any, result: any) => void
) => {
    try {
        const existingListingSeo = await listingseoSchema.findOne({
            listing_id: listingseoData.listing_id,
        });
        let result;
        if (existingListingSeo) {
            result = await listingseoSchema.findByIdAndUpdate(
                existingListingSeo._id,
                listingseoData,
                { new: true } 
            );
        } else {
            result = await listingseoSchema.create(listingseoData);
        }
        return callback(null, result);
    } catch (error) {
        return callback(error, null);
    }
};

export const insertListingSeoModel = async (
    listingseoData: listingseoInterface
) => {
    try {
        const existingListingSeo = await listingseoSchema.findOne({
            listing_id: listingseoData.listing_id,
        });
        let result;
        if (existingListingSeo) {
            result = await listingseoSchema.findByIdAndUpdate(
                existingListingSeo._id,
                listingseoData,
                { new: true } 
            );
        } else {
            result = await listingseoSchema.create(listingseoData);
        }
        return true;
    } catch (error) {
        return false;
    }
};