import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigationType, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationType = useNavigationType();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isLoading: isAuthLoading } = useAuth();

  const startLoading = () => {
    setIsLoading(true);
    setIsNavigating(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setIsNavigating(false);
  };

  // Set navigating state on location change
  useEffect(() => {
    setIsNavigating(true);
    // Set a timeout to stop navigating state after a brief period
    // This helps cover cases where no API calls are made on the new page
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 500); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Determine overall loading state based on navigation, API calls, and auth loading
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const queries = queryClient.getQueryCache().getAll();
      const hasLoadingQueries = queries.some(query => query.state.status === 'pending');

      // Overall loading is true if navigating, if any queries are loading, or if auth is loading
      const shouldLoad = isNavigating || hasLoadingQueries || isAuthLoading;
      setIsLoading(shouldLoad);
      console.log('Loading State Update:', { isNavigating, hasLoadingQueries, isAuthLoading, overallIsLoading: shouldLoad });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, isNavigating, isAuthLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 