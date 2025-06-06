import { useState, useEffect } from "react";
import { 
    AppBar,        // Component navigation bar chính
    Toolbar,       // Container cho các elements trong AppBar
    Typography,    // Component hiển thị text
    FormControlLabel, // Label wrapper cho form controls
    Checkbox,      // Component checkbox
    Button,        // Component button
    Box           // Container component
} from "@mui/material";
import { AddAPhoto } from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import fetchModel, { authCheckSession, authLogout } from "../../lib/fetchModelData";

import "./styles.css";


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

    // useEffect để kiểm tra session khi component mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Gọi API để kiểm tra session
                const userData = await authCheckSession();
                if (userData && userData.login_name) {
                    setUser(userData);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.log('No active session');
            }
        };

        checkSession();
    }, [setUser, setIsLoggedIn]);

    useEffect(() => {
        const loadFallbackContext = async () => {
            const path = location.pathname;
            
            // Case 1: User detail page (/users/:id)
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
            } 
            // Case 2: User comments page (/comments/:id)
            else if (path.includes('/comments/')) {
                const userId = path.split('/')[2];
                try {
                    const user = await fetchModel(`/user/${userId}`);
                    if (user) {
                        setFallbackContext(`Comments by ${user.first_name} ${user.last_name}`);
                    }
                } catch (error) {
                    console.error('Error loading user for TopBar:', error);
                }
            } 
            // Case 3: Photos page (/photos/:userId/:photoId?)
            else if (path.includes('/photos/')) {
                const pathParts = path.split('/');
                const userId = pathParts[2];
                const photoId = pathParts[3]; // Optional: specific photo ID
                
                try {
                    const user = await fetchModel(`/user/${userId}`);
                    if (user) {
                        if (photoId) {
                            // Individual photo view - Hiển thị "Photo X of Y"
                            const photos = await fetchModel(`/photo/photosOfUser/${userId}`);
                            const photoIndex = photos ? photos.findIndex(p => p._id === photoId) : -1;
                            if (photoIndex !== -1) {
                                setFallbackContext(`Photo ${photoIndex + 1} of ${photos.length} - ${user.first_name} ${user.last_name}`);
                            } else {
                                setFallbackContext(`Photos of ${user.first_name} ${user.last_name}`);
                            }
                        } else {
                            // All photos view - Hiển thị "Photos of [User Name]"
                            setFallbackContext(`Photos of ${user.first_name} ${user.last_name}`);
                        }
                    }
                } catch (error) {
                    console.error('Error loading user for TopBar:', error);
                }
            } else {
                // Clear context cho các routes khác
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

                <Typography variant="h5" color="inherit" className="topbar-title">
                    Photo Sharing App
                </Typography>

                {isLoggedIn && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={advancedFeaturesEnabled}
                                onChange={handleAdvancedFeaturesToggle}
                            />
                        }
                        label="Advanced Features"
                        className="topbar-checkbox"
                    />
                )}

                {isLoggedIn ? (
                    <Box className="topbar-user-section">
                
                        <Button
                            color="inherit"
                            startIcon={<AddAPhoto />}
                            onClick={handleAddPhoto}
                            className="topbar-button"
                        >
                            Thêm ảnh
                        </Button>
                        
                        <Typography variant="h6" color="inherit">
                            Hello {user?.first_name}
                        </Typography>

                        {/* <Button
                            color="inherit"
                            onClick={() => navigate(`/user/edit/${user._id}`)}
                            className="edit-button"
                        >
                            Edit 
                        </Button> */}
                        
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            className="topbar-button"
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
                    <Typography variant="h6" color="inherit" className="topbar-context">
                        {displayContext}
                    </Typography>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
