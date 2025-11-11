import mongoose, { Document, Schema } from "mongoose";
 
export interface IExportTask extends Document {
    module_name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    started_at: Date;
    completed_at?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
 
const ExportTaskSchema: Schema<IExportTask> = new Schema(
    {
        module_name: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'   ],
            default: 'processing',
        },
        started_at: { type: Date, default: Date.now },
        completed_at: { type: Date ,default: null },
    },
    {
        timestamps: true,
    }
);
 
const ExportTask = mongoose.model<IExportTask>("ExportTask", ExportTaskSchema);
 
export default ExportTask;