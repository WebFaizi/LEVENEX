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
exports.generateJobSitemaps = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = require("../../utils/slugify");
const jobs_schema_1 = __importDefault(require("../../domain/schema/jobs.schema")); // 👈 Update path as per your project
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
// Fetch all job listings
const fetchJobs = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield jobs_schema_1.default.find(); // Adjust fields if needed
    }
    catch (error) {
        console.error("Error fetching jobs:", error);
        throw new Error("Failed to fetch job listings from database");
    }
});
// Generate job listing URLs
const generateJobUrls = () => __awaiter(void 0, void 0, void 0, function* () {
    const jobs = yield fetchJobs();
    return jobs.map((job) => {
        const jobSlug = (0, slugify_1.slugify)(job.job_title); // Assuming `title` is the field to slugify
        return `${baseUrl}/job/${jobSlug}-${job.unique_id}`; // Adjust path as needed
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
    const today = new Date().toISOString().split("T")[0];
    const indexContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filePaths
        .map((filePath) => `  <sitemap><loc>${filePath}</loc><lastmod>${today}</lastmod></sitemap>`)
        .join("\n")}\n</sitemapindex>`;
    const indexPath = path_1.default.join(outputDir, "sitemap-job-listing.xml");
    fs_1.default.writeFileSync(indexPath, indexContent);
    console.log(`✅ Created sitemap index: ${indexPath}`);
};
// Main function to generate job listing sitemaps
const generateJobSitemaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urls = yield generateJobUrls();
        let fileIndex = 1;
        const sitemapLinks = [];
        for (let i = 0; i < urls.length; i += urlsPerFile) {
            const chunk = urls.slice(i, i + urlsPerFile);
            const fileName = `sitemap-job-listing-${fileIndex}.xml`;
            const filePath = path_1.default.join(outputDir, fileName);
            writeSitemapFile(filePath, chunk);
            const fullUrl = `${baseUrl}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
            sitemapLinks.push(fullUrl);
            fileIndex++;
        }
        writeSitemapIndex(sitemapLinks);
        console.log("✅ Job listing sitemaps generation completed!");
        return (0, apiResponse_1.successResponse)(res, "Job listing sitemaps generated successfully.", sitemapLinks);
    }
    catch (error) {
        console.error("❌ Error generating job listing sitemaps:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while generating job listing sitemaps.");
    }
});
exports.generateJobSitemaps = generateJobSitemaps;
//# sourceMappingURL=jobsSitemap.controller.js.map