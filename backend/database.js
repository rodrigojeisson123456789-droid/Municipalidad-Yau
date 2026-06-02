const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tramites.db');
const db = new sqlite3.Database(dbPath);

// Crear tablas al iniciar
db.serialize(() => {
    // Tabla de historial de currículos
    db.run(`
        CREATE TABLE IF NOT EXISTS historial_curriculos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_archivo TEXT NOT NULL,
            puesto TEXT NOT NULL,
            keywords_puesto TEXT,
            palabras_encontradas TEXT,
            porcentaje_coincidencia REAL,
            nivel_prioridad TEXT,
            fecha_analisis DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creando tabla historial_curriculos:', err);
        else console.log('✅ Tabla historial_curriculos creada');
    });

    // Tabla de trámites (SIN la columna nivel_prioridad que causaba error)
    db.run(`
        CREATE TABLE IF NOT EXISTS tramites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_tramite TEXT NOT NULL,
            area_responsable TEXT NOT NULL,
            dias_espera INTEGER,
            num_quejas INTEGER,
            monto_involucrado REAL,
            es_fin_de_mes INTEGER,
            dias_feriados_cercanos INTEGER,
            es_critico INTEGER,
            probabilidad REAL,
            fecha_consulta DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creando tabla:', err);
        } else {
            console.log('✅ Base de datos inicializada correctamente');
        }
    });
});

// Funciones de la base de datos
const dbFunctions = {
    // Guardar un trámite
    guardarTramite(tramite, prediccion) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO tramites (
                    tipo_tramite, area_responsable, dias_espera, num_quejas,
                    monto_involucrado, es_fin_de_mes, dias_feriados_cercanos,
                    es_critico, probabilidad
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run(
                tramite.tipo_tramite,
                tramite.area_responsable,
                tramite.dias_espera || 0,
                tramite.num_quejas || 0,
                tramite.monto_involucrado || 0,
                tramite.es_fin_de_mes ? 1 : 0,
                tramite.dias_feriados_cercanos || 0,
                prediccion.es_critico ? 1 : 0,
                prediccion.probabilidad_criticidad || 0,
                function(err) {
                    if (err) {
                        console.error('Error guardando:', err.message);
                        reject(err);
                    } else {
                        console.log('✅ Trámite guardado, ID:', this.lastID);
                        resolve(this.lastID);
                    }
                }
            );
            stmt.finalize();
        });
    },
    
    // Guardar análisis de currículo
guardarAnalisisCurriculo(data) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO historial_curriculos (
                nombre_archivo, puesto, keywords_puesto, 
                palabras_encontradas, porcentaje_coincidencia, nivel_prioridad
            ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            data.nombre_archivo,
            data.puesto,
            JSON.stringify(data.keywords_puesto),
            JSON.stringify(data.palabras_encontradas),
            data.porcentaje_coincidencia,
            data.nivel_prioridad,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
},

    // Obtener historial de currículos
    getHistorialCurriculos(limite = 20) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM historial_curriculos 
                ORDER BY fecha_analisis DESC 
                LIMIT ?
            `, [limite], (err, rows) => {
                if (err) reject(err);
                else {
                    // Parsear JSON
                    rows.forEach(row => {
                        if (row.keywords_puesto) row.keywords_puesto = JSON.parse(row.keywords_puesto);
                        if (row.palabras_encontradas) row.palabras_encontradas = JSON.parse(row.palabras_encontradas);
                    });
                    resolve(rows);
                }
            });
        });
    },

    // Obtener estadísticas reales
    getEstadisticasReales() {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total_consultas,
                    SUM(es_critico) as total_criticos,
                    ROUND(AVG(probabilidad) * 100, 2) as probabilidad_promedio,
                    ROUND(CAST(SUM(es_critico) AS FLOAT) / COUNT(*) * 100, 2) as tasa_criticidad
                FROM tramites
            `, (err, row) => {
                if (err) {
                    console.error('Error obteniendo estadísticas:', err.message);
                    resolve({ total_consultas: 0, total_criticos: 0, probabilidad_promedio: 0, tasa_criticidad: 0 });
                } else {
                    resolve(row || { total_consultas: 0, total_criticos: 0, probabilidad_promedio: 0, tasa_criticidad: 0 });
                }
            });
        });
    },
    
    // Obtener últimos trámites
    getUltimosTramites(limite = 20) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM tramites 
                ORDER BY fecha_consulta DESC 
                LIMIT ?
            `, [limite], (err, rows) => {
                if (err) {
                    console.error('Error obteniendo historial:', err.message);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
    },
    
    // Obtener estadísticas por tipo de trámite
    getEstadisticasPorTipo() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    tipo_tramite,
                    COUNT(*) as total,
                    SUM(es_critico) as criticos,
                    ROUND(AVG(probabilidad) * 100, 2) as prob_promedio
                FROM tramites
                GROUP BY tipo_tramite
                ORDER BY total DESC
            `, (err, rows) => {
                if (err) {
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
    },
    
    // Cerrar conexión
    cerrar() {
        db.close();
    }
};

module.exports = dbFunctions;