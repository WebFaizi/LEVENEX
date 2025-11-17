import express, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import fs from "fs";
import path from "path";
import { slugify } from "../../utils/slugify";
import CategorySchema from "../../domain/schema/category.schema";
import City from "../../domain/schema/city.schema";
import Area from "../../domain/schema/area.schema";
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config(); // Load env variable

const BASE_URL = process.env.BASE_URL_TWO;

const default_city = "67dd00f2824d6d721ac0e3cb"

// const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");

//For storing in the Backend
//const outputDir = path.join(process.cwd(), "sitemap");

//For Local Development
//const outputDir = path.join(process.cwd(), "..", "rentalzone_next", "public", "sitemap-collection");

const urlsPerFile = 1000;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("Created sitemap directory:", outputDir);
}

const fetchData = async () => {
  try {
    const [categories, cities, areas] = await Promise.all([
      CategorySchema.find(),
      City.find(),
      Area.find(),
    ]);
    return { categories, cities, areas };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data from database");
  }
};

const generateUrls = async (): Promise<string[]> => {
  const { categories, cities, areas } = await fetchData();
  const urls: string[] = [];

  categories.forEach((category) => {
    cities.forEach((city) => {
        const citySlug = slugify(city.name);
      urls.push(`${BASE_URL}/${category.slug}-${citySlug}/${category.unique_id}`);
    });
    areas.forEach((area) => {
        const areaSlug = slugify(area.name);
      urls.push(`${BASE_URL}/${category.slug}-${areaSlug}/${category.unique_id}`);
    });
  });

  console.log(`Generated ${urls.length} URLs.`);
  return urls;
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
  const indexPath = path.join(outputDir, "sitemap-category.xml");
  fs.writeFileSync(indexPath, indexContent);
  console.log(`✅ Created sitemap index: ${indexPath}`);
};

export const generateSitemaps = async (req: Request, res: Response) => {
  try {
    const urls = await generateUrls();
    let fileIndex = 1;
    const sitemapLinks: string[] = [];

    for (let i = 0; i < urls.length; i += urlsPerFile) {
      const chunk = urls.slice(i, i + urlsPerFile);
      const fileName = `sitemap-category-${fileIndex}.xml`;
      const filePath = path.join(outputDir, fileName);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      writeSitemapFile(filePath, chunk);

     const fullUrl = `${BASE_URL}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
      sitemapLinks.push(fullUrl);
      fileIndex++;
    }

    writeSitemapIndex(sitemapLinks);

    console.log("✅ Sitemaps generation completed!");
    return successResponse(res, "Sitemaps generated successfully.", sitemapLinks);
  } catch (error) {
    console.error("❌ Error generating sitemaps:", error);
    return ErrorResponse(res, "An error occurred while generating sitemaps.");
  }
};

