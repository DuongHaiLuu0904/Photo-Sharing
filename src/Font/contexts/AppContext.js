import { createContext, useContext, useState, useEffect } from "react";
import { authCheckSession, getToken } from "../lib/fetchModelData";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentContext, setCurrentContext] = useState("");
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app initialization
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = getToken();
        if (token) {
          // Verify token with server
          const userData = await authCheckSession();
          if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
          } else {
            // Token is invalid, clear it
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentContext,
        setCurrentContext,
        advancedFeaturesEnabled,
        setAdvancedFeaturesEnabled,
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
