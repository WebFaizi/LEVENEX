export function getImageUrl(imagePath, { width, height } = {}) {
  if (!imagePath) return '/uploads/default.jpg';
  
  // Get base URL and remove trailing slashes
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');
  
  // Remove leading slashes from image path
  const cleanPath = imagePath.replace(/^\/+/, '');
  
  // Construct URL
  let url = `${baseUrl}/${cleanPath}`;
  
  // Add query parameters if provided
  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}
