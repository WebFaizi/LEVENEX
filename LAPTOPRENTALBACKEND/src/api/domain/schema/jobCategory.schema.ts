import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IJobCategory extends Document {
   name:string;
   slug:string;
   image:string;
   sorting:number;
   unique_id:number;
   status:boolean;
}

const jobCategorySchema: Schema<IJobCategory> = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        image: { type: String, required: false },
        sorting: { type: Number, required: false,default:0 },
        unique_id: {
            type: Number,
            unique: true,
            required: true
        },
        status:{ type: Boolean, required: true,default:false },
    },
    {
        timestamps: true,
    }
);

async function getNextAvailableId() {
    const records = await JobCategory.find().sort({ unique_id: 1 }).select('unique_id');
    let expectedId = 1;
    for (let record of records) {
        if (record.unique_id !== expectedId) {
            return expectedId;
        }
        expectedId++;
    }
    return expectedId;
}

jobCategorySchema.pre<IJobCategory>('validate', async function (next) {
    if (this.isNew && !this.unique_id) { 
        this.unique_id = await getNextAvailableId();
    }
    next();
});

jobCategorySchema.pre<IJobCategory>('save', async function (next) {
    if (this.isNew) {
        this.unique_id = await getNextAvailableId();
    }
    next();
});


const JobCategory = mongoose.model<IJobCategory>("JobCategory", jobCategorySchema);

export default JobCategory;
