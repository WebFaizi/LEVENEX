import e, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import { storeThemeModel } from "../../domain/models/theme.model";
import { convertToWebpAndSave } from "../../services/imageService";
import {
  updateSettingModel,
  getPremiumRequestList,
  frontendSettingModel,
  clearSettingModel,
  checkRedirectCurrentUrlModel,
  frontendFooterModel,
  frontendAdsModel,
  getExportTasksByModuleName,
} from "../../domain/models/setting.model";
import ThemeSchema from "../../domain/schema/theme.schema";
import SettingSchema from "../../domain/schema/setting.schema";
import userActivity from "../../domain/schema/userActivity.schema";
import subscribersSchema from "../../domain/schema/subscribers.schema";
import categorySearch from "../../domain/schema/categorySearch.schema";
import user_data from "../../domain/schema/user.schema";
import Quotation from "../../domain/schema/quotation.schema";
import ListingSchema from "../../domain/schema/listing.schema";
import PremiumRequest from "../../domain/schema/premiumRequest.schema";
import ChatBoatUser from "../../domain/schema/chatboatUser.schema";
import { storeUserActionActivity } from "../../services/userActionActivity.service";
import multer from "multer";
import path from "path";
import { env } from "process";
import fs from "fs";

interface FileWithBuffer extends Express.Multer.File {
  buffer: Buffer;
}

const baseURL = env.BASE_URL || "http://localhost:3000";

const upload = multer();

export const checkRedirectCurrentUrl = async (req: Request, res: Response) => {
  try {
    const { from_url } = req.query;

    if (!from_url) {
      return ErrorResponse(res, "from_url is required");
    }

    checkRedirectCurrentUrlModel(from_url as string, (error: any, result: any) => {
      if (error) {
        return ErrorResponse(res, error.message || "Failed to check redirect");
      }
      return successResponse(res, "get Redirect status successfully!", result);
    });
  } catch (error: any) {
    return ErrorResponse(res, "An error occurred while checking the redirect.");
  }
};

