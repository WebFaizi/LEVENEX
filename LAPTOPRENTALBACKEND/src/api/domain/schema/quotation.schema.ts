import mongoose, { Document, Schema } from "mongoose";

export interface IQuotation extends Document {
    category_ids: string[];
    quotation_type: 'Company' | 'Individual';
    name: string;
    quantity: number;
    email: string;
    phone_number: string;
    location: string;
    message: string;
    status: 'pending' | 'approved';
    view_by_admin: 'yes' | 'no';
    ip_address?: string;
    createdAt: Date;
    updatedAt: Date;
}

const quotationSchema: Schema<IQuotation> = new Schema(
    {
        category_ids: [{
            type: String,
            required: true,
        }],
        quotation_type: { type: String, required: true, enum: ['Company', 'Individual'] },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        email: { type: String, required: true, match: /.+\@.+\..+/ },
        phone_number: { type: String, required: true, match: /^\+?[1-9]\d{1,14}$/ },
        location: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, required: true, enum: ['pending', 'approved'], default: 'pending' },
        view_by_admin: { type: String, required: true, enum: ['yes', 'no'], default: 'no' },
        ip_address: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

const Quotation = mongoose.model<IQuotation>("Quotation", quotationSchema);

export default Quotation;
