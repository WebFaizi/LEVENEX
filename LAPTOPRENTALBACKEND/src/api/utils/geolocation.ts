import geoip from "geoip-lite";
import { getName } from "country-list";
import NodeGeocoder, { Options } from "node-geocoder";

const options: Options = {
  provider: "openstreetmap",
  formatter: null
};

const geocoder = NodeGeocoder(options);

export interface GeoLocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Get geographical information from IP address
 * @param ip - IP address to lookup
 * @returns GeoLocationData object with location information
 */
export async function getGeoLocationFromIp(ip: string): Promise<GeoLocationData> {
  try {
    // Default values
    const defaultData: GeoLocationData = {
      country: "Unknown",
      countryCode: "Unknown",
      region: "Unknown",
      city: "Unknown",
      zipcode: "Unknown",
      latitude: 0,
      longitude: 0,
      timezone: "Unknown"
    };

    // Skip localhost and invalid IPs
    if (!ip || ip === 'UNKNOWN' || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      console.log(`Skipping geolocation for local/private IP: ${ip}`);
      return defaultData;
    }

    // Get basic geo info from geoip-lite
    const geo = geoip.lookup(ip);
    
    if (!geo) {
      console.log(`No geo data found for IP: ${ip}`);
      return defaultData;
    }

    console.log(`GeoIP lookup for ${ip}:`, {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      ll: geo.ll,
      timezone: geo.timezone
    });

    const countryCode = geo.country || "Unknown";
    const countryName = getName(countryCode) || countryCode;
    const latitude = geo.ll?.[0] ?? 0;
    const longitude = geo.ll?.[1] ?? 0;

    // Start with geoip-lite data
    let zipcode = "Unknown";
    let detailedCity = geo.city || "Unknown";
    let region = geo.region || "Unknown";
    
    // Try reverse geocoding for more detailed info if we have valid coordinates
    if (latitude && longitude && latitude !== 0 && longitude !== 0) {
      try {
        const res = await geocoder.reverse({ lat: latitude, lon: longitude });
        console.log(`Reverse geocoding result for ${ip}:`, res?.[0]);
        
        if (res && res.length > 0) {
          const geocodedData = res[0] as any;
          
          // Get zipcode from reverse geocoding
          zipcode = geocodedData?.zipcode || "Unknown";
          
          // If geoip-lite didn't provide a city, use the reverse geocoded one
          if (!geo.city || geo.city === "Unknown") {
            detailedCity = geocodedData?.city || geocodedData?.county || geocodedData?.state || "Unknown";
          }
          
          console.log(`Geocoded data - City: ${geocodedData?.city}, County: ${geocodedData?.county}, State: ${geocodedData?.state}, Zipcode: ${zipcode}`);
        }
      } catch (geocodeError) {
        console.warn(`Geocoding failed for ${ip}:`, geocodeError instanceof Error ? geocodeError.message : 'Unknown error');
        // Continue with basic geo data
      }
    }

    console.log(`Final geo data for ${ip}: City=${detailedCity}, Region=${region}, Zipcode=${zipcode}, Country=${countryName}`);

    return {
      country: countryName,
      countryCode: countryCode,
      region: region,
      city: detailedCity,
      zipcode: zipcode,
      latitude: latitude,
      longitude: longitude,
      timezone: geo.timezone || "Unknown"
    };

  } catch (error) {
    console.error('Error in getGeoLocationFromIp:', error);
    return {
      country: "Unknown",
      countryCode: "Unknown",
      region: "Unknown",
      city: "Unknown",
      zipcode: "Unknown",
      latitude: 0,
      longitude: 0,
      timezone: "Unknown"
    };
  }
}

/**
 * Get geographical information synchronously from IP (without zipcode lookup)
 * Use this when you need faster response and don't need precise zipcode
 * @param ip - IP address to lookup
 * @returns Basic GeoLocationData object
 */
export function getBasicGeoLocationFromIp(ip: string): Omit<GeoLocationData, 'zipcode'> & { zipcode: string } {
  try {
    // Default values
    const defaultData = {
      country: "Unknown",
      countryCode: "Unknown",
      region: "Unknown",
      city: "Unknown",
      zipcode: "Unknown",
      latitude: 0,
      longitude: 0,
      timezone: "Unknown"
    };

    // Skip localhost and invalid IPs
    if (!ip || ip === 'UNKNOWN' || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return defaultData;
    }

    // Get basic geo info from geoip-lite
    const geo = geoip.lookup(ip);
    
    if (!geo) {
      return defaultData;
    }

    const countryCode = geo.country || "Unknown";
    const countryName = getName(countryCode) || countryCode;

    return {
      country: countryName,
      countryCode: countryCode,
      region: geo.region || "Unknown",
      city: geo.city || "Unknown",
      zipcode: "Unknown", // Not available without geocoding
      latitude: geo.ll?.[0] ?? 0,
      longitude: geo.ll?.[1] ?? 0,
      timezone: geo.timezone || "Unknown"
    };

  } catch (error) {
    console.error('Error in getBasicGeoLocationFromIp:', error);
    return {
      country: "Unknown",
      countryCode: "Unknown",
      region: "Unknown",
      city: "Unknown",
      zipcode: "Unknown",
      latitude: 0,
      longitude: 0,
      timezone: "Unknown"
    };
  }
}
