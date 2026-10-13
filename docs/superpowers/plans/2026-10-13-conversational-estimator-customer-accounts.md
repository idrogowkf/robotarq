# Plan de implementación

1. Crear pruebas de contrato para preguntas adaptativas, cuentas, sesiones y límite de tres presupuestos.
2. Implementar `lib/intake.mjs` y `/api/intake` con salida estructurada, opciones de mercado, texto libre y máximo de tres rondas.
3. Convertir `EstimadorClient` en un flujo con modal difuminado, estados de análisis, preguntas adaptativas y continuidad hasta el presupuesto.
4. Implementar almacenamiento cifrado de clientes, autenticación y rutas de alta, acceso, cierre y perfil.
5. Exigir sesión al crear expedientes, asociarlos al cliente y aplicar el cupo gratuito de tres.
6. Sustituir la captura libre por alta/acceso y la llamada «Hablar con un profesional para estudiar y contratar esta obra».
7. Crear `/mi-cuenta` con perfil, cupo e historial de presupuestos y descargas firmadas.
8. Ejecutar pruebas, lint, build, prueba integral local y verificación en producción.
