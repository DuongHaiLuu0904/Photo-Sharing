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


// Component UserDetail hiển thị thông tin chi tiết của một user
function UserDetail() {
    // Lấy userId từ URL parameters (ví dụ: /user/123 -> userId = "123")
    const { userId } = useParams();
    // Lấy function setCurrentContext từ AppContext để cập nhật tiêu đề trang
    const { setCurrentContext } = useAppContext();

    // State để lưu thông tin user được load từ API
    const [user, setUser] = useState(null);
    // State để quản lý trạng thái loading
    const [loading, setLoading] = useState(true);
    // State để lưu lỗi nếu có
    const [error, setError] = useState(null);

    // useEffect chạy khi component mount hoặc userId thay đổi
    useEffect(() => {
        // Function async để load thông tin user từ API
        const loadUser = async () => {
            try {
                // Bắt đầu loading
                setLoading(true);
                // Gọi API để lấy thông tin user theo userId
                const userData = await fetchModel(`/user/${userId}`);
                // Lưu dữ liệu user vào state
                setUser(userData);
                // Xóa lỗi nếu có
                setError(null);
                // Nếu có dữ liệu user, cập nhật context với tên đầy đủ của user
                if (userData) {
                    setCurrentContext(`${userData.first_name} ${userData.last_name}`);
                }
            } catch (err) {
                // Nếu có lỗi, lưu thông báo lỗi và log ra console
                setError('Failed to load user details');
                console.error('Error loading user:', err);
            } finally {
                // Dù thành công hay thất bại cũng tắt loading
                setLoading(false);
            }
        };

        // Chỉ load user khi có userId
        if (userId) {
            loadUser();
        }

        // Cleanup function: reset context khi component unmount
        return () => setCurrentContext('');
    }, [userId, setCurrentContext]); // Dependency array: chạy lại khi userId hoặc setCurrentContext thay đổi

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
            <Typography variant="h6" color="error" className="error-message">
                {error || 'User not found'}
            </Typography>
        );
    }

    return (
        <Box className="main-container"> 
            <Card>
                <CardContent>
                   
                    <Typography variant="h4" component="h1" gutterBottom>
                        {user.first_name} {user.last_name}
                    </Typography>

                
                    <Box className="chips-container">

                        <Chip
                            label={user.occupation}
                            color="primary"
                            className="occupation-chip"
                        />

                        <Chip
                            label={user.location}
                            variant="outlined"
                            className="location-chip"
                        />
                    </Box>


                    <Typography variant="body1" paragraph>
                        {user.description}
                    </Typography>

                    <Box className="button-container">
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
