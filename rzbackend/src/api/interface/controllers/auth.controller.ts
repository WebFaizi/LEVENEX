import e, { Request, Response } from "express";
import Types from "mongoose";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import { userLogin,updatefrontendUserModel,userUpdatePasswordModel,adminUserCreate,adminUserLists,userLists,userDetail,userCreateModel,pendingOtpList,adminUserActivityLists,adminUserUpdate } from "../../domain/models/user.model";
import { LoginUserData } from '../../middleware/auth.middleware';
import userSchema from "../../domain/schema/user.schema";
import UsersOtp from "../../domain/schema/usersOtp.schema";
import CountryModel from "../../domain/schema/country.schema";
import StateModel from "../../domain/schema/state.schema";
import CityModel from "../../domain/schema/city.schema";
import AreaModel from "../../domain/schema/area.schema";
import settingSchema from "../../domain/schema/setting.schema";
import IpAddress from "../../domain/schema/ipAddress.schema";
import userActivitySchema from "../../domain/schema/userActivity.schema";
import { sendOtpToEmail } from "../../services/otp.service";
import { EmailService } from "../../services/sendEmail.service";
import importFileStatusSchema from "../../domain/schema/importFileStatus.schema";
import {storeUserActionActivity} from "../../services/userActionActivity.service";
import {insertOrUpdateExportTaskService} from "../../services/insertExportTaskService.service";
import * as bcrypt from 'bcryptjs';
import { getLiveUserListModel,frontendUserLogin,frontendUserCreate,getAllIserListModel,loginOtpGenerateModel,verifyOtpModel,logoutAllAdminUserModel } from "../../domain/models/user.model";
import path from "path"
import jwt from "jsonwebtoken";
import fs from "fs";
import * as XLSX from "xlsx";
import { getClientIp } from "../../utils/getClientIp";
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

interface FileWithBuffer extends Express.Multer.File {
    buffer: Buffer;
}

interface UsersOtp {
    user: Types.ObjectId;
    otp: string;
    status: "pending" | "verified" | "expired";
    createdAt?: Date;
    updatedAt?: Date;  
}

interface importUserData {
    name: string;
    email: string;
    phone_number: string;
    username: string;
    user_type: string;
    user_website: string;
    is_approved: string;
    is_verified: string;
    is_blocked: string;
    show_website: string;
    country: string;
    state: string;
    city: string;
    area: string;
}

async function findOrCreateLocation(model: any, name: string, parentId?: number) {
    // Check if the location exists
    let location = await model.findOne({ name });
    
    if (!location) {
        // If not, create the new location
        location = new model({ name, ...(parentId ? { parent_id: parentId } : {}) });
        await location.save();
    }
    
    return location.id;
}
const generateRandomPassword = (length: number = 12): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
};

