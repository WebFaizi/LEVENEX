import { loggerMsg } from "../../lib/logger";
import countrySchema from "../schema/country.schema";
import stateSchema from "../schema/state.schema";
import citySchema from "../schema/city.schema";
import areaSchema from "../schema/area.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  multer from "multer";
import path  from "mongoose";
import mongoose from "mongoose";

interface countrySchema{
    name:string;
    slug:string;
    status:any;
    unique_id:number;
}

interface stateSchema{
    country_id:string,
    name:string;
    status:any;
    state_id?:string;
    unique_id:number;
}

interface citySchema{
    state_id:string,
    name:string;
    status:any;
    city_id?:string;
    unique_id:number;
}

interface areaSchema{
    city_id:string,
    name:string;
    status:any;
    area_id?:string;
    unique_id:number;
}



export const adminCityAction = async (city_id: string, callback: (error: any, result: any) => void) => {
    try {
        const city = await citySchema.findById(city_id);

        if (!city) {
            return callback({ message: 'City not found' }, null);
        }

        city.is_top_city = !city.is_top_city; // Toggle the value
        await city.save();

        return callback(null, `is_top_city set to ${city.is_top_city}`);
    } catch (error) {
        console.error('Error toggling is_top_city:', error);
        return callback(error, null);
    }
};

export const storeAreaModel = async (areaData:areaSchema,  callback: (error:any, result: any) => void) => {
    try {
        const existingState = await stateSchema.findOne({ name: areaData.name,city_id: areaData.city_id });
        
        if (existingState) {
            const error = new Error("City already exists.");
            return callback(error, null);
        }

        const lastCountry = await areaSchema.findOne().sort({ sorting: -1 });

        const newState = new areaSchema({ 
            ...areaData
        });
        
        await newState.save();

        return callback(null, newState);
    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const getAdminAreaListModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        // const users = await areaSchema.find(searchQuery)
        //     .sort({ createdAt: -1 })
        //     .skip(skip)
        //     .limit(limit) 
        //     .populate('city_id', 'name')
        //     .exec();

        const users = await areaSchema.aggregate([
            { $match: searchQuery },
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: 1 } },
            {
                $lookup: {
                from: 'cities',
                let: {
                    cityIdObjectId: '$city_id',
                    cityIdNumber: '$city_id'
                },
                pipeline: [
                    {
                    $match: {
                        $expr: {
                        $or: [
                            { $eq: ['$_id', '$$cityIdObjectId'] },  // for ObjectId
                            { $eq: ['$unique_id', '$$cityIdNumber'] } // for string "1" to match numeric unique_id
                        ]
                        }
                    }
                    },
                    {
                    $project: {
                        _id: 1,
                        name: 1,
                        unique_id: 1
                    }
                    }
                ],
                as: 'city_id'
                }
            },

            {
                $unwind: {
                path: '$city_id',
                preserveNullAndEmptyArrays: true
                }
            },

            ]);


        const totalCountry = await areaSchema.countDocuments(searchQuery);

        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    } catch (error) {        
        throw new Error('Error fetching users');
    }
}

export const updateAreaModel = async (area_id:any,areaData:areaSchema,  callback: (error:any, result: any) => void) => {
    try {

        const existingState = await areaSchema.findOne({ _id: area_id });

        if (!existingState) {
            return callback(new Error("State not found."), null);
        }

        const slugExist = await areaSchema.findOne({ name: areaData.name,city_id: areaData.city_id, _id: { $ne: area_id } });

        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        existingState.name = areaData.name || existingState.name;
        await existingState.save();
        return callback(null, existingState);

    } catch (error) {
        throw new Error('Error fetching users');
    }
};

