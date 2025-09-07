import React from 'react';

interface ImagePreviewModalProps {
  src: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ src, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `ai-generated-image-${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl p-4 relative max-w-4xl w-11/12 max-h-[90vh] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10 p-1 bg-black/20 rounded-full"
          aria-label="Close image preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 min-h-0 flex justify-center items-center">
            <img src={src} alt="AI Generated Preview" className="rounded-md object-contain max-h-full max-w-full" />
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleDownload}
            className="w-full max-w-xs bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
