import React, { useState, useEffect } from 'react';

const NO_IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none"><rect width="800" height="600" fill="%231E293B"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" fill="%2364748B">No Image Available</text></svg>`;

interface CropImageProps {
  images?: string[];
  alt?: string;
  className?: string;
}

export function CropImage({ images, alt = 'Crop Image', className = 'w-full h-full object-cover' }: CropImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    (images && images.length > 0 && images[0] && !images[0].includes('placehold.co'))
      ? images[0]
      : NO_IMAGE_PLACEHOLDER
  );

  useEffect(() => {
    setImgSrc(
      (images && images.length > 0 && images[0] && !images[0].includes('placehold.co'))
        ? images[0]
        : NO_IMAGE_PLACEHOLDER
    );
  }, [images]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (imgSrc !== NO_IMAGE_PLACEHOLDER) {
          setImgSrc(NO_IMAGE_PLACEHOLDER);
        }
      }}
    />
  );
}
