import Quotation from "../schema/quotation.schema";
import User from "../schema/user.schema";
import subscribersSchema from "../schema/subscribers.schema";
import { sendQoutationMailService } from "../../services/sendQuotationMail.service";
import { sendQoutationWhatsappService } from "../../services/sendQoutationWhatsappService.service";
import NewsLetterSchema from "../schema/newsLetter.schema";
import categorySchema from "../schema/category.schema";
import FeaturedListing from "../schema/featuredListing.schema";
import { any } from "joi";

interface quotationSchema {
  quotation_type: string;
  name: string;
  quantity: string;
  email: string;
  phone_number: string;
  location: string;
  message: string;
  category_ids: any;
  listing: any;
  ip_address?: string;
}

interface QuotationStatus {
  quotation_id: string;
  status: string;
  type: string;
}

export const storeQuotationModel = async (
  quotationData: quotationSchema,
  callback: (error: any, result: any) => void
) => {
  const categoryIds = quotationData.category_ids.map(Number);  
 const listing = await FeaturedListing.aggregate([
  { $sort: { position: 1 } },
  {
    $match: {
      category_ids: { $in: categoryIds }
    }
  },
  {
    $lookup: {
      from: "listings",
      localField: "listing_id",
      foreignField: "listing_unique_id",
      as: "listingData"
    }
  },
  {
    $unwind: {
      path: "$listingData",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $lookup: {
      from: "cities",
      let: { cityIds: "$listingData.city_id" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$unique_id", "$$cityIds"] }
          }
        }
      ],
      as: "listingData.city"
    }
  },
  {
    $lookup: {
      from: "categories",
      let: { catIds: "$category_ids" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$unique_id", "$$catIds"] }
          }
        }
      ],
      as: "listingData.category"
    }
  },
  {
    $limit: 5
  },
  {
    $project: {
      _id: 0,
      title: 1,
      listing_id: 1,
      category_ids: 1,
      listingData: 1,
      createdAt: 1,
      updatedAt: 1
    }
  }
]);


  
  quotationData.listing = listing;

  // quotationData.category_ids = categories;

  try {
    const newQuotation = new Quotation({
      ...quotationData,
      status: "pending"
    });

    const lists = await subscribersSchema.findOne({ email: quotationData.email });
    if (!lists) {
      const newSubscriber = new subscribersSchema({
        name: quotationData.name,
        email: quotationData.email,
        status: true
      });
      await newSubscriber.save();
    }

    await newQuotation.save();
    let newsletter_schema = await NewsLetterSchema.aggregate([  
      {
        $lookup: {
          from: "listings",
          localField: "newsletter_listing_id",
          foreignField: "listing_unique_id",
          as: "listingData"
        }
      },
      { $unwind: "$listingData" },
      {
        $unwind: {
          path: "$listingData.city_id",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "cities",
          localField: "listingData.city_id",
          foreignField: "unique_id",
          as: "listingData.city"
        }
      },
      {
        $unwind: {
          path: "$listingData.category_ids",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "listingData.category_ids",
          foreignField: "unique_id",
          as: "listingData.category"
        }
      },
      {
        $unwind: {
          path: "$listingData.category",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$listingData.city",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            newsletterId: "$_id",
            listingId: "$listingData._id"
          },
          newsletter_description: { $first: "$newsletter_description" },
          newsletter_banner_image: { $first: "$newsletter_banner_image" },
          listingName: { $first: "$listingData.name" },
          phone_number: { $first: "$listingData.phone_number" },
          email: { $first: "$listingData.email" },
          cities: {
            $addToSet: "$listingData.city"
          },
          category_ids: {
            $addToSet: "$listingData.category"
          }
        }
      },
      {
        $group: {
          _id: "$_id.newsletterId",
          newsletter_description: { $first: "$newsletter_description" },
          newsletter_banner_image: { $first: "$newsletter_banner_image" },
          listings: {
            $push: {
              _id: "$_id.listingId",
              name: "$listingName",
              cities: "$cities",
              phone_number: "$phone_number",
              email: "$email",
              category_ids: "$category_ids"
            }
          }
        }
      },

      // Step 8: Optional sort
      { $sort: { title: 1 } }
    ]);

    callback(null, newQuotation);   

    sendQoutationMailService(quotationData, newsletter_schema)
      .then(() => {
        console.log("Quotation mail sent successfully");
      })
      .catch((err) => {
        console.error("Failed to send quotation mail:", err);
      });

    sendQoutationWhatsappService(quotationData)
      .then(() => {
        console.log("Quotation whatsapp sent successfully");
      })
      .catch((err) => {
        console.error("Failed to send quotation whatsapp:", err);
      });
  } catch (error) {
    callback(error, null);
  }
};

