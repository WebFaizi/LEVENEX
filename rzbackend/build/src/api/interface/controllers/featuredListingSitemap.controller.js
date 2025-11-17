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
exports.generateFeaturedSitemaps = exports.generateFeaturedUrls = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = require("../../utils/slugify");
const featuredListing_schema_1 = __importDefault(require("../../domain/schema/featuredListing.schema"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load env variable
const baseUrl = process.env.BASE_URL_TWO;
//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path_1.default.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const urlsPerFile = 1000;
if (!fs_1.default.existsSync(outputDir)) {
    fs_1.default.mkdirSync(outputDir, { recursive: true });
    console.log("Created sitemap directory:", outputDir);
}
const fetchFeaturedListings = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield featuredListing_schema_1.default.find()
            .populate({
            path: "listing_id",
            select: "name listing_unique_id", // Only fetch necessary fields
        })
            .exec();
    }
    catch (error) {
        console.error("❌ Error fetching featured listings:", error);
        throw new Error("Failed to fetch data.");
    }
});
// Generate URLs for all featured listings
const generateFeaturedUrls = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const featuredListings = yield fetchFeaturedListings();
        const urls = [];
        // Loop through featured listings and generate URLs
        featuredListings.forEach((item) => {
            const listing = item.listing_id;
            if (listing) {
                const slug = (0, slugify_1.slugify)(listing.name);
                urls.push(`${baseUrl}/${slug}-${listing.listing_unique_id}`);
            }
        });
        console.log(`✅ Generated ${urls.length} featured URLs.`);
        return urls;
    }
    catch (error) {
        console.error("❌ Error generating featured URLs:", error);
        throw error;
    }
});
exports.generateFeaturedUrls = generateFeaturedUrls;
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
    const indexPath = path_1.default.join(outputDir, "sitemap-featured-listing.xml");
    fs_1.default.writeFileSync(indexPath, indexContent);
    console.log(`✅ Created sitemap index: ${indexPath}`);
};
const generateFeaturedSitemaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urls = yield (0, exports.generateFeaturedUrls)();
        let fileIndex = 1;
        const sitemapLinks = [];
        for (let i = 0; i < urls.length; i += urlsPerFile) {
            const chunk = urls.slice(i, i + urlsPerFile);
            const fileName = `sitemap-featured-listing-${fileIndex}.xml`;
            const filePath = path_1.default.join(outputDir, fileName);
            writeSitemapFile(filePath, chunk);
            const fullUrl = `${baseUrl}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
            sitemapLinks.push(fullUrl);
            fileIndex++;
        }
        writeSitemapIndex(sitemapLinks);
        console.log("✅ Featured Listings sitemap generation completed!");
        return (0, apiResponse_1.successResponse)(res, "Featured Listings sitemaps generated successfully.", sitemapLinks);
    }
    catch (error) {
        console.error("❌ Error generating featured listings sitemaps:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while generating featured listings sitemaps.");
    }
});
exports.generateFeaturedSitemaps = generateFeaturedSitemaps;
//# sourceMappingURL=featuredListingSitemap.controller.js.map