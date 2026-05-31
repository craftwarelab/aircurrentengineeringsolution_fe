/**
 * Cloudinary Utility using official @cloudinary/url-gen SDK
 * 
 * Provides helper functions to generate Cloudinary image URLs
 * with full transformation support.
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { scale, fill } from '@cloudinary/url-gen/actions/resize';
import { quality } from '@cloudinary/url-gen/actions/delivery';
import { format } from '@cloudinary/url-gen/actions/delivery';

// Initialize Cloudinary instance using environment variable
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name_here';

const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName,
  },
});

/**
 * Generate a Cloudinary image URL using the official SDK
 * @param publicId - The public ID of the image in Cloudinary
 * @param options - Optional transformation options
 */
export function getCloudinaryImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'scale';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg';
  } = {}
): string {
  if (!publicId) return '';

  const { width, height, crop = 'fill', quality: q = 'auto', format: f = 'auto' } = options;

  let image = cld.image(publicId);

  // Apply resize transformation
  if (width || height) {
    const resizeAction = crop === 'fill' 
      ? fill().width(width || 0).height(height || 0)
      : scale().width(width || 0).height(height || 0);
    
    image = image.resize(resizeAction);
  }

  // Apply quality
  if (q === 'auto') {
    image = image.delivery(quality('auto'));
  } else if (typeof q === 'number') {
    image = image.delivery(quality(q));
  }

  // Apply format
  if (f === 'auto') {
    image = image.delivery(format('auto'));
  } else {
    image = image.delivery(format(f));
  }

  return image.toURL();
}

/**
 * Generate a responsive image URL (recommended for most use cases)
 */
export function getCloudinaryResponsiveImageUrl(
  publicId: string,
  width: number = 800
): string {
  return getCloudinaryImageUrl(publicId, {
    width,
    crop: 'scale',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Get the configured Cloudinary cloud name
 */
export function getCloudinaryCloudName(): string {
  return cloudName;
}

export default {
  getCloudinaryImageUrl,
  getCloudinaryResponsiveImageUrl,
  getCloudinaryCloudName,
};
