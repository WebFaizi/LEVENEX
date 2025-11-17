import FaqSchema from "../schema/faq.schema"; 
import NodeCache from "node-cache";
import mongoose from "mongoose";

import Faq from "../schema/faq.schema";
const cache = new NodeCache({ stdTTL: 300 }); // TTL = 300 seconds = 5 minutes
export default cache;

interface loginUserDetailsSchema{
    userId:mongoose.Types.ObjectId;
}

interface faqData{
    question:string;
    answer:string;
    faq_id?:string;
}



interface loginUserData{
    userId:string;
    company_id:string;
}


export const storeFaqModel = async (userDetails:loginUserDetailsSchema,faqData: faqData, callback: (error: any, result: any) => void) => {
    try {
        
        const newFaq = new FaqSchema({
            question: faqData.question,
            answer: faqData.answer
        });

        const savedFaq = await newFaq.save();
        // await storeUserActionActivity(userDetails.userId, "BLog", "Create", `Craete new  blog!`)
        return callback(null, { savedFaq });

    } catch (error) {
        console.error("Error storing Faq:", error);
        return callback(error, null);
    }
};

export const faqList = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { question: { $regex: search, $options: 'i' } },
                      { answer: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const faqs = await FaqSchema.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit) 
            .exec();

        const totalFaqs = await FaqSchema.countDocuments(searchQuery);

        return {
            data: faqs,
            totalFaqs,
            totalPages: Math.ceil(totalFaqs / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error('Error fetching faqs');
    }
};


export const faqDetail = async (faq_id:string, callback: (error: any, result: any) => void) => {
    try {
        
        const Faq = await FaqSchema.findOne({ _id: faq_id });
        return callback(null, { Faq });
    } catch (error) {
        console.error("Error fetching faq:", error);
        return callback(error, null);
    }
};

export const updateFaqModel = async (userDetails:loginUserDetailsSchema,faqData: faqData, callback: (error: any, result: any) => void) => {
    try {
        
        const faqToUpdate = await FaqSchema.findById(faqData.faq_id);

        if (!faqToUpdate) {
            return callback({ message: "Faq not found", status: 404 }, null);
        }

        faqToUpdate.question = faqData.question;
        faqToUpdate.answer = faqData.answer;

        const updatedFaq = await faqToUpdate.save();

        // await storeUserActionActivity(userDetails.userId, "BLog", "update", `Update blog details!`)

        return callback(null, { updatedFaq });

    } catch (error) {
        console.error("Error updating faq:", error);
        return callback(error, null);
    }
};

export const frontendFaqList = async (
    callback: (error: any, result: any) => void
) => {
    try {
        
        const faq = await FaqSchema.find({}).sort({ createdAt: -1 }).lean();

        const data = {
            faq,
            title: "Faq Listing",
            meta_title: "Faq Listing Meta",
            meta_description: "Faq Meta description",
            meta_keywords: "Meta keywords"
        };

        // Store the result in cache for future use
        // cache.set(cacheKey, data);        
        return callback(null, data);

    } catch (error) {
        console.error("Error in frontendFaqList:", error);
        return callback(error, null);
    }
};








