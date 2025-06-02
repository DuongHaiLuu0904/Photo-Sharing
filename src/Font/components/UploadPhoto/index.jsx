import { useEffect, useState } from "react";
import {
    Box,          // Container component với flexbox
    Card,         // Component card có shadow và border radius
    CardContent,  // Nội dung bên trong card
    Typography,   // Component hiển thị text với các variant khác nhau
    Button,       // Component button với các style variants
    Alert,        // Component hiển thị thông báo lỗi/thành công
    CircularProgress, // Component loading spinner tròn
    Paper         // Component có background và elevation
} from "@mui/material";

import { CloudUpload, PhotoCamera } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { uploadPhoto } from "../../lib/fetchModelData";
import { useAppContext } from "../../contexts/AppContext";

import "./style.css";

/**
 * UploadPhoto component - Cho phép user đã đăng nhập upload photos
 * Component này cung cấp giao diện để:
 * - Chọn file ảnh từ máy tính
 * - Upload ảnh lên server
 * - Hiển thị kết quả upload (thành công/thất bại)
 * - Điều hướng đến gallery hoặc upload ảnh khác
 */
function UploadPhoto() {
    // Hook để điều hướng đến các trang khác
    const navigate = useNavigate();
    
    // Lấy thông tin user và function để set context từ global state
    const { user, setCurrentContext } = useAppContext();
    
    // State để lưu file ảnh được chọn
    const [selectedFile, setSelectedFile] = useState(null);
    
    // State để theo dõi trạng thái đang upload
    const [uploading, setUploading] = useState(false);
    
    // State để lưu thông báo lỗi khi upload
    const [uploadError, setUploadError] = useState('');
    
    // State để theo dõi trạng thái upload thành công
    const [uploadSuccess, setUploadSuccess] = useState(false);
    
    // State để lưu thông tin photo vừa upload thành công
    const [uploadedPhoto, setUploadedPhoto] = useState(null);   
    
    // useEffect để set context title khi component mount
    useEffect(() => {
        setCurrentContext('Upload Photo');
        // Cleanup function để reset context khi component unmount
        return () => setCurrentContext('');
    }, [setCurrentContext]);

    /**
     * Handler function khi user chọn file từ input
     * @param {Event} event - Event từ file input
     */
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Lưu file đã chọn vào state
            setSelectedFile(file);
            // Clear các state lỗi và thành công trước đó
            setUploadError('');
            setUploadSuccess(false);
        }
    };

    /**
     * Handler function để thực hiện upload photo
     * Thực hiện validate, gọi API upload và xử lý kết quả
     */
    const handleUpload = async () => {
        // Kiểm tra xem đã chọn file chưa
        if (!selectedFile) {
            setUploadError('Please select a file first');
            return;
        }

        try {
            // Bắt đầu quá trình upload
            setUploading(true);
            setUploadError('');

            // Gọi API để upload photo
            const result = await uploadPhoto(selectedFile);

            // Upload thành công
            setUploadSuccess(true);
            setUploadedPhoto(result.photo);
            setSelectedFile(null);

            // Clear file input để user có thể chọn file khác
            const fileInput = document.getElementById('photo-upload-input');
            if (fileInput) {
                fileInput.value = '';
            }

        } catch (error) {
            // Xử lý lỗi upload
            console.error('Upload failed:', error);
            setUploadError(error.message || 'Failed to upload photo');
        } finally {
            // Luôn tắt loading state khi hoàn thành
            setUploading(false);
        }
    };

    /**
     * Handler function để chuyển đến trang photos của user
     */
    const handleViewMyPhotos = () => {
        navigate(`/photos/${user._id}`);
    };

    /**
     * Handler function để reset form và upload ảnh khác
     */
    const handleUploadAnother = () => {
        setUploadSuccess(false);
        setUploadedPhoto(null);
        setUploadError('');
    };    // Render main component
    return (
        <Box className="upload-photo-container">
            {/* Header title */}
            <Typography variant="h4" gutterBottom className="upload-photo-title">
                Upload New Photo
            </Typography>

            {/* Conditional rendering dựa trên trạng thái upload */}
            {uploadSuccess ? (
                // Success state - Hiển thị khi upload thành công
                <Card className="success-card">
                    <CardContent>
                        {/* Success message */}
                        <Typography variant="h6" color="success.main" gutterBottom className="success-title">
                            ✅ Photo Uploaded Successfully!
                        </Typography>

                        {uploadedPhoto && (
                            <Box className="success-content">
                                {/* Success description */}
                                <Typography variant="body1" gutterBottom className="success-description">
                                    Your photo has been uploaded and is now available in your gallery.
                                </Typography>

                                {/* Action buttons sau khi upload thành công */}
                                <Box className="success-buttons">
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
                // Upload form state - Form để chọn và upload file
                <Card>
                    <CardContent>
                        {/* Error alert - Hiển thị khi có lỗi */}
                        {uploadError && (
                            <Alert severity="error" className="upload-error">
                                {uploadError}
                            </Alert>
                        )}

                        {/* Upload instructions section */}
                        <Box className="upload-icon-section">
                            <PhotoCamera className="upload-icon" color="disabled" />
                            <Typography variant="h6" gutterBottom className="upload-instructions">
                                Select a photo to upload
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Supported formats: JPG, PNG, GIF (Max 10MB)
                            </Typography>
                        </Box>

                        {/* File input section */}
                        <Box className="file-input-section">
                            {/* Hidden file input */}
                            <input
                                id="photo-upload-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="file-input"
                            />
                            {/* Custom styled button cho file input */}
                            <label htmlFor="photo-upload-input">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    fullWidth
                                    className="choose-button"
                                >
                                    Choose Photo
                                </Button>
                            </label>

                            {/* File info display - Hiển thị thông tin file đã chọn */}
                            {selectedFile && (
                                <Paper className="file-info">
                                    <Typography variant="body2">
                                        <strong>Selected file:</strong> {selectedFile.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </Typography>
                                </Paper>
                            )}
                        </Box>

                        {/* Upload button */}
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                            className="upload-button"
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
