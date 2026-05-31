'use client';

import { useState } from 'react';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ProjectImage {
  id: number;
  url: string;
  is_main: boolean;
  position: number;
}

export default function ProjectImageGallery({
  images,
  title,
}: {
  images: ProjectImage[];
  title: string;
}) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-muted">
        <Zoom key={selected}>
          <img
            src={getCloudinaryImageUrl(images[selected].url, {
              width: 1200,
              height: 675,
              crop: 'fill',
            })}
            alt={`${title} - image ${selected + 1}`}
            className="w-full h-full object-cover"
          />
        </Zoom>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setSelected(index)}
            className={`flex-shrink-0 w-24 h-16 rounded-xl border-2 overflow-hidden transition-all ${
              selected === index
                ? 'border-accent'
                : 'border-border hover:border-accent/50'
            }`}
          >
            <img
              src={getCloudinaryImageUrl(img.url, { width: 160, height: 100, crop: 'fill' })}
              alt={`${title} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
