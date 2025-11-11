import express, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import fs from "fs";
import path from "path";
import { slugify } from "../../utils/slugify";
import BlogSchema from "../../domain/schema/blog.schema";

import dotenv from 'dotenv';
dotenv.config(); // Load env variable

const baseUrl = process.env.BASE_URL_TWO;
//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const urlsPerFile = 1000;

// Ensure sitemap directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("Created sitemap directory:", outputDir);
}

// Fetch all listings
const fetchListings = async () => {
  try {
    return await BlogSchema.find();
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw new Error("Failed to fetch listings from database");
  }
};

// Generate listing URLs
const generateListingUrls = async (): Promise<string[]> => {
  const blogs = await fetchListings();
  return blogs.map((blog) => {
    const blogSlug = slugify(blog.id);
    return `${baseUrl}/blog-details/${blogSlug}`;
  });
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
  const indexPath = path.join(outputDir, "sitemap-blogs.xml");
  fs.writeFileSync(indexPath, indexContent);
  console.log(`✅ Created sitemap index: ${indexPath}`);
};

// Main function to generate listing sitemaps
export const generateBlogDetailsSitemaps = async (req: Request, res: Response) => {
  try {
    const urls = await generateListingUrls();
    let fileIndex = 1;
    const sitemapLinks: string[] = [];

    for (let i = 0; i < urls.length; i += urlsPerFile) {
      const chunk = urls.slice(i, i + urlsPerFile);
      const fileName = `sitemap-blogs-${fileIndex}.xml`;
      const filePath = path.join(outputDir, fileName);

      writeSitemapFile(filePath, chunk);
       const fullUrl = `${baseUrl}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
      sitemapLinks.push(fullUrl);

      fileIndex++;
    }

    writeSitemapIndex(sitemapLinks);

    console.log("✅ Listing sitemaps generation completed!");
    return successResponse(
      res,
      "Listing sitemaps generated successfully.",
      sitemapLinks
    );
  } catch (error) {
    console.error("❌ Error generating listing sitemaps:", error);
    return ErrorResponse(res, "An error occurred while generating listing sitemaps.");
  }
};