export const subscriberList = async (search: string, page: number, limit: number) => {
  try {
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const skip = (page - 1) * limit;

    const lists = await subscribersSchema.find(searchQuery).skip(skip).limit(limit).exec();

    const totalLists = await subscribersSchema.countDocuments(searchQuery);

    return {
      data: lists,
      totalLists,
      totalPages: Math.ceil(totalLists / limit),
      currentPage: page
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching users");
  }
};

export const quotationList = async (
  search: string,
  page: number,
  limit: number,
  quotation_list_type: number,
  start_date?: string,
  end_date?: string
) => {
  try {
    const skip = (page - 1) * limit;
    const matchQuery: any = {};

    // Date filters
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        matchQuery.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    // Aggregation pipeline
    const pipeline: any[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "categories",
          let: { listingCategoryIds: "$category_ids" }, // these are strings
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [{ $toString: "$unique_id" }, "$$listingCategoryIds"]
                }
              }
            },
            {
              $project: {
                _id: 0,
                unique_id: 1,
                name: 1
              }
            }
          ],
          as: "category_ids" // ✅ this replaces the original category_ids with full category objects
        }
      }
    ];

    // Apply search filter (including category name)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { message: { $regex: search, $options: "i" } },
            { phone_number: { $regex: search, $options: "i" } },
            { quotation_type: { $regex: search, $options: "i" } },
            { "categories.name": { $regex: search, $options: "i" } } // ✅ category name search
          ]
        }
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    const allQuotations = await Quotation.aggregate(pipeline);

    // Extract emails for filtering
    const quotationEmails = allQuotations.map((q) => q.email);

    const existingUsers = await User.find(
      { email: { $in: quotationEmails } },
      { email: 1, _id: 0 }
    ).lean();

    const userEmailSet = new Set(existingUsers.map((user) => user.email));

    // Apply quotation_list_type filter
    const filteredQuotations = allQuotations.filter((quotation) => {
      const emailExists = userEmailSet.has(quotation.email);
      if (quotation_list_type == 1) return !emailExists;
      if (quotation_list_type == 2) return emailExists;
      return true;
    });

    // Pagination
    const paginatedQuotations = filteredQuotations.slice(skip, skip + limit);

    // Format results
    const results = paginatedQuotations.map((quotation: any) => {
      const categoryNames = (quotation.categories || []).map((cat: any) => cat.name).join(", ");
      const emailExists = userEmailSet.has(quotation.email);
      return {
        ...quotation,
        category_names: categoryNames,
        type: emailExists ? "seller" : "user"
      };
    });

    return {
      data: results,
      totalLists: filteredQuotations.length,
      totalPages: Math.ceil(filteredQuotations.length / limit),
      currentPage: page
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching quotations");
  }
};

export const updateQuotationModel = async (
  quotationData: QuotationStatus,
  callback: (error: any, result: any) => void
) => {
  try {
    const { quotation_id, status, type } = quotationData;

    const quotation = await Quotation.findById(quotation_id);
    if (!quotation) {
      return callback(new Error("Quotation not found"), null);
    }

    if (type == "1") {
      if (status !== "pending" && status !== "approved") {
        return callback(
          new Error('Invalid status value. It must be either "pending" or "approved".'),
          null
        );
      }
      quotation.status = status;
    } else {
      if (status !== "yes" && status !== "no") {
        return callback(
          new Error('Invalid status value. It must be either "pending" or "approved".'),
          null
        );
      }
      quotation.view_by_admin = status;
    }

    await quotation.save();

    return callback(null, quotation);
  } catch (error) {
    console.error("Error updating quotation:", error);
    return callback(new Error("Error updating quotation"), null);
  }
};

export const quotationListExport = async (
  search: string,
  start_date?: string,
  end_date?: string,
  quotation_list_type?: number
) => {
  try {
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { phone_number: { $regex: search, $options: "i" } },
        { quotation_type: { $regex: search, $options: "i" } }
      ];
    }

    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .populate("category_ids", "name")
      .exec();

    const emails = quotations.map((q) => q.email);
    const existingUsers = await User.find({ email: { $in: emails } }, { email: 1, _id: 0 }).lean();

    const userEmailSet = new Set(existingUsers.map((user) => user.email));

    const filteredQuotations = quotations.filter((q) => {
      const emailExists = userEmailSet.has(q.email);
      if (quotation_list_type == 1) return !emailExists;
      if (quotation_list_type == 2) return emailExists;
      return true;
    });

    const data = filteredQuotations.map((quotation) => ({
      ...quotation.toObject(),
      category_names: quotation.category_ids.map((category: any) => category.name).join(", "),
      type: userEmailSet.has(quotation.email) ? "seller" : "user"
    }));

    return { data };
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw new Error("Error fetching quotations from the database.");
  }
};
