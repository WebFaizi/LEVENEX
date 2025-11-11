import SettingSchema from "../schema/setting.schema";
import ThemeSchema from "../schema/theme.schema";
import areaSchema from "../../domain/schema/area.schema";
import citySchema from "../../domain/schema/city.schema";
import categorySchema from "../../domain/schema/category.schema";
import blogCategorySchema from "../../domain/schema/blogcategory.schema";
import redirectSchema from "../../domain/schema/redircetsUrl.schema";
import chatBoatSchema from "../../domain/schema/chatboat.schema";
import settingSchema from "../../domain/schema/setting.schema";
import premiumRequestSchema from "../schema/premiumRequest.schema";
import homepageSeoSchema from "../schema/homepage_seo.schema";
import ChatBoatUserSchema from "../schema/chatboatUser.schema";
import keywordsSchema from "../schema/keywords.schema";
import mongoose from "mongoose";
import NodeCache from "node-cache";
import slugify from "slugify";
const path = require("path");
const fs = require("fs");
import { getLocationDetails } from "../../services/currentLocation.service";
import { replacePlaceholders } from "../../services/ReplaceText.service";
import getAdsBanners from "../../services/banners.service";
import userActionActivitySchema from "../schema/userActionActivity.schema";
import exportTaskSchema from "../schema/exportTask.schema";
import featuredListingSchema from "../schema/featuredListing.schema";
import productSchema from "../schema/product.schema";
import ListingSEO from "../schema/listingseo.schema";
import subdomaincategoryseoSchema from "../schema/subdomainCategorySeo.schema";
import ListingReview from "../schema/listingReview.schema";
import Quotation from "../schema/quotation.schema";
import PremiumListing from "../schema/premiumListing.schema";
import ChatBoatUser from "../schema/chatboatUser.schema";
import ChatboatListing from "../../domain/schema/chatboat.schema";
import Banners from "../schema/banners.schema";
import BannerTypes from "../schema/bannerTypes.schema";
import JobCategory from "../schema/jobCategory.schema";
import JobApplication from "../schema/jobApplication.schema";
import Jobs from "../schema/jobs.schema";
import RedirectsUrl from "../../domain/schema/redircetsUrl.schema";
import BlogReview from "../schema/blogReview.schema";
import Listings from "../schema/listing.schema";
import UsersOtp from "../schema/usersOtp.schema";
import User from "../schema/user.schema";
import Blog from "../schema/blog.schema";
import BlogCategory from "../schema/blogcategory.schema";
import Subscribers from "../schema/subscribers.schema";
import UserActionActivity from '../schema/userActionActivity.schema'
import UserActivity from '../schema/userActivity.schema'
import IpAddress from "../schema/ipAddress.schema";
import Keywords from "../schema/keywords.schema";
import NewsLetter from "../schema/newsLetter.schema";
import City from "../../domain/schema/city.schema";

interface settingInterface {
  super_admin: string;
  email_for_otp: string;
  contact_email: string;
  quotation_emails: string;
  website_logo: string;
  mobile_logo: string;
  fav_icon: string;
  pre_loader: string;
  mobile_listing_banner: string;
  desktop_listing_banner: string;
  phone_number: string;
  login_page_content: string;
  category_box_links: "regular" | "subdomain";
  sidebar_button_sequence: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  quotation_number: string;
  whatsapp_key: string;
  send_whatsapp_message: "yes" | "no";
  send_quotation_mail: "yes" | "no";
  home_page_layout_style: string;
  premium_testing_emails: string;
  send_mail_to_premium_listing: "yes" | "no";
  theme_id: string;
}

interface ChatBoatListingDataInterface {
  category: string;
  location: string;
  mobile_number: string;
}

interface homeQuery {
  current_location_id: string;
}

// Initialize in-memory cache with a TTL of 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

// Helper function to get data from cache or fetch and cache it
// const getCachedData = async (key: string, fetchFunction: () => Promise<any>) => {
//   const cached = cache.get(key);
//   if (cached) return cached;
//   const data = await fetchFunction();
//   cache.set(key, data);
//   return data;
// };

