import mongoose, { Document, Schema } from "mongoose";
const baseUrl = "https://macbookrent.in/";

export interface IUser extends Document {
  name: string;
  user_name:string;
  email: string;
  password: string;
  role: string;
  phone_number: string;
  profile_pic?: string;
  profile_banner?: string;
  show_website: string;
  is_approved: string;
  is_verified: string;
  is_blocked: string;
  website: string;
  sub_role: string;
  country_id: Number;
  state_id: Number;
  city_id: Number;
  area_id: Number;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  login_status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    user_name: { type: String, required: false },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    sub_role: { type: String, required: false, default: "0" },
    phone_number: { type: String, required: false },
    profile_pic: { type: String, required: false },
    profile_banner: { type: String, required: false },
    website: { type: String, required: false },
    country_id: {
        type: Number,
        ref: 'Country',
        required: false,
    },
    state_id: {
        type: Number,
        ref: 'State',
        required: false,
    },
    city_id: {
        type:Number,
        ref: 'City',
        required: false,
    },
    area_id: {
        type: Number,
        ref: 'Area',
        required: false,
    },
    show_website: { type: String, required: false, default: "false" },
    is_approved: { type: String, required: false, default: "No" },
    is_verified: { type: String, required: false, default: "No" },
    is_blocked: { type: String, required: false, default: "No" },
    resetPasswordToken: { type: String },
    login_status: { type: Boolean, default: true },
    resetPasswordExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Remove duplicate index - email field already has unique: true which creates the index
// userSchema.index({ email: 1 }, { unique: true }); // This line is causing the duplicate warning

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  if (user.profile_pic) {
    user.profile_pic = `${baseUrl}/${user.profile_pic.replace(/\\/g, '/')}`;
  }

  if (user.profile_banner) {
    user.profile_banner = `${baseUrl}/${user.profile_banner.replace(/\\/g, '/')}`;
  }

  return user;
};

const User = mongoose.model<IUser>("User", userSchema);

async function insertDefaultUser() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.create({
      _id: new mongoose.Types.ObjectId("679cc80efee9b7091ad808e1"),
      name: "Super Admin",
      email: "faizimohdindia@gmail.com",
      password: "$2b$10$KvJHo/rvLlioYhkw5WYp2OUar2RDmU965mRwKzaTbDHy.8Mt2gdb.",
      phone_number: "sjdhb",
      profile_pic: "sd",
      show_website: "Yes",
      is_approved: "Yes",
      is_verified: "Yes",
      is_blocked: "No",
      createdAt: new Date("2025-01-31T12:47:08Z"),
      updatedAt: new Date("2025-04-30T11:01:50.489Z"),
      website: "s df",
      role: "0",
      sub_role: "0",
      resetPasswordToken: "",
      resetPasswordExpires: new Date("2025-04-25T09:04:41.764Z"),
      login_status: true,
    });
    console.log("✅ Default admin user inserted.");
  }
}

insertDefaultUser().catch((err) =>
  console.error("❌ Error inserting default user:", err)
);

export default User;
