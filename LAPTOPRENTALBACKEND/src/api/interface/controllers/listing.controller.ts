import e, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import IpAddress from "../../domain/schema/ipAddress.schema";
import {
  storeListingModel,
  getUserAllListingModel,
  importCategoryListingDataModel,
  updateListingModel,
  ListingList,
  updateListingBannersList,
  listingBannersList,
  listingDetail,
  ListingReviewList,
  updateListingStatusModel,
  importListingDataModel,
  importFreshListingDataModel,
  deleteDuplicateListingModel,
  importListingReviewDataModel,
  getAllListingModel,
  storeListingReviewModel,
  UserListingList,
  importUserListingDataModel,
  ListingWiseReviewList
} from "../../domain/models/listing.model";
import { upload } from "../../services/upload.service";
import ListingsSchema from "../../domain/schema/listing.schema";
import categorySchema from "../../domain/schema/category.schema";
import ListingReviewSchema from "../../domain/schema/listingReview.schema";
import importFileStatusSchema from "../../domain/schema/importFileStatus.schema";
import path from "path";
import { storeUserActionActivity } from "../../services/userActionActivity.service";
import { insertOrUpdateExportTaskService } from "../../services/insertExportTaskService.service";
import mongoose from "mongoose";
import { convertToWebpAndSave } from "../../services/imageService";
import fs from "fs";
import { env } from "process";
import * as XLSX from "xlsx";
import FeaturedListing from "../../domain/schema/featuredListing.schema";
import PremiumListing from "../../domain/schema/premiumListing.schema";

interface FileWithBuffer extends Express.Multer.File {
  buffer: Buffer;
}

interface importFreshListingData {
  user_email: string;
  category_ids: string;
  name: string;
  email: string;
  second_email: string;
  phone_number: string;
  second_phone_no: string;
  country_id: string;
  state_id: string;
  city_id: string;
  area_id: string;
  address: string;
  pincode: string;
  latitude: string;
  longitude: string;
  website: string;
  price: string;
  time_duration: string;
  approved: boolean;
  listing_type: string;
  contact_person: string;
  listing_image?: string;
  cover_image?: string;
  mobile_cover_image?: string;
}

interface importListingData {
  listing_unique_id: string;
  category_ids: string;
  name: string;
  email: string;
  second_email: string;
  phone_number: string;
  second_phone_no: string;
  country_id: string;
  state_id: string;
  city_id: string;
  area_id: string;
  address: string;
  pincode: string;
  latitude: string;
  longitude: string;
  website: string;
  price: string;
  time_duration: string;
  approved: boolean;
  listing_type: string;
  contact_person: string;
  listing_image?: string;
  cover_image?: string;
  mobile_cover_image?: string;
}

interface importUserListingData {
  user_email: string;
  listing_unique_id: string;
  category_ids: string;
  name: string;
  email: string;
  second_email: string;
  phone_number: string;
  second_phone_no: string;
  country_id: string;
  state_id: string;
  city_id: string;
  area_id: string;
  address: string;
  pincode: string;
  latitude: string;
  longitude: string;
  website: string;
  price: string;
  time_duration: string;
  approved: boolean;
  listing_type: string;
  contact_person: string;
}

interface importListingReviewData {
  listing_name: string;
  user_name: string;
  rating: string;
  comment: string;
}

export const deleteAllListings = async (req: Request, res: Response) => {
  try {
    const result = await ListingsSchema.deleteMany({});

    if (result.deletedCount === 0) {
      return ErrorResponse(res, "No listings found to delete.");
    }
    await storeUserActionActivity(req.user.userId, "Listing", "Delete", `Delete All listing `);
    return successResponse(res, `Successfully deleted all listings.`, result.deletedCount);
  } catch (error) {
    return ErrorResponse(res, "An error occurred while deleting all listings.");
  }
};

