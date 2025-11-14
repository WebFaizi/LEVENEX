export async function getRequest(path) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;  
  
  // Remove leading slash from path to prevent double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Real-time data fetching with no cache
  return fetch(`${baseURL}/${cleanPath}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // Force fresh data on every request
    next: { revalidate: 60 }
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


