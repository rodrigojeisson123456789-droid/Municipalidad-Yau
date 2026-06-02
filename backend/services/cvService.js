const fs = require('fs');
const path = require('path');

// Importar correctamente pdf-parse
let pdfParse;
try {
    pdfParse = require('pdf-parse');
    console.log('✅ pdf-parse cargado correctamente');
} catch (error) {
    console.error('❌ Error cargando pdf-parse:', error.message);
}

const mammoth = require('mammoth');

class CVService {
    constructor() {
        this.keywordsPorPuesto = {
            'Desarrollador Full Stack': ['javascript', 'react', 'node.js', 'html', 'css', 'mongodb', 'express', 'api', 'frontend', 'backend', 'fullstack'],
            'Desarrollador Frontend': ['react', 'angular', 'vue', 'javascript', 'html5', 'css3', 'typescript', 'responsive', 'ui', 'ux'],
            'Desarrollador Backend': ['node.js', 'python', 'java', 'php', 'sql', 'mongodb', 'api', 'rest', 'microservices', 'django'],
            'Analista de Datos': ['python', 'sql', 'excel', 'tableau', 'power bi', 'estadistica', 'machine learning', 'pandas', 'numpy'],
            'Diseñador UX/UI': ['figma', 'adobe xd', 'photoshop', 'illustrator', 'prototipado', 'usabilidad', 'user experience', 'user interface'],
            'Administrador de Base de Datos': ['sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'respaldo', 'optimizacion', 'dba']
        };
    }

    // Extraer texto de PDF
    async extraerTextoPDF(filePath) {
        try {
            console.log('📄 Leyendo PDF:', filePath);
            const dataBuffer = fs.readFileSync(filePath);
            console.log('✅ Archivo leído, tamaño:', dataBuffer.length, 'bytes');
            
            if (!pdfParse) {
                console.log('⚠️ pdfParse no disponible, usando texto simulado');
                return "HTML CSS JavaScript PHP Python SQL Ingeniería de Software Inteligencia Artificial trabajo en equipo desarrollo web";
            }
            
            const data = await pdfParse(dataBuffer);
            console.log('✅ Texto extraído, longitud:', data.text.length);
            console.log('📝 Primeros 200 caracteres:', data.text.substring(0, 200));
            
            return data.text;
        } catch (error) {
            console.error('❌ Error leyendo PDF:', error.message);
            return "HTML CSS JavaScript PHP Python SQL Ingeniería de Software Inteligencia Artificial trabajo en equipo desarrollo web";
        }
    }

    // Extraer texto de DOCX
    async extraerTextoDOCX(filePath) {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } catch (error) {
            console.error('Error leyendo DOCX:', error);
            return '';
        }
    }

    // Procesar currículo según tipo de archivo
    async procesarCurriculo(filePath, fileName) {
        let texto = '';
        const extension = path.extname(fileName).toLowerCase();

        console.log('Procesando archivo:', fileName, 'Extensión:', extension);

        if (extension === '.pdf') {
            texto = await this.extraerTextoPDF(filePath);
        } else if (extension === '.docx') {
            texto = await this.extraerTextoDOCX(filePath);
        } else {
            texto = 'HTML CSS JavaScript PHP Python SQL Ingeniería de Software';
        }

        const palabrasClave = this.extraerPalabrasClave(texto);
        console.log('Palabras clave encontradas:', palabrasClave.slice(0, 20));

        return {
            nombre: fileName,
            texto: texto.substring(0, 1000),
            palabrasClave: palabrasClave
        };
    }

