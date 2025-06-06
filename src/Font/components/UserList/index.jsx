import React, { useState, useEffect } from "react";
import {
    Divider,         // Component đường kẻ phân cách
    List,            // Component danh sách chính
    ListItem,        // Component item trong danh sách
    ListItemButton,  // Component button có thể click trong list item
    ListItemText,    // Component text hiển thị trong list item
    Typography,      // Component hiển thị text với các variant khác nhau
    CircularProgress, // Component loading spinner tròn
    Box,             // Component container linh hoạt
    Chip,            // Component chip hiển thị số liệu thống kê
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";

/**
 * Component UserList - Hiển thị danh sách tất cả users trong hệ thống
 * Bao gồm thống kê số ảnh và số comment của mỗi user
 * Chỉ hiển thị khi user đã đăng nhập
 */
function UserList() {
    const { isLoggedIn } = useAppContext();
 
    const [users, setUsers] = useState([]);          
    const [userStats, setUserStats] = useState({});   // Thống kê cho từng user: {userId: {photoCount, commentCount}}
    const [loading, setLoading] = useState(true);    
    const [error, setError] = useState(null);        
    
    const location = useLocation();

    useEffect(() => {
        const loadUsersAndStats = async () => {
            // Nếu user chưa đăng nhập, dừng loading và không load dữ liệu
            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Gọi API để lấy danh sách tất cả users
                const userData = await fetchModel('/user/list');
                setUsers(userData);

                // Khởi tạo object để lưu thống kê của từng user
                const stats = {};

                // Bước 1: Lấy tất cả photos của tất cả users song song để tối ưu performance
                const allPhotosData = await Promise.all(
                    userData.map(async (user) => {
                        try {
                            // Gọi API lấy photos của từng user
                            const photos = await fetchModel(`/photo/photosOfUser/${user._id}`);
                            return { userId: user._id, photos: photos || [] };
                        } catch (err) {
                            // Nếu có lỗi với user nào đó, log lỗi nhưng vẫn tiếp tục với user khác
                            console.error(`Error loading photos for user ${user._id}:`, err);
                            return { userId: user._id, photos: [] };
                        }
                    })
                );

                // Bước 2: Tính toán thống kê cho từng user
                userData.forEach(user => {
                    // Đếm số lượng photos của user này
                    const userPhotoData = allPhotosData.find(data => data.userId === user._id);
                    const photoCount = userPhotoData ? userPhotoData.photos.length : 0;

                    // Đếm số lượng comments mà user này đã viết trên tất cả photos (của tất cả users)
                    let commentCount = 0;
                    allPhotosData.forEach(photoData => {
                        photoData.photos.forEach(photo => {
                            if (photo.comments) {
                                // Filter comments của user hiện tại
                                const userComments = photo.comments.filter(comment => comment.user._id === user._id);
                                commentCount += userComments.length;
                            }
                        });
                    });

                    stats[user._id] = {
                        photoCount,      // Số lượng photos của user
                        commentCount     // Số lượng comments user đã viết
                    };
                });

                setUserStats(stats);
                setError(null); 
            } catch (err) {
                setError('Failed to load users');
                console.error('Error loading users:', err);
            } finally {
                setLoading(false);
            }
        };

        // Gọi hàm load dữ liệu
        loadUsersAndStats();
    }, [isLoggedIn]); // Dependencies: chỉ chạy lại khi isLoggedIn thay đổi

    // Hiển thị loading spinner khi đang tải dữ liệu
    if (loading) {
        return (
            <Box className="loading-container">
                <CircularProgress />
            </Box>
        );
    }

    // Hiển thị thông báo yêu cầu đăng nhập khi user chưa đăng nhập
    if (!isLoggedIn) {
        return (
            <Typography variant="body1" className="login-message">
                Please login to view users
            </Typography>
        );
    }

    // Hiển thị error message khi có lỗi xảy ra
    if (error) {
        return (
            <Typography variant="body1" color="error" className="error-message">
                {error}
            </Typography>
        );
    }

    return (
        <div>
            {/* Header title cho danh sách users */}
            <Typography variant="h6" className="header-title">
                Users
            </Typography>
            
            {/* List component chính chứa tất cả users */}
            <List component="nav">
                {/* Map qua từng user để render list item */}
                {users.map((user, index) => {
                    // Lấy thống kê cho user hiện tại, fallback về 0 nếu chưa có
                    const stats = userStats[user._id] || { photoCount: 0, commentCount: 0 };

                    return (
                        <React.Fragment key={user._id}>
                            {/* ListItem container cho mỗi user */}
                            <ListItem disablePadding>
                                {/* ListItemButton: Có thể click để navigate đến trang user detail */}
                                <ListItemButton
                                    component={Link}                                
                                    to={`/users/${user._id}`}                        
                                    selected={location.pathname.includes(user._id)}
                                    className="list-item-button"                      
                                >
                                    {/* Text hiển thị tên và location của user */}
                                    <ListItemText
                                        primary={`${user.first_name} ${user.last_name}`}  
                                        secondary={user.location}                         
                                    />

                                    {/* Container chứa các chips thống kê */}
                                    <Box className="stats-container">
                                        {/* Chip hiển thị số lượng photos - màu xanh */}
                                        <Chip
                                            label={stats.photoCount}                   // Hiển thị số lượng photos
                                            size="small"                               
                                            className="photo-chip"                    
                                            title={`${stats.photoCount} photos`}     
                                        />

                                        {/* Chip hiển thị số lượng comments - màu đỏ, có thể click */}
                                        <Chip
                                            label={stats.commentCount}              
                                            size="small"                              
                                            component={Link}                          
                                            to={`/comments/${user._id}`}              
                                            clickable                                  
                                            className="comment-chip"                   
                                            title={`${stats.commentCount} comments - Click to view`} 
                                            onClick={(e) => {
                                                e.preventDefault();                    
                                                e.stopPropagation();                  
                                                window.location.href = `/comments/${user._id}`; 
                                            }}
                                        />
                                    </Box>
                                </ListItemButton>
                            </ListItem>
                            {/* Divider ngăn cách giữa các list items - không hiển thị sau item cuối */}
                            {index < users.length - 1 && <Divider />}
                        </React.Fragment>
                    );
                })}
            </List>
        </div>
    );
}

export default UserList;
