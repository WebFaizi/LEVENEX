import NewsLetterSchema from "../schema/newsLetter.schema";
import ListingsSchema from "../schema/listing.schema";
import mongoose from "mongoose";
import path from "path"
import fs from "fs";
import { env } from "process";
// const baseUrl = env.BASE_URL || "http://localhost:3000";

interface INewsletter {
    newsletter_description:string;
    newsletter_banner_image:string;
    newsletter_listing_id:string[];
}

export const storeNewsletterModel = async (newsLetterData: INewsletter, callback: (error: any, result: any) => void) => {
    try {
        const existingNewsletter = await NewsLetterSchema.findOne();

        if (existingNewsletter) {
            if(newsLetterData.newsletter_banner_image != undefined && newsLetterData.newsletter_banner_image != ""){
                newsLetterData.newsletter_banner_image = newsLetterData.newsletter_banner_image
            }else{
                newsLetterData.newsletter_banner_image = existingNewsletter.newsletter_banner_image
            }
            await NewsLetterSchema.deleteOne({ _id: existingNewsletter._id });
        }

        const newNewsletter = new NewsLetterSchema({
            newsletter_description: newsLetterData.newsletter_description,
            newsletter_banner_image: newsLetterData.newsletter_banner_image,
            newsletter_listing_id: newsLetterData.newsletter_listing_id,
        });

        await newNewsletter.save();
        return callback(null, newNewsletter);
        
    } catch (error) {
        console.error("Error storing banner:", error);
        return callback(error, null);
    }
};

export const getNewsletterDetail = async (listing_id:string, callback: (error: any, result: any) => void) => {
    try {

        let newsletter_schema = await NewsLetterSchema.findOne()
        const listing = newsletter_schema && Array.isArray(newsletter_schema.newsletter_listing_id) ? newsletter_schema.newsletter_listing_id : [];
        const listingsFromSchema = await ListingsSchema.find({ listing_unique_id: { $in: listing } } ,'listing_unique_id name');
        const newsLetter = {
            ...newsletter_schema?.toObject(),
            newsletter_listing_id : listingsFromSchema
        } 
        if(newsletter_schema){
            newsletter_schema.newsletter_banner_image = `${process.env.BASE_URL}/${newsletter_schema.newsletter_banner_image}`;
        }

        const allListings = await ListingsSchema.find({}, 'listing_unique_id name').exec();
        const newsletterListingIds = newsLetter?.newsletter_listing_id.map((listing: any) => listing.listing_unique_id);
        const filteredListings = allListings.filter(
            (listing: any) => !newsletterListingIds?.includes(listing.listing_unique_id)
        );
        return callback(null, { newsletter_schema:newsLetter,available_listings: filteredListings, });

    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};