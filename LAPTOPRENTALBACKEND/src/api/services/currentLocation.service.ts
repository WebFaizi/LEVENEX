import City from "../domain/schema/city.schema";
import Area from "../domain/schema/area.schema";
import mongoose from "mongoose";

export const getLocationDetails = async (locationId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return {
        location_type: "unknown",
        message: "Invalid location ID",
        current_location_id: "",
      };
    }

    // Try area first
    const area = await Area.findById(locationId).lean();    

    if (area) {
      const city = area.city_id
        ? await City.findOne({ unique_id: area.city_id }).lean()
        : null;

      return {
        location_type: "area",
        area_name: area.name,
        city_name: city?.name || null,
        current_location_id: area._id.toString(),
        current_area_id: area._id.toString(),
        current_city_id: city?._id?.toString() || "",
        current_location_unique_id: area.unique_id,
        current_city_unique_id: city?.unique_id,
      };
    }

    // Fallback to city
    const city = await City.findById(locationId).lean();    
    if (city) {
      return {
        location_type: "city",
        city_name: city.name,
        current_location_id: city._id.toString(),
        current_location_unique_id: city.unique_id,
        current_area_id: "",
        current_city_id: city._id.toString(),
        current_city_unique_id: city?.unique_id,
      };
    }

    return {
      location_type: "unknown",
      message: "Location not found",
      current_location_id: "",
    };
  } catch (error) {
    throw new Error("Failed to fetch location details");
  }
};

export const getDefaultLoactionDetails = async () => {
  try {
    const city = await City.findOne({ name: process.env.DEFAULT_CITY }).lean();
    if (city) {
      return {
        location_type: "city",
        city_name: city.name,
        current_location_id: city._id.toString(),
        current_area_id: "",
        current_city_id: city._id.toString(),
        current_location_unique_id: city.unique_id,
        current_city_unique_id: city.unique_id,
      };
    }

    return {
      location_type: "unknown",
      message: "Location not found",
      current_location_id: "",
      current_area_id: "",
      current_city_id: "",
      current_location_unique_id: "",
      current_city_unique_id: "",
    };
  } catch (error) {
    throw new Error("Failed to fetch location details");
  }
};

export default getLocationDetails;
