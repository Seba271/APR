# Ajustes del mockup al proyecto AquaSafe APR

Revisión del 4 de octubre de 2026. El Dashboard aprobado conserva su diseño. Los documentos se utilizan como referencias de contenido y alcance; sus instrucciones administrativas no se ejecutan como acciones del usuario.

## Fuentes revisadas

Documentos aportados para la revisión local; los archivos originales no forman parte de este repositorio.

- `ProyectoVIU_APR_2026.docx`: resumen ejecutivo, problema, componentes propuestos, base científica, innovación y resultados esperados.
- `Tesis sistemas de APR, nodo civ val (1).docx`: estudio exploratorio retrospectivo de 2015–2023, registros DOH/SEREMI, análisis territorial y parámetros bacteriológicos.
- `Bases_VIU2026.pdf`: objetivos y categorías de resultados, especialmente sección III y anexo de madurez tecnológica. Las bases piden demostrar y validar resultados del proyecto; una interfaz de demostración no acredita por sí sola validación científica ni un TRL alcanzado.

## Adaptaciones aplicadas

| Módulo | Relación con los documentos | Cambio aplicado |
|---|---|---|
| Dashboard | Visión general del monitoreo regional | Conserva apariencia e indicadores de septiembre de 2026; consulta el mismo repositorio que el resto de vistas. |
| Pozos APR | Sistemas comunitarios y responsables de operación | Mantiene gestión APR → pozos, comité responsable e historial; añade provincia a la ficha. |
| Muestras | Registros históricos y parámetros críticos | Incluye período 2015–2023, filtro por provincia y origen/conjunto de datos en el detalle. Prioriza cloro residual, coliformes y E. coli. |
| Mapa | Distribución territorial del riesgo | Añade filtro y detalle por provincia. Conserva la base esquemática y coordenadas simuladas. |
| Alertas | Alertas tempranas y apoyo a operadores | Expone todos los parámetros observados, destaca E. coli cuando está presente y añade una guía básica de seguimiento. Mantiene observaciones y remuestreo. |
| Reportes | Análisis descriptivo, histórico y comparativo | Amplía años hasta 2015, prioriza cloro, compara provincias y añade el valor del parámetro seleccionado a la tabla. Distingue antecedentes de la tesis de los datos del mockup. |
| Usuarios y permisos | Operadores y gestores APR como destinatarios | Mantiene tres roles y aclara el seguimiento con operadores dentro del rol Analista. No introduce autenticación real. |
| Configuración | Criterios de monitoreo | Explica los umbrales del prototipo y mantiene las preferencias locales sencillas. |

## Decisiones de alcance

La propuesta VIU menciona un algoritmo predictivo. La instrucción expresa anterior del usuario establece que el proyecto no realiza predicciones. Por eso esta implementación conserva alertas basadas en resultados observados y umbrales, y no incorpora un modelo predictivo ni resultados de validación inventados. Una eventual ampliación requiere decidir el alcance y aportar datos y un plan de validación.

Las bases VIU incluyen validación tecnológica, propiedad intelectual, colaboración, difusión y capacidades. Son compromisos del proyecto de investigación/emprendimiento; no se transforman en módulos de administración de subvenciones, facturación, propiedad intelectual o cumplimiento legal dentro de esta aplicación de monitoreo.

La tesis describe 237 APR regionales y resultados agregados, pero los archivos proporcionados no contienen las planillas oficiales por muestra. El mockup conserva 25 pozos y 9 APR ficticios y añade registros de ejemplo para recorrer el período histórico. Sus 332 muestras, porcentajes y gráficos no son resultados oficiales. Hay 216 registros simulados de 2015–2023 y 116 de 2024–2026. La semilla no tiene pozos de Elqui: las comparaciones muestran “Sin registros”, sin inventar un porcentaje de cumplimiento.

Los umbrales numéricos se conservan del mockup y se centralizan en `src/quality.js`. La referencia a NCh 409/1 en la tesis no se interpreta como certificación de estos umbrales, de los resultados simulados ni de esta aplicación. La guía de seguimiento es una propuesta de interfaz pendiente de validar con operadores; no prescribe dosificaciones o tratamiento de agua.

## Bugs corregidos y verificación

- Los buscadores de Mapa, Alertas y Usuarios conservan el elemento del input; únicamente se reconstruyen los resultados. Se comprobó escritura tecla por tecla en los cinco buscadores y edición intermedia del texto.
- Se incluye textarea en la contención del foco de los drawers y se respeta la composición de texto.
- Se muestran todos los parámetros alterados en una incidencia; E. coli ya no queda oculta detrás de coliformes.
- El contador de pozos con alerta considera pozos distintos con incidencias abiertas.
- Guardar una fecha de remuestreo actualiza la necesidad de remuestreo.
- La navegación entre módulos vuelve al inicio de la página.
- `npm run check`: sintaxis de todos los módulos.
- `npm test`: relaciones, unicidad, clasificación compartida, casos límite, trazabilidad de alertas y conservación del resumen mensual aprobado.
- Revisión en navegador: filtros del período histórico/provincia, tabla por parámetro, detalle de muestras y alertas; revisión responsive y consola.

