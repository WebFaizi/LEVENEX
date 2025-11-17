import mongoose, { Document, Schema } from "mongoose";

// Counter schema for auto-increment
const CounterSchema = new Schema({
    model: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

export interface IJobs extends Document {
    unique_id: number;
    job_category_id: mongoose.Types.ObjectId[];
    job_title: string;
    experience: string;
    salary: string;
    address: string;
    phone_number: string;
    keywords_tag: string[];
    is_approved: string;
    description: string;
    meta_title: string;
    meta_description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const JobSchema: Schema<IJobs> = new Schema(
    {
        unique_id: {
            type: Number,
            unique: true,
        },
        job_category_id: {
            type: [Schema.Types.ObjectId],
            ref: "JobCategory",
            required: true,
        },
        job_title: {
            type: String,
            required: true,
        },
        experience: {
            type: String,
            required: true,
        },
        salary: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        keywords_tag: {
            type: [String],
            required: true,
        },
        is_approved: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        meta_title: {
            type: String,
            required: true,
        },
        meta_description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware to auto-increment `unique_id` safely
JobSchema.pre<IJobs>("save", async function (next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: "Jobs" },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        this.unique_id = counter.count;
    }
    next();
});

const Jobs = mongoose.model<IJobs>("Jobs", JobSchema);

export default Jobs;
