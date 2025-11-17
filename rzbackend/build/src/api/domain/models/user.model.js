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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getAllIserListModel = exports.userCreateUpdateModel = exports.userCreateModel = exports.userDetail = exports.userUpdatePasswordModel = exports.updatefrontendUserModel = exports.pendingOtpList = exports.adminUserActivityLists = exports.userLists = exports.adminUserLists = exports.adminUserCreate = exports.adminUserUpdate = exports.userLogin = exports.loginOtpGenerateModel = exports.verifyOtpModel = exports.logoutAllAdminUserModel = exports.frontendUserLogin = exports.frontendUserCreate = exports.getLiveUserListModel = void 0;
const logger_1 = require("../../lib/logger");
const user_schema_1 = __importDefault(require("../schema/user.schema"));
const bcrypt = __importStar(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usersOtp_schema_1 = __importDefault(require("../../domain/schema/usersOtp.schema"));
const ipAddress_schema_1 = __importDefault(require("../../domain/schema/ipAddress.schema"));
const setting_schema_1 = __importDefault(require("../../domain/schema/setting.schema"));
const userActivity_schema_1 = __importDefault(require("../../domain/schema/userActivity.schema"));
const sendEmail_service_1 = require("../../services/sendEmail.service");
const geolocation_1 = require("../../utils/geolocation");
const getLiveUserListModel = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const baseQuery = {
            login_status: true // ✅ Only include online users
        };
        if (search) {
            baseQuery.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        const skip = (page - 1) * limit;
        const users = yield user_schema_1.default
            .find(baseQuery)
            .sort({ updatedAt: -1 }) // ✅ Sort by latest activity or updated time
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield user_schema_1.default.countDocuments(baseQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.getLiveUserListModel = getLiveUserListModel;
const frontendUserCreate = (userData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        userData.role = "2";
        const existingUser = yield user_schema_1.default.findOne({ email: userData.email });
        if (existingUser) {
            const error = new Error("User with this email already exists.");
            return callback(error, null);
        }
        const salt = yield bcrypt.genSalt(10);
        userData.password = yield bcrypt.hash(userData.password, salt);
        const newUser = new user_schema_1.default(userData);
        yield newUser.save();
        return callback(null, newUser);
    }
    catch (error) {
        (0, logger_1.loggerMsg)("error", `Error during user registration: ${error}`);
        return callback(error, null);
    }
});
exports.frontendUserCreate = frontendUserCreate;
const frontendUserLogin = (userData, ip_address, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get geo location data with accurate city and zipcode
        const geoData = yield (0, geolocation_1.getGeoLocationFromIp)(ip_address);
        const user = yield user_schema_1.default.findOne({ email: userData.email });
        if (!user) {
            return callback(new Error("User not found with this email."), null);
        }
        if (user.is_approved == "NO") {
            const loginUserData = {
                user_id: user._id,
                user_type: "User",
                ip_address: ip_address,
                country: geoData.country,
                region: geoData.region,
                city: geoData.city,
                zipcode: geoData.zipcode,
                login_success: "Error",
                message: "User not approved by admin."
            };
            const user_activity = new userActivity_schema_1.default(loginUserData);
            yield user_activity.save();
            return callback(new Error("User not approved by admin."), null);
        }
        if (user.is_verified == "No") {
            const loginUserData = {
                user_id: user._id,
                ip_address: ip_address,
                user_type: "User",
                country: geoData.country,
                region: geoData.region,
                city: geoData.city,
                zipcode: geoData.zipcode,
                login_success: "Error",
                message: "User not verified. Please first verify your email."
            };
            const user_activity = new userActivity_schema_1.default(loginUserData);
            yield user_activity.save();
            return callback(new Error("User not verified. Please first verify your email."), null);
        }
        if (user.is_blocked == "Yes") {
            const loginUserData = {
                user_id: user._id,
                ip_address: ip_address,
                user_type: "User",
                country: geoData.country,
                region: geoData.region,
                city: geoData.city,
                zipcode: geoData.zipcode,
                login_success: "Error",
                message: "User is blocked by admin."
            };
            const user_activity = new userActivity_schema_1.default(loginUserData);
            yield user_activity.save();
            return callback(new Error("User is blocked by admin."), null);
        }
        if (!userData.password) {
            const loginUserData = {
                user_id: user._id,
                ip_address: ip_address,
                user_type: "User",
                country: geoData.country,
                region: geoData.region,
                city: geoData.city,
                zipcode: geoData.zipcode,
                login_success: "Error",
                message: "Password is required."
            };
            const user_activity = new userActivity_schema_1.default(loginUserData);
            yield user_activity.save();
            return callback(new Error("Password is required."), null);
        }
        const isPasswordCorrect = yield bcrypt.compare(userData.password, user.password);
        // if (!isPasswordCorrect) {
        //   const loginUserData = {
        //     user_id: user._id,
        //     ip_address: ip_address,
        //     user_type: "User",
        //     country: countryName,
        //     region: geo?.country,
        //     city: geo?.city,
        //     zipcode: zipcode,
        //     login_success: "Error",
        //     message: "Incorrect password."
        //   };
        //   const user_activity = new userActivity(loginUserData);
        //   await user_activity.save();
        //   return callback(new Error("Incorrect password."), null);
        // }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            sub_role: user.sub_role,
            phone_number: user.phone_number,
            profile_pic: user.profile_pic,
            website: user.website,
            show_website: user.show_website,
            is_approved: user.is_approved,
            is_verified: user.is_verified,
            is_blocked: user.is_blocked
        }, process.env.JWT_SECRET_KEY || "defaultsecretkey", { expiresIn: "8h" });
        const loginUserData = {
            user_id: user._id,
            ip_address: ip_address,
            user_type: "User",
            country: geoData.country,
            region: geoData.region,
            city: geoData.city,
            zipcode: geoData.zipcode,
            login_success: "sucess",
            message: "User logged in successfully"
        };
        const user_activity = new userActivity_schema_1.default(loginUserData);
        yield user_activity.save();
        const result = {
            message: "Login successful",
            user: user,
            token: token
        };
        return callback(null, result);
    }
    catch (error) {
        console.error("Error during login:", error);
        return callback(new Error("Something went wrong!"), null);
    }
});
exports.frontendUserLogin = frontendUserLogin;
const logoutAllAdminUserModel = (user_id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_schema_1.default.updateMany({
            _id: { $ne: user_id },
            role: { $in: [0, 3] }
        }, {
            $set: { login_status: false }
        });
        return callback(null, result);
    }
    catch (error) {
        console.error(error);
        return callback(new Error("Error occurred while logging out admin users"), null);
    }
});
exports.logoutAllAdminUserModel = logoutAllAdminUserModel;
const verifyOtpModel = (userData, ip_address, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ipAllowed = yield ipAddress_schema_1.default.findOne({ ip_address: ip_address, status: "active" });
        if (!ipAllowed) {
            return callback(new Error("Access denied: IP address not allowed"), null);
        }
        // Get geo location data with accurate city and zipcode
        const geoData = yield (0, geolocation_1.getGeoLocationFromIp)(ip_address);
        const user = yield user_schema_1.default.findOne({ email: userData.email });
        if (!user) {
            return callback(new Error("User not found!"), null);
        }
        // if (user.is_approved == 'No') {
        //     return callback(new Error("User not approved by admin."), null);
        // }
        // if (user.is_verified == 'No') {
        //     return callback(new Error("User not verified. Please first verify your email."), null);
        // }
        // if (user.is_blocked == 'Yes') {
        //     return callback(new Error("User is blocked by admin."), null);
        // }
        // ✅ Check OTP validity
        const otpRecord = yield usersOtp_schema_1.default.findOne({
            user: user.email,
            otp: userData.otp,
            status: "pending"
        });
        if (!otpRecord) {
            return callback(new Error("Invalid or expired OTP."), null);
        }
        // ✅ Delete all OTPs for the user after success
        yield usersOtp_schema_1.default.deleteMany({ user: user.email });
        // ✅ Create JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            sub_role: user.sub_role,
            phone_number: user.phone_number,
            profile_pic: user.profile_pic,
            website: user.website,
            show_website: user.show_website,
            is_approved: user.is_approved,
            is_verified: user.is_verified,
            is_blocked: user.is_blocked
        }, process.env.JWT_SECRET_KEY || "defaultsecretkey", { expiresIn: "8h" });
        // ✅ Record login activity
        const loginUserData = {
            user_id: user._id,
            ip_address: ip_address,
            user_type: "Admin",
            country: geoData.country,
            region: geoData.region,
            city: geoData.city,
            zipcode: geoData.zipcode,
            login_success: "success",
            message: "User logged in successfully"
        };
        const user_activity = new userActivity_schema_1.default(loginUserData);
        yield user_activity.save();
        const result = {
            message: "Login successful",
            user,
            token
        };
        return callback(null, result);
    }
    catch (error) {
        console.error("Error during OTP verification:", error);
        callback(new Error("Something went wrong!"), null);
    }
});
exports.verifyOtpModel = verifyOtpModel;
const loginOtpGenerateModel = (userData, ip_address, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Basic checks
        const ipAllowed = yield ipAddress_schema_1.default.findOne({ ip_address: ip_address, status: "active" });
        // if (!ipAllowed) return callback(new Error("Access denied: IP address not allowed"), null);
        const user = yield user_schema_1.default.findOne({ email: userData.email });
        if (!user)
            return callback(new Error("User not found!"), null);
        if (user.role != "0" && user.role != "3") {
            if (user.is_approved === "No")
                return callback(new Error("User not approved by admin."), null);
            if (user.is_verified === "No")
                return callback(new Error("User not verified. Please first verify your email."), null);
            if (user.is_blocked === "Yes")
                return callback(new Error("User is blocked by admin."), null);
        }
        // Step 2: Fast response
        callback(null, { message: "OTP process started", userId: user._id });
        // Step 3: Background processing
        process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                const geoData = yield (0, geolocation_1.getGeoLocationFromIp)(ip_address);
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const setting_Details = yield setting_schema_1.default.findOne();
                try {
                    const html = `
                    <div style="font-family: Arial, sans-serif; padding: 10px;">
                        <h2>Login OTP Request</h2>
                        <p><strong>User Email:</strong> ${userData.email}</p>
                        <p><strong>Generated OTP:</strong> <span style="font-size: 18px; color: #2d3748;">${otp}</span></p>
                        <p><strong>IP Address:</strong> ${ip_address}</p>
                        <p>This OTP has been generated for login verification.</p>
                        <p style="color: #888;">This OTP is valid for 10 minutes.</p>
                        <br/>
                        <p>Regards,</p>
                        <p>${process.env.PLATFORMNAME}</p>
                    </div>
                `;
                    const recipientEmail = (_a = setting_Details === null || setting_Details === void 0 ? void 0 : setting_Details.email_for_otp) === null || _a === void 0 ? void 0 : _a.trim();
                    yield sendEmail_service_1.EmailService.sendEmail(recipientEmail || userData.email, // Use setting email or user email
                    "Login OTP Request", html);
                }
                catch (bgError) {
                    console.error("Fail to send OTP", bgError);
                }
                yield usersOtp_schema_1.default.deleteMany({ user: user.email });
                const otpRecord = new usersOtp_schema_1.default({
                    user: user.email,
                    otp,
                    ip: ip_address,
                    location: `${geoData.country}, ${geoData.city}`
                });
                yield otpRecord.save();
            }
            catch (bgError) {
                console.error("Background OTP process failed:", bgError);
            }
        }));
    }
    catch (error) {
        console.error("Error during OTP initiation:", error);
        callback(new Error("Something went wrong!"), null);
    }
});
exports.loginOtpGenerateModel = loginOtpGenerateModel;
const userLogin = (userData, ip_address, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get geo location data with accurate city and zipcode
        const geoData = yield (0, geolocation_1.getGeoLocationFromIp)(ip_address);
        const user = yield user_schema_1.default.findOne({ email: userData.email });
        if (!user) {
            return callback(new Error("User not found with this email."), null);
        }
        user.login_status = true;
        yield user.save();
        // Function to save user login activity
        const saveLoginActivity = (success, message, type) => __awaiter(void 0, void 0, void 0, function* () {
            const loginUserData = {
                user_id: user._id,
                ip_address,
                user_type: type,
                country: geoData.country,
                region: geoData.region,
                city: geoData.city,
                zipcode: geoData.zipcode,
                login_success: success ? "Success" : "Error",
                message
            };
            yield new userActivity_schema_1.default(loginUserData).save();
        });
        // OTP login flow
        if (userData.login_method === "otp") {
            if (!userData.otp) {
                yield saveLoginActivity(false, "OTP is required for role 2.", "Admin");
                return callback(new Error("OTP is required for role 2."), null);
            }
            const userOtp = yield usersOtp_schema_1.default.findOne({ user: user.email });
            if (!userOtp) {
                yield saveLoginActivity(false, "No pending OTP found for this user.", "Admin");
                return callback(new Error("No pending OTP found for this user."), null);
            }
            if (userOtp.otp != userData.otp) {
                yield saveLoginActivity(false, "Incorrect OTP.", "Admin");
                return callback(new Error("Incorrect OTP."), null);
            }
            // OTP is correct – delete it
            yield userOtp.deleteOne();
            yield saveLoginActivity(true, "User logged in successfully.", "Admin");
        }
        // Password login flow
        else {
            if (!user.password) {
                yield saveLoginActivity(false, "Password not set for this user.", "Super Admin");
                return callback(new Error("Password not set for this user."), null);
            }
            const isPasswordCorrect = yield bcrypt.compare(userData.password, user.password);
            if (!isPasswordCorrect) {
                yield saveLoginActivity(false, "Incorrect password.", "Super Admin");
                return callback(new Error("Incorrect password."), null);
            }
            yield saveLoginActivity(true, "User logged in successfully.", "Super Admin");
        }
        const jwtOptions = user.role === '3'
            ? { expiresIn: '24h' } // Expire in 24 hours for role 3
            : {};
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            sub_role: user.sub_role,
            phone_number: user.phone_number,
            profile_pic: user.profile_pic,
            website: user.website,
            show_website: user.show_website,
            is_approved: user.is_approved,
            is_verified: user.is_verified,
            is_blocked: user.is_blocked
        }, process.env.JWT_SECRET_KEY || "defaultsecretkey", jwtOptions);
        //   await saveLoginActivity(true, "User logged in successfully.");
        const result = {
            message: "Login successful",
            user,
            token
        };
        return callback(null, result);
    }
    catch (error) {
        console.error("Error during login:", error);
        return callback(new Error("Something went wrong!"), []);
    }
});
exports.userLogin = userLogin;
const adminUserUpdate = (userData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by ID
        const existingUser = yield user_schema_1.default.findById(userData.user_id);
        if (!existingUser) {
            return callback(new Error("User not found."), null);
        }
        // Check if email is being updated and ensure it's unique
        if (userData.email) {
            const emailExists = yield user_schema_1.default.findOne({
                email: userData.email,
                _id: { $ne: userData.user_id } // Exclude the current user
            });
            if (emailExists) {
                return callback(new Error("User with this email already exists."), null);
            }
        }
        // If a password is provided, hash it
        if (userData.password) {
            const salt = yield bcrypt.genSalt(10);
            userData.password = yield bcrypt.hash(userData.password, salt);
        }
        // Ensure required fields are set
        userData.is_approved = "Yes";
        userData.is_verified = "Yes";
        userData.is_blocked = "No";
        // Perform the update
        const updatedUser = yield user_schema_1.default.findByIdAndUpdate(userData.user_id, { $set: userData }, { new: true } // Return the updated document
        );
        if (!updatedUser) {
            return callback(new Error("User update failed."), null);
        }
        return callback(null, updatedUser);
    }
    catch (error) {
        return callback(error, null);
    }
});
exports.adminUserUpdate = adminUserUpdate;
const adminUserCreate = (userData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield user_schema_1.default.findOne({ email: userData.email });
        if (existingUser) {
            const error = new Error("User with this email already exists.");
            return callback(error, null);
        }
        const salt = yield bcrypt.genSalt(10);
        userData.password = yield bcrypt.hash(userData.password, salt);
        userData.is_approved = "Yes";
        userData.is_verified = "Yes";
        userData.is_blocked = "No";
        const newUser = new user_schema_1.default(userData);
        yield newUser.save();
        return callback(null, newUser);
    }
    catch (error) {
        (0, logger_1.loggerMsg)("error", `Error during user registration: ${error}`);
        return callback(error, null);
    }
});
exports.adminUserCreate = adminUserCreate;
const adminUserLists = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Base condition: Only fetch users with role 0 or 3
        const baseQuery = { role: { $in: [0, 3] } };
        // Search condition if `search` is provided
        const searchQuery = search
            ? {
                $and: [
                    baseQuery, // Ensuring role condition is always applied
                    {
                        $or: [
                            { name: { $regex: search, $options: "i" } },
                            { email: { $regex: search, $options: "i" } }
                        ]
                    }
                ]
            }
            : baseQuery; // If no search, apply only role filter
        const skip = (page - 1) * limit;
        const users = yield user_schema_1.default.find(searchQuery).skip(skip).limit(limit).exec();
        const totalUsers = yield user_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.adminUserLists = adminUserLists;