export const importUsersExcelFormet = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Read the Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert Excel sheet to raw data
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        // Log the raw data to check its format        

        const users_data: importUserData[] = rawData.map((item, index) => {
            // Check required fields before processing
            if (!item["Email"] || !item["Name"]) {                
                return null; // Skip this record
            }

            return {
                name: String(item["Name"]?.trim() || ""),
                email: String(item["Email"]?.trim() || ""),
                phone_number: String(item["Phone Number"]?.trim() || ""),
                username: String(item["User Name"]?.trim() || ""),
                user_type: String(item["User Type"]?.toString().trim() || ""),
                user_website: String(item["User Website"]?.trim() || ""),
                is_approved: item["Is Approved"]?.trim() === "Yes" ? "Yes" : "No",
                is_verified: item["Is Verified"]?.trim() === "Yes" ? "Yes" : "No",
                is_blocked: item["Is Blocked"]?.trim() === "Yes" ? "Yes" : "No",
                show_website: item["Show Website"]?.trim() === "Yes" ? "Yes" : "No",
                country: String(item["Country"]?.trim() || ""),
                state: String(item["State"]?.trim() || ""),
                city: String(item["City"]?.trim() || ""),
                area: String(item["Area"]?.trim() || ""),
            };
        }).filter(item => item !== null); // Remove null entries from users_data                

        // Handle the import status and response
        const totalRecords = users_data.length;
        const avgTimePerRecord = 0.01; // seconds per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        await importFileStatusSchema.create({
            module_name: "UserImport",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const startResult = await insertOrUpdateExportTaskService("Users Import", "processing");
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`,
        });

    setTimeout(async () => {
    const failedImports: string[] = []; // To store errors and reasons for failed imports

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
                    countryId = await findOrCreateLocation(CountryModel, user.country);
                }

                // If state is provided, find or create the state (else, set stateId to null)
                if (user.state) {
                    stateId = await findOrCreateLocation(StateModel, user.state, countryId);
                }

                // If city is provided, find or create the city (else, set cityId to null)
                if (user.city) {
                    cityId = await findOrCreateLocation(CityModel, user.city, stateId);
                }

                // If area is provided, find or create the area (else, set areaId to null)
                if (user.area) {
                    areaId = await findOrCreateLocation(AreaModel, user.area, cityId);
                }

                // Check if the user already exists based on email
                const existingUser = await userSchema.findOne({ email: user.email });

                if (existingUser) {
                    // Update existing user
                    try {
                        await userSchema.updateOne(
                            { email: user.email },
                            {
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
                            }
                        );
                    } catch (updateError) {
                        failedImports.push(`Failed to update user with email ${user.email}: ${String(updateError)}`);
                    }
                } else {
                    // Create new user
                    try {
                        const newUser = new userSchema({
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

                        await newUser.save();
                    } catch (insertError) {
                        failedImports.push(`Failed to insert new user with email ${user.email}: ${String(insertError)}`);
                    }
                }
            } catch (err) {
                // Catch any errors in the processing of a user
                if (err instanceof Error) {
                    failedImports.push(`Error processing user with email ${user.email}: ${err.message}`);
                } else {
                    failedImports.push(`Unknown error processing user with email ${user.email}`);
                }
            }
        }     
     
        // Log the user activity
        await storeUserActionActivity(
            req.user.userId,
            "User",
            "Import",
            `Users imported (${users_data.length} records). Failed records: ${failedImports.length}`
        );

        // Delete the import status after processing
        await importFileStatusSchema.deleteOne({ module_name: "UserImport" });

        const startResult = await insertOrUpdateExportTaskService("Users Import", "completed");        
    } catch (err) {
        // Catch the outer error and handle it
        if (err instanceof Error) {
            console.error("User Import Error:", err.message);
        } else {
            console.error("Unknown Error:", err);
        }
        return res.status(500).json({ message: "Error importing users", error: err instanceof Error ? err.message : "Unknown error" });
    }
}, 100);

    } catch (error: any) {
        console.error("User import error:", error);
        return res.status(500).json({ message: "Error importing users", error: error.message });
    }
};

export const getLiveUserList = async (req: Request, res: Response) => {    
    try {
      
           const { search = '', page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const users = await getLiveUserListModel(search as string, pageNum, limitNum);

        return successResponse(res, "get live User list successfully", users);

    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateUserProfileDetails = async (req: Request, res: Response) => {
    try {
        req.body.user_id = req.user.userId;

        const files = req.files as FileWithBuffer[];

        files.forEach((file) => {
            const field_name = file.fieldname;
            const fileName = `${Date.now()}-${file.originalname}`;
            const savePath = path.join("uploads/user_images", fileName);
            fs.writeFileSync(savePath, file.buffer);
            req.body[field_name] = savePath;
        });

        const userSchemas = await userSchema.findById(req.user.userId);

        // 🔁 Image cleanup logic
        if (userSchemas) {
            if (req.body.profile_pic) {
                const oldImage = userSchemas.profile_pic;
                if (oldImage) {
                    const oldImagePath = path.join(__dirname, '../../../../', oldImage);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }

            if (req.body.profile_banner) {
                const oldImage = userSchemas.profile_banner;
                if (oldImage) {
                    const oldImagePath = path.join(__dirname, '../../../../', oldImage);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }
        }

        // ✅ Email uniqueness check
        if (req.body.email) {
            const emailExists = await userSchema.findOne({
                email: req.body.email,
                _id: { $ne: req.user.userId } // exclude current user
            });

            if (emailExists) {
                return ErrorResponse(res, "Email is already taken by another user.");
            }
        }

        // 👇 Proceed to update
        updatefrontendUserModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Profile updated successfully", result);
        });

    } catch (error) {        
        return ErrorResponse(res, "An error occurred during profile update.");
    }
};

export const userUpdatePassword = async (req: Request, res: Response) => {
    try {
        req.body.user_id = req.user.userId;

        userUpdatePasswordModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Profile updated successfully", result);
        });

    } catch (error) {
        console.log(error);
        return ErrorResponse(res, "An error occurred during profile update.");
    }
};

export const logoutAllAdminUser = async (req: Request, res: Response) => {
    try {
        
        logoutAllAdminUserModel(req.user.userId, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "All User Logout Successfully!", result);
        });
    } catch (error) {
        console.log(error);
        return ErrorResponse(res, "An error occurred during profile update.");
    }
};

export const frontendUserDetails = async (req:Request,res:Response) => {

    try {
        console.log(req.user.userId)
        const user = await userDetail(req.user.userId as string);
        return successResponse(res, "User details", user);
    } catch (error) {

        ErrorResponse(res,'An error occurred during user registration.');

    }
}

export const deleteUserList = async (req:Request,res:Response) => {
    try{
        const { user_ids } = req.body; 

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Blog Category ID.");
        }

        const result = await userSchema.deleteMany({ _id: { $in: user_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No country found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  users.`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getAllUsersList = async (req: Request, res: Response) => {    
    try {
      
        const { search = ''} = req.query;

        const users = await getAllIserListModel(search as string);

        return successResponse(res, "get admin User list successfully", users);

    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const frontendLogin = async (req: Request, res: Response) =>{
    try {
        const ip_address = getClientIp(req);
        console.log("Frontend Login IP:", ip_address); // Log for debugging
        frontendUserLogin(req.body, ip_address as string, (error:any, result:any) => {
            if (error) {
               return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Login User Successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const checkSuperadminUser = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const setting = await settingSchema.findOne({ super_admin: email });
        console.log("setting", setting)
        // const user = await userSchema.findOne({ email });
        // console.log("user", user)

        // if (!user) {
        //     return ErrorResponse(res, "User not found or does not have the required role.");
        // }

        let loginMethod = "password";

        // If not a super admin, apply IP and OTP validation
        if (!setting) {
            const requestIp = getClientIp(req);
            console.log("Check Superadmin User IP:", requestIp);
            const ipExists = await IpAddress.findOne({ ip_address: requestIp });

            if (!ipExists) {
                return ErrorResponse(res, "User with role 2 must have a registered IP address.");
            }

           loginOtpGenerateModel(req.body, requestIp as string, (error: any, result: any) => {
                if (error) {
                    return ErrorResponse(res, error.message);
                }
                return successResponse(res, "OTP generated successfully", result);
            });

            loginMethod = "otp";
        }else{
            return successResponse(res, "Superadmin user validated successfully", { loginMethod });
        }


    } catch (error) {
        console.error("Error checking superadmin user:", error);
        return ErrorResponse(res, "An error occurred while validating the user.");
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const ip_address = getClientIp(req);
        console.log("Admin Login IP:", ip_address); // Log for debugging
        userLogin(req.body, ip_address as string, (error:any, result:any) => {
            if (error) {
               return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Login User Successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const loginOtpVerify = async (req: Request, res: Response) => {
    try {
        const ip_address = getClientIp(req);
        console.log("OTP Verify IP:", ip_address); // Log for debugging
        verifyOtpModel(req.body, ip_address, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "OTP verified successfully", result);
        });

    } catch (error) {
        console.error(error);
        return ErrorResponse(res, "An error occurred during OTP verification.");
    }
};

export const loginOtpGenerate = async (req: Request, res: Response) => {
    try {
        const ip_address = getClientIp(req);
        console.log("OTP Generate IP:", ip_address); // Log for debugging
        loginOtpGenerateModel(req.body, ip_address, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "OTP generated successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res, "An error occurred during OTP generation.");
    }
};

export const getAllPendingOtp = async (req: Request, res: Response) => {    
    try {
      
        const { search = '', page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const users = await pendingOtpList(search as string, pageNum, limitNum);

        return successResponse(res, "get admin User list successfully", users);

    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const frontendRegistration = async (req: Request, res: Response) => {
    try {
        frontendUserCreate(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, " User register Successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateAdminUser = async (req: Request, res: Response) => {
    try {
        adminUserUpdate(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "update admin user Successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeAdminUser = async (req: Request, res: Response) => {
    try {
        adminUserCreate(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Admin User register Successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getuserByToken =async(req:Request ,res :Response)=>{
    try{
        const {token} = req.params;
        const decoded = jwt.verify(token,  process.env.JWT_SECRET_KEY || "defaultsecretkey"  as string);
        req.user = decoded;
        const user = await userSchema.findById(req.user.userId);
        return successResponse(res,"Get user Successfullu", user)
    }catch(error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}
 

export const adminUserList = async (req:Request,res:Response) => {
    try {
        const login_user = await LoginUserData(req, res);        
        const { search = '', page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const users = await adminUserLists(search as string, pageNum, limitNum);

        return successResponse(res, "get admin User list successfully", users);

    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const userList = async (req:Request,res:Response) => {
    try {

        const login_user = await LoginUserData(req, res);
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const users = await userLists(search as string, pageNum, limitNum);
        return successResponse(res, "get admin User list successfully", users);

    } catch (error) {

        ErrorResponse(res,'An error occurred during user registration.');

    }
}

export const userDetails = async (req:Request,res:Response) => {

    try {
        const { id } = req.params;
        console.log(id);
        const user = await userDetail(id as string);
        return successResponse(res, "User details", user);
    } catch (error) {

        ErrorResponse(res,'An error occurred during user registration.');

    }
}

export const userCreate = async (req:Request,res:Response) => {

    try {
        userCreateModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, " User register Successfully", result);
        });
    } catch (error) {

        ErrorResponse(res,'An error occurred during user registration.');

    }
}

export const userDetailsDelete = async (req:Request,res:Response) => {
    try {
        const { id } = req.params; // Get 'id' from route parameter

        const user = await userSchema.findById(id);

        if (!user) {
            return ErrorResponse(res, "User not found.");
        }

        return successResponse(res, "User details fetched successfully.", user);
    } catch (error) {
        console.error(error);
        return ErrorResponse(res, "An error occurred while fetching user details.");
    }
}

export const actionUserController = async (req: Request, res: Response) => {
    try {

        const { user_id, type, password } = req.body; 

        const user = await userSchema.findById(user_id);
        if (!user) return ErrorResponse(res, "User not found.");

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
                if (!password) return ErrorResponse(res, "Password is required for update.");
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                break;
            default:
                return ErrorResponse(res, "Invalid type provided.");
        }

        await user.save();
        return successResponse(res, "User updated successfully.", user);
    } catch (error) {
        console.error(error);
        return ErrorResponse(res, "An error occurred while updating the user.");
    }
};

export const updatePassword = async (req:Request,res:Response) => {
    try {
        const login_user = await LoginUserData(req, res);
        const user_id = req.user.userId;
        const { old_password, password, confirm_password } = req.body;

        const user = await userSchema.findById(user_id);

        const salt = await bcrypt.genSalt(10);
        const latest_password = await bcrypt.hash(confirm_password, salt);

        if (!user) {
            return ErrorResponse(res, 'User not found.');
        }

        const isMatch =  await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return ErrorResponse(res, 'Old password is incorrect.');
        }

        user.password = latest_password;
        user.save();

        return successResponse(res, 'Password updated successfully.', user);
    } catch (error) {
        console.error(error);
        return ErrorResponse(res, 'An error occurred while updating the password.');
    }
}

export const userActivityList = async (req:Request,res:Response) => {
    try {

        const { search = '', page = 1, limit = 10,user_type = "admin" } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const users = await adminUserActivityLists(search as string, pageNum, limitNum,user_type as string);
        return successResponse(res, "get admin User list successfully", users);

    } catch (error) {

        ErrorResponse(res,'An error occurred during user registration.');

    }
}

function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await userSchema.findOne({ email });

        if (!user) return ErrorResponse(res, 'User not found');

        

        const raw = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const token = `${Date.now()}-${generateToken(24)}`;
        const expires = Date.now() + 10 * 60 * 1000; 

        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(expires);
        await user.save();

        const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
        console.log("process.env.EMAIL_USER",process.env.EMAIL_USER)
        console.log(resetLink);
        await EmailService.sendEmail(email, 'Reset Password Link', resetLink);
        return successResponse(res, "Reset link sent to email", resetLink);

    } catch (error) {
        console.error(error);
        return ErrorResponse(res, 'An error occurred during password reset.');
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const { password } = req.body;
        console.log(token)
      const user = await userSchema.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });
  
      if (!user) {
        return ErrorResponse(res, 'Password reset link is invalid or has expired.');
      }
  
      user.password = await bcrypt.hash(password, 10); // Securely hash password
      user.resetPasswordToken = "";
      await user.save();
  
      return successResponse(res, "Password has been successfully updated.", null);
    } catch (error) {
      console.error(error);
      return ErrorResponse(res, 'An error occurred while resetting the password.');
    }
  };




