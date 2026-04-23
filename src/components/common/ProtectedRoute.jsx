import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function ProtectedRoute({ children }) {
    const { isAdmin } = useUser();

    if (!isAdmin()) {
        // Redirect to admin login page
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
