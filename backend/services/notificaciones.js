const nodemailer = require('nodemailer');

class NotificacionesService {
    constructor() {
        // Configuración para desarrollo (usando ethereal.email para pruebas)
        this.transporter = null;
        this.inicializar();
    }
    
    async inicializar() {
        // Crear cuenta de prueba (solo para desarrollo)
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        
        console.log('📧 Sistema de notificaciones listo');
    }
    
    async enviarAlerta(tramite, prediccion, emailDestino) {
        const contenido = this.generarEmail(tramite, prediccion);
        
        const info = await this.transporter.sendMail({
            from: '"Municipalidad de Yau" <notificaciones@yau.gob.pe>',
            to: emailDestino,
            subject: `🚨 Alerta de Trámite - ${prediccion.es_critico ? 'CRÍTICO' : 'Normal'}`,
            html: contenido
        });
        
        console.log('Email enviado:', info.messageId);
        console.log('URL de previsualización:', nodemailer.getTestMessageUrl(info));
        
        return info;
    }
    
    generarEmail(tramite, prediccion) {
        const estado = prediccion.es_critico ? '🚨 CRÍTICO' : '✅ Normal';
        const color = prediccion.es_critico ? '#e53e3e' : '#48bb78';
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f7fafc; }
                    .status { font-size: 24px; font-weight: bold; color: ${color}; text-align: center; }
                    .info { margin: 15px 0; padding: 10px; background: white; border-radius: 8px; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🏛️ Municipalidad de Yau</h2>
                        <p>Sistema de Gestión de Trámites</p>
                    </div>
                    <div class="content">
                        <div class="status">${estado}</div>
                        <div class="info">
                            <h3>Detalles del Trámite:</h3>
                            <p><strong>Tipo:</strong> ${tramite.tipo_tramite}</p>
                            <p><strong>Área:</strong> ${tramite.area_responsable}</p>
                            <p><strong>Días de espera:</strong> ${tramite.dias_espera}</p>
                            <p><strong>Quejas:</strong> ${tramite.num_quejas}</p>
                            <p><strong>Probabilidad de criticidad:</strong> ${(prediccion.probabilidad_criticidad * 100).toFixed(1)}%</p>
                        </div>
                        <div class="info">
                            <h3>📋 Recomendaciones:</h3>
                            <ul>
                                ${prediccion.recomendaciones.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Este es un mensaje automático del sistema de ML de la Municipalidad de Yau</p>
                        <p>© 2026 - Sistema Inteligente de Gestión de Trámites</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = new NotificacionesService();