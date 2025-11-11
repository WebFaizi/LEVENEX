import express, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import fs from "fs";
import path from "path";
import { slugify } from "../../utils/slugify";
import BlogSchema from "../../domain/schema/blog.schema";
import { XMLParser } from "fast-xml-parser";

import dotenv from 'dotenv';
dotenv.config(); // Load env variable

const baseUrl = process.env.BASE_URL_TWO;
//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const urlsPerFile = 1000;

const writeSitemapFile = (filePath: string, urls: string[], type: string) => {
  const today = new Date().toISOString().split("T")[0]; // e.g., 2025-06-02

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`)
    .join("\n")}\n</urlset>`;

  fs.writeFileSync(filePath, sitemapContent);
  console.log(`✅ Created ${type} sitemap: ${filePath}`);
};

const writeSitemapIndex = (filePaths: string[], type: string) => {
  const today = new Date().toISOString().split("T")[0];

  const indexContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filePaths
    .map((filePath) => `  <sitemap><loc>${filePath}</loc><lastmod>${today}</lastmod></sitemap>`)
    .join("\n")}\n</sitemapindex>`;

  const indexPath = path.join(outputDir, `sitemap-custom-url-${type}.xml`);

    // ✅ Ensure directory exists before writing the file
  const indexDir = path.dirname(indexPath);
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  
  fs.writeFileSync(indexPath, indexContent);
  console.log(`✅ Created ${type} sitemap index: ${indexPath}`);
};

// Main function to generate listing sitemaps
export const generateCustomSitemaps = async (req: Request, res: Response) => {
  try {
    const {urls,type} = req.body;
    let fileIndex = 1;
    const sitemapLinks: string[] = [];


    for (let i = 0; i < urls.length; i += urlsPerFile) {
      const chunk = urls.slice(i, i + urlsPerFile);
      const fileName = `sitemap-custom-url-${type}-${fileIndex}.xml`;
      const filePath = path.join(outputDir, fileName);

      writeSitemapFile(filePath, chunk,type);
       const fullUrl = `${baseUrl}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
      sitemapLinks.push(fullUrl);

      fileIndex++;
    }

    writeSitemapIndex(sitemapLinks,type);

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

export const updateCustomSitemaps = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const allUrls = new Set<string>();
    const parser = new XMLParser();

    // Step 1: Read all existing sitemap files of the given type
    const files = fs.readdirSync(outputDir).filter(file => file.startsWith(`sitemap-custom-url-${type}-`) && file.endsWith(".xml"));
    console.log(`Found ${files.length} existing sitemap files for type "${type}".`);
    if (files.length === 0) {
      console.log("No existing sitemap files found. Creating new sitemap.");
    } 
    for (const file of files) {
      const xml = fs.readFileSync(path.join(outputDir, file), "utf-8");
      const parsed = parser.parse(xml);

      const urls = parsed?.urlset?.url || [];
      if (Array.isArray(urls)) {
        urls.forEach((entry) => {
          if (entry.loc) allUrls.add(entry.loc);
        });
      } else if (urls?.loc) {
        allUrls.add(urls.loc);
      }
    }

    // Step 4: Re-split and regenerate sitemap files
    const sortedUrls = Array.from(allUrls).sort(); // Optional sorting
    let fileIndex = 1;
    const sitemapLinks: string[] = [];

    console.log("✅ Sitemap updated successfully.");
    return successResponse(res, "custom urls successfully.", sortedUrls);
  } catch (error) {
    console.error("❌ Error updating sitemap:", error);
    return ErrorResponse(res, "An error occurred while updating the sitemap.");
  }
};