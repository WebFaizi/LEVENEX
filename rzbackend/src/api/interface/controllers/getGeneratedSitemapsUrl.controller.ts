import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import process from "process";

//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const baseUrl = process.env.BASE_URL_TWO || "http://localhost:8000";

// Extract URLs from the sitemap
const extractUrlsFromSitemap = (filePath: string): string[] => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("Sitemap file not found.");
    }
    const sitemapContent = fs.readFileSync(filePath, "utf8");
    console.log("sitemapContent",sitemapContent)
    const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
    return urlMatches.map((url) =>
      url.replace("<loc>", "").replace("</loc>", "").trim()
    );
  } catch (error) {
    console.error("❌ Error reading sitemap file:", error);
    return [];
  }
};

// Controller to get category sitemap URLs
export const getGenerateSitemaps = (req: Request, res: Response) => {
  try {

    const {module_name,type} = req.query;
    let sitemapFileName = "";
    if(module_name == "category"){
        sitemapFileName = "sitemap-category.xml";
    }else if(module_name == "listing"){
        sitemapFileName = "sitemap-listing.xml";
    }else if(module_name == "featured"){
        sitemapFileName = "sitemap-featured-listing.xml";
    }else if(module_name == "product_details"){
        sitemapFileName = "sitemap-product-details.xml";
    }else if(module_name == "product"){
        sitemapFileName = "sitemap-product-list.xml";
    }else if(module_name == "blog"){
        sitemapFileName = "sitemap-blogs.xml";
    }else if(module_name == "search_keyword"){
        sitemapFileName = "sitemap-search-keyword.xml";
    }else if(module_name == "job_category"){
        sitemapFileName = "sitemap-job-category.xml";
    }else if(module_name == "job_listing"){
        sitemapFileName = "sitemap-job-listing.xml";
    }else{
        if(type == "one"){
            sitemapFileName = "sitemap-custom-url-one.xml";
        }else if(type == "two"){
            sitemapFileName = "sitemap-custom-url-two.xml";
        }else if(type == "three"){
            sitemapFileName = "sitemap-custom-url-three.xml";
        }else{
            sitemapFileName = "sitemap-custom-url-four.xml";
        }
    }
        
    const sitemapPath = path.join(outputDir, sitemapFileName);
    const urls = extractUrlsFromSitemap(sitemapPath);
    return successResponse(res, "Category sitemap URLs fetched successfully.", {
      sitemapUrl: `${process.env.BASE_URL_TWO}/sitemap-collection/${sitemapFileName}`,
      urls,
    });
  } catch (error) {
    console.error("❌ Error fetching category sitemap URLs:", error);
    return ErrorResponse(res, "Failed to retrieve sitemap URLs.");
  }
};
