import { loggerMsg } from "../../lib/logger";
import userSchema from "../schema/user.schema";
import * as bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "mongoose";
import UsersOtp from "../../domain/schema/usersOtp.schema";
import ipAddressSchema from "../../domain/schema/ipAddress.schema";
import settingSchema from "../../domain/schema/setting.schema";
import userActivity from "../../domain/schema/userActivity.schema";
import { EmailService } from "../../services/sendEmail.service";
import { getGeoLocationFromIp } from "../../utils/geolocation";

interface FileWithBuffer extends Express.Multer.File {
  buffer: Buffer;
}

interface verifyLoginData {
  email: string;
  otp: string;
}

interface userLoginData {
  email: string;
  password?: string;
  login_method?: string;
  otp?: string;
}

interface adminLoginResponse {
  email: string;
  password: string;
}

interface frontendUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone_number: string;
  profile_pic: string;
  show_website: string;
  is_approved: string;
  is_verified: string;
  is_blocked: string;
  website: string;
  sub_role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface adminUserResponse {
  name: string;
  email: string;
  password: string;
  role: string;
  phone_number: string;
  profile_pic: string;
  show_website: string;
  is_approved: string;
  is_verified: string;
  is_blocked: string;
  website: string;
  sub_role: string;
  createdAt: Date;
  updatedAt: Date;
  user_id?: string;
}

interface userResponse {
  name: string;
  email: string;
  password: string;
  role: string;
  phone_number: string;
  profile_pic: string;
  show_website: string;
  is_approved: string;
  is_verified: string;
  is_blocked: string;
  user_id?: string;
  website: string;
  sub_role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface frontendUserUpdateDetails {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  profile_pic?: string;
  profile_banner?: string;
  show_website: string;
  website: string;
}

interface frontendUserUpdatePassword {
  user_id: string;
  password: string;
}

export const getLiveUserListModel = async (search: string, page: number, limit: number) => {
  try {
    const baseQuery: any = {
      login_status: true // ✅ Only include online users
    };

    if (search) {
      baseQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await userSchema
      .find(baseQuery)
      .sort({ updatedAt: -1 }) // ✅ Sort by latest activity or updated time
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await userSchema.countDocuments(baseQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const frontendUserCreate = async (
  userData: frontendUserData,
  callback: (error: any, result: any) => void
) => {
  try {
    userData.role = "2";
    const existingUser = await userSchema.findOne({ email: userData.email });

    if (existingUser) {
      const error = new Error("User with this email already exists.");
      return callback(error, null);
    }

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    const newUser = new userSchema(userData);
    await newUser.save();

    return callback(null, newUser);
  } catch (error) {
    loggerMsg("error", `Error during user registration: ${error}`);
    return callback(error, null);
  }
};

export const frontendUserLogin = async (
  userData: userLoginData,
  ip_address: string,
  callback: (error: any, result: any) => void
) => {
  try {
    // Get geo location data with accurate city and zipcode
    const geoData = await getGeoLocationFromIp(ip_address);
    
    const user = await userSchema.findOne({ email: userData.email });
    
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
      const user_activity = new userActivity(loginUserData);
      await user_activity.save();
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
      const user_activity = new userActivity(loginUserData);
      await user_activity.save();
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
      const user_activity = new userActivity(loginUserData);
      await user_activity.save();
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
      const user_activity = new userActivity(loginUserData);
      await user_activity.save();
      return callback(new Error("Password is required."), null);
    }

    const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);

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

    const token = jwt.sign(
      {
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
      },
      process.env.JWT_SECRET_KEY || "defaultsecretkey",
      { expiresIn: "8h" }
    );

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
    const user_activity = new userActivity(loginUserData);
    await user_activity.save();

    const result = {
      message: "Login successful",
      user: user,
      token: token
    };

    return callback(null, result);
  } catch (error) {
    console.error("Error during login:", error);
    return callback(new Error("Something went wrong!"), null);
  }
};

export const logoutAllAdminUserModel = async (
  user_id: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const result = await userSchema.updateMany(
      {
        _id: { $ne: user_id },
        role: { $in: [0, 3] }
      },
      {
        $set: { login_status: false }
      }
    );

    return callback(null, result);
  } catch (error) {
    console.error(error);
    return callback(new Error("Error occurred while logging out admin users"), null);
  }
};

export const verifyOtpModel = async (
  userData: verifyLoginData,
  ip_address: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const ipAllowed = await ipAddressSchema.findOne({ ip_address: ip_address, status: "active" });
    if (!ipAllowed) {
      return callback(new Error("Access denied: IP address not allowed"), null);
    }

    // Get geo location data with accurate city and zipcode
    const geoData = await getGeoLocationFromIp(ip_address);

    const user = await userSchema.findOne({ email: userData.email });
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
    const otpRecord = await UsersOtp.findOne({
      user: user.email,
      otp: userData.otp,
      status: "pending"
    });

    if (!otpRecord) {
      return callback(new Error("Invalid or expired OTP."), null);
    }

    // ✅ Delete all OTPs for the user after success
    await UsersOtp.deleteMany({ user: user.email });

    // ✅ Create JWT
    const token = jwt.sign(
      {
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
      },
      process.env.JWT_SECRET_KEY || "defaultsecretkey",
      { expiresIn: "8h" }
    );

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
    const user_activity = new userActivity(loginUserData);
    await user_activity.save();

    const result = {
      message: "Login successful",
      user,
      token
    };

    return callback(null, result);
  } catch (error) {
    console.error("Error during OTP verification:", error);
    callback(new Error("Something went wrong!"), null);
  }
};

export const loginOtpGenerateModel = async (
  userData: userLoginData,
  ip_address: string,
  callback: (error: any, result: any) => void
) => {
  try {
    // Step 1: Basic checks
    const ipAllowed = await ipAddressSchema.findOne({ ip_address: ip_address, status: "active" });
    // if (!ipAllowed) return callback(new Error("Access denied: IP address not allowed"), null);

    const user = await userSchema.findOne({ email: userData.email });
    if (!user) return callback(new Error("User not found!"), null);
    if (user.role != "0" && user.role != "3") {
      if (user.is_approved === "No")
        return callback(new Error("User not approved by admin."), null);
      if (user.is_verified === "No")
        return callback(new Error("User not verified. Please first verify your email."), null);
      if (user.is_blocked === "Yes") return callback(new Error("User is blocked by admin."), null);
    }
    // Step 2: Fast response
    callback(null, { message: "OTP process started", userId: user._id });

    // Step 3: Background processing
    process.nextTick(async () => {
      try {
        const geoData = await getGeoLocationFromIp(ip_address);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const setting_Details = await settingSchema.findOne();
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

          const recipientEmail = setting_Details?.email_for_otp?.trim();
          await EmailService.sendEmail(
            recipientEmail || userData.email, // Use setting email or user email
            "Login OTP Request",
            html
          );
        } catch (bgError) {
          console.error("Fail to send OTP", bgError);
        }

        await UsersOtp.deleteMany({ user: user.email });

        const otpRecord = new UsersOtp({
          user: user.email,
          otp,
          ip: ip_address,
          location: `${geoData.country}, ${geoData.city}`
        });

        await otpRecord.save();
      } catch (bgError) {
        console.error("Background OTP process failed:", bgError);
      }
    });
  } catch (error) {
    console.error("Error during OTP initiation:", error);
    callback(new Error("Something went wrong!"), null);
  }
};

