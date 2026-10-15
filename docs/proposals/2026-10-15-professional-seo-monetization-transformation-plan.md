# Plan de transformación SEO, monetización y centro profesional de robotARQ

**Fecha:** 15 de octubre de 2026  
**Estado:** propuesta para aprobación visual y funcional  
**Alcance:** arquitectura pública, adquisición orgánica, directorio profesional, perfiles destacados, oportunidades y cobro a profesionales.

## Resultado buscado

robotARQ mantendrá el presupuesto técnico como puerta principal y añadirá una segunda unidad de negocio coherente: una red de empresas y técnicos que reciben oportunidades derivadas de expedientes previamente definidos. La página `/profesionales` no será una segunda portada ni una landing de captación: será el **Centro de Profesionales interno de robotARQ**, al que se llega desde “Ver toda la red”. Su prioridad será permitir al usuario buscar, filtrar, comparar y abrir perfiles. Dentro del mismo centro habrá una entrada claramente diferenciada al espacio del profesional para gestionar perfil, portfolio, oportunidades, ofertas, visibilidad y facturación. `/para-profesionales` será la página comercial y SEO que explique cómo conseguir obras, precios y garantías.

El sistema debe conseguir tres conversiones medibles:

1. Cliente que describe una obra, genera el presupuesto y solicita profesionales.
2. Profesional que crea y completa un perfil verificable.
3. Profesional que paga por visibilidad destacada o por acceder a una oportunidad cualificada.

## Arquitectura objetivo

### Demanda: clientes y propietarios

- `/`: presupuesto primero y escaparate profesional secundario.
- `/estimador`: generación del expediente.
- `/presupuesto-reforma` y calculadoras especializadas: captación por necesidad y tipo de obra.
- `/profesionales`: centro público de búsqueda y comparación.
- `/profesionales/[especialidad]`: categorías con contenido, filtros y perfiles reales.
- `/profesionales/ficha/[slug]`: perfiles públicos aprobados.

### Oferta: empresas, autónomos y técnicos

- `/para-profesionales`: propuesta de valor y captación orgánica.
- `/para-profesionales/precios`: perfil gratuito, destacados y créditos.
- `/para-profesionales/como-funciona`: recorrido de las oportunidades.
- `/para-profesionales/garantia-contactos`: condiciones de devolución.
- `/para-profesionales/perfil-destacado`: visibilidad en portada y directorio.
- `/para-profesionales/[especialidad]`: páginas editoriales para búsquedas de obras por oficio.
- `/profesionales/alta`: conversión y registro.
- `/profesionales/panel`: perfil, facturación, créditos, invitaciones y propuestas; siempre privado y `noindex`.

### Administración

- Revisión y aprobación de perfiles.
- Gestión de documentación y caducidades.
- Configuración de planes, precios y créditos.
- Asignación de posiciones destacadas.
- Validación y apertura de oportunidades.
- Devolución de créditos y resolución de incidencias.
- Métricas separadas de clientes, profesionales y liquidez del marketplace.

## Modelo comercial aprobado para construir

### Perfil Básico — 0 €

Ficha pública aprobada, especialidades, cobertura, seis imágenes, acceso al panel, avisos y consulta anonimizada de oportunidades. No aparece en el carrusel principal ni obtiene prioridad pagada.

### Profesional Destacado — 39 €/mes más IVA

Rotación en el carrusel de portada y en el bloque destacado de `/profesionales`, prioridad dentro de una especialidad y zona, hasta 30 imágenes, estadísticas y dos créditos mensuales.

### Profesional Destacado Plus — 69 €/mes más IVA

Mayor frecuencia de exposición, una categoría y hasta tres provincias, cinco créditos, alertas prioritarias e informe mensual. Se activará cuando exista suficiente inventario y tráfico.

### Oportunidades cualificadas

| Valor orientativo del expediente | Acceso profesional |
| --- | ---: |
| Hasta 3.000 € | 5 € |
| 3.001–15.000 € | 9 € |
| 15.001–50.000 € | 15 € |
| 50.001–150.000 € | 25 € |
| Más de 150.000 € | 39 € |

El profesional ve gratuitamente el alcance anonimizado, la zona aproximada, el presupuesto orientativo, el calendario y el número de invitados. El cobro se produce al acceder al contacto validado o aceptar formalmente la oportunidad. El contacto se limita a cuatro profesionales.

### Garantía

Se restituyen créditos por contacto inexistente, cliente no localizable durante 72 horas, duplicado, obra cancelada antes del acceso o clasificación sustancialmente incorrecta. No se restituyen porque otro profesional resulte elegido o porque el precio no sea aceptado.

