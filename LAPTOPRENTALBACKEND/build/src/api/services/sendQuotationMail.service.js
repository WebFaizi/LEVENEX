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
exports.sendQoutationMailService = void 0;
const city_schema_1 = __importDefault(require("../domain/schema/city.schema"));
const category_schema_1 = __importDefault(require("../domain/schema/category.schema"));
const listing_schema_1 = __importDefault(require("../domain/schema/listing.schema"));
const premiumListing_schema_1 = __importDefault(require("../domain/schema/premiumListing.schema"));
const setting_schema_1 = __importDefault(require("../domain/schema/setting.schema"));
const sendEmail_service_1 = require("../services/sendEmail.service");
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
const sendQoutationMailService = (quotationData, newsletter) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        quotationData.listing = Array.isArray(quotationData.listing)
            ? quotationData.listing
            : [];
        const now = new Date();
        const requestDate = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const currentYear = now.getFullYear();
        const baseUrl = process.env.BASE_URL;
        // Normalize platform name to avoid typos like "Laptoponrent"
        const platformName = (process.env.PLATFORMNAME || 'Laptoprental').replace(/Laptoponrent/gi, 'Laptoprental');
        var newslatter = newsletter[0];
        if (newslatter.newsletter_banner_image) {
            newslatter.newsletter_banner_image = `${baseUrl}${newslatter.newsletter_banner_image}`;
        }
        function joincategory(item) {
            return item === null || item === void 0 ? void 0 : item.map((item) => item.name).join(", ");
        }
        let htmlthankYou = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quotation Request Received</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden; font-family: Arial, sans-serif;">
            <tr>
              <td style="background-color: #004080; color: #ffffff; padding: 20px; font-size: 20px; text-align: center;">
                Quotation Request Received
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                <p style="margin-top: 0;">Hello <strong>${quotationData.name}</strong>,</p>
                <p>Thank you for submitting your quotation request with <strong>${platformName}</strong>. We’ve received your details and will review them right away.</p>               
            </tr>




`;
        if (quotationData.listing && Array.isArray(quotationData.listing)) {
            for (const item of quotationData.listing) {
                htmlthankYou += `
  <table style="width: 100%;max-width: 800px;margin-left: auto;margin-right: auto;border-collapse: separate;border-spacing: 0 16px;" width="100%">
    <tr>
        <td style="border: 1px solid #ddd;background-color: white;padding: 15px;border-radius: 5px;box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <table style="width: 100%;border-collapse: collapse;">
            <tbody>
              <tr>
                <th style="color: #d32f2f;font-size:16px;font-weight:bold;text-align:left;padding-bottom:8px;">${item.listingData.name}</th>
              </tr>
             
              <tr>
                <td style="font-size:14px;padding-bottom:8px;color: #333;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px;vertical-align: bottom;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>${(_a = item.listingData.city[0]) === null || _a === void 0 ? void 0 : _a.name}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <table style="width: 100%;border-collapse: collapse;">
                    <tbody>
                      <tr>
                        <td style="font-size: 14px; color: #333; width: 50%;">
                            
                          Call: <a href="tel:${item.listingData.phone_number}" style="color: #FFFFFF;width: fit-content;display: inline-block;background: forestgreen;padding: 4px 10px;text-decoration: none;font-size: 20px;line-height: 1;border-radius: 8px;vertical-align: middle;">&#9990;</a>
                        </td>
                        <td style="font-size: 14px; color: #333; text-align: right;">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:18px;height:18px;vertical-align: bottom;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                          </svg>
                          Email: <a href="mailto:${item.listingData.email}" style="color: #1976d2; text-decoration: none;">${item.listingData.email}</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
  </table>
