import e, { Request, Response } from "express";
import { successResponse,ErrorResponse } from "../../helper/apiResponse";
import KeywordSchema from "../../domain/schema/keywords.schema";
import { getKeywordsModel,importKeywordsDataModel,updateKeywordModel } from "../../domain/models/keywords.model";
import * as XLSX from "xlsx";

interface importListingData{
    words:string;
}

export const getKeywords = async (req: Request, res: Response) => {
   try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await getKeywordsModel(search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const exportKeywordExcel = async (req: Request, res: Response) => {
    try {
        const keywords = await KeywordSchema.find();
        var i = 0
        const keywordsData = keywords.map((keyword,index) => ({
            Keyword: keyword?.words,
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(keywordsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Keywords");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        res.setHeader("Content-Disposition", "attachment; filename=keywords.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);
    } catch (error: any) {
        return res.status(500).json({ message: "Error exporting countries", error: error.message });
    }
};

export const importKeyword = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const data: importListingData[] = rawData.map((item) => ({
            words: String(item["Keyword"] || ""),
            
        }));

        const categories = await importKeywordsDataModel(data, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Listuing stored in Database successfully", result);
        });

    } catch (error: any) {
        return res.status(500).json({ message: "Error importing categories", error: error.message });
    }
};

export const deleteAllKeywords = async (req: Request, res: Response) => {
    try {
        const result = await KeywordSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Keywords found to delete.");
        }

        return successResponse(res, `Successfully deleted all Keywords.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Keywords.");
    }
};

export const deleteKeywords = async (req: Request, res: Response) => {
    try {
        const { keyword_ids } = req.body;

        if (!keyword_ids || !Array.isArray(keyword_ids) || keyword_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Ip Address ID.");
        }

        const result = await KeywordSchema.deleteMany({ _id: { $in: keyword_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Ip Address found with the provided IDs.");
        }

        return successResponse(res, `${result.deletedCount} Keywords deleted successfully.`,[]);
      
    } catch (error) {
        console.error("Error deleting IP Address:", error);
        return ErrorResponse(res, "An error occurred while deleting IP addresses.");
    }
};

export const updateKeywords = async (req: Request, res: Response) => {
    try {

        const countries = await updateKeywordModel(req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Country Stored in Database successfully", result);
        });
        
    } catch (error) {
        console.log(error);
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}