export const userLogin = async (
  userData: userLoginData,
  ip_address: string,
  callback: (error: any, result: any) => void
) => {
  try {
    // Get geo location data with accurate city and zipcode
    const geoData = await getGeoLocationFromIp(ip_address);

    const user = await userSchema.findOne({ email: userData.email });
    if (!user) {
      return callback(new Error("User not found with this email."), null);
    }

    user.login_status = true;
    await user.save();

    // Function to save user login activity
    const saveLoginActivity = async (success: boolean, message: string, type: string) => {
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
      await new userActivity(loginUserData).save();
    };

    // OTP login flow
    if (userData.login_method === "otp") {
      if (!userData.otp) {
        await saveLoginActivity(false, "OTP is required for role 2.", "Admin");
        return callback(new Error("OTP is required for role 2."), null);
      }

      const userOtp = await UsersOtp.findOne({ user: user.email });
      if (!userOtp) {
        await saveLoginActivity(false, "No pending OTP found for this user.", "Admin");
        return callback(new Error("No pending OTP found for this user."), null);
      }

      if (userOtp.otp != userData.otp) {
        await saveLoginActivity(false, "Incorrect OTP.", "Admin");
        return callback(new Error("Incorrect OTP."), null);
      }

      // OTP is correct – delete it
      await userOtp.deleteOne();
      await saveLoginActivity(true, "User logged in successfully.", "Admin");
    }

    // Password login flow
    else {
      if (!user.password) {
        await saveLoginActivity(false, "Password not set for this user.", "Super Admin");
        return callback(new Error("Password not set for this user."), null);
      }

      const isPasswordCorrect = await bcrypt.compare(userData.password as string, user.password);

      if (!isPasswordCorrect) {
        await saveLoginActivity(false, "Incorrect password.", "Super Admin");
        return callback(new Error("Incorrect password."), null);
      }

      await saveLoginActivity(true, "User logged in successfully.", "Super Admin");
    }
    const jwtOptions: jwt.SignOptions = user.role === '3'
        ? { expiresIn: '24h' }  // Expire in 24 hours for role 3
        : {}; 
    // Create JWT token
    const token = jwt.sign(
      {
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
      },
      process.env.JWT_SECRET_KEY || "defaultsecretkey",
      jwtOptions
    );

    //   await saveLoginActivity(true, "User logged in successfully.");

    const result = {
      message: "Login successful",
      user,
      token
    };

    return callback(null, result);
  } catch (error) {
    console.error("Error during login:", error);
    return callback(new Error("Something went wrong!"), []);
  }
};

