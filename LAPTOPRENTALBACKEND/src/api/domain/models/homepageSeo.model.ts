import HomepageSeoSchema from "../schema/homepage_seo.schema";
import SettingSchema from "../schema/setting.schema";
import categorySchema from "../schema/category.schema";
import citySchema from "../schema/city.schema";
import areaSchema from "../schema/area.schema";
import jobCategorySchema from "../schema/jobCategory.schema";
import blogDetailsSchema from "../schema/blog.schema";
import jobSchema from "../schema/jobs.schema";
import { replacePlaceholders } from "../../services/ReplaceText.service";
import getLocationDetails, { getDefaultLoactionDetails } from "../../services/currentLocation.service";
import { getCategoryDetails } from "../../services/categoryDetails.service";
import { getCategorySeoDetails } from "../../services/categorySeoDetails.service";
import { getProductById } from "../../services/productListById.service";
import { getLocationDetailsByName } from "../../services/getLocationDetailsByName.service";
import { getListingDetailsData } from "../../services/listingDetailsData.service";

interface homepageSeoInterface {
  page_title: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
}

interface serverSideMetaInterface {
  slug: string;
  type: string;
  current_url: string;
}

export const extractCategoryAndLocation = async (
  url_slug: string
): Promise<{
  category: string | null;
  location: string | null;
  category_unique_id: number | null;
}> => {
  if (!url_slug || typeof url_slug !== "string") {
    throw new Error("Invalid slug provided");
  }

  let category: any = null;
  let category_unique_id: any = null;
  let location: any = null;

  const parts = url_slug.split("-");

  for (let i = parts.length; i > 0; i--) {
    const possibleCategorySlug = parts.slice(0, i).join("-");
    let possibleLocationSlug = parts.slice(i).join("-");
    const categoryCheck = await categorySchema.findOne({ slug: possibleCategorySlug }).lean();

    if (categoryCheck) {
      category = categoryCheck._id;
      category_unique_id = categoryCheck.unique_id;
      possibleLocationSlug = possibleLocationSlug.replace(/-/g, " ");
      
      location =
        (await citySchema.findOne({ name: { $regex: new RegExp(`^${possibleLocationSlug}$`, "i") } }).lean()) ||
        (await areaSchema.findOne({ name: { $regex: new RegExp(`^${possibleLocationSlug}$`, "i") } }).lean());      
      if (location) {
        location = location._id;
      }
      break;
    }
  }

  return { category, location, category_unique_id };
};

