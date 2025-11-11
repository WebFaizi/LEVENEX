import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import countrySchema from "../../domain/schema/country.schema";
import stateSchema from "../../domain/schema/state.schema";
import citySchema from "../../domain/schema/city.schema";
import areaSchema from "../../domain/schema/area.schema";
import {getAdminCounrtyList,storeCountryModel,updateCountryModel,getAdminStateListModel,storeStateModel,updateStateModel,getAdminCityListModel,cityStoreModel,cityUpdateModel,storeAreaModel,getAdminAreaListModel,updateAreaModel,adminCityAction,getAdminTopCityListModel, areaDetail, cityDetail, stateDetail, countryDetail} from "../../domain/models/country.model";
import { upload } from "../../services/upload.service";
import * as XLSX from "xlsx";
import mongoose from "mongoose";

//get country list


export const deleteAllCountry = async (req: Request, res: Response) => {
    try {
        const result = await countrySchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Country found to delete.");
        }

        return successResponse(res, `Successfully deleted all Country .`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Country .");
    }
};

export const deleteAllState = async (req: Request, res: Response) => {
    try {
        const result = await stateSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Country found to delete.");
        }

        return successResponse(res, `Successfully deleted all Country .`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Country .");
    }
};

export const deleteAllCity = async (req: Request, res: Response) => {
    try {
        const result = await citySchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No City found to delete.");
        }

        return successResponse(res, `Successfully deleted all City .`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all City .");
    }
};

export const deleteAllArea = async (req: Request, res: Response) => {
    try {
        const result = await areaSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Area found to delete.");
        }

        return successResponse(res, `Successfully deleted all Area .`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Area .");
    }
};



