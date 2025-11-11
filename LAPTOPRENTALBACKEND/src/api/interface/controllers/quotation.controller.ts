import e, { Request, Response } from "express";
import Types from "mongoose";
import * as XLSX from "xlsx";
import Quotation from "../../domain/schema/quotation.schema";
import ListingSchema from "../../domain/schema/listing.schema";
import subscribersSchema from "../../domain/schema/subscribers.schema";
import marketingSchema from "../../domain/schema/marketingBanner.schema";
import {getMarketingBannerDetail } from "../../domain/models/marketingBanner.model";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import { EmailService } from "../../services/sendEmail.service";
import { storeQuotationModel,quotationList,updateQuotationModel,quotationListExport,subscriberList } from "../../domain/models/quotation.model";
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export const sendMailSubscribers = async (req: Request, res: Response) => {
    try {
        const subscribers = await subscribersSchema.find({});
        if (!subscribers || subscribers.length === 0) {
            return ErrorResponse(res, "No subscribers found.");
        }

        getMarketingBannerDetail(req.user, async (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            const listings = await ListingSchema.find({
                _id: { $in: result.marketing_banner.marketingbanner_listing_id }
            }).lean();

            const listingsHtml = listings.map((listing) => `
             
                <tr>
                    <td width="80" style="padding-right:15px;">
                        <img src="${listing.listing_image ? `${process.env.BASE_URL}/${listing.listing_image}` : 'https://via.placeholder.com/80'}" alt="User Image" style="width:80px; height:80px; border-radius:50%; border:1px solid #ccc;" />
                    </td>
                    <td style="vertical-align:top;">
                        <div style="font-size:16px; font-weight:bold; color:#333;">${listing.name || 'Unnamed Listing'}</div>
                        <div style="font-size:14px; color:#666;">${listing.address || 'Member'}</div>
                    </td>
                </tr>
            `).join("");
            console.log("result.marketing_banner.marketingbanner_image",result.marketing_banner.marketingbanner_image)
            const html = `
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; font-family:Arial, sans-serif; border:1px solid #ddd; border-radius:8px;">
                    <tr>
                        <td style="background-color:#f4f4f4; padding:20px; text-align:center; font-size:22px; font-weight:bold; border-bottom:1px solid #ddd;">
                            📢 Latest Marketing Update
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center; padding:16px;">
                            <img src="${result.marketing_banner.marketingbanner_image}" alt="Marketing Banner" style="max-width:100%; border-radius:6px;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px; font-size:16px; color:#333;">
                            <div style="line-height:1.6;">
                                ${result.marketing_banner.marketingbanner_description}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f9f9f9; padding:16px; text-align:center; font-size:12px; color:#777; border-top:1px solid #ddd;">
                            You are receiving this email because you subscribed to our updates.
                        </td>
                    </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; font-family:Arial, sans-serif; border:1px solid #ddd; border-radius:8px;">
                    <tr>
                        <td style="background-color:#f4f4f4; padding:20px; text-align:center; font-size:20px; font-weight:bold;">
                            Listings
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px; border-bottom:1px solid #eee;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial, sans-serif;">
                                ${listingsHtml}
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f9f9f9; padding:12px; text-align:center; font-size:12px; color:#888; border-top:1px solid #ddd;">
                            You received this listing update because you're subscribed to our service.
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center; padding:20px;">
                            <a href="${process.env.BASE_URL_TWO}/unsubscribe/bhavin@freshcodes.in " 
                            style="display:inline-block; padding:10px 20px; background-color:#d9534f; color:#fff; text-decoration:none; border-radius:4px; font-size:14px;">
                            Unsubscribe
                            </a>
                            <div style="margin-top:10px; font-size:12px; color:#888;">
                            Click here if you no longer want to receive these updates.
                            </div>
                        </td>
                        </tr>
                </table>
            `;

            console.log(html)

            for (const subscriber of subscribers) {
                const email = subscriber.email;
                 if (isValidEmail(email)) {
                await EmailService.sendEmail(email, "Latest Marketing Update", html);
                 }
            }

            return successResponse(res, "Marketing emails sent successfully", subscribers.length);
        });

    } catch (error: any) {
        console.error("Error sending marketing emails:", error);
        res.status(500).json({ message: "Error sending marketing emails", error: error.message });
    }
};


