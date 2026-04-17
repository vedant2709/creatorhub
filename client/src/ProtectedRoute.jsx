import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children}){
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        // Avoid a visible "Loading..." flash when auth is resolving.
        return <div className="min-h-screen bg-white" />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
