import React from 'react';
import { motion } from 'framer-motion';

interface ResourceLoadingAnimationProps {
  progress?: number;
}

const ResourceLoadingAnimation: React.FC<ResourceLoadingAnimationProps> = ({ progress = 0 }) => {
  return (
    <div className="flex flex-col items-center justify-center w-64">
      <div className="text-sm text-gray-600 mb-4">
        Generating Resources...
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-dev-blue h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default ResourceLoadingAnimation; 