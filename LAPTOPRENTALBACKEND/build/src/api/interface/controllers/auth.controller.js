"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.resetPassword = exports.forgotPassword = exports.userActivityList = exports.updatePassword = exports.actionUserController = exports.userDetailsDelete = exports.userCreate = exports.userDetails = exports.userList = exports.adminUserList = exports.getuserByToken = exports.storeAdminUser = exports.updateAdminUser = exports.frontendRegistration = exports.getAllPendingOtp = exports.loginOtpGenerate = exports.loginOtpVerify = exports.loginUser = exports.checkSuperadminUser = exports.frontendLogin = exports.getAllUsersList = exports.deleteUserList = exports.frontendUserDetails = exports.logoutAllAdminUser = exports.userUpdatePassword = exports.updateUserProfileDetails = exports.getLiveUserList = exports.importUsersExcelFormet = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const user_model_1 = require("../../domain/models/user.model");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const user_schema_1 = __importDefault(require("../../domain/schema/user.schema"));
const country_schema_1 = __importDefault(require("../../domain/schema/country.schema"));
const state_schema_1 = __importDefault(require("../../domain/schema/state.schema"));
const city_schema_1 = __importDefault(require("../../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../../domain/schema/area.schema"));
const setting_schema_1 = __importDefault(require("../../domain/schema/setting.schema"));
const ipAddress_schema_1 = __importDefault(require("../../domain/schema/ipAddress.schema"));
const sendEmail_service_1 = require("../../services/sendEmail.service");
const importFileStatus_schema_1 = __importDefault(require("../../domain/schema/importFileStatus.schema"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const insertExportTaskService_service_1 = require("../../services/insertExportTaskService.service");
const bcrypt = __importStar(require("bcryptjs"));
const user_model_2 = require("../../domain/models/user.model");
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const XLSX = __importStar(require("xlsx"));
const getClientIp_1 = require("../../utils/getClientIp");
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
function findOrCreateLocation(model, name, parentId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if the location exists
        let location = yield model.findOne({ name });
        if (!location) {
            // If not, create the new location
            location = new model(Object.assign({ name }, (parentId ? { parent_id: parentId } : {})));
            yield location.save();
        }
        return location.id;
    });
}
const generateRandomPassword = (length = 12) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
};
const importUsersExcelFormet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        // Read the Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Convert Excel sheet to raw data
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        // Log the raw data to check its format        
        const users_data = rawData.map((item, index) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            // Check required fields before processing
            if (!item["Email"] || !item["Name"]) {
                return null; // Skip this record
            }
            return {
                name: String(((_a = item["Name"]) === null || _a === void 0 ? void 0 : _a.trim()) || ""),
                email: String(((_b = item["Email"]) === null || _b === void 0 ? void 0 : _b.trim()) || ""),
                phone_number: String(((_c = item["Phone Number"]) === null || _c === void 0 ? void 0 : _c.trim()) || ""),
                username: String(((_d = item["User Name"]) === null || _d === void 0 ? void 0 : _d.trim()) || ""),
                user_type: String(((_e = item["User Type"]) === null || _e === void 0 ? void 0 : _e.toString().trim()) || ""),
                user_website: String(((_f = item["User Website"]) === null || _f === void 0 ? void 0 : _f.trim()) || ""),
                is_approved: ((_g = item["Is Approved"]) === null || _g === void 0 ? void 0 : _g.trim()) === "Yes" ? "Yes" : "No",
                is_verified: ((_h = item["Is Verified"]) === null || _h === void 0 ? void 0 : _h.trim()) === "Yes" ? "Yes" : "No",
                is_blocked: ((_j = item["Is Blocked"]) === null || _j === void 0 ? void 0 : _j.trim()) === "Yes" ? "Yes" : "No",
                show_website: ((_k = item["Show Website"]) === null || _k === void 0 ? void 0 : _k.trim()) === "Yes" ? "Yes" : "No",
                country: String(((_l = item["Country"]) === null || _l === void 0 ? void 0 : _l.trim()) || ""),
                state: String(((_m = item["State"]) === null || _m === void 0 ? void 0 : _m.trim()) || ""),
                city: String(((_o = item["City"]) === null || _o === void 0 ? void 0 : _o.trim()) || ""),
                area: String(((_p = item["Area"]) === null || _p === void 0 ? void 0 : _p.trim()) || ""),
            };
        }).filter(item => item !== null); // Remove null entries from users_data                
        // Handle the import status and response
        const totalRecords = users_data.length;
        const avgTimePerRecord = 0.01; // seconds per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        yield importFileStatus_schema_1.default.create({
            module_name: "UserImport",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Users Import", "processing");
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`,
        });
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            const failedImports = []; // To store errors and reasons for failed imports
            try {
                // Process the users one by one
                for (const user of users_data) {
                    const password = generateRandomPassword(12);
                    let countryId = null;
                    let stateId = null;
                    let cityId = null;
                    let areaId = null;
                    // Validate if 'email' and 'user_type' are provided and valid
                    if (!user.email || !user.user_type) {
                        failedImports.push(`User with email ${user.email} skipped due to missing 'email' or 'user_type'.`);
                        continue;
                    }
                    try {
                        // If country is provided, find or create the country
                        if (user.country) {
                            countryId = yield findOrCreateLocation(country_schema_1.default, user.country);
                        }
                        // If state is provided, find or create the state (else, set stateId to null)
                        if (user.state) {
                            stateId = yield findOrCreateLocation(state_schema_1.default, user.state, countryId);
                        }
                        // If city is provided, find or create the city (else, set cityId to null)
                        if (user.city) {
                            cityId = yield findOrCreateLocation(city_schema_1.default, user.city, stateId);
                        }
                        // If area is provided, find or create the area (else, set areaId to null)
                        if (user.area) {
                            areaId = yield findOrCreateLocation(area_schema_1.default, user.area, cityId);
                        }
                        // Check if the user already exists based on email
                        const existingUser = yield user_schema_1.default.findOne({ email: user.email });
                        if (existingUser) {
                            // Update existing user
                            try {
                                yield user_schema_1.default.updateOne({ email: user.email }, {
                                    $set: {
                                        name: user.name,
                                        phone_number: user.phone_number,
                                        user_name: user.username,
                                        role: user.user_type,
                                        user_website: user.user_website,
                                        is_approved: user.is_approved,
                                        is_verified: user.is_verified,
                                        is_blocked: user.is_blocked,
                                        show_website: user.show_website,
                                        country_id: countryId,
                                        state_id: stateId,
                                        city_id: cityId,
                                        area_id: areaId,
                                    },
                                });
                            }
                            catch (updateError) {
                                failedImports.push(`Failed to update user with email ${user.email}: ${String(updateError)}`);
                            }
                        }
                        else {
                            // Create new user
                            try {
                                const newUser = new user_schema_1.default({
                                    name: user.name,
                                    email: user.email,
                                    phone_number: user.phone_number,
                                    user_name: user.username,
                                    role: user.user_type,
                                    user_website: user.user_website,
                                    is_approved: user.is_approved,
                                    is_verified: user.is_verified,
                                    is_blocked: user.is_blocked,
                                    show_website: user.show_website,
                                    country_id: countryId,
                                    state_id: stateId,
                                    city_id: cityId,
                                    area_id: areaId,
                                    password: password, // Set the generated password
                                });
                                yield newUser.save();
                            }
                            catch (insertError) {
                                failedImports.push(`Failed to insert new user with email ${user.email}: ${String(insertError)}`);
                            }
                        }
                    }
                    catch (err) {
                        // Catch any errors in the processing of a user
                        if (err instanceof Error) {
                            failedImports.push(`Error processing user with email ${user.email}: ${err.message}`);
                        }
                        else {
                            failedImports.push(`Unknown error processing user with email ${user.email}`);
                        }
                    }
                }
                // Log the user activity
                yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "User", "Import", `Users imported (${users_data.length} records). Failed records: ${failedImports.length}`);
                // Delete the import status after processing
                yield importFileStatus_schema_1.default.deleteOne({ module_name: "UserImport" });
                const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Users Import", "completed");
            }
            catch (err) {
                // Catch the outer error and handle it
                if (err instanceof Error) {
                    console.error("User Import Error:", err.message);
                }
                else {
                    console.error("Unknown Error:", err);
                }
                return res.status(500).json({ message: "Error importing users", error: err instanceof Error ? err.message : "Unknown error" });
            }
        }), 100);
    }
    catch (error) {
        console.error("User import error:", error);
        return res.status(500).json({ message: "Error importing users", error: error.message });
    }
});
exports.importUsersExcelFormet = importUsersExcelFormet;
const getLiveUserList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const users = yield (0, user_model_2.getLiveUserListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get live User list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getLiveUserList = getLiveUserList;
const updateUserProfileDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.user_id = req.user.userId;
        const files = req.files;
        files.forEach((file) => {
            const field_name = file.fieldname;
            const fileName = `${Date.now()}-${file.originalname}`;
            const savePath = path_1.default.join("uploads/user_images", fileName);
            fs_1.default.writeFileSync(savePath, file.buffer);
            req.body[field_name] = savePath;
        });
        const userSchemas = yield user_schema_1.default.findById(req.user.userId);
        // 🔁 Image cleanup logic
        if (userSchemas) {
            if (req.body.profile_pic) {
                const oldImage = userSchemas.profile_pic;
                if (oldImage) {
                    const oldImagePath = path_1.default.join(__dirname, '../../../../', oldImage);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                }
            }
            if (req.body.profile_banner) {
                const oldImage = userSchemas.profile_banner;
                if (oldImage) {
                    const oldImagePath = path_1.default.join(__dirname, '../../../../', oldImage);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                }
            }
        }
        // ✅ Email uniqueness check
        if (req.body.email) {
            const emailExists = yield user_schema_1.default.findOne({
                email: req.body.email,
                _id: { $ne: req.user.userId } // exclude current user
            });
            if (emailExists) {
                return (0, apiResponse_1.ErrorResponse)(res, "Email is already taken by another user.");
            }
        }
        // 👇 Proceed to update
        (0, user_model_1.updatefrontendUserModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Profile updated successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during profile update.");
    }
});
exports.updateUserProfileDetails = updateUserProfileDetails;
const userUpdatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.user_id = req.user.userId;
        (0, user_model_1.userUpdatePasswordModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Profile updated successfully", result);
        });
    }
    catch (error) {
        console.log(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during profile update.");
    }
});
exports.userUpdatePassword = userUpdatePassword;
const logoutAllAdminUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, user_model_2.logoutAllAdminUserModel)(req.user.userId, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "All User Logout Successfully!", result);
        });
    }
    catch (error) {
        console.log(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during profile update.");
    }
});
exports.logoutAllAdminUser = logoutAllAdminUser;
const frontendUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.user.userId);
        const user = yield (0, user_model_1.userDetail)(req.user.userId);
        return (0, apiResponse_1.successResponse)(res, "User details", user);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.frontendUserDetails = frontendUserDetails;
const deleteUserList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_ids } = req.body;
        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Blog Category ID.");
        }
        const result = yield user_schema_1.default.deleteMany({ _id: { $in: user_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No country found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  users.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteUserList = deleteUserList;
const getAllUsersList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '' } = req.query;
        const users = yield (0, user_model_2.getAllIserListModel)(search);
        return (0, apiResponse_1.successResponse)(res, "get admin User list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getAllUsersList = getAllUsersList;
const frontendLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ip_address = (0, getClientIp_1.getClientIp)(req);
        console.log("Frontend Login IP:", ip_address); // Log for debugging
        (0, user_model_2.frontendUserLogin)(req.body, ip_address, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Login User Successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.frontendLogin = frontendLogin;
const checkSuperadminUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const setting = yield setting_schema_1.default.findOne({ super_admin: email });
        console.log("setting", setting);
        // const user = await userSchema.findOne({ email });
        // console.log("user", user)
        // if (!user) {
        //     return ErrorResponse(res, "User not found or does not have the required role.");
        // }
        let loginMethod = "password";
        // If not a super admin, apply IP and OTP validation
        if (!setting) {
            const requestIp = (0, getClientIp_1.getClientIp)(req);
            console.log("Check Superadmin User IP:", requestIp);
            const ipExists = yield ipAddress_schema_1.default.findOne({ ip_address: requestIp });
            if (!ipExists) {
                return (0, apiResponse_1.ErrorResponse)(res, "User with role 2 must have a registered IP address.");
            }
            (0, user_model_2.loginOtpGenerateModel)(req.body, requestIp, (error, result) => {
                if (error) {
                    return (0, apiResponse_1.ErrorResponse)(res, error.message);
                }
                return (0, apiResponse_1.successResponse)(res, "OTP generated successfully", result);
            });
            loginMethod = "otp";
        }
        else {
            return (0, apiResponse_1.successResponse)(res, "Superadmin user validated successfully", { loginMethod });
        }
    }
    catch (error) {
        console.error("Error checking superadmin user:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while validating the user.");
    }
});
exports.checkSuperadminUser = checkSuperadminUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ip_address = (0, getClientIp_1.getClientIp)(req);
        console.log("Admin Login IP:", ip_address); // Log for debugging
        (0, user_model_1.userLogin)(req.body, ip_address, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Login User Successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.loginUser = loginUser;
const loginOtpVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ip_address = (0, getClientIp_1.getClientIp)(req);
        console.log("OTP Verify IP:", ip_address); // Log for debugging
        (0, user_model_2.verifyOtpModel)(req.body, ip_address, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "OTP verified successfully", result);
        });
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during OTP verification.");
    }
});
exports.loginOtpVerify = loginOtpVerify;
const loginOtpGenerate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ip_address = (0, getClientIp_1.getClientIp)(req);
        console.log("OTP Generate IP:", ip_address); // Log for debugging
        (0, user_model_2.loginOtpGenerateModel)(req.body, ip_address, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "OTP generated successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during OTP generation.");
    }
});
exports.loginOtpGenerate = loginOtpGenerate;
const getAllPendingOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const users = yield (0, user_model_1.pendingOtpList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get admin User list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getAllPendingOtp = getAllPendingOtp;
const frontendRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, user_model_2.frontendUserCreate)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, " User register Successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.frontendRegistration = frontendRegistration;
const updateAdminUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, user_model_1.adminUserUpdate)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "update admin user Successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateAdminUser = updateAdminUser;
const storeAdminUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, user_model_1.adminUserCreate)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Admin User register Successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeAdminUser = storeAdminUser;
const getuserByToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY || "defaultsecretkey");
        req.user = decoded;
        const user = yield user_schema_1.default.findById(req.user.userId);
        return (0, apiResponse_1.successResponse)(res, "Get user Successfullu", user);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getuserByToken = getuserByToken;
const adminUserList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const login_user = yield (0, auth_middleware_1.LoginUserData)(req, res);
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const users = yield (0, user_model_1.adminUserLists)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get admin User list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.adminUserList = adminUserList;
const userList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const login_user = yield (0, auth_middleware_1.LoginUserData)(req, res);
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const users = yield (0, user_model_1.userLists)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get admin User list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.userList = userList;
const userDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log(id);
        const user = yield (0, user_model_1.userDetail)(id);
        return (0, apiResponse_1.successResponse)(res, "User details", user);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.userDetails = userDetails;
const userCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, user_model_1.userCreateModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, " User register Successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.userCreate = userCreate;
const userDetailsDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get 'id' from route parameter
        const user = yield user_schema_1.default.findById(id);
        if (!user) {
            return (0, apiResponse_1.ErrorResponse)(res, "User not found.");
        }
        return (0, apiResponse_1.successResponse)(res, "User details fetched successfully.", user);
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching user details.");
    }
});
exports.userDetailsDelete = userDetailsDelete;
const actionUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, type, password } = req.body;
        const user = yield user_schema_1.default.findById(user_id);
        if (!user)
            return (0, apiResponse_1.ErrorResponse)(res, "User not found.");
        switch (type) {
            case "0":
                user.is_verified = "Yes";
                break;
            case "1":
                user.is_approved = "Yes";
                break;
            case "2":
                user.is_blocked = "Yes";
                break;
            case "3":
                user.is_blocked = "No";
                break;
            case "4":
                if (!password)
                    return (0, apiResponse_1.ErrorResponse)(res, "Password is required for update.");
                const salt = yield bcrypt.genSalt(10);
                user.password = yield bcrypt.hash(password, salt);
                break;
            default:
                return (0, apiResponse_1.ErrorResponse)(res, "Invalid type provided.");
        }
        yield user.save();
        return (0, apiResponse_1.successResponse)(res, "User updated successfully.", user);
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while updating the user.");
    }
});
exports.actionUserController = actionUserController;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const login_user = yield (0, auth_middleware_1.LoginUserData)(req, res);
        const user_id = req.user.userId;
        const { old_password, password, confirm_password } = req.body;
        const user = yield user_schema_1.default.findById(user_id);
        const salt = yield bcrypt.genSalt(10);
        const latest_password = yield bcrypt.hash(confirm_password, salt);
        if (!user) {
            return (0, apiResponse_1.ErrorResponse)(res, 'User not found.');
        }
        const isMatch = yield bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return (0, apiResponse_1.ErrorResponse)(res, 'Old password is incorrect.');
        }
        user.password = latest_password;
        user.save();
        return (0, apiResponse_1.successResponse)(res, 'Password updated successfully.', user);
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred while updating the password.');
    }
});
exports.updatePassword = updatePassword;
const userActivityList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10, user_type = "admin" } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const users = yield (0, user_model_1.adminUserActivityLists)(search, pageNum, limitNum, user_type);
        return (0, apiResponse_1.successResponse)(res, "get admin User list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.userActivityList = userActivityList;
function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_schema_1.default.findOne({ email });
        if (!user)
            return (0, apiResponse_1.ErrorResponse)(res, 'User not found');
        const raw = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const token = `${Date.now()}-${generateToken(24)}`;
        const expires = Date.now() + 10 * 60 * 1000;
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(expires);
        yield user.save();
        const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
        console.log("process.env.EMAIL_USER", process.env.EMAIL_USER);
        console.log(resetLink);
        yield sendEmail_service_1.EmailService.sendEmail(email, 'Reset Password Link', resetLink);
        return (0, apiResponse_1.successResponse)(res, "Reset link sent to email", resetLink);
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during password reset.');
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        const { password } = req.body;
        console.log(token);
        const user = yield user_schema_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            return (0, apiResponse_1.ErrorResponse)(res, 'Password reset link is invalid or has expired.');
        }
        user.password = yield bcrypt.hash(password, 10); // Securely hash password
        user.resetPasswordToken = "";
        yield user.save();
        return (0, apiResponse_1.successResponse)(res, "Password has been successfully updated.", null);
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred while resetting the password.');
    }
});
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map