//country mdoles
export const getAdminCounrtyList = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const users = await countrySchema.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit) 
            .exec();

        const totalCountry = await countrySchema.countDocuments(searchQuery);

        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const storeCountryModel = async (countryData:countrySchema,  callback: (error:any, result: any) => void) => {
    try {
        const existingCountry = await countrySchema.findOne({ name: countryData.name });
        
        if (existingCountry) {
            const error = new Error("Country already exists.");
            return callback(error, null);
        }

        const lastCountry = await countrySchema.findOne().sort({ sorting: -1 });

        const newCountry = new countrySchema({ 
            ...countryData
        });
        
        await newCountry.save();

        return callback(null, newCountry);
    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const updateCountryModel = async (country_id:any,countryData:countrySchema,  callback: (error:any, result: any) => void) => {
    try {

        const existingCountry = await countrySchema.findOne({ _id: country_id });

        if (!existingCountry) {
            return callback(new Error("Country not found."), null);
        }

        const slugExist = await countrySchema.findOne({name: countryData.name});

        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        existingCountry.name = countryData.name || existingCountry.name;
        await existingCountry.save();
        return callback(null, existingCountry);

    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const countryDetail = async (country_id:string, callback: (error: any, result: any) => void) => {
    try {
        
        const Country = await countrySchema.findOne({ _id: country_id });
        
        
        return callback(null, { Country });
    } catch (error) {
        console.error("Error Finding country:", error);
        return callback(error, null);
    }
};

export const getAdminStateListModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const users = await stateSchema.aggregate([
        { $match: searchQuery },
        {
            $lookup: {
            from: 'countries',
            let: {
                countryIdObjectId: '$country_id',
                countryIdNumber: '$country_id'
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $or: [
                        { $eq: ['$_id', '$$countryIdObjectId'] },  // for ObjectId
                        { $eq: ['$unique_id', '$$countryIdNumber'] } // for string "1" to match numeric unique_id
                    ]
                    }
                }
                },
                {
                $project: {
                    _id: 1,
                    name: 1,
                    unique_id: 1
                }
                }
            ],
            as: 'country_id'
            }
        },

        {
            $unwind: {
            path: '$country_id',
            preserveNullAndEmptyArrays: true
            }
        },

        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
        ]);


        const countResult = await stateSchema.aggregate([
        { $match: searchQuery },
        { $count: 'total' }
        ]);

        //const totalCountry: number = countResult[0]?.total ?? 0;
        const totalCountry = await stateSchema.countDocuments(searchQuery);

        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error('Error fetching users');
    }
};

