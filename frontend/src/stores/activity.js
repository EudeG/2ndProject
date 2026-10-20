import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const API_URL = import.meta.env.VITE_API_URL;

const NETWORK_ERROR_MESSAGE =
    "No hay conexión con el servidor. Revisa tu conexión e intenta de nuevo en unos segundos.";

async function request(url, options) {
    try {
        return await fetch(url, options);
    } catch {
        const err = new Error(NETWORK_ERROR_MESSAGE);
        err.network = true;
        throw err;
    }
}

export const useActivityStore = defineStore("activity", () => {
    const activities = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const auth = useAuthStore();

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
        };
    }

    async function fetchActivities(type = "") {
        loading.value = true;
        error.value = null;
        try {
            const params = new URLSearchParams();
            if (type) params.set("type", type);
            const res = await request(`${API_URL}/activity?${params}`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(
                    data.message || data.error ||
                        "Error al cargar el historial",
                );
            }
            activities.value = data.activities || [];
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    async function fetchActivity(id) {
        const res = await request(`${API_URL}/activity/${id}`, {
            headers: getHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(
                data.message || data.error ||
                    "Error al cargar el detalle de la actividad",
            );
        }
        return data.activity;
    }

    return {
        activities,
        loading,
        error,
        fetchActivities,
        fetchActivity,
    };
});
