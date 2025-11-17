import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    subdomain_slug: string;
    desktop_image: string;
    mobile_image: string;
    description: string;
    subdomain_description: string;
    page_top_keyword: string;
    page_top_descritpion: string;
    sorting: number;
    unique_id: number;
    status: boolean;
    ratingvalue?: number;
    ratingcount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    related_categories?: number[];
}

const categorySchema: Schema<ICategory> = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        subdomain_slug: { type: String, required: false },
        desktop_image: { type: String, required: false },
        mobile_image: { type: String, required: false },
        description: { type: String, required: false },
        subdomain_description: { type: String, required: false },
        page_top_keyword: { type: String, required: false },
        page_top_descritpion: { type: String, required: false },
        sorting: { type: Number, required: false },
        unique_id: { type: Number, unique: true, required: true },
        status: { type: Boolean, required: true, default: false },
        ratingvalue: { type: Number, min: 1, max: 5, default: null },
        ratingcount: { type: Number, trim: true },
        related_categories: [{ type: String, required: false }],
    },
    {
        timestamps: true,
    }
);

// Auto-increment logic for unique_id
async function getNextAvailableCategoryId() {
    const records = await Category.find().sort({ unique_id: 1 }).select('unique_id');
    let expectedId = 1;
    for (let record of records) {
        if (record.unique_id !== expectedId) {
            return expectedId;
        }
        expectedId++;
    }
    return expectedId;
}

// Set unique_id only on create
categorySchema.pre<ICategory>('validate', async function (next) {
    if (this.isNew && !this.unique_id) {
        this.unique_id = await getNextAvailableCategoryId();
    }
    next();
});

categorySchema.pre<ICategory>('save', async function (next) {
    if (this.isNew) {
        this.unique_id = await getNextAvailableCategoryId();
    }
    next();
});

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
