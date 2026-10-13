# Estimador conversacional y cuentas de clientes

## Objetivo

Convertir la generación directa en una conversación técnica breve que detecte decisiones con impacto económico antes de presupuestar. El cliente ve el presupuesto completo, pero debe crear una cuenta o iniciar sesión para guardarlo y descargar PDF/Excel. Cada cuenta gratuita puede registrar tres presupuestos.

## Conversación técnica

Al pulsar «Generar», la interfaz cubre el estimador con un fondo difuminado y un panel robotARQ. Un clasificador rápido analiza el tipo de obra y devuelve preguntas estructuradas, específicas y basadas en opciones habituales del mercado. Para una caseta eléctrica debe distinguir, entre otras posibilidades, obra in situ, prefabricada de hormigón, metálica, panel sándwich/PVC u otro sistema; después pregunta por suministro, transporte, descarga, montaje, cimentación y alcance eléctrico cuando sean relevantes.

Las preguntas admiten opciones y texto libre, incluido «No lo sé, recomiéndamelo». Las respuestas se incorporan al contexto y se hace una segunda comprobación. El sistema puede preguntar de nuevo, con un máximo de tres rondas, o declarar el alcance suficientemente definido. Mientras llama a los servicios muestra estados de progreso. El presupuesto conserva el formato actual.

## Cuentas e historial

Las cuentas de clientes se guardan cifradas en Blob. La contraseña se deriva con scrypt y la sesión usa una cookie HttpOnly firmada. El perfil contiene nombre, apellidos, correo, teléfono, NIF/CIF y empresa opcional. La creación de expedientes requiere sesión; el servidor toma los datos del perfil y no confía en los datos enviados por el navegador.

La cuenta ofrece un historial privado con referencia, fecha, proyecto, total, estado y nuevas descargas firmadas. El límite gratuito es de tres expedientes. El presupuesto visible no consume cupo; guardarlo y desbloquear documentos sí.

## Captación y monetización

La llamada principal será «Hablar con un profesional para estudiar y contratar esta obra». Ese interés crea un lead diferenciado del uso de descarga. En la fase inicial robotARQ monetiza el acceso del profesional al lead cualificado, con información técnica y zona visibles antes de aceptar, contacto privado y trazabilidad administrativa. No se introduce cobro en esta entrega.

## Seguridad y pruebas

Los perfiles y expedientes permanecen cifrados. Las rutas de cuenta limitan intentos, validan origen y no devuelven hashes. Se probarán clasificación de preguntas, recomendación no técnica, contraseña y sesión, límite de tres expedientes, aislamiento entre clientes y el recorrido navegador → API → almacenamiento → historial.
