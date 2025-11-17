import mongoose from "mongoose";
import BannersTheme from "../../api/domain/schema/bannersTheme.schema"; // Adjust the import path

const seed = async () => {
    try {
  
      const existing = await BannersTheme.countDocuments();
      if (existing === 0) {
        await BannersTheme.insertMany([
          {
            banner_theme_slug: "category_listing",
            banner_theme_size: "728x90",
            provide_name: "test user",
            status: true,
            banner_type_code: [
              '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
            ],
          },
          {
            banner_theme_slug: "listing_side_bar",
            banner_theme_size: "728x90",
            provide_name: "test user",
            status: true,
            banner_type_code: [
              '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
            ],
          },
          {
            banner_theme_slug: "footer_bottom",
            banner_theme_size: "728x90",
            provide_name: "banner",
            status: true,
            banner_type_code: [
              '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
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
              '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
            ],
          },
          {
            banner_theme_slug: "header_bottom",
            banner_theme_size: "728x90",
            provide_name: "google",
            status: true,
            banner_type_code: [
              '<a class="ubm-banner" data-id="68024acc8b8656eafafb8dbd"></a>',
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
        ]);        
      } else {
        console.log("BannersTheme already has data. Skipping seed.");
      }
    } catch (error) {
      console.error("Seeding failed:", error);
    } finally {
      await mongoose.disconnect();
    }
  };
  
  seed();