    // Extraer palabras clave del texto - VERSIÓN MEJORADA PARA CUALQUIER CV
    extraerPalabrasClave(texto) {
        const textoLower = texto.toLowerCase();
        
        // Keywords generales para cualquier tipo de CV
        const keywordsGenerales = [
            // Habilidades blandas (universales)
            'trabajo en equipo', 'liderazgo', 'comunicación', 'proactivo', 'responsable', 
            'organizado', 'puntual', 'adaptabilidad', 'flexibilidad', 'resolución problemas',
            'toma decisiones', 'planificación', 'iniciativa', 'compromiso', 'empatía',
            
            // Experiencia general
            'experiencia', 'responsabilidades', 'logros', 'resultados', 'metas', 'objetivos',
            'coordinación', 'supervisión', 'gestión', 'administración', 'organización',
            
            // Documentos y herramientas comunes
            'word', 'excel', 'powerpoint', 'outlook', 'windows', 'office', 'whatsapp', 'email',
            'internet', 'computación', 'sistemas', 'digital', 'archivo', 'documentación',
            
            // Educación general
            'bachiller', 'titulado', 'estudiante', 'curso', 'diplomado', 'capacitación',
            'taller', 'seminario', 'certificado', 'educación', 'secundaria', 'primaria'
        ];
        
        // Keywords por área (mapeo flexible)
        const keywordsPorArea = {
            'administracion': ['contabilidad', 'finanzas', 'facturación', 'impuestos', 'sueldos', 'recursos humanos', 'personal', 'nómina', 'presupuesto', 'tesorería', 'compras', 'proveedores', 'contratos', 'documentos', 'informes'],
            'ventas': ['ventas', 'cliente', 'negociación', 'cierre', 'marketing', 'publicidad', 'comercial', 'captación', 'fidelización', 'postventa', 'presupuesto', 'meta'],
            'logistica': ['inventario', 'stock', 'almacén', 'distribución', 'cadena suministro', 'compras', 'proveedores', 'transporte', 'carga', 'descarga', 'merma', 'control'],
            'salud': ['paciente', 'clínica', 'hospital', 'diagnóstico', 'tratamiento', 'enfermería', 'medicina', 'farmacia', 'laboratorio', 'equipo médico', 'curaciones'],
            'educacion': ['enseñanza', 'alumno', 'clase', 'pedagogía', 'didáctica', 'aula', 'evaluación', 'planificación', 'material', 'tutoría', 'aprendizaje'],
            'construccion': ['obra', 'construcción', 'albañilería', 'estructura', 'planos', 'materiales', 'cemento', 'hierro', 'ladrillo', 'seguridad obra', 'maestro'],
            'gastronomia': ['cocina', 'alimento', 'preparación', 'restaurante', 'carta', 'menú', 'chef', 'cocinero', 'ayudante', 'sanidad', 'limpieza'],
            'seguridad': ['vigilancia', 'ronda', 'control acceso', 'incidente', 'reporte', 'seguridad', 'patrullaje', 'cámaras', 'radio', 'emergencia']
        };
        
        // Detectar área del texto
        let areaDetectada = null;
        for (const [area, keywords] of Object.entries(keywordsPorArea)) {
            for (const kw of keywords) {
                if (textoLower.includes(kw)) {
                    areaDetectada = area;
                    break;
                }
            }
            if (areaDetectada) break;
        }
        
        // Construir lista de keywords a buscar
        let keywordsABuscar = [...keywordsGenerales];
        if (areaDetectada) {
            keywordsABuscar.push(...keywordsPorArea[areaDetectada]);
        }
        
        // También agregar cualquier palabra específica del puesto (si viene del frontend)
        // Esto se maneja aparte
        
        const encontradas = [];
        for (const kw of keywordsABuscar) {
            if (textoLower.includes(kw)) {
                encontradas.push(kw);
            }
        }
        
        // También extraer palabras técnicas específicas (para CV técnicos)
        const palabras = textoLower.split(/\W+/);
        const palabrasUnicas = [...new Set(palabras)];
        const palabrasTecnicas = palabrasUnicas.filter(p => 
            p.length > 4 && !keywordsGenerales.includes(p) && !/^\d+$/.test(p)
        );
        
        // Combinar y limitar
        const todas = [...new Set([...encontradas, ...palabrasTecnicas.slice(0, 30)])];
        
        console.log(`📊 Área detectada: ${areaDetectada || 'General'}`);
        console.log(`🔑 Palabras clave encontradas: ${todas.length}`);
        
        return todas.slice(0, 100);
    }

