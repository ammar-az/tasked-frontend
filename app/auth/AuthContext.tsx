import {
    createContext,
    useContext,
    useEffect,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import { loginUser, logoutUser, registerUser } from "../api/auth";
import { getSession, getServerSession, restoreSession, setSession, subscribeToSession } from "./session";
import type { UserDto } from "../types/user-types";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    isRestoringSession: boolean;
    isSessionReady: boolean;

    user: UserDto | null;
    
    register: (username:string, password: string) => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
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
    const session = useSyncExternalStore(subscribeToSession, getSession, getServerSession);

    async function login(username: string, password: string) {
        const res = await loginUser({username, password});

        setSession(res);
    }

    async function register(username: string, password: string){
        const res = await registerUser({username, password});

        setSession(res);
    }

    async function logout() {
        await logoutUser();
        setSession(null);
    }

    useEffect(() => {
        // Restore in the background; the app and navigation stay visible.
        void restoreSession().catch(() => { /* The connection monitor handles recovery. */ });
    }, [])

    return(
        <AuthContext.Provider
            value ={{
                token: session.token,
                isAuthenticated: session.token !== null,
                isRestoringSession: session.status === "restoring",
                isSessionReady: session.status === "authenticated" || session.status === "anonymous",
                user: session.user,
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