export const checkRedirectCurrentUrlModel = async (
  from_url: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const redirectEntry = await redirectSchema.findOne({ from_url });

    if (redirectEntry) {
      return callback(null, {
        message: "Redirect found.",
        status: true,
        to_url: redirectEntry.to_url,
      });
    } else {
      return callback(null, {
        message: "No redirect found.",
        status: false,
      });
    }
  } catch (err: any) {
    return callback(
      {
        message: "Failed to check redirect",
        error: err.message || err,
        status: false,
      },
      null
    );
  }
};

export const clearSettingModel = async (
  type: string,
  callback: (error: any, result: any) => void
) => {
  try {
    if (type == "1") {
      const settings = await keywordsSchema.find();

      const updatePromises = settings.map(async (setting: any) => {
        const clearedValues: any = {};

        // Set each field value to an empty string (or null) but keep keys
        Object.keys(setting._doc).forEach((key) => {
          if (key !== "_id" && key !== "__v") {
            clearedValues[key] = ""; // or null or default
          }
        });

        // Delete all collections in parallel
        const collectionsToDelete = [
          Listings, featuredListingSchema, premiumRequestSchema, categorySchema,
          productSchema, ListingSEO, Quotation, ListingReview, 
          subdomaincategoryseoSchema, homepageSeoSchema, PremiumListing,
          ChatBoatUserSchema, ChatBoatUser, ChatboatListing, Banners,
          BannerTypes, JobCategory, JobApplication, Jobs, RedirectsUrl,
          BlogReview, UsersOtp,  Blog, BlogCategory, Subscribers,
          UserActionActivity, UserActivity,IpAddress,NewsLetter,Keywords, User,
        ];
        await Promise.all(
          collectionsToDelete.map((collection) =>
            (collection as any).deleteMany({})
          )
        );
        console.log("delete all data");

        return keywordsSchema.updateOne(
          { _id: setting._id },
          { $set: clearedValues }
        );
      });

      await Promise.all(updatePromises);
    } else {
    }

    return callback(null, {
      success: true,
      message: "Settings cleared successfully.",
    });
  } catch (err: any) {
    return callback(
      {
        success: false,
        message: "Failed to clear settings data",
        error: err.message || err,
      },
      null
    );
  }
};
export const getChatboatListingModel = async (
  ChatBoatListingData: ChatBoatListingDataInterface,
  callback: (error: any, result: any) => void
) => {
  try {
    // Save user if not exists
    const existingUser = await ChatBoatUserSchema.findOne({
      category_ids: Number(ChatBoatListingData.category),
      city_name: ChatBoatListingData.location,
      phone_number: ChatBoatListingData.mobile_number,
    }).lean();

    if (!existingUser) {
      await new ChatBoatUserSchema({
        category_ids: Number(ChatBoatListingData.category),
        city_name: ChatBoatListingData.location,
        phone_number: ChatBoatListingData.mobile_number,
      }).save();
    }

    // Find city data
    let city_data = await citySchema
      .findOne({
        name: { $regex: new RegExp(`^${ChatBoatListingData.location}$`, "i") },
      })
      .lean();

    if (!city_data) {
      city_data = await citySchema.findOne({ name: "All" }).lean();
    }

    if (!city_data) {
      console.log("City not found");
      return callback(null, []);
    }

    console.log("Searching for city_id:", city_data.unique_id, typeof city_data.unique_id);

    const listing_list = await chatBoatSchema.aggregate([
      {
        $match: {
          $or: [
            { city_id: city_data.unique_id },
            { city_id: String(city_data.unique_id) },
            { city_id: Number(city_data.unique_id) },
            { is_city_select_all: true },
          ],
        },
      },
      {
        $addFields: {
          listing_items: {
            $map: {
              input: { $ifNull: ["$listing_id", []] },
              as: "item",
              in: {
                id: {
                  $cond: {
                    if: { $eq: [{ $type: "$$item" }, "object"] },
                    then: "$$item.id",
                    else: "$$item"
                  }
                },
                order: {
                  $cond: {
                    if: { $eq: [{ $type: "$$item" }, "object"] },
                    then: { $ifNull: ["$$item.order", 999] },
                    else: 999
                  }
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          listing_ids: {
            $map: {
              input: "$listing_items",
              as: "item",
              in: "$$item.id"
            }
          }
        }
      },
      {
        $lookup: {
          from: "listings",
          let: { listingIds: "$listing_ids" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$listing_unique_id", "$$listingIds"]
                }
              }
            }
          ],
          as: "listings_data"
        }
      },
      {
        $addFields: {
          listing_id: {
            $map: {
              input: "$listing_items",
              as: "listingItem",
              in: {
                $let: {
                  vars: {
                    matchedListing: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$listings_data",
                            as: "listing",
                            cond: { 
                              $eq: ["$$listing.listing_unique_id", "$$listingItem.id"] 
                            }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    $cond: {
                      if: { $ne: ["$$matchedListing", null] },
                      then: {
                        $mergeObjects: [
                          "$$matchedListing",
                          { order: "$$listingItem.order" }
                        ]
                      },
                      else: null
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          listing_id: {
            $sortArray: {
              input: {
                $filter: {
                  input: "$listing_id",
                  as: "item",
                  cond: { $ne: ["$$item", null] }
                }
              },
              sortBy: { order: 1 }
            }
          }
        }
      },
      {
        $project: {
          listing_items: 0,
          listing_ids: 0,
          listings_data: 0
        }
      },
      {
        $sort: { created_at: -1 }
      }
    ]);

    console.log(`Found ${listing_list.length} chatboat listings`);

    if (!listing_list || listing_list.length === 0) {
      return callback(null, []);
    }

    return callback(null, listing_list);
  } catch (err: any) {
    console.error("Homepage Error:", err.message || err);
    return callback(
      {
        success: false,
        message: "Failed to load homepage data",
        error: err.message || err,
      },
      null
    );
  }
};
export const homePageModels = async (
  homeData: homeQuery,
  callback: (error: any, result: any) => void
) => {
  try {
    let locationId = homeData.current_location_id;

    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      const city = await City.findOne({
        name: process.env.DEFAULT_CITY,
      }).lean();
      locationId = city?._id as string;
    }
    const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";
    const baseUrl2 = process.env.BASE_URL_TWO || "https://api.latoprental.co";
    const imageBaseUrl = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.latoprental.co";
    const defaultImageUrl = `${imageBaseUrl}/uploads/default.jpg`;

    // Fetch all required data in parallel
    const [current_location, home_page_category, setting_data, homepage_seo] =
      await Promise.all([
        getLocationDetails(locationId),
        categorySchema
          .find({ status: true })
          .sort({ sorting: 1 })
          .select(
            "name slug desktop_image mobile_image unique_id subdomain_slug"
          )
          .lean(),
        settingSchema.findOne().lean(),
        homepageSeoSchema.findOne().lean(),
      ]);

    // Replace placeholders in all data at once
    const locationName =
      current_location?.area_name || current_location?.city_name || "Location";
    const replacements = {
      area: current_location?.area_name,
      city: current_location?.city_name,
      location: locationName,
      location1: locationName
    };

    const [
      home_page_content,
      page_title,
      meta_keywords,
      meta_description,
      meta_title,
    ] = await Promise.all([
      replacePlaceholders(
        setting_data?.desktop_description || "",
        replacements
      ),
      replacePlaceholders(
        homepage_seo?.page_title || "Default Title",
        replacements
      ),
      replacePlaceholders(
        homepage_seo?.meta_keywords || "Default keywords",
        replacements
      ),
      replacePlaceholders(
        homepage_seo?.meta_description || "Default description",
        replacements
      ),
      replacePlaceholders(
        homepage_seo?.meta_title || "Default Meta Title",
        replacements
      ),
    ]);
    const locationSlug = slugify(locationName, { lower: true });
    // Build category data and URL quickly
    const category_result = home_page_category.map((category: any) => {
      const categorySlug = slugify(category.slug, { lower: true }); // Slugify category name
      const categoryImageBaseUrl = `${imageBaseUrl}/${
        category.desktop_image || "default.jpg"
      }`;
      const mobileImageBaseUrl = `${imageBaseUrl}/${
        category.mobile_image || "default.jpg"
      }`;

      // Return mapped data
      if (setting_data?.category_box_links == "regular") {
        return {
          ...category,
          desktop_image: category.desktop_image
            ? categoryImageBaseUrl
            : defaultImageUrl,
          mobile_image: category.mobile_image
            ? mobileImageBaseUrl
            : defaultImageUrl,
          current_url: `${baseUrl2}/${categorySlug}-${locationSlug}/${category.unique_id}`, // Construct URL
        };
      } else {
        // Remove protocol (https://), split domain parts
        const urlObj = new URL(baseUrl2);
        const hostnameParts = urlObj.hostname.split(".");

        // Construct the subdomain URL
        const subdomainUrl = `https://${
          category.subdomain_slug
        }.${hostnameParts.join(".")}${urlObj.pathname}`;
        return {
          ...category,
          desktop_image: category.desktop_image
            ? categoryImageBaseUrl
            : defaultImageUrl,
          mobile_image: category.mobile_image
            ? mobileImageBaseUrl
            : defaultImageUrl,
          current_url: `${subdomainUrl}/${locationSlug}`, // Construct URL
        };
      }
    });

    // // Generate schema
    // const schema = {
    //   '@context': 'https://schema.org',
    //   '@graph': [
    //     {
    //       '@type': 'WebPage',
    //       '@id': baseUrl, // Use your website's base URL
    //       name: page_title || 'Default Page Title',
    //       description: meta_description || 'Default description for homepage.',
    //       url: baseUrl, // URL of your home page
    //       mainEntityOfPage: baseUrl, // Points to the main entity of the page
    //     },
    //     {
    //       '@type': 'Organization',
    //       name: process.env.SITE_NAME || 'Default Organization Name',
    //       url: baseUrl,
    //       logo: `${baseUrl}/${setting_data?.website_logo || 'default-logo.png'}`,
    //       contactPoint: {
    //         '@type': 'ContactPoint',
    //         telephone: setting_data?.phone_number || '+1234567890',
    //         contactType: 'customer service',
    //         areaServed: 'Global', // Can be dynamic based on your location info
    //         availableLanguage: 'English',
    //       },
    //     },
    //     {
    //       '@type': 'BreadcrumbList',
    //       itemListElement: [
    //         {
    //           '@type': 'ListItem',
    //           position: 1,
    //           name: 'Home',
    //           item: baseUrl,
    //         },
    //         ...home_page_category.map((category, index) => ({
    //           '@type': 'ListItem',
    //           position: index + 2,
    //           name: category.name,
    //           item: `${baseUrl}/${category.slug}-${locationSlug}`, // Example category URL
    //         })),
    //       ],
    //     },
    //     {
    //       '@type': 'ItemList',
    //       name: 'Categories on Homepage',
    //       itemListElement: home_page_category.map((category) => ({
    //         '@type': 'ListItem',
    //         position: home_page_category.indexOf(category) + 1,
    //         item: {
    //           '@type': 'Thing',
    //           name: category.name,
    //           url: `${baseUrl}/${category.slug}-${locationSlug}`, // Example category URL
    //         },
    //       })),
    //     },

    //   ],
    // };

    // Response object
    const result = {
      home_page_category: category_result,
      current_location,
      homePage: home_page_content,
      title: page_title,
      meta_keywords,
      meta_description,
      meta_title,
    };

    console.timeEnd("Homepage Load");
    return callback(null, result);
  } catch (err: any) {
    console.error("Homepage Error:", err.message || err);
    return callback(
      {
        success: false,
        message: "Failed to load homepage data",
        error: err.message || err,
      },
      null
    );
  }
};

export const frontendSettingModel = async (
  current_city_id: string | null = null,
  category_id: string | null = null
) => {
  try {
    if (!current_city_id) {
      const city = await City.findOne({
        name: process.env.DEFAULT_CITY,
      }).lean();
      current_city_id = city?._id.toString() as string;
    }
    // Fetch settings and related data
    const settings = await SettingSchema.findOne()
      .populate({ path: "theme_id" })
      .exec();

    if (settings) {
      const baseURL = process.env.BASE_URL;

      // Function to check if an image exists and return its URL or a default image
      const getImageUrl = (imagePath: any) => {
        const imageFilePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "..",
          "..",
          imagePath || ""
        );

        const defaultImageUrl = `${baseURL}/uploads/default.jpg`;

        return fs.existsSync(imageFilePath)
          ? `${baseURL}/${imagePath}`
          : defaultImageUrl;
      };

      // Update settings with the appropriate image URLs
      if (settings.website_logo) {
        settings.website_logo = getImageUrl(settings.website_logo);
      }

      if (settings.mobile_logo) {
        settings.mobile_logo = getImageUrl(settings.mobile_logo);
      }

      if (settings.fav_icon) {
        settings.fav_icon = getImageUrl(settings.fav_icon);
      }

      if (settings.pre_loader) {
        settings.pre_loader = getImageUrl(settings.pre_loader);
      }

      if (settings.mobile_listing_banner) {
        settings.mobile_listing_banner = getImageUrl(
          settings.mobile_listing_banner
        );
      }

      if (settings.desktop_listing_banner) {
        settings.desktop_listing_banner = getImageUrl(
          settings.desktop_listing_banner
        );
      }
    }
    const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";
    const current_location = await getLocationDetails(current_city_id);
    const result = {
      success: true,
      site_data: settings || {},
      current_location: current_location,
    };
    return result;
  } catch (error) {
    console.error("Error fetching frontend settings:", error);

    return {
      success: false,
      message: "Failed to fetch frontend settings.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const frontendFooterModel = async (
  current_city_id: string | null = null,
  category_id: string | null = null
) => {
  try {
    const mumbai_data_name = await citySchema
      .findOne({
        name: "Mumbai",
      })
      .lean();
    const navi_mumbai_name = await citySchema
      .findOne({
        name: "Navi Mumbai",
      })
      .lean();
    const pune_name = await citySchema
      .findOne({
        name: "Pune",
      })
      .lean();
    if (!current_city_id) {
      current_city_id = mumbai_data_name?._id as string;
    }

    const cityFilters = {
      mumbai: mumbai_data_name?.unique_id,
      navi_mumbai: navi_mumbai_name?.unique_id,
      pune: pune_name?.unique_id,
    };

    let category_data = null;

    if (
      category_id != "" &&
      mongoose.Types.ObjectId.isValid(category_id as string)
    ) {
      category_data = await categorySchema
        .findOne({ _id: new mongoose.Types.ObjectId(category_id as string) })
        .lean();
    }

    if (!category_data) {
      category_data = await categorySchema
        .findOne({ name: "Laptop Rental" })
        .lean();
    }

    if (!category_data) {
      const randomCategory = await categorySchema.aggregate([
        { $sample: { size: 1 } },
      ]);
      category_data = randomCategory[0] || null;
    }

    const [category_list, blog_category_list] = await Promise.all([
      categorySchema.find({ status: true }).sort({ sorting: 1 }).lean(),
      blogCategorySchema.find().lean(),
    ]);
    if (!category_data) throw new Error("Category data not found");

    const buildAreaWithUrl = async (cityId: any) => {
      return await areaSchema.find({ city_id: cityId }).lean();
    };

    // Parallel fetching for areas and keywords
    const [mumbai_data, navi_mumbai, pune, keywords] = await Promise.all([
      buildAreaWithUrl(cityFilters.mumbai),
      buildAreaWithUrl(cityFilters.navi_mumbai),
      buildAreaWithUrl(cityFilters.pune),
      keywordsSchema.find({}).lean(),
    ]);

    return {
      success: true,
      mumbai_data,
      navi_mumbai,
      pune,
      category_list,
      blog_category_list,
      category_data,
      keywordsdata: keywords.map((item) => item.words),
    };
  } catch (error) {
    console.error("Error fetching frontend settings:", error);
    return {
      success: false,
      message: "Failed to fetch frontend settings.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const frontendAdsModel = async (
    current_city_id: string | null = null,
    category_id: string | null = null
) => {
    try {
        if (!current_city_id) {
            const current_location_data = await City.findOne({
                name: process.env.DEFAULT_CITY,
            }).lean();
            current_city_id = current_location_data?._id.toString() as string;
        }

        const category_list = await categorySchema
            .find({ status: true })
            .sort({ sorting: 1 })
            .lean();
        const blog_category_list = await blogCategorySchema.find().lean();

        const current_location = await getLocationDetails(current_city_id);
        
        // Add error handling with try-catch for each banner fetch
        const bannerTypes = [
            "header_bottom",
            "left_side_banner",
            "footer_bottom",
            "chat_boat",
            "category_listing",
            "after_blog_image",
            "blog_paragraphs",
        ];

        const bannerResults = await Promise.allSettled(
            bannerTypes.map(type => getAdsBanners(category_id, current_location, type))
        );

        // Extract results safely
        const extractBannerResult = (result: PromiseSettledResult<any>) => {
            if (result.status === "fulfilled") {
                return result.value?.randomBanner || null;
            }
            console.error("Banner fetch failed:", result.reason);
            return null;
        };

        const [
            ad_header_banners_data,
            ad_sidebar_banners_data,
            ad_footer_banners_data,
            ad_chatboat_banners_data,
            ad_listing_banners_data,
            ad_after_blog_image_banners_data,
            ad_blog_paragraphs_banners_data,
        ] = bannerResults.map(extractBannerResult);

        const result = {
            success: true,
            category_list,
            blog_category_list,
            ad_header_banners_data,
            ad_sidebar_banners_data,
            ad_footer_banners_data,
            ad_chatboat_banners_data,
            ad_listing_banners_data,
            ad_after_blog_image_banners_data,
            ad_blog_paragraphs_banners_data
        };

        return result;
    } catch (error) {
        console.error("Error fetching frontend ads:", error);
        return {
            success: false,
            message: "Failed to fetch frontend ads.",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

export const getPremiumRequestList = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const searchQuery = search
      ? {
          $or: [
            { first_name: { $regex: search, $options: "i" } },
            { last_name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone_number: { $regex: search, $options: "i" } },
            { subject: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const users = await premiumRequestSchema
      .find(searchQuery)
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    const totalUsers = await premiumRequestSchema.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  } catch (error) {}
};

export const userActionActivityListModel = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const searchQuery = search
      ? {
          $or: [
            { module_name: { $regex: search, $options: "i" } },
            { action_type: { $regex: search, $options: "i" } },
            { message: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const users = await userActionActivitySchema
      .find(searchQuery)
      .populate({ path: "user_id", select: "name" })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await userActionActivitySchema.countDocuments(
      searchQuery
    );

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  } catch (error) {}
};

export const updateSettingModel = async (
  settingData: settingInterface,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingSetting = await SettingSchema.findOne();
    cache.del("frontendSettings"); // Invalidate cache
    if (existingSetting) {
      const updatedSetting = await SettingSchema.findByIdAndUpdate(
        existingSetting._id,
        settingData,
        { new: true }
      );
      return callback(null, { updatedSetting });
    } else {
      const newSetting = new SettingSchema(settingData);
      await newSetting.save();
      return callback(null, { newSetting });
    }
  } catch (error) {
    return callback(error, null);
  }
};

export const getExportTasksByModuleName = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const searchQuery = search
      ? {
          module_name: { $regex: search, $options: "i" },
        }
      : {};

    const skip = (page - 1) * limit;

    const [lists, totalLists] = await Promise.all([
      exportTaskSchema
        .find(searchQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      exportTaskSchema.countDocuments(searchQuery),
    ]);

    return {
      data: lists,
      totalLists,
      totalPages: Math.ceil(totalLists / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching export tasks:", error);
    throw new Error("Error fetching export tasks");
  }
};
