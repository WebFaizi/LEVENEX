import mongoose, { Document, Schema } from "mongoose";

export interface Iproducts extends Document {
    unique_id: number;
    product_name: string;
    product_images: string[];
    product_description: string;
    product_price: string;
    product_listing_id: String;
    product_category_id: Number;
    status?: boolean;
    ratingvalue?: number;
    ratingcount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    
}

const ProductSchema: Schema<Iproducts> = new Schema(
    {
        unique_id: {
            type: Number,
            unique: true,
            required: true
        },
        product_name: {
            type: String,
            required: true,
        },
        product_images: {
            type: [String],
            required: false,
        },
        product_description: {
            type: String,
            required: false,
        },
        product_price: {
            type: String,
            required: true,
        },
        product_listing_id: {
            type: String,
            ref: 'Listings',
            required: true,
        },
        product_category_id: {
            type: Number,
            ref: 'Category',
            required: true,
        },
        status: {
            type: Boolean,
            default: false,
        },
        ratingvalue: { type: Number, min: 1, max: 5, default: null }, 
        ratingcount: { type: Number, trim: true },
    },
    {
        timestamps: true,
    }
);

async function getNextAvailableId() {
    const records = await Products.find().sort({ unique_id: 1 }).select('unique_id');
    let expectedId = 1;
    for (let record of records) {
        if (record.unique_id !== expectedId) {
            return expectedId;
        }
        expectedId++;
    }
    return expectedId;
}

ProductSchema.pre<Iproducts>('validate', async function (next) {
    if (this.isNew && !this.unique_id) { 
        this.unique_id = await getNextAvailableId();
    }
    next();
});

ProductSchema.pre<Iproducts>('save', async function (next) {
    if (this.isNew) {
        this.unique_id = await getNextAvailableId();
    }
    next();
});

const Products = mongoose.model<Iproducts>("Products", ProductSchema);

export default Products;