export const getFrontendSetting = async (req: Request, res: Response) => {
  try {
    const { current_city_id = "", category_id = "" } = req.query;
    const categories = await frontendSettingModel(current_city_id as string, category_id as string);
    return successResponse(res, "get premium request list successfully", categories);
  } catch (error) {
    return ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getFrontendFooter = async (req: Request, res: Response) => {
  try {
    const { current_city_id, category_id = "" } = req.query;
    const categories = await frontendFooterModel(current_city_id as string, category_id as string);
    return successResponse(res, "get premium request list successfully", categories);
  } catch (error) {
    return ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getFrontendAds = async (req: Request, res: Response) => {
  try {
    const { current_city_id = "", category_id = "" } = req.query;
    const categories = await frontendAdsModel(current_city_id as string, category_id as string);
    return successResponse(res, "get premium request list successfully", categories);
  } catch (error) {
    return ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const clearSetting = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    clearSettingModel(type as string, (error: any, result: any) => {
      if (error) {
        return ErrorResponse(res, error.message);
      }
      if (type == "1") {
        return successResponse(res, "Clear data sucessfully!", []);
      } else {
        return successResponse(res, "Clear cache sucessfully!!", []);
      }
    });
  } catch (error) {
    return ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getPremiumRequest = async (req: Request, res: Response) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categories = await getPremiumRequestList(search as string, pageNum, limitNum);
    return successResponse(res, "get premium request list successfully", categories);
  } catch (error) {
    return ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getAllUserData = async (req: Request, res: Response) => {
  try {
    const User = await user_data.find().sort({ createdAt: -1 });
    return successResponse(res, "Fetched dashboard details successfully!", User);
  } catch (error) {
    console.error("Error in getDashboardDetails:", error);
    return ErrorResponse(res, "An error occurred while fetching dashboard details.");
  }
};

export const getAllListingData = async (req: Request, res: Response) => {
  try {
    const User = await ListingSchema.find().sort({ createdAt: -1 });
    return successResponse(res, "Fetched dashboard details successfully!", User);
  } catch (error) {
    console.error("Error in getDashboardDetails:", error);
    return ErrorResponse(res, "An error occurred while fetching dashboard details.");
  }
};

export const getDashboardDetails = async (req: Request, res: Response) => {
  try {
    const UserActivity = await userActivity.find().sort({ createdAt: -1 }).limit(20);

    const total_user = await user_data.countDocuments();
    const total_seller = await user_data.countDocuments({ role: 2 });
    const pending_seller_approval = await user_data.countDocuments({ role: 2, is_approved: "No" });
    const pending_listing = await ListingSchema.countDocuments({ approved: false });
    const premium_request = await PremiumRequest.countDocuments();
    const live_seller = 0;
    const total_subscriber = await subscribersSchema.countDocuments();
    const quotations = await Quotation.countDocuments();
    const chatboatuser = await ChatBoatUser.countDocuments();
    const listing_view = await ListingSchema.find().sort({ listing_views: -1 }).limit(20);

    const topCategoriesMonthWise = await categorySearch.aggregate([
      {
        $addFields: {
          year: { $year: "$search_date" },
          month: { $month: "$search_date" },
        },
      },
      {
        $group: {
          _id: {
            category_id: "$category_id",
            year: "$year",
            month: "$month",
          },
          searchCount: { $sum: 1 },
        },
      },
      {
        $sort: { searchCount: -1 },
      },
      { $limit: 10 },
      {
        $lookup: {
          from: "categories",
          localField: "_id.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          category_id: "$_id.category_id",
          category_name: "$category.name",
          slug: "$category.slug",
          unique_id: "$category.unique_id",
          searchCount: 1,
          year: "$_id.year",
          month: "$_id.month",
          // Optional: formatted month name
          formatted_month: {
            $concat: [
              {
                $arrayElemAt: [
                  ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                  "$_id.month",
                ],
              },
              ", ",
              { $toString: "$_id.year" },
            ],
          },
        },
      },
    ]);

    const data = {
      pending_seller_approval,
      total_seller,
      total_user,
      pending_listing,
      premium_request,
      quotations,
      live_seller: live_seller,
      total_subscriber,
      chat_boat: chatboatuser,
      login_details: UserActivity,
      listing_view: listing_view,
      topCategories: topCategoriesMonthWise,
    };

    return successResponse(res, "Fetched dashboard details successfully!", data);
  } catch (error) {
    console.error("Error in getDashboardDetails:", error);
    return ErrorResponse(res, "An error occurred while fetching dashboard details.");
  }
};

export const storeTheme = async (req: Request, res: Response) => {
  try {
    storeThemeModel(req.body, (error: any, result: any) => {
      if (error) {
        return ErrorResponse(res, error.message);
      }
      return successResponse(res, "Added Theme successfully!", []);
    });
  } catch (error) {
    console.log(error);
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getTheme = async (req: Request, res: Response) => {
  try {
    const theme = await ThemeSchema.find();

    if (!theme) {
      return ErrorResponse(res, "Theme not found");
    }

    return successResponse(res, "Theme fetched successfully", theme);
  } catch (error) {
    console.error("Error fetching theme:", error);
    ErrorResponse(res, "An error occurred while fetching the theme.");
  }
};

export const getSetting = async (req: Request, res: Response) => {
  try {
    const setting = await SettingSchema.findOne();

    if (!setting) {
      return ErrorResponse(res, "setting not found");
    }

    if (setting.website_logo) {
      setting.website_logo = `${process.env.BASE_URL}/${setting.website_logo}`;
    }
    if (setting.mobile_logo) {
      setting.mobile_logo = `${process.env.BASE_URL}/${setting.mobile_logo}`;
    }
    if (setting.fav_icon) {
      setting.fav_icon = `${process.env.BASE_URL}/${setting.fav_icon}`;
    }
    if (setting.pre_loader) {
      setting.pre_loader = `${process.env.BASE_URL}/${setting.pre_loader}`;
    }
    if (setting.mobile_listing_banner) {
      setting.mobile_listing_banner = `${process.env.BASE_URL}/${setting.mobile_listing_banner}`;
    }
    if (setting.desktop_listing_banner) {
      setting.desktop_listing_banner = `${process.env.BASE_URL}/${setting.desktop_listing_banner}`;
    }

    return successResponse(res, "setting fetched successfully", setting);
  } catch (error) {
    console.error("Error fetching theme:", error);
    ErrorResponse(res, "An error occurred while fetching the theme.");
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const files = req.files as FileWithBuffer[]; // Assuming you have this interface

    const uploadDir = "uploads/website_default_images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convert and save uploaded images as WebP
    if (files && files.length > 0) {
      for (const file of files) {
        const field_name = file.fieldname;
        const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
        req.body[field_name] = savePath;
      }
    }

    // Fetch current setting to delete old images if replaced
    const settingUpdate = await SettingSchema.findOne();

    if (settingUpdate) {
      const imageFields = ["website_logo", "mobile_logo", "fav_icon", "pre_loader", "mobile_listing_banner", "desktop_listing_banner"];

      for (const field of imageFields) {
        if (req.body[field]) {
          const oldImage = (settingUpdate as any)[field];
          if (oldImage && oldImage !== "") {
            const oldImagePath = path.join(__dirname, "../../../../", oldImage);
            if (fs.existsSync(oldImagePath)) {
              try {
                fs.unlinkSync(oldImagePath);
              } catch (err) {
                console.error(`Failed to delete old image for ${field}:`, err);
              }
            }
          }
        }
      }
    }

    // Update settings in DB
    updateSettingModel(req.body, (error: any, result: any) => {
      if (error) {
        return ErrorResponse(res, error.message);
      }
      storeUserActionActivity(req.user.userId, "Setting", "Update", `Updated Website Setting Details successfully`);
      return successResponse(res, "Updated Setting successfully!", []);
    });
  } catch (error) {
    console.error("❌ Error in updateSetting:", error);
    return ErrorResponse(res, "An error occurred during settings update.");
  }
};

export const updateFooterDescription = async (req: Request, res: Response) => {
  try {
    const settingUpdate = await SettingSchema.findOne();
    if (settingUpdate) {
      settingUpdate.footer_description = req.body.footer_description;
      settingUpdate.save();
    }
    return successResponse(res, "Update Footer Description successfully!", []);
  } catch (error) {
    console.log(error);
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const updateDesktopDescription = async (req: Request, res: Response) => {
  try {
    const settingUpdate = await SettingSchema.findOne();
    if (settingUpdate) {
      settingUpdate.desktop_description = req.body.desktop_description;
      settingUpdate.save();
    }
    return successResponse(res, "Update Desktop Description successfully!", []);
  } catch (error) {
    console.log(error);
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const exportedBackgroundProcessList = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const exportTasks = await getExportTasksByModuleName(search, page, limit);
    return successResponse(res, "Export tasks fetched successfully", exportTasks);
  } catch (error) {
    console.error("Error fetching export tasks:", error);
    return ErrorResponse(res, "An error occurred while fetching export tasks.");
  }
};

export const getEmailpermmistion = async (req: Request, res: Response) => {
  try {
    const emailPermmision = await SettingSchema.findOne().select("send_quotation_mail");
    return successResponse(res, "Email permission fetched successfully", emailPermmision);
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const updateEmailPermmision = async (req: Request, res: Response) => {
  try {
    const existingSetting = await SettingSchema.findOne();
    let updatedSetting:any;
  
    if (existingSetting) {
      updatedSetting = await SettingSchema.findByIdAndUpdate(
        existingSetting._id,
        req.body,
        { new: true }
      );
    }
    return successResponse(res, "Email permission updated successfully", updatedSetting);    
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};
