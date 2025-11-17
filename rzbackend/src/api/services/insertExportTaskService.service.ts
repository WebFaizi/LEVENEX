import ExportTask from '../domain/schema/exportTask.schema';
 
export const insertOrUpdateExportTaskService = async (
  moduleName: string,
  status: "pending" | "in_progress" | "processing" | "completed" | "failed" = "processing"
) => {
  try {
    if (status === "processing" || status === "in_progress") {
      // Check if a processing task for this module already exists
      const existingTask = await ExportTask.findOne({
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
      const newTask = new ExportTask({
        module_name: moduleName,
        status,
        started_at: new Date(),
      });
 
      const savedTask = await newTask.save();
 
      return {
        success: true,
        message: "Export task started.",
        task: savedTask,
      };
    } else if (status === "completed" || status === "failed") {
      // Update existing "processing" task to completed or failed
      const updatedTask = await ExportTask.findOneAndUpdate(
        {
          module_name: moduleName,
          status: { $in: ["processing", "in_progress"] }
        },
        {
          status,
          completed_at: new Date()
        },
        { new: true }
      ).lean();
 
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
    } else {
      // For other statuses or fallback, you can insert or handle differently
      return {
        success: false,
        message: `Unsupported status "${status}".`,
      };
    }
  } catch (error) {
    console.error("Error in insertOrUpdateExportTaskService:", error);
    return {
      success: false,
      message: "Failed to insert or update export task.",
    };
  }
};