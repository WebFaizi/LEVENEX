
import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import IPremiumListingSchema from "../../domain/schema/premiumListing.schema";
import { storePremiumListingModel,premiumListingList,premiumListingDetail,updatePremiumListingModel,importPremiumListingDataModel} from "../../domain/models/premiumListing.model";
import { upload } from "../../services/upload.service";
import * as XLSX from "xlsx";
import { storeUserActionActivity } from "../../services/userActionActivity.service";


interface importListingDatas {
  listing_name: string;
  listing_unique_id: string;
  premium_type: string;
  start_date: string;
  end_date: string;
}


export const storePremiumListingData = async (req: Request, res: Response) => {
    try {
      
        const categories = await storePremiumListingModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Premium listing Stored in Database successfully", result);
        });
        
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const importPremiumListing = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    const data: importListingDatas[] = rawData.map((item) => ({
      listing_name: String(item["Listing Name"] || ""),
      premium_type: String(item["Premium Type"] || ""),
      listing_unique_id: String(item["Listing Unique Id"] || ""),
      start_date: String(item["Start Date"] || null),
      end_date: String(item["End Date"] || null)
    }));

    const totalRecords = data.length - 1;
    const avgTimePerRecord = 0.01; // seconds per record
    const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    const checkAfterMinutes = estimatedMinutes + 1;


    res.status(200).json({
      message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
    });
    console.log('data:', data);
    setTimeout(async () => {
      try {
        importPremiumListingDataModel(data, async (error: any, result: any) => {
          if (!error) {
            await storeUserActionActivity(
              req.user.userId,
              "Premium Listing",
              "Import",
              "Featured listings imported."
            );

            console.log("Featured listings import completed.");
          } else {
            console.error("Featured Listing Import Error:", error);
          }
        });
      } catch (err) {
        console.error("Featured Listing Background Import Error:", err);
      }
    }, 100);
  } catch (error: any) {
    console.error("Featured listing import error:", error);
    return res.status(500).json({ message: "Error importing listings", error: error.message });
  }
};

export const getPremiumListingList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await premiumListingList(search as string, pageNum, limitNum);
        return successResponse(res, "get premium list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deletePremiumListingList = async (req:Request,res:Response) => {
    try{
        const { listing_ids } = req.body; 

        if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Quotation ID.");
        }

        const result = await IPremiumListingSchema.deleteMany({ _id: { $in: listing_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No premium found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  premium Listings(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getPremiumListingDetails = async (req: Request, res: Response) => {
    try {

        const { listing_id } = req.params;

        premiumListingDetail(listing_id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "premium Listing details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};

export const updatePremiumListingData = async (req: Request, res: Response) => {
    try {
      
        const categories = await updatePremiumListingModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "premium Stored in Database successfully", result);
        });
        
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

