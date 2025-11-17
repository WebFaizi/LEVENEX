import { loggerMsg } from "../../lib/logger";
import BlogSchema from "../schema/blog.schema"; 
import userSchema from "../schema/user.schema"; 
import BlogReviewSchema from "../schema/blogReview.schema"; 
import ListingReviewSchema from "../schema/listingReview.schema"; 
import NodeCache from "node-cache";
import  multer from "multer";
import path  from "mongoose";
import slugify from "slugify";
import mongoose from "mongoose";
import { string } from "joi";
import fs from "fs";
import getLocationDetails from '../../services/currentLocation.service';
import { storeUserActionActivity } from "../../services/userActionActivity.service";
import getAdsBanners from '../../services/banners.service';
const cache = new NodeCache({ stdTTL: 300 }); // TTL = 300 seconds = 5 minutes
export default cache;

interface loginUserDetailsSchema{
    userId:mongoose.Types.ObjectId;
}

interface blogData{
    author_name:string;
    contact_no:string;
    content:string;
    blog_title:string;
    images:string;
    email:string;
    categoryIds:string;
    blog_id?:string;
}

interface reviewDataInterface {
    blog_id:mongoose.Types.ObjectId;
    user_id:mongoose.Types.ObjectId;
    rating:string,
    comment:string,
}
interface reviewListingDataInterface {
    listing_id:mongoose.Types.ObjectId;
    user_id:mongoose.Types.ObjectId;
    rating:string,
    comment:string,
}


interface loginUserData{
    userId:string;
    company_id:string;
}

interface importBlogReviewData{
    blog_name:string;
    user_name:string;
    rating:string;
    comment:string;
}

interface blogReviewData {
    blog_id:string;
    user_id:string;
    rating:string;
    comment:string;
}

export const BlogWiseReviewList = async (search: string, page: number, limit: number) => {
    try {
        const listingObjectId = new mongoose.Types.ObjectId(search);
        const searchQuery = { blog_id: listingObjectId,isApproved:true };
        const skip = (page - 1) * limit;

        // Fetch paginated reviews
        const users = await BlogReviewSchema.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .populate('user_id')
            .lean();

        // Count total reviews
        const totalUsers = await BlogReviewSchema.countDocuments(searchQuery);

        // Aggregate to get rating distribution
        const ratingStats = await BlogReviewSchema.aggregate([
            { $match: { blog_id: listingObjectId } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Initialize and calculate breakdown
        let totalRating = 0;
        let ratingCount = 0;
        const ratingDistribution: { [key: number]: { count: number; percent: number } } = {
            1: { count: 0, percent: 0 },
            2: { count: 0, percent: 0 },
            3: { count: 0, percent: 0 },
            4: { count: 0, percent: 0 },
            5: { count: 0, percent: 0 },
        };

        for (const stat of ratingStats) {
            const rating = stat._id;
            const count = stat.count;
            if (ratingDistribution[rating] !== undefined) {
                ratingDistribution[rating].count = count;
                totalRating += rating * count;
                ratingCount += count;
            }
        }

        // Percent calculation
        if (ratingCount > 0) {
            for (let i = 1; i <= 5; i++) {
                ratingDistribution[i].percent = parseFloat(
                    ((ratingDistribution[i].count / ratingCount) * 100).toFixed(2)
                );
            }
        }

        const averageRating = ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(2)) : 0;

        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            averageRating,
            ratingBreakdown: ratingDistribution,
        };
    } catch (error) {
        console.error('Error in BlogReviewSchema:', error);
        return {
            data: [],
            totalUsers: 0,
            totalPages: 0,
            currentPage: page,
            averageRating: 0,
            ratingBreakdown: {},
            message: 'Something went wrong',
        };
    }
};

export const storeBlogReviewModel = async (userDetails:loginUserDetailsSchema,blogData: blogReviewData, callback: (error: any, result: any) => void) => {
    try {


        const newBlog = new BlogReviewSchema({
            blog_id: blogData.blog_id,
            user_id: blogData.user_id,
            rating: blogData.rating,
            comment: blogData.comment,
            isApproved: true,
        });

        const savedBlog = await newBlog.save();
        // await storeUserActionActivity(userDetails.userId, "BLog", "Create", `Craete new reviewo for blog`)
        return callback(null, { savedBlog });

    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const getAllBlogModel = async (search: string) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const users = await BlogSchema.find(searchQuery)
            .exec();

        return {
            data: users,
        };
    } catch (error) {
        throw new Error('Error fetching users');
    }
}

export const importBlogReviewDataModel = async (userDetails: loginUserDetailsSchema, listingData: importBlogReviewData[], callback: (error: any, result: any) => void) => {
    try {
        const transformedData = await Promise.all(listingData.map(async (item) => {
            const listing = await BlogSchema.findOne({ blog_title: item.blog_name });
            const user = await userSchema.findOne({ name: item.user_name });

            if (!listing || !user) {
                console.warn(`Skipping row: Blog or User not found for ${item.blog_name}, ${item.user_name}`);
                return null; // Skip this entry
            }

            return {
                blog_id: listing._id,
                user_id: user._id,
                rating: item.rating,
                comment: item.comment
            };
        }));
        
        await BlogReviewSchema.insertMany(transformedData);

        // await storeUserActionActivity(userDetails.userId, "BLog Review", "Import", `Import Successfully Import blog review`)

        return callback(null, transformedData);
    } catch (error) {
        console.error("Error updating listing:", error);
        return callback(error, null);
    }
};

export const blogReviewList = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const users = await BlogReviewSchema.find(searchQuery)
            .skip(skip)
            .limit(limit) 
            .populate('blog_id user_id')
            .exec();

        const totalUsers = await BlogReviewSchema.countDocuments(searchQuery);
        BlogReviewSchema
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    } catch (error) {
        // return callback(error, null); 
    }
};

