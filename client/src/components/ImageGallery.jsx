import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

const ImageGallery = ({ images, mainImage, productName }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Build gallery array from images or fallback to single mainImage
    const galleryImages = images && images.length > 0
        ? images.map(img => ({ url: img.url, alt: img.alt || productName }))
        : mainImage
            ? [{ url: mainImage, alt: productName }]
            : [];

    if (galleryImages.length === 0) {
        return (
            <div className="w-full h-96 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
                <span className="text-lg font-medium">Sin imagen</span>
            </div>
        );
    }

    const currentImage = galleryImages[selectedIndex];

    const goToPrevious = () => {
        setSelectedIndex(prev => prev === 0 ? galleryImages.length - 1 : prev - 1);
    };

    const goToNext = () => {
        setSelectedIndex(prev => prev === galleryImages.length - 1 ? 0 : prev + 1);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') setLightboxOpen(false);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden group">
                <img
                    src={currentImage.url}
                    alt={currentImage.alt}
                    className="w-full h-96 lg:h-[500px] object-cover cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                />

                {/* Zoom button */}
                <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute bottom-4 right-4 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ZoomIn size={20} className="text-gray-700" />
                </button>

                {/* Navigation arrows (only if multiple images) */}
                {galleryImages.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                        >
                            <ChevronLeft size={24} className="text-gray-700" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                        >
                            <ChevronRight size={24} className="text-gray-700" />
                        </button>
                    </>
                )}

                {/* Image counter */}
                {galleryImages.length > 1 && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                        {selectedIndex + 1} / {galleryImages.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {galleryImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === selectedIndex
                                    ? 'border-primary ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            <img
                                src={img.url}
                                alt={`${productName} - imagen ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={() => setLightboxOpen(false)}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
                    >
                        <X size={32} />
                    </button>

                    {/* Main lightbox image */}
                    <img
                        src={currentImage.url}
                        alt={currentImage.alt}
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Navigation arrows */}
                    {galleryImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                                className="absolute left-4 p-3 text-white hover:text-gray-300 transition-colors"
                            >
                                <ChevronLeft size={48} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                className="absolute right-4 p-3 text-white hover:text-gray-300 transition-colors"
                            >
                                <ChevronRight size={48} />
                            </button>
                        </>
                    )}

                    {/* Lightbox counter */}
                    {galleryImages.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/20 text-white rounded-full">
                            {selectedIndex + 1} / {galleryImages.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;


