"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateListingSitemaps = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = require("../../utils/slugify");
const listing_schema_1 = __importDefault(require("../../domain/schema/listing.schema"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load env variable
const baseUrl = process.env.BASE_URL_TWO;
//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path_1.default.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const urlsPerFile = 1000;
// Ensure sitemap directory exists
if (!fs_1.default.existsSync(outputDir)) {
    fs_1.default.mkdirSync(outputDir, { recursive: true });
    console.log("Created sitemap directory:", outputDir);
}
// Fetch all listings
const fetchListings = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield listing_schema_1.default.find();
    }
    catch (error) {
        console.error("Error fetching listings:", error);
        throw new Error("Failed to fetch listings from database");
    }
});
// Generate listing URLs
const generateListingUrls = () => __awaiter(void 0, void 0, void 0, function* () {
    const listings = yield fetchListings();
    return listings.map((listing) => {
        const listingSlug = (0, slugify_1.slugify)(listing.name);
        return `${baseUrl}/${listingSlug}-${listing.listing_unique_id}`;
    });
});
const writeSitemapFile = (filePath, urls) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`)
        .join("\n")}\n</urlset>`;
    fs_1.default.writeFileSync(filePath, sitemapContent);
    console.log(`✅ Created sitemap: ${filePath}`);
};
const writeSitemapIndex = (filePaths) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const indexContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filePaths
        .map((filePath) => `  <sitemap><loc>${filePath}</loc><lastmod>${today}</lastmod></sitemap>`)
        .join("\n")}\n</sitemapindex>`;
    const indexPath = path_1.default.join(outputDir, "sitemap-listing.xml");
    fs_1.default.writeFileSync(indexPath, indexContent);
    console.log(`✅ Created sitemap index: ${indexPath}`);
};
// Main function to generate listing sitemaps
const generateListingSitemaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urls = yield generateListingUrls();
        let fileIndex = 1;
        const sitemapLinks = [];
        for (let i = 0; i < urls.length; i += urlsPerFile) {
            const chunk = urls.slice(i, i + urlsPerFile);
            const fileName = `sitemap-listing-${fileIndex}.xml`;
            const filePath = path_1.default.join(outputDir, fileName);
            writeSitemapFile(filePath, chunk);
            const fullUrl = `${baseUrl}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
            sitemapLinks.push(fullUrl);
            fileIndex++;
        }
        writeSitemapIndex(sitemapLinks);
        console.log("✅ Listing sitemaps generation completed!");
        return (0, apiResponse_1.successResponse)(res, "Listing sitemaps generated successfully.", sitemapLinks);
    }
    catch (error) {
        console.error("❌ Error generating listing sitemaps:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while generating listing sitemaps.");
    }
});
exports.generateListingSitemaps = generateListingSitemaps;
//# sourceMappingURL=listingSitemap.controller.js.map