const userLists = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield user_schema_1.default
            .find(searchQuery)
            .where("role")
            .in([1, 2])
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield user_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.userLists = userLists;
const adminUserActivityLists = (search, page, limit, user_type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { country: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                    { ip_address: { $regex: search, $options: "i" } }
                ],
                user_type: user_type
            }
            : { user_type: user_type };
        const skip = (page - 1) * limit;
        const users = yield userActivity_schema_1.default
            .find(searchQuery)
            .populate("user_id")
            .skip(skip)
            .limit(limit)
            .exec();
        const totalUsers = yield userActivity_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.adminUserActivityLists = adminUserActivityLists;
const pendingOtpList = (search, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { user: { $regex: search, $options: "i" } },
                    { otp: { $regex: search, $options: "i" } }
                ]
            }
            : {};
        const skip = (page - 1) * limit;
        const users = yield usersOtp_schema_1.default.find(searchQuery).skip(skip).limit(limit).exec();
        const totalUsers = yield usersOtp_schema_1.default.countDocuments(searchQuery);
        return {
            data: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.pendingOtpList = pendingOtpList;
const updatefrontendUserModel = (userData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = userData;
        const existingUser = yield user_schema_1.default.findById(user_id);
        if (!existingUser) {
            return callback(new Error("User not found"), null);
        }
        existingUser.name = userData.name;
        existingUser.email = userData.email;
        existingUser.phone_number = userData.phone_number;
        if (userData.profile_pic) {
            existingUser.profile_pic = userData.profile_pic;
        }
        if (userData.profile_banner) {
            existingUser.profile_banner = userData.profile_banner;
        }
        existingUser.website = userData.website;
        existingUser.updatedAt = new Date();
        const updatedUser = yield existingUser.save();
        return callback(null, updatedUser);
    }
    catch (error) {
        console.error(error);
        return callback(new Error("Error occurred while processing the user data"), null);
    }
});
exports.updatefrontendUserModel = updatefrontendUserModel;
const userUpdatePasswordModel = (userData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, old_password, password } = userData;
        const existingUser = yield user_schema_1.default.findById(user_id);
        if (!existingUser) {
            return callback(new Error("User not found"), null);
        }
        // Check if old password matches
        const isMatch = yield bcrypt.compare(old_password, existingUser.password);
        if (!isMatch) {
            return callback(new Error("Old password does not match"), null);
        }
        // Hash new password and update
        const hashedPassword = yield bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
        existingUser.updatedAt = new Date();
        const updatedUser = yield existingUser.save();
        return callback(null, updatedUser);
    }
    catch (error) {
        console.error(error);
        return callback(new Error("Error occurred while processing the user data"), null);
    }
});
exports.userUpdatePasswordModel = userUpdatePasswordModel;
const userDetail = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_schema_1.default.findOne({ _id: user_id });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.userDetail = userDetail;
const userCreateModel = (userData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield user_schema_1.default.findOne({ email: userData.email });
        if (existingUser) {
            return callback(new Error("User with this email already exists."), null);
        }
        const salt = yield bcrypt.genSalt(10);
        userData.password = yield bcrypt.hash(userData.password, salt);
        const newUser = new user_schema_1.default({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 1
        });
        const savedUser = yield newUser.save();
        return callback(null, savedUser);
    }
    catch (error) {
        console.error(error);
        return callback(new Error("Error occurred while creating the user"), null);
    }
});
exports.userCreateModel = userCreateModel;
const userCreateUpdateModel = (userData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = userData;
        const existingUser = yield user_schema_1.default.findOne({ _id: user_id });
        if (existingUser) {
            existingUser.name = userData.name;
            existingUser.email = userData.email;
            existingUser.password = userData.password;
            existingUser.role = userData.role;
            existingUser.phone_number = userData.phone_number;
            existingUser.profile_pic = userData.profile_pic;
            existingUser.show_website = userData.show_website;
            existingUser.is_approved = userData.is_approved;
            existingUser.is_verified = userData.is_verified;
            existingUser.is_blocked = userData.is_blocked;
            existingUser.website = userData.website;
            existingUser.sub_role = userData.sub_role;
            existingUser.updatedAt = new Date();
            const updatedUser = yield existingUser.save();
            return callback(null, updatedUser);
        }
        else {
            const newUser = new user_schema_1.default({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role,
                phone_number: userData.phone_number,
                profile_pic: userData.profile_pic,
                show_website: userData.show_website,
                is_approved: userData.is_approved,
                is_verified: userData.is_verified,
                is_blocked: userData.is_blocked,
                user_id: userData.user_id,
                website: userData.website,
                sub_role: userData.sub_role,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const savedUser = yield newUser.save();
            return callback(null, savedUser);
        }
    }
    catch (error) {
        console.error(error);
        return callback(new Error("Error occurred while processing the user data"), null);
    }
});
exports.userCreateUpdateModel = userCreateUpdateModel;
const getAllIserListModel = (search) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = search
            ? {
                $or: [{ name: { $regex: search, $options: "i" } }]
            }
            : {};
        const users = yield user_schema_1.default.find(searchQuery).exec();
        return {
            data: users
        };
    }
    catch (error) {
        throw new Error("Error fetching users");
    }
});
exports.getAllIserListModel = getAllIserListModel;
//# sourceMappingURL=user.model.js.map