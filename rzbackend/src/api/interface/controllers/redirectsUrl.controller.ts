import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import RedirectsUrlSchema from "../../domain/schema/redircetsUrl.schema";
import { storeRedircetsUrlModel,getRediretsUrlListModel, redirectDetail } from "../../domain/models/redirectsUrl.model";
import { upload } from "../../services/upload.service";
import {storeUserActionActivity} from "../../services/userActionActivity.service";
import * as XLSX from "xlsx";

export const storeRedirectsUrl = async (req: Request, res: Response) => {
    try {
      
        const categories = await storeRedircetsUrlModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
             storeUserActionActivity(req.user.userId, "RedircetUrl", "Create", `Added new Redirect urls`);
            return successResponse(res, "Category Stored in Database successfully", result);
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteAllRedirects = async (req: Request, res: Response) => {
    try {
        const result = await RedirectsUrlSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Redirects found to delete.");
        }

        storeUserActionActivity(req.user.userId, "RedircetUrl", "Delete", `Delete All Redircets url!`);

        return successResponse(res, `Successfully deleted all Redirects.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Redirects.");
    }
};
export const getRedircetsUrlList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await getRediretsUrlListModel(search as string, pageNum, limitNum);
        return successResponse(res, "get country list successfully", categories);
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const redirectDetails = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        redirectDetail(id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Blog details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};

export const deleteRedirectUrl = async (req:Request,res:Response) => {
    try {
        const { type, url_ids } = req.body;

        if (type == 1) {
            if (!url_ids || !Array.isArray(url_ids) || url_ids.length === 0) {
                return ErrorResponse(res, "Please provide at least one valid Url ID.");
            }

            const result = await RedirectsUrlSchema.deleteMany({ _id: { $in: url_ids } });

            if (result.deletedCount === 0) {
                return ErrorResponse(res, "No Data found with the provided IDs.");
            }
            storeUserActionActivity(req.user.userId, "RedircetUrl", "Delete", `Delete sme redirects urls!`);

            return successResponse(res, `${result.deletedCount} Data(es) deleted successfully.`,[]);
        } else {
            const result = await RedirectsUrlSchema.deleteMany({});

            if (result.deletedCount === 0) {
                return ErrorResponse(res, "No Data records found to delete.");
            }
            storeUserActionActivity(req.user.userId, "RedircetUrl", "Delete", `Delete All Redircets url!`);
            return successResponse(res, `All ${result.deletedCount} Data deleted successfully.`,[]);
        }
    } catch (error) {
        console.error("Error deleting Data:", error);
        return ErrorResponse(res, "An error occurred while deleting Data    .");
    }
}

export const getUrlExcelFormet = async (req: Request, res: Response) => {
    try {
        // Use .lean() for faster DB performance
        const data = await RedirectsUrlSchema.find({}, {
            from_url: 1,
            to_url: 1,
            _id: 0
        }).lean();

        // No need for optional chaining if using .lean()
        const formattedData = data.map(item => ({
            from_url: item.from_url,
            to_url: item.to_url,
        }));

        // Create worksheet and workbook
        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ["from_url", "to_url"],
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Generate Excel buffer
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

        // Set headers and return buffer
        res.setHeader("Content-Disposition", "attachment; filename=RedirectUrl.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);

    } catch (error: any) {
        console.error("Error creating excel file:", error);
        return ErrorResponse(res, "An error occurred while creating excel file.");
    }
};

export const getRedirectUrlExport = async (req: Request, res: Response) => {
    try {
        const data = await RedirectsUrlSchema.find({});

        if (!data || data.length === 0) {
            return ErrorResponse(res, "No redirect URLs found.");
        }

        const formattedData = data.map(item => ({
            from_url: item.from_url,
            to_url: item.to_url,
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ["from_url", "to_url"], 
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

        res.setHeader("Content-Disposition", "attachment; filename=RedirectUrlData.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);

    } catch (error) {
        console.error("Error creating excel file:", error);
        return ErrorResponse(res, "An error occurred while creating the Excel file.");
    }
};

export const redirectUrlImport = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            return ErrorResponse(res, "The Excel file is empty or contains invalid data.");
        }

        const formattedData = data.map((item: any) => ({
            from_url: item.from_url,
            to_url: item.to_url,
        }));

        const totalRecords = formattedData.length;
        const avgTimePerRecord = 0.01; // seconds per row
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        // Respond immediately to user
        res.status(200).json({
            message: `Your file with ${totalRecords} redirect URLs is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        // Background processing
        setTimeout(async () => {
            try {
                const uniqueData = [];

                for (let i = 0; i < formattedData.length; i++) {
                    const { from_url, to_url } = formattedData[i];
                    const existingRecord = await RedirectsUrlSchema.findOne({ from_url, to_url });

                    if (!existingRecord) {
                        uniqueData.push({ from_url, to_url });
                    }
                }

                if (uniqueData.length > 0) {
                    await RedirectsUrlSchema.insertMany(uniqueData);
                    storeUserActionActivity(req.user.userId, "RedircetUrl", "Delete", `Redircet import succesfully!`);
                    console.log(`Imported ${uniqueData.length} new redirect URLs`);
                } else {
                    console.log("No new unique redirect URLs to import.");
                }
            } catch (err: any) {
                console.error("Background redirect import error:", err.message);
            }
        }, 100);

    } catch (error: any) {
        console.error("Error importing excel file:", error);
        return ErrorResponse(res, "An error occurred while importing the Excel file.");
    }
};


