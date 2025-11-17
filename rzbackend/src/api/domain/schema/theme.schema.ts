import mongoose, { Document, Schema } from "mongoose";

export interface ITheme extends Document {
  theme_name: string;
  box_shadow: string;
  footer_background: string;
  button_shadow: string;
  body_background: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ThemeSchema: Schema<ITheme> = new Schema(
  {
    theme_name: { type: String, required: true, trim: true },
    box_shadow: { type: String, required: true, trim: true },
    footer_background: { type: String, required: true, trim: true },
    button_shadow: { type: String, required: true, trim: true },
    body_background: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const Theme = mongoose.model<ITheme>("Theme", ThemeSchema);

async function insertDefaultThemes() {
  const count = await Theme.countDocuments();
  if (count === 0) {
    await Theme.insertMany([
      {
        theme_name: "Theme One",
        box_shadow: "#FFE0E0",
        footer_background: "#284b63",
        button_shadow: "#FFF9C4",
        body_background: "#d9d9d9"
      },
      {
        theme_name: "Theme Two",
        box_shadow: "#F8BBD0",
        footer_background: "#16425b",
        button_shadow: "#C8E6C9",
        body_background: "#81c3d7"
      },
      {
        theme_name: "Theme Three",
        box_shadow: "#d8f3dc",
        footer_background: "#40916c",
        button_shadow: "#2d6a4f",
        body_background: "#b7e4c7"
      },
      {
        theme_name: "Theme Four",
        box_shadow: "#979dac",
        footer_background: "#0466c8",
        button_shadow: "#33415c",
        body_background: "#979dac"
      },
      {
        theme_name: "Theme Five",
        box_shadow: "#F3E5F5",
        footer_background: "#a9927d",
        button_shadow: "#FFFDE7",
        body_background: "#f2f4f3"
      },
      {
        theme_name: "Theme Six",
        box_shadow: "#FFEBEE",
        footer_background: "#a5a58d",
        button_shadow: "#E0F2F1",
        body_background: "#ffe8d6"
      },
      {
        theme_name: "Theme Seven",
        box_shadow: "#FFF8E1",
        footer_background: "#705d56",
        button_shadow: "#F1F8E9",
        body_background: "#99e1d9"
      },
      {
        theme_name: "Theme Eight",
        box_shadow: "#EDE7F6",
        footer_background: "#b58463",
        button_shadow: "#FCE4EC",
        body_background: "#fffcf2"
      },
      {
        theme_name: "Theme Nine",
        box_shadow: "#FFF3E0",
        footer_background: "#C8E6C9",
        button_shadow: "#D1C4E9",
        body_background: "#F9FBE7"
      },
      {
        theme_name: "Theme Ten",
        box_shadow: "#FFECB3",
        footer_background: "#68b0ab",
        button_shadow: "#DCEDC8",
        body_background: "#E1F5FE"
      },
      {
        theme_name: "Theme Eleven",
        box_shadow: "#F0F4C3",
        footer_background: "#3e6386",
        button_shadow: "#E1F5FE",
        body_background: "#d6f4ff"
      },
      {
        theme_name: "Theme Twelve",
        box_shadow: "#D7CCC8",
        footer_background: "#003554",
        button_shadow: "#EDE7F6",
        body_background: "#d6f4ff"
      },
      {
        theme_name: "Theme Thirteen",
        box_shadow: "#E8F5E9",
        footer_background: "#357f93",
        button_shadow: "#B3E5FC",
        body_background: "#a0e5fc"
      },
      {
        theme_name: "Theme Fourteen",
        box_shadow: "#DCEDC8",
        footer_background: "#3d5a80",
        button_shadow: "#E0F7FA",
        body_background: "#e0fbfc"
      },
      {
        theme_name: "Theme Fifteen",
        box_shadow: "#FFF9C4",
        footer_background: "#007090",
        button_shadow: "#E1F5FE",
        body_background: "#98afba"
      },
      {
        theme_name: "Theme Sixteen",
        box_shadow: "#D1C4E9",
        footer_background: "#004b23",
        button_shadow: "#F8BBD0",
        body_background: "#d2e4d6"
      },
      {
        theme_name: "Theme Seventeen",
        box_shadow: "#F5F5F5",
        footer_background: "#1c6e7d",
        button_shadow: "#FFF3E0",
        body_background: "#ccf6ff"
      },
      {
        theme_name: "Theme Eighteen",
        box_shadow: "#F9FBE7",
        footer_background: "#00a0f3",
        button_shadow: "#F3E5F5",
        body_background: "#e8fcff"
      },
      {
        theme_name: "Theme Ninety",
        box_shadow: "#f9f5da",
        footer_background: "#3674B5",
        button_shadow: "#dce3f0",
        body_background: "#9cc3d5"
      },
      {
        theme_name: "Theme Twenty",
        box_shadow: "#f9f5da",
        footer_background: "#3674B5",
        button_shadow: "#dce3f0",
        body_background: "#ede7e3"
      },
      {
        theme_name: "Theme Twentyone",
        box_shadow: "#dce3f0",
        footer_background: "#3674B5",
        button_shadow: "#9cc3d5",
        body_background: "#dad7cd"
      },
      {
        theme_name: "Theme Twentytwo",
        box_shadow: "#BFD7EA",
        footer_background: "#005b55",
        button_shadow: "#0074D9",
        body_background: "#fceaff"
      },
      {
        theme_name: "Theme Twentythree",
        box_shadow: "#B0BEC5",
        footer_background: "#92e6a7",
        button_shadow: "#0074D9",
        body_background: "#effdf1"
      },
      {
        theme_name: "Theme Twentyfour",
        box_shadow: "#A3A8C9",
        footer_background: "#0e384e",
        button_shadow: "#E94560",
        body_background: "#bbdefb"
      },
      {
        theme_name: "Theme Twentyfive",
        box_shadow: "#BDC3C7",
        footer_background: "#6f74a7",
        button_shadow: "#E74C3C",
        body_background: "#DFF4F3"
      }
    ]);    
  }
}

insertDefaultThemes().catch((err) =>
  console.error("❌ Error inserting default themes:", err)
);

export default Theme;