## Fase 0 — Base técnica, medición y reglas

**Objetivo:** impedir que el crecimiento cree duplicados, cobros ambiguos o páginas indexables sin contenido.

- Consolidar el registro de URLs, canonicals, metadatos y fechas reales de modificación.
- Resolver solapamientos entre `/profesionales-reformas`, `/empresas-reformas`, `/empresas-constructoras` y `/constructoras` mediante una matriz de intención y redirecciones 301.
- Eliminar canonicals heredadas de la portada en rutas privadas.
- Mantener cuentas, administración, expedientes e invitaciones fuera del sitemap y con `noindex`.
- Definir eventos sin datos personales: búsqueda, filtro, perfil visto, alta iniciada, alta enviada, oportunidad vista, compra iniciada, crédito usado, contacto validado y propuesta presentada.
- Crear estados y reglas de elegibilidad para perfiles básicos, destacados, suspendidos y pendientes.
- Definir facturación, IVA, renovación, cancelación, devoluciones y trazabilidad administrativa antes de aceptar pagos.

**Criterio de salida:** todas las rutas públicas y privadas tienen intención, canonical, política de indexación y evento de conversión definidos.

## Fase 1 — Centro profesional y arquitectura SEO pública

**Objetivo:** lanzar un centro de búsqueda y gestión profesional completo aunque el inventario inicial sea pequeño.

- Reconstruir `/profesionales` como centro interno del directorio, siguiendo el prototipo entregado.
- Incorporar cabecera contextual de búsqueda, buscador por oficio y zona, categorías visuales, carrusel destacado, cuadrícula completa, filtros, comparación, explicación de verificación y recorrido para contratar.
- Añadir un bloque “Espacio profesional” con accesos a gestionar ficha, portfolio, zonas y servicios, oportunidades, propuestas, plan destacado, créditos, facturas y estadísticas. Las herramientas privadas exigirán sesión profesional.
- Mostrar las mismas posiciones destacadas pagadas en portada y en `/profesionales`; la frecuencia puede variar por relevancia, pero la contratación cubre ambos escaparates.
- Mantener plazas disponibles cuando una categoría no tenga profesionales, claramente diferenciadas de empresas reales.
- Crear `/para-profesionales`, `/para-profesionales/precios`, `/como-funciona`, `/garantia-contactos` y `/perfil-destacado`.
- Crear las primeras páginas por intención: empresas de reformas, constructoras, arquitectos técnicos, electricistas, fontaneros, locales y construcción industrial.
- Añadir enlaces recíprocos entre presupuesto, categoría profesional y captación de profesionales.
- Incorporar `BreadcrumbList`, `Service` e `ItemList` solo cuando existan elementos reales.
- Regenerar sitemap con URLs canónicas 200 e incluir `lastmod` real.
- Añadir bloques editoriales y preguntas visibles que respondan tanto a “buscar profesional” como a “conseguir obras”.

**Criterio de salida:** `/profesionales` funciona como un verdadero centro de descubrimiento en móvil y escritorio, todas las páginas nuevas pasan las puertas de contenido y no hay perfiles ficticios presentados como reales.

## Fase 2 — Perfiles públicos, verificación y portfolio

**Objetivo:** convertir el alta en una ficha pública fiable y útil para decidir.

- Transformar el alta en un asistente guardable: cuenta, empresa, servicios, cobertura, experiencia, portfolio, documentación, preferencias y vista previa.
- Procesar imágenes: firma real, tamaño, orientación, eliminación de EXIF, miniaturas, duplicados y revisión.
- Separar datos públicos de documentos privados.
- Añadir informe automático de integridad y señales para revisión humana.
- Construir cola administrativa para aprobar, solicitar correcciones, rechazar, suspender y controlar caducidades.
- Publicar `/profesionales/ficha/[slug]` solo al aprobarse el perfil.
- Añadir galería, servicios, cobertura, acreditaciones comprobadas y explicación precisa de cada sello.
- Introducir `ProfilePage` con `Person` u `Organization` según corresponda.

**Criterio de salida:** ninguna ficha se publica por pago ni automáticamente; cada perfil público tiene contenido suficiente, portfolio revisado y estado verificable.

## Fase 3 — Suscripciones, destacados y créditos

**Objetivo:** activar ingresos recurrentes y por rendimiento sin deteriorar la confianza.

