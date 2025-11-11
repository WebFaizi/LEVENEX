import IpAddress from "../schema/ipAddress.schema"; 

interface ipAddressData{
    ip_holder_name:string;
    ip_address:string;
    device_type:string;
}

export const StoreIpAddressModel = async (ipAddressData: ipAddressData, callback: (error: any, result: any) => void) => {
    try {

        const ipAddress = new IpAddress({
            ip_holder_name: ipAddressData.ip_holder_name,
            ip_address: ipAddressData.ip_address,
            device_type: ipAddressData.device_type
        });

        const savedIpAddress = await ipAddress.save();
        return callback(null, { savedIpAddress });

    } catch (error) {
        console.error("Error storing blog:", error);
        return callback(error, null);
    }
};

export const listIpAddressModel = async (search: string, page: number, limit: number) => {
    try {
      
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                      { subdomain_slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;

        const lists = await IpAddress.find(searchQuery)
            .skip(skip)
            .limit(limit) 
            .exec();

        const totalLists = await IpAddress.countDocuments(searchQuery);

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

