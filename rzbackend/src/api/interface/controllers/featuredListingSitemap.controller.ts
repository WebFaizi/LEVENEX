import express, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import fs from "fs";
import path from "path";
import { slugify } from "../../utils/slugify";
import ListingSchema from "../../domain/schema/listing.schema";
import FeaturedListingSchema from "../../domain/schema/featuredListing.schema";
import { findSourceMap } from "module";

import dotenv from 'dotenv';
dotenv.config(); // Load env variable

const baseUrl = process.env.BASE_URL_TWO;

//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const urlsPerFile = 1000;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("Created sitemap directory:", outputDir);
}

const fetchFeaturedListings = async () => {
    try {
      return await FeaturedListingSchema.find()
        .populate({
          path: "listing_id",
          select: "name listing_unique_id", // Only fetch necessary fields
        })
        .exec();
    } catch (error) {
      console.error("❌ Error fetching featured listings:", error);
      throw new Error("Failed to fetch data.");
    }
  };
  
  // Generate URLs for all featured listings
  export const generateFeaturedUrls = async (): Promise<string[]> => {
    try {
      const featuredListings = await fetchFeaturedListings();
      const urls: string[] = [];
  
      // Loop through featured listings and generate URLs
      featuredListings.forEach((item) => {
        const listing = item.listing_id as any;
  
        if (listing) {
          const slug = slugify(listing.name);
          urls.push(`${baseUrl}/${slug}-${listing.listing_unique_id}`);
        }
      });
  
      console.log(`✅ Generated ${urls.length} featured URLs.`);
      return urls;
    } catch (error) {
      console.error("❌ Error generating featured URLs:", error);
      throw error;
    }
  };

const writeSitemapFile = (filePath: string, urls: string[]) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`)
    .join("\n")}\n</urlset>`;
  fs.writeFileSync(filePath, sitemapContent);
  console.log(`✅ Created sitemap: ${filePath}`);
};

const writeSitemapIndex = (filePaths: string[]) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const indexContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filePaths
    .map((filePath) => `  <sitemap><loc>${filePath}</loc><lastmod>${today}</lastmod></sitemap>`)
    .join("\n")}\n</sitemapindex>`;
  const indexPath = path.join(outputDir, "sitemap-featured-listing.xml");
  fs.writeFileSync(indexPath, indexContent);
  console.log(`✅ Created sitemap index: ${indexPath}`);
};

export const generateFeaturedSitemaps = async (req: Request, res: Response) => {
  try {
    const urls = await generateFeaturedUrls();
    let fileIndex = 1;
    const sitemapLinks: string[] = [];

    for (let i = 0; i < urls.length; i += urlsPerFile) {
      const chunk = urls.slice(i, i + urlsPerFile);
      const fileName = `sitemap-featured-listing-${fileIndex}.xml`;
      const filePath = path.join(outputDir, fileName);

      writeSitemapFile(filePath, chunk);

       const fullUrl = `${baseUrl}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
      sitemapLinks.push(fullUrl);
      fileIndex++;
    }

    writeSitemapIndex(sitemapLinks);

    console.log("✅ Featured Listings sitemap generation completed!");
    return successResponse(res, "Featured Listings sitemaps generated successfully.", sitemapLinks);
  } catch (error) {
    console.error("❌ Error generating featured listings sitemaps:", error);
    return ErrorResponse(res, "An error occurred while generating featured listings sitemaps.");
  }
};
