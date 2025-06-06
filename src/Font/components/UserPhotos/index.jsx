import { useEffect, useState, useCallback } from "react";
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
    Alert,           // Component thông báo lỗi/cảnh báo
    Icon
} from "@mui/material";
import {
    ArrowBackIos,     // Icon mũi tên quay lại
    ArrowForwardIos,  // Icon mũi tên tiến tới
    Send,              // Icon gửi
    Delete,
    ThumbUp as ThumbUpICon, // Icon like
    ThumbDown as ThumbDownIcon // Icon dislike
} from "@mui/icons-material";
import { Link, useParams, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel, { addCommentToPhoto, deletePhoto, updateDislike, updateLike } from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";


const CommentForm = ({
    photoId,
    commentTexts,
    setCommentTexts,
    commentErrors,
    setCommentErrors,
    commentLoading,
    handleAddComment,
    isLoggedIn,
    currentUser
}) => {
    // Lấy các state riêng cho ảnh này
    const currentText = commentTexts[photoId] || '';
    const currentError = commentErrors[photoId] || '';
    const isLoading = commentLoading[photoId] || false;

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

function UserPhotos() {
    const { userId, photoId } = useParams();
    const navigate = useNavigate();
    const { setCurrentContext, advancedFeaturesEnabled, user: currentUser, isLoggedIn } = useAppContext();

    const [user, setUser] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const [like, setLike] = useState({});
    const [dislike, setDislike] = useState({});
    const [userLiked, setUserLiked] = useState({});
    const [userDisliked, setUserDisliked] = useState({});

    const [commentTexts, setCommentTexts] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const [commentErrors, setCommentErrors] = useState({});

    // useEffect đầu tiên: Load dữ liệu user và photos khi component mount hoặc userId/photoId thay đổi
    useEffect(() => {
        // Hàm async để load dữ liệu từ API
        const loadUserAndPhotos = async () => {
            try {
                setLoading(true);

                const [userData, photosData] = await Promise.all([
                    fetchModel(`/user/${userId}`),
                    fetchModel(`/photo/photosOfUser/${userId}`)
                ]);

                setUser(userData);
                setPhotos(photosData);
                setError(null);

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
        return () => setCurrentContext('');
    }, [userId, photoId, setCurrentContext]);

    // useEffect thứ hai: Đồng bộ URL với photo index trong chế độ advanced
    useEffect(() => {
        if (advancedFeaturesEnabled && photos.length > 0 && photos[currentPhotoIndex]) {
            const newPhotoId = photos[currentPhotoIndex]._id;
            const currentPath = `/photos/${userId}/${newPhotoId}`;

            if (window.location.pathname !== currentPath) {
                navigate(currentPath, { replace: true });
            }
        }
    }, [currentPhotoIndex, photos, userId, navigate, advancedFeaturesEnabled]);


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

    const handlePreviousPhoto = useCallback(() => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(currentPhotoIndex - 1);
        }
    }, [currentPhotoIndex]);


    const handleNextPhoto = useCallback(() => {
        if (currentPhotoIndex < photos.length - 1) {
            setCurrentPhotoIndex(currentPhotoIndex + 1);
        }
    }, [currentPhotoIndex, photos.length]);

    const handleAddComment = async (photoIdToComment) => {
        const currentText = commentTexts[photoIdToComment] || '';

        if (!currentText.trim()) {
            setCommentErrors(prev => ({
                ...prev,
                [photoIdToComment]: 'Comment cannot be empty'
            }));
            return;
        }

        if (!isLoggedIn || !currentUser) {
            setCommentErrors(prev => ({
                ...prev,
                [photoIdToComment]: 'You must be logged in to comment'
            }));
            return;
        }

        try {
            setCommentLoading(prev => ({
                ...prev,
                [photoIdToComment]: true
            }));

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
                            comments: [...photo.comments, newComment]
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
            setCommentErrors(prev => ({
                ...prev,
                [photoIdToComment]: error.message || 'Failed to add comment'
            }));
        } finally {
            setCommentLoading(prev => ({
                ...prev,
                [photoIdToComment]: false
            }));
        }
    };

    // useEffect thứ ba: Thêm hỗ trợ điều khiển bàn phím cho chế độ advanced
    useEffect(() => {
        if (!advancedFeaturesEnabled) return;

        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft' && currentPhotoIndex > 0) {
                handlePreviousPhoto();
            }
            else if (event.key === 'ArrowRight' && currentPhotoIndex < photos.length - 1) {
                handleNextPhoto();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // Cleanup: Hủy đăng ký event listener khi component unmount hoặc dependencies thay đổi
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [advancedFeaturesEnabled, currentPhotoIndex, photos.length, handlePreviousPhoto, handleNextPhoto]);

    const handleDeletePhoto = async (photoIdToDelete) => {
        if (!isLoggedIn || !currentUser) {
            setError('You must be logged in to delete a photo');
            return;
        }
        try {
            await deletePhoto(photoIdToDelete);
            setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoIdToDelete));
            setCurrentPhotoIndex(0); // Reset index after deletion
            setError(null);
        } catch (err) {
            console.error('Error deleting photo:', err);
            setError('Failed to delete photo');
        }
    };   
    
    // useEffect thứ tư: Đồng bộ hóa like/dislike và userLiked/userDisliked với dữ liệu từ server
    useEffect(() => {
        if (photos && photos.length > 0) {
            const likesObj = {};
            const dislikesObj = {};
            const userLikedObj = {};
            const userDislikedObj = {};
            
            photos.forEach(photo => {
                likesObj[photo._id] = photo.like || 0;
                dislikesObj[photo._id] = photo.dislike || 0;
                
                // Kiểm tra user hiện tại đã like/dislike chưa
                if (currentUser) {
                    userLikedObj[photo._id] = photo.userLiked && photo.userLiked.includes(currentUser._id);
                    userDislikedObj[photo._id] = photo.userDisliked && photo.userDisliked.includes(currentUser._id);
                }
            });
            
            setLike(likesObj);
            setDislike(dislikesObj);
            setUserLiked(userLikedObj);
            setUserDisliked(userDislikedObj);
        }
    }, [photos, currentUser]);

    const handleLike = async (photoId) => {
        if (!isLoggedIn) return;
        try {
            const res = await updateLike(photoId);
            setLike(prev => ({
                ...prev,
                [photoId]: res.like
            }));
            setDislike(prev => ({
                ...prev,
                [photoId]: res.dislike
            }));
            setUserLiked(prev => ({
                ...prev,
                [photoId]: res.userLiked.includes(currentUser._id)
            }));
            setUserDisliked(prev => ({
                ...prev,
                [photoId]: res.userDisliked.includes(currentUser._id)
            }));
        } catch (error) {
            console.error('Update like failed:', error);
        }
    };

    // Xử lý Dislike
    const handleDislike = async (photoId) => {
        if (!isLoggedIn) return;
        try {
            const res = await updateDislike(photoId);
            setLike(prev => ({
                ...prev,
                [photoId]: res.like
            }));
            setDislike(prev => ({
                ...prev,
                [photoId]: res.dislike
            }));
            setUserLiked(prev => ({
                ...prev,
                [photoId]: res.userLiked.includes(currentUser._id)
            }));
            setUserDisliked(prev => ({
                ...prev,
                [photoId]: res.userDisliked.includes(currentUser._id)
            }));
        } catch (error) {
            console.error('Update dislike failed:', error);
        }
    };

    if (loading) {
        return (
            <Box className="loading-container">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !user) {
        return (
            <Typography variant="h6" color="error" className="error-container">
                {error || 'User not found'}
            </Typography>
        );
    }

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

    if (advancedFeaturesEnabled) {
        const currentPhoto = photos[currentPhotoIndex];
        const isFirstPhoto = currentPhotoIndex === 0;
        const isLastPhoto = currentPhotoIndex === photos.length - 1;

        return (
            <Box className="user-photos-container">

                <Box className="advanced-header">

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


                    <IconButton
                        onClick={handleNextPhoto}
                        disabled={isLastPhoto}
                        className="nav-button-right"
                    >
                        <ArrowForwardIos />
                    </IconButton>
                </Box>

                <Card>
                    <CardMedia
                        component="img"
                        image={currentPhoto.file_name}
                        alt={`Photo by ${user.first_name} ${user.last_name}`}
                        className="photo-media"
                    />
                    <CardContent>                        
                        {/* <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                                color={userLiked[currentPhoto._id] ? "primary" : "default"}
                                onClick={() => handleLike(currentPhoto._id)}
                                disabled={!isLoggedIn}
                                title="Like Photo"
                            >
                                <ThumbUpICon />
                            </IconButton>
                            <Typography variant="body2">{like[currentPhoto._id] !== undefined ? like[currentPhoto._id] : currentPhoto.like || 0}</Typography>
                            <IconButton
                                color={userDisliked[currentPhoto._id] ? "error" : "default"}
                                onClick={() => handleDislike(currentPhoto._id)}
                                disabled={!isLoggedIn}
                                aria-label="Dislike"
                            >
                                <ThumbDownIcon />
                            </IconButton>
                            <Typography variant="body2">{dislike[currentPhoto._id] !== undefined ? dislike[currentPhoto._id] : currentPhoto.dislike || 0}</Typography>
                        </Box> */}

                        <Box className="photo-info">
                            <Chip
                                label={formatDateTime(currentPhoto.date_time)}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                        {/* {isLoggedIn && currentUser && currentUser._id === user._id && (
                            <IconButton
                                className="delete-button"
                                onClick={() => handleDeletePhoto(currentPhoto._id)}
                                disabled={commentLoading[currentPhoto._id]}
                                title="Delete Photo"
                                aria-label="Delete Photo"
                                color="error"
                            >
                                <Delete />
                                <span className="visually-hidden">Delete Photo</span>
                            </IconButton>
                        )} */}

                        {currentPhoto.comments && currentPhoto.comments.length > 0 && (
                            <Box className="comments-section">

                                <Typography variant="h6" gutterBottom>
                                    Comments ({currentPhoto.comments.length})
                                </Typography>

                                {currentPhoto.comments.map((comment, index) => (
                                    <Box key={comment._id} className="comment-item">
                                        <Paper elevation={1} className="comment-paper">
                                            <Box className="comment-header">

                                                <Avatar className="comment-avatar">
                                                    {comment.user.first_name[0]}{comment.user.last_name[0]}
                                                </Avatar>

                                                <Box className="comment-user-info">

                                                    <Typography
                                                        variant="subtitle2"
                                                        component={Link}
                                                        to={`/users/${comment.user._id}`}
                                                        className="comment-user-link"
                                                    >
                                                        {comment.user.first_name} {comment.user.last_name}
                                                    </Typography>

                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDateTime(comment.date_time)}
                                                    </Typography>
                                                </Box>
                                            </Box>

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

                        <CommentForm
                            photoId={currentPhoto._id}
                            commentTexts={commentTexts}
                            setCommentTexts={setCommentTexts}
                            commentErrors={commentErrors}
                            setCommentErrors={setCommentErrors}
                            commentLoading={commentLoading}
                            handleAddComment={handleAddComment}
                            isLoggedIn={isLoggedIn}
                            currentUser={currentUser}
                        />
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box className="user-photos-container">

            <Typography variant="h5" gutterBottom>
                {user.first_name} {user.last_name}'s Photos
            </Typography>

            {photos.map((photo) => (
                <Card key={photo._id} className="photo-card">

                    <CardMedia
                        component="img"
                        image={photo.file_name}
                        alt={`Photo by ${user.first_name} ${user.last_name}`}
                        className="photo-media"                    />     

                    {/* <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                            color={userLiked[photo._id] ? "primary" : "default"}
                            onClick={() => handleLike(photo._id)}
                            disabled={!isLoggedIn}
                            title="Like Photo"
                        >
                            <ThumbUpICon />
                        </IconButton>
                        <Typography variant="body2">{like[photo._id] !== undefined ? like[photo._id] : photo.like || 0}</Typography>
                        <IconButton
                            color={userDisliked[photo._id] ? "error" : "default"}
                            onClick={() => handleDislike(photo._id)}
                            disabled={!isLoggedIn}
                            aria-label="Dislike"
                        >
                            <ThumbDownIcon />
                        </IconButton>
                        <Typography variant="body2">{dislike[photo._id] !== undefined ? dislike[photo._id] : photo.dislike || 0}</Typography>
                    </Box> */}

                    <CardContent>
                        <Box className="photo-info">
                            <Chip
                                label={formatDateTime(photo.date_time)}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>

                        {/* {isLoggedIn && currentUser && currentUser._id === user._id && (
                            <IconButton
                                className="delete-button"
                                onClick={() => handleDeletePhoto(photo._id)}
                                disabled={commentLoading[photo._id]}
                                title="Delete Photo"
                                aria-label="Delete Photo"
                                color="error"
                            >
                                <Delete />
                                <span className="visually-hidden">Delete Photo</span>
                            </IconButton>
                        )} */}

                        {photo.comments && photo.comments.length > 0 && (
                            <Box className="comments-section">
                                <Typography variant="h6" gutterBottom>
                                    Comments ({photo.comments.length})
                                </Typography>

                                {photo.comments.map((comment, index) => (
                                    <Box key={comment._id} className="comment-item">
                                        <Paper elevation={1} className="comment-paper">
                                            <Box className="comment-header">

                                                <Avatar className="comment-avatar">
                                                    {comment.user.first_name[0]}{comment.user.last_name[0]}
                                                </Avatar>

                                                <Box className="comment-user-info">
                                                    <Typography
                                                        variant="subtitle2"
                                                        component={Link}
                                                        to={`/users/${comment.user._id}`}
                                                        className="comment-user-link"
                                                    >
                                                        {comment.user.first_name} {comment.user.last_name}
                                                    </Typography>

                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDateTime(comment.date_time)}
                                                    </Typography>
                                                </Box>
                                            </Box>

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

                        <CommentForm
                            photoId={photo._id}
                            commentTexts={commentTexts}
                            setCommentTexts={setCommentTexts}
                            commentErrors={commentErrors}
                            setCommentErrors={setCommentErrors}
                            commentLoading={commentLoading}
                            handleAddComment={handleAddComment}
                            isLoggedIn={isLoggedIn}
                            currentUser={currentUser}
                        />
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}

export default UserPhotos;
