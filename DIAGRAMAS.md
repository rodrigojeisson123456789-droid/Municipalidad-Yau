# 📐 DIAGRAMAS DE ARQUITECTURA - MUNICIPALIDAD DE YAU

## DIAGRAMA 1: ARQUITECTURA GENERAL DEL SISTEMA
┌─────────────────────────────────────────────────────────────────────────────┐
│ USUARIO / CIUDADANO │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ FRONTEND (index.html) │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │
│ │ │ Evaluación │ │ Dashboard │ │ Historial │ │ │
│ │ │ ML │ │ Analítico │ │ │ │ │
│ │ └──────────────┘ └──────────────┘ └──────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ │ HTTP / API │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ BACKEND (Node.js + Express) │ │
│ │ PORT 3001 │ │
│ │ │ │
│ │ ┌──────────────────────────────────────────────────────────────┐ │ │
│ │ │ RUTAS / ENDPOINTS │ │ │
│ │ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │ │
│ │ │ │ /tramites │ │ /tramites │ │ /tramites │ │ /reportes │ │ │ │
│ │ │ │ /predecir │ │ /tipos │ │ /historial │ │ /pdf /excel│ │ │ │
│ │ │ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │ │ │
│ │ └──────────────────────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌─────────────────────┐ ┌─────────────────────────────────┐ │ │
│ │ │ ML Service │◄───│ Reglas de Negocio │ │ │
│ │ │ (predictor) │ │ (Score de criticidad) │ │ │
│ │ └─────────────────────┘ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ BASE DE DATOS (SQLite3) │ │
│ │ tramites.db │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐│ │
│ │ │ Tabla: tramites ││ │
│ │ │ ├── id (PK) ││ │
│ │ │ ├── tipo_tramite ││ │
│ │ │ ├── area_responsable ││ │
│ │ │ ├── dias_espera ││ │
│ │ │ ├── num_quejas ││ │
│ │ │ ├── monto_involucrado ││ │
│ │ │ ├── es_critico ││ │
│ │ │ ├── probabilidad ││ │
│ │ │ └── fecha_consulta ││ │
│ │ └─────────────────────────────────────────────────────────────────┘│ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘


---

## DIAGRAMA 2: FLUJO DE PROCESAMIENTO ML

┌─────────────────────────┐
│ INGRESO DE DATOS │
│ (Formulario Web) │
└───────────┬─────────────┘
│
▼
┌─────────────────────────┐
│ VALIDACIÓN DE DATOS │
│ (Campos requeridos) │
└───────────┬─────────────┘
│
▼
┌─────────────────────────────────────────────────────┐
│ CÁLCULO DE SCORE DE CRITICIDAD │
│ │
│ ┌─────────────────────────────────────────────────┐│
│ │ Días espera > 20 → +40 puntos ││
│ │ Días espera > 15 → +20 puntos ││
│ │ Quejas > 3 → +30 puntos ││
│ │ Quejas > 1 → +15 puntos ││
│ │ Monto > 30,000 → +30 puntos ││
│ │ Monto > 15,000 → +15 puntos ││
│ │ Tipo crítico → +20 puntos ││
│ │ Fin de mes → +15 puntos ││
│ │ Feriados cercanos → +10 c/u ││
│ └─────────────────────────────────────────────────┘│
└───────────────────────────┬─────────────────────────┘
│
▼
┌─────────────────────────────────┐
│ ¿Score ≥ 50 puntos? │
└───────────┬─────────┬───────────┘
│ │
Sí │ │ No
▼ ▼
┌─────────────────┐ ┌─────────────────┐
│ 🚨 CRÍTICO │ │ ✅ NORMAL │
│ Prioridad ALTA │ │ Flujo regular │
└────────┬────────┘ └────────┬────────┘
│ │
└──────────┬─────────┘
▼
┌─────────────────────────────────────────┐
│ GENERAR RESULTADOS │
│ - Probabilidad de criticidad (0-100%) │
│ - Recomendaciones automáticas │
│ - Timestamp de evaluación │
└───────────────────┬─────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ GUARDAR EN BASE DE DATOS │
│ tramites.db │
└───────────────────┬─────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ MOSTRAR RESULTADO AL USUARIO │
│ + NOTIFICACIÓN FLOTANTE │
│ + ACTUALIZAR DASHBOARD │
│ + ACTUALIZAR HISTORIAL │
└─────────────────────────────────────────┘


---

## DIAGRAMA 3: ESTRUCTURA DE LA BASE DE DATOS

