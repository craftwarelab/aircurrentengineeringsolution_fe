'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Crop, RotateCw, ZoomIn, ZoomOut, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  mainImageIndex?: number;
  onMainImageChange?: (index: number) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  mainImageIndex = 0,
  onMainImageChange
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [croppingImage, setCroppingImage] = useState<File | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (imageFiles.length === 0) {
      return;
    }

    if (images.length + imageFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
      return;
    }

    // Add images
    onImagesChange([...images, ...imageFiles]);
    toast.success(`Added ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    // Adjust main image index if needed
    if (onMainImageChange && index === mainImageIndex && newImages.length > 0) {
      onMainImageChange(0);
    } else if (onMainImageChange && index < mainImageIndex) {
      onMainImageChange(mainImageIndex - 1);
    }
  };

  const setAsMain = (index: number) => {
    if (onMainImageChange) {
      onMainImageChange(index);
    } else {
      // Move image to front
      const newImages = [...images];
      const [movedImage] = newImages.splice(index, 1);
      newImages.unshift(movedImage);
      onImagesChange(newImages);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);

    // Update main image index
    if (onMainImageChange) {
      if (fromIndex === mainImageIndex) {
        onMainImageChange(toIndex);
      } else if (toIndex <= mainImageIndex && fromIndex > mainImageIndex) {
        onMainImageChange(mainImageIndex + 1);
      } else if (toIndex >= mainImageIndex && fromIndex < mainImageIndex) {
        onMainImageChange(mainImageIndex - 1);
      }
    }
  };

  const openCropModal = (image: File) => {
    setCroppingImage(image);
    // Initialize crop area to center of image with reasonable size
    setCropArea({ x: 50, y: 50, width: 200, height: 200 });
    setZoom(1);
    setRotation(0);
  };

  const applyCrop = () => {
    if (!croppingImage || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw cropped area
    ctx.drawImage(
      img,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    ctx.restore();

    // Convert to blob and create new file
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], croppingImage.name, { type: croppingImage.type });
        const index = images.indexOf(croppingImage);
        if (index !== -1) {
          const newImages = [...images];
          newImages[index] = croppedFile;
          onImagesChange(newImages);
        }
      }
    });

    setCroppingImage(null);
  };

  const adjustCropArea = (deltaX: number, deltaY: number, deltaWidth: number, deltaHeight: number) => {
    setCropArea(prev => ({
      x: Math.max(0, prev.x + deltaX),
      y: Math.max(0, prev.y + deltaY),
      width: Math.max(50, prev.width + deltaWidth),
      height: Math.max(50, prev.height + deltaHeight),
    }));
  };

  return (
    <>
      <div className="space-y-4">
        <Label>Product Images ({images.length}/{maxImages})</Label>

        {/* Upload Area */}
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Drag and drop images here, or{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 10MB each. Maximum {maxImages} images.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setAsMain(index)}
                          disabled={index === mainImageIndex}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => moveImage(index, index - 1)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => moveImage(index, index + 1)}
                          disabled={index === images.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => openCropModal(image)}
                        >
                          <Crop className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500 truncate">{image.name}</span>
                  {index === mainImageIndex && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Main
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {croppingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crop Image</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCroppingImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Image with crop overlay */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <img
                  ref={imageRef}
                  src={URL.createObjectURL(croppingImage)}
                  alt="Crop preview"
                  className="w-full h-full object-contain"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                />
                {/* Crop overlay */}
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                  }}
                >
                  {/* Corner handles */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"></div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(rotation - 90)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-16 text-center">{rotation}°</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(rotation + 90)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Crop size controls */}
              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <Label className="text-sm">Width</Label>
                  <input
                    type="range"
                    min="50"
                    max="400"
                    value={cropArea.width}
                    onChange={(e) => setCropArea(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{cropArea.width}px</span>
                </div>
                <div className="text-center">
                  <Label className="text-sm">Height</Label>
                  <input
                    type="range"
                    min="50"
                    max="400"
                    value={cropArea.height}
                    onChange={(e) => setCropArea(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{cropArea.height}px</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setCroppingImage(null)}>
                Cancel
              </Button>
              <Button onClick={applyCrop}>
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}