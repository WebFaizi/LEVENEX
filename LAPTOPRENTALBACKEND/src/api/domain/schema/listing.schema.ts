import mongoose, { Document, Schema } from "mongoose";

export interface IListings extends Document {
  user_id: mongoose.Types.ObjectId;
  listing_unique_id: string;
  category_ids: number[];
  listing_image: string;
  name: string;
  address: string;
  locality: string;
  pincode: string;
  latitude: string;
  longitude: string;
  country_id: number;
  state_id: number;
  city_id: number[];
  area_id: number;
  is_area_all_selected: boolean;
  is_city_all_selected: boolean;
  phone_number: string;
  email: string;
  contact_person: string;
  second_phone_no: string;
  second_email: string;
  website: string;
  listing_type: string;
  price: string;
  time_duration: string;
  cover_image: string;
  mobile_cover_image: string;
  video_url: string;
  description: string;
  status: boolean;
  approved: boolean;
  listing_views: number;
  listing_reviews_count: number;  
  listing_avg_rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 🔢 Random 6-digit generator
function generateRandomNumber(length = 6): string {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}

// 📦 Define schema
const ListingsSchema: Schema<IListings> = new Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    listing_unique_id: { type: String, unique: true }, // filled by hook
    category_ids: [{ type: Number, required: true }],
    listing_image: { type: String, default: "null" },
    name: { type: String, required: true },
    address: { type: String },
    locality: { type: String },
    pincode: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    country_id: { type: Number, ref: 'Country', required: true },
    state_id: { type: Number, ref: 'State', required: true },
    city_id: [{ type: Number, ref: 'City' }],
    area_id: { type: Number, ref: 'Area' },
    is_city_all_selected: { type: Boolean, default: false },
    is_area_all_selected: { type: Boolean, default: false },
    phone_number: { type: String },
    email: { type: String, required: true },
    contact_person: { type: String },
    second_phone_no: { type: String },
    second_email: { type: String },
    website: { type: String },
    listing_type: { type: String, default: "Free" },
    price: { type: String },
    time_duration: { type: String, default: "Per Day" },
    cover_image: { type: String, default: "null" },
    mobile_cover_image: { type: String, default: "null" },
    video_url: { type: String },
    description: { type: String },
    status: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    listing_views: { type: Number, default: 0 },
    listing_reviews_count: { type: Number, default: 0 },
    listing_avg_rating: { type: Number, default: 0 }

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🪝 Hook for .save()
ListingsSchema.pre<IListings>('save', async function (next) {
  if (!this.listing_unique_id) {
    let isUnique = false;
    while (!isUnique) {
      const id = generateRandomNumber();
      const exists = await mongoose.model<IListings>('Listings').exists({ listing_unique_id: id });
      if (!exists) {
        this.listing_unique_id = id;
        isUnique = true;
      }
    }
  }
  next();
});

// 🪝 Hook for .insertMany()
ListingsSchema.pre('insertMany', async function (next, docs: IListings[]) {
  try {
    for (const doc of docs) {
      if (!doc.listing_unique_id) {
        let isUnique = false;
        while (!isUnique) {
          const id = generateRandomNumber();
          const exists = await mongoose.model<IListings>('Listings').exists({ listing_unique_id: id });
          if (!exists) {
            doc.listing_unique_id = id;
            isUnique = true;
          }
        }
      }
    }
    next();
  } catch (err) {
    next(err as Error);
  }
});

// 📤 Export model
const Listings = mongoose.model<IListings>("Listings", ListingsSchema);
export default Listings;
