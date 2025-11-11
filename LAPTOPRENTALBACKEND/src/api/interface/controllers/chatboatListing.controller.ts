import e, { Request, Response } from "express";
import { successResponse,ErrorResponse } from "../../helper/apiResponse";
import ChatboatListing from "../../domain/schema/chatboat.schema";
import ChatboatUserListing from "../../domain/schema/chatboatUser.schema";
import { chatboatListingModel,chatBoatListingCityWise,storeChatboatListingModel,chatboatListingDetails,chatboatUserListModel} from "../../domain/models/chatboatListing.model";
import { upload } from "../../services/upload.service";
import FeaturedListing from "../../domain/schema/featuredListing.schema";
import path from "path"
import mongoose from 'mongoose';
import fs from "fs";
import { env } from "process";
import * as XLSX from "xlsx";

export const clearChatBoat = async (req: Request, res: Response) => {
    try {
      const result = await ChatboatUserListing.deleteMany({});
      return successResponse(res, 'All Chatboat user listings deleted successfully', result);
    } catch (error) {
      console.error('❌ Error while deleting chatboat listings:', error);
      return ErrorResponse(res, 'Something went wrong while clearing Chatboat listings');
    }
  };

export const deleteAllChatboatListings = async (req: Request, res: Response) => {
    try {
        const result = await ChatboatUserListing.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Chatboat listings found to delete.");
        }

        return successResponse(res, `Successfully deleted all Chatboat listings.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Chatboat listings.");
    }
};

export const storeChatBoatUser = async (req: Request, res: Response) => {
    try {
      const { category_ids = [], city_name, phone_number } = req.body;
  
      // Validate category_ids
      const validCategoryIds = Array.isArray(category_ids)
        ? category_ids.filter((id: string) => mongoose.isValidObjectId(id))
        : [];
  
      if (!city_name || !phone_number) {
        return ErrorResponse(res, "City name and phone number are required.");
      }
  
      const newChatBoatUser = new ChatboatUserListing({
        category_ids: validCategoryIds,
        city_name,
        phone_number,
      });
  
      const savedUser = await newChatBoatUser.save();
      return successResponse(res, "ChatBoat User stored successfully", savedUser);
    } catch (error) {
      console.error("Error storing ChatBoatUser:", error);
      return ErrorResponse(res, "Something went wrong while storing user.");
    }
  };

export const chatBoatUserList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await chatboatUserListModel(search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const ChatBoatUserExport = async (req: Request, res: Response) => {
    try {
        const categories = await ChatboatUserListing.aggregate([
        {
            $sort: { sortingOrder: -1 }
        },
        {
            $lookup: {
            from: 'categories',
            localField: 'category_ids',
            foreignField: 'unique_id',
            as: 'category_ids'
            }
        },
        {
            $project: {
            _id: 1,
            sortingOrder: 1,
            createdAt: 1,
            city_name: 1,
            phone_number: 1,
            category_ids: {
                $map: {
                input: "$category_ids",
                as: "cat",
                in: {
                    _id: "$$cat._id",
                    name: "$$cat.name",
                    unique_id: "$$cat.unique_id"
                }
                }
            }
            }
        }
        ]);

        const categoryData = categories.map((category: any) => ({
        CategoryName: Array.isArray(category.category_ids)
            ? category.category_ids.map((cat: any) => cat.name).join(", ")
            : "",
        CreatedAt: category.createdAt,
        CityName: category.city_name,
        PhoneNumber: category.phone_number
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        res.setHeader("Content-Disposition", "attachment; filename=chatboat_user.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);
    } catch (error: any) {
        return res.status(500).json({ message: "Error exporting categories", error: error.message });
    }
};

export const getChatboatListingDetails = async (req: Request, res: Response) => {
    try {

        const { chat_boat_listing_id } = req.params;

        chatboatListingDetails(chat_boat_listing_id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Featured Listing details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};

export const getChatboatListingList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await chatboatListingModel(search as string, pageNum, limitNum);
        return successResponse(res, "get chatboat list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getListingCityWise = async (req: Request, res: Response) => {
    try {
        const { city_id,chat_boat_id } = req.query;
      
        const categories = await chatBoatListingCityWise(city_id as string, chat_boat_id as string);
        return successResponse(res, "get chatboat list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeChatboatListing = async (req: Request, res: Response) => {
    try {        
        await storeChatboatListingModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Chatboat listing stored successfully", result);
        });
    } catch (error) {
        console.error("Store chatboat listing error:", error);
        return ErrorResponse(res, "Failed to store chatboat listing");
    }
};

export const deleteChatboatlisting = async (req:Request,res:Response) => {
    try{
        const { chatboat_ids } = req.body; 

        if (!chatboat_ids || !Array.isArray(chatboat_ids) || chatboat_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Quotation ID.");
        }

        const result = await ChatboatListing.deleteMany({ _id: { $in: chatboat_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No quotation found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  Listings(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}
