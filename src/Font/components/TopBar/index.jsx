import { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, FormControlLabel, Checkbox, Button, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { AddAPhoto } from "@mui/icons-material";

import "./styles.css";
import { useAppContext } from "../../contexts/AppContext";
import fetchModel, { authCheckSession, authLogout } from "../../lib/fetchModelData";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar() {
  const {
    currentContext,
    advancedFeaturesEnabled,
    setAdvancedFeaturesEnabled,
    user,
    isLoggedIn,
    setUser,
    setIsLoggedIn
  } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [fallbackContext, setFallbackContext] = useState('');

  useEffect(() => {
    // Check if user is already logged in on component mount
    const checkSession = async () => {
      try {
        const userData = await authCheckSession();
        if (userData && userData.login_name) {
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        // User not logged in, which is fine
        console.log('No active session');
      }
    };

    checkSession();
  }, [setUser, setIsLoggedIn]);

  useEffect(() => {
    // Fallback context loading for when components haven't set context yet
    const loadFallbackContext = async () => {
      const path = location.pathname;
      if (path.startsWith('/users/') && !path.includes('photos')) {
        const userId = path.split('/')[2];
        try {
          const user = await fetchModel(`/user/${userId}`);
          if (user) {
            setFallbackContext(`${user.first_name} ${user.last_name}`);
          }
        } catch (error) {
          console.error('Error loading user for TopBar:', error);
        }
      } else if (path.includes('/comments/')) {
        const userId = path.split('/')[2];
        try {
          const user = await fetchModel(`/user/${userId}`);
          if (user) {
            setFallbackContext(`Comments by ${user.first_name} ${user.last_name}`);
          }
        } catch (error) {
          console.error('Error loading user for TopBar:', error);
        }
      } else if (path.includes('/photos/')) {
        const pathParts = path.split('/');
        const userId = pathParts[2];
        const photoId = pathParts[3];
        try {
          const user = await fetchModel(`/user/${userId}`);
          if (user) {
            if (photoId) {
              // Individual photo view
              const photos = await fetchModel(`/photo/photosOfUser/${userId}`);
              const photoIndex = photos ? photos.findIndex(p => p._id === photoId) : -1;
              if (photoIndex !== -1) {
                setFallbackContext(`Photo ${photoIndex + 1} of ${photos.length} - ${user.first_name} ${user.last_name}`);
              } else {
                setFallbackContext(`Photos of ${user.first_name} ${user.last_name}`);
              }
            } else {
              // All photos view
              setFallbackContext(`Photos of ${user.first_name} ${user.last_name}`);
            }
          }
        } catch (error) {
          console.error('Error loading user for TopBar:', error);
        }
      } else {
        setFallbackContext('');
      }
    };

    if (!currentContext && isLoggedIn) {
      loadFallbackContext();
    }
  }, [location.pathname, currentContext, isLoggedIn]);

  const displayContext = currentContext || fallbackContext;

  const handleAdvancedFeaturesToggle = (event) => {
    setAdvancedFeaturesEnabled(event.target.checked);
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear the user state even if the request fails
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const handleAddPhoto = () => {
    navigate('/upload-photo');
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
          Photo Sharing App
        </Typography>

        {isLoggedIn && (
          <FormControlLabel
            control={
              <Checkbox
                checked={advancedFeaturesEnabled}
                onChange={handleAdvancedFeaturesToggle}
                sx={{
                  color: 'white',
                  '&.Mui-checked': {
                    color: 'white',
                  },
                }}
              />
            }
            label="Advanced Features"
            sx={{
              color: 'white',
              marginRight: 2
            }}
          />
        )}

        {isLoggedIn ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<AddAPhoto />}
              onClick={handleAddPhoto}
              sx={{
                border: '1px solid white',
                borderRadius: 1
              }}
            >
              Thêm ảnh
            </Button>
            <Typography variant="h6" color="inherit">
              Hello {user?.first_name}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                border: '1px solid white',
                borderRadius: 1
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Typography variant="h6" color="inherit">
            Please Login
          </Typography>
        )}

        {isLoggedIn && displayContext && (
          <Typography variant="h6" color="inherit" sx={{ marginLeft: 2 }}>
            {displayContext}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
