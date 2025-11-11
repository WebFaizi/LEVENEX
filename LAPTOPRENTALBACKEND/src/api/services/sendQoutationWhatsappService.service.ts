import citySchema from '../domain/schema/city.schema';
import categorySchema from '../domain/schema/category.schema';
import listingSchema from '../domain/schema/listing.schema';
import premiumListingSchema from '../domain/schema/premiumListing.schema';
import settingSchema from '../domain/schema/setting.schema';
import axios from 'axios';

interface quotationSchema {
  quotation_type: string;
  name: string;
  quantity: string;
  email: string;
  phone_number: string;
  location: string;
  message: string;
  category_ids: string;
}

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendQoutationWhatsappService = async (quotationSchema: quotationSchema) => {
  try {
    const categoryIds = quotationSchema.category_ids;
    const categories = await categorySchema.find({
      unique_id: { $in: categoryIds }
    }).select('name');

    const categoryNames = categories.map(c => c.name).join(', ');

    const city = await citySchema.findOne({
      name: { $regex: `^${quotationSchema.location}$`, $options: 'i' }
    });

    const messageText = `
      📝 *New Quotation Request*

      *Type:* ${quotationSchema.quotation_type}
      *Name:* ${quotationSchema.name}
      *Phone:* ${quotationSchema.phone_number}
      *Location:* ${quotationSchema.location}
      *Quantity:* ${quotationSchema.quantity}
      *Categories:* ${categoryNames}
      *Message:* ${quotationSchema.message}
    `.trim();

    const settings = await settingSchema.findOne({});
    if (settings?.send_whatsapp_message == 'yes') {
      const quotationNumbers = settings?.quotation_number
        ? settings.quotation_number.split(',').map(num => num.trim())
        : [];

      const sendWhatsappMessage = async (phoneNumber: string, message: string) => {
        const apiKey = settings?.whatsapp_key || 'your-default-apikey';
        const url = `http://api.textmebot.com/send.php?recipient=${encodeURIComponent(phoneNumber)}&apikey=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(message)}`;
        try {
          const response = await axios.get(url);          
        } catch (err) {
          console.error(`Failed to send message to ${phoneNumber}`, err);
        }
      };

      if (settings?.send_whatsapp_message == 'yes') {
        for (const phoneNumber of quotationNumbers) {
          if (phoneNumber) {
            await sendWhatsappMessage(phoneNumber, messageText);
            await sleep(6000); // 6-second delay
          }
        }
      }

      if (city) {
        const cityId = city.id.toString();
        const today = new Date();

        const premiumListings = await premiumListingSchema.find({
          city_id: { $in: [cityId] },
          $or: [
            { premium_type: { $ne: "epremium" } },
            { premium_type: "epremium", end_date: { $gt: today } }
          ]
        }).select("listing_id");

        const premiumListingIds = premiumListings.map(item => item.listing_id?.toString());

        const normal_listings = await listingSchema.find({
          approved: true,
          city_id: { $in: [cityId] },
          _id: { $nin: premiumListingIds }
        });

        const premiumListings_datas = await listingSchema.find({
          _id: { $in: premiumListingIds }
        });

        const uniquePremiumPhones = [...new Set(premiumListings_datas.map(l => l.phone_number).filter(Boolean))];
        const uniqueNormalPhones = [...new Set(normal_listings.map(l => l.phone_number).filter(Boolean))];
        if (settings?.send_whatsapp_message == 'yes') {
          for (const NormalPhone of uniqueNormalPhones) {
            if (NormalPhone) {
              await sendWhatsappMessage(NormalPhone, messageText);
              await sleep(6000); // 6-second delay
            }
          }

          for (const PremiumPhone of uniquePremiumPhones) {
            if (PremiumPhone) {
              await sendWhatsappMessage(PremiumPhone, messageText);
              await sleep(6000); // 6-second delay
            }
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error in sendQoutationWhatsappService:", error);
    throw new Error("Failed to send WhatsApp message");
  }
};

export default sendQoutationWhatsappService;
