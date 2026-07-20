import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const authService = {
    login: async (credentials) => {
        const response = await api.post("/auth/authenticate", credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post("/auth/register", userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get("/auth/profile");
        return response.data;
    },
};

export const bookingService = {
    bookRide: async (request, userId) => {
        const response = await api.post("/bookings/request", request, {
            headers: {
                "X-User-Id": userId,
            },
        });

        return response.data;
    },

    getAvailableRides: async () => {
        const response = await api.get("/bookings/available");
        return response.data;
    },

    acceptRide: async (rideId, driverId) => {
        const response = await api.post(
            `/bookings/${rideId}/accept`,
            {},
            {
                headers: {
                    "X-User-Id": driverId,
                },
            }
        );

        return response.data;
    },

    startRide: async (rideId, otp) => {
        const response = await api.post(
            `/bookings/${rideId}/start`,
            null,
            {
                params: {
                    otp,
                },
            }
        );

        return response.data;
    },

    completeRide: async (rideId) => {
        const response = await api.post(`/bookings/${rideId}/complete`);
        return response.data;
    },

    cancelRide: async (rideId) => {
        const response = await api.post(`/bookings/${rideId}/cancel`);
        return response.data;
    },

    payRide: async (rideId) => {
        const response = await api.post(`/bookings/${rideId}/pay`);
        return response.data;
    },

    getMyRides: async (userId, role) => {
        const response = await api.get("/bookings/my-rides", {
            headers: {
                "X-User-Id": userId,
                "X-User-Role": role,
            },
        });

        return response.data;
    },
};

export const driverService = {
    getDriverById: async (id) => {
        const response = await api.get(`/drivers/${id}`);
        return response.data;
    },

    toggleAvailability: async (userId, currentStatus) => {
        const newStatus = !currentStatus;

        const response = await api.post(
            `/drivers/${userId}/availability`,
            null,
            {
                params: {
                    status: newStatus,
                },
            }
        );

        return response.data;
    },

    updateLocation: async (userId, lat, lon) => {
        const response = await api.post(`/drivers/${userId}/location`, {
            latitude: lat,
            longitude: lon,
        });

        return response.data;
    },

    uploadDocument: async (driverId, file) => {
        const formData = new FormData();

        formData.append("file", file);

        const response = await api.post(
            `/drivers/${driverId}/document`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },
};

export const kycService = {
    uploadDocument: async (userId, type, file) => {
        const formData = new FormData();

        formData.append("userId", userId);
        formData.append("type", type);
        formData.append("file", file);

        const response = await api.post("/kyc/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    verifyDocument: async (documentId, approved, notes) => {
        const response = await api.post(
            `/kyc/${documentId}/verify`,
            null,
            {
                params: {
                    approved,
                    notes,
                },
            }
        );

        return response.data;
    },

    getUserDocuments: async (userId) => {
        const response = await api.get(`/kyc/user/${userId}`);
        return response.data;
    },
};

export default api;