"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenerateSitemaps = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const apiResponse_1 = require("../../helper/apiResponse");
const process_1 = __importDefault(require("process"));
//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path_1.default.join(process_1.default.cwd(), "..", "frontend", "public", "sitemap-collection");
const baseUrl = process_1.default.env.BASE_URL_TWO || "http://localhost:8000";
// Extract URLs from the sitemap
const extractUrlsFromSitemap = (filePath) => {
    try {
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error("Sitemap file not found.");
        }
        const sitemapContent = fs_1.default.readFileSync(filePath, "utf8");
        console.log("sitemapContent", sitemapContent);
        const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
        return urlMatches.map((url) => url.replace("<loc>", "").replace("</loc>", "").trim());
    }
    catch (error) {
        console.error("❌ Error reading sitemap file:", error);
        return [];
    }
};
// Controller to get category sitemap URLs
const getGenerateSitemaps = (req, res) => {
    try {
        const { module_name, type } = req.query;
        let sitemapFileName = "";
        if (module_name == "category") {
            sitemapFileName = "sitemap-category.xml";
        }
        else if (module_name == "listing") {
            sitemapFileName = "sitemap-listing.xml";
        }
        else if (module_name == "featured") {
            sitemapFileName = "sitemap-featured-listing.xml";
        }
        else if (module_name == "product_details") {
            sitemapFileName = "sitemap-product-details.xml";
        }
        else if (module_name == "product") {
            sitemapFileName = "sitemap-product-list.xml";
        }
        else if (module_name == "blog") {
            sitemapFileName = "sitemap-blogs.xml";
        }
        else if (module_name == "search_keyword") {
            sitemapFileName = "sitemap-search-keyword.xml";
        }
        else if (module_name == "job_category") {
            sitemapFileName = "sitemap-job-category.xml";
        }
        else if (module_name == "job_listing") {
            sitemapFileName = "sitemap-job-listing.xml";
        }
        else {
            if (type == "one") {
                sitemapFileName = "sitemap-custom-url-one.xml";
            }
            else if (type == "two") {
                sitemapFileName = "sitemap-custom-url-two.xml";
            }
            else if (type == "three") {
                sitemapFileName = "sitemap-custom-url-three.xml";
            }
            else {
                sitemapFileName = "sitemap-custom-url-four.xml";
            }
        }
        const sitemapPath = path_1.default.join(outputDir, sitemapFileName);
        const urls = extractUrlsFromSitemap(sitemapPath);
        return (0, apiResponse_1.successResponse)(res, "Category sitemap URLs fetched successfully.", {
            sitemapUrl: `${process_1.default.env.BASE_URL_TWO}/sitemap-collection/${sitemapFileName}`,
            urls,
        });
    }
    catch (error) {
        console.error("❌ Error fetching category sitemap URLs:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Failed to retrieve sitemap URLs.");
    }
};
exports.getGenerateSitemaps = getGenerateSitemaps;
//# sourceMappingURL=getGeneratedSitemapsUrl.controller.js.map