export const serverSideMetaDetailsModel = async (serverSideMetaData: serverSideMetaInterface, callback: (error: any, result: any) => void) => {
  try {
    const common_settingData: Record<string, any> = SettingSchema.findOne();
    let current_location = await getDefaultLoactionDetails();
    const { type, slug, current_url } = serverSideMetaData;

    let meta_details: Record<string, any> = {};

    const generateMeta = (data: any, image: string = "", location: any) => ({
      page_title: replacePlaceholders(data?.page_title || "Homepage", location),
      meta_title: replacePlaceholders(data?.meta_title || "Homepage", location),
      meta_description: replacePlaceholders(data?.meta_description || "Homepage", location),
      meta_keywords: replacePlaceholders(data?.meta_keywords || "Homepage", location),
      ogTitle: replacePlaceholders(data?.meta_title || "Homepage", location),
      ogDescription: replacePlaceholders(data?.meta_description || "Homepage", location),
      ogImage: image,
      canonical: current_url || "",
    });

    if (type === "homepage") {
      const replacements_location = {
            area: (current_location as any)?.area_name || "",
            city: current_location?.city_name || "",
            location: (current_location as any)?.area_name || current_location?.city_name || "",
            location1: (current_location as any)?.area_name || current_location?.city_name || ""
        };
      const [existingdata, settingData] = await Promise.all([HomepageSeoSchema.findOne(), SettingSchema.findOne()]);
      meta_details = generateMeta(existingdata, settingData?.website_logo ? `${process.env.BASE_URL}/${settingData?.website_logo}` : "", replacements_location);
    } else if (type === "slug") {
      if (slug.includes("/") && !slug.startsWith("product-list-") && !slug.startsWith("pro-") && !slug.includes("-jobs-in-") && !slug.includes("jobs-")) {
        const [categorySlug] = slug.split("/");
        const { category, location, category_unique_id } = await extractCategoryAndLocation(categorySlug);
        let current_location = {};
        current_location = location ? await getLocationDetails(location) : "mumbai";

        let category_details: Record<string, any> = {};
        let category_seo_details: Record<string, any> = {};

        [category_seo_details, category_details] = await Promise.all([
          getCategorySeoDetails(category_unique_id, 1, current_location),
          getCategoryDetails(category, 1, current_location),
        ]);        
        meta_details = generateMeta(category_seo_details, category_details?.desktop_image, current_location);
      } else if (slug.startsWith("pro-")) {
        const slugParts = slug.split("-");
        const lastPart = slugParts[slugParts.length - 1];        
        if (/^\d+$/.test(lastPart)) {
          const product_id = parseInt(lastPart);
          const product_details: any = await getProductById(product_id);
          if (!product_details) return; // Early return on failure
          const product_data = product_details.product_listing_id;
          const seo_object = {
            page_title: product_data?.product_name || "Default Title",
            meta_title: product_data?.product_name || "Default Meta Title",
            meta_description: product_data?.meta_description || "Default Meta Description",
            meta_keywords: product_data?.product_description || "",
          };
          const replacements_location = {
            area: (current_location as any)?.area_name || "",
            city: current_location?.city_name || "",
            location: (current_location as any)?.area_name || current_location?.city_name || "",
            location1: (current_location as any)?.area_name || current_location?.city_name || "",
        };
          const imageBaseUrl = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.laptoprental.co";
          meta_details = generateMeta(
            seo_object,
            common_settingData?.desktop_image ? `${imageBaseUrl}/${common_settingData?.desktop_image}` : "",
            replacements_location
          );
        }
      } else if (typeof slug == "string" && slug.includes("product-list-")) {
        const [categorySlug, category_id] = slug.replace("product-list-", "").split("/");
        const category_details = await categorySchema.findOne({ unique_id: category_id }).lean();
        let current_location = {};
        let location = "mumbai";
        current_location = location ? await getLocationDetails(location) : "mumbai";
        const product_seo: any = await getCategorySeoDetails(category_details?.unique_id as number, 1, current_location);        
        const seo_object = {
          page_title: (product_seo?.product_title as string) || "Default Title",
          meta_title: (product_seo?.product_title as string) || "Default Meta Title",
          meta_description: (product_seo?.product_meta_description as string) || "Default Meta Description",
          meta_keywords: (product_seo?.product_meta_keywords as string) || "",
        };
        const imageBaseUrl2 = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.laptoprental.co";
        meta_details = generateMeta(
          seo_object,
          common_settingData?.desktop_image ? `${imageBaseUrl2}/${common_settingData?.desktop_image}` : "",
          current_location
        );
      } else if (typeof slug == "string" && slug.includes("-jobs-in-")) {
        const [categorySlug, category_id] = slug.split("/");
        const parts = categorySlug.split("jobs-in-");
        const converted_location = parts.length > 1 ? parts[1] : "";
        const current_location = converted_location.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
        const location_details = await getLocationDetailsByName(current_location);
        if (/^\d+$/.test(category_id)) {
          let current_location_string;
          if (location_details.area_name) {
            current_location_string = location_details.area_name;
          } else {
            current_location_string = location_details.city_name;
          }
        }
        const category_details = await jobCategorySchema.findOne({
          unique_id: Number(category_id),
        });
        if (category_details) {
          const seo_object = {
            page_title: category_details?.name || "Default Title",
            meta_title: category_details?.name || "Default Meta Title",
            meta_description: category_details?.name || "Default Meta Description",
            meta_keywords: category_details?.name || "",
          };

          const ogImage = common_settingData?.desktop_image ?? "";
          meta_details = generateMeta(seo_object, ogImage ? `${process.env.BASE_URL}/${ogImage}` : "", location_details);
        }
      } else if (typeof slug == "string" && slug.includes("jobs-")) {
        const slugParts = slug.split("-");
        const jobId = slugParts[slugParts.length - 1];
        const find_location = await extractLocationFromSlug(slug);
        const current_location = await getLocationDetailsByName(find_location);

        const job_detail = await jobSchema.findOne({ unique_id: jobId }).populate("job_category_id").lean();

        const seo_object = {
          page_title: job_detail?.job_title || "Default Title",
          meta_title: job_detail?.meta_title || "Default Meta Title",
          meta_description: job_detail?.meta_description || "Default Meta Description",
          meta_keywords: job_detail?.keywords_tag?.join(", ") || "",
        };

        const ogImage = common_settingData?.desktop_image ?? "";
        meta_details = generateMeta(seo_object, ogImage ? `${process.env.BASE_URL}/${ogImage}` : "", current_location);
      } else if (slug.includes("-")) {
        const slugParts = slug.split("-");
        const lastPart = slugParts[slugParts.length - 1];
        if (/^\d+$/.test(lastPart)) {
          const listing_id = parseInt(lastPart);
          let listing_details: Record<string, any> = {};
          listing_details = await getListingDetailsData(listing_id);
          const seo_object = {
            page_title: listing_details?.name || "Default Title",
            meta_title: listing_details?.name || "Default Meta Title",
            meta_description: listing_details?.description || "Default Meta Description",
            meta_keywords: listing_details?.name || "",
          };
          const ogImage = listing_details?.listig_image_url ?? "";
          meta_details = generateMeta(seo_object, ogImage ? `${process.env.BASE_URL}/${ogImage}` : "", current_location);
        }
      }
    } else if (type === "static_page") {
      if (slug === "about-us") {
        const seo_object = {
          page_title: "About Us - Your Go-To Rental Platform",
          meta_title: "About Us | Trusted Rental Marketplace for Category-Wise Product Rentals",
          meta_description:
            "Learn more about our mission, team, and how we simplify renting products across categories like electronics, furniture, vehicles, and more. Discover why thousands trust us for reliable rentals.",
          meta_keywords: "about rental website, product rental service, rent electronics, rent furniture, category-wise rentals, rental platform",
        };
        meta_details = generateMeta(
          seo_object,
          common_settingData?.website_logo ? `${process.env.BASE_URL}/${common_settingData?.website_logo}` : "",
          current_location
        );
      } else if (slug === "terms-and-conditions") {
        const seo_object = {
          page_title: "Terms and Conditions - Rental Service Policies",
          meta_title: "Terms and Conditions | Rules for Using Our Rental Services",
          meta_description:
            "Read the terms and conditions that govern your use of our rental platform. Understand your rights, responsibilities, and the policies for renting products securely and fairly.",
          meta_keywords: "rental terms, rental conditions, product rental policies, rental agreement, rental service rules",
        };
        meta_details = generateMeta(
          seo_object,
          common_settingData?.website_logo ? `${process.env.BASE_URL}/${common_settingData?.website_logo}` : "",
          current_location
        );
      } else if (slug === "privacy-policy") {
        const seo_object = {
          page_title: "Privacy Policy - Your Data Is Safe With Us",
          meta_title: "Privacy Policy | How We Protect Your Information",
          meta_description:
            "Read our privacy policy to understand how we collect, use, and safeguard your personal information when you use our rental services. Your data privacy and security are our priority.",
          meta_keywords: "privacy policy, rental website privacy, data protection, user data policy, information security",
        };
        meta_details = generateMeta(
          seo_object,
          common_settingData?.website_logo ? `${process.env.BASE_URL}/${common_settingData?.website_logo}` : "",
          current_location
        );
      } else if (slug === "contact-us") {
        const seo_object = {
          page_title: "Contact Us - We're Here to Help",
          meta_title: "Contact Us | Get in Touch with Our Rental Support Team",
          meta_description:
            "Have questions or need help with a rental? Contact our support team for quick assistance. We’re here to help you with product inquiries, bookings, and more.",
          meta_keywords: "contact rental service, rental support, get in touch, product rental help, customer service",
        };
        meta_details = generateMeta(
          seo_object,
          common_settingData?.website_logo ? `${process.env.BASE_URL}/${common_settingData?.website_logo}` : "",
          current_location
        );
      } else if (slug === "login") {
        const seo_object = {
          page_title: "Login - Manage or List Your Rental Products",
          meta_title: "Login | Access Your Rental Account or List Your Product",
          meta_description:
            "Login to your account to manage rentals, add new product listings, and connect with users looking to rent. Secure access to your rental dashboard starts here.",
          meta_keywords: "login rental account, list product for rent, user dashboard, rental login, manage rental listings",
        };
        meta_details = generateMeta(
          seo_object,
          common_settingData?.website_logo ? `${process.env.BASE_URL}/${common_settingData?.website_logo}` : "",
          current_location
        );
      } else if (slug === "register") {
        const seo_object = {
          page_title: "Register - Start Renting or Listing Products",
          meta_title: "Register | Create Your Rental Account and Start Listing",
          meta_description:
            "Sign up now to create your rental account, list products for rent, and manage your bookings. Join our rental community and start earning today.",
          meta_keywords: "register rental account, sign up rental site, list for rent, create rental profile, start renting",
        };
        meta_details = generateMeta(
          seo_object,
          common_settingData?.website_logo ? `${process.env.BASE_URL}/${common_settingData?.website_logo}` : "",
          current_location
        );
      }
    } else if (type === "blog") {
      if (slug == "blog_listing") {
        const seo_object = {
          page_title: "Blog - Renting Tips and Insights",
          meta_title: "Blog | Latest Articles and Tips for Renting Products",
          meta_description:
            "Explore our latest blog posts featuring tips, guides, and insights about renting products across categories like furniture, electronics, vehicles, and more.",
          meta_keywords: "blog, rental tips, product rental articles, renting advice, rental industry blog, rental guides",
        };
        const imageBaseUrl3 = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.latoprental.co";
        meta_details = generateMeta(
          seo_object,
          common_settingData?.desktop_image ? `${imageBaseUrl3}/${common_settingData?.desktop_image}` : "",
          current_location
        );
      } else {
        const BlogDetails = await blogDetailsSchema.findOne({ _id: slug });
        if (!BlogDetails) return; // Early return on failure
        const seo_object = {
          page_title: BlogDetails.blog_title,
          meta_title: BlogDetails.blog_title,
          meta_description: BlogDetails.content,
          meta_keywords: "",
        };
        const image = BlogDetails.images;
        meta_details = generateMeta(seo_object, image ? `${process.env.BASE_URL}/${image}` : "", current_location);
      }
    } else {
      meta_details = {
        title: "Default Title",
        description: "Default description",
        keywords: "default,keywords",
        ogTitle: "Default OG Title",
        ogDescription: "Default OG Description",
        ogImage: `${process.env.BASE_URL}/default-image-url.jpg`,
        canonical: current_url || "",
      };
    }

    callback(null, meta_details);
  } catch (error) {
    callback(error, null);
  }
};

