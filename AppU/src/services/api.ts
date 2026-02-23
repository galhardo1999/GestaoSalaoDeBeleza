
// Use 10.0.2.2 for Android Emulator, localhost for Web/iOS Simulator.
// For physical devices, use your machine's local IP address (e.g., http://192.168.1.15:3000/api/mobile)
const API_URL = 'http://192.168.0.12:3000/api/mobile';

interface ApiResponse<T = any> {
    data: T;
    status: number;
}

const api = {
    get: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
        const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            return {
                data,
                status: response.status
            };
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },
    post: async <T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
        const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            return {
                data,
                status: response.status
            };
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    }
};

export const API_BASE_URL = API_URL.replace('/api/mobile', '');

export function getImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default api;
