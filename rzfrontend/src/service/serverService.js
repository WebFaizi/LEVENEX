export async function getRequest(path) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;  
  
  // Remove leading slash from path to prevent double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  try {
    const response = await fetch(`${baseURL}/${cleanPath}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      next: { revalidate: 60 },
      // Add timeout to prevent hanging during build
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (response.ok) {
      return response.json();
    } else {
      console.warn(`API request failed: ${baseURL}/${cleanPath}`, response.status);
      return false;
    }
  } catch (error) {
    console.error(`API request error for ${cleanPath}:`, error.message);
    // Return false instead of throwing to allow build to continue
    return false;
  }
}


