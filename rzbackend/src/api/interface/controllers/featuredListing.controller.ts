import e, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import IpAddress from "../../domain/schema/ipAddress.schema";
import {
  storeFetauredListingModel,
  FeaturedListingList,
  featuredListingDetails,
  importFeaturedListingDataModel
} from "../../domain/models/featuredListing.model";
import { upload } from "../../services/upload.service";
import FeaturedListing from "../../domain/schema/featuredListing.schema";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";
import { env } from "process";
import * as XLSX from "xlsx";
import importFileStatusSchema from "../../domain/schema/importFileStatus.schema";
import { storeUserActionActivity } from "../../services/userActionActivity.service";

interface importListingData {
  listing_name: string;
  category_name: string;
  city_name: string;
  position: string;
}

export const deleteFeaturedlisting = async (req: Request, res: Response) => {
  try {
    const { listing_ids } = req.body;

    if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
      return ErrorResponse(res, "Please provide at least one valid Quotation ID.");
    }

    const result = await FeaturedListing.deleteMany({ _id: { $in: listing_ids } });

    if (result.deletedCount === 0) {
      return ErrorResponse(res, "No quotation found with the provided IDs.");
    }

    return successResponse(res, `Successfully deleted  Listings(ies).`, result.deletedCount);
  } catch (error) {
    return ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const deleteAllFeaturedListings = async (req: Request, res: Response) => {
  try {
    const result = await FeaturedListing.deleteMany({});

    if (result.deletedCount === 0) {
      return ErrorResponse(res, "No Featured listings found to delete.");
    }

    return successResponse(res, `Successfully deleted all Featured listings.`, result.deletedCount);
  } catch (error) {
    return ErrorResponse(res, "An error occurred while deleting all Featured listings.");
  }
};

export const storeFeaturedListing = async (req: Request, res: Response) => {
  try {
    await storeFetauredListingModel(req.body, (error: any, result: any) => {
      if (error) {
        ErrorResponse(res, error.message);
      }
      return successResponse(res, "Category Stored in Database successfully", result);
    });
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getFeaturedListingList = async (req: Request, res: Response) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categories = await FeaturedListingList(search as string, pageNum, limitNum);
    return successResponse(res, "get category list successfully", categories);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getFeaturedListingDetails = async (req: Request, res: Response) => {
  try {
    const { featured_listing_id } = req.params;

    featuredListingDetails(featured_listing_id as string, (error: any, result: any) => {
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

export const exportFeaturedListing = async (req: Request, res: Response) => {
  try {
    const { category_id, city_id } = req.query;

    const filter: Record<string, any> = {};

    if (category_id) {
      const categoryIdsArray = (category_id as string)
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id.trim()));
      filter.category_ids = { $in: categoryIdsArray };
    }

    if (city_id) {
      const cityIdsArray = (city_id as string)
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id.trim()));
      filter.city_id = { $in: cityIdsArray };
    }

    const listings = await FeaturedListing.aggregate([
      { $match: filter },
      { $sort: { position: -1 } },
      {
        $lookup: {
          from: "categories",
          localField: "category_ids",
          foreignField: "unique_id",
          as: "category_ids"
        }
      },
      {
        $lookup: {
          from: "listings",
          localField: "listing_id",
          foreignField: "listing_unique_id",
          as: "listing_id"
        }
      },
      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "unique_id",
          as: "city_id"
        }
      },
      {
        $project: {
          "category_ids.name": 1,
          "listing_id.name": 1,
          "city_id.name": 1,
           is_all_city_selected: 1,
           is_all_category_selected: 1,
          position: 1
        }
      },
      {
        $unwind: {
          path: "$listing_id",
          preserveNullAndEmptyArrays: true
        }
      }
    ]).exec();

    if (!listings.length) {
      return res.status(404).json({ message: "No listings found to export." });
    }

    const listingsData = listings.map((listing) => {
      console.log("listing?.listing_id", listing?.listing_id);

      return {
        "Listing Name":
          listing?.listing_id && "name" in listing.listing_id ? listing.listing_id.name : "N/A",
        Categories: !listing.is_all_category_selected ? listing?.category_ids?.map((cat: any) => cat.name).join(", ") : "All",
        Cities: !listing?.is_all_city_selected ? listing?.city_id?.map((city: any) => city.name).join(", ") : "All",
        Position: listing?.position ?? "N/A"
      };
    });

    // return res.send({ listingsData });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(listingsData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Featured Listings");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Disposition", "attachment; filename=featured_listings.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(excelBuffer);
  } catch (error: any) {
    return res.status(500).json({ message: "Error exporting listings", error: error.message });
  }
};

export const importFeaturedListing = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    const data: importListingData[] = rawData.map((item) => ({
      listing_name: String(item["Listing Name"] || ""),
      category_name: String(item["Categories"] || ""),
      city_name: String(item["Cities"] || ""),
      position: String(item["Position"] || "")
    }));

    const totalRecords = data.length - 1;
    const avgTimePerRecord = 0.01; // seconds per record
    const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    const checkAfterMinutes = estimatedMinutes + 1;

    await importFileStatusSchema.create({
      module_name: "FeaturedListing",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(200).json({
      message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
    });

    setTimeout(async () => {
      try {
        importFeaturedListingDataModel(data, async (error: any, result: any) => {
          if (!error) {
            await storeUserActionActivity(
              req.user.userId,
              "Featured Listing",
              "Import",
              "Featured listings imported."
            );

            await importFileStatusSchema.deleteOne({ module_name: "FeaturedListing" });
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
