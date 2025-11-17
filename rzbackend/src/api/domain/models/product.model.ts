import ProductSchema from "../schema/product.schema";
import ListingsSchema from "../schema/listing.schema";
import categorySchema from "../schema/category.schema";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { env } from "process";
const baseUrl = env.BASE_URL || "http://localhost:3000";

const getSingleIdFromName = async (schema: any, name: string): Promise<string | null> => {
  const result = await schema.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
  return result ? result._id.toString() : null;
};

const getSingleUniqueIdFromName = async (schema: any, name: string, type: string): Promise<string | null> => {
  const result = await schema.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
  if(type === "listing"){
    return result ? result.listing_unique_id.toString() : null;
  }
  return result ? result.unique_id : null;
};

export interface ProductInput {
  product_name: string;
  product_images: string[];
  product_description: string;
  product_price: string;
  product_listing_id: string;
  product_category_id: string;
  status: boolean;
  product_id?: string;
  ratingvalue?: number;
  ratingcount?: number;
}

interface loginUserData {
  userId: string;
  company_id: string;
  email: string;
}

export interface ImportProductgData {
  product_name: string;
  product_description: string;
  product_price: string;
  product_listing_id: string;
  product_category_id: string;
}

interface removeImageData {
  product_id: string;
  image_name: string;
}

export const removeProductImageModel = async (
  removeImage: removeImageData,
  callback: (error: any, result: any) => void
) => {
  const { product_id, image_name } = removeImage;

  try {
    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      product_id,
      { $pull: { product_images: image_name } }, // remove just this image
      { new: true } // return updated document
    );

    if (!updatedProduct) {
      return callback(new Error("Product not found."), null);
    }

    return callback(null, updatedProduct);
  } catch (err: any) {
    return callback(err, null);
  }
};

export const userProductListModel = async (
  loginUser: loginUserData,
  search: string,
  page: number,
  limit: number
) => {
  try {
    const skip = (page - 1) * limit;
    const userListings = await ListingsSchema.find({ email: loginUser.email });
    const listingIds = userListings.map((listing) => listing.listing_unique_id);

    const users = await ProductSchema.aggregate([
      // First filter by user's listing IDs BEFORE any lookups
      {
        $match: {
          product_listing_id: { $in: listingIds },
          $or: [
            { product_name: { $regex: search || "", $options: "i" } },
            { product_description: { $regex: search || "", $options: "i" } }
          ]
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "product_category_id",
          foreignField: "unique_id",
          as: "category_ids"
        }
      },
      {
        $lookup: {
          from: "listings",
          localField: "product_listing_id",
          foreignField: "listing_unique_id",
          as: "listing_ids"
        }
      },
      {
        $unwind: {
          path: "$listing_ids",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          unique_id: 1,
          product_name: 1,
          product_images: 1,
          product_description: 1,
          product_price: 1,
          product_listing_id: 1,
          product_category_id: 1,
          listing_ids: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: limit }, { $sort: { createdAt: -1 } }]
        }
      }
    ]).exec();

    const updatedUsers = users[0]?.data.map((user : any) => {
      const userObject = {...user};

      if (Array.isArray(user?.product_images)) {
        const updatedImages: string[] = user.product_images.map(
          (image: string) => `${baseUrl}/${image.replace(/\\/g, "/")}`
        );
        userObject.product_images = updatedImages;
      }

      return userObject;
    });

    return {
      data: updatedUsers,
      totalUsers : users[0]?.totalCount[0]?.count || 0,
      totalPages: Math.ceil(users[0]?.totalCount[0]?.count / limit) || 0,
      currentPage: page
    };
  } catch (error) {
    console.error("Error fetching user product list:", error);
    return { data: [], totalUsers: 0, totalPages: 0, currentPage: page };
  }
};

export const listingProductListModel = async (search: string, page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;
    const result = await ProductSchema.aggregate([
      {
        $lookup: {
          from: "listings",
          localField: "product_listing_id",
          foreignField: "listing_unique_id",
          as: "product_listing_id"
        }
      },

      {
        $lookup: {
          from: "categories",
          localField: "product_category_id",
          foreignField: "unique_id",
          as: "product_category_id"
        }
      },
      {
        $match: {
          $or: [
            { "product_listing_id.name": { $regex: search || "", $options: "i" } },
            { "product_category_id.name": { $regex: search || "", $options: "i" } },
            { product_name: { $regex: search || "", $options: "i" } }
          ]
        }
      },
      {
        $unwind: {
          path: "$product_listing_id",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$product_category_id",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          product_name: 1,
          product_images: 1,
          product_description: 1,
          product_price: 1,
          status: 1,
          unique_id: 1,
          product_listing_id: {
            name: "$product_listing_id.name",
            _id: "$product_listing_id._id"
          },
          product_category_id: {
            name: "$product_category_id.name",
            _id: "$product_category_id._id"
          }
        }
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: limit }, { $sort: { createdAt: -1 } }]
        }
      }
    ]);

    const updatedUsers = result[0]?.data.map((user: any) => {
      const userObject = { ...user };

      if (Array.isArray(user?.product_images)) {
        const updatedImages: string[] = user.product_images.map(
          (image: string) => `${baseUrl}/${image.replace(/\\/g, "/")}`
        );
        userObject.product_images = updatedImages;
      }
      return userObject;
    });

    return {
      data: updatedUsers,
      totalUsers: result[0]?.totalCount[0]?.count || 0,
      totalPages: Math.ceil(result[0]?.totalCount[0]?.count / limit) || 0,
      currentPage: page
    };
  } catch (error) {
    console.error(error);
  }
};

