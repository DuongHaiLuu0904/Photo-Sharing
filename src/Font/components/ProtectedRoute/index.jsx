import { CircularProgress, Box } from "@mui/material";
import { useAppContext } from "../../contexts/AppContext";
import LoginRegister from "../LoginRegister";

function ProtectedRoute({ children, hideOnLogin = false }) {
  const { isLoggedIn, isLoading } = useAppContext();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Nếu hideOnLogin=true và chưa đăng nhập, ẩn component
  if (hideOnLogin && !isLoggedIn) {
    return null;
  }

  // Nếu hideOnLogin=false và chưa đăng nhập, hiển thị LoginRegister
  if (!hideOnLogin && !isLoggedIn) {
    return <LoginRegister />;
  }

  return children;
}

export default ProtectedRoute;
