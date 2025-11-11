import mongoose, { Document, Schema } from "mongoose";
import { env } from "process";

export interface ISetting extends Document {
    super_admin: string;
    email_for_otp: string;
    contact_email: string;
    quotation_emails: string;
    website_logo: string;
    mobile_logo: string;
    fav_icon: string;
    pre_loader: string;
    mobile_listing_banner: string;
    desktop_listing_banner: string;
    phone_number: string;
    login_page_content: string;
    category_box_links: "regular" | "subdomain";
    sidebar_button_sequence: string;
    facebook: string;
    footer_description: string;
    desktop_description: string;
    twitter: string;
    linkedin: string;
    quotation_number: string;
    whatsapp_key: string;
    send_whatsapp_message: "yes" | "no";
    send_quotation_mail: "yes" | "no";
    premium_testing_emails: string;
    send_mail_to_premium_listing: "yes" | "no";
    theme_id: mongoose.Types.ObjectId;
    home_page_layout_style:string;
    createdAt?: Date;
    updatedAt?: Date;  
}

const SettingSchema: Schema<ISetting> = new Schema(
    {
        super_admin: { type: String, required: true, trim: true },
        email_for_otp: { type: String, required: true, trim: true },
        contact_email: { type: String, required: true, trim: true },
        quotation_emails: { type: String, required: true, trim: true },
        website_logo: { type: String, required: false },
        mobile_logo: { type: String, required: false },
        fav_icon: { type: String, required: false },
        pre_loader: { type: String, required: false },
        home_page_layout_style : { type: String,  default: "0" },
        mobile_listing_banner: { type: String, required: false },
        desktop_listing_banner: { type: String, required: false },
        phone_number: { type: String, required: true, trim: true },
        login_page_content: { type: String, required: true },
        category_box_links: { type: String, enum: ["regular", "subdomain"], default:"regular" },
        sidebar_button_sequence: { type: String, required: true },
        facebook: { type: String, required: false },
        desktop_description: { type: String, required: false },
        footer_description: { type: String, required: false },
        twitter: { type: String, required: false },
        linkedin: { type: String, required: false },
        quotation_number: { type: String, required: false },
        whatsapp_key: { type: String, required: false },
        send_whatsapp_message: { type: String, enum: ["yes", "no"], default:"no" },
        send_quotation_mail: { type: String, enum: ["yes", "no"], default:"no" },
        premium_testing_emails: { type: String, required: false },
        send_mail_to_premium_listing: { type: String, enum: ["yes", "no"], default:"no" },
        theme_id : { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Theme', 
            required: true 
        },
    },
    {
        timestamps: true, 
    }
);




const Setting = mongoose.model<ISetting>("Setting", SettingSchema);


export default Setting;