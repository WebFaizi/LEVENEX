import express, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import fs from "fs";
import path from "path";
import { slugify } from "../../utils/slugify";
import City from "../../domain/schema/city.schema";
import Area from "../../domain/schema/area.schema";
import JoCategorySchema from "../../domain/schema/jobCategory.schema"; // JoCategory Schema
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BASE_URL_TWO || "";
//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const urlsPerFile = 1000;
const filePrefix = "sitemap-job-category";

const ensureDir = () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log("Created sitemap directory:", outputDir);
  }
};

const fetchJoCategoryData = async () => {
  try {
    const [joCategories, cities, areas] = await Promise.all([
      JoCategorySchema.find(),
      City.find(),
      Area.find(),
    ]);
    return { joCategories, cities, areas };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data from database");
  }
};

const generateJoCategoryUrls = async (): Promise<string[]> => {
  const { joCategories, cities, areas } = await fetchJoCategoryData();
  const urls: string[] = [];

  joCategories.forEach((category) => {
    cities.forEach((city) => {
      const citySlug = slugify(city.name);
      urls.push(`${BASE_URL}/${category.slug}-jobs-in-${citySlug}/${category.unique_id}`);
    });

    areas.forEach((area) => {
      const areaSlug = slugify(area.name);
      urls.push(`${BASE_URL}/${category.slug}-jobs-in-${areaSlug}/${category.unique_id}`);
    });
  });

  console.log(`Generated ${urls.length} URLs.`);
  return urls;
};

const writeSitemapFile = (filePath: string, urls: string[]) => {
  const today = new Date().toISOString().split("T")[0];
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`)
    .join("\n")}\n</urlset>`;

  fs.writeFileSync(filePath, sitemapContent);
  console.log(`✅ Created sitemap: ${filePath}`);
};

const writeSitemapIndex = (filePaths: string[]) => {
  const today = new Date().toISOString().split("T")[0];
  const indexContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filePaths
    .map((filePath) => `  <sitemap><loc>${filePath}</loc><lastmod>${today}</lastmod></sitemap>`)
    .join("\n")}\n</sitemapindex>`;

  const indexPath = path.join(outputDir, `${filePrefix}.xml`);
  fs.writeFileSync(indexPath, indexContent);
  console.log(`✅ Created sitemap index: ${indexPath}`);
};

export const generateJobCategorySitemaps  = async (req: Request, res: Response) => {
  try {
    ensureDir();

    const urls = await generateJoCategoryUrls();
    let fileIndex = 1;
    const sitemapLinks: string[] = [];

    for (let i = 0; i < urls.length; i += urlsPerFile) {
      const chunk = urls.slice(i, i + urlsPerFile);
      const fileName = `${filePrefix}-${fileIndex}.xml`;
      const filePath = path.join(outputDir, fileName);

      writeSitemapFile(filePath, chunk);

      const fullUrl = `${BASE_URL}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
      sitemapLinks.push(fullUrl);
      fileIndex++;
    }

    writeSitemapIndex(sitemapLinks);

    console.log("✅ JoCategory sitemaps generation completed!");
    return successResponse(res, "JoCategory sitemaps generated successfully.", sitemapLinks);
  } catch (error) {
    console.error("❌ Error generating jo_category sitemaps:", error);
    return ErrorResponse(res, "An error occurred while generating jo_category sitemaps.");
  }
};