//state mdoles
export const storeStateModel = async (stateData:stateSchema,  callback: (error:any, result: any) => void) => {
    try {
        const existingState = await stateSchema.findOne({ name: stateData.name,country_id: stateData.country_id });
        
        if (existingState) {
            const error = new Error("State already exists.");
            return callback(error, null);
        }

        const lastCountry = await stateSchema.findOne().sort({ sorting: -1 });

        const newState = new stateSchema({ 
            ...stateData
        });
        
        await newState.save();

        return callback(null, newState);
    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const updateStateModel = async (state_id:any,stateData:stateSchema,  callback: (error:any, result: any) => void) => {
    try {

        const existingState = await stateSchema.findOne({ _id: state_id });

        if (!existingState) {
            return callback(new Error("State not found."), null);
        }

        const slugExist = await stateSchema.findOne({ name: stateData.name,country_id: stateData.country_id, _id: { $ne: state_id } });

        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
        existingState.name = stateData.name || existingState.name;
        // existingState.country_id = stateData.country_id || existingState.country_id;
        await existingState.save();
        return callback(null, existingState);

    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const stateDetail = async (state_id:string, callback: (error: any, result: any) => void) => {
    try {        
        const state = await stateSchema.aggregate([
        {
            $match: {
            _id: new mongoose.Types.ObjectId(state_id)
            }
        },
        {
            $lookup: {
            from: 'countries',
            let: {
                cidObj: '$country_id',
                cidInt: '$country_id'
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $or: [
                        { $eq: ['$_id', '$$cidObj'] },
                        { $eq: ['$unique_id', '$$cidInt'] }
                    ]
                    }
                }
                },
                {
                $project: {
                    _id: 1,
                    name: 1,
                    unique_id: 1
                }
                }
            ],
            as: 'country_id'
            }
        },

        { $unwind: { path: '$country_id', preserveNullAndEmptyArrays: true } },

        {
            $project: {
            _country_id_int: 0
            }
        }
        ]);

        const State = state[0] || null;        
        return callback(null, { State });
    } catch (error) {
        console.error("Error Finding State:", error);
        return callback(error, null);
    }
};

//city mdoles

export const getAdminTopCityListModel = async (
    search: string,
    page: number,
    limit: number,
    isTopCityOnly: boolean = true // Optional filter
) => {
    try {
        const searchQuery: any = {};

        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        if (isTopCityOnly) {
            searchQuery.is_top_city = true;
        }

        const skip = (page - 1) * limit;

        // const users = await citySchema.find(searchQuery)
        //     .skip(skip)
        //     .limit(limit)
        //     .populate('state_id', 'name')
        //     .exec();
        const users = await citySchema.aggregate([
        { $match: searchQuery },

        {
            $lookup: {
            from: 'states',
            let: {
                stateIdObjectId: '$state_id',
                stateIdNumber: '$state_id'
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $or: [
                        { $eq: ['$_id', '$$stateIdObjectId'] },  // for ObjectId
                        { $eq: ['$unique_id', '$$stateIdNumber'] } // for string "1" to match numeric unique_id
                    ]
                    }
                }
                },
                {
                $project: {
                    _id: 1,
                    name: 1,
                    unique_id: 1
                }
                }
            ],
            as: 'state_id'
            }
        },

        {
            $unwind: {
            path: '$state_id',
            preserveNullAndEmptyArrays: true
            }
        },

        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
        ]);

        const totalCountry = await citySchema.countDocuments(searchQuery);

        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    } catch (error) {    
        throw new Error('Error fetching users');
    }
};

export const getAdminCityListModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        // const users = await citySchema.find(searchQuery)
        //  .sort({ createdAt: -1 })
        //     .skip(skip)
        //     .limit(limit) 
        //     .populate('state_id', 'name')
        //     .exec();
        const users = await citySchema.aggregate([
        { $match: searchQuery },
        {
            $lookup: {
            from: 'states',
            let: {
                stateIdObjectId: '$state_id',
                stateIdNumber: '$state_id'
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $or: [
                        { $eq: ['$_id', '$$stateIdObjectId'] },  // for ObjectId
                        { $eq: ['$unique_id', '$$stateIdNumber'] } // for string "1" to match numeric unique_id
                    ]
                    }
                }
                },
                {
                $project: {
                    _id: 1,
                    name: 1,
                    unique_id: 1
                }
                }
            ],
            as: 'state_id'
            }
        },

        {
            $unwind: {
            path: '$state_id',
            preserveNullAndEmptyArrays: true
            }
        },

        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
        ]);
      

        const totalCountry = await citySchema.countDocuments(searchQuery);

        return {
            data: users,
            totalCountry,
            totalPages: Math.ceil(totalCountry / limit),
            currentPage: page,
        };
    } catch (error) {
        
        throw new Error('Error fetching users');
    }
}

export const cityStoreModel = async (cityData:citySchema,  callback: (error:any, result: any) => void) => {
    try {
        const existingCity = await citySchema.findOne({ name: cityData.name,state_id: cityData.state_id });
        
        if (existingCity) {
            const error = new Error("City already exists.");
            return callback(error, null);
        }

        const lastCountry = await citySchema.findOne().sort({ sorting: -1 });
            
        const newCity = new citySchema({ 
            ...cityData
        });
        
        await newCity.save();

        return callback(null, newCity);
    } catch (error) {
        
        throw new Error('Error fetching users');
    }
}

export const deleteCity = async (city_ids:any,  callback: (error:any, result: any) => void) => {   
        try {
            await citySchema.deleteMany({ _id: { $in: city_ids } });
            return callback(null, "City deleted successfully.");
        } catch (error) {
            
            throw new Error('Error fetching users');
        }           

}

