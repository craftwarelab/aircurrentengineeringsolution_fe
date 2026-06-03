'use client';

import { useState } from 'react';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ServiceImage {
  id: number;
  url: string;
  is_main: boolean;
  position: number;
}

export default function ServiceImageGallery({
  images,
  name,
}: {
  images: ServiceImage[];
  name: string;
}) {
  const mainIndex = images.findIndex((img) => img.is_main);
  const [selected, setSelected] = useState(mainIndex >= 0 ? mainIndex : 0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-3">⚙️</div>
          <span className="text-sm text-muted-foreground font-medium">No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border flex items-center justify-center">
        <Zoom key={selected}>
          <img
            src={getCloudinaryImageUrl(images[selected].url, { width: 800, height: 800, crop: 'fill' })}
            alt={`${name} - image ${selected + 1}`}
            className="w-full h-full object-cover"
          />
        </Zoom>
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelected(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                selected === index ? 'border-accent' : 'border-border hover:border-accent/50'
              }`}
            >
              <img
                src={getCloudinaryImageUrl(img.url, { width: 120, height: 120, crop: 'fill' })}
                alt={`${name} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
