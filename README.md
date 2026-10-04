# APR · Prototipo de monitoreo

Los ocho módulos están disponibles: Dashboard, Pozos APR, Muestras, Mapa, Alertas, Reportes, Usuarios y permisos, y Configuración. La interfaz conserva el AppShell y el sistema visual del Dashboard aprobado.

## Ejecutar

Requiere Node.js 18 o posterior, sin dependencias adicionales.

```sh
npm run dev
```

Abrir http://127.0.0.1:5173. Ejecutar `npm run check` para revisar la sintaxis de los módulos. Si ya estaba abierta una versión anterior, recargar la pestaña.

## Módulos y rutas

- `/#dashboard`: indicadores del repositorio compartido. El resumen mensual conserva septiembre de 2026: 18 muestras, 5 no conformes, pH 7.2 y cloro 0.6 mg/L.
- `/#wells`: búsqueda, filtros, orden y paginación; creación y edición de pozos/APR; ficha e historial; representación de relaciones APR → pozos.
- `/#samples`: consulta de 332 muestras simuladas de 2015 a 2026, búsqueda, filtros combinables, orden, paginación y detalle. El detalle distingue registros históricos simulados y seguimiento desde la aplicación móvil simulada.
- `/#map`: mapa esquemático local de Coquimbo; búsqueda, filtro por comuna/estado, selección de marcadores, acercamiento, desplazamiento y acceso al detalle del pozo. La base y las coordenadas son simuladas; los marcadores cercanos se separan para facilitar su selección. No utiliza cartografía externa.
- `/#alerts`: indicadores de incidencias abiertas, tabla filtrable y ordenable; detalle, cambio de estado, observaciones y fecha de remuestreo. Resolver una alerta actualiza el contador compartido.
- `/#reports`: resumen, calidad de agua, resultados por parámetro, tendencias y comparación anual. Filtros por año, provincia, comuna, APR y análisis. El selector de parámetro controla resultados individuales y tendencias. La comparación anual incluye todos los años con los otros filtros activos. Exportación CSV con vista previa seleccionable y enlace de descarga.
- `/#users`: roles Administrador, Analista y Solo lectura; búsqueda, filtros, orden, creación y edición de cuentas. Valida nombres y correos duplicados. Los roles son información del mockup y no implementan autorización real.
- `/#settings`: organización, contacto y preferencias del panel local de notificaciones.

## Datos y límites

El repositorio central contiene 25 pozos, 9 APR, 332 muestras, 5 incidencias históricas (3 abiertas al iniciar) y 10 cuentas. De los pozos, 22 están operativos; 17 conformes, 5 en observación y 3 críticos. Hay 68 muestras de 2026 y 24 por cada año de 2015 a 2025. El período de estudio 2015–2023 tiene 216 registros simulados.

Los formularios modifican datos en memoria durante la sesión. Recargar restaura los datos iniciales. No hay Supabase, autenticación, base de datos, invitaciones, APIs ni servicios externos. Los umbrales y resultados son simulados; no representan certificados de laboratorio. No se realizan predicciones.

La exportación prepara un Blob CSV UTF-8 compatible con Excel. El navegador integrado no expuso un evento de descarga durante la verificación; se comprobó el contenido y el enlace generado. La vista previa permite copiar el contenido si el navegador no admite la descarga.

## Estructura y componentes

- `src/app.js`: integración de rutas, Dashboard, infraestructura, formularios y drawers comunes.
- `src/components.js`: AppShell, Sidebar, Topbar, PageHeader, KpiCard, StatusBadge, SearchBar, FilterButton, DataTable, Tabs, Drawer, Pagination y EmptyState.
- `src/data.js`: repositorio compartido de datos locales.
- `src/samples.js`, `map.js`, `alerts.js`, `reports.js`, `users.js`, `settings.js`: contenido y acciones de cada módulo.
- `src/module-ui.js`: composición de búsquedas/filtros, formularios, ordenamiento y tablas compartidas.
- `src/modules.js`: registro de módulos y delegación de eventos.
- `src/styles.css`: estilos y tokens del Dashboard.
- `src/modules.css`: distribución interna y adaptación de los nuevos módulos.
- `assets/reference.png`: fotografía referencial aportada por el usuario y usada en el detalle de pozo.
- `server.js`: servidor estático local.

## Verificación realizada

Sintaxis de todos los módulos; relaciones de datos y unicidad de muestras; conservación del resumen mensual aprobado; navegación por las ocho rutas; selección y ficha desde el mapa; seguimiento y resolución de alerta; creación y edición de cuenta; preferencias de notificaciones; cinco pestañas de reportes; filtros históricos y contenido CSV. Se revisó la adaptación a 390 px sin desbordamiento de página y sin errores de consola. Las tablas conservan scroll horizontal.

## Revisión documental y bugs

Consultar [ALINEACION_PROYECTO.md](docs/ALINEACION_PROYECTO.md) para ver cómo se aplicaron las ideas de los documentos VIU y la tesis, qué límites se mantuvieron y los bugs corregidos. Ejecutar `npm test` para comprobar consistencia de datos y umbrales. El buscador conserva el campo durante la actualización de resultados, evitando invertir la escritura.