┌─────────────────────────────────────────────────────────────────────────────┐
│ TABLA: tramites │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────────────────┬─────────────────────────────────┐│
│ │ CAMPO │ TIPO │ DESCRIPCIÓN ││
│ ├─────────────┼─────────────────────────┼─────────────────────────────────┤│
│ │ id │ INTEGER (PK) │ Identificador único ││
│ │ tipo_tramite│ TEXT │ Licencia/Comercial/Queja/etc ││
│ │ area_ │ TEXT │ Urbanismo/Comercio/etc ││
│ │ responsable │ │ ││
│ │ dias_espera │ INTEGER │ Días transcurridos ││
│ │ num_quejas │ INTEGER │ Cantidad de quejas ││
│ │ monto_ │ REAL │ Monto en Soles ││
│ │ involucrado │ │ ││
│ │ es_fin_de_ │ INTEGER (0/1) │ ¿Es fin de mes? ││
│ │ mes │ │ ││
│ │ dias_ │ INTEGER │ Feriados cercanos ││
│ │ feriados_ │ │ ││
│ │ cercanos │ │ ││
│ │ es_critico │ INTEGER (0/1) │ ¿Trámite crítico? ││
│ │ probabilidad│ REAL │ Porcentaje de criticidad ││
│ │ fecha_ │ DATETIME │ Fecha y hora de consulta ││
│ │ consulta │ │ ││
│ └─────────────┴─────────────────────────┴─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘


---

## DIAGRAMA 4: FLUJO DE USUARIO (UX)

┌─────────────────────────────────────┐
│ INICIO (index.html) │
└─────────────────┬───────────────────┘
│
▼
┌─────────────────────────────────────┐
│ SELECCIONAR TAB │
└─────────────────┬───────────────────┘
│
┌─────────────────────────┼─────────────────────────┐
│ │ │
▼ ▼ ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ EVALUACIÓN ML │ │ DASHBOARD │ │ HISTORIAL │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ 1. Completar │ │ 1. Ver gráficos: │ │ 1. Ver tabla de │
│ formulario │ │ - Por tipo │ │ registros │
│ 2. Click evaluar │ │ - Por área │ │ 2. Exportar a │
│ 3. Ver resultado │ │ - Evolución │ │ Excel │
│ 4. Leer │ │ - Criticidad │ │ 3. Descargar │
│ recomendaciones│ │ 2. Analizar │ │ reporte │
│ 5. Ver notificación│ │ tendencias │ │ │
└───────────────────┘ └───────────────────┘ └───────────────────┘
│ │ │
└─────────────────────────┼─────────────────────────┘
│
▼
┌─────────────────────────────────────┐
│ FINALIZAR SESIÓN │
│ (Cerrar navegador o continuar) │
└─────────────────────────────────────┘


---

## DIAGRAMA 5: ENDPOINTS API

┌─────────────────────────────────────────────────────────────────────────────┐
│ API REST (PORT 3001) │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ GET /api │ │
│ │ └── Lista de todos los endpoints disponibles │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ GET /api/health │ │
│ │ └── Verificar estado del servidor │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ GET /api/tramites/tipos │ │
│ │ └── Obtener lista de tipos y áreas │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ POST /api/tramites/predecir │ │
│ │ ├── Body: { tipo_tramite, area_responsable, dias_espera, ... } │ │
│ │ └── Response: { exito, datos_tramite, prediccion } │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ GET /api/tramites/estadisticas │ │
│ │ └── Obtener estadísticas del sistema │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ GET /api/tramites/historial │ │
│ │ └── Obtener últimos 50 trámites evaluados │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ GET /api/reportes/pdf │ │
│ │ └── Descargar reporte en formato PDF │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ GET /api/reportes/excel │ │
│ │ └── Descargar reporte en formato Excel (XLS) │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘


---


---

## 📊 TABLA DE TECNOLOGÍAS

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| **Frontend** | HTML5 | - | Estructura de la página |
| | CSS3 | - | Estilos y diseño responsivo |
| | JavaScript | ES6 | Lógica del cliente |
| | Chart.js | 4.4 | Gráficos interactivos |
| | Font Awesome | 6.4 | Iconos |
| **Backend** | Node.js | v18+ | Servidor |
| | Express | 4.18 | Framework web |
| | SQLite3 | - | Base de datos |
| | PDFKit | - | Generación de PDF |
| **Infraestructura** | Localhost | Puerto 3001 | Servidor local |
