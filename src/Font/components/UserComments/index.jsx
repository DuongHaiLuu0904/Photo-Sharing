
// Import React hooks để quản lý state và side effects
import React, { useEffect, useState } from "react";

// Import các components Material-UI cho giao diện
import {
    Typography,    // Component hiển thị text với các style khác nhau
    Card,         // Component card container
    CardContent,  // Nội dung bên trong card
    Box,          // Container flex box
    Avatar,       // Component hiển thị avatar tròn
    Paper,        // Component có background và shadow
    CircularProgress, // Component loading spinner
    Grid,         // Component layout grid system
    CardMedia,    // Component hiển thị media (hình ảnh)
    Chip          // Component hiển thị label nhỏ
} from "@mui/material";

// Import router hooks để điều hướng và lấy params từ URL
import { Link, useParams } from "react-router-dom";

// Import file CSS cho styling
import "./styles.css";

// Import utility function để fetch data từ API
import fetchModel from "../../lib/fetchModelData";

// Import context để truy cập global state
import { useAppContext } from "../../contexts/AppContext";


/**
 * Component UserComments - Hiển thị tất cả comments của một user cụ thể
 * Component này cho phép xem danh sách tất cả comments mà một user đã viết
 * trên các photos khác nhau trong hệ thống
 */
function UserComments() {
    // Lấy userId từ URL parameters (ví dụ: /usercomments/123 -> userId = 123)
    const { userId } = useParams();
    
    // Lấy functions và state từ global context
    const { setCurrentContext, advancedFeaturesEnabled } = useAppContext();
    
    // State để lưu thông tin user hiện tại
    const [user, setUser] = useState(null);
    
    // State để lưu danh sách tất cả comments của user
    const [comments, setComments] = useState([]);
    
    // State để theo dõi trạng thái loading
    const [loading, setLoading] = useState(true);
    
    // State để lưu thông báo lỗi (nếu có)
    const [error, setError] = useState(null);    // useEffect hook chạy khi component mount và khi userId thay đổi
    useEffect(() => {
        /**
         * Function async để load tất cả comments của user
         * Thực hiện các bước sau:
         * 1. Load thông tin user
         * 2. Load tất cả users trong hệ thống
         * 3. Duyệt qua tất cả photos của mỗi user
         * 4. Tìm comments được viết bởi userId đang xem
         * 5. Gom tất cả comments lại và sort theo thời gian
         */
        const loadUserComments = async () => {
            try {
                // Bật trạng thái loading
                setLoading(true);

                // Bước 1: Load thông tin chi tiết của user hiện tại
                const userData = await fetchModel(`/user/${userId}`);
                setUser(userData);

                // Nếu load user thành công, cập nhật context title
                if (userData) {
                    setCurrentContext(`Comments by ${userData.first_name} ${userData.last_name}`);
                }

                // Bước 2: Load danh sách tất cả users trong hệ thống
                const allUsers = await fetchModel('/user/list');
                const allComments = [];

                // Bước 3 & 4: Duyệt qua từng user để tìm comments của userId
                // Vì comments được lưu trong từng photo, ta phải duyệt tất cả photos
                for (const user of allUsers) {
                    try {
                        // Load tất cả photos của user này
                        const userPhotos = await fetchModel(`/photo/photosOfUser/${user._id}`);
                        
                        // Nếu user có photos
                        if (userPhotos && userPhotos.length > 0) {
                            // Duyệt qua từng photo
                            userPhotos.forEach(photo => {
                                // Nếu photo có comments
                                if (photo.comments && photo.comments.length > 0) {
                                    // Duyệt qua từng comment trong photo
                                    photo.comments.forEach(comment => {
                                        // Nếu comment được viết bởi userId đang tìm
                                        if (comment.user._id === userId) {
                                            // Thêm comment vào danh sách kết quả
                                            // Bao gồm cả thông tin photo để hiển thị thumbnail
                                            allComments.push({
                                                ...comment,
                                                photo: {
                                                    _id: photo._id,
                                                    file_name: photo.file_name,
                                                    date_time: photo.date_time,
                                                    user_id: photo.user_id
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    } catch (err) {
                        // Log lỗi nhưng tiếp tục với user tiếp theo
                        console.error(`Error loading photos for user ${user._id}:`, err);
                    }
                }

                // Bước 5: Sắp xếp comments theo thời gian (mới nhất trước)
                allComments.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
                setComments(allComments);

                // Clear lỗi nếu load thành công
                setError(null);
            } catch (err) {
                // Xử lý lỗi và hiển thị thông báo
                setError('Failed to load user comments');
                console.error('Error loading user comments:', err);
            } finally {
                // Luôn tắt loading khi hoàn thành (thành công hay thất bại)
                setLoading(false);
            }
        };

        // Chỉ load data khi có userId
        if (userId) {
            loadUserComments();
        }        // Cleanup function: reset context khi component unmount
        return () => setCurrentContext('');
    }, [userId, setCurrentContext]); // Dependencies: chạy lại khi userId hoặc setCurrentContext thay đổi

    /**
     * Function helper để format ngày giờ thành chuỗi dễ đọc
     * @param {string} dateTimeString - Chuỗi ngày giờ từ database
     * @returns {string} - Chuỗi ngày giờ đã được format
     */
    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        // Format theo định dạng: "Month Day, Year at Hour:Minute AM/PM"
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    /**
     * Function helper để tạo link xem photo dựa trên cấu hình advanced features
     * @param {Object} photo - Object chứa thông tin photo
     * @returns {string} - URL để navigate đến photo
     */
    const getPhotoViewLink = (photo) => {
        // Nếu advanced features được bật, link đến photo cụ thể trong stepper view
        if (advancedFeaturesEnabled) {
            return `/photos/${photo.user_id}/${photo._id}`;
        }
        // Ngược lại, chỉ link đến trang photos của user
        return `/photos/${photo.user_id}`;
    };    // Render loading state - Hiển thị spinner khi đang load data
    if (loading) {
        return (
            <Box className="loading-container">
                <CircularProgress />
            </Box>
        );
    }
    
    // Render error state - Hiển thị lỗi khi không load được data hoặc không tìm thấy user
    if (error || !user) {
        return (
            <Typography variant="h6" color="error" className="error-message">
                {error || 'User not found'}
            </Typography>
        );
    }
    
    // Render empty state - Hiển thị thông báo khi user chưa có comment nào
    if (!comments || comments.length === 0) {
        return (
            <Box className="no-comments-container">
                <Typography variant="h5" gutterBottom>
                    Comments by {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    This user hasn't made any comments yet.
                </Typography>
            </Box>
        );
    }
    
    // Render main content - Hiển thị danh sách comments khi có data
    return (
        <Box className="main-container">
            {/* Header với tên user và số lượng comments */}
            <Typography variant="h5" gutterBottom>
                Comments by {user.first_name} {user.last_name}
            </Typography>

            <Typography variant="body2" color="text.secondary" className="comments-count">
                Total comments: {comments.length}
            </Typography>
            
            {/* Danh sách comments - Map qua từng comment và render card */}
            {comments.map((comment) => (
                <Card key={`${comment.photo._id}-${comment._id}`} className="individual-comment-card">
                    <CardContent>
                        <Grid container spacing={2}>
                            {/* Cột trái: Photo thumbnail */}
                            <Grid item xs={12} sm={3}>
                                <Link
                                    to={getPhotoViewLink(comment.photo)}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={comment.photo.file_name}
                                        alt="Photo thumbnail"
                                        className="photo-thumbnail"
                                    />
                                </Link>
                            </Grid>

                            {/* Cột phải: Comment content */}
                            <Grid item xs={12} sm={9}>
                                <Box>
                                    {/* Header của comment: Avatar, tên user, thời gian */}
                                    <Box className="comment-header">
                                        <Avatar className="user-avatar">
                                            {user.first_name[0]}{user.last_name[0]}
                                        </Avatar>
                                        <Typography variant="subtitle2" className="user-name">
                                            {user.first_name} {user.last_name}
                                        </Typography>
                                        <Chip
                                            label={formatDateTime(comment.date_time)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>

                                    {/* Nội dung comment trong Paper có thể click */}
                                    <Link
                                        to={getPhotoViewLink(comment.photo)}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Paper
                                            elevation={1}
                                            className="comment-paper"
                                        >
                                            <Typography variant="body1">
                                                {comment.comment}
                                            </Typography>
                                        </Paper>
                                    </Link>
                                    
                                    {/* Hint text để người dùng biết có thể click */}
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        className="view-photo-hint"
                                    >
                                        Click to view photo and all comments
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}

// Export component để sử dụng ở nơi khác
export default UserComments;
