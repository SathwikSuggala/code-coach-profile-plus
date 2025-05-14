import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ResourceLoadingAnimation from '../components/ResourceLoadingAnimation';

const ResourceGeneration: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Simulate resource generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Resource Generation</h1>
          <p className="text-gray-600">
            {isGenerating 
              ? "We're preparing your personalized learning resources..."
              : "Your resources are ready!"}
          </p>
        </div>

        <ResourceLoadingAnimation progress={progress} />

        {!isGenerating && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 px-6 py-2 bg-dev-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => {/* Handle view resources */}}
          >
            View Resources
          </motion.button>
        )}
      </div>
    </Layout>
  );
};

export default ResourceGeneration; 