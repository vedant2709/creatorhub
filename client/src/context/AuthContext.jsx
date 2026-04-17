import { createContext, useEffect, useState } from "react";
import { getMe, logoutUser } from "../services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchUser = async () => {
            try {
                const res = await getMe();
                if(res?.data){
                    setUser(res.data)
                }
            } catch {
                setUser(null);
            } finally{
                setLoading(false)
            }
        }
        fetchUser();
    },[]);

    useEffect(() => {
        const onAuthLogout = () => setUser(null);
        window.addEventListener("auth:logout", onAuthLogout);
        return () => window.removeEventListener("auth:logout", onAuthLogout);
    }, []);

    const logout = async () => {
        // Optimistic logout: prevent protected pages from rendering while
        // waiting on the server to clear cookies/session.
        setUser(null);
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <AuthContext.Provider value={{user, setUser, loading, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
