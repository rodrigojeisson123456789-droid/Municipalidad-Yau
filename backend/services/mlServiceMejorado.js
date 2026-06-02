const { PythonShell } = require('python-shell');
const path = require('path');

class MLServiceMejorado {
    constructor() {
        this.modelPath = path.join(__dirname, '../ml/modelo_entrenado.pkl');
        this.encodersPath = path.join(__dirname, '../ml/encoders.json');
        this.encoders = null;
        this.cargarEncoders();
    }

    cargarEncoders() {
        const fs = require('fs');
        try {
            const data = fs.readFileSync(this.encodersPath, 'utf8');
            this.encoders = JSON.parse(data);
            console.log('✅ Encoders cargados correctamente');
        } catch (error) {
            console.log('⚠️ Usando sistema de reglas simple');
        }
    }

    async predecir(data) {
        // Sistema híbrido: ML si está disponible, sino reglas
        if (this.encoders) {
            return await this.predecirConML(data);
        } else {
            return this.predecirConReglas(data);
        }
    }

    async predecirConML(data) {
        return new Promise((resolve, reject) => {
            const options = {
                mode: 'json',
                pythonPath: 'python',
                scriptPath: path.join(__dirname, '../ml')
            };

            PythonShell.run('predecir_modelo.py', {
                ...options,
                args: [JSON.stringify(data)]
            }).then(results => {
                resolve(results[0]);
            }).catch(err => {
                console.log('Error en ML, usando reglas:', err);
                resolve(this.predecirConReglas(data));
            });
        });
    }

    predecirConReglas(data) {
        let score = 0;
        
        if (data.dias_espera > 20) score += 40;
        else if (data.dias_espera > 15) score += 25;
        else if (data.dias_espera > 10) score += 15;
        
        if (data.num_quejas > 3) score += 35;
        else if (data.num_quejas > 1) score += 20;
        
        if (data.monto_involucrado > 30000) score += 35;
        else if (data.monto_involucrado > 15000) score += 20;
        
        const tiposCriticos = ['Licencia construcción', 'Autorización comercial'];
        if (tiposCriticos.includes(data.tipo_tramite)) score += 25;
        
        if (data.es_fin_de_mes) score += 15;
        score += (data.dias_feriados_cercanos || 0) * 10;
        
        const esCritico = score >= 50;
        const probabilidad = Math.min(score / 100, 0.95);
        
        return {
            es_critico: esCritico,
            probabilidad: probabilidad,
            nivel_prioridad: esCritico ? 'ALTA' : 'NORMAL',
            score: score,
            modelo_usado: 'reglas_negocio'
        };
    }

    generarRecomendaciones(data, esCritico) {
        const recs = [];
        
        if (esCritico) {
            recs.push("🚨 ATENCIÓN PRIORITARIA - Este trámite requiere acción inmediata");
        }
        
        if (data.dias_espera > 20) {
            recs.push("⏰ Tiempo de espera excesivo - Priorizar para evitar quejas");
        } else if (data.dias_espera > 15) {
            recs.push("⚠️ Tiempo de espera elevado - Revisar estado actual");
        }
        
        if (data.num_quejas > 5) {
            recs.push("📢 Nivel crítico de quejas - Requiere intervención inmediata");
        } else if (data.num_quejas > 3) {
            recs.push("📢 Alto número de quejas - Revisar causa raíz");
        }
        
        if (data.monto_involucrado > 50000) {
            recs.push("💰 Monto muy significativo - Requiere supervisión especial");
        } else if (data.monto_involucrado > 30000) {
            recs.push("💰 Monto significativo - Atención prioritaria");
        }
        
        if (data.tipo_tramite === 'Licencia construcción') {
            recs.push("🏗️ Licencia de construcción - Verificar cumplimiento normativo");
        }
        
        if (data.es_fin_de_mes) {
            recs.push("📅 Fin de mes - Alta carga operativa");
        }
        
        if (recs.length === 0) {
            recs.push("✅ Trámite dentro de parámetros normales - Seguir flujo estándar");
        }
        
        return recs;
    }
}

module.exports = new MLServiceMejorado();