export const importCategoryWiseListing = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
    const baseUploadDir = "uploads/listing/";
    const mainLIstinImageDir = "uploads/listing_main_image/";
    const data: importListingData[] = rawData.map((item) => {
      const listingId = String(item["Listing Id"]);
      const uploadDir = listingId ? path.join(baseUploadDir, listingId, "/") : baseUploadDir;

      return {
        listing_unique_id: String(item["Listing Id"] || ""),
        category_ids: String(item["Categories"] || ""),
        name: String(item["Company"] || ""),
        description: String(item["Description"] || ""),
        email: String(item["Email address"] || ""),
        second_email: String(item["Email address Two"] || ""),
        phone_number: String(item["Phone Number"] || ""),
        second_phone_no: String(item["Phone Number Two"] || ""),
        country_id: String(item["Country"] || ""),
        state_id: String(item["State"] || ""),
        city_id: String(item["City"] || ""),
        area_id: String(item["Area"] || ""),
        address: String(item["Address"] || ""),
        pincode: String(item["Pincode"] || ""),
        latitude: String(item["Lattitude"] || ""),
        longitude: String(item["Longitude"] || ""),
        website: String(item["Website"] || ""),
        price: String(item["Price"] || ""),
        time_duration: String(item["Time Duration"] || ""),
        approved: item["Verified"] === "Yes",
        listing_type: String(item["Paid"] || ""),
        contact_person: String(item["Contact Person Name"] || ""),
        listing_image: item["Listing Image"]
          ? mainLIstinImageDir + String(item["Listing Image"] || "")
          : "",
        cover_image: item["Desktop Cover Image"] ? uploadDir + item["Desktop Cover Image"] : "",
        mobile_cover_image: item["Mobile Cover Image"]
          ? uploadDir + String(item["Mobile Cover Image"] || "")
          : ""
      };
    });

    const totalRecords = data.length;
    const avgTimePerRecord = 0.05;
    const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    const checkAfterMinutes = estimatedMinutes + 1;
    const startResult = await insertOrUpdateExportTaskService(
      "Category Wise Listing Import",
      "processing"
    );
    // ✅ Respond immediately
    res.status(200).json({
      message: `Your category-wise listing file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
    });

    // ✅ Background processing
    setTimeout(async () => {
      try {
        const loginUser = req.user;
        const chunkSize = 100;

        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);

          await new Promise((resolve, reject) => {
            importCategoryListingDataModel(loginUser, chunk, (error: any, result: any) => {
              if (error) {
                console.error("Chunk import error:", error);
                return reject(error);
              }
              resolve(result);
            });
          });
        }
        await storeUserActionActivity(
          req.user.userId,
          "Listing",
          "Import",
          `Import listing category wise data!`
        );
        console.log("✅ Category-wise listing background import completed.");
        const startResult = await insertOrUpdateExportTaskService(
          "Category Wise Listing Import",
          "completed"
        );
      } catch (err) {
        console.error("❌ Error during background import:", err);
      }
    }, 100);
  } catch (error: any) {
    console.error("❌ Category-wise listing import failed:", error);
    return res.status(500).json({ message: "Error importing listings", error: error.message });
  }
};

export const getAllListingList = async (req: Request, res: Response) => {
  try {
    const { search = "" } = req.query;

    const users = await getAllListingModel(search as string);

    return successResponse(res, "get admin User list successfully", users);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const categoryWiseExport = async (req: Request, res: Response) => {
  try {
    const { category_id } = req.params;

    if (!category_id || typeof category_id !== "string") {
      return res.status(400).json({ message: "Invalid category_id" });
    }

    const categoryIdsArray = category_id.split(",").map((id) => Number(id.trim()));
    const filter = { category_ids: { $in: categoryIdsArray } };

    const [categoryDetails, listings] = await Promise.all([
      categorySchema.find({ unique_id: category_id }).lean(),
      ListingsSchema.aggregate([
        { $match: filter },
        { $sort: { sortingOrder: -1 } },
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
            from: "cities",
            localField: "city_id",
            foreignField: "unique_id",
            as: "city_id"
          }
        },
        {
          $lookup: {
            from: "countries",
            localField: "country_id",
            foreignField: "unique_id",
            as: "country_id"
          }
        },
        {
          $lookup: {
            from: "states",
            localField: "state_id",
            foreignField: "unique_id",
            as: "state_id"
          }
        },
        {
          $lookup: {
            from: "areas",
            localField: "area_id",
            foreignField: "unique_id",
            as: "area_id"
          }
        },
        {
          $project: {
            _id: 1,
            listing_unique_id: 1,
            name: 1,
            description: 1,
            email: 1,
            second_email: 1,
            phone_number: 1,
            second_phone_no: 1,
            category_ids: 1,
            city_id: { $arrayElemAt: ["$city_id", 0] },
            country_id: { $arrayElemAt: ["$country_id", 0] },
            state_id: { $arrayElemAt: ["$state_id", 0] },
            area_id: { $arrayElemAt: ["$area_id", 0] },
            address: 1,
            pincode: 1,
            latitude: 1,
            longitude: 1,
            website: 1,
            price: 1,
            time_duration: 1,
            approved: 1,
            listing_type: 1,
            contact_person: 1,
            listing_image: 1,
            cover_image: 1,
            mobile_cover_image: 1
          }
        }
      ])
    ]);

    if (!categoryDetails || categoryDetails.length === 0) {
      return res.status(404).json({ message: "Category not found aasdd!" });
    }

    const headers = {
      "Listing Id": "N/A",
      Categories: "N/A",
      Company: "N/A",
      Description: "N/A",
      "Email address": "N/A",
      "Email address Two": "N/A",
      "Phone Number": "N/A",
      "Phone Number Two": "N/A",
      City: "All",
      Country: "N/A",
      State: "N/A",
      Area: "N/A",
      Address: "N/A",
      Pincode: "N/A",
      Latitude: "N/A",
      Longitude: "N/A",
      Website: "N/A",
      Price: "N/A",
      "Time Duration": "N/A",
      Verified: "No",
      Paid: "No",
      "Contact Person Name": "N/A",
      "Listing Image": "N/A",
      "Desktop Cover Image": "N/A",
      "Mobile Cover Image": "N/A",
      "Is Featured": "N/A",
      "Is Premium": "N/A"
    };

    const listingsData =
      listings.length > 0
        ? await Promise.all(
            listings.map(async (listing: any) => {
              let categoryNames = listing?.category_ids?.map((cat: any) => cat.name) || [];

              if (categoryIdsArray.length > 0) {
                categoryNames = listing.category_ids
                  .filter((cat: any) => categoryIdsArray.includes(cat._id.toString()))
                  .map((cat: any) => cat.name);
              }
              const reviewPromise = ListingWiseReviewList(listing._id, 1, 10);
              const listing_review_list = await Promise.all([reviewPromise]);
              let isFeatured = false;
              const existingListing = await FeaturedListing.findOne({
                listing_id: listing.listing_unique_id
              }).lean();
              if (existingListing) {
                isFeatured = true;
              }

              let isPremium = false;
              const existingPremiumListing = await PremiumListing.findOne({
                listing_id: listing.listing_unique_id
              }).lean();
              if (existingPremiumListing) {
                isPremium = true;
              }

              console.log("categoryDetailscategoryDetails", categoryDetails);
              return {
                "Listing Id": listing?.listing_unique_id || "N/A",
                Categories: categoryDetails.map((cat) => cat.name).join(", ") || "N/A",
                Company: listing?.name || "N/A",
                Description: listing?.description || "N/A",
                "Email address": listing?.email || "N/A",
                "Email address Two": listing?.second_email || "N/A",
                "Phone Number": listing?.phone_number || "N/A",
                "Phone Number Two": listing?.second_phone_no || "N/A",
                City: Array.isArray(listing?.city_id)
                  ? listing.city_id.map((c: any) => c.name).join(", ")
                  : (listing.city_id as { name?: string })?.name || "All",
                Country: (listing.country_id as { name?: string })?.name ?? "N/A",
                State: (listing.state_id as { name?: string })?.name ?? "N/A",
                Area: (listing.area_id as { name?: string })?.name ?? "N/A",
                Address: listing?.address || "N/A",
                Pincode: listing?.pincode || "N/A",
                Latitude: listing?.latitude || "N/A",
                Longitude: listing?.longitude || "N/A",
                Website: listing?.website || "N/A",
                Price: listing?.price || "N/A",
                "Time Duration": listing?.time_duration || "N/A",
                Verified: listing?.approved ? "Yes" : "No",
                Paid: listing?.listing_type === "Free" ? "No" : "Yes",
                "Contact Person Name": listing?.contact_person || "N/A",
                "Listing Image":
                  listing?.listing_image &&
                  listing?.listing_image !== "null" &&
                  listing?.listing_image !== "N/A"
                    ? path.basename(listing?.listing_image)
                    : "",
                "Desktop Cover Image":
                  listing?.cover_image &&
                  listing?.cover_image !== "null" &&
                  listing?.cover_image !== "N/A" &&
                  listing?.cover_image !== ""
                    ? path.basename(listing?.cover_image)
                    : "",
                "Mobile Cover Image":
                  listing?.mobile_cover_image &&
                  listing?.mobile_cover_image !== "null" &&
                  listing?.mobile_cover_image !== "N/A" &&
                  listing?.mobile_cover_image !== ""
                    ? path.basename(listing?.mobile_cover_image)
                    : "",
                "Average Rating":
                  (listing_review_list && listing_review_list[0]?.averageRating) || 0,
                "Is Featured": isFeatured ? "Yes" : "No",
                "Is Premium": isPremium ? "Yes" : "No"
              };
            })
          )
        : [headers];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(listingsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Disposition", "attachment; filename=categorywise_listings.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelBuffer);
  } catch (error: any) {
    console.error("Error exporting listings:", error);
    return res.status(500).json({ message: "Error exporting listings", error: error.message });
  }
};

export const userAllListingList = async (req: Request, res: Response) => {
  try {
    const { search = "" } = req.query;

    const users = await getUserAllListingModel(req.user, search as string);

    return successResponse(res, "get admin User list successfully", users);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const addAdminListingReview = async (req: Request, res: Response) => {
  try {
    const categories = await storeListingReviewModel(req.body, (error: any, result: any) => {
      if (error) {
        ErrorResponse(res, error.message);
      }
      storeUserActionActivity(req.user.userId, "Listing", "Create", `Add listing review data!`);
      return successResponse(res, "Listing review add in database successfully", result);
    });
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const importListingReview = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    const data: importListingReviewData[] = rawData.map((item) => ({
      listing_name: String(item["Listing Name"] || ""),
      user_name: String(item["User Name"] || ""),
      rating: String(item["Rating"] || ""),
      comment: String(item["Comment"] || "")
    }));

    // Calculate time
    const totalRecords = data.length;
    const avgTimePerRecord = 0.01; // seconds per row
    const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    const checkAfterMinutes = estimatedMinutes + 1;

    // Send immediate response
    res.status(200).json({
      message: `Your file with ${totalRecords} listing review(s) is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
    });

    // Background processing
    setTimeout(() => {
      importListingReviewDataModel(req.user, data, (error: any, result: any) => {
        if (error) {
          console.error("Import error:", error.message);
        } else {
          console.log("Listing reviews stored successfully:", result);
        }
      });
    }, 100);
    await storeUserActionActivity(
      req.user.userId,
      "Listing",
      "Import",
      `Import listing review data!`
    );
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Error importing listing reviews", error: error.message });
  }
};

