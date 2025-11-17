import IpAddress from "../schema/ipAddress.schema"; 
import Keywords from "../schema/keywords.schema"; 

interface KeywordsData{
    keyword:string;
}
interface ImportListingData {
    words:string;
}
interface keywordSchema {
    keyword_id:string;
    words:string;
}

// export const StoreIpAddressModel = async (ipAddressData: ipAddressData, callback: (error: any, result: any) => void) => {
//     try {

//         const ipAddress = new IpAddress({
//             ip_holder_name: ipAddressData.ip_holder_name,
//             ip_address: ipAddressData.ip_address,
//             device_type: ipAddressData.device_type
//         });

//         const savedIpAddress = await ipAddress.save();
//         return callback(null, { savedIpAddress });

//     } catch (error) {
//         console.error("Error storing blog:", error);
//         return callback(error, null);
//     }
// };

export const getKeywordsModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } }
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const lists = await Keywords.find(searchQuery)
            .skip(skip)
            .limit(limit) 
            .exec();

        const totalLists = await Keywords.countDocuments(searchQuery);

        return {
            data: lists,
            totalLists,
            totalPages: Math.ceil(totalLists / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error('Error fetching users');
    }
};

export const importKeywordsDataModel = async (listingData: ImportListingData[], callback: (error: any, result: any) => void) => {
    try {
        // Extract all keyword strings
        const allKeywords = listingData
            .map(item => item.words?.trim().toLowerCase())
            .filter(word => !!word); // remove undefined/empty

        // Get already existing keywords
        const existingKeywords = await Keywords.find({
            words: { $in: allKeywords }
        }).distinct("words");

        const existingSet = new Set(existingKeywords.map(k => k.toLowerCase()));

        // Filter out duplicates
        const newKeywords = listingData.filter(item =>
            item.words && !existingSet.has(item.words.trim().toLowerCase())
        );

        if (newKeywords.length === 0) {
            return callback(null, { message: "All keywords already exist. Nothing to import." });
        }

        // Insert new unique keywords
        await Keywords.insertMany(newKeywords, { ordered: false });

        return callback(null, {
            message: `${newKeywords.length} keyword(s) inserted successfully.`,
            inserted: newKeywords.length
        });

    } catch (error) {
        console.error("❌ Error inserting keywords:", error);
        return callback(error, null);
    }
};

export const updateKeywordModel = async (countryData:keywordSchema,  callback: (error:any, result: any) => void) => {
    try {

        const existingCountry = await Keywords.findOne({ _id:countryData.keyword_id });        
        if (!existingCountry) {
            return callback(new Error("Country not found."), null);
        }

        existingCountry.words = countryData.words;
        await existingCountry.save();
        return callback(null, existingCountry);

    } catch (error) {
        console.log(error)
        throw new Error('Error fetching users');
    }
};





