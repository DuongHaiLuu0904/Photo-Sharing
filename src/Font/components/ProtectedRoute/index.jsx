import { useAppContext } from '../../contexts/AppContext';
import LoginRegister from '../LoginRegister';

function ProtectedRoute({ children }) {
    const { isLoggedIn } = useAppContext();

    if (!isLoggedIn) {
        return <LoginRegister />;
    }

    return children;
}

export default ProtectedRoute;
