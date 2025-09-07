
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-12 h-12 border-4 border-t-purple-500 border-gray-600 rounded-full animate-spinner-rotate"></div>
    </div>
  );
};

export default LoadingSpinner;
