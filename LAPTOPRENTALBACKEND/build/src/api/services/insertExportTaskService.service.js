"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertOrUpdateExportTaskService = void 0;
const exportTask_schema_1 = __importDefault(require("../domain/schema/exportTask.schema"));
const insertOrUpdateExportTaskService = (moduleName_1, ...args_1) => __awaiter(void 0, [moduleName_1, ...args_1], void 0, function* (moduleName, status = "processing") {
    try {
        if (status === "processing" || status === "in_progress") {
            // Check if a processing task for this module already exists
            const existingTask = yield exportTask_schema_1.default.findOne({
                module_name: moduleName,
                status: { $in: ["processing", "in_progress"] }
            });
            if (existingTask) {
                // Do not insert duplicate, return existing
                return {
                    success: false,
                    message: `An export task for module "${moduleName}" is already in progress.`,
                    task: existingTask,
                };
            }
            // Insert new processing task
            const newTask = new exportTask_schema_1.default({
                module_name: moduleName,
                status,
                started_at: new Date(),
            });
            const savedTask = yield newTask.save();
            return {
                success: true,
                message: "Export task started.",
                task: savedTask,
            };
        }
        else if (status === "completed" || status === "failed") {
            // Update existing "processing" task to completed or failed
            const updatedTask = yield exportTask_schema_1.default.findOneAndUpdate({
                module_name: moduleName,
                status: { $in: ["processing", "in_progress"] }
            }, {
                status,
                completed_at: new Date()
            }, { new: true }).lean();
            if (!updatedTask) {
                return {
                    success: false,
                    message: `No processing export task found to update for module "${moduleName}".`,
                };
            }
            return {
                success: true,
                message: `Export task for module "${moduleName}" marked as ${status}.`,
                task: updatedTask,
            };
        }
        else {
            // For other statuses or fallback, you can insert or handle differently
            return {
                success: false,
                message: `Unsupported status "${status}".`,
            };
        }
    }
    catch (error) {
        console.error("Error in insertOrUpdateExportTaskService:", error);
        return {
            success: false,
            message: "Failed to insert or update export task.",
        };
    }
});
exports.insertOrUpdateExportTaskService = insertOrUpdateExportTaskService;
//# sourceMappingURL=insertExportTaskService.service.js.map