const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Importar rutas
const tramiteRoutes = require('./routes/tramites');
const reportesRoutes = require('./routes/reportes');  // ✅ AGREGAR ESTA LÍNEA

app.use('/api/tramites', tramiteRoutes);
app.use('/api/reportes', reportesRoutes);  // ✅ AGREGAR ESTA LÍNEA

// Ruta raíz de API
app.get('/api', (req, res) => {
    res.json({
        nombre: "API Municipalidad de Yau",
        version: "1.0.0",
        estado: "✅ Funcionando",
        endpoints_disponibles: [
            { metodo: "POST", ruta: "/api/tramites/predecir", descripcion: "Evaluar un trámite" },
            { metodo: "GET", ruta: "/api/tramites/tipos", descripcion: "Tipos de trámite" },
            { metodo: "GET", ruta: "/api/tramites/estadisticas", descripcion: "Estadísticas" },
            { metodo: "GET", ruta: "/api/tramites/historial", descripcion: "Historial" },
            { metodo: "GET", ruta: "/api/reportes/pdf", descripcion: "Reporte PDF" }  // ✅ NUEVO
        ]
    });
});

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Sistema Municipalidad de Yau funcionando',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Sistema de ML para Municipalidad de Yau`);
    console.log(`✅ Accede a la web en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log(`📄 Reporte PDF: http://localhost:${PORT}/api/reportes/pdf`);
});