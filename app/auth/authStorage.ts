const TOKEN_KEY = "tasked_access_token";
const NAME_KEY = "name";

export function getToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}


export function getName(): string | null {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem(NAME_KEY);
}

export function saveName(name: string): void {
    localStorage.setItem(NAME_KEY, name);
}

export function clearName(): void {
    localStorage.removeItem(NAME_KEY);
}