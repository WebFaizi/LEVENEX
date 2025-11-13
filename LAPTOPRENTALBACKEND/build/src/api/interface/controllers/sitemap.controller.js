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
exports.generateSitemaps = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = require("../../utils/slugify");
const category_schema_1 = __importDefault(require("../../domain/schema/category.schema"));
const city_schema_1 = __importDefault(require("../../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../../domain/schema/area.schema"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load env variable
const BASE_URL = process.env.BASE_URL_TWO;
const default_city = "67dd00f2824d6d721ac0e3cb";
// const outputDir = path.join(process.cwd(), "..", "frontend", "dist", "rentalzone", "browser", "sitemap");
const outputDir = path_1.default.join(process.cwd(), "..", "frontend", "public", "sitemap-collection");
//For storing in the Backend
//const outputDir = path.join(process.cwd(), "sitemap");
//For Local Development
//const outputDir = path.join(process.cwd(), "..", "rentalzone_next", "public", "sitemap-collection");
const urlsPerFile = 1000;
if (!fs_1.default.existsSync(outputDir)) {
    fs_1.default.mkdirSync(outputDir, { recursive: true });
    console.log("Created sitemap directory:", outputDir);
}
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [categories, cities, areas] = yield Promise.all([
            category_schema_1.default.find(),
            city_schema_1.default.find(),
            area_schema_1.default.find(),
        ]);
        return { categories, cities, areas };
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Failed to fetch data from database");
    }
});
const generateUrls = () => __awaiter(void 0, void 0, void 0, function* () {
    const { categories, cities, areas } = yield fetchData();
    const urls = [];
    categories.forEach((category) => {
        cities.forEach((city) => {
            const citySlug = (0, slugify_1.slugify)(city.name);
            urls.push(`${BASE_URL}/${category.slug}-${citySlug}/${category.unique_id}`);
        });
        areas.forEach((area) => {
            const areaSlug = (0, slugify_1.slugify)(area.name);
            urls.push(`${BASE_URL}/${category.slug}-${areaSlug}/${category.unique_id}`);
        });
    });
    console.log(`Generated ${urls.length} URLs.`);
    return urls;
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
    const indexPath = path_1.default.join(outputDir, "sitemap-category.xml");
    fs_1.default.writeFileSync(indexPath, indexContent);
    console.log(`✅ Created sitemap index: ${indexPath}`);
};
const generateSitemaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urls = yield generateUrls();
        let fileIndex = 1;
        const sitemapLinks = [];
        for (let i = 0; i < urls.length; i += urlsPerFile) {
            const chunk = urls.slice(i, i + urlsPerFile);
            const fileName = `sitemap-category-${fileIndex}.xml`;
            const filePath = path_1.default.join(outputDir, fileName);
            if (!fs_1.default.existsSync(outputDir)) {
                fs_1.default.mkdirSync(outputDir, { recursive: true });
            }
            writeSitemapFile(filePath, chunk);
            const fullUrl = `${BASE_URL}/sitemap-collection/${fileName}`.replace(/([^:]\/)\/+/g, "$1");
            sitemapLinks.push(fullUrl);
            fileIndex++;
        }
        writeSitemapIndex(sitemapLinks);
        console.log("✅ Sitemaps generation completed!");
        return (0, apiResponse_1.successResponse)(res, "Sitemaps generated successfully.", sitemapLinks);
    }
    catch (error) {
        console.error("❌ Error generating sitemaps:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while generating sitemaps.");
    }
});
exports.generateSitemaps = generateSitemaps;
//# sourceMappingURL=sitemap.controller.js.map