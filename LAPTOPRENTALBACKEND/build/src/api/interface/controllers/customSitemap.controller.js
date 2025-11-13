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
exports.updateCustomSitemaps = exports.generateCustomSitemaps = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fast_xml_parser_1 = require("fast-xml-parser");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load env variable
const baseUrl = process.env.BASE_URL_TWO;
//const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path_1.default.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
const urlsPerFile = 1000;
const writeSitemapFile = (filePath, urls, type) => {
    const today = new Date().toISOString().split("T")[0]; // e.g., 2025-06-02
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`)
        .join("\n")}\n</urlset>`;
    fs_1.default.writeFileSync(filePath, sitemapContent);
    console.log(`✅ Created ${type} sitemap: ${filePath}`);
};
const writeSitemapIndex = (filePaths, type) => {
    const today = new Date().toISOString().split("T")[0];
    const indexContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filePaths
        .map((filePath) => `  <sitemap><loc>${filePath}</loc><lastmod>${today}</lastmod></sitemap>`)
        .join("\n")}\n</sitemapindex>`;
    const indexPath = path_1.default.join(outputDir, `sitemap-custom-url-${type}.xml`);
    // ✅ Ensure directory exists before writing the file
    const indexDir = path_1.default.dirname(indexPath);
    if (!fs_1.default.existsSync(indexDir)) {
        fs_1.default.mkdirSync(indexDir, { recursive: true });
    }
    fs_1.default.writeFileSync(indexPath, indexContent);
    console.log(`✅ Created ${type} sitemap index: ${indexPath}`);
};
// Main function to generate listing sitemaps
const generateCustomSitemaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { urls, type } = req.body;
        let fileIndex = 1;
        const sitemapLinks = [];
        for (let i = 0; i < urls.length; i += urlsPerFile) {
            const chunk = urls.slice(i, i + urlsPerFile);
            const fileName = `sitemap-custom-url-${type}-${fileIndex}.xml`;
            const filePath = path_1.default.join(outputDir, fileName);
            writeSitemapFile(filePath, chunk, type);
            const fullUrl = `${baseUrl}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
            sitemapLinks.push(fullUrl);
            fileIndex++;
        }
        writeSitemapIndex(sitemapLinks, type);
        console.log("✅ Listing sitemaps generation completed!");
        return (0, apiResponse_1.successResponse)(res, "Listing sitemaps generated successfully.", sitemapLinks);
    }
    catch (error) {
        console.error("❌ Error generating listing sitemaps:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while generating listing sitemaps.");
    }
});
exports.generateCustomSitemaps = generateCustomSitemaps;
const updateCustomSitemaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type } = req.query;
        const allUrls = new Set();
        const parser = new fast_xml_parser_1.XMLParser();
        // Step 1: Read all existing sitemap files of the given type
        const files = fs_1.default.readdirSync(outputDir).filter(file => file.startsWith(`sitemap-custom-url-${type}-`) && file.endsWith(".xml"));
        console.log(`Found ${files.length} existing sitemap files for type "${type}".`);
        if (files.length === 0) {
            console.log("No existing sitemap files found. Creating new sitemap.");
        }
        for (const file of files) {
            const xml = fs_1.default.readFileSync(path_1.default.join(outputDir, file), "utf-8");
            const parsed = parser.parse(xml);
            const urls = ((_a = parsed === null || parsed === void 0 ? void 0 : parsed.urlset) === null || _a === void 0 ? void 0 : _a.url) || [];
            if (Array.isArray(urls)) {
                urls.forEach((entry) => {
                    if (entry.loc)
                        allUrls.add(entry.loc);
                });
            }
            else if (urls === null || urls === void 0 ? void 0 : urls.loc) {
                allUrls.add(urls.loc);
            }
        }
        // Step 4: Re-split and regenerate sitemap files
        const sortedUrls = Array.from(allUrls).sort(); // Optional sorting
        let fileIndex = 1;
        const sitemapLinks = [];
        console.log("✅ Sitemap updated successfully.");
        return (0, apiResponse_1.successResponse)(res, "custom urls successfully.", sortedUrls);
    }
    catch (error) {
        console.error("❌ Error updating sitemap:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while updating the sitemap.");
    }
});
exports.updateCustomSitemaps = updateCustomSitemaps;
//# sourceMappingURL=customSitemap.controller.js.map