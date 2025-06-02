import React, { useEffect, useState, useCallback } from "react";
import {
    Typography,        // Component hiển thị text
    Card,             // Component card container
    CardMedia,        // Component hiển thị media (ảnh)
    CardContent,      // Component nội dung card
    Box,              // Component container linh hoạt
    Divider,          // Component đường kẻ phân cách
    Avatar,           // Component avatar tròn
    Chip,             // Component chip hiển thị tag/label
    Paper,            // Component giấy có shadow
    CircularProgress, // Component loading spinner
    IconButton,       // Component button icon
    Button,           // Component button thường
    TextField,        // Component input text
    Alert            // Component thông báo lỗi/cảnh báo
} from "@mui/material";
// Import các icon từ Material-UI
import {
    ArrowBackIos,     // Icon mũi tên quay lại
    ArrowForwardIos,  // Icon mũi tên tiến tới
    ArrowBack,        // Icon back
    Send              // Icon gửi
} from "@mui/icons-material";
// Import React Router để điều hướng và lấy params từ URL
import { Link, useParams, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel, { addCommentToPhoto } from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";

/**
 * Component UserPhotos - Hiển thị danh sách ảnh của một user cụ thể
 * Hỗ trợ 2 chế độ xem: All Photos (hiển thị tất cả) và Single Photo Stepper (từng ảnh một)
 * Cho phép xem và thêm comment cho từng ảnh
 */
function UserPhotos() {
    // Lấy userId và photoId từ URL parameters thông qua React Router
    const { userId, photoId } = useParams();
    // Hook để điều hướng trang
    const navigate = useNavigate();
    // Lấy các giá trị từ global context
    const { setCurrentContext, advancedFeaturesEnabled, user: currentUser, isLoggedIn } = useAppContext();

    // State chính để lưu trữ dữ liệu
    const [user, setUser] = useState(null);              // Thông tin user sở hữu ảnh
    const [photos, setPhotos] = useState([]);           // Danh sách ảnh của user
    const [loading, setLoading] = useState(true);       // Trạng thái loading
    const [error, setError] = useState(null);           // Lưu lỗi nếu có
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // Index ảnh hiện tại (dùng cho chế độ stepper)

    // Comment form states - quản lý state riêng biệt cho từng ảnh
    // Sử dụng object với photoId làm key để tránh conflict giữa các form
    const [commentTexts, setCommentTexts] = useState({});    // Text input cho từng photo: {photoId: text}
    const [commentLoading, setCommentLoading] = useState({}); // Loading state cho từng photo: {photoId: boolean}
    const [commentErrors, setCommentErrors] = useState({});   // Error message cho từng photo: {photoId: errorMessage}

    // useEffect đầu tiên: Load dữ liệu user và photos khi component mount hoặc userId/photoId thay đổi
    useEffect(() => {
        // Hàm async để load dữ liệu từ API
        const loadUserAndPhotos = async () => {
            try {
                setLoading(true);

                // Load user data và photos song song để tối ưu performance
                const [userData, photosData] = await Promise.all([
                    fetchModel(`/user/${userId}`),                    // API lấy thông tin user
                    fetchModel(`/photo/photosOfUser/${userId}`)       // API lấy danh sách ảnh của user
                ]);

                // Cập nhật state với dữ liệu nhận được
                setUser(userData);
                setPhotos(photosData);
                setError(null);

                // Cập nhật context title hiển thị trên TopBar
                if (userData) {
                    setCurrentContext(`Photos of ${userData.first_name} ${userData.last_name}`);
                }

                // Nếu có photoId trong URL (chế độ single photo), tìm index tương ứng
                if (photoId && photosData && photosData.length > 0) {
                    const photoIndex = photosData.findIndex(photo => photo._id === photoId);
                    if (photoIndex !== -1) {
                        setCurrentPhotoIndex(photoIndex);
                    }
                }
            } catch (err) {
                setError('Failed to load photos');
                console.error('Error loading photos:', err);
            } finally {
                setLoading(false);
            }
        };

        // Chỉ load dữ liệu khi có userId
        if (userId) {
            loadUserAndPhotos();
        }

        // Cleanup function: reset context khi component unmount
        return () => setCurrentContext('');
    }, [userId, photoId, setCurrentContext]);

    // useEffect thứ hai: Đồng bộ URL với photo index trong chế độ advanced
    useEffect(() => {
        if (advancedFeaturesEnabled && photos.length > 0 && photos[currentPhotoIndex]) {
            const newPhotoId = photos[currentPhotoIndex]._id;
            const currentPath = `/photos/${userId}/${newPhotoId}`;
            // Chỉ navigate nếu URL hiện tại khác với URL mong muốn
            if (window.location.pathname !== currentPath) {
                navigate(currentPath, { replace: true }); // replace: true để không tạo history entry mới
            }
        }
    }, [currentPhotoIndex, photos, userId, navigate, advancedFeaturesEnabled]);

    /**
     * Hàm format thời gian từ string thành dạng dễ đọc
     * @param {string} dateTimeString - Chuỗi thời gian từ database
     * @returns {string} Thời gian đã format theo locale US
     */
    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
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
     * Xử lý chuyển đến ảnh trước đó (chế độ advanced)
     * Sử dụng useCallback để tối ưu performance, tránh re-render không cần thiết
     */
    const handlePreviousPhoto = useCallback(() => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(currentPhotoIndex - 1);
        }
    }, [currentPhotoIndex]);

    /**
     * Xử lý chuyển đến ảnh tiếp theo (chế độ advanced)
     * Sử dụng useCallback để tối ưu performance
     */
    const handleNextPhoto = useCallback(() => {
        if (currentPhotoIndex < photos.length - 1) {
            setCurrentPhotoIndex(currentPhotoIndex + 1);
        }
    }, [currentPhotoIndex, photos.length]);

    /**
     * Xử lý quay lại trang hiển thị tất cả ảnh
     */
    const handleBackToAllPhotos = () => {
        navigate(`/photos/${userId}`);
    };

    /**
     * Xử lý thêm comment mới cho một ảnh cụ thể
     * @param {string} photoIdToComment - ID của ảnh cần thêm comment
     */
    const handleAddComment = async (photoIdToComment) => {
        // Lấy text comment hiện tại cho ảnh này
        const currentText = commentTexts[photoIdToComment] || '';

        // Validation: Kiểm tra comment không rỗng
        if (!currentText.trim()) {
            setCommentErrors(prev => ({
                ...prev,
                [photoIdToComment]: 'Comment cannot be empty'
            }));
            return;
        }

        // Validation: Kiểm tra user đã đăng nhập
        if (!isLoggedIn || !currentUser) {
            setCommentErrors(prev => ({
                ...prev,
                [photoIdToComment]: 'You must be logged in to comment'
            }));
            return;
        }

        try {
            // Set loading state cho photo này
            setCommentLoading(prev => ({
                ...prev,
                [photoIdToComment]: true
            }));
            // Clear error cũ
            setCommentErrors(prev => ({
                ...prev,
                [photoIdToComment]: ''
            }));

            // Gọi API để thêm comment
            const newComment = await addCommentToPhoto(photoIdToComment, currentText.trim());

            // Cập nhật state photos để thêm comment mới vào danh sách
            setPhotos(prevPhotos => {
                return prevPhotos.map(photo => {
                    if (photo._id === photoIdToComment) {
                        return {
                            ...photo,
                            comments: [...photo.comments, newComment] // Thêm comment mới vào cuối array
                        };
                    }
                    return photo;
                });
            });

            // Xóa text trong form sau khi thêm thành công
            setCommentTexts(prev => ({
                ...prev,
                [photoIdToComment]: ''
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
            // Set error message nếu có lỗi
            setCommentErrors(prev => ({
                ...prev,
                [photoIdToComment]: error.message || 'Failed to add comment'
            }));
        } finally {
            // Tắt loading state
            setCommentLoading(prev => ({
                ...prev,
                [photoIdToComment]: false
            }));
        }
    };

    /**
     * Component con để hiển thị form thêm comment
     * @param {string} photoId - ID của ảnh cần comment
     */
    const CommentForm = ({ photoId }) => {
        // Lấy các state riêng cho ảnh này
        const currentText = commentTexts[photoId] || '';
        const currentError = commentErrors[photoId] || '';
        const isLoading = commentLoading[photoId] || false;

        /**
         * Xử lý thay đổi text trong textarea
         */
        const handleTextChange = (e) => {
            setCommentTexts(prev => ({
                ...prev,
                [photoId]: e.target.value
            }));

            // Clear error khi user bắt đầu nhập
            if (currentError) {
                setCommentErrors(prev => ({
                    ...prev,
                    [photoId]: ''
                }));
            }
        };

        // Nếu user chưa đăng nhập, hiển thị thông báo
        if (!isLoggedIn) {
            return (
                <Box className="login-prompt">
                    <Typography variant="body2" color="text.secondary">
                        Please <Link to="/login" className="text-inherit">log in</Link> to add a comment.
                    </Typography>
                </Box>
            );
        }

        // Form comment cho user đã đăng nhập
        return (
            <Box className="comment-form">
                <Typography variant="h6" gutterBottom>
                    Add a Comment
                </Typography>

                {/* Hiển thị error nếu có */}
                {currentError && (
                    <Alert severity="error" className="error-alert">
                        {currentError}
                    </Alert>
                )}

                {/* Container chính của form */}
                <Box className="comment-form-main">
                    {/* Avatar của user hiện tại */}
                    <Avatar className="comment-form-avatar">
                        {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
                    </Avatar>

                    {/* Form input và button */}
                    <Box className="comment-form-input">
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Write a comment..."
                            value={currentText}
                            onChange={handleTextChange}
                            disabled={isLoading}
                            variant="outlined"
                            size="small"
                            className="text-field"
                        />

                        {/* Button submit */}
                        <Box className="comment-form-submit">
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Send />}
                                onClick={() => handleAddComment(photoId)}
                                disabled={isLoading || !currentText.trim()}
                            >
                                {isLoading ? 'Posting...' : 'Post Comment'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    };

    // useEffect thứ ba: Thêm hỗ trợ điều khiển bàn phím cho chế độ advanced
    useEffect(() => {
        // Chỉ hoạt động trong chế độ advanced
        if (!advancedFeaturesEnabled) return;

        /**
         * Xử lý sự kiện nhấn phím
         * @param {KeyboardEvent} event - Sự kiện keyboard
         */
        const handleKeyPress = (event) => {
            // Mũi tên trái: chuyển về ảnh trước
            if (event.key === 'ArrowLeft' && currentPhotoIndex > 0) {
                handlePreviousPhoto();
            }
            // Mũi tên phải: chuyển đến ảnh tiếp theo
            else if (event.key === 'ArrowRight' && currentPhotoIndex < photos.length - 1) {
                handleNextPhoto();
            }
        };

        // Đăng ký event listener
        window.addEventListener('keydown', handleKeyPress);

        // Cleanup: Hủy đăng ký event listener khi component unmount hoặc dependencies thay đổi
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [advancedFeaturesEnabled, currentPhotoIndex, photos.length, handlePreviousPhoto, handleNextPhoto]);

    // Hiển thị loading spinner khi đang load dữ liệu
    if (loading) {
        return (
            <Box className="loading-container">
                <CircularProgress />
            </Box>
        );
    }

    // Hiển thị thông báo lỗi nếu có lỗi hoặc không tìm thấy user
    if (error || !user) {
        return (
            <Typography variant="h6" color="error" className="error-container">
                {error || 'User not found'}
            </Typography>
        );
    }

    // Hiển thị thông báo khi user không có ảnh nào
    if (!photos || photos.length === 0) {
        return (
            <Box className="user-photos-container">
                <Typography variant="h5" gutterBottom>
                    {user.first_name} {user.last_name}'s Photos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    No photos available for this user.
                </Typography>
            </Box>
        );
    }

    // Advanced Features: Single Photo Stepper View - Chế độ xem từng ảnh một
    if (advancedFeaturesEnabled) {
        const currentPhoto = photos[currentPhotoIndex];
        const isFirstPhoto = currentPhotoIndex === 0;
        const isLastPhoto = currentPhotoIndex === photos.length - 1;

        return (
            <Box className="user-photos-container">
                {/* Header với back button và thông tin navigation */}
                <Box className="advanced-header">
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBackToAllPhotos}
                        className="back-button"
                    >
                        Back to All Photos
                    </Button>
                    <Typography variant="h5" className="title">
                        {user.first_name} {user.last_name}'s Photos
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        {currentPhotoIndex + 1} of {photos.length}
                    </Typography>
                </Box>

                {/* Photo navigation controls - Các nút điều khiển navigation */}
                <Box className="photo-navigation">
                    <IconButton
                        onClick={handlePreviousPhoto}
                        disabled={isFirstPhoto}
                        className="nav-button-left"
                    >
                        <ArrowBackIos />
                    </IconButton>

                    <Box className="nav-info">
                        <Typography variant="body2" color="text.secondary">
                            Use arrow buttons or browser back/forward to navigate
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={handleNextPhoto}
                        disabled={isLastPhoto}
                        className="nav-button-right"
                    >
                        <ArrowForwardIos />
                    </IconButton>
                </Box>

                {/* Current photo display - Hiển thị ảnh hiện tại trong chế độ advanced */}
                <Card>
                    {/* CardMedia: Component hiển thị ảnh chính */}
                    <CardMedia
                        component="img"                              // Sử dụng img tag để hiển thị ảnh
                        image={currentPhoto.file_name}               // Đường dẫn đến file ảnh
                        alt={`Photo by ${user.first_name} ${user.last_name}`}  // Alt text cho accessibility
                        className="photo-media"
                    />
                    <CardContent>
                        {/* Hiển thị thời gian chụp ảnh dưới dạng chip */}
                        <Box className="photo-info">
                            <Chip
                                label={formatDateTime(currentPhoto.date_time)}  // Text hiển thị thời gian đã format
                                size="small"                                     // Kích thước nhỏ
                                color="primary"                                  // Màu primary theme
                                variant="outlined"                               // Style viền, không fill
                            />
                        </Box>

                        {/* Section hiển thị danh sách comments - chỉ hiển thị khi có comment */}
                        {currentPhoto.comments && currentPhoto.comments.length > 0 && (
                            <Box className="comments-section">
                                {/* Header của section comments với số lượng */}
                                <Typography variant="h6" gutterBottom>
                                    Comments ({currentPhoto.comments.length})
                                </Typography>

                                {/* Map qua từng comment để hiển thị */}
                                {currentPhoto.comments.map((comment, index) => (
                                    <Box key={comment._id} className="comment-item">
                                        {/* Paper container cho từng comment với shadow nhẹ */}
                                        <Paper elevation={1} className="comment-paper">
                                            {/* Header của comment: avatar + tên user + thời gian */}
                                            <Box className="comment-header">
                                                {/* Avatar hiển thị chữ cái đầu của họ tên */}
                                                <Avatar className="comment-avatar">
                                                    {comment.user.first_name[0]}{comment.user.last_name[0]}
                                                </Avatar>
                                                {/* Container cho thông tin user */}
                                                <Box className="comment-user-info">
                                                    {/* Tên user - clickable link đến trang user */}
                                                    <Typography
                                                        variant="subtitle2"
                                                        component={Link}         // Sử dụng React Router Link
                                                        to={`/users/${comment.user._id}`}  // URL đến trang user
                                                        className="comment-user-link"
                                                    >
                                                        {comment.user.first_name} {comment.user.last_name}
                                                    </Typography>
                                                    {/* Thời gian comment - hiển thị nhỏ và mờ */}
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDateTime(comment.date_time)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {/* Nội dung comment */}
                                            <Typography variant="body2">
                                                {comment.comment}
                                            </Typography>
                                        </Paper>
                                        {/* Divider giữa các comments - không hiển thị sau comment cuối */}
                                        {index < currentPhoto.comments.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Form thêm comment mới - sử dụng component con CommentForm */}
                        <CommentForm photoId={currentPhoto._id} />
                    </CardContent>
                </Card>
            </Box>
        );
    }

    // Normal Mode: All Photos View - Chế độ hiển thị tất cả ảnh (chế độ mặc định)
    return (
        <Box className="user-photos-container">
            {/* Title hiển thị tên user */}
            <Typography variant="h5" gutterBottom>
                {user.first_name} {user.last_name}'s Photos
            </Typography>

            {/* Map qua tất cả photos để hiển thị dưới dạng danh sách dọc */}
            {photos.map((photo) => (
                <Card key={photo._id} className="photo-card">        {/* Mỗi ảnh trong một Card riêng với margin bottom */}
                    {/* CardMedia: Hiển thị ảnh chính */}
                    <CardMedia
                        component="img"                              // Sử dụng img element
                        image={photo.file_name}                      // Đường dẫn file ảnh
                        alt={`Photo by ${user.first_name} ${user.last_name}`}  // Alt text cho screen reader
                        className="photo-media"
                    />
                    {/* CardContent: Chứa thông tin và comments của ảnh */}
                    <CardContent>
                        {/* Box chứa chip thời gian */}
                        <Box className="photo-info">
                            <Chip
                                label={formatDateTime(photo.date_time)}     // Hiển thị thời gian đã format
                                size="small"                                 // Kích thước nhỏ
                                color="primary"                              // Màu chủ đạo
                                variant="outlined"                           // Style có viền
                            />
                        </Box>

                        {/* Section comments - chỉ hiển thị khi ảnh có comments */}
                        {photo.comments && photo.comments.length > 0 && (
                            <Box className="comments-section">
                                {/* Header section comments với số lượng */}
                                <Typography variant="h6" gutterBottom>
                                    Comments ({photo.comments.length})
                                </Typography>

                                {/* Render từng comment */}
                                {photo.comments.map((comment, index) => (
                                    <Box key={comment._id} className="comment-item">             {/* Container cho mỗi comment */}
                                        {/* Paper wrapper tạo background và shadow cho comment */}
                                        <Paper elevation={1} className="comment-paper">
                                            {/* Header comment: Avatar + User info + Time */}
                                            <Box className="comment-header">
                                                {/* Avatar tròn với chữ cái đầu họ tên */}
                                                <Avatar className="comment-avatar">
                                                    {comment.user.first_name[0]}{comment.user.last_name[0]}
                                                </Avatar>
                                                {/* Container cho thông tin user (tên + thời gian) */}
                                                <Box className="comment-user-info">
                                                    {/* Tên user - là link điều hướng đến trang user */}
                                                    <Typography
                                                        variant="subtitle2"          // Font weight đậm, size vừa
                                                        component={Link}             // Sử dụng React Router Link
                                                        to={`/users/${comment.user._id}`}  // URL đến trang chi tiết user
                                                        className="comment-user-link"
                                                    >
                                                        {comment.user.first_name} {comment.user.last_name}
                                                    </Typography>
                                                    {/* Thời gian comment - hiển thị nhỏ và mờ */}
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDateTime(comment.date_time)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {/* Nội dung chính của comment */}
                                            <Typography variant="body2">
                                                {comment.comment}
                                            </Typography>
                                        </Paper>
                                        {/* Divider ngăn cách giữa các comments - không hiển thị sau comment cuối */}
                                        {index < photo.comments.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Form thêm comment mới - sử dụng component con đã định nghĩa ở trên */}
                        <CommentForm photoId={photo._id} />
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}

// Export component để có thể import và sử dụng ở nơi khác
export default UserPhotos;
