import e, { Request, Response } from "express";
import { successResponse,ErrorResponse } from "../../helper/apiResponse";
import IpAddress from "../../domain/schema/ipAddress.schema";
import { chatboatListingModel} from "../../domain/models/chatboatListing.model";
import { upload } from "../../services/upload.service";
import FeaturedListing from "../../domain/schema/featuredListing.schema";
import path from "path"
import mongoose from 'mongoose';
import fs from "fs";
import { env } from "process";
import * as XLSX from "xlsx";

interface importListingData{
    listing_name:string;
    category_name:string;
    city_name:string;
    position:string;
    
}

export const chatboatListing = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await chatboatListingModel(search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully sdsdsd", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}