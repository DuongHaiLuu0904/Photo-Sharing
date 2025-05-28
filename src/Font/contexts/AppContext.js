import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentContext, setCurrentContext] = useState('');
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AppContext.Provider value={{ 
      currentContext, 
      setCurrentContext, 
      advancedFeaturesEnabled, 
      setAdvancedFeaturesEnabled,
      user,
      setUser,
      isLoggedIn,
      setIsLoggedIn
    }}>
      {children}
    </AppContext.Provider>
  );
};