- Integrar proveedor de pagos, facturas e historial de movimientos.
- Lanzar perfil fundador a 29 €/mes durante 60 días y conservar ese precio doce meses para las altas admitidas.
- Activar plan Destacado de 39 €/mes y preparar Plus de 69 €/mes.
- Etiquetar cada posición pagada como `Destacado` o `Patrocinado`.
- Crear reglas de rotación por relevancia, zona, especialidad, verificación, disponibilidad y plan.
- Implementar compra y saldo de créditos: 1 por 5 €, 5 por 23 €, 12 por 50 € y 30 por 110 €.
- Aplicar coste según valor estimado del expediente y mostrarlo antes de confirmar.
- Automatizar devoluciones objetivas y permitir resolución administrativa con auditoría.
- Añadir panel de impresiones, visitas, contactos y consumo; no prometer resultados mínimos sin datos.

**Criterio de salida:** cada cobro tiene concepto, IVA, factura, consentimiento, historial, cancelación y política de devolución verificables.

## Fase 4 — Oportunidades y contratación privada

**Objetivo:** cerrar el circuito entre presupuesto y oferta profesional.

- Validar identidad y contacto del cliente antes de comercializar una oportunidad.
- Clasificar expediente por especialidad, zona, presupuesto, plazo y complejidad.
- Recomendar candidatos y permitir selección administrativa de hasta cuatro.
- Mostrar expediente anonimizado antes de cobrar.
- Descontar créditos en el momento definido por la política comercial.
- Recibir propuestas cerradas con base, IVA, plazo, validez, inclusiones y exclusiones.
- Mantener precios privados entre empresas.
- Permitir adjudicación y registrar el resultado.
- Ofrecer contratación gestionada como servicio diferenciado, con honorario previo y explícito.

**Criterio de salida:** un expediente real puede recorrer cliente → validación → profesionales → ofertas → adjudicación con trazabilidad completa.

## Fase 5 — Expansión orgánica y optimización

**Objetivo:** crecer solo donde existan demanda e inventario.

- Publicar ciudades cuando tengan contenido propio, profesionales reales y señales de demanda.
- Crear páginas por oficio y ciudad únicamente si superan las puertas editoriales.
- Revisar Search Console a 7, 21 y 45 días de cada grupo publicado.
- Probar mensajes, orden de tarjetas y precio destacado mediante experimentos controlados.
- Ajustar coste por oportunidad según respuesta, devolución, cierre y valor; nunca solo por impresiones.
- Publicar casos de éxito únicamente con autorización y resultados demostrables.

**Criterio de salida:** las expansiones generan impresiones no vinculadas a marca, interacción y oportunidades; las páginas sin utilidad se mejoran, consolidan o retiran.

## Diseño funcional del Centro `/profesionales`

Orden de la página:

1. Cabecera del Centro de Profesionales con búsqueda por especialidad y zona; debe leerse como una sección interna de robotARQ, no como otra portada del dominio.
2. Acciones para el usuario: “Buscar en la red” y “Generar presupuesto para mi obra”.
3. Banda de confianza: presupuesto previo, perfiles revisados, ofertas privadas y datos protegidos.
4. Categorías visuales.
5. Profesionales destacados con explicación de que son posiciones pagadas.
6. Directorio completo con filtros, orden y estado de inventario.
7. Explicación del recorrido para contratar.
8. Valor de robotARQ frente a un directorio convencional.
9. Espacio profesional con acceso a ficha, portfolio, cobertura, oportunidades, ofertas, visibilidad, créditos, facturas y estadísticas.
10. Captación profesional compacta con plan gratuito y plan destacado desde 39 €/mes; la explicación comercial extensa vive en `/para-profesionales`.
11. Preguntas frecuentes e interconexión con las landings SEO.

## Indicadores de decisión

- Altas iniciadas, completadas, enviadas y aprobadas.
- Coste de adquisición por profesional aprobado.
- Perfiles con portfolio completo.
- Búsquedas sin resultados por categoría y zona.
- Impresiones, clics y contactos por tarjeta destacada.
- Conversión de oportunidad vista a acceso comprado.
- Contactos respondidos y créditos devueltos.
- Propuestas y adjudicaciones.
- Ingreso medio mensual y cancelación por profesional.
- Demanda orgánica no vinculada a marca en España.

## Puertas de publicación

- Ninguna cifra, valoración, profesional, proyecto o acreditación ficticia se presenta como real.
- Ningún perfil pagado evita la verificación.
- Ninguna página local o de especialidad se indexa por existir una combinación de palabras.
- Las páginas sin profesionales pueden indexarse solo si contienen una guía útil y original; una cuadrícula vacía por sí sola no es suficiente.
- La etiqueta de destacado es visible y no se confunde con el sello de verificación.
- La página mantiene como acción principal del dominio la generación de presupuesto.

