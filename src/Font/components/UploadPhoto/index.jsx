import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper
} from "@mui/material";
import { CloudUpload, PhotoCamera } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { uploadPhoto } from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";

/**
 * UploadPhoto component - Allows logged-in users to upload photos
 */
function UploadPhoto() {
  const navigate = useNavigate();
  const { user, setCurrentContext } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  React.useEffect(() => {
    setCurrentContext('Upload Photo');
    return () => setCurrentContext('');
  }, [setCurrentContext]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError('');
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      const result = await uploadPhoto(selectedFile);
      
      setUploadSuccess(true);
      setUploadedPhoto(result.photo);
      setSelectedFile(null);

      // Clear the file input
      const fileInput = document.getElementById('photo-upload-input');
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleViewMyPhotos = () => {
    navigate(`/photos/${user._id}`);
  };

  const handleUploadAnother = () => {
    setUploadSuccess(false);
    setUploadedPhoto(null);
    setUploadError('');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Upload New Photo
      </Typography>

      {uploadSuccess ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="success.main" gutterBottom>
              ✅ Photo Uploaded Successfully!
            </Typography>
            
            {uploadedPhoto && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Your photo has been uploaded and is now available in your gallery.
                </Typography>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleViewMyPhotos}
                  >
                    View My Photos
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleUploadAnother}
                  >
                    Upload Another Photo
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            {uploadError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {uploadError}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PhotoCamera sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Select a photo to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: JPG, PNG, GIF (Max 10MB)
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="photo-upload-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ mb: 2, py: 2 }}
                >
                  Choose Photo
                </Button>
              </label>

              {selectedFile && (
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2">
                    <strong>Selected file:</strong> {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Paper>
              )}
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
              sx={{ py: 1.5 }}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default UploadPhoto;
