import e, { Request, Response } from "express";
import { successResponse,ErrorResponse } from "../../helper/apiResponse";
import IpAddress from "../../domain/schema/ipAddress.schema";
import { StoreIpAddressModel,listIpAddressModel } from "../../domain/models/ipAddress.model";

export const storeIpAddress = async (req: Request, res: Response) => {
    try {
      
        const categories = await StoreIpAddressModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Ip Address Stored in Database successfully", result);
        });
        
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteAllIp = async (req: Request, res: Response) => {
    try {
        const result = await IpAddress.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No IpAddress found to delete.");
        }

        return successResponse(res, `Successfully deleted all IpAddress.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all IpAddress.");
    }
};


export const listIpAddress = async (req: Request, res: Response) => {
   try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await listIpAddressModel(search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteIpAddress = async (req: Request, res: Response) => {
    try {
        const { type, ip_address_id } = req.body;

        if (type == 1) {
            if (!ip_address_id || !Array.isArray(ip_address_id) || ip_address_id.length === 0) {
                return ErrorResponse(res, "Please provide at least one valid Ip Address ID.");
            }

            const result = await IpAddress.deleteMany({ _id: { $in: ip_address_id } });

            if (result.deletedCount === 0) {
                return ErrorResponse(res, "No Ip Address found with the provided IDs.");
            }

            return successResponse(res, `${result.deletedCount} Ip Address(es) deleted successfully.`,[]);
        } else {
            const result = await IpAddress.deleteMany({});

            if (result.deletedCount === 0) {
                return ErrorResponse(res, "No Ip Address records found to delete.");
            }

            return successResponse(res, `All ${result.deletedCount} IP Addresses deleted successfully.`,[]);
        }
    } catch (error) {
        console.error("Error deleting IP Address:", error);
        return ErrorResponse(res, "An error occurred while deleting IP addresses.");
    }
};
