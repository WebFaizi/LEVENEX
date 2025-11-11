import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import RedirectsUrlSchema from "../schema/redircetsUrl.schema";
import * as XLSX from "xlsx";

interface storeRedircetsUrlModel{
    from_url:string;
    to_url:string;
    redirect_id:string;
}

export const storeRedircetsUrlModel = async (
    storeRedircetsUrlData: storeRedircetsUrlModel,  
    callback: (error: any, result: any) => void
) => {
    try {
        // Check if redirect_id exists
        if (storeRedircetsUrlData.redirect_id) {
            await RedirectsUrlSchema.deleteOne({ _id: storeRedircetsUrlData.redirect_id });
        }

        // Create and save new record
        const newUrl = new RedirectsUrlSchema({ ...storeRedircetsUrlData });
        await newUrl.save();

        return callback(null, newUrl);
    } catch (error) {
        return callback(new Error('Error storing redirect URL'), null);
    }   
};

export const getRediretsUrlListModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { from_url: { $regex: search, $options: 'i' } },
                      { to_url: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const users = await RedirectsUrlSchema.find(searchQuery)
            .skip(skip)
            .limit(limit) 
            .exec();

        const totalCountry = await RedirectsUrlSchema.countDocuments(searchQuery);

        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error('Error fetching users');
    }
};
export const redirectDetail = async (redirect_id:string, callback: (error: any, result: any) => void) => {
    try {        
        const Redirect = await RedirectsUrlSchema.findOne({ _id: redirect_id });        
        return callback(null, { Redirect });
    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};