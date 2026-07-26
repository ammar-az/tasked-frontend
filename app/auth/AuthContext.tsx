import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { loginUser, logoutUser, registerUser, refreshSession } from "../api/auth";

type AuthContextType = {
    token: string | null;
    username: string | null;
    isAuthenticated: boolean;

    register: (username:string, email: string, password: string) => void;
    login: (email: string, password: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
    children: ReactNode;
};

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within an AuthProvider"
        );
    }

    return context;
}

export function AuthProvider({children}: Props){
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [initialized, setInitialized] = useState<boolean>(false);

    async function login(email: string, password: string) {
        const res = await loginUser({email, password});

        setToken(res.token);
        setUsername(res.username);
    }

    async function register(username: string, email: string, password: string){
        const res = await registerUser({username, email, password});

        setToken(res.token);
        setUsername(res.username);
    }

    async function logout() {
        try {
            await logoutUser();
        } finally {
            setToken(null);
            setUsername(null);
        }
    }

    async function restoreSession(){
        console.log("Auth initialization started");
        try {
            const res = await refreshSession();
            console.log("Refresh succeeded", res);
            setToken(res.token);
            setUsername(res.username);
        } catch (error){
            console.error("Refresh failed", error);
            setToken(null);
            setUsername(null);
        } finally {
            console.log("Auth initialization finished");
            setInitialized(true);
        }
    }

    useEffect(() => {
        restoreSession();
    }, [])

    if(!initialized) return <div>Loading...</div>;
    
    return(
        <AuthContext.Provider
            value ={{
                token,
                username,
                isAuthenticated: token !== null,
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
