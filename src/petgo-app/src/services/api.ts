import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const MEU_IP_COMPUTADOR = '192.168.0.107';
const PORTA_API = '5085';

export const api = axios.create({
    baseURL: `http://${MEU_IP_COMPUTADOR}:${PORTA_API}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("@PetGo:token");

            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Falha ao recuperar token para a requisição", error);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

