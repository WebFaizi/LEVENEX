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
exports.updateListingStatusModel = exports.listingDetail = exports.listingBannersList = exports.UserListingList = exports.ListingList = exports.updateListingBannersList = exports.updateListingModel = exports.storeListingModel = exports.storeListingReviewModel = exports.importCategoryListingDataModel = exports.importListingDataModel = exports.importFreshListingDataModel = exports.importUserListingDataModel = exports.ListingWiseReviewList = exports.ListingReviewList = exports.deleteDuplicateListingModel = exports.importListingReviewDataModel = exports.getAllListingModel = exports.getUserAllListingModel = void 0;
const logger_1 = require("../../lib/logger");
const listing_schema_1 = __importDefault(require("../schema/listing.schema"));
const category_schema_1 = __importDefault(require("../schema/category.schema"));
const country_schema_1 = __importDefault(require("../schema/country.schema"));
const user_schema_1 = __importDefault(require("../schema/user.schema"));
const state_schema_1 = __importDefault(require("../schema/state.schema"));
const city_schema_1 = __importDefault(require("../schema/city.schema"));
const area_schema_1 = __importDefault(require("../schema/area.schema"));
const listingReview_schema_1 = __importDefault(require("../schema/listingReview.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sendEmail_service_1 = require("../../services/sendEmail.service");
const setting_schema_1 = __importDefault(require("../../domain/schema/setting.schema"));
const baseUrl = process.env.BASE_URL || "http://localhost:3000";
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
const getUserAllListingModel = (loginUser, search) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [{ name: { $regex: search, $options: "i" } }]
            }
            : {};
        const users = yield listing_schema_1.default.find(searchQuery)
            .where({ user_id: loginUser.userId })
            .exec();
        return users;
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.getUserAllListingModel = getUserAllListingModel;
const getAllListingModel = (search) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [{ name: { $regex: search, $options: "i" } }]
            }
            : {};
        const users = yield listing_schema_1.default.find(searchQuery).exec();
        return {
            data: users
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.getAllListingModel = getAllListingModel;
const importListingReviewDataModel = (loginUser, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transformedData = yield Promise.all(listingData.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const listing = yield listing_schema_1.default.findOne({
                name: { $regex: new RegExp(`${item.listing_name}$`, "i") } // exact full name match, case-insensitive
            });
            const user = yield user_schema_1.default.findOne({
                name: { $regex: new RegExp(`${item.user_name}$`, "i") }
            });
            if (!listing || !user) {
                console.warn(`Skipping row: Listing or User not found for ${item.listing_name}, ${item.user_name}`);
                return null; // Skip if listing or user not found
            }
            // Check if review already exists
            // const existingReview = await ListingReviewSchema.findOne({
            //   listing_id: listing._id,
            //   user_id: user._id
            // });
            // if (existingReview) {
            //   console.warn(`Skipping row: Review already exists for Listing ${item.listing_name} and User ${item.user_name}`);
            //   return null; // Skip if review already exists
            // }
            return {
                listing_id: listing._id,
                user_id: user._id,
                rating: item.rating,
                comment: item.comment
            };
        })));
        // Remove skipped (null) entries
        const filteredData = transformedData.filter((item) => item !== null);
        if (filteredData.length > 0) {
            yield listingReview_schema_1.default.insertMany(filteredData);
            console.log("Listing reviews imported successfully.");
        }
        else {
            console.log("No new listing reviews to import.");
        }
        return callback(null, {
            insertedCount: filteredData.length,
            skippedCount: listingData.length - filteredData.length
        });
    }
    catch (error) {
        console.error("Error importing listing reviews:", error);
        return callback(error, null);
    }
});
exports.importListingReviewDataModel = importListingReviewDataModel;
const getIdsFromNames = (Model, names, param) => __awaiter(void 0, void 0, void 0, function* () {
    const nameArray = names.split(",").map((name) => name.trim());
    const records = yield Model.find({
        name: {
            $in: nameArray.map((name) => new RegExp(`^${name}$`, "i"))
        }
    });
    return records.map((record) => record[param || "_id"].toString());
});
const getUniqueIdsFromNames = (Model, names) => __awaiter(void 0, void 0, void 0, function* () {
    const nameArray = names.split(",").map((name) => name.trim());
    const records = yield Model.find({
        name: {
            $in: nameArray.map((name) => new RegExp(`^${name}$`, "i"))
        }
    });
    return records.map((record) => record.unique_id.toString());
});
const getSingleUniqueIdFromName = (schema, name) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schema.findOne({ name: name.trim() });
    return result ? result.unique_id.toString() : null;
});
const getSingleIdFromName = (schema, name) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schema.findOne({ name: name.trim() });
    return result ? result._id.toString() : null;
});
const getSingleIdFromEmail = (schema, name) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schema.findOne({ email: name.trim() });
    return result ? result._id.toString() : null;
});
const deleteDuplicateListingModel = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const allListings = yield listing_schema_1.default.find({}, {
            _id: 1,
            name: 1,
            email: 1,
            address: 1,
            category_ids: 1
        }).lean();
        const seen = new Map(); // key -> first listing _id
        const duplicatesToDelete = [];
        for (const listing of allListings) {
            const name = ((_a = listing.name) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) || "";
            const email = ((_b = listing.email) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || "";
            const address = ((_c = listing.address) === null || _c === void 0 ? void 0 : _c.trim().toLowerCase()) || "";
            const categoryIds = (listing.category_ids || [])
                .map((id) => id.toString())
                .sort()
                .join(",");
            const key = `${name}|${email}|${address}|${categoryIds}`;
            if (seen.has(key)) {
                // This is a duplicate, mark for deletion
                duplicatesToDelete.push(listing._id.toString());
            }
            else {
                // First time seeing this combo
                seen.set(key, listing._id.toString());
            }
        }
        if (duplicatesToDelete.length > 0) {
            const deleteResult = yield listing_schema_1.default.deleteMany({ _id: { $in: duplicatesToDelete } });
            console.log(`🗑️ Deleted ${deleteResult.deletedCount} duplicate listing(s).`);
        }
        else {
            console.log("✅ No duplicate listings found.");
        }
    }
    catch (error) {
        console.error("❌ Error deleting duplicates:", error);
    }
});
exports.deleteDuplicateListingModel = deleteDuplicateListingModel;
const ListingReviewList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { slug: { $regex: search, $options: "i" } }
                ]
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield listingReview_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .populate("listing_id user_id")
            .exec();
        const totalUsers = yield listingReview_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        };
    }
    catch (error) {
        console.log(error);
    }
});
exports.ListingReviewList = ListingReviewList;
const ListingWiseReviewList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingObjectId = new mongoose_1.default.Types.ObjectId(search);
        const searchQuery = { listing_id: listingObjectId, isApproved: true };
        const skip = (page - 1) * limit;
        // Fetch paginated reviews
        const users = yield listingReview_schema_1.default.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .populate("user_id")
            .exec();
        // Count total reviews
        const totalUsers = yield listingReview_schema_1.default.countDocuments(searchQuery);
        // Aggregate to get rating distribution
        const ratingStats = yield listingReview_schema_1.default.aggregate([
            { $match: { listing_id: listingObjectId } },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            }
        ]);
        // Initialize and calculate breakdown
        let totalRating = 0;
        let ratingCount = 0;
        const ratingDistribution = {
            1: { count: 0, percent: 0 },
            2: { count: 0, percent: 0 },
            3: { count: 0, percent: 0 },
            4: { count: 0, percent: 0 },
            5: { count: 0, percent: 0 }
        };
        for (const stat of ratingStats) {
            const rating = stat._id;
            const count = stat.count;
            if (ratingDistribution[rating] !== undefined) {
                ratingDistribution[rating].count = count;
                totalRating += rating * count;
                ratingCount += count;
            }
        }
        // Percent calculation
        if (ratingCount > 0) {
            for (let i = 1; i <= 5; i++) {
                ratingDistribution[i].percent = parseFloat(((ratingDistribution[i].count / ratingCount) * 100).toFixed(2));
            }
        }
        const averageRating = ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(2)) : 0;
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            averageRating,
            ratingBreakdown: ratingDistribution
        };
    }
    catch (error) {
        console.error("Error in ListingWiseReviewList:", error);
        return {
            data: [],
            totalUsers: 0,
            totalPages: 0,
            currentPage: page,
            averageRating: 0,
            ratingBreakdown: {},
            message: "Something went wrong"
        };
    }
});
exports.ListingWiseReviewList = ListingWiseReviewList;
const importUserListingDataModel = (loginUser, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transformedData = [];
        for (const item of listingData) {
            try {
                // ✅ Validate required fields
                if (!item.name || !item.category_ids || !item.country_id) {
                    console.warn("Skipping row due to missing fields:", item);
                    continue;
                }
                // ✅ Transform category and location fields
                const categoryIds = yield getUniqueIdsFromNames(category_schema_1.default, item.category_ids);
                const country_id = (yield getSingleUniqueIdFromName(country_schema_1.default, item.country_id)) || null;
                const state_id = (yield getSingleUniqueIdFromName(state_schema_1.default, item.state_id)) || null;
                const user_id = (yield getSingleIdFromEmail(user_schema_1.default, item.user_email)) || null;
                let city_id = [];
                let is_city_all_selected = false;
                let is_area_all_selected = false;
                if (item.city_id !== "all") {
                    city_id = yield getUniqueIdsFromNames(city_schema_1.default, item.city_id);
                }
                else {
                    is_city_all_selected = true;
                }
                if (item.area_id === "all") {
                    is_area_all_selected = true;
                }
                const area_id = item.area_id !== "all" ? yield getSingleUniqueIdFromName(area_schema_1.default, item.area_id) : null;
                // ✅ Check for duplicate listing
                const existingListing = yield listing_schema_1.default.findOne({
                    name: item.name.trim(),
                    email: item.email.trim(),
                    address: item.address.trim(),
                    category_ids: { $in: categoryIds }
                });
                if (existingListing) {
                    console.warn("Duplicate listing found. Skipping:", item.name);
                    continue;
                }
                // ✅ Add to batch insert
                transformedData.push(Object.assign(Object.assign({}, item), { category_ids: categoryIds, country_id,
                    state_id,
                    city_id,
                    area_id, email: item.email && item.email.trim() !== "" ? item.email : item.user_email, is_city_all_selected,
                    is_area_all_selected, user_id: user_id }));
            }
            catch (rowError) {
                console.error("Error processing row, skipping:", item, rowError);
                continue;
            }
        }
        // ✅ Insert all valid, non-duplicate listings
        if (transformedData.length > 0) {
            yield listing_schema_1.default.insertMany(transformedData);
            console.log(`✅ ${transformedData.length} listings imported successfully.`);
        }
        else {
            console.warn("⚠️ No valid listings to import.");
        }
        return callback(null, []);
    }
    catch (error) {
        console.error("❌ Error during listing import:", error);
        return callback(error, null);
    }
});
exports.importUserListingDataModel = importUserListingDataModel;
const importFreshListingDataModel = (loginUser, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        /* holds NEW listings we plan to insert, indexed by a unique key */
        const pendingMap = new Map();
        // ────────────────────────────────────────────────────────────────────────────
        // Row‑by‑row handling
        // ────────────────────────────────────────────────────────────────────────────
        for (const item of listingData) {
            try {
                /* 1. Parse & validate category names ---------------------------------- */
                if (!item.category_ids) {
                    console.warn("⚠️ Skipping row (no category_ids):", item);
                    continue;
                }
                const categoryNameArray = Array.isArray(item.category_ids)
                    ? item.category_ids.map(s => s.trim()).filter(Boolean)
                    : item.category_ids.split(",").map(s => s.trim()).filter(Boolean);
                if (!categoryNameArray.length) {
                    console.warn("⚠️ No valid category names after parsing:", item.category_ids);
                    continue;
                }
                const categoryNamesCommaSeparated = categoryNameArray.join(",");
                /* 2. Convert names → unique_id strings -------------------------------- */
                const categoryIds = yield getUniqueIdsFromNames(category_schema_1.default, categoryNamesCommaSeparated);
                if (!categoryIds.length) {
                    console.warn("⚠️ No valid category IDs resolved for:", categoryNameArray);
                    continue;
                }
                /* 3. Resolve geography / user ---------------------------------------- */
                const country_id = (yield getSingleUniqueIdFromName(country_schema_1.default, item.country_id)) || null;
                const state_id = (yield getSingleUniqueIdFromName(state_schema_1.default, item.state_id)) || null;
                let city_id = [];
                let is_city_all_selected = false;
                if (item.city_id === "all")
                    is_city_all_selected = true;
                else
                    city_id = yield getUniqueIdsFromNames(city_schema_1.default, item.city_id);
                let is_area_all_selected = false;
                const area_id = item.area_id === "all"
                    ? (is_area_all_selected = true, null)
                    : yield getSingleUniqueIdFromName(area_schema_1.default, item.area_id);
                const foundUser = yield user_schema_1.default.findOne({ email: item.user_email })
                    .select("_id").lean();
                const user_id = (foundUser === null || foundUser === void 0 ? void 0 : foundUser._id) || loginUser.userId;
                /* 4. Check DB for existing listing ----------------------------------- */
                const existing = yield listing_schema_1.default.findOne({
                    user_id,
                    name: (_a = item.name) === null || _a === void 0 ? void 0 : _a.trim(),
                    email: (_b = item.email) === null || _b === void 0 ? void 0 : _b.trim(),
                    address: (_c = item.address) === null || _c === void 0 ? void 0 : _c.trim()
                }).lean();
                if (existing) {
                    const existingCatIds = (existing.category_ids || []).map(String);
                    const newCatIds = categoryIds.filter(id => !existingCatIds.includes(id));
                    if (newCatIds.length) {
                        yield listing_schema_1.default.updateOne({ _id: existing._id }, { $addToSet: { category_ids: { $each: newCatIds } } });
                        console.log(`🔁 Updated categories on DB listing ${existing.listing_unique_id}`);
                    }
                    else {
                        console.log(`⚠️ Duplicate listing (no new categories) – skipped: ${item.name}`);
                    }
                    continue; // done with this row
                }
                /* 5. Merge duplicates **within the same Excel file** ------------------ */
                const key = `${user_id}|${(_d = item.name) === null || _d === void 0 ? void 0 : _d.trim().toLowerCase()}|${(_e = item.email) === null || _e === void 0 ? void 0 : _e.trim().toLowerCase()}|${(_f = item.address) === null || _f === void 0 ? void 0 : _f.trim().toLowerCase()}`;
                if (pendingMap.has(key)) {
                    const entry = pendingMap.get(key);
                    categoryIds.forEach(id => entry.catIds.add(id));
                    // no need to update other fields; they’re identical
                }
                else {
                    pendingMap.set(key, {
                        catIds: new Set(categoryIds),
                        doc: Object.assign(Object.assign({}, item), { country_id,
                            state_id,
                            city_id,
                            area_id,
                            is_city_all_selected,
                            is_area_all_selected,
                            user_id })
                    });
                }
            }
            catch (rowErr) {
                console.error("❌ Error processing row:", item, rowErr);
                continue;
            }
        }
        /* 6. Bulk insert all pending new listings -------------------------------- */
        const docsToInsert = Array.from(pendingMap.values()).map(p => (Object.assign(Object.assign({}, p.doc), { category_ids: Array.from(p.catIds) // final unique list
         })));
        if (docsToInsert.length) {
            yield listing_schema_1.default.insertMany(docsToInsert);
            console.log(`✅ ${docsToInsert.length} new listings inserted.`);
        }
        else {
            console.warn("⚠️ No new listings to insert.");
        }
        return callback(null, null);
    }
    catch (err) {
        console.error("❌ importFreshListingDataModel failed:", err);
        return callback(err, null);
    }
});
exports.importFreshListingDataModel = importFreshListingDataModel;
const importListingDataModel = (loginUser, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transformedData = [];
        for (const item of listingData) {
            try {
                // ✅ Validate required fields
                if (!item.listing_unique_id) {
                    console.warn("Skipping row due to missing fields:", item);
                    continue;
                }
                // ✅ Transform category and location fields
                const categoryIds = yield getUniqueIdsFromNames(category_schema_1.default, item.category_ids);
                const country_id = (yield getSingleUniqueIdFromName(country_schema_1.default, item.country_id)) || null;
                const state_id = (yield getSingleUniqueIdFromName(state_schema_1.default, item.state_id)) || null;
                let user_id = loginUser.userId;
                let city_id = [];
                let is_city_all_selected = false;
                let is_area_all_selected = false;
                if (item.city_id !== "all") {
                    city_id = yield getUniqueIdsFromNames(city_schema_1.default, item.city_id);
                }
                else {
                    is_city_all_selected = true;
                }
                if (item.area_id === "all") {
                    is_area_all_selected = true;
                }
                const area_id = item.area_id !== "all" ? yield getSingleUniqueIdFromName(area_schema_1.default, item.area_id) : null;
                // ✅ Add to batch insert
                transformedData.push(Object.assign(Object.assign({}, item), { category_ids: categoryIds, country_id,
                    state_id,
                    city_id,
                    area_id,
                    is_city_all_selected,
                    is_area_all_selected, user_id: user_id }));
            }
            catch (rowError) {
                console.error("Error processing row, skipping:", item, rowError);
                continue;
            }
        }
        const listingIds = transformedData.map(item => item.listing_unique_id);
        const existingListings = yield listing_schema_1.default.find({
            listing_unique_id: { $in: listingIds }
        }).select("listing_unique_id").lean();
        const existingIdSet = new Set(existingListings.map(l => l.listing_unique_id));
        const toInsert = [];
        const toUpdate = [];
        for (const item of transformedData) {
            if (existingIdSet.has(item.listing_unique_id)) {
                toUpdate.push(item);
            }
            else {
                toInsert.push(item);
            }
        }
        // ✅ Insert new listings
        if (toInsert.length > 0) {
            yield listing_schema_1.default.insertMany(toInsert);
            console.log(`✅ ${toInsert.length} new listings inserted.`);
        }
        // ✅ Update existing listings
        for (const item of toUpdate) {
            yield listing_schema_1.default.updateOne({ listing_unique_id: item.listing_unique_id }, { $set: item });
        }
        if (toUpdate.length > 0) {
            console.log(`🔁 ${toUpdate.length} existing listings updated.`);
        }
        if (toInsert.length === 0 && toUpdate.length === 0) {
            console.warn("⚠️ No listings to insert or update.");
        }
        return callback(null, []);
    }
    catch (error) {
        console.error("❌ Error during listing import:", error);
        return callback(error, null);
    }
});
exports.importListingDataModel = importListingDataModel;
const importCategoryListingDataModel = (loginUser, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const insertedCount = {
            new: 0,
            updated: 0,
            skipped: 0
        };
        for (const item of listingData) {
            try {
                // ✅ Validate required fields
                if (!item.listing_unique_id || !item.category_ids) {
                    console.warn("Skipping row due to missing fields:", item);
                    insertedCount.skipped++;
                    continue;
                }
                // ✅ Transform category and location fields
                const categoryIds = yield getUniqueIdsFromNames(category_schema_1.default, item.category_ids);
                const country_id = (yield getSingleUniqueIdFromName(country_schema_1.default, item.country_id)) || null;
                const state_id = (yield getSingleUniqueIdFromName(state_schema_1.default, item.state_id)) || null;
                let city_id = [];
                let is_city_all_selected = false;
                let is_area_all_selected = false;
                if (item.city_id !== "all") {
                    city_id = yield getUniqueIdsFromNames(city_schema_1.default, item.city_id);
                }
                else {
                    is_city_all_selected = true;
                }
                if (item.area_id === "all") {
                    is_area_all_selected = true;
                }
                const area_id = item.area_id !== "all" ? yield getSingleUniqueIdFromName(area_schema_1.default, item.area_id) : null;
                // ✅ Find existing listing that matches listing ID and has any of the given category IDs
                const existing = yield listing_schema_1.default.findOne({
                    listing_unique_id: item.listing_unique_id,
                    category_ids: { $in: categoryIds },
                });
                if (!existing) {
                    console.log(`ℹ️ No matching listing found or category mismatch. Skipping: ${item.listing_unique_id}`);
                    insertedCount.skipped++;
                    continue;
                }
                // ✅ Perform update only
                yield listing_schema_1.default.updateOne({ _id: existing._id }, {
                    $set: Object.assign(Object.assign({}, item), { category_ids: existing.category_ids, // keep existing category_ids unchanged
                        country_id,
                        state_id,
                        city_id,
                        area_id,
                        is_city_all_selected,
                        is_area_all_selected, user_id: loginUser.userId, updatedAt: new Date() }),
                });
                insertedCount.updated = (insertedCount.updated || 0) + 1;
                console.log(`✅ Listing ${item.listing_unique_id} updated.`);
            }
            catch (rowError) {
                console.error("❌ Error processing row, skipping:", item, rowError);
                insertedCount.skipped++;
            }
        }
        console.log(`✅ Import Summary — New: ${insertedCount.new}, Updated: ${insertedCount.updated}, Skipped: ${insertedCount.skipped}`);
        return callback(null, insertedCount);
    }
    catch (error) {
        console.error("❌ Fatal import error:", error);
        return callback(error, null);
    }
});
exports.importCategoryListingDataModel = importCategoryListingDataModel;
const storeListingReviewModel = (listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listing = new listingReview_schema_1.default({
            user_id: listingData.user_id,
            listing_id: listingData.listing_id,
            rating: listingData.rating,
            comment: listingData.comment,
            isApproved: true
        });
        yield listing.save();
        return callback(null, listing);
    }
    catch (error) {
        console.error("Error storing banner:", error);
        return callback(error, null);
    }
});
exports.storeListingReviewModel = storeListingReviewModel;
const storeListingModel = (loginUser, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listing = new listing_schema_1.default({
            user_id: loginUser.userId,
            category_ids: listingData.category_ids,
            listing_image: listingData.listing_image || "",
            name: listingData.name,
            address: listingData.address,
            country_id: parseInt(listingData.country_id),
            state_id: parseInt(listingData.state_id),
            city_id: listingData.city_ids
                ? listingData.city_ids.map((id) => parseInt(id))
                : [],
            area_id: listingData.area_id ? parseInt(listingData.area_id) : null,
            is_area_all_selected: listingData.is_area_all_selected,
            is_city_all_selected: listingData.is_city_all_selected,
            phone_number: listingData.phone_number,
            email: listingData.email,
            description: listingData.description,
            contact_person: listingData.contact_person,
            second_phone_no: listingData.second_phone_no || "",
            second_email: listingData.second_email || "",
            website: listingData.website,
            listing_type: listingData.listing_type,
            price: listingData.price,
            time_duration: listingData.time_duration,
            cover_image: listingData.cover_image || "",
            listing_reviews_count: listingData.listing_reviews_count || 0,
            listing_avg_rating: listingData.listing_avg_rating || 0,
            status: false,
            approved: false,
            video_url: listingData.video_url || ""
        });
        yield listing.save();
        const user_details = yield user_schema_1.default.findById(loginUser.userId);
        const user_name = (user_details === null || user_details === void 0 ? void 0 : user_details.name) || "User";
        const user_email = (user_details === null || user_details === void 0 ? void 0 : user_details.email) || listingData.email;
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const html = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>New Listing Added</title>
                            <style>
                                body {
                                font-family: Arial, sans-serif;
                                color: #333;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 20px;
                                }
                                .email-container {
                                max-width: 600px;
                                margin: auto;
                                background: #ffffff;
                                padding: 30px;
                                border: 1px solid #e0e0e0;
                                border-radius: 8px;
                                }
                                h2 {
                                color: #2c3e50;
                                }
                                p {
                                line-height: 1.6;
                                }
                                .highlight {
                                color: #0073e6;
                                font-weight: bold;
                                }
                                .footer {
                                margin-top: 30px;
                                font-size: 12px;
                                color: #888;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <h2>🆕 New Listing Alert</h2>
                                <p>Hello Admin,</p>
                                <p>A new listing has been added by a <b>${user_name}</b>.</p>
                                <p><strong>Listing Name (Shop):</strong> <span class="highlight">${listingData.name}</span></p>

                                <div class="footer">
                                <p>This is an automated message from your platform.</p>
                                </div>
                            </div>
                        </body>
                    </html>
                `;
                const currentYear = new Date().getFullYear();
                const customer_email_temlate = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <title>Listing Submission Confirmation</title>
                    <style>
                        body {
                        font-family: 'Segoe UI', sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                        }
                        .container {
                        background-color: #ffffff;
                        max-width: 600px;
                        margin: 40px auto;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.08);
                        }
                        .header {
                        text-align: center;
                        background-color: #4CAF50;
                        color: white;
                        padding: 16px;
                        border-radius: 8px 8px 0 0;
                        }
                        .content {
                        padding: 20px;
                        color: #333333;
                        line-height: 1.6;
                        }
                        .footer {
                        font-size: 12px;
                        color: #777;
                        text-align: center;
                        padding: 16px;
                        }
                        .details-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        }
                        .details-table td {
                        padding: 8px 10px;
                        border: 1px solid #ddd;
                        }
                        .details-table tr:nth-child(even) {
                        background-color: #f9f9f9;
                        }
                        .highlight {
                        color: #4CAF50;
                        font-weight: bold;
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="header">
                        <h2>Listing Submitted Successfully 🎉</h2>
                        </div>
                        <div class="content">
                        <p>Hello <strong>${user_name}</strong>,</p>
                        <p>Thank you for submitting your listing on <span class="highlight">${process.env.PLATFORMNAME}</span>.</p>
                        <p>Your listing has been received and is currently under review by our admin team. You will be notified once it is approved.</p>
                        
                        <h4>📄 Listing Details</h4>
                        <table class="details-table">
                            <tr>
                            <td><strong>Listing Name</strong></td>
                            <td>${listingData.name}</td>
                            </tr>
                            <tr>
                            <td><strong>Location</strong></td>
                            <td>${listingData.address}</td>
                            </tr>
                            <tr>
                            <td><strong>Phone</strong></td>
                            <td>${listingData.phone_number}</td>
                            </tr>
                            <tr>
                            <td><strong>Email</strong></td>
                            <td>${listingData.email}</td>
                            </tr>
                        </table>

                        <p>Best regards,<br>
                        The <strong>${process.env.PLATFORMNAME}</strong> Team</p>
                        </div>
                        <div class="footer">
                        &copy; ${currentYear} ${process.env.PLATFORMNAME}. All rights reserved.
                        </div>
                    </div>
                    </body>
                    </html>
                `;
                const settings = yield setting_schema_1.default.findOne({});
                const settingsEmails = (settings === null || settings === void 0 ? void 0 : settings.quotation_emails)
                    ? settings.quotation_emails.split(",").map((email) => email.trim())
                    : [];
                for (const adminEmail of settingsEmails) {
                    if (isValidEmail(adminEmail)) {
                        yield sendEmail_service_1.EmailService.sendEmail(adminEmail, "New Listing", html);
                    }
                }
                yield sendEmail_service_1.EmailService.sendEmail(user_email, "New Listing", customer_email_temlate);
            }
            catch (emailError) {
                (0, logger_1.loggerMsg)("Error sending contact us email:");
            }
        }))();
        return callback(null, listing);
    }
    catch (error) {
        console.error("Error storing banner:", error);
        return callback(error, null);
    }
});
exports.storeListingModel = storeListingModel;
const updateListingModel = (loginUser, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listing = yield listing_schema_1.default.findById(listingData.listing_id);
        if (!listing) {
            return callback("Listing not found", null);
        }
        listing.category_ids = listingData.category_ids;
        listing.name = listingData.name;
        listing.address = listingData.address;
        ;
        listing.country_id = typeof listingData.country_id === 'string' ? parseInt(listingData.country_id, 10)
            : listingData.country_id;
        listing.state_id = typeof listingData.state_id === 'string' ? parseInt(listingData.state_id, 10)
            : listingData.state_id;
        if (Array.isArray(listingData.city_ids)) {
            listing.city_id = listingData.city_ids.map((id) => parseInt(id, 10));
        }
        else {
            listing.city_id = [];
        }
        listing.area_id = typeof listingData.area_id === 'string' ? parseInt(listingData.area_id, 10)
            : listingData.area_id;
        listing.is_area_all_selected = listingData.is_area_all_selected;
        listing.is_city_all_selected = listingData.is_city_all_selected;
        listing.phone_number = listingData.phone_number;
        listing.email = listingData.email;
        listing.contact_person = listingData.contact_person;
        listing.second_phone_no = listingData.second_phone_no || listing.second_phone_no;
        listing.second_email = listingData.second_email || listing.second_email;
        listing.website = listingData.website;
        listing.listing_type = listingData.listing_type;
        listing.price = listingData.price;
        listing.description = listingData.description;
        listing.time_duration = listingData.time_duration;
        listing.listing_avg_rating = listingData.listing_avg_rating || 0;
        listing.listing_reviews_count = listingData.listing_reviews_count || 0;
        if (listingData.cover_image) {
            // const oldImagePath = path.join(__dirname, '../../../../', listing.cover_image as string);
            // if (fs.existsSync(oldImagePath)) {
            //     try {
            //         fs.unlinkSync(oldImagePath);
            //     } catch (error) {
            //         console.error("Error deleting old image:", error);
            //     }
            // }
            listing.cover_image = listingData.cover_image;
        }
        if (listingData.listing_image) {
            // const oldImagePath = path.join(__dirname, '../../../../', listing.listing_image as string);      
            // if (fs.existsSync(oldImagePath)) {
            //     try {
            //         fs.unlinkSync(oldImagePath);
            //     } catch (error) {
            //         console.error("Error deleting old image:", error);
            //     }
            // }
            listing.listing_image = listingData.listing_image;
        }
        yield listing.save();
        return callback(null, listing);
    }
    catch (error) {
        console.error("Error updating listing:", error);
        return callback(error, null);
    }
});
exports.updateListingModel = updateListingModel;
const updateListingBannersList = (listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listing = yield listing_schema_1.default.findById(listingData.listing_id);
        if (!listing) {
            return callback("Listing not found", null);
        }
        if (listingData.cover_image) {
            listing.cover_image = listingData.cover_image;
        }
        if (listingData.mobile_cover_image) {
            listing.mobile_cover_image = listingData.mobile_cover_image;
        }
        yield listing.save();
        return callback(null, listing);
    }
    catch (error) {
        console.error("Error updating listing:", error);
        return callback(error, null);
    }
});
exports.updateListingBannersList = updateListingBannersList;
const ListingList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const skip = (page - 1) * limit;
        const grandparentDir = path_1.default.join(__dirname, "..", "..", "..", "..", "..");
        const defaultImageUrl = `${baseUrl}/uploads/default.jpg`;
        const basePipeline = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category_ids",
                    foreignField: "unique_id",
                    as: "category_ids"
                }
            },
            {
                $lookup: {
                    from: "countries",
                    let: { countryId: "$country_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$countryId"] },
                                        { $eq: ["$unique_id", "$$countryId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "country"
                }
            },
            {
                $lookup: {
                    from: "states",
                    let: { stateId: "$state_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$stateId"] },
                                        { $eq: ["$unique_id", "$$stateId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "state"
                }
            },
            {
                $lookup: {
                    from: "cities",
                    let: { cityIds: "$city_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $in: ["$_id", "$$cityIds"] },
                                        { $in: ["$unique_id", "$$cityIds"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "city_id"
                }
            },
            {
                $lookup: {
                    from: "areas",
                    let: { areaId: "$area_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$areaId"] },
                                        { $eq: ["$unique_id", "$$areaId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "area"
                }
            },
            {
                $match: {
                    $or: [
                        { "category_ids.name": { $regex: search || "", $options: "i" } },
                        { name: { $regex: search || "", $options: "i" } },
                        { email: { $regex: search || "", $options: "i" } },
                        { listing_unique_id: { $regex: search || "", $options: "i" } },
                        { "state.name": { $regex: search || "", $options: "i" } },
                        { "city_id.name": { $regex: search || "", $options: "i" } }
                    ]
                }
            },
            { $unwind: { path: "$country", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$state", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$area", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    address: 1,
                    email: 1,
                    price: 1,
                    time_duration: 1,
                    description: 1,
                    listing_image: 1,
                    cover_image: 1,
                    listing_unique_id: 1,
                    status: 1,
                    pincode: 1,
                    approved: 1,
                    listing_views: 1,
                    user_id: 1,
                    "country.name": 1,
                    "state.name": 1,
                    "area.name": 1,
                    "city_id.name": 1,
                    "category_ids.name": 1
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    data: [{ $skip: skip }, { $limit: limit }, { $sort: { createdAt: -1 } }]
                }
            }
        ];
        const listings = yield listing_schema_1.default.aggregate(basePipeline);
        const updatedListings = (_a = listings[0]) === null || _a === void 0 ? void 0 : _a.data.map((listing) => {
            const listingImagePath = path_1.default.join(grandparentDir, listing.listing_image || "");
            const listingImageExists = listing.listing_image && fs_1.default.existsSync(listingImagePath);
            const coverImagePath = path_1.default.join(grandparentDir, listing.cover_image || "");
            const coverImageExists = listing.cover_image && fs_1.default.existsSync(coverImagePath);
            return Object.assign(Object.assign({}, listing), { listing_image: listingImageExists ? `${baseUrl}/${listing.listing_image}` : defaultImageUrl, cover_image: coverImageExists ? `${baseUrl}/${listing.cover_image}` : defaultImageUrl });
        });
        return {
            data: updatedListings,
            totalUsers: ((_c = (_b = listings[0]) === null || _b === void 0 ? void 0 : _b.totalCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
            totalPages: Math.ceil(((_e = (_d = listings[0]) === null || _d === void 0 ? void 0 : _d.totalCount[0]) === null || _e === void 0 ? void 0 : _e.count) / limit),
            currentPage: page
        };
    }
    catch (error) {
        console.error("Error in ListingList:", error);
        throw error;
    }
});
exports.ListingList = ListingList;
const UserListingList = (user_email, search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const skip = (page - 1) * limit;
        const users = yield listing_schema_1.default.aggregate([
            {
                $match: {
                    email: user_email
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_ids",
                    foreignField: "unique_id",
                    as: "category_ids"
                }
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "country_id",
                    foreignField: "unique_id",
                    as: "country_id"
                }
            },
            {
                $lookup: {
                    from: "states",
                    localField: "state_id",
                    foreignField: "unique_id",
                    as: "state_id"
                }
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city_id"
                }
            },
            {
                $lookup: {
                    from: "areas",
                    localField: "area_id",
                    foreignField: "unique_id",
                    as: "area_id"
                }
            },
            {
                $match: {
                    $or: [
                        { "category_ids.name": { $regex: search || "", $options: "i" } },
                        { name: { $regex: search || "", $options: "i" } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    address: 1,
                    email: 1,
                    price: 1,
                    time_duration: 1,
                    description: 1,
                    listing_image: 1,
                    cover_image: 1,
                    status: 1,
                    pincode: 1,
                    approved: 1,
                    listing_views: 1,
                    category_ids: 1,
                    country_id: 1,
                    state_id: 1,
                    city_id: 1,
                    area_id: 1,
                    listing_unique_id: 1
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    data: [{ $skip: skip }, { $limit: limit }, { $sort: { createdAt: -1 } }]
                }
            }
        ]);
        const grandparentDir = path_1.default.join(__dirname, "..", "..", "..", "..", "..");
        const defaultImageUrl = `${baseUrl}/uploads/default.jpg`;
        const updatedUsers = (_a = users[0]) === null || _a === void 0 ? void 0 : _a.data.map((user) => {
            const listingImagePath = path_1.default.join(grandparentDir, user.listing_image || "");
            const listingImageExists = user.listing_image && fs_1.default.existsSync(listingImagePath);
            const listingImagePath2 = path_1.default.join(grandparentDir, user.cover_image || "");
            const listingImageExists2 = user.listing_image && fs_1.default.existsSync(listingImagePath2);
            return Object.assign(Object.assign({}, user), { cover_image: listingImageExists2 ? `${baseUrl}/${user.cover_image}` : defaultImageUrl, listing_image: listingImageExists ? `${baseUrl}/${user.listing_image}` : defaultImageUrl });
        });
        return {
            data: updatedUsers,
            totalUsers: ((_c = (_b = users[0]) === null || _b === void 0 ? void 0 : _b.totalCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
            totalPages: Math.ceil(((_e = (_d = users[0]) === null || _d === void 0 ? void 0 : _d.totalCount[0]) === null || _e === void 0 ? void 0 : _e.count) / limit) || 0,
            currentPage: page
        };
    }
    catch (error) {
        console.error("Error in UserListingList:", error);
        return {
            data: [],
            totalUsers: 0,
            totalPages: 0,
            currentPage: page
        };
    }
});
exports.UserListingList = UserListingList;
const listingBannersList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { slug: { $regex: search, $options: "i" } }
                ]
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield listing_schema_1.default.find(searchQuery).skip(skip).limit(limit).exec();
        const updatedUsers = users.map((user) => {
            return {
                listing_id: user.id,
                listing_name: user.name,
                cover_image: user.cover_image ? `${process.env.BASE_URL}/${user.cover_image}` : null,
                listing_image: user.listing_image ? `${process.env.BASE_URL}/${user.listing_image}` : null,
                mobile_cover_image: user.mobile_cover_image
                    ? `${process.env.BASE_URL}/${user.mobile_cover_image}`
                    : null
            };
        });
        const totalUsers = yield listing_schema_1.default.countDocuments(searchQuery);
        return {
            data: updatedUsers,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        };
    }
    catch (error) { }
});
exports.listingBannersList = listingBannersList;
const listingDetail = (listing_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Listing_details = yield listing_schema_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(listing_id)
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_ids",
                    foreignField: "unique_id",
                    as: "category_ids"
                }
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "country_id",
                    foreignField: "unique_id",
                    as: "country_id"
                }
            },
            {
                $lookup: {
                    from: "states",
                    localField: "state_id",
                    foreignField: "unique_id",
                    as: "state_id"
                }
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "unique_id",
                    as: "city_id"
                }
            },
            {
                $lookup: {
                    from: "areas",
                    localField: "area_id",
                    foreignField: "unique_id",
                    as: "area_id"
                }
            },
            {
                $unwind: {
                    path: "$country_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$state_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$area_id",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).exec();
        if (Listing_details && Listing_details[0]) {
            Listing_details[0].listing_image = Listing_details[0].listing_image
                ? `${process.env.BASE_URL}/${Listing_details[0].listing_image}`
                : "";
            Listing_details[0].cover_image = Listing_details[0].cover_image
                ? `${process.env.BASE_URL}/${Listing_details[0].cover_image}`
                : "";
            Listing_details[0].mobile_cover_image = Listing_details[0].mobile_cover_image
                ? `${process.env.BASE_URL}/${Listing_details[0].mobile_cover_image}`
                : "";
        }
        return callback(null, { Listing_details: Listing_details[0] });
    }
    catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
});
exports.listingDetail = listingDetail;
const updateListingStatusModel = (loginUser, listingData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listing = yield listing_schema_1.default.findById(listingData.listing_id);
        if (!listing) {
            return callback("Listing not found", null);
        }
        if (listingData.type == 2) {
            listing.approved = listingData.status;
            if (listingData.status == true) {
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        const html = `<!DOCTYPE html>
                                    <html>
                                    <head>
                                    <meta charset="UTF-8" />
                                    <title>Listing Approved</title>
                                    <style>
                                        body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        margin: 0;
                                        padding: 0;
                                        }
                                        .email-container {
                                        max-width: 600px;
                                        margin: auto;
                                        background-color: #ffffff;
                                        border: 1px solid #e0e0e0;
                                        padding: 30px;
                                        }
                                        .header {
                                        text-align: center;
                                        padding-bottom: 20px;
                                        }
                                        .header h1 {
                                        color: #4CAF50;
                                        }
                                        .content {
                                        font-size: 16px;
                                        color: #333333;
                                        }
                                        .footer {
                                        margin-top: 30px;
                                        font-size: 13px;
                                        color: #999999;
                                        text-align: center;
                                        }
                                    </style>
                                    </head>
                                    <body>
                                    <div class="email-container">
                                        <div class="header">
                                        <h1>🎉 Your Listing is Approved!</h1>
                                        </div>
                                        <div class="content">
                                        <p>Dear User,</p>

                                        <p>We’re happy to inform you that your listing (${listing.name}) has been successfully approved by our admin team.</p>

                                        <p>Your listing is now live and visible to all users on our platform.</p>

                                        <p>Thank you for choosing our service. We wish you great success!</p>

                                        <p>Best regards,<br />
                                        The ${process.env.PLATFORMNAME} Team</p>
                                        </div>
                                        <div class="footer">
                                        This is an automated message. Please do not reply to this email.
                                        </div>
                                    </div>
                                    </body>
                                    </html>
                                    `;
                        yield sendEmail_service_1.EmailService.sendEmail(listing.email, "Your is Listing Approved", html);
                    }
                    catch (emailError) {
                        (0, logger_1.loggerMsg)("Error sending contact us email:");
                    }
                }))();
            }
        }
        else {
            listing.status = listingData.status;
        }
        yield listing.save();
        return callback(null, listing);
    }
    catch (error) {
        console.error("Error updating listing:", error);
        return callback(error, null);
    }
});
exports.updateListingStatusModel = updateListingStatusModel;
//# sourceMappingURL=listing.model.js.map