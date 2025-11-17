import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IJobApplication extends Document {
    job_id: mongoose.Types.ObjectId[];
    name: string;
    phone_number: string;
}

const JobApplicationSchema: Schema = new Schema({
    job_id: { type: [Schema.Types.ObjectId], ref: 'Jobs', required: true },
    name: { type: String, required: true },
    phone_number: { type: String, required: true },
}, { timestamps: true });

const JobApplication = mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);

export default JobApplication;