export const productgDetailsModel = async (
  product_id: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const productDetails = (
      await ProductSchema.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(product_id) }
        },
        {
          $lookup: {
            from: "listings",
            localField: "product_listing_id",
            foreignField: "listing_unique_id",
            as: "product_listing_id"
          }
        },
        {
          $unwind: {
            path: "$product_listing_id",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "product_category_id",
            foreignField: "unique_id",
            as: "product_category_id"
          }
        },
        {
          $unwind: {
            path: "$product_category_id",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            product_name: 1,
            product_images: 1,
            product_description: 1,
            product_price: 1,
            status: 1,
            product_listing_id: {
              _id: "$product_listing_id._id",
              name: "$product_listing_id.name",
              listing_unique_id: "$product_listing_id.listing_unique_id"
            },
            product_category_id: {
              _id: "$product_category_id._id",
              name: "$product_category_id.name",
              unique_id: "$product_category_id.unique_id"
            },
            ratingvalue: 1,
            ratingcount: 1,
          }
        }
      ])
    ).at(0);

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    if (Array.isArray(productDetails?.product_images)) {
      const updatedImages: string[] = [];
      productDetails?.product_images.forEach((image: string) => {
        const updatedPath = `${baseUrl}/${image.replace(/\\/g, "/")}`;
        updatedImages.push(updatedPath);
      });
      productDetails.product_images = updatedImages;
    }

    return callback(null, { productDetails });
  } catch (error) {
    console.error("Error storing blog:", error);
    return callback(error, null);
  }
};

export const storeProductModel = async (
  productData: ProductInput,
  callback: (error: any, result: any) => void
) => {
  try {
    const newProduct = new ProductSchema({
      product_name: productData.product_name,
      product_images: productData.product_images,
      product_description: productData.product_description,
      product_price: productData.product_price,
      product_listing_id: productData.product_listing_id,
      product_category_id: productData.product_category_id,
      ratingvalue: productData.ratingvalue || 0,
      ratingcount: productData.ratingcount || 0,
    });

    const savedProduct = await newProduct.save();

    return callback(null, savedProduct);
  } catch (error) {
    console.error("Error storing premium listing:", error);
    return callback(error, null);
  }
};

export const updateProductModel = async (
  productData: ProductInput,
  callback: (error: any, result: any) => void
) => {
  try {
    const updateFields: any = {
      product_name: productData.product_name,
      product_description: productData.product_description,
      product_price: productData.product_price,
      product_listing_id: productData.product_listing_id,
      product_category_id: productData.product_category_id,
      ratingvalue: productData.ratingvalue || 0,
      ratingcount: productData.ratingcount || "",
    };

    // Only update product_images if it's provided and not empty
    if (productData.product_images && productData.product_images.length > 0) {
      updateFields.$push = {
        product_images: { $each: productData.product_images }
      };
    }

    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      productData.product_id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return callback(new Error("Product not found"), null);
    }

    return callback(null, updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return callback(error, null);
  }
};

export const importProductModel = async (
  loginUser: loginUserData,
  productData: ImportProductgData[],
  callback: (error: any, result: any) => void
) => {
  try {
    // Step 1: Resolve all listing/category names to IDs
    const transformedData = await Promise.all(
      productData.map(async (item) => {
        const listing_id =
          (await getSingleUniqueIdFromName(ListingsSchema, item.product_listing_id, 'listing')) || null;
        const category_id =
          (await getSingleUniqueIdFromName(categorySchema, item.product_category_id, 'category')) || null;        

        // Skip the row if either listing_id or category_id is not found
        if (!listing_id || !category_id) {
          return null; // This will be filtered out in the next step
        }

        return {
          ...item,
          product_listing_id: listing_id,
          product_category_id: category_id
        };
      })
    );

    // Filter out null values (skipped rows)
    const validData = transformedData.filter((item) => item !== null);

    // Step 2: Build a unique key for exact-match checking
    const uniqueKeys = validData.map(
      (item) =>
        `${item.product_name}__${item.product_price}__${item.product_listing_id}__${item.product_category_id}`
    );

    // Step 3: Find all existing exact matches in a single query
    const existingProducts = await ProductSchema.find({
      $or: validData.map((item) => ({
        product_name: item.product_name,
        product_price: item.product_price,
        product_listing_id: item.product_listing_id,
        product_category_id: item.product_category_id
      }))
    })
      .select("product_name product_price product_listing_id product_category_id")
      .lean();

    // Step 4: Build key set of exact matches
    const existingKeySet = new Set(
      existingProducts.map(
        (item) =>
          `${item.product_name}__${item.product_price}__${item.product_listing_id}__${item.product_category_id}`
      )
    );

    // Step 5: Filter out only exact matches
    const uniqueInserts = validData.filter((item, i) => {
      const key = uniqueKeys[i];
      return !existingKeySet.has(key);
    });

    // Step 6: Assign unique_id manually to avoid schema pre-save logic
    if (uniqueInserts.length > 0) {
      // Get current max unique_id from DB
      const last = await ProductSchema.findOne().sort({ unique_id: -1 }).select("unique_id").lean();
      let nextId = last?.unique_id ? last.unique_id + 1 : 1;

      for (const item of uniqueInserts) {
        (item as any).unique_id = nextId++;
      }

      await ProductSchema.insertMany(uniqueInserts);
    }

    return callback(null, {
      insertedCount: uniqueInserts.length,
      skippedCount: validData.length - uniqueInserts.length
    });
  } catch (error) {
    console.error("Error importing products:", error);
    return callback(error, null);
  }
};