export const deleteReviewList = async (req: Request, res: Response) => {
  try {
    const { review_ids } = req.body;

    if (!review_ids || !Array.isArray(review_ids) || review_ids.length === 0) {
      return ErrorResponse(res, "Please provide at least one valid Quotation ID.");
    }

    const result = await ListingReviewSchema.deleteMany({ _id: { $in: review_ids } });

    if (result.deletedCount === 0) {
      return ErrorResponse(res, "No quotation found with the provided IDs.");
    }

    return successResponse(
      res,
      `Successfully deleted  Listings review (ies).`,
      result.deletedCount
    );
  } catch (error) {
    return ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const storeListingData = async (req: Request, res: Response) => {
  try {
    const files = req.files as FileWithBuffer[];

    await storeListingModel(req.user, req.body, async (error: any, result: any) => {
      if (error) {
        ErrorResponse(res, error.message);
      }
      const uploadDir = `uploads/listing/${result.listing_unique_id}/`;
      const mainLIstinImageDir = "uploads/listing_main_image/";

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        fs.mkdirSync(mainLIstinImageDir, { recursive: true });
      }

      const image_details: any = {};
      if (files && files.length > 0) {
        for (const file of files) {
          const field_name = file.fieldname;
          let savePath = await convertToWebpAndSave(
            file.buffer,
            file.originalname,
            field_name === "listing_image" ? mainLIstinImageDir : uploadDir
          );

          image_details[field_name] = savePath;
        }
      }
      await ListingsSchema.updateOne({ _id: result._id }, { $set: image_details });

      storeUserActionActivity(req.user.userId, "Listing", "Create", `Create new listing!`);
      return successResponse(res, "Listuing stored in Database successfully", result);
    });
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const updateListingData = async (req: Request, res: Response) => {
  try {
    const files = req.files as FileWithBuffer[];

    const blogToUpdate = await ListingsSchema.findById(req.body.listing_id);
    if (!blogToUpdate) {
      return ErrorResponse(res, "Listing not found");
    }

    const mainLIstinImageDir = "uploads/listing_main_image/";
    const uploadDir = `uploads/listing/${blogToUpdate.listing_unique_id}/`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of files) {
      const field_name = file.fieldname;

      // Convert to webp and save
      const savePath = await convertToWebpAndSave(
        file.buffer,
        file.originalname,
        field_name === "listing_image" ? mainLIstinImageDir : uploadDir
      );
      req.body[field_name] = savePath;

      // Delete old image if field exists
      const oldImage = (blogToUpdate as any)[field_name];
      if (oldImage) {
        const oldImagePath = path.join(__dirname, "../../../../", oldImage);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (error) {
            console.error(`Error deleting old image (${field_name}):`, error);
            return ErrorResponse(res, `Failed to delete old ${field_name} image.`);
          }
        }
      }
    }

    updateListingModel(req.user, req.body, (error: any, result: any) => {
      if (error) {
        return ErrorResponse(res, error.message);
      }
      return successResponse(res, "Listing updated in Database successfully", result);
    });
  } catch (error) {
    console.log(error);
    ErrorResponse(res, "An error occurred during listing update.");
  }
};

export const listingBanners = async (req: Request, res: Response) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categories = await listingBannersList(search as string, pageNum, limitNum);
    return successResponse(res, "get category list successfully", categories);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const deleteDuplicateListing = async (req: Request, res: Response) => {
  try {
    const categories = await deleteDuplicateListingModel();
    await storeUserActionActivity(
      req.user.userId,
      "Listing",
      "Delete",
      `Delete Duplicate listing details!`
    );
    return successResponse(res, "duplicate entry deleted successfully", categories);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const updateListingBanners = async (req: Request, res: Response) => {
  try {
    const files = req.files as FileWithBuffer[];
    const blogToUpdate = await ListingsSchema.findById(req.body.listing_id);
    const uploadDir = `uploads/listing/${blogToUpdate?.listing_unique_id}/`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const field_name = file.fieldname;
        let savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
        req.body[field_name] = savePath;
      }
    }
    

    if (req.body.cover_image) {
      if (!blogToUpdate) {
        return ErrorResponse(res, "Blog not found");
      }
      const oldImage = blogToUpdate.cover_image;
      if (oldImage) {
        const oldImagePath = path.join(
          __dirname,
          "../../../../",
          uploadDir,
          path.basename(oldImage as string)
        );

        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (error) {
            console.error("Error deleting old image:", error);
            return ErrorResponse(res, "Failed to delete old image.");
          }
        }
      }
    }

    if (req.body.mobile_cover_image) {
      if (!blogToUpdate) {
        return ErrorResponse(res, "Blog not found");
      }
      const oldImage = blogToUpdate.mobile_cover_image;
      if (oldImage) {
        const oldImagePath = path.join(__dirname, "../../../../", oldImage as string);        

        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (error) {
            console.error("Error deleting old image:", error);
            return ErrorResponse(res, "Failed to delete old image.");
          }
        }
      }
    }
    await storeUserActionActivity(
      req.user.userId,
      "Listing",
      "Update",
      `some listing banner updated`
    );

    await updateListingBannersList(req.body, (error: any, result: any) => {
      if (error) {
        ErrorResponse(res, error.message);
      }
      return successResponse(res, "Listuing stored in Database successfully", result);
    });
  } catch (error) {
    console.log(error);
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getListingReviewList = async (req: Request, res: Response) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categories = await ListingReviewList(search as string, pageNum, limitNum);
    return successResponse(res, "get category list successfully", categories);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getListingList = async (req: Request, res: Response) => {
  try {
    const { search = "", page = 1, limit = 10, type = 2 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categories = await ListingList(search as string, pageNum, limitNum);
    return successResponse(res, "get listing list successfully", categories);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getUserListingList = async (req: Request, res: Response) => {
  try {
    const { search = "", page = 1, limit = 10, type = 2 } = req.query;
    const user_email = req.user.email;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categories = await UserListingList(
      user_email as string,
      search as string,
      pageNum,
      limitNum
    );
    return successResponse(res, "get category list successfully", categories);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const listingDetails = async (req: Request, res: Response) => {
  try {
    const { listing_id } = req.params;

    listingDetail(listing_id as string, (error: any, result: any) => {
      if (error) {
        console.error("Error:", error);
        return ErrorResponse(res, error.message);
      }

      return successResponse(res, "Listing details", result);
    });
  } catch (error) {
    console.error("Error:", error);
    ErrorResponse(res, "An error occurred while fetching blog details.");
  }
};

export const deleteListings = async (req: Request, res: Response) => {
  try {
    const { listing_ids } = req.body;

    if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
      return ErrorResponse(res, "Please provide at least one valid Quotation ID.");
    }

    const result = await ListingsSchema.deleteMany({ _id: { $in: listing_ids } });

    if (result.deletedCount === 0) {
      return ErrorResponse(res, "No quotation found with the provided IDs.");
    }

    await storeUserActionActivity(req.user.userId, "Listing", "Delete", `Delete listing details!`);

    return successResponse(res, `Successfully deleted  Listings(ies).`, result.deletedCount);
  } catch (error) {
    return ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const listingsStatusUpdate = async (req: Request, res: Response) => {
  try {
    const update_status = await updateListingStatusModel(
      req.user,
      req.body,
      (error: any, result: any) => {
        if (error) {
          ErrorResponse(res, error.message);
        }

        return successResponse(res, "Listing Status updated successfully", result);
      }
    );
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const listingExportFormetDownload = async (req: Request, res: Response) => {
  try {
    const workbook = XLSX.utils.book_new();
    const headers = [
      {
        "User Email": "",
        Categories: "",
        Company: "",
        Description: "",
        "Email address": "",
        "Email address Two": "",
        "Phone Number": "",
        "Phone Number Two": "",
        Country: "",
        State: "",
        City: "",
        Area: "",
        Address: "",
        Pincode: "",
        Lattitude: "",
        Longitude: "",
        Website: "",
        Price: "",
        "Time Duration": "",
        Verified: "",
        Paid: "",
        "Contact Person Name": "",
        "Listing Image": "",
        "Desktop Cover Image": "",
        "Mobile Cover Image": "",
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(headers, {
      header: [
        "User Email",
        "Categories",
        "Company",
        "Description",
        "Email address",
        "Email address Two",
        "Phone Number",
        "Phone Number Two",
        "Country",
        "State",
        "City",
        "Area",
        "Address",
        "Pincode",
        "Lattitude",
        "Longitude",
        "Website",
        "Price",
        "Time Duration",
        "Verified",
        "Paid",
        "Contact Person Name",
        "Listing Image",
        "Desktop Cover Image",
        "Mobile Cover Image",
      ],
      skipHeader: false
    });

    worksheet["!cols"] = [
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 30 },
      { wch: 40 },
      { wch: 40 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 60 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "CategorySEO");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="listing_import_formet.xlsx"');

    res.send(buffer);
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const importUserListing = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    const baseUploadDir = "uploads/listing/";
    const mainLIstinImageDir = "uploads/listing_main_image/";

    const data: importUserListingData[] = rawData.map((item) => {
      const listingId = String(item["Listing Id"]);
      const uploadDir = listingId ? path.join(baseUploadDir, listingId, "/") : baseUploadDir;
      return {
        user_email: String(item["User Email"] || ""),
        listing_unique_id: String(item["Listing Id"] || ""),
        category_ids: String(item["Categories"] || ""),
        name: String(item["Company"] || ""),
        description: String(item["Description"] || ""),
        email: String(item["Email address"] || ""),
        second_email: String(item["Email address Two"] || ""),
        phone_number: String(item["Phone Number"] || ""),
        second_phone_no: String(item["Phone Number Two"] || ""),
        country_id: String(item["Country"] || ""),
        state_id: String(item["State"] || ""),
        city_id: String(item["City"] || ""),
        area_id: String(item["Area"] || ""),
        address: String(item["Address"] || ""),
        pincode: String(item["Pincode"] || ""),
        latitude: String(item["Lattitude"] || ""),
        longitude: String(item["Longitude"] || ""),
        website: String(item["Website"] || ""),
        price: String(item["Price"] || ""),
        time_duration: String(item["Time Duration"] || ""),
        approved: item["Verified"] === "Yes",
        listing_type: String(item["Paid"] || ""),
        contact_person: String(item["Contact Person Name"] || ""),
        listing_image: item["Listing Image"]
          ? mainLIstinImageDir + String(item["Listing Image"] || "")
          : "",
        cover_image: item["Desktop Cover Image"] ? uploadDir + item["Desktop Cover Image"] : "",
        mobile_cover_image: item["Mobile Cover Image"]
          ? uploadDir + String(item["Mobile Cover Image"] || "")
          : ""
      };
    });

    const totalRecords = data.length;
    const avgTimePerRecord = 0.05; // seconds (adjust if needed)
    const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    const checkAfterMinutes = estimatedMinutes + 1;

    await importFileStatusSchema.create({
      module_name: "Listing",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const startResult = await insertOrUpdateExportTaskService(
      "User Wise Listing Import",
      "processing"
    );
    // ✅ Immediate response to user
    res.status(200).json({
      message: `Your listing file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
    });

    // ✅ Background processing
    setTimeout(async () => {
      try {
        const loginUser = req.user; // must be available from auth middleware

        const chunkSize = 100; // process in smaller chunks
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          console.log(chunk);
          await new Promise((resolve, reject) => {
            importUserListingDataModel(loginUser, chunk, (error: any, result: any) => {
              if (error) {
                console.error("Chunk import error:", error);
                return reject(error);
              }
              resolve(result);
            });
          });
        }
        await importFileStatusSchema.deleteOne({ module_name: "Listing" });
        console.log("✅ Listing background import completed.");
        const startResult = await insertOrUpdateExportTaskService(
          "User Wise Listing Import",
          "completed"
        );
      } catch (err) {
        console.error("❌ Error during background import:", err);
      }
    }, 100);
  } catch (error: any) {
    console.error("❌ Listing import failed:", error);
    return res.status(500).json({ message: "Error importing listings", error: error.message });
  }
};

export const importListing = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
    const baseUploadDir = "uploads/listing/";
    const mainLIstinImageDir = "uploads/listing_main_image/";

    // Set upload directory path with listing ID for each record
    const data: importListingData[] = rawData.map((item) => {
      const listingId = String(item["Listing Id"]);
      const uploadDir = listingId ? path.join(baseUploadDir, listingId, "/") : baseUploadDir;
      return {
        listing_unique_id: String(item["Listing Id"] || ""),
        category_ids: String(item["Categories"] || ""),
        name: String(item["Company"] || ""),
        description: String(item["Description"] || ""),
        email: String(item["Email address"] || ""),
        second_email: String(item["Email address Two"] || ""),
        phone_number: String(item["Phone Number"] || ""),
        second_phone_no: String(item["Phone Number Two"] || ""),
        country_id: String(item["Country"] || ""),
        state_id: String(item["State"] || ""),
        city_id: String(item["City"] || ""),
        area_id: String(item["Area"] || ""),
        address: String(item["Address"] || ""),
        pincode: String(item["Pincode"] || ""),
        latitude: String(item["Lattitude"] || ""),
        longitude: String(item["Longitude"] || ""),
        website: String(item["Website"] || ""),
        price: String(item["Price"] || ""),
        time_duration: String(item["Time Duration"] || ""),
        approved: item["Verified"] === "Yes",
        listing_type: String(item["Paid"] || ""),
        contact_person: String(item["Contact Person Name"] || ""),
        listing_image: item["Listing Image"]
          ? mainLIstinImageDir + String(item["Listing Image"] || "")
          : "",
        cover_image: item["Desktop Cover Image"] ? uploadDir + item["Desktop Cover Image"] : "",
        mobile_cover_image: item["Mobile Cover Image"]
          ? uploadDir + String(item["Mobile Cover Image"] || "")
          : ""
      };
    });
    
    const totalRecords = data.length;
    const avgTimePerRecord = 0.05; // seconds (adjust if needed)
    const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    const checkAfterMinutes = estimatedMinutes + 1;

    await importFileStatusSchema.create({
      module_name: "Listing",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const startResult = await insertOrUpdateExportTaskService("Listing Import", "processing");

    // ✅ Immediate response to user
    res.status(200).json({
      message: `Your listing file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
    });

    // ✅ Background processing
    setTimeout(async () => {
      try {
        const loginUser = req.user; // must be available from auth middleware

        const chunkSize = 100; // process in smaller chunks
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);

          await new Promise((resolve, reject) => {
            importListingDataModel(loginUser, chunk, (error: any, result: any) => {
              if (error) {
                console.error("Chunk import error:", error);
                return reject(error);
              }
              resolve(result);
            });
          });
        }
        await importFileStatusSchema.deleteOne({ module_name: "Listing" });
        console.log("✅ Listing background import completed.");
        const startResult = await insertOrUpdateExportTaskService("Listing Import", "completed");
      } catch (err) {
        console.error("❌ Error during background import:", err);
      }
    }, 100);
  } catch (error: any) {
    console.error("❌ Listing import failed:", error);
    return res.status(500).json({ message: "Error importing listings", error: error.message });
  }
};

export const importFreshListing = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
    const baseUploadDir = "uploads/listing/";
    const mainLIstinImageDir = "uploads/listing_main_image/";

    // Set upload directory path with listing ID for each record
    const data: importFreshListingData[] = rawData.map((item) => {
      const listingId = String(item["Listing Id"]);
      const uploadDir = listingId ? path.join(baseUploadDir, listingId, "/") : baseUploadDir;
      return {
        user_email: String(item["User Email"] || ""),
        category_ids: String(item["Categories"] || ""),
        name: String(item["Company"] || ""),
        description: String(item["Description"] || ""),
        email: String(item["Email address"] || ""),
        second_email: String(item["Email address Two"] || ""),
        phone_number: String(item["Phone Number"] || ""),
        second_phone_no: String(item["Phone Number Two"] || ""),
        country_id: String(item["Country"] || ""),
        state_id: String(item["State"] || ""),
        city_id: String(item["City"] || ""),
        area_id: String(item["Area"] || ""),
        address: String(item["Address"] || ""),
        pincode: String(item["Pincode"] || ""),
        latitude: String(item["Lattitude"] || ""),
        longitude: String(item["Longitude"] || ""),
        website: String(item["Website"] || ""),
        price: String(item["Price"] || ""),
        time_duration: String(item["Time Duration"] || ""),
        approved: item["Verified"] === "Yes",
        listing_type: String(item["Paid"] || ""),
        contact_person: String(item["Contact Person Name"] || ""),
        listing_image: item["Listing Image"]
          ? mainLIstinImageDir + String(item["Listing Image"] || "")
          : "",
        cover_image: item["Desktop Cover Image"] ? uploadDir + item["Desktop Cover Image"] : "",
        mobile_cover_image: item["Mobile Cover Image"]
          ? uploadDir + String(item["Mobile Cover Image"] || "")
          : ""
      };
    });
    const totalRecords = data.length;
    const avgTimePerRecord = 0.05; // seconds (adjust if needed)
    const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    const checkAfterMinutes = estimatedMinutes + 1;

    const startResult = await insertOrUpdateExportTaskService("Fresh Listing Import", "processing");

    // ✅ Immediate response to user
    res.status(200).json({
      message: `Your listing file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
    });

    // ✅ Background processing
    setTimeout(async () => {
      try {
        const loginUser = req.user; // must be available from auth middleware

        const chunkSize = 100; // process in smaller chunks
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);

          await new Promise((resolve, reject) => {
            importFreshListingDataModel(loginUser, chunk, (error: any, result: any) => {
              if (error) {
                console.error("Chunk import error:", error);
                return reject(error);
              }
              resolve(result);
            });
          });
        }
        console.log("✅ Listing background import completed.");
        const startResult = await insertOrUpdateExportTaskService("Fresh Listing Import", "completed");
      } catch (err) {
        console.error("❌ Error during background import:", err);
      }
    }, 100);
  } catch (error: any) {
    console.error("❌ Listing import failed:", error);
    return res.status(500).json({ message: "Error importing listings", error: error.message });
  }
};

export const exportListing = async (req: Request, res: Response) => {
  try {
    const { category_id, limit } = req.query;

    const filter: Record<string, any> = {};
    let categoryIdsArray: string[] = [];

    // Parse category_id if provided
    if (category_id && typeof category_id === "string") {
      categoryIdsArray = category_id.split(",").map((id) => id.trim());
      const objectIdArray = categoryIdsArray.map((id) => new mongoose.Types.ObjectId(id));
      filter.category_ids = { $in: objectIdArray };
    }

    // Set export limit (default 10000)
    const exportLimit = Number(limit) || 10000;
    // const exportLimit =  10;

    const listings = await ListingsSchema.aggregate([
      { $match: filter },
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
          from: "cities",
          localField: "city_id",
          foreignField: "unique_id",
          as: "city_id"
        }
      },
      {
        $lookup: {
          from: "countries",
          localField: "country_id",
          foreignField: "unique_id",
          as: "country_id"
        }
      },
      {
        $lookup: {
          from: "states",
          localField: "state_id",
          foreignField: "unique_id",
          as: "state_id"
        }
      },
      {
        $lookup: {
          from: "areas",
          localField: "area_id",
          foreignField: "unique_id",
          as: "area_id"
        }
      },
      {
        $project: {
          listing_unique_id: 1,
          name: 1,
          description: 1,
          email: 1,
          second_email: 1,
          phone_number: 1,
          second_phone_no: 1,
          city_id: { $arrayElemAt: ["$city_id", 0] },
          country_id: { $arrayElemAt: ["$country_id", 0] },
          state_id: { $arrayElemAt: ["$state_id", 0] },
          area_id: { $arrayElemAt: ["$area_id", 0] },
          address: 1,
          pincode: 1,
          latitude: 1,
          longitude: 1,
          website: 1,
          price: 1,
          time_duration: 1,
          approved: 1,
          listing_type: 1,
          contact_person: 1,
          category_ids: 1,
          sortingOrder: 1,
          listing_image: 1,
          cover_image: 1,
          mobile_cover_image: 1
        }
      },
      { $sort: { sortingOrder: -1 } },
      { $limit: exportLimit }
    ]);

    // Format data
    const listingsData = await Promise.all(
      listings.map(async (listing) => {
        let categoryNames = listing?.category_ids?.map((cat: any) => cat.name) || [];
        const reviewPromise = ListingWiseReviewList(listing._id, 1, 10);
        const listing_review_list = await Promise.all([reviewPromise]);
        let isFeatured = false;
        const existingListing = await FeaturedListing.findOne({
          listing_id: listing.listing_unique_id
        }).lean();
        if (existingListing) {
          isFeatured = true;
        }

        let isPremium = false;
        const existingPremiumListing = await PremiumListing.findOne({
          listing_id: listing.listing_unique_id
        }).lean();
        if (existingPremiumListing) {
          isPremium = true;
        }
        if (categoryIdsArray.length > 0) {
          categoryNames = listing.category_ids
            .filter((cat: any) => categoryIdsArray.includes(cat._id.toString()))
            .map((cat: any) => cat.name);
        }

        return {
          "Listing Id": listing?.listing_unique_id || "N/A",
          Categories: categoryNames.length ? categoryNames.join(", ") : "N/A",
          Company: listing?.name || "N/A",
          Description: listing?.description || "N/A",
          "Email address": listing?.email || "N/A",
          "Email address Two": listing?.second_email || "N/A",
          "Phone Number": listing?.phone_number || "N/A",
          "Phone Number Two": listing?.second_phone_no || "N/A",
          City: Array.isArray(listing?.city_id)
            ? listing.city_id.map((c: any) => c.name).join(", ")
            : (listing.city_id as { name?: string })?.name || "All",
          Country: (listing.country_id as { name?: string })?.name ?? "N/A",
          State: (listing.state_id as { name?: string })?.name ?? "N/A",
          Area: (listing.area_id as { name?: string })?.name ?? "N/A",
          Address: listing?.address || "N/A",
          Pincode: listing?.pincode || "N/A",
          Latitude: listing?.latitude || "N/A",
          Longitude: listing?.longitude || "N/A",
          Website: listing?.website || "N/A",
          Price: listing?.price || "N/A",
          "Time Duration": listing?.time_duration || "N/A",
          Verified: listing?.approved ? "Yes" : "No",
          Paid: listing?.listing_type === "Free" ? "No" : "Yes",
          "Contact Person Name": listing?.contact_person || "N/A",
          "Listing Image":
            listing?.listing_image &&
            listing?.listing_image !== "null" &&
            listing?.listing_image !== "N/A"
              ? path.basename(listing?.listing_image)
              : "",
          "Desktop Cover Image":
            listing?.cover_image &&
            listing?.cover_image !== "null" &&
            listing?.cover_image !== "N/A" &&
            listing?.cover_image !== ""
              ? path.basename(listing?.cover_image)
              : "",
          "Mobile Cover Image":
            listing?.mobile_cover_image &&
            listing?.mobile_cover_image !== "null" &&
            listing?.mobile_cover_image !== "N/A" &&
            listing?.mobile_cover_image !== ""
              ? path.basename(listing?.mobile_cover_image)
              : "",
          "Average Rating": (listing_review_list && listing_review_list[0]?.averageRating) || 0,
          "Is Featured": isFeatured ? "Yes" : "No",
          "Is Premium": isPremium ? "Yes" : "No"
        };
      })
    );

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(listingsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Set headers
    res.setHeader("Content-Disposition", "attachment; filename=listings.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(excelBuffer);
  } catch (error: any) {
    console.error("Error exporting listings:", error);
    res.status(500).json({ message: "Error exporting listings", error: error.message });
  }
};
