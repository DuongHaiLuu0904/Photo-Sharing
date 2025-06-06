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


/**
 * TopBar component - Navigation bar chính của ứng dụng
 * Component này hiển thị:
 * - Tiêu đề ứng dụng
 * - Context hiện tại (trang đang xem)
 * - Checkbox để bật/tắt advanced features
 * - Thông tin user và nút logout (khi đã đăng nhập)
 * - Nút thêm ảnh (khi đã đăng nhập)
 */
function TopBar() {
    // Lấy các state và functions từ global context
    const {
        currentContext,              // Context hiện tại được set bởi các components
        advancedFeaturesEnabled,     // Trạng thái advanced features
        setAdvancedFeaturesEnabled,  // Function để toggle advanced features
        user,                        // Thông tin user hiện tại
        isLoggedIn,                  // Trạng thái đăng nhập
        setUser,                     // Function để set user
        setIsLoggedIn                // Function để set trạng thái đăng nhập
    } = useAppContext();
    
    // Hook để lấy thông tin location hiện tại
    const location = useLocation();
    
    // Hook để navigate programmatically
    const navigate = useNavigate();
    
    // State để lưu context fallback khi currentContext chưa được set
    const [fallbackContext, setFallbackContext] = useState('');

    // useEffect để kiểm tra session khi component mount
    useEffect(() => {
        /**
         * Function để kiểm tra xem user đã đăng nhập chưa
         * Gọi API để validate session hiện tại
         */
        const checkSession = async () => {
            try {
                // Gọi API để kiểm tra session
                const userData = await authCheckSession();
                if (userData && userData.login_name) {
                    // Nếu có session hợp lệ, set user state
                    setUser(userData);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                // Không có session active, điều này bình thường
                console.log('No active session');
            }
        };

        checkSession();
    }, [setUser, setIsLoggedIn]);

    // useEffect để load fallback context dựa trên URL
    useEffect(() => {
        /**
         * Function để load context fallback khi components chưa set context
         * Parse URL để xác định context phù hợp:
         * - /users/:id -> Tên user
         * - /comments/:id -> "Comments by [User Name]"
         * - /photos/:userId/:photoId? -> "Photos of [User Name]" hoặc "Photo X of Y"
         */
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

        // Chỉ load fallback context khi:
        // 1. Không có currentContext từ components
        // 2. User đã đăng nhập
        if (!currentContext && isLoggedIn) {
            loadFallbackContext();
        }
    }, [location.pathname, currentContext, isLoggedIn]);

    // Chọn context để hiển thị: currentContext có priority cao hơn fallbackContext
    const displayContext = currentContext || fallbackContext;

    /**
     * Handler function để toggle advanced features
     * @param {Event} event - Event từ checkbox
     */
    const handleAdvancedFeaturesToggle = (event) => {
        setAdvancedFeaturesEnabled(event.target.checked);
    };

    /**
     * Handler function để logout user
     * Gọi API logout và clear user state
     */
    const handleLogout = async () => {
        try {
            // Gọi API để logout trên server
            await authLogout();
            // Clear user state
            setUser(null);
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Logout failed:', error);
            // Vẫn clear user state ngay cả khi API call thất bại
            setUser(null);
            setIsLoggedIn(false);
        }
    };

    /**
     * Handler function để navigate đến trang upload photo
     */
    const handleAddPhoto = () => {
        navigate('/upload-photo');
    };


    return (
        <AppBar className="topbar-appBar" position="absolute">
            <Toolbar>

                <Typography variant="h5" color="inherit" className="topbar-title">
                    Photo Sharing App
                </Typography>

                {/* Advanced Features checkbox - Chỉ hiển thị khi đã đăng nhập */}
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