const extractLocationFromSlug = async (slug: string) => {
  const cleanedSlug = slug
    .replace(/^jobs-/, "") // remove "jobs-" prefix
    .replace(/-\d+$/, "") // remove trailing ID
    .toLowerCase();

  const slugWords = new Set(cleanedSlug.split("-")); // use Set for faster lookup

  // Cache cities and areas to avoid repeated DB calls
  const cities = await citySchema.find({}, "name"); // just get name field
  const areas = await areaSchema.find({}, "name");

  let matchedCity = "";
  let matchedArea = "";

  // Match area (support multi-word like "central mumbai")
  for (const area of areas) {
    const areaWords = area.name.toLowerCase().split(" ");
    // Check if all area words exist in the slugWords Set
    if (areaWords.every((word) => slugWords.has(word))) {
      matchedArea = area.name;
      break;
    }
  }

  // Match city
  for (const city of cities) {
    const cityName = city.name.toLowerCase();
    // Check if the city exists in the slugWords Set
    if (slugWords.has(cityName)) {
      matchedCity = city.name;
      break;
    }
  }

  // Return matched area if available, else return matched city
  return matchedArea || matchedCity || "mumbai"; // return null if neither matched
};

export const updateHomepageSeoModel = async (homepageSeoData: homepageSeoInterface, callback: (error: any, result: any) => void) => {
  try {
    const existingdata = await HomepageSeoSchema.findOne();

    if (existingdata) {
      const updateddata = await HomepageSeoSchema.findByIdAndUpdate(existingdata._id, homepageSeoData, { new: true });
      return callback(null, { updateddata });
    } else {
      const newhomepageSeo = new HomepageSeoSchema(homepageSeoData);
      await newhomepageSeo.save();
      return callback(null, { newhomepageSeo });
    }
  } catch (error) {
    return callback(error, null);
  }
};
