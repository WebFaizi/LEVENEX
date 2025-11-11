import mongoose, { Document, Schema } from "mongoose";

export interface IState extends Document {
    country_id: number;
    name: string;
    status: number;
    unique_id: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const StateSchema: Schema<IState> = new Schema(
    {
        country_id: { 
            type: Number, required: true, ref: "Country"
        },
        name: { type: String, required: true, trim: true },
        status: { type: Number, required: true, default: 1 }, 
        unique_id: { type: Number, unique: true, required: true },
    },
    {
        timestamps: true, 
    }
);

async function getNextAvailableStateId() {
    const records = await State.find({ unique_id: { $exists: true } }).sort({ unique_id: 1 }).select('unique_id');
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
StateSchema.pre<IState>('validate', async function (next) {
    if (this.isNew && !this.unique_id) {
        this.unique_id = await getNextAvailableStateId();
    }
    next();
});

StateSchema.pre<IState>('save', async function (next) {
    if (this.isNew) {
        this.unique_id = await getNextAvailableStateId();
    }
    next();
});

const State = mongoose.model<IState>("State", StateSchema);

export default State;
