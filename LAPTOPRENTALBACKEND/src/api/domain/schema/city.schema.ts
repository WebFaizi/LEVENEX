import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface ICity extends Document {
    state_id: number;
    name: string;
    status: number;
    is_top_city:boolean;
    unique_id: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const CitySchema: Schema<ICity> = new Schema(
    {
        state_id: { 
                    type: Number, 
                    ref: 'State', 
                    required: true 
                },
        name: { type: String, required: true, trim: true },
        is_top_city: { type: Boolean, default: false },
        status: { type: Number, required: true, default: 1 }, 
        unique_id: { type: Number, unique: true, required: true },
    },
    {
        timestamps: true, 
    }
);

async function getNextAvailableCityId() {
    const records = await City.find({ unique_id: { $exists: true } }).sort({ unique_id: 1 }).select('unique_id');
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
CitySchema.pre<ICity>('validate', async function (next) {
    if (this.isNew && !this.unique_id) {
        this.unique_id = await getNextAvailableCityId();
    }
    next();
});

CitySchema.pre<ICity>('save', async function (next) {
    if (this.isNew) {
        this.unique_id = await getNextAvailableCityId();
    }
    next();
});

const City = mongoose.model<ICity>("City", CitySchema);

export default City;
