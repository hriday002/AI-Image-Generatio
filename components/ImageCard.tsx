import React from 'react';

interface ImageCardProps {
  src: string;
  onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, onClick }) => {
  return (
    <div 
      className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800 transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
      onClick={onClick}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      tabIndex={0}
      role="button"
      aria-label="View larger image"
    >
      <img src={src} alt="AI Generated" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <p className="text-white text-lg font-semibold">View Preview</p>
      </div>
    </div>
  );
};

export default ImageCard;