export const adminUserUpdate = async (
  userData: adminUserResponse,
  callback: (error: any, result: any) => void
) => {
  try {
    // Find the user by ID
    const existingUser = await userSchema.findById(userData.user_id);
    if (!existingUser) {
      return callback(new Error("User not found."), null);
    }

    // Check if email is being updated and ensure it's unique
    if (userData.email) {
      const emailExists = await userSchema.findOne({
        email: userData.email,
        _id: { $ne: userData.user_id } // Exclude the current user
      });

      if (emailExists) {
        return callback(new Error("User with this email already exists."), null);
      }
    }

    // If a password is provided, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    // Ensure required fields are set
    userData.is_approved = "Yes";
    userData.is_verified = "Yes";
    userData.is_blocked = "No";

    // Perform the update
    const updatedUser = await userSchema.findByIdAndUpdate(
      userData.user_id,
      { $set: userData },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return callback(new Error("User update failed."), null);
    }

    return callback(null, updatedUser);
  } catch (error) {
    return callback(error, null);
  }
};

export const adminUserCreate = async (
  userData: adminUserResponse,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingUser = await userSchema.findOne({ email: userData.email });

    if (existingUser) {
      const error = new Error("User with this email already exists.");
      return callback(error, null);
    }

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);    
    userData.is_approved = "Yes";
    userData.is_verified = "Yes";
    userData.is_blocked = "No";

    const newUser = new userSchema(userData);
    await newUser.save();

    return callback(null, newUser);
  } catch (error) {
    loggerMsg("error", `Error during user registration: ${error}`);
    return callback(error, null);
  }
};

export const adminUserLists = async (search: string, page: number, limit: number) => {
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

    const users = await userSchema.find(searchQuery).skip(skip).limit(limit).exec();

    const totalUsers = await userSchema.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const userLists = async (search: string, page: number, limit: number) => {
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

    const users = await userSchema
      .find(searchQuery)
      .where("role")
      .in([1, 2])
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await userSchema.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const adminUserActivityLists = async (
  search: string,
  page: number,
  limit: number,
  user_type: string
) => {
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

    const users = await userActivity
      .find(searchQuery)
      .populate("user_id")
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await userActivity.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const pendingOtpList = async (search: string, page: number, limit: number) => {
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

    const users = await UsersOtp.find(searchQuery).skip(skip).limit(limit).exec();

    const totalUsers = await UsersOtp.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const updatefrontendUserModel = async (
  userData: frontendUserUpdateDetails,
  callback: (error: any, result: any) => void
) => {
  try {
    const { user_id } = userData;

    const existingUser = await userSchema.findById(user_id);
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

    const updatedUser = await existingUser.save();
    return callback(null, updatedUser);
  } catch (error) {
    console.error(error);
    return callback(new Error("Error occurred while processing the user data"), null);
  }
};

export const userUpdatePasswordModel = async (
  userData: {
    user_id: string;
    old_password: string;
    password: string; // new password
  },
  callback: (error: any, result: any) => void
) => {
  try {
    const { user_id, old_password, password } = userData;

    const existingUser = await userSchema.findById(user_id);
    if (!existingUser) {
      return callback(new Error("User not found"), null);
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(old_password, existingUser.password);
    if (!isMatch) {
      return callback(new Error("Old password does not match"), null);
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    existingUser.updatedAt = new Date();

    const updatedUser = await existingUser.save();
    return callback(null, updatedUser);
  } catch (error) {
    console.error(error);
    return callback(new Error("Error occurred while processing the user data"), null);
  }
};

export const userDetail = async (user_id: string) => {
  try {
    const user = await userSchema.findOne({ _id: user_id });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const userCreateModel = async (
  userData: userResponse,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingUser = await userSchema.findOne({ email: userData.email });

    if (existingUser) {
      return callback(new Error("User with this email already exists."), null);
    }

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    const newUser = new userSchema({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 1
    });

    const savedUser = await newUser.save();
    return callback(null, savedUser);
  } catch (error) {
    console.error(error);
    return callback(new Error("Error occurred while creating the user"), null);
  }
};

export const userCreateUpdateModel = async (
  userData: userResponse,
  callback: (error: any, result: any) => void
) => {
  try {
    const { user_id } = userData;
    const existingUser = await userSchema.findOne({ _id: user_id });
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
      const updatedUser = await existingUser.save();
      return callback(null, updatedUser);
    } else {
      const newUser = new userSchema({
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
      const savedUser = await newUser.save();
      return callback(null, savedUser);
    }
  } catch (error) {
    console.error(error);
    return callback(new Error("Error occurred while processing the user data"), null);
  }
};

export const getAllIserListModel = async (search: string) => {
  try {
    const searchQuery = search
      ? {
          $or: [{ name: { $regex: search, $options: "i" } }]
        }
      : {};

    const users = await userSchema.find(searchQuery).exec();

    return {
      data: users
    };
  } catch (error) {
    throw new Error("Error fetching users");
  }
};
