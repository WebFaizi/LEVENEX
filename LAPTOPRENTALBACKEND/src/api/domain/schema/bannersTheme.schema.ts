import mongoose, { Document, Schema } from "mongoose";

export interface IBannersTheme extends Document {
    banner_theme_slug: string; 
    banner_theme_size: string;
    provide_name: string;
    status: boolean;
    banner_type_code: string[]; 
    createdAt?: Date; 
    updatedAt?: Date; 
}

const BannersThemeSchema: Schema<IBannersTheme> = new Schema(
    {
        banner_theme_slug: { type: String, required: true },
        banner_theme_size: { type: String, required: true },
        provide_name: { type: String, required: true },
        status: { type: Boolean, default: false },
        banner_type_code: { type: [String], default: [] },  // Explicitly defining it as an array of strings
    },
    {
        timestamps: true,  // Automatically adds `createdAt` and `updatedAt`
    }
);

const BannersTheme = mongoose.model<IBannersTheme>("BannersTheme", BannersThemeSchema);

// 🌱 Default banner themes to insert
const defaultThemes: Partial<IBannersTheme>[] = [
    {
      banner_theme_slug: "category_listing",
      banner_theme_size: "728x90",
      provide_name: "test user",
      status: true,
      banner_type_code: [
      ],
    },
    {
      banner_theme_slug: "listing_side_bar",
      banner_theme_size: "728x90",
      provide_name: "test user",
      status: true,
      banner_type_code: [
        
      ],
    },
    {
      banner_theme_slug: "footer_bottom",
      banner_theme_size: "728x90",
      provide_name: "banner",
      status: true,
      banner_type_code: [
        
      ],
    },
    {
      banner_theme_slug: "blog_paragraphs",
      banner_theme_size: "728x90",
      provide_name: "Google AdSense",
      status: true,
      banner_type_code: [],
    },
    {
      banner_theme_slug: "after_blog_image",
      banner_theme_size: "728x90",
      provide_name: "test user",
      status: true,
      banner_type_code: [
        '<a class="ubm-banner" data-id="67d7f973a69cbe3bd93ae66d"></a>',
      ],
    },
    {
      banner_theme_slug: "chat_boat",
      banner_theme_size: "728x90",
      provide_name: "chat",
      status: true,
      banner_type_code: [
        
      ],
    },
    {
      banner_theme_slug: "header_bottom",
      banner_theme_size: "728x90",
      provide_name: "google",
      status: true,
      banner_type_code: [
        
      ],
    },
    {
      banner_theme_slug: "left_side_banner",
      banner_theme_size: "728x90",
      provide_name: "side bar",
      status: true,
      banner_type_code: [
        '<a class="ubm-banner" data-id="6810728a2f36d411e432351c"></a>',
      ],
    },
  ];
  
  // 🧠 Insert default themes if none exist
  async function insertDefaultThemes() {
    const count = await BannersTheme.countDocuments();
    if (count === 0) {
      await BannersTheme.insertMany(defaultThemes);
      console.log("✅ Default banner themes inserted.");
    }
  }
  
  // Run the seeding logic when this model is imported
  insertDefaultThemes().catch((err) =>
    console.error("❌ Error inserting default banners:", err)
  );

export default BannersTheme;
