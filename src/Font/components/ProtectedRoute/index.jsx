import { useAppContext } from '../../contexts/AppContext';
import LoginRegister from '../LoginRegister';

function ProtectedRoute({ children, hideOnLogin = false }) {
    const { isLoggedIn } = useAppContext();

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
