import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { loginUser, logoutUser, registerUser, refreshSession } from "../api/auth";
import { setAccessToken } from "./tokenStore";
import { UserDto } from "../types/user-types";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;

    user: UserDto | null;
    
    register: (username:string, password: string) => void;
    login: (username: string, password: string) => void;
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
    const [initialized, setInitialized] = useState<boolean>(false);

    const [user, setUser] = useState<UserDto | null>(null);

    async function login(username: string, password: string) {
        const res = await loginUser({username, password});

        setToken(res.token);
        setAccessToken(res.token);
        setUser(res.user);
        console.log(user);
    }

    async function register(username: string, password: string){
        const res = await registerUser({username, password});

        setToken(res.token);
        setAccessToken(res.token);
        setUser(res.user);
    }

    async function logout() {
        try {
            await logoutUser();
        } finally {
            setToken(null);
            setAccessToken(null);
            setUser(null);
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function restoreSession(){
            console.log("Auth initialization started");

            try {
                const res = await refreshSession();
                if(!cancelled){
                    console.log("Refresh succeeded", res);
                    setToken(res.token);
                    setAccessToken(res.token);
                    setUser(res.user);
                }
            } catch (error){
                console.error("Refresh failed", error);
                if(!cancelled){
                                setToken(null);
                    setAccessToken(null);
                    setUser(null);
                }
            } finally {
                console.log("Auth initialization finished");
                if(!cancelled) setInitialized(true);
            }
        }

        restoreSession();

        return () => {
            cancelled = true;
        };
    }, [])

    if(!initialized) return <div>Loading...</div>;
    
    return(
        <AuthContext.Provider
            value ={{
                token,
                isAuthenticated: token !== null,
                user,
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
