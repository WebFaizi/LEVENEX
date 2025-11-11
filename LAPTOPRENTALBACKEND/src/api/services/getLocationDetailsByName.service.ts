import City from "../domain/schema/city.schema";
import Area from "../domain/schema/area.schema";

export const getLocationDetailsByName = async (locationName: string) => {
  try {
    // Search for the Area first
    const area = await Area.findOne({
      name: { $regex: new RegExp(`^${locationName}$`, "i") },
    }); // Case-insensitive match

    if (area) {
      const city_name = await City.findOne({ unique_id: area.city_id });
      return {
        location_type: "area",
        area_name: area.name,
        city_name: area.city_id ? city_name?.name : null,
        current_location_id: area.id,
        current_location_name: area.name,
        current_area_id: area.id,
        current_city_id: area.city_id ? area.city_id.toString() : "",
        current_location_unique_id: area.unique_id,
        current_city_unique_id: city_name?.unique_id,
      };
    }

    // If no Area found, search for City
    const city = await City.findOne({
      name: { $regex: new RegExp(`^${locationName}$`, "i") },
    });

    if (city) {
      return {
        location_type: "city",
        city_name: city.name,
        current_location_id: city.id,
        current_location_name: city.name,
        current_location_unique_id: city.unique_id,
        current_area_id: "",
        current_city_id: city.id,
        current_city_unique_id: city?.unique_id,
      };
    }

    return {
      location_type: "unknown",
      current_location_name: "unknown",
      message: "Location not found",
      current_location_id: "",
    };
  } catch (error) {
    console.error("Error fetching location details by name:", error);
    throw new Error("Failed to fetch location details");
  }
};

export default getLocationDetailsByName;
