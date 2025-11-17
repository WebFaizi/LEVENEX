import express, { Request, Response } from "express";
import { successResponse, ErrorResponse } from "../../helper/apiResponse";
import fs from "fs";
import path from "path";
import { slugify } from "../../utils/slugify";
import CategorySeoSchema from "../../domain/schema/categoryseo.schema";
import AreaSchema from "../../domain/schema/area.schema";
import CitySchema from "../../domain/schema/city.schema";
import dotenv from 'dotenv';
dotenv.config(); // Load env variable

const baseUrl = process.env.BASE_URL_TWO;
//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const urlsPerFile = 1000;

const getAreaAndCityLinks = async (keyword: string): Promise<string[]> => {
    try {
      // Fetch areas and cities from the database
      const [areas, cities] = await Promise.all([
        AreaSchema.find(),
        CitySchema.find(),
      ]);
  
      const baseUrl = process.env.BASE_URL_TWO || "http://localhost:3000";
      console.log(baseUrl);
  
      const areaLinks: string[] = areas.map((area) => {
        let word = keyword.replace("%location%", "").replace("%city%", "").replace("%location1%", area.name.toLowerCase());
        return `${baseUrl}/${slugify(word)}`;
      });
  
      const cityLinks: string[] = cities.map((city) => {
        let word = keyword.replace("%location%", "").replace("%area%", "").replace("%city%", city.name.toLowerCase());
        return `${baseUrl}/${slugify(word)}`;
      });
  
      return [...areaLinks, ...cityLinks];
    } catch (error) {
      console.error("Error generating links:", error);
      throw new Error("Failed to generate area and city links");
    }
  };

// Ensure sitemap directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("Created sitemap directory:", outputDir);
}

const fetchListings = async () => {
    try {
      const categorySeo = await CategorySeoSchema.find();
  
      const searchByKeywords = categorySeo.flatMap((cs) =>
        (cs?.meta_keywords || "")
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean)
      );
  
      return searchByKeywords;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw new Error("Failed to fetch listings from database");
    }
  };

// Generate listing URLs
const generateListingUrls = async (): Promise<string[]> => {
    try {
      const searchKeywords = await fetchListings();
      const urls: string[] = [];
  
      for (const searchKeyword of searchKeywords) {
        // Fetch area and city links for each keyword
      
        const blogSlugs = await getAreaAndCityLinks(searchKeyword);
  
        // Generate URLs for all slugs
        blogSlugs.forEach((slug) => {
          urls.push(`${baseUrl}/${slug}`);
        });
      }
  
      return urls;
    } catch (error) {
      console.error("Error generating listing URLs:", error);
      throw new Error("Failed to generate listing URLs");
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
  const indexPath = path.join(outputDir, "sitemap-search-keyword.xml");
  fs.writeFileSync(indexPath, indexContent);
  console.log(`✅ Created sitemap index: ${indexPath}`);
};

// Main function to generate listing sitemaps
export const generateSearchKeywordSitemaps = async (req: Request, res: Response) => {
  try {

    const urls = await generateListingUrls();
    let fileIndex = 1;
    const sitemapLinks: string[] = [];

    for (let i = 0; i < urls.length; i += urlsPerFile) {
      const chunk = urls.slice(i, i + urlsPerFile);
      const fileName = `sitemap-search-keyword-${fileIndex}.xml`;
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