import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  Divider,
  Avatar,
  Chip,
  Paper,
  CircularProgress,
  IconButton,
  Button,
  TextField,
  Alert
} from "@mui/material";
import { 
  ArrowBackIos, 
  ArrowForwardIos, 
  ArrowBack,
  Send
} from "@mui/icons-material";
import { Link, useParams, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel, { addCommentToPhoto } from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos () {
    const { userId, photoId } = useParams();
    const navigate = useNavigate();
    const { setCurrentContext, advancedFeaturesEnabled, user: currentUser, isLoggedIn } = useAppContext();
    const [user, setUser] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    
    // Comment form states - separate for each photo
    const [commentTexts, setCommentTexts] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const [commentErrors, setCommentErrors] = useState({});

    useEffect(() => {
      const loadUserAndPhotos = async () => {
        try {
          setLoading(true);
          
          // Load user data and photos in parallel
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

          // If we have a photoId in the URL, find its index
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

      if (userId) {
        loadUserAndPhotos();
      }

      return () => setCurrentContext('');
    }, [userId, photoId, setCurrentContext]);

    // Update URL when photo index changes in advanced mode
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

    const handleBackToAllPhotos = () => {
      navigate(`/photos/${userId}`);
    };

    // Handle comment submission
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

        // Call API to add comment
        const newComment = await addCommentToPhoto(photoIdToComment, currentText.trim());

        // Update photos state to include the new comment
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

        // Clear form for this specific photo
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

    // Create comment form component
    const CommentForm = ({ photoId }) => {
      const currentText = commentTexts[photoId] || '';
      const currentError = commentErrors[photoId] || '';
      const isLoading = commentLoading[photoId] || false;

      const handleTextChange = (e) => {
        setCommentTexts(prev => ({
          ...prev,
          [photoId]: e.target.value
        }));
        
        // Clear error when user starts typing
        if (currentError) {
          setCommentErrors(prev => ({
            ...prev,
            [photoId]: ''
          }));
        }
      };

      if (!isLoggedIn) {
        return (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Please <Link to="/login" style={{ color: 'inherit' }}>log in</Link> to add a comment.
            </Typography>
          </Box>
        );
      }

      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Add a Comment
          </Typography>
          
          {currentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {currentError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Avatar sx={{ 
              width: 32, 
              height: 32,
              fontSize: '0.8rem'
            }}>
              {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
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
                sx={{ mb: 1 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

    // Add keyboard navigation support
    useEffect(() => {
      if (!advancedFeaturesEnabled) return;

      const handleKeyPress = (event) => {
        if (event.key === 'ArrowLeft' && currentPhotoIndex > 0) {
          handlePreviousPhoto();
        } else if (event.key === 'ArrowRight' && currentPhotoIndex < photos.length - 1) {
          handleNextPhoto();
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }, [advancedFeaturesEnabled, currentPhotoIndex, photos.length, handlePreviousPhoto, handleNextPhoto]);

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error || !user) {
      return (
        <Typography variant="h6" color="error" sx={{ p: 3 }}>
          {error || 'User not found'}
        </Typography>
      );
    }

    if (!photos || photos.length === 0) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {user.first_name} {user.last_name}'s Photos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No photos available for this user.
          </Typography>
        </Box>
      );
    }

    // Advanced Features: Single Photo Stepper View
    if (advancedFeaturesEnabled) {
      const currentPhoto = photos[currentPhotoIndex];
      const isFirstPhoto = currentPhotoIndex === 0;
      const isLastPhoto = currentPhotoIndex === photos.length - 1;

      return (
        <Box sx={{ p: 3 }}>
          {/* Header with back button and navigation info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBackToAllPhotos}
              sx={{ mr: 2 }}
            >
              Back to All Photos
            </Button>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              {user.first_name} {user.last_name}'s Photos
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {currentPhotoIndex + 1} of {photos.length}
            </Typography>
          </Box>

          {/* Photo navigation controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={handlePreviousPhoto}
              disabled={isFirstPhoto}
              sx={{ mr: 2 }}
            >
              <ArrowBackIos />
            </IconButton>
            
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Use arrow buttons or browser back/forward to navigate
              </Typography>
            </Box>
            
            <IconButton 
              onClick={handleNextPhoto}
              disabled={isLastPhoto}
              sx={{ ml: 2 }}
            >
              <ArrowForwardIos />
            </IconButton>
          </Box>

          {/* Current photo display */}
          <Card>
            <CardMedia
              component="img"
              image={currentPhoto.file_name}
              alt={`Photo by ${user.first_name} ${user.last_name}`}
              sx={{ 
                maxHeight: 600, 
                objectFit: 'contain',
                backgroundColor: '#f5f5f5'
              }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={formatDateTime(currentPhoto.date_time)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {currentPhoto.comments && currentPhoto.comments.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Comments ({currentPhoto.comments.length})
                  </Typography>
                  
                  {currentPhoto.comments.map((comment, index) => (
                    <Box key={comment._id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          mb: 2,
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1 
                        }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1,
                            fontSize: '0.8rem'
                          }}>
                            {comment.user.first_name}{comment.user.last_name}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                              variant="subtitle2" 
                              component={Link}
                              to={`/users/${comment.user._id}`}
                              sx={{ 
                                textDecoration: 'none',
                                color: 'primary.main',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
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
                      {index < currentPhoto.comments.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Add Comment Form */}
              <CommentForm photoId={currentPhoto._id} />
            </CardContent>
          </Card>
        </Box>
      );
    }

    // Original: All Photos View
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {user.first_name} {user.last_name}'s Photos
        </Typography>
        
        {photos.map((photo) => (
          <Card key={photo._id} sx={{ mb: 4 }}>
            <CardMedia
              component="img"
              image={photo.file_name}
              alt={`Photo by ${user.first_name} ${user.last_name}`}
              sx={{ 
                maxHeight: 600, 
                objectFit: 'contain',
                backgroundColor: '#f5f5f5'
              }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={formatDateTime(photo.date_time)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {photo.comments && photo.comments.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Comments ({photo.comments.length})
                  </Typography>
                  
                  {photo.comments.map((comment, index) => (
                    <Box key={comment._id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          mb: 2,
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1 
                        }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1,
                            fontSize: '0.8rem'
                          }}>
                            {comment.user.first_name[0]}{comment.user.last_name[0]}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                              variant="subtitle2" 
                              component={Link}
                              to={`/users/${comment.user._id}`}
                              sx={{ 
                                textDecoration: 'none',
                                color: 'primary.main',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
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
                      {index < photo.comments.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Add Comment Form */}
              <CommentForm photoId={photo._id} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
}

export default UserPhotos;