export const ExportSubscribers = async (req: Request, res: Response) => {
    try {
        const exportLimit = Number(1000) || 10000;

        const listings = await subscribersSchema.find({}, {
            name: 1,
            email: 1,
        })
            .sort({ sortingOrder: -1 })
            .limit(exportLimit)
            .lean();

        // Format data
        const listingsData = listings.length > 0
            ? listings.map((listing) => ({
                name: listing?.name || "N/A",
                email: listing?.email || "N/A",
            }))
            : [{ name: "", email: "" }]; // 👈 Adds just header row if empty

        // Create Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(listingsData, { header: ["name", "email"] });
        XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        // Set headers
        res.setHeader("Content-Disposition", "attachment; filename=subscribers.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);

    } catch (error: any) {
        console.error("Error exporting listings:", error);
        res.status(500).json({ message: "Error exporting listings", error: error.message });
    }
};

export const ImportSubscribers = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Parse Excel data
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.015; // seconds per row
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        // Immediate response to user
        res.status(200).json({
            message: `Your file with ${totalRecords} job categories is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        // Background import process
        setTimeout(async () => {
            try {
                for (const row of data) {
                    const { name, email } = row as any;

                    const existingCategory = await subscribersSchema.findOne({ email: email });

                    if (existingCategory) {
                       
                    } else {
                        await subscribersSchema.create({
                            name: name,
                            email: email,
                        });
                    }
                }

                console.log(`Subscribers Import Done. Total records: ${totalRecords}`);
            } catch (err: any) {
                console.error("Background job category import error:", err.message);
            }
        }, 100);

    } catch (error: any) {
        return res.status(500).json({ message: "Error importing job categories", error: error.message });
    }
};

export const getSubscriberList = async (req: Request, res: Response) => {    
    try {
      
        const { search = '', page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const users = await subscriberList(search as string, pageNum, limitNum);

        return successResponse(res, "get subscribers list successfully", users);

    } catch (error) {
        console.log(error)
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getSubscribersExcelFormet = async (req: Request, res: Response) => {
    try {
        // Use .lean() for faster DB performance
        const data = await subscribersSchema.find({}, {
            name: 1,
            email: 1,
            _id: 0
        }).lean();

        // No need for optional chaining if using .lean()
        const formattedData = data.map(item => ({
            name: item.name,
            email: item.email,
        }));

        // Create worksheet and workbook
        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ["name", "email"],
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Generate Excel buffer
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

        // Set headers and return buffer
        res.setHeader("Content-Disposition", "attachment; filename=Subscribers.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);

    } catch (error: any) {
        console.error("Error creating excel file:", error);
        return ErrorResponse(res, "An error occurred while creating excel file.");
    }
};

export const storeQuotation = async (req: Request, res: Response) => {
    try {
      
        const categories = await storeQuotationModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Thank you! Your quotation has been successfully recorded.", result);
        });
        
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const addQoutation = async (req: Request, res: Response) => {
    try {
      
        const categories = await storeQuotationModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Quotation Stored in Database successfully", result);
        });
        
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateQuotationStatus = async (req: Request, res: Response) => {
    try {
      
        const categories = await updateQuotationModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Category Stored in Database successfully", result);
        });
        
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getQuotationList = async (req: Request, res: Response) => {    
    try {
      
        const { search = '', page = 1, limit = 10,quotation_list_type = 0,start_date,end_date } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

         if (start_date && end_date) {
            const startDate = new Date(start_date as string);
            const endDate = new Date(end_date as string);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return ErrorResponse(res, "Invalid start date or end date.");
            }

            if (endDate < startDate) {
                return ErrorResponse(res, "End date cannot be earlier than start date.");
            }
        }

        const users = await quotationList(search as string, pageNum, limitNum,quotation_list_type as number,start_date as string, end_date as string);

        return successResponse(res, "get admin User list successfully", users);

    } catch (error) {
        console.log(error)
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteQuotation = async (req:Request,res:Response) => {
    try{
        const { quotation_ids } = req.body; 

        if (!quotation_ids || !Array.isArray(quotation_ids) || quotation_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Quotation ID.");
        }

        const result = await Quotation.deleteMany({ _id: { $in: quotation_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No quotation found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  Quotation(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteSubscribers = async (req:Request,res:Response) => {
    try{
        const { subscribe_id } = req.body; 

        if (!subscribe_id || !Array.isArray(subscribe_id) || subscribe_id.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Quotation ID.");
        }

        const result = await subscribersSchema.deleteMany({ _id: { $in: subscribe_id } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No quotation found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  Subscribers(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}



export const exportQuotationToExcel = async (req: Request, res: Response) => {
    try {
        const { search = '', start_date, end_date , quotation_list_type } = req.body;

        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return ErrorResponse(res, "Invalid start date or end date.");
            }

            // Ensure both dates are at midnight to compare only the day, or use full precision
            if (endDate.getTime() < startDate.getTime()) {
                return ErrorResponse(res, "End date cannot be earlier than start date.");
            }
        }

        const users = await quotationListExport(search as string, start_date as string, end_date as string,quotation_list_type as number);

        if (users.data.length === 0) {
            return ErrorResponse(res, "No quotations found with the provided search criteria.");
        }

        const data = users.data.map((quotation) => ({
            Name: quotation.name,
            Email: quotation.email,
            CategoryName: quotation.category_names,
            QuotationType: quotation.quotation_type,
            Quantity: quotation.quantity,
            'Phone Number': quotation.phone_number,
            Location: quotation.location,
            Message: quotation.message,
            Status: quotation.status,
            'View By Admin': quotation.view_by_admin,
            'Created At': quotation.createdAt,
            'Updated At': quotation.updatedAt,
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Quotations');

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('quotations.xlsx');

        return res.send(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));

    } catch (error) {
        console.error(error);
        return ErrorResponse(res, 'An error occurred during the quotation export process.');
    }
};





