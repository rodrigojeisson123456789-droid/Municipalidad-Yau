const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const db = require('../database');

// Generar reporte PDF
router.get('/pdf', async (req, res) => {
    try {
        const tramites = await db.getUltimosTramites(20);
        const stats = await db.getEstadisticasReales();
        
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_tramites.pdf');
        
        doc.pipe(res);
        
        // Encabezado
        doc.fontSize(20).text('Municipalidad de Yau', { align: 'center' });
        doc.fontSize(16).text('Reporte de Trámites con Machine Learning', { align: 'center' });
        doc.moveDown();
        
        // Estadísticas
        doc.fontSize(14).text('Estadísticas Generales:', { underline: true });
        doc.fontSize(12).text(`Total de consultas: ${stats.total_consultas || 0}`);
        doc.text(`Trámites críticos: ${stats.total_criticos || 0}`);
        doc.text(`Probabilidad promedio: ${stats.probabilidad_promedio || 0}%`);
        doc.moveDown();
        
        // Lista de trámites
        doc.fontSize(14).text('Últimos Trámites:', { underline: true });
        doc.moveDown();
        
        if (tramites.length === 0) {
            doc.text('No hay trámites registrados aún.');
        } else {
            tramites.forEach((t, index) => {
                doc.fontSize(10).text(`${index + 1}. ${t.tipo_tramite} - ${t.area_responsable}`);
                doc.text(`   Días espera: ${t.dias_espera} | Quejas: ${t.num_quejas} | Crítico: ${t.es_critico ? 'Sí' : 'No'}`);
                doc.text(`   Fecha: ${new Date(t.fecha_consulta).toLocaleString()}`);
                doc.moveDown(0.5);
            });
        }
        
        doc.end();
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: error.message });
    }
});

// Exportar a Excel
router.get('/excel', async (req, res) => {
    try {
        const tramites = await db.getUltimosTramites(100);
        
        // Crear HTML para Excel
        let excelHtml = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Trámites - Municipalidad de Yau</title>
                <style>
                    th { background: #1e3a5f; color: white; padding: 10px; }
                    td { padding: 8px; border-bottom: 1px solid #ccc; }
                    table { border-collapse: collapse; width: 100%; }
                </style>
            </head>
            <body>
                <h1>Municipalidad Provincial de Yau</h1>
                <h2>Reporte de Trámites Evaluados</h2>
                <p>Fecha de exportación: ${new Date().toLocaleString()}</p>
                <table border="1">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo de Trámite</th>
                            <th>Área Responsable</th>
                            <th>Días de Espera</th>
                            <th>N° Quejas</th>
                            <th>Monto (S/)</th>
                            <th>Estado</th>
                            <th>Probabilidad</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (tramites.length === 0) {
            excelHtml += `<tr><td colspan="8" style="text-align: center;">No hay registros disponibles</td></tr>`;
        } else {
            tramites.forEach(t => {
                excelHtml += `
                    <tr>
                        <td>${new Date(t.fecha_consulta).toLocaleString()}</td>
                        <td>${t.tipo_tramite || ''}</td>
                        <td>${t.area_responsable || ''}</td>
                        <td>${t.dias_espera || 0}</td>
                        <td>${t.num_quejas || 0}</td>
                        <td>S/ ${(t.monto_involucrado || 0).toLocaleString()}</td>
                        <td style="color: ${t.es_critico ? 'red' : 'green'}; font-weight: bold;">${t.es_critico ? 'CRÍTICO' : 'NORMAL'}</td>
                        <td>${((t.probabilidad || 0) * 100).toFixed(1)}%</td>
                    </tr>
                `;
            });
        }
        
        excelHtml += `
                    </tbody>
                </table>
                <br>
                <p><strong>Resumen:</strong></p>
                <ul>
                    <li>Total de trámites: ${tramites.length}</li>
                    <li>Trámites críticos: ${tramites.filter(t => t.es_critico).length}</li>
                    <li>Trámites normales: ${tramites.filter(t => !t.es_critico).length}</li>
                </ul>
                <p>Generado por: Sistema de Gestión de Trámites - Municipalidad de Yau</p>
            </body>
            </html>
        `;
        
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_tramites.xls');
        res.send(excelHtml);
        
    } catch (error) {
        console.error('Error generando Excel:', error);
        res.status(500).json({ 
            error: 'Error al generar el reporte Excel',
            mensaje: error.message 
        });
    }
});

module.exports = router;    