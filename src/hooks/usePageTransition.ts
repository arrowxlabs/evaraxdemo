import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const usePageTransition = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | undefined>(undefined);

  const navigateWithTransition = useCallback((path: string, image?: string) => {
    setPendingPath(path);
    setTargetImage(image);
    setIsTransitioning(true);
  }, []);

  const handleMidpoint = useCallback(() => {
    if (pendingPath) {
      navigate(pendingPath);
      window.scrollTo(0, 0);
    }
  }, [navigate, pendingPath]);

  const handleComplete = useCallback(() => {
    setIsTransitioning(false);
    setPendingPath(null);
    setTargetImage(undefined);
  }, []);

  return {
    isTransitioning,
    targetImage,
    navigateWithTransition,
    handleMidpoint,
    handleComplete,
  };
};