export const blogList = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const users = await BlogSchema.find(searchQuery)
            .skip(skip)
            .limit(limit) 
            .exec();

        const totalUsers = await BlogSchema.countDocuments(searchQuery);
        BlogSchema
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    } catch (error) {
        // return callback(error, null); 
    }
};

export const storeBlogModel = async (userDetails:loginUserDetailsSchema,blogData: blogData, callback: (error: any, result: any) => void) => {
    try {
        const slug_data = slugify(blogData.blog_title, { lower: true, strict: true });

        const existingBlog = await BlogSchema.findOne({ slug: slug_data });

        if (existingBlog) {
            return callback({ message: "Blog with this title already exists!", status: 409 }, null);
        }

        const categoryObjectIds = Array.isArray(blogData.categoryIds) 
            ? blogData.categoryIds
                .filter(id => mongoose.Types.ObjectId.isValid(id)) 
                .map(id => new mongoose.Types.ObjectId(id))
            : [];

        const newBlog = new BlogSchema({
            author_name: blogData.author_name,
            contact_no: blogData.contact_no,
            content: blogData.content,
            slug: slug_data,
            blog_title: blogData.blog_title,
            images: blogData.images,
            email: blogData.email,
            categoryIds: categoryObjectIds,
            blog_id: blogData.blog_id,
        });

        const savedBlog = await newBlog.save();
        
        // await storeUserActionActivity(userDetails.userId, "BLog", "Create", `Craete new  blog!`)
        return callback(null, { savedBlog });

    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const blogDetail = async (blog_id:string, callback: (error: any, result: any) => void) => {
    try {        
        const Blog = await BlogSchema.findOne({ _id: blog_id });
        
        if(Blog){
            Blog.images = `${process.env.BASE_URL}/${Blog.images}`;
        }
        return callback(null, { Blog });
    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const updateBlogModel = async (userDetails:loginUserDetailsSchema,blogData: blogData, callback: (error: any, result: any) => void) => {
    try {
        const slug_data = slugify(blogData.blog_title, { lower: true, strict: true });

        const existingBlog = await BlogSchema.findOne({ slug: slug_data });

        if (existingBlog && existingBlog.id.toString() !== blogData.blog_id) {
            return callback({ message: "Blog with this title already exists!", status: 409 }, null);
        }

        const categoryObjectIds = Array.isArray(blogData.categoryIds)
            ? blogData.categoryIds
                .filter(id => mongoose.Types.ObjectId.isValid(id))
                .map(id => new mongoose.Types.ObjectId(id))
            : [];

        const blogToUpdate = await BlogSchema.findById(blogData.blog_id);

        if (!blogToUpdate) {
            return callback({ message: "Blog not found", status: 404 }, null);
        }
        blogToUpdate.author_name = blogData.author_name;
        blogToUpdate.contact_no = blogData.contact_no;
        blogToUpdate.content = blogData.content;
        blogToUpdate.slug = slug_data;
        blogToUpdate.blog_title = blogData.blog_title;
        blogToUpdate.images = blogData.images ? blogData.images : blogToUpdate.images;
        blogToUpdate.email = blogData.email;
        blogToUpdate.categoryIds = categoryObjectIds;

        const updatedBlog = await blogToUpdate.save();

        // await storeUserActionActivity(userDetails.userId, "BLog", "update", `Update blog details!`)

        return callback(null, { updatedBlog });

    } catch (error) {
        console.error("Error updating blog:", error);
        return callback(error, null);
    }
};

export const frontendBlogList = async (
    search: string,
    page: number,
    limit: number,
    current_location_id: string,
    callback: (error: any, result: any) => void
) => {
    try {
        const skip = (page - 1) * limit;

        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

       
        const [blogs, totalUsers] = await Promise.all([
            
            BlogSchema.find(searchQuery).skip(skip).limit(limit).lean(),
            BlogSchema.countDocuments(searchQuery),
        ]);

        const blogs_data = blogs.map(blog => ({
            ...blog,
            images: blog.images ? `${process.env.BASE_URL}/${blog.images}` : undefined,
        }));

        const data = {
            blogs_data,
            title: "Blog Listing",
            meta_title: "Blog Listing Meta",
            meta_description: "Blog meta description",
            meta_keywords: "Meta keywords",
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };

        // Store the result in cache for future use
        // cache.set(cacheKey, data);
        return callback(null, data);

    } catch (error) {
        console.error("Error in frontendBlogList:", error);
        return callback(error, null);
    }
};

export const frontendBlogDetails = async (
    blog_id: string,
    current_city_id:any,
    page: number,
    limit: number,
    callback: (error: any, result: any) => void
) => {
    const cacheKey = `blog:${blog_id}:${page}:${limit}`;
    const cached = cache.get(cacheKey);
    // if (cached) return callback(null, cached);

    try {
        const skip = (page - 1) * limit;

        const [blog, blogs_reviews, recent_blogs, total_blog_reviews] = await Promise.all([
            BlogSchema.findById(blog_id).lean(),
            BlogWiseReviewList(blog_id, page, limit),
            BlogSchema.find({ _id: { $ne: blog_id } })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
            BlogSchema.countDocuments({ _id: blog_id }),
        ]);

        if (!blog) return callback(new Error("Blog not found"), null);
        const ads_banner_data = await getAdsBanners('', current_city_id, 'header_bottom');
        const banner_image = ads_banner_data?.randomBanner?.banner_image;

        blog.images = blog.images ? `${process.env.BASE_URL}/${blog.images}` : undefined;
        if (blog.content) {
            const imgTag = `<div style="text-align:center;"><img src="${banner_image}" style="max-width:100%; margin: 20px 0;" /></div>`;
          
            // Split content by </p> and insert image after each paragraph
            const paragraphs = blog.content.split('</p>');
            blog.content = paragraphs
            .map((para, index) => {
              if (!para.trim()) return '';
              let result = para + '</p>';
              if ((index + 1) % 3 === 0) {
                result += imgTag;
              }
              return result;
            })
            .join('');
          }
      
        const recent_blogs_data = recent_blogs.map(rb => ({
            ...rb,
            images: rb.images ? `${process.env.BASE_URL}/${rb.images}` : undefined,
        }));

        const totalPages = Math.ceil(total_blog_reviews / limit);

        const data = {
            Blog: blog,
            recent_blogs_data,
            blogs_reviews,
            title: blog.blog_title,
            meta_title: blog.blog_title,
            meta_description: blog.blog_title,
            meta_keywords: blog.blog_title,
            total_blog_reviews,
            totalPages,
            currentPage: page,
        };

        // Store result in cache
        cache.set(cacheKey, { data });        
        return callback(null, { data });

    } catch (error) {
        console.error("Error fetching blog details:", error);
        return callback(error, null);
    }
};

export const storeFrontendBlogReview = async (userData:loginUserData,reviewData: reviewDataInterface, callback: (error: any, result: any) => void) => {
    try {
      
        const newBlogReview = new BlogReviewSchema({
            user_id: userData.userId,
            blog_id: reviewData.blog_id,
            rating: reviewData.rating,
            comment: reviewData.comment,
            
        });

        const savedBlogReview = await newBlogReview.save();
        return callback(null, { savedBlogReview });

    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const storeFrontendListingReview = async (userData:loginUserData,reviewData: reviewListingDataInterface, callback: (error: any, result: any) => void) => {
    try {
      
        const newBlogReview = new ListingReviewSchema({
            user_id: userData.userId,
            listing_id: reviewData.listing_id,
            rating: reviewData.rating,
            comment: reviewData.comment,
            
        });

        const savedBlogReview = await newBlogReview.save();
        return callback(null, { savedBlogReview });

    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};







