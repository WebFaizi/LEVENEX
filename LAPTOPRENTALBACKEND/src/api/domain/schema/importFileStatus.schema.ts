import mongoose, { Document, Schema } from "mongoose";

export interface IImportFileStatus extends Document {
    module_name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ImportFileStatus: Schema<IImportFileStatus> = new Schema(
    {
        module_name: { type: String, required: false },
    },
    {
        timestamps: true, 
    }
);

const ImportFileSchema = mongoose.model<IImportFileStatus>("import_file_status", ImportFileStatus);

export default ImportFileSchema;
