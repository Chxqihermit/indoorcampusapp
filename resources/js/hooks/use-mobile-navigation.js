import { useCallback } from "react";
function useMobileNavigation() {
  return useCallback(() => {
    document.body.style.removeProperty("pointer-events");
  }, []);
}
export {
  useMobileNavigation
};
