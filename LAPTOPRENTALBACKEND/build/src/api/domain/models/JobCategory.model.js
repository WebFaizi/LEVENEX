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
exports.UpdateJobModel = exports.updateSortingList = exports.getSortedCategoryList = exports.UpdateCategoryDetailModel = exports.getCategoryDetailModel = exports.storeCategoryModel = exports.disableCategoryList = exports.categoryList = exports.categoryActionModel = exports.storeJobModel = exports.jobApplicationList = exports.jobList = exports.getJoblistingFrontendModel = exports.getJobDetailByUniqueId = exports.applyForJobModel = exports.getJobDetailModel = exports.getJobDetailFrontendModel = exports.jobListFrontend = exports.categoryListFrontend = void 0;
const jobCategory_schema_1 = __importDefault(require("../schema/jobCategory.schema"));
const jobs_schema_1 = __importDefault(require("../schema/jobs.schema"));
const jobApplication_schema_1 = __importDefault(require("../schema/jobApplication.schema"));
const currentLocation_service_1 = __importDefault(require("../../services/currentLocation.service"));
const ReplaceText_service_1 = require("../../services/ReplaceText.service");
const slugify_1 = __importDefault(require("slugify"));
const categoryListFrontend = (search, page, limit, location_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = { status: true };
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } },
            ];
        }
        const skip = (page - 1) * limit;
        const categories = yield jobCategory_schema_1.default
            .find(searchQuery)
            .sort({ sorting: 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalCategories = yield jobCategory_schema_1.default.countDocuments(searchQuery);
        const current_location = yield (0, currentLocation_service_1.default)(location_id ? location_id : "");
        let current_location_name;
        if (current_location.area_name) {
            current_location_name = current_location === null || current_location === void 0 ? void 0 : current_location.area_name;
        }
        else {
            current_location_name = current_location === null || current_location === void 0 ? void 0 : current_location.city_name;
        }
        const formattedCategories = categories.map((category) => (Object.assign(Object.assign({}, category.toObject()), { url: `${process.env.BASE_URL_TWO}${(0, slugify_1.default)(category.slug + "-jobs-in-" + current_location_name, { lower: true, strict: true })}/` + category.unique_id, image: category.image
                ? `${process.env.BASE_URL}/${category.image}`
                : null })));
        return {
            data: formattedCategories,
            totalCategories,
            totalPages: Math.ceil(totalCategories / limit),
            currentPage: page,
            current_location,
        };
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Error fetching categories");
    }
});
exports.categoryListFrontend = categoryListFrontend;
const jobListFrontend = (search, page, limit, location_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = { status: true };
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } },
            ];
        }
        const skip = (page - 1) * limit;
        const categories = yield jobCategory_schema_1.default
            .find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalCategories = yield jobCategory_schema_1.default.countDocuments(searchQuery);
        const defaultLocationId = "67dd00f2824d6d721ac0e3cb";
        const current_location = yield (0, currentLocation_service_1.default)((location_id === null || location_id === void 0 ? void 0 : location_id.trim()) ? location_id : defaultLocationId);
        let current_location_name;
        if (current_location.area_name) {
            current_location_name = current_location === null || current_location === void 0 ? void 0 : current_location.area_name;
        }
        else {
            current_location_name = current_location === null || current_location === void 0 ? void 0 : current_location.city_name;
        }
        const formattedCategories = categories.map((category) => (Object.assign(Object.assign({}, category.toObject()), { url: `${process.env.BASE_URL_TWO}${(0, slugify_1.default)(category.slug + "-jobs-in-" + current_location_name, { lower: true, strict: true })}/` + category.unique_id, image: category.image
                ? `${process.env.BASE_URL}/${category.image}`
                : null })));
        return {
            data: formattedCategories,
            totalCategories,
            totalPages: Math.ceil(totalCategories / limit),
            currentPage: page,
            current_location,
        };
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Error fetching categories");
    }
});
exports.jobListFrontend = jobListFrontend;
const getJobDetailFrontendModel = (job_id, location_details // Pass location info like city/area
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield jobs_schema_1.default
            .findOne({ unique_id: job_id })
            .populate("job_category_id")
            .lean(); // Faster and returns plain object
        if (!job) {
            return { error: "Job not found" };
        }
        const replacements_location = {
            area: location_details === null || location_details === void 0 ? void 0 : location_details.area_name,
            city: location_details === null || location_details === void 0 ? void 0 : location_details.city_name,
            location: (location_details === null || location_details === void 0 ? void 0 : location_details.area_name) || (location_details === null || location_details === void 0 ? void 0 : location_details.city_name),
            location1: (location_details === null || location_details === void 0 ? void 0 : location_details.area_name) || (location_details === null || location_details === void 0 ? void 0 : location_details.city_name),
        };
        // Apply replacements
        const slug = (0, ReplaceText_service_1.replacePlaceholders)(job.job_title || "", replacements_location);
        const job_title = (0, ReplaceText_service_1.replacePlaceholders)(job.job_title || "", replacements_location);
        const meta_title = (0, ReplaceText_service_1.replacePlaceholders)(job.meta_title || "", replacements_location);
        const meta_description = (0, ReplaceText_service_1.replacePlaceholders)(job.meta_description || "", replacements_location);
        const description = (0, ReplaceText_service_1.replacePlaceholders)(job.description || "", replacements_location);
        // Replace in keyword array
        const keywordArray = job.keywords_tag || [];
        const keywords_tag = keywordArray.map((keyword) => (0, ReplaceText_service_1.replacePlaceholders)(keyword || "", replacements_location));
        const url = `${process.env.BASE_URL_TWO}` +
            (0, slugify_1.default)(`jobs-${slug}-${job === null || job === void 0 ? void 0 : job.unique_id}`).toLowerCase();
        return Object.assign(Object.assign({}, job), { url,
            job_title,
            meta_title,
            meta_description,
            description,
            keywords_tag });
    }
    catch (error) {
        console.error("Error in getJobDetailFrontendModel:", error);
        return { error: "Failed to fetch job details" };
    }
});
exports.getJobDetailFrontendModel = getJobDetailFrontendModel;
const getJobDetailModel = (job_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield jobs_schema_1.default.findOne({ _id: job_id });
        if (!existingCategory) {
            return callback(new Error("Category not found"), null);
        }
        return callback(null, existingCategory);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.getJobDetailModel = getJobDetailModel;
const applyForJobModel = (storeApplyJobModel, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newJob = new jobApplication_schema_1.default(storeApplyJobModel);
        const savedJob = yield newJob.save();
        return callback(null, savedJob);
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.applyForJobModel = applyForJobModel;
const getJobDetailByUniqueId = (job_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield jobCategory_schema_1.default.findOne({
            unique_id: Number(job_id),
        });
        return existingCategory;
    }
    catch (error) {
        return { error };
    }
});
exports.getJobDetailByUniqueId = getJobDetailByUniqueId;
const getJoblistingFrontendModel = (location_details, category_id, page, limit, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = location_details.current_location_name || searchTerm;
        const searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { address: { $regex: search, $options: "i" } },
                { job_title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const skip = (page - 1) * limit;
        const users = yield jobs_schema_1.default
            .find(searchQuery)
            .populate("job_category_id")
            .skip(skip)
            .limit(limit)
            .lean(); // ✅ lean() for better performance
        const replacements_location = {
            area: location_details === null || location_details === void 0 ? void 0 : location_details.area_name,
            city: location_details === null || location_details === void 0 ? void 0 : location_details.city_name,
            location: (location_details === null || location_details === void 0 ? void 0 : location_details.area_name) || (location_details === null || location_details === void 0 ? void 0 : location_details.city_name),
            location1: (location_details === null || location_details === void 0 ? void 0 : location_details.area_name) || (location_details === null || location_details === void 0 ? void 0 : location_details.city_name),
        };
        const formattedData = users.map((user) => {
            const slug = (0, ReplaceText_service_1.replacePlaceholders)(user.job_title || "", replacements_location);
            const job_title = (0, ReplaceText_service_1.replacePlaceholders)(user.job_title || "", replacements_location);
            const meta_title = (0, ReplaceText_service_1.replacePlaceholders)(user.meta_title || "", replacements_location);
            const meta_description = (0, ReplaceText_service_1.replacePlaceholders)(user.meta_description || "", replacements_location);
            const description = (0, ReplaceText_service_1.replacePlaceholders)(user.description || "", replacements_location);
            const keywordArray = user.keywords_tag || [];
            const keywords_tag = keywordArray.map((keyword) => (0, ReplaceText_service_1.replacePlaceholders)(keyword || "", replacements_location));
            const url = `${process.env.BASE_URL_TWO}` +
                (0, slugify_1.default)("jobs-" + slug + "-" + (user === null || user === void 0 ? void 0 : user.unique_id)).toLowerCase();
            return Object.assign(Object.assign({}, user), { url,
                job_title,
                meta_title,
                meta_description,
                description,
                keywords_tag });
        });
        const totalUsers = yield jobs_schema_1.default.countDocuments(searchQuery);
        return {
            data: formattedData,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) {
        console.error("Error in getJoblistingFrontendModel:", error);
        throw new Error("Error fetching job listings");
    }
});
exports.getJoblistingFrontendModel = getJoblistingFrontendModel;
const jobList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { job_title: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { phone_number: { $regex: search, $options: "i" } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield jobs_schema_1.default
            .find(searchQuery)
            .populate("job_category_id")
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield jobs_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.jobList = jobList;
const jobApplicationList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [{ name: { $regex: search, $options: "i" } }],
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield jobApplication_schema_1.default.find(searchQuery)
            .populate("job_id")
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield jobApplication_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.jobApplicationList = jobApplicationList;
const storeJobModel = (storeJobModel, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newJob = new jobs_schema_1.default(storeJobModel);
        const savedJob = yield newJob.save();
        return callback(null, savedJob);
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.storeJobModel = storeJobModel;
const categoryActionModel = (categoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield jobCategory_schema_1.default.findOne({
            _id: categoryData.category_id,
        });
        if (!category) {
            return callback({ message: "Job Category not found" }, null);
        }
        category.status = categoryData.type === "1";
        yield category.save();
        return callback(null, category);
    }
    catch (error) {
        console.error("Error updating category:", error);
        return callback({ message: "Error updating category" }, null);
    }
});
exports.categoryActionModel = categoryActionModel;
const categoryList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { slug: { $regex: search, $options: "i" } },
                ],
            }
            : {};
        const skip = (page - 1) * limit;
        const categories = yield jobCategory_schema_1.default
            .find(searchQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalCategories = yield jobCategory_schema_1.default.countDocuments(searchQuery);
        // Add full image URL
        const formattedCategories = categories.map((category) => (Object.assign(Object.assign({}, category.toObject()), { image: category.image
                ? `${process.env.BASE_URL}/${category.image}`
                : null })));
        return {
            data: formattedCategories,
            totalCategories,
            totalPages: Math.ceil(totalCategories / limit),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error("Error fetching categories");
    }
});
exports.categoryList = categoryList;
const disableCategoryList = (categoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category_list = yield jobCategory_schema_1.default.find({ status: false });
        return callback(null, category_list);
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.disableCategoryList = disableCategoryList;
const storeCategoryModel = (categoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield jobCategory_schema_1.default.findOne({
            slug: categoryData.slug,
        });
        if (existingCategory) {
            const error = new Error("Job Category already exists.");
            return callback(error, null);
        }
        const lastCategory = yield jobCategory_schema_1.default
            .findOne()
            .sort({ sorting: -1 });
        const newSortingValue = lastCategory ? lastCategory.sorting + 1 : 1;
        const newCategory = new jobCategory_schema_1.default(Object.assign(Object.assign({}, categoryData), { sorting: newSortingValue }));
        yield newCategory.save();
        return callback(null, newCategory);
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.storeCategoryModel = storeCategoryModel;
const getCategoryDetailModel = (category_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield jobCategory_schema_1.default.findOne({
            _id: category_id,
        });
        if (!existingCategory) {
            return callback(new Error("Category not found"), null);
        }
        existingCategory.image = `${process.env.BASE_URL}/${existingCategory === null || existingCategory === void 0 ? void 0 : existingCategory.image}`;
        return callback(null, existingCategory);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.getCategoryDetailModel = getCategoryDetailModel;
const UpdateCategoryDetailModel = (category_id, categoryData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCategory = yield jobCategory_schema_1.default.findOne({
            _id: category_id,
        });
        if (!existingCategory) {
            return callback(new Error("Category not found."), null);
        }
        const slugExist = yield jobCategory_schema_1.default.findOne({
            slug: categoryData.slug,
            _id: { $ne: category_id },
        });
        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        existingCategory.name = categoryData.name || existingCategory.name;
        existingCategory.slug = categoryData.slug || existingCategory.slug;
        existingCategory.image = categoryData.image || existingCategory.image;
        yield existingCategory.save();
        return callback(null, existingCategory);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.UpdateCategoryDetailModel = UpdateCategoryDetailModel;
const getSortedCategoryList = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield jobCategory_schema_1.default
            .find({ status: true })
            .sort({ sorting: 1 }); // Replace 'fieldName' with the actual sorting field
        return callback(null, users);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.getSortedCategoryList = getSortedCategoryList;
const updateSortingList = (category_ids, callback) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Array.isArray(category_ids) || category_ids.length === 0) {
        return callback(new Error("Invalid category IDs"), null);
    }
    for (let i = 0; i < category_ids.length; i++) {
        yield jobCategory_schema_1.default.findByIdAndUpdate(category_ids[i], {
            sorting: i + 1,
        });
    }
    const updatedCategories = yield jobCategory_schema_1.default
        .find({ status: true })
        .sort({ sorting: 1 });
    return callback(null, updatedCategories);
});
exports.updateSortingList = updateSortingList;
const UpdateJobModel = (job_id, jobSchemaData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedJob = yield jobs_schema_1.default.findByIdAndUpdate(job_id, { $set: jobSchemaData }, { new: true, runValidators: true });
        if (!updatedJob) {
            return callback(new Error("Job not  sdasd found."), null);
        }
        return callback(null, updatedJob);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.UpdateJobModel = UpdateJobModel;
//# sourceMappingURL=JobCategory.model.js.map