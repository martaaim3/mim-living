const API_BASE_URL = 'http://localhost:3000/api'; // Puerto 3000 confirmado


const api = {
    estancias: {
        crear: async (proyectoId, datos) => {
            // Quitamos "/estancias" de la ruta porque ya va incluido en la base del servidor
            const response = await fetch(`${API_BASE_URL}/estancias/proyecto/${proyectoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            return await response.json();
        },
        listar: async (proyectoId) => {
            const response = await fetch(`${API_BASE_URL}/estancias/proyecto/${proyectoId}`);
            return await response.json();
        }
    },
    usuario: {
        obtenerStats: async (usuarioId) => {
            // Esta ruta usa /api/auth porque en server tienes app.use("/api/auth", authRoutes)
            const response = await fetch(`${API_BASE_URL}/auth/stats/${usuarioId}`);
            return await response.json();
        }
    },

    

    // Añade esto dentro del objeto const api = { ... }
    presupuesto: {
        listar: async (proyectoId) => {
            const response = await fetch(`${API_BASE_URL}/presupuesto/proyecto/${proyectoId}`);
            return await response.json();
        },
        anadir: async (datos) => {
            const response = await fetch(`${API_BASE_URL}/presupuesto/anadir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            return await response.json();
        }
    }
};

window.api = api;

