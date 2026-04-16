import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useElevatorNavigation = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const navigateWithElevator = useCallback((path: string) => {
    setPendingPath(path);
    setIsTransitioning(true);
  }, []);

  // Called when doors are fully closed — navigate now so page loads behind doors
  const handleDoorsFullyClosed = useCallback(() => {
    if (pendingPath) {
      navigate(pendingPath);
      window.scrollTo(0, 0);
    }
  }, [navigate, pendingPath]);

  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
    setPendingPath(null);
  }, []);

  return {
    isTransitioning,
    navigateWithElevator,
    handleTransitionComplete,
    handleDoorsFullyClosed,
  };
};