`;
            }
        }
        htmlthankYou += ` <tr>
              <td style="background-color: #eeeeee; color: #555555; font-size: 14px; text-align: center; padding: 15px;">
                ${currentYear} ${platformName}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
        const customer_html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quotation Request Received</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #2F80ED;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .body {
      padding: 30px 20px;
      color: #333333;
      line-height: 1.6;
    }
    .body p {
      margin: 16px 0;
    }
    .details {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 16px;
      margin: 20px 0;
      background-color: #fafafa;
    }
    .details p {
      margin: 8px 0;
    }
    .details strong {
      display: inline-block;
      width: 120px;
      color: #2F80ED;
    }
    .footer {
      background-color: #f4f4f4;
      color: #777777;
      text-align: center;
      font-size: 12px;
      padding: 16px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Quotation Request Received</h1>
    </div>
    <div class="body">
      <p>Hello <strong>${quotationData.name}</strong>,</p>
  <p>Thank you for submitting your quotation request with <strong>${platformName}</strong>. We’ve received your details and will review them right away.</p>
      
      <div class="details">
        <p><strong>Request Type:</strong> ${quotationData.quotation_type}</p>
        <p><strong>Requested On:</strong> ${requestDate}</p>
        <p><strong>Message:</strong> ${quotationData.message}</p>
      </div>

      <p>Our team will contact you within 24–48 hours to discuss the next steps.</p>
      <p>We appreciate your interest and look forward to serving you!</p>
    </div>
    <div class="footer">
  &copy; ${currentYear} ${platformName}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
        let newslatterhtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rental Listings Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

  <!-- Top Banner -->
  <table width="100%" style="background-color: #ffffff;">
    <tr>
      <td align="center">
        <img src="${newslatter === null || newslatter === void 0 ? void 0 : newslatter.newsletter_banner_image}" alt="Top Banner" style="width: 100%; max-width: 600px;">
      </td>
    </tr>
  </table>

  <!-- Dangerous HTML Description -->
  <table width="100%" style="background-color: #ffffff; padding: 20px;">
    <tr>
      <td>
        ${newslatter === null || newslatter === void 0 ? void 0 : newslatter.newsletter_description}
      </td>
    </tr>
  </table>

  <!-- Listings Section -->
`;
        if (Array.isArray(newslatter === null || newslatter === void 0 ? void 0 : newslatter.listings)) {
            for (const item of newslatter === null || newslatter === void 0 ? void 0 : newslatter.listings) {
                newslatterhtml += `
  <table style="width: 100%;max-width: 800px;margin-left: auto;margin-right: auto;border-collapse: separate;border-spacing: 0 16px;" width="100%">
    <tr>
        <td style="border: 1px solid #ddd;background-color: white;padding: 15px;border-radius: 5px;box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <table style="width: 100%;border-collapse: collapse;">
            <tbody>
              <tr>
                <th style="color: #d32f2f;font-size:16px;font-weight:bold;text-align:left;padding-bottom:8px;">${item.name}</th>
              </tr>
              <tr>
                <td style="color: #1976d2;font-size:14px;padding-bottom:8px;line-height:1.4;">${joincategory(item.category_ids)}</td>
              </tr>
              <tr>
                <td style="font-size:14px;padding-bottom:8px;color: #333;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px;vertical-align: bottom;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>${(_b = item.cities[0]) === null || _b === void 0 ? void 0 : _b.name}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <table style="width: 100%;border-collapse: collapse;">
                    <tbody>
                      <tr>
                        <td style="font-size: 14px; color: #333; width: 50%;">
                          
                          call: <a href="tel:${item.phone_number}" style="color: #FFFFFF;width: fit-content;display: inline-block;background: forestgreen;padding: 4px 10px;text-decoration: none;font-size: 20px;line-height: 1;border-radius: 8px;vertical-align: middle;">&#9990;</a>
                        </td>
                        <td style="font-size: 14px; color: #333; text-align: right;">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:18px;height:18px;vertical-align: bottom;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                          </svg>
                          Email: <a href="mailto:${item.email}" style="color: #1976d2; text-decoration: none;">${item.email}</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
  </table>
`;
            }
        }
        newslatterhtml += `
  <!-- Footer -->
  <table width="100%" style="background-color: #f4f4f4; padding: 10px;">
    <tr>
      <td align="center">
        <p style="font-size: 12px; color: #888;">© 2025 Laptop Rentals India. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
        yield sendEmail_service_1.EmailService.sendEmail(quotationData.email, "New Quotation From User", htmlthankYou, platformName);
        yield sendEmail_service_1.EmailService.sendEmail(quotationData.email, "Newsletter ", newslatterhtml, platformName);
        const excludedCities = ["mumbai", "thane", "navi mumbai"];
        const categoryIds = quotationData.category_ids;
        const categories = yield category_schema_1.default
            .find({
            unique_id: { $in: categoryIds }
        })
            .select("name");
        const categoryNames = categories.map((c) => c.name).join(", ");
        const city = yield city_schema_1.default.findOne({
            name: { $regex: `^${quotationData.location}$`, $options: "i" }
        });
        const hideContent = `
            <table style="width: 100%; max-width: 600px; font-family: Arial, sans-serif; border-collapse: collapse;">
                <tr><td colspan="2" style="background:#f4f4f4; padding:16px; text-align:center; font-size:20px; font-weight:bold;">
                Quotation Request Details
                </td></tr>
                 <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Listing Enquire For</strong></td><td style="padding:12px; border:1px solid #ddd;">${categoryNames}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Quotation Type</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.quotation_type}</td></tr>
                 <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Quantity</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.quantity}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Name</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.name}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:12px; border:1px solid #ddd;">XXXXXXXXXXX</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Phone Number</strong></td><td style="padding:12px; border:1px solid #ddd;">XXXXXXXXXX</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Location</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.location}</td></tr>                              
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Message</strong></td><td style="padding:12px; border:1px solid #ddd;">xxxxxxxxxxxxx</td></tr>
            </table>
           <a href="${process.env.BASE_URL_TWO}/premium-request" 
                style="display: inline-block; margin-top: 20px; padding: 10px 20px; font-size: 16px; 
                        font-family: Arial, sans-serif; color: #fff; background-color: #007BFF; 
                        text-decoration: none; border-radius: 5px;">
                Request Premium Access
              </a>
            `;
        const showContent = `
            <table style="width: 100%; max-width: 600px; font-family: Arial, sans-serif; border-collapse: collapse;">
                <tr><td colspan="2" style="background:#f4f4f4; padding:16px; text-align:center; font-size:20px; font-weight:bold;">
                Quotation Request Details
                </td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Listing Enquire For</strong></td><td style="padding:12px; border:1px solid #ddd;">${categoryNames}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Quotation Type</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.quotation_type}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Quantity</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.quantity}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Name</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.name}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.email}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Phone Number</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.phone_number}</td></tr>
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Location</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.location}</td></tr>                               
                <tr><td style="padding:12px; border:1px solid #ddd;"><strong>Message</strong></td><td style="padding:12px; border:1px solid #ddd;">${quotationData.message}</td></tr>
            </table>
            `;
        const settings = yield setting_schema_1.default.findOne({});
        const settingsEmails = (settings === null || settings === void 0 ? void 0 : settings.quotation_emails)
            ? settings.quotation_emails.split(",").map((email) => email.trim())
            : [];
        // ✅ 1. Send to Settings Email IDs
        for (const adminEmail of settingsEmails) {
            if (isValidEmail(adminEmail)) {
                yield sendEmail_service_1.EmailService.sendEmail(adminEmail, `New Quotation From ${quotationData.name} admin panel ${process.env.HOST}`, showContent, quotationData.name);
            }
        }
        if ((settings === null || settings === void 0 ? void 0 : settings.send_quotation_mail) != "no") {
            // ✅ 2. Send to Listing Owners in the Same City
            if (city) {
                if (!excludedCities.includes(city.name.toLowerCase())) {
                    const cityId = city.id.toString();
                    const today = new Date();
                    const premiumListings = yield premiumListing_schema_1.default
                        .find({
                        $or: [
                            // 1. Get all super_premium
                            { premium_type: "super_premium" },
                            // 2. Get epremium where not expired and matches city
                            {
                                premium_type: "epremium",
                                end_date: { $gt: today },
                                city_id: cityId
                            }
                        ]
                    })
                        .select("listing_id");
                    const premiumListingIds = premiumListings.map((item) => { var _a; return (_a = item.listing_id) === null || _a === void 0 ? void 0 : _a.toString(); });
                    const normal_listings = yield listing_schema_1.default.find({
                        approved: true,
                        city_id: { $in: [cityId] },
                        listing_unique_id: { $nin: premiumListingIds }
                    });
                    const premiumListings_datas = yield listing_schema_1.default.find({
                        listing_unique_id: { $in: premiumListingIds }
                    });
                    const uniquePremiumEmails = [
                        ...new Set(premiumListings_datas.map((l) => l.email).filter(Boolean))
                    ];
                    const uniqueNormalEmails = [
                        ...new Set(normal_listings.map((l) => l.email).filter(Boolean))
                    ];
                    for (const email of uniqueNormalEmails) {
                        if (isValidEmail(email)) {
                            yield sendEmail_service_1.EmailService.sendEmail(email, "New Quotation From Normal", hideContent);
                        }
                    }
                    for (const emails of uniquePremiumEmails) {
                        if (isValidEmail(emails)) {
                            yield sendEmail_service_1.EmailService.sendEmail(emails, "New Quotation From Premium", showContent);
                            // emailQueue.add({
                            //   to: emails,
                            //   subject: "New Quotation From Premium",
                            //   html: showContent
                            // });
                        }
                    }
                }
            }
        }
        return true;
    }
    catch (error) {
        console.error("Error in sendQoutationMailService:", error);
        throw new Error("Failed to fetch location details");
    }
});
exports.sendQoutationMailService = sendQoutationMailService;
exports.default = exports.sendQoutationMailService;
//# sourceMappingURL=sendQuotationMail.service.js.map