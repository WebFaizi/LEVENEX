'use client';

import Image from 'next/image';

export default function CustomImage({ src, alt, width, height, className, ...props }) {
  // Handle empty or invalid src
  if (!src) {
    src = '/uploads/default.jpg';
  }

  // If src is already a full URL, use it as is
  let imageSrc = src;
  
  // If it's a relative path, construct the full URL
  if (!src.startsWith('http')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || '';
    const cleanSrc = src.replace(/^\/+/, ''); // Remove leading slashes
    imageSrc = `${baseUrl}/${cleanSrc}`;
  }

  // Use regular img tag instead of Next Image component to avoid optimization issues on cPanel
  return (
    <img
      src={imageSrc}
      alt={alt || ''}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}
