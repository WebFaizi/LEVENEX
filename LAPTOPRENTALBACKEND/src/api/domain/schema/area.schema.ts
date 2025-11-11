import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IArea extends Document {
    city_id:  number;
    name: string;
    status: number;
    unique_id: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const AreaSchema: Schema<IArea> = new Schema(
    {
       city_id: { 
            type: Number, 
            ref: 'City', 
            required: true 
        },
        name: { type: String, required: true, trim: true },
        status: { type: Number, required: true, default: 1 },
        unique_id: { type: Number, unique: true, required: true }, 
    },
    {
        timestamps: true, 
    }
);

async function getNextAvailableAreaId() {
    const records = await Area.find().sort({ unique_id: 1 }).select('unique_id');
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
AreaSchema.pre<IArea>('validate', async function (next) {
    if (this.isNew && !this.unique_id) {
        this.unique_id = await getNextAvailableAreaId();
    }
    next();
});

AreaSchema.pre<IArea>('save', async function (next) {
    if (this.isNew) {
        this.unique_id = await getNextAvailableAreaId();
    }
    next();
});

const Area = mongoose.model<IArea>("Area", AreaSchema);

export default Area;
