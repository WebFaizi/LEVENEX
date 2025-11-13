export async function getRequest(path) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;  
  
  // Remove leading slash from path to prevent double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Use appropriate caching for static generation
  return fetch(`${baseURL}/${cleanPath}`, {
    // Remove cache-busting headers for build time
    // Use revalidate instead
    next: { revalidate: 3600 } // Cache for 1 hour
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.warn(`API request failed: ${baseURL}/${cleanPath}`, response.status);
        return false;
      }
    })
    .catch((error) => {
      console.error(`API request error for ${cleanPath}:`, error);
      return false;
    });
}


