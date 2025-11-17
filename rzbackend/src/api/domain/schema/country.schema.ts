import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface ICountry extends Document {
    name: string;
    status: number;
    unique_id: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const countrySchema: Schema<ICountry> = new Schema(
    {
        name: { type: String, required: true, trim: true },
        status: { type: Number, required: true, default: 1 }, 
        unique_id: { type: Number, unique: true, required: true },
    },
    {
        timestamps: true, 
    }
);

async function getNextAvailableId() {
    const records = await Country.find().sort({ unique_id: 1 }).select('unique_id');
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
countrySchema.pre<ICountry>('validate', async function (next) {
    if (this.isNew && !this.unique_id) {
        this.unique_id = await getNextAvailableId();
    }
    next();
});

countrySchema.pre<ICountry>('save', async function (next) {
    if (this.isNew) {
        this.unique_id = await getNextAvailableId();
    }
    next();
});

const Country = mongoose.model<ICountry>("Country", countrySchema);

export default Country;
