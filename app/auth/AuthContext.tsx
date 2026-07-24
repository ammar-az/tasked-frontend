import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

import {
    clearName,
    clearToken,
    getName,
    getToken,
    saveName,
    saveToken,
} from "./authStorage";

import { login } from "../api/auth";

type AuthContextType = {
    token: string | null;
    username: string | null;
    isAuthenticated: boolean;

    handleLogin: (email: string, password: string) => void;
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
    const [token, setToken] = useState<string | null>(() => getToken());
    const [username, setUsername] = useState<string | null>(() => getName());

    async function handleLogin(email: string, password: string) {
        const res = await login({email, password});
        saveToken(res.token);
        setToken(res.token);
        saveName(res.username);
        setUsername(res.username);
    }

    function logout() {
        clearToken();
        clearName();
        setToken(null);
        setUsername(null);
    }

    return(
        <AuthContext.Provider
            value ={{
                token,
                username,
                isAuthenticated: token !== null,
                handleLogin,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