export const cityUpdateModel = async (city_id:any,cityData:citySchema,  callback: (error:any, result: any) => void) => {
    try {
        
        const existingCity = await citySchema.findOne({ _id: city_id });

        if (!existingCity) {
            return callback(new Error("City not found. sdsd"), null);
        }

        const slugExist = await citySchema.findOne({state_id: cityData.state_id, _id: { $ne: city_id },name:cityData.name });

        if (slugExist) {
            return callback(new Error(" already exists."), null);
        }
       const stateId = typeof cityData.state_id === 'string'
  ? parseInt(cityData.state_id, 10)
  : cityData.state_id;

        existingCity.state_id = stateId || existingCity.state_id;
        existingCity.name = cityData.name || existingCity.name;
        await existingCity.save();
        return callback(null, existingCity);

    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const storeCityModel = async (areaData:citySchema,  callback: (error:any, result: any) => void) => {
    try {
        const existingArea = await citySchema.findOne({ name: areaData.name,state_id: areaData.state_id });
        
        if (existingArea) {
            const error = new Error("Area already exists.");
            return callback(error, null);
        }

        const lastCountry = await citySchema.findOne().sort({ sorting: -1 });

        const newArea = new citySchema({ 
            ...areaData
        });
        
        await newArea.save();

        return callback(null, newArea);
    } catch (error) {
        throw new Error('Error fetching users');
    }
}

export const cityDetail = async (city_id:string, callback: (error: any, result: any) => void) => {
    try {
        
        //const City = await citySchema.findOne({ _id: city_id }).populate('state_id', 'name');
        const city = await citySchema.aggregate([
        {
            $match: {
            _id: new mongoose.Types.ObjectId(city_id)
            }
        },
        {
            $lookup: {
            from: 'states',
            let: {
                cidObj: '$state_id',
                cidInt: '$state_id'
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $or: [
                        { $eq: ['$_id', '$$cidObj'] },
                        { $eq: ['$unique_id', '$$cidInt'] }
                    ]
                    }
                }
                },
                {
                $project: {
                    _id: 1,
                    name: 1,
                    unique_id: 1
                }
                }
            ],
            as: 'state_id'
            }
        },

        { $unwind: { path: '$state_id', preserveNullAndEmptyArrays: true } },

        {
            $project: {
            _country_id_int: 0
            }
        }
        ]);

        const City = city[0] || null;        
        return callback(null, { City });
    } catch (error) {
        console.error("Error Finding City:", error);
        return callback(error, null);
    }
};


export const deleteArea = async (area_ids:any,  callback: (error:any, result: any) => void) => {   
        try {
            await citySchema.deleteMany({ _id: { $in: area_ids } });
            return callback(null, "Area deleted successfully.");
        } catch (error) {
            throw new Error('Error fetching users');
        }           

}

export const areaDetail = async (area_id:string, callback: (error: any, result: any) => void) => {
    try {
        
        //const Area = await areaSchema.findOne({ _id: area_id }).populate('city_id', 'name');
        const area = await areaSchema.aggregate([
        {
            $match: {
            _id: new mongoose.Types.ObjectId(area_id)
            }
        },
        {
            $lookup: {
            from: 'cities',
            let: {
                cidObj: '$city_id',
                cidInt: '$city_id'
            },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $or: [
                        { $eq: ['$_id', '$$cidObj'] },
                        { $eq: ['$unique_id', '$$cidInt'] }
                    ]
                    }
                }
                },
                {
                $project: {
                    _id: 1,
                    name: 1,
                    unique_id: 1
                }
                }
            ],
            as: 'city_id'
            }
        },

        { $unwind: { path: '$city_id', preserveNullAndEmptyArrays: true } },
        ]);

        const Area = area[0] || null;        
        return callback(null, { Area });
    } catch (error) {
        console.error("Error Finding Area:", error);
        return callback(error, null);
    }
};