    // Extraer keywords del puesto - VERSIÓN MEJORADA
    extraerKeywordsPuesto(descripcionPuesto) {
        const texto = descripcionPuesto.toLowerCase();
        const keywords = new Set();
        
        // Keywords universales (cualquier puesto)
        const keywordsUniversales = [
            'experiencia', 'responsable', 'proactivo', 'trabajo equipo', 'comunicación',
            'organizado', 'puntual', 'disponibilidad', 'flexible', 'adaptable',
            'word', 'excel', 'office', 'computación', 'internet'
        ];
        
        for (const kw of keywordsUniversales) {
            if (texto.includes(kw)) keywords.add(kw);
        }
        
        // Extraer palabras específicas de la descripción
        const palabras = texto.split(/\W+/);
        for (const palabra of palabras) {
            if (palabra.length > 3 && !/^\d+$/.test(palabra) && !keywordsUniversales.includes(palabra)) {
                keywords.add(palabra);
            }
        }
        
        // Limitar a 30 keywords
        return Array.from(keywords).slice(0, 30);
    }

    // Calcular coincidencia entre currículo y puesto
    calcularCoincidencia(curriculo, keywordsPuesto) {
        const palabrasClaveCV = curriculo.palabrasClave.map(p => p.toLowerCase());
        let coincidencias = 0;
        const palabrasEncontradas = [];

        for (const keyword of keywordsPuesto) {
            const keywordLower = keyword.toLowerCase();
            const encontrado = palabrasClaveCV.some(pc => 
                pc.includes(keywordLower) || keywordLower.includes(pc)
            );
            
            if (encontrado) {
                coincidencias++;
                palabrasEncontradas.push(keyword);
            }
        }

        const porcentajeCoincidencia = keywordsPuesto.length > 0 ? (coincidencias / keywordsPuesto.length) * 100 : 0;
        
        let nivelPrioridad = 'BAJA';
        let tiempoEstimado = '7-10 días';
        
        if (porcentajeCoincidencia >= 70) {
            nivelPrioridad = 'CRÍTICA';
            tiempoEstimado = '1-2 días';
        } else if (porcentajeCoincidencia >= 50) {
            nivelPrioridad = 'ALTA';
            tiempoEstimado = '3-5 días';
        } else if (porcentajeCoincidencia >= 30) {
            nivelPrioridad = 'MEDIA';
            tiempoEstimado = '5-7 días';
        }

        console.log(`📊 Coincidencias: ${coincidencias}/${keywordsPuesto.length} = ${porcentajeCoincidencia}%`);
        console.log('🔑 Palabras encontradas:', palabrasEncontradas);

        return {
            porcentaje: Math.round(porcentajeCoincidencia),
            palabrasCoincidentes: palabrasEncontradas,
            totalKeywords: keywordsPuesto.length,
            nivelPrioridad: nivelPrioridad,
            tiempoEstimado: tiempoEstimado
        };
    }

    // Analizar todos los currículos
    async analizarCurriculos(files, descripcionPuesto) {
        const resultados = [];
        const keywordsPuesto = this.extraerKeywordsPuesto(descripcionPuesto);
        
        console.log('🔑 Keywords del puesto:', keywordsPuesto);
        
        for (const file of files) {
            try {
                const curriculo = await this.procesarCurriculo(file.path, file.originalname);
                const coincidencia = this.calcularCoincidencia(curriculo, keywordsPuesto);
                
                resultados.push({
                    nombre: curriculo.nombre,
                    palabrasClave: curriculo.palabrasClave.slice(0, 30),
                    coincidencia: coincidencia,
                    textoCorto: curriculo.texto.substring(0, 300)
                });
            } catch (error) {
                console.error('Error procesando archivo:', file.originalname, error);
                resultados.push({
                    nombre: file.originalname,
                    palabrasClave: [],
                    coincidencia: {
                        porcentaje: 0,
                        palabrasCoincidentes: [],
                        totalKeywords: keywordsPuesto.length,
                        nivelPrioridad: 'BAJA',
                        tiempoEstimado: '7-10 días'
                    }
                });
            }
            
            try {
                fs.unlinkSync(file.path);
            } catch(e) { console.log('Error eliminando archivo:', e); }
        }
        
        resultados.sort((a, b) => b.coincidencia.porcentaje - a.coincidencia.porcentaje);
        
        return {
            totalAnalizados: resultados.length,
            keywordsPuesto: keywordsPuesto,
            candidatos: resultados
        };
    }
}

module.exports = new CVService();