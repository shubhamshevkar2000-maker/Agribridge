import React from 'react';
import { getValidImageUrl } from '@/utils/cropImages';

interface CropImageProps {
  images?: string[];
  alt?: string;
  className?: string;
  cropName?: string;
}

export function CropImage({ images, alt = 'Crop Image', className = 'w-full h-full object-cover', cropName }: CropImageProps) {
  const imageUrl = images && images.length > 0 ? images[0] : undefined;
  const src = getValidImageUrl(imageUrl, cropName || alt);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
