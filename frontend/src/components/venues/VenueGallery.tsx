import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VenueImage {
  url: string;
  alt: string;
  isFeatured?: boolean;
}

interface VenueGalleryProps {
  images: VenueImage[];
  venueName: string;
}

const VenueGallery: React.FC<VenueGalleryProps> = ({ images, venueName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === "Escape") {
      setIsFullScreen(false);
    }
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-2">
        {/* Main Image */}
        <div
          className="relative h-72 md:h-96 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => setIsFullScreen(true)}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <img
            src={images[currentIndex]?.url}
            alt={
              images[currentIndex]?.alt ||
              `${venueName} - Image ${currentIndex + 1}`
            }
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://source.unsplash.com/random/800x600/?wedding,venue";
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-sm">
              Image {currentIndex + 1} of {images.length}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative h-16 w-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${
                index === currentIndex
                  ? "ring-2 ring-primary border border-white"
                  : "opacity-70"
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img
                src={image.url}
                alt={image.alt || `${venueName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://source.unsplash.com/random/100x100/?wedding,venue";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Gallery */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-6xl p-0 bg-black">
          <div
            className="flex flex-col h-screen max-h-[80vh]"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={() => setIsFullScreen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 relative flex items-center justify-center p-4">
              <img
                src={images[currentIndex]?.url}
                alt={
                  images[currentIndex]?.alt ||
                  `${venueName} - Image ${currentIndex + 1}`
                }
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://source.unsplash.com/random/800x600/?wedding,venue";
                }}
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-4 text-white bg-black/90">
              <p>
                {images[currentIndex]?.alt ||
                  `${venueName} - Image ${currentIndex + 1}`}
              </p>
              <p className="text-sm text-white/70">
                Image {currentIndex + 1} of {images.length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VenueGallery;
