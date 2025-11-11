import { loggerMsg } from "../../lib/logger";
import jobCategorySchema from "../schema/jobCategory.schema";
import jobSchema from "../schema/jobs.schema";
import JobApplications from "../schema/jobApplication.schema";
import getLocationDetails from "../../services/currentLocation.service";
import { replacePlaceholders } from "../../services/ReplaceText.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "mongoose";
import slugify from "slugify";
import mongoose from "mongoose";

interface categorySchema {
  name: string;
  slug: string;
  image: string;
  sorting: number;
}

interface ApplyjobSchema {
  job_id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone_number: string;
}

interface jobSchema {
  job_category_id: string[];
  job_title: string;
  exprience: string;
  salary: string;
  address: string;
  phone_number: string;
  keywords_tag: string[];
  is_approved: string;
  description: string;
  meta_title: string;
  meta_description: string;
}

interface categoryActionInterface {
  category_id: string;
  type: string;
}

export const categoryListFrontend = async (
  search: string,
  page: number,
  limit: number,
  location_id: string
) => {
  try {
    const searchQuery: any = { status: true };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const categories = await jobCategorySchema
      .find(searchQuery)
      .sort({ sorting: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCategories = await jobCategorySchema.countDocuments(searchQuery);

    const current_location = await getLocationDetails(
      location_id ? location_id : ""
    );
    let current_location_name;

    if (current_location.area_name) {
      current_location_name = current_location?.area_name;
    } else {
      current_location_name = current_location?.city_name;
    }

    const formattedCategories = categories.map((category) => ({
      ...category.toObject(),
      url:
        `${process.env.BASE_URL_TWO}${slugify(
          category.slug + "-jobs-in-" + current_location_name,
          { lower: true, strict: true }
        )}/` + category.unique_id,
      image: category.image
        ? `${process.env.BASE_URL}/${category.image}`
        : null,
    }));

    return {
      data: formattedCategories,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      current_location,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Error fetching categories");
  }
};

export const jobListFrontend = async (
  search: string,
  page: number,
  limit: number,
  location_id: string
) => {
  try {
    const searchQuery: any = { status: true };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const categories = await jobCategorySchema
      .find(searchQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCategories = await jobCategorySchema.countDocuments(searchQuery);

    const defaultLocationId = "67dd00f2824d6d721ac0e3cb";
    const current_location = await getLocationDetails(
      location_id?.trim() ? location_id : defaultLocationId
    );
    let current_location_name;

    if (current_location.area_name) {
      current_location_name = current_location?.area_name;
    } else {
      current_location_name = current_location?.city_name;
    }

    const formattedCategories = categories.map((category) => ({
      ...category.toObject(),
      url:
        `${process.env.BASE_URL_TWO}${slugify(
          category.slug + "-jobs-in-" + current_location_name,
          { lower: true, strict: true }
        )}/` + category.unique_id,
      image: category.image
        ? `${process.env.BASE_URL}/${category.image}`
        : null,
    }));

    return {
      data: formattedCategories,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      current_location,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Error fetching categories");
  }
};

export const getJobDetailFrontendModel = async (
  job_id: string,
  location_details: any // Pass location info like city/area
) => {
  try {
    const job = await jobSchema
      .findOne({ unique_id: job_id })
      .populate("job_category_id")
      .lean(); // Faster and returns plain object

    if (!job) {
      return { error: "Job not found" };
    }

    const replacements_location = {
      area: location_details?.area_name,
      city: location_details?.city_name,
      location: location_details?.area_name || location_details?.city_name,
      location1: location_details?.area_name || location_details?.city_name,
    };

    // Apply replacements
    const slug = replacePlaceholders(
      job.job_title || "",
      replacements_location
    );
    const job_title = replacePlaceholders(
      job.job_title || "",
      replacements_location
    );
    const meta_title = replacePlaceholders(
      job.meta_title || "",
      replacements_location
    );
    const meta_description = replacePlaceholders(
      job.meta_description || "",
      replacements_location
    );
    const description = replacePlaceholders(
      job.description || "",
      replacements_location
    );

    // Replace in keyword array
    const keywordArray = job.keywords_tag || [];
    const keywords_tag = keywordArray.map((keyword: string) =>
      replacePlaceholders(keyword || "", replacements_location)
    );

    const url =
      `${process.env.BASE_URL_TWO}` +
      slugify(`jobs-${slug}-${job?.unique_id}`).toLowerCase();

    return {
      ...job,
      url,
      job_title,
      meta_title,
      meta_description,
      description,
      keywords_tag,
    };
  } catch (error) {
    console.error("Error in getJobDetailFrontendModel:", error);
    return { error: "Failed to fetch job details" };
  }
};

export const getJobDetailModel = async (
  job_id: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingCategory = await jobSchema.findOne({ _id: job_id });
    if (!existingCategory) {
      return callback(new Error("Category not found"), null);
    }

    return callback(null, existingCategory);
  } catch (error) {
    return callback(error, null);
  }
};

export const applyForJobModel = async (
  storeApplyJobModel: ApplyjobSchema,
  callback: (error: any, result: any) => void
) => {
  try {
    const newJob = new JobApplications(storeApplyJobModel);
    const savedJob = await newJob.save();

    return callback(null, savedJob);
  } catch (error) {    
    throw new Error("Error fetching users");
  }
};

export const getJobDetailByUniqueId = async (job_id: string) => {
  try {
    const existingCategory = await jobCategorySchema.findOne({
      unique_id: Number(job_id),
    });
    return existingCategory;
  } catch (error) {
    return { error };
  }
};

export const getJoblistingFrontendModel = async (
  location_details: any,
  category_id: string,
  page: number,
  limit: number,
  searchTerm?: string
) => {
  try {
    const search = location_details.current_location_name || searchTerm;

    const searchQuery: any = {};

    if (search) {
      searchQuery.$or = [
        { address: { $regex: search, $options: "i" } },
        { job_title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await jobSchema
      .find(searchQuery)
      .populate("job_category_id")
      .skip(skip)
      .limit(limit)
      .lean(); // ✅ lean() for better performance

    const replacements_location = {
      area: location_details?.area_name,
      city: location_details?.city_name,
      location: location_details?.area_name || location_details?.city_name,
      location1: location_details?.area_name || location_details?.city_name,
    };

    const formattedData = users.map((user: any) => {
      const slug = replacePlaceholders(
        user.job_title || "",
        replacements_location
      );
      const job_title = replacePlaceholders(
        user.job_title || "",
        replacements_location
      );
      const meta_title = replacePlaceholders(
        user.meta_title || "",
        replacements_location
      );
      const meta_description = replacePlaceholders(
        user.meta_description || "",
        replacements_location
      );
      const description = replacePlaceholders(
        user.description || "",
        replacements_location
      );

      const keywordArray = user.keywords_tag || [];
      const keywords_tag = keywordArray.map((keyword: string) =>
        replacePlaceholders(keyword || "", replacements_location)
      );

      const url =
        `${process.env.BASE_URL_TWO}` +
        slugify("jobs-" + slug + "-" + user?.unique_id).toLowerCase();

      return {
        ...user,
        url,
        job_title,
        meta_title,
        meta_description,
        description,
        keywords_tag,
      };
    });

    const totalUsers = await jobSchema.countDocuments(searchQuery);

    return {
      data: formattedData,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error in getJoblistingFrontendModel:", error);
    throw new Error("Error fetching job listings");
  }
};

export const jobList = async (search: string, page: number, limit: number) => {
  try {
    const searchQuery = search
      ? {
          $or: [
            { job_title: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { phone_number: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const users = await jobSchema
      .find(searchQuery)
      .populate("job_category_id")
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await jobSchema.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const jobApplicationList = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const searchQuery = search
      ? {
          $or: [{ name: { $regex: search, $options: "i" } }],
        }
      : {};

    const skip = (page - 1) * limit;

    const users = await JobApplications.find(searchQuery)
      .populate("job_id")
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await JobApplications.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const storeJobModel = async (
  storeJobModel: jobSchema,
  callback: (error: any, result: any) => void
) => {
  try {
    const newJob = new jobSchema(storeJobModel);
    const savedJob = await newJob.save();

    return callback(null, savedJob);
  } catch (error) {    
    throw new Error("Error fetching users");
  }
};

export const categoryActionModel = async (
  categoryData: categoryActionInterface,
  callback: (error: any, result: any) => void
) => {
  try {
    const category = await jobCategorySchema.findOne({
      _id: categoryData.category_id,
    });

    if (!category) {
      return callback({ message: "Job Category not found" }, null);
    }

    category.status = categoryData.type === "1";

    await category.save();

    return callback(null, category);
  } catch (error) {
    console.error("Error updating category:", error);
    return callback({ message: "Error updating category" }, null);
  }
};

export const categoryList = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const categories = await jobCategorySchema
      .find(searchQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCategories = await jobCategorySchema.countDocuments(searchQuery);

    // Add full image URL
    const formattedCategories = categories.map((category) => ({
      ...category.toObject(),
      image: category.image
        ? `${process.env.BASE_URL}/${category.image}`
        : null, // Adjust the base URL as needed
    }));

    return {
      data: formattedCategories,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error("Error fetching categories");
  }
};
export const disableCategoryList = async (
  categoryData: categorySchema,
  callback: (error: any, result: any) => void
) => {
  try {
    const category_list = await jobCategorySchema.find({ status: false });
    return callback(null, category_list);
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const storeCategoryModel = async (
  categoryData: categorySchema,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingCategory = await jobCategorySchema.findOne({
      slug: categoryData.slug,
    });

    if (existingCategory) {
      const error = new Error("Job Category already exists.");
      return callback(error, null);
    }

    const lastCategory = await jobCategorySchema
      .findOne()
      .sort({ sorting: -1 });
    const newSortingValue = lastCategory ? lastCategory.sorting + 1 : 1;

    const newCategory = new jobCategorySchema({
      ...categoryData,
      sorting: newSortingValue,
    });

    await newCategory.save();

    return callback(null, newCategory);
  } catch (error) {    
    throw new Error("Error fetching users");
  }
};

export const getCategoryDetailModel = async (
  category_id: string,
  callback: (error: any, result: any) => void
) => {
  try {    
    const existingCategory = await jobCategorySchema.findOne({
      _id: category_id,
    });
    if (!existingCategory) {
      return callback(new Error("Category not found"), null);
    }
    existingCategory.image = `${process.env.BASE_URL}/${existingCategory?.image}`;

    return callback(null, existingCategory);
  } catch (error) {
    return callback(error, null);
  }
};

export const UpdateCategoryDetailModel = async (
  category_id: string,
  categoryData: categorySchema,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingCategory = await jobCategorySchema.findOne({
      _id: category_id,
    });

    if (!existingCategory) {
      return callback(new Error("Category not found."), null);
    }

    const slugExist = await jobCategorySchema.findOne({
      slug: categoryData.slug,
      _id: { $ne: category_id },
    });

    if (slugExist) {
      return callback(new Error(" already exists."), null);
    }
    existingCategory.name = categoryData.name || existingCategory.name;
    existingCategory.slug = categoryData.slug || existingCategory.slug;
    existingCategory.image = categoryData.image || existingCategory.image;
    await existingCategory.save();

    return callback(null, existingCategory);
  } catch (error) {
    return callback(error, null);
  }
};

export const getSortedCategoryList = async (
  callback: (error: any, result: any) => void
) => {
  try {
    const users = await jobCategorySchema
      .find({ status: true })
      .sort({ sorting: 1 }); // Replace 'fieldName' with the actual sorting field
    return callback(null, users);
  } catch (error) {
    return callback(error, null);
  }
};

export const updateSortingList = async (
  category_ids: any[],
  callback: (error: any, result: any) => void
) => {
  if (!Array.isArray(category_ids) || category_ids.length === 0) {
    return callback(new Error("Invalid category IDs"), null);
  }

  for (let i = 0; i < category_ids.length; i++) {
    await jobCategorySchema.findByIdAndUpdate(category_ids[i], {
      sorting: i + 1,
    });
  }

  const updatedCategories = await jobCategorySchema
    .find({ status: true })
    .sort({ sorting: 1 });

  return callback(null, updatedCategories);
};

export const UpdateJobModel = async (
  job_id: string,
  jobSchemaData: jobSchema,
  callback: (error: any, result: any) => void
) => {
  try {    
    const updatedJob = await jobSchema.findByIdAndUpdate(
      job_id,
      { $set: jobSchemaData },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return callback(new Error("Job not  sdasd found."), null);
    }

    return callback(null, updatedJob);
  } catch (error) {
    return callback(error, null);
  }
};
