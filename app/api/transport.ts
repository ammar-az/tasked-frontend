import axios from "axios";
import { setDatabaseUnavailable } from "./availability";
import { isApiUnavailable } from "./errors";

const transport = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
    withCredentials: true,
});

transport.interceptors.response.use(
    (response) => {
        setDatabaseUnavailable(false);
        return response;
    },
    (error: unknown) => {
        if (isApiUnavailable(error)) setDatabaseUnavailable(true);
        return Promise.reject(error);
    },
);

export default transport;
