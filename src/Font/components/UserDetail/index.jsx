import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  CircularProgress
} from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail() {
    const { userId } = useParams();
    const { setCurrentContext } = useAppContext();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
      const loadUser = async () => {
        try {
          setLoading(true);
          const userData = await fetchModel(`/user/${userId}`);
          setUser(userData);
          setError(null);
          if (userData) {
            setCurrentContext(`${userData.first_name} ${userData.last_name}`);
          }
        } catch (err) {
          setError('Failed to load user details');
          console.error('Error loading user:', err);
        } finally {
          setLoading(false);
        }
      };

      if (userId) {
        loadUser();
      }

      return () => setCurrentContext('');
    }, [userId, setCurrentContext]);

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

    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom>
              {user.first_name} {user.last_name}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={user.occupation} 
                color="primary" 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={user.location} 
                variant="outlined" 
                sx={{ mb: 1 }} 
              />
            </Box>

            <Typography variant="body1" paragraph>
              {user.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                component={Link}
                to={`/photos/${user._id}`}
                size="large"
              >
                View {user.first_name}'s Photos
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
}

export default UserDetail;
