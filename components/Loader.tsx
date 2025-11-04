import React from 'react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  message = "Generating Content & Images...",
  subMessage = "This may take a moment. The AI is crafting unique posts and images just for you!" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-lg shadow-xl">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
      <h2 className="text-2xl font-semibold mt-6 text-gray-200">{message}</h2>
      <p className="text-gray-400 mt-2 max-w-md">
        {subMessage}
      </p>
    </div>
  );
};

export default Loader;
