import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Paper,
  CircularProgress,
  Grid,
  CardMedia,
  Chip
} from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";

/**
 * Define UserComments, a React component for displaying all comments by a user.
 */
function UserComments() {
  const { userId } = useParams();
  const { setCurrentContext, advancedFeaturesEnabled } = useAppContext();
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserComments = async () => {
      try {
        setLoading(true);

        // Load user data
        const userData = await fetchModel(`/user/${userId}`);
        setUser(userData);

        if (userData) {
          setCurrentContext(`Comments by ${userData.first_name} ${userData.last_name}`);
        }

        // Load all photos to find comments by this user
        const allUsers = await fetchModel('/user/list');
        const allComments = [];

        // Get all photos from all users and find comments by this user
        for (const user of allUsers) {
          try {
            const userPhotos = await fetchModel(`/photo/photosOfUser/${user._id}`);
            if (userPhotos && userPhotos.length > 0) {
              userPhotos.forEach(photo => {
                if (photo.comments && photo.comments.length > 0) {
                  photo.comments.forEach(comment => {
                    if (comment.user._id === userId) {
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
            console.error(`Error loading photos for user ${user._id}:`, err);
          }
        }

        // Sort comments by date (newest first)
        allComments.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
        setComments(allComments);

        setError(null);
      } catch (err) {
        setError('Failed to load user comments');
        console.error('Error loading user comments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserComments();
    }

    return () => setCurrentContext('');
  }, [userId, setCurrentContext]);

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

  const getPhotoViewLink = (photo) => {
    // If advanced features are enabled, link to specific photo in stepper
    if (advancedFeaturesEnabled) {
      return `/photos/${photo.user_id}/${photo._id}`;
    }
    // Otherwise, link to user's photos page
    return `/photos/${photo.user_id}`;
  };

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

  if (!comments || comments.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Comments by {user.first_name} {user.last_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This user hasn't made any comments yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Comments by {user.first_name} {user.last_name}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Total comments: {comments.length}
      </Typography>

      {comments.map((comment) => (
        <Card key={`${comment.photo._id}-${comment._id}`} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              {/* Photo thumbnail */}
              <Grid item xs={12} sm={3}>
                <Link
                  to={getPhotoViewLink(comment.photo)}
                  style={{ textDecoration: 'none' }}                
                >                  
                  <CardMedia
                    component="img"
                    image={comment.photo.file_name}
                    alt="Photo thumbnail"
                    sx={{
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                        transform: 'scale(1.02)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  />
                </Link>
              </Grid>

              {/* Comment content */}
              <Grid item xs={12} sm={9}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{
                      width: 24,
                      height: 24,
                      mr: 1,
                      fontSize: '0.7rem'
                    }}>
                      {user.first_name[0]}{user.last_name[0]}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ mr: 2 }}>
                      {user.first_name} {user.last_name}
                    </Typography>
                    <Chip
                      label={formatDateTime(comment.date_time)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Link
                    to={getPhotoViewLink(comment.photo)}
                    style={{ textDecoration: 'none' }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#e9ecef',
                          transform: 'translateY(-1px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      <Typography variant="body1">
                        {comment.comment}
                      </Typography>
                    </Paper>
                  </Link>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
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

export default UserComments;
