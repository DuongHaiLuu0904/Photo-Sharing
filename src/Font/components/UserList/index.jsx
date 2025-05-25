import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";

/**
 * Define UserList, a React component of Project 4.
 */
function UserList () {
    const { isLoggedIn } = useAppContext();
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    
    useEffect(() => {
      const loadUsersAndStats = async () => {
        if (!isLoggedIn) {
          setLoading(false);
          return;
        }
        
        try {
          setLoading(true);
          const userData = await fetchModel('/user/list');
          setUsers(userData);
          
          // Calculate stats for each user
          const stats = {};
          
          // Get all photos from all users first
          const allPhotosData = await Promise.all(
            userData.map(async (user) => {
              try {
                const photos = await fetchModel(`/photo/photosOfUser/${user._id}`);
                return { userId: user._id, photos: photos || [] };
              } catch (err) {
                console.error(`Error loading photos for user ${user._id}:`, err);
                return { userId: user._id, photos: [] };
              }
            })
          );
          
          // Calculate stats for each user
          userData.forEach(user => {
            // Count photos
            const userPhotoData = allPhotosData.find(data => data.userId === user._id);
            const photoCount = userPhotoData ? userPhotoData.photos.length : 0;
            
            // Count comments by this user across all photos
            let commentCount = 0;
            allPhotosData.forEach(photoData => {
              photoData.photos.forEach(photo => {
                if (photo.comments) {
                  const userComments = photo.comments.filter(comment => comment.user._id === user._id);
                  commentCount += userComments.length;
                }
              });
            });
            
            stats[user._id] = {
              photoCount,
              commentCount
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

      loadUsersAndStats();
    }, [isLoggedIn]);

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!isLoggedIn) {
      return (
        <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
          Please login to view users
        </Typography>
      );
    }

    if (error) {
      return (
        <Typography variant="body1" color="error" sx={{ p: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      );
    }
    
    return (
      <div>
        <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
          Users
        </Typography>
        <List component="nav">
          {users.map((user, index) => {
            const stats = userStats[user._id] || { photoCount: 0, commentCount: 0 };
            
            return (
              <React.Fragment key={user._id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    component={Link} 
                    to={`/users/${user._id}`}
                    selected={location.pathname.includes(user._id)}
                    sx={{ pr: 1 }}
                  >
                    <ListItemText 
                      primary={`${user.first_name} ${user.last_name}`}
                      secondary={user.location}
                    />
                    
                    {/* Count bubbles */}
                    <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                      {/* Photo count - Green bubble */}
                      <Chip
                        label={stats.photoCount}
                        size="small"
                        sx={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          fontSize: '0.75rem',
                          height: 24,
                          minWidth: 24,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                        title={`${stats.photoCount} photos`}
                      />
                      
                      {/* Comment count - Red bubble (clickable) */}
                      <Chip
                        label={stats.commentCount}
                        size="small"
                        component={Link}
                        to={`/comments/${user._id}`}
                        clickable
                        sx={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          fontSize: '0.75rem',
                          height: 24,
                          minWidth: 24,
                          textDecoration: 'none',
                          '& .MuiChip-label': {
                            px: 1
                          },
                          '&:hover': {
                            backgroundColor: '#d32f2f',
                            transform: 'scale(1.1)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
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
                {index < users.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </div>
    );
}

export default UserList;