export const getFormCountry = async (req: Request, res: Response) => {
    try {
        const countries = await countrySchema.find({});

        return successResponse(res, "Get country list successfully", countries);
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}


export const getTopCity = async (req: Request, res: Response) => {    
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const states = await getAdminTopCityListModel(search as string, pageNum, limitNum);
        return successResponse(res, "get state list successfully", states);
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const cityAction = async (req: Request, res: Response) => {
    try {
        const { city_id } = req.params;
        const city_ation = await adminCityAction(city_id, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Category Stored in Database successfully", result);
        });
        
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}


export const getFormState = async (req: Request, res: Response) => {
    try {
        const { country_id } = req.query;                 
        let states;
        if (country_id) {
            states = await stateSchema.find({ country_id: country_id });
        } else {
            states = await stateSchema.find();
        }
        //const states = await stateSchema.find({ country_id: country_id });

        if (states.length === 0) {
            return successResponse(res, "No states found for the given country.", []);
        }

        return successResponse(res, "Get states list successfully", states);
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getFormCity = async (req: Request, res: Response) => {
    try {
        const { state_id } = req.query;

        let cities;
        if (state_id) {
            cities = await citySchema.find({ state_id: state_id });
        } else {
            cities = await citySchema.find();
        }        
        if (cities.length === 0) {
            return successResponse(res, "No cities found.", []);
        }

        return successResponse(res, "Get cities list successfully", cities);

    } catch (error) {
        console.error("Error fetching cities:", error);
        return ErrorResponse(res, "An error occurred while fetching cities.");
    }
}

export const getFormArea = async (req: Request, res: Response) => {
    try {
        let { city_id, state_id } = req.query;

        let cityIds: string[] = [];

        if (state_id) {
            //const stateObjectId = new mongoose.Types.ObjectId(state_id as string);

            const cities = await citySchema.find({ state_id: state_id }).lean();
            cityIds = cities.map(city => city.unique_id.toString());  // <-- fix: no `const` here
        } else if (city_id) {
            if (!Array.isArray(city_id)) {
                city_id = [city_id];
            }
            cityIds = city_id as string[];
        } else {
            return ErrorResponse(res, "Either city_id or state_id is required.");
        }

        const areas = await areaSchema.find({ city_id: { $in: cityIds } });

        if (areas.length === 0) {
            return successResponse(res, "No area found for the given input.", []);
        }

        return successResponse(res, "Area list fetched successfully.", areas);
    } catch (error) {
        console.error("Error fetching areas:", error);
        return ErrorResponse(res, "An error occurred while fetching areas.");
    }
};

//country module
export const getAdminCountryList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await getAdminCounrtyList(search as string, pageNum, limitNum);
        return successResponse(res, "get country list successfully", categories);
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeCountry = async (req: Request, res: Response) => {
    try {
      
        const countries = await storeCountryModel(req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Country Stored in Database successfully", result);
        });
        
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateCountry = async (req: Request, res: Response) => {
    try {

        const { country_id } = req.params; 

        const countries = await updateCountryModel(country_id,req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Country update in Database successfully", result);
        });
        
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteCountry = async (req:Request,res:Response) => {
    try{
        const { country_ids } = req.body; 

        if (!country_ids || !Array.isArray(country_ids) || country_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid country ID.");
        }

        const result = await countrySchema.deleteMany({ _id: { $in: country_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No country found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  Countries list.`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user delete countries.');
    }
}

export const exportCountryToExcel = async (req: Request, res: Response) => {
    try {
        const countries = await countrySchema.find({}, { _id:1, unique_id: 1, name: 1 }).sort({ sortingOrder: -1, createdAt: -1 });

        const countryData = countries.map((country, index) => ({
            // ID: index + 1,
            ID: country.unique_id,
            Name: country.name,
        }));

        const worksheet = XLSX.utils.json_to_sheet(countryData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Countries");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });

        res.setHeader("Content-Disposition", "attachment; filename=countries.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return res.send(excelBuffer);
    } catch (error: any) {
        console.error("Export Error:", error);
        return res.status(500).json({
            message: "Error exporting countries",
            error: error.message,
        });
    }
};

export const importCountriesFromExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        // Send response to user so they can continue using the app
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });

        // Background process
        setTimeout(async () => {
            try {
                const existingCountries = await countrySchema.find({}, { unique_id: 1 });
                const usedIds = new Set<number>();
                existingCountries.forEach((c) => usedIds.add(c.unique_id));

                const bulkOps = new Map<string, any>();

                for (const row of data) {
                    let { Name, ID } = row as any;
                    if (!Name || typeof Name !== "string") continue;

                    const normalizedName = Name.trim();
                    const numericId = Number(ID);

                    // ❌ Skip if ID is missing, invalid, or already used
                    if (!numericId || isNaN(numericId) || usedIds.has(numericId)) continue;

                    usedIds.add(numericId);

                    if (!bulkOps.has(normalizedName)) {
                        bulkOps.set(normalizedName, {
                            updateOne: {
                                filter: { unique_id: numericId },
                                update: {
                                    $set: {
                                        name: normalizedName,
                                        status: 1,
                                    },
                                    $setOnInsert: {
                                        unique_id: numericId,
                                    },
                                },
                                upsert: true,
                            },
                        });
                    }
                }

                const opsArray = Array.from(bulkOps.values());

                if (opsArray.length > 0) {
                    await countrySchema.bulkWrite(opsArray);
                }

                console.log("Countries import completed.");
            } catch (err) {
                console.error("Background Country Import Error:", err);
            }

        }, 100);

    } catch (error: any) {
        console.error("Import Error:", error);
        return res.status(500).json({ message: "Error importing countries", error: error.message });
    }
};

export const countryDetails = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        countryDetail(id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Country details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};

//state module
export const getAdminStateList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const states = await getAdminStateListModel(search as string, pageNum, limitNum);
        return successResponse(res, "get state list successfully", states);
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeState = async (req: Request, res: Response) => {
    try {
      
        const countries = await storeStateModel(req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "State Stored in Database successfully", result);
        });
        
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateState = async (req: Request, res: Response) => {
    try {

        const { state_id } = req.params; 

        const states = await updateStateModel(state_id,req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "State update successfully", result);
        });
        
    } catch (error) {
        return ErrorResponse(res,'An error occurred during State update.');
    }
}

export const deleteState = async (req:Request,res:Response) => {
    try{
        const { state_ids } = req.body; 

        if (!state_ids || !Array.isArray(state_ids) || state_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid country ID.");
        }

        const result = await stateSchema.deleteMany({ _id: { $in: state_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No country found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  states(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const exportStateToExcel = async (req: Request, res: Response) => {
    try {
        // Step 1: Fetch all states
        const states = await stateSchema.find().sort({ sortingOrder: -1, createdAt: -1 });

        // Step 2: Fetch all countries and create a map
        const countries = await countrySchema.find({}, { _id: 1, name: 1, unique_id: 1 });
        const countryMap = new Map<string, string>();
        countries.forEach((c) => {
            countryMap.set(c.unique_id.toString(), c.name);
        });

        // Step 3: Build Excel data
        const stateData = states.map((state, index) => ({
            //ID: index + 1,
            ID: state.unique_id,
            Country: countryMap.get(state.country_id.toString()) || "N/A",
            Name: state.name,
        }));

        // Step 4: Generate workbook
        const worksheet = XLSX.utils.json_to_sheet(stateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "States");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });

        res.setHeader("Content-Disposition", "attachment; filename=states.xlsx");
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(excelBuffer);
    } catch (error: any) {
        console.error("Export Error:", error);
        return res.status(500).json({
            message: "Error exporting states",
            error: error.message,
        });
    }
};

export const importStatesFromExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        // Send response immediately to allow background processing
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });

        // Background Import Logic
        setTimeout(async () => {
            try {
                const countries = await countrySchema.find({}, { _id: 1, name: 1, unique_id: 1 });
                const countryMap = new Map<string, string>();
                countries.forEach((c) => {
                    countryMap.set(c.name.trim().toLowerCase(), c.unique_id.toString());
                });

                const stateOpsMap = new Map<string, any>();
                const batchSize = 1000;
                let processed = 0;

                while (processed < totalRecords) {
                    const batch = data.slice(processed, processed + batchSize);

                    for (const row of batch) {
                        const { Name, Country, ID } = row as any;
                        if (!Name || !Country || !ID) continue;

                        const stateName = Name.trim();
                        const countryName = Country.trim().toLowerCase();
                        const uniqueId = Number(ID);
                        if (!uniqueId || isNaN(uniqueId)) continue;

                        const countryId = countryMap.get(countryName);
                        if (!countryId) {
                            console.log(`Skipping state "${stateName}" - Country not found: "${countryName}"`);
                            continue;
                        }

                        const uniqueKey = `${stateName.toLowerCase()}_${countryId}`;
                        if (!stateOpsMap.has(uniqueKey)) {
                            stateOpsMap.set(uniqueKey, {
                                updateOne: {
                                    filter: { name: stateName, country_id: countryId },
                                    update: {
                                        $set: { name: stateName, country_id: countryId },
                                        $setOnInsert: { unique_id: uniqueId },
                                    },
                                    upsert: true,
                                },
                            });
                        }
                    }

                    processed += batchSize;
                    console.log(`Processed ${processed} of ${totalRecords} state records...`);
                }

                const stateOps = Array.from(stateOpsMap.values());
                if (stateOps.length > 0) {
                    await stateSchema.bulkWrite(stateOps);
                }

                console.log("✅ State import finished.");
            } catch (err) {
                console.error("❌ State Import Error:", err);
            }

        }, 100);

    } catch (error: any) {
        console.error("State Import Error:", error);
        return res.status(500).json({ message: "Error importing states", error: error.message });
    }
};

export const stateDetails = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        stateDetail(id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "State details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching state details.");
    }
};


//city module

export const getAdminCityList = async (req: Request, res: Response) => {    
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const states = await getAdminCityListModel(search as string, pageNum, limitNum);
        return successResponse(res, "get city list successfully", states);
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}
export const cityDetails = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        cityDetail(id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "City details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching state details.");
    }
};
export const storeCity = async (req: Request, res: Response) => {
    try {
      
        const countries = await cityStoreModel(req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "City Stored in Database successfully", result);
        });
        
    } catch (error) {
        console.log("errorerror",error)
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateCity = async (req: Request, res: Response) => {
    try {

        const { city_id } = req.params; 

        const states = await cityUpdateModel(city_id,req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "City Updated successfully", result);
        });
        
    } catch (error) {
        return ErrorResponse(res,'An error occurred during Update city.');
    }
}

export const deleteCity = async (req:Request,res:Response) => {
    try{
        const { city_ids } = req.body; 

        if (!city_ids || !Array.isArray(city_ids) || city_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid city ID.");
        }   
        console.log("city_idscity_idscity_ids",city_ids)
        const result = await citySchema.deleteMany({ _id: { $in: city_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No city found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  city(ies).`,result.deletedCount);  

    }catch (error){
        return ErrorResponse(res,'An error occurred during deleted  city.');
    }       
}

export const exportCityToExcel = async (req: Request, res: Response) => {
    try {
        // Step 1: Fetch all cities
        const cities = await citySchema.find().sort({ sortingOrder: -1, createdAt: -1 });

        // Step 2: Fetch all states once and create a map
        const states = await stateSchema.find({}, { _id: 1, name: 1, unique_id: 1 });
        const stateMap = new Map<string, string>();
        states.forEach(state => {
            stateMap.set(state.unique_id.toString(), state.name);
        });

        // Step 3: Build export data
        const cityData = cities.map((city, index) => ({
            //ID: index + 1,
            ID: city.unique_id,
            State: stateMap.get(city.state_id.toString()) || "N/A",
            Name: city.name,
        }));

        // Step 4: Create Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(cityData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cities");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });

        // Step 5: Send the file as response
        res.setHeader("Content-Disposition", "attachment; filename=cities.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);

    } catch (error: any) {
        console.error("Export Error:", error);
        return res.status(500).json({ message: "Error exporting cities", error: error.message });
    }
};

export const importCityFromExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Step 1: Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const totalRecords = data.length;

        // Step 2: Estimate time
        const avgTimePerRecord = 0.01; // seconds per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const checkAfterSeconds = estimatedSeconds + 5;
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = Math.ceil(checkAfterSeconds / 60);

        // Step 3: Send response immediately
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });

        // Step 4: Run import in background
        setTimeout(async () => {
            try {
                const states = await stateSchema.find({}, { _id: 1, name: 1, unique_id: 1 });
                const stateMap = new Map<string, string>();
                states.forEach((s) => stateMap.set(s.name.trim().toLowerCase(), s.unique_id.toString()));

                const batchSize = 1000;
                let processed = 0;

                while (processed < totalRecords) {
                    const batch = data.slice(processed, processed + batchSize);
                    const bulkOps: any[] = [];

                    for (let row of batch) {
                        const { Name, State, ID } = row as any;
                        if (!Name || !State || !ID) continue;

                        const stateId = stateMap.get(State.trim().toLowerCase());
                        const uniqueId = Number(ID);
                        if (!stateId || !uniqueId || isNaN(uniqueId)) continue;

                        bulkOps.push({
                            updateOne: {
                                filter: { name: Name.trim(), state_id: stateId },
                                update: {
                                    $set: { name: Name.trim(), state_id: stateId },
                                    $setOnInsert: { unique_id: uniqueId },
                                },
                                upsert: true,
                            },
                        });
                    }

                    if (bulkOps.length > 0) {
                        await citySchema.bulkWrite(bulkOps);
                    }

                    processed += batchSize;
                    console.log(`Processed ${processed} of ${totalRecords} city records...`);
                }

                console.log("✅ City import finished.");
            } catch (err) {
                console.error("❌ City Import Error:", err);
            }


        }, 100);

    } catch (error: any) {
        console.error("Import Error:", error);
        return res.status(500).json({ message: "Error importing cities", error: error.message });
    }
};


//area module

export const getAdminAreaList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const states = await getAdminAreaListModel(search as string, pageNum, limitNum);
        return successResponse(res, "get area list successfully", states);
    } catch (error) {
       return  ErrorResponse(res,'An error occurred during user registration.');
    }
}
export const areaDetails = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        areaDetail(id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Area details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching state details.");
    }
};
export const storeArea = async (req: Request, res: Response) => {
    try {
      
        const countries = await storeAreaModel(req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Area Stored in Database successfully", result);
        });
        
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateArea = async (req: Request, res: Response) => {
    try {

        const { area_id } = req.params; 

        const states = await updateAreaModel(area_id,req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Area Updated in Database successfully", result);
        });
        
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteArea = async (req:Request,res:Response) => {
    try{
        const { area_ids } = req.body; 

        if (!area_ids || !Array.isArray(area_ids) || area_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid city ID.");
        }   
        const result = await areaSchema.deleteMany({ _id: { $in: area_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No city found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  city(ies).`,result.deletedCount);  

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }       
}

export const exportAreaToExcel = async (req: Request, res: Response) => {
    try {
        // Step 1: Fetch all areas
        const areas = await areaSchema.find().sort({ sortingOrder: -1, createdAt: -1 });

        // Step 2: Get all city_ids used in areas
        const cityIds = [...new Set(areas.map(a => a.city_id.toString()))];        
        // Step 3: Fetch all related cities at once
        const cities = await citySchema.find({ unique_id: { $in: cityIds } }, { _id: 1, name: 1, unique_id: 1 });
        const cityMap = new Map<string, string>();
        cities.forEach(city => cityMap.set(city.unique_id.toString(), city.name));

        // Step 4: Prepare data for Excel
        const areaData = areas.map((area, index) => ({
            //ID: index + 1,
            ID: area.unique_id,
            City: cityMap.get(area.city_id.toString()) || "N/A",
            Name: area.name,
        }));

        // Step 5: Create Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(areaData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Areas");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        // Step 6: Send response
        res.setHeader("Content-Disposition", "attachment; filename=areas.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);

    } catch (error: any) {
        console.error("Export Error:", error);
        return res.status(500).json({ message: "Error exporting areas", error: error.message });
    }
};

export const importAreaFromExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const recordCount = data.length;
        const avgTimePerRecord = 0.01; // in seconds
        const estimatedSeconds = Math.ceil(recordCount * avgTimePerRecord);
        const checkAfterSeconds = estimatedSeconds + 5;

        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = Math.ceil(checkAfterSeconds / 60);

        // Respond immediately to user
        res.status(200).json({
            message: `Your file with ${recordCount} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });

        // Background import
        setTimeout(async () => {
            try {
                const uniqueCityNames = [...new Set(data.map((row: any) => row.City).filter(Boolean))];
                const cities = await citySchema.find({ name: { $in: uniqueCityNames } });
                const cityMap = new Map<string, string>();
                cities.forEach(city => cityMap.set(city.name.trim().toLowerCase(), city.unique_id.toString()));

                const batchSize = 1000;
                let processed = 0;

                while (processed < data.length) {
                    const batch = data.slice(processed, processed + batchSize);
                    const bulkOps = [];

                    for (let row of batch) {
                        const { Name, City, ID } = row as any;
                        if (!Name || !City || !ID) continue;

                        const cityId = cityMap.get(City.trim().toLowerCase());
                        const uniqueId = Number(ID);
                        if (!cityId || !uniqueId || isNaN(uniqueId)) continue;

                        bulkOps.push({
                            updateOne: {
                                filter: { name: Name.trim(), city_id: cityId },
                                update: {
                                    $set: { name: Name.trim(), city_id: cityId },
                                    $setOnInsert: { unique_id: uniqueId },
                                },
                                upsert: true,
                            },
                        });
                    }

                    if (bulkOps.length > 0) {
                        await areaSchema.bulkWrite(bulkOps);
                    }

                    processed += batchSize;
                    console.log(`Processed ${processed} of ${data.length} area records...`);
                }

                console.log("✅ Area import finished.");
            } catch (err) {
                console.error("❌ Area Import Error:", err);
            }

        }, 100);

    } catch (error: any) {
        console.error('Import Error:', error);
        return res.status(500).json({ message: 'Error importing areas', error: error.message });
    }
};

export const searchCityOrArea = async (req: Request, res: Response) => {
    try {
      const { location } = req.query; 
  
    //   if (!location) {
    //     return res.status(400).json({ error: "Search query is required" });
    //   }
  
      const cityResult = await citySchema.aggregate([
        {
          $match: { name: { $regex: location, $options: "i" } }, 
        },
        {
          $lookup: {
            from: "states",
            localField: "state_id",
            foreignField: "unique_id",
            as: "state",
          },
        },
        { $unwind: "$state" },
        {
          $project: {
            type: "city",
            city: "$name",
            state: "$state.name",
          },
        },{$limit : 15}        
      ]);
  
      const areaResult = await areaSchema.aggregate([
        {
          $match: { name: { $regex: location, $options: "i" } }, 
        },
        {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "unique_id",
            as: "city",
          },
        },
        { $unwind: "$city" },
        {
          $lookup: {
            from: "states",
            localField: "city.state_id",
            foreignField: "unique_id",
            as: "state",
          },
        },
        { $unwind: "$state" },
        {
          $project: {
            type: "area",
            area: "$name",
            city: "$city.name",
            state: "$state.name",
          },
        },
        {$limit : 15}
      ]);
  
      const results = [...cityResult, ...areaResult];      
      if (results.length === 0) {
        return res.status(404).json({ message: "No results found" });
      }    
      res.status(200).json({ results });
    } catch (error) {
      console.error("Search API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };












