# Resultados de pruebas de integración de EduTrack

**Fecha de ejecución:** 17 de noviembre de 2026  
**Proyecto:** EduTrack, Angular 21 standalone con SSR  
**Resultado general:** PASS para compilación, pruebas unitarias y flujos E2E existentes. La comprobación de filtros queda pendiente: la vista de Tareas no implementa filtros.

## Entorno y comandos

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Node.js | Disponible | `node --version` → `v24.14.0` |
| Docker | No disponible | `Get-Command docker` no encontró el ejecutable. EduTrack es una SPA sin base de datos ni infraestructura de contenedores, por lo que Docker no es necesario para estos flujos. |
| Playwright y Chromium | Disponibles | `npx --yes playwright install --with-deps chromium` terminó con código 0; Chromium 159.0.8154.6 (Playwright build 1255) quedó instalado. |
| Arranque | PASS | Playwright inició `npm start -- --host 127.0.0.1` y esperó disponibilidad en `http://127.0.0.1:4200`. El tiempo de arranque aislado no fue registrado. |
| Build de producción y SSR | PASS | `npm run build` → código 0; prerenderizó 6 rutas. |
| Pruebas Angular | PASS | `npm test -- --watch=false` → código 0; 4 archivos de prueba, 13 pruebas aprobadas. |
| Pruebas de navegador | PASS | `npm run test:e2e` → código 0; 3 archivos, 4 pruebas aprobadas en Chromium. |
| Higiene del diff | PASS | `git diff --check` → sin errores. |

## Flujos comprobados

| Archivo | Flujo y resultado |
|---|---|
| `e2e/navigation.spec.ts` | `/` redirige al Dashboard; navegación a Dashboard, Materias, Tareas, Calendario y Estadísticas; título y enlace activo se actualizan; una ruta desconocida redirige al Dashboard. PASS. |
| `e2e/materias-flow.spec.ts` | El formulario rechaza un nombre vacío, crea una materia con color, edita y lista el cambio; crea una tarea vinculada; muestra el contador; confirma el borrado en cascada y verifica el estado vacío. PASS. |
| `e2e/tareas-dashboard-flow.spec.ts` | El formulario rechaza título vacío; crea tarea con fecha y prioridad; comprueba Local Storage y persistencia tras recargar; cambia estado, edita y elimina; verifica las tarjetas, el porcentaje, la barra por materia y próximas entregas del Dashboard. PASS. |
| `src/app/services/edutrack.service.spec.ts` | CRUD, estadísticas calculadas con Signals, eliminación de tareas asociadas, ausencia de acceso a Local Storage en SSR, rechazo de relaciones inválidas y restauración/persistencia en entorno de navegador simulado. PASS. |
| `src/app/pages/materias/materias.spec.ts` | Alta, edición, listado, color, contador de tareas, eliminación y validación del formulario. PASS. |
| `src/app/pages/dashboard/dashboard.spec.ts` | Métricas, progreso por materia, exclusión de entregas vencidas y estados vacíos. PASS. |
| `src/app/app.spec.ts` | Render inicial, navegación y sección activa para todas las rutas. PASS. |

## Hallazgos y cobertura pendiente

1. **Filtros de tareas: no implementados.** La vista actual de Tareas no contiene controles ni lógica de filtrado (`src/app/pages/tareas`). No hay filtros existentes que se puedan ejecutar o validar; por eso esta comprobación no se contabiliza como aprobada. Queda como funcionalidad pendiente, fuera de las correcciones de pruebas realizadas.
2. **Presupuesto SCSS:** el build termina correctamente, pero Angular emite advertencias por superar el umbral configurado de 4 kB en `materias.scss` (7.02 kB), `tareas.scss` (6.00 kB), `calendario.scss` (5.09 kB), `dashboard.scss` (5.20 kB) y `estadisticas.scss` (5.26 kB). No se cambió la configuración del presupuesto.
3. **Auditoría de paquetes:** al instalar `@playwright/test`, npm informó 16 vulnerabilidades moderadas en el árbol de dependencias. No se ejecutó una remediación automática ni se atribuyen estos avisos a un defecto funcional; requieren revisión de dependencias por separado.
4. **Sin autenticación:** la aplicación no implementa autenticación, por lo que no se incluyó un flujo de credenciales.

## Errores encontrados y correcciones

En la primera ejecución E2E, dos pruebas fallaron por selectores de prueba: una intentaba pulsar directamente un input de radio visualmente oculto y otra esperaba un nombre accesible de botón distinto al texto real. Se ajustaron los selectores para interactuar con la opción visible y el botón «Editar». La ejecución final pasó las 4 pruebas; no se detectó un fallo de producción en los flujos cubiertos.

## Veredicto

```text
environment:
  docker: UNAVAILABLE — Docker CLI no encontrado; no hay infraestructura de contenedores en esta SPA
  node: AVAILABLE — v24.14.0
  playwright: AVAILABLE — v1.65.1; Chromium 159.0.8154.6 instalado
  infra-tier: NOT APPLICABLE — frontend sin base de datos ni servicios de infraestructura externos
  browser-tier: PRIMARY(Playwright) — Chromium
startup: PASS — npm start -- --host 127.0.0.1; Playwright confirmó disponibilidad en http://127.0.0.1:4200; duración aislada no registrada
integration: PASS — exit_code: 0; passed: 13, failed: 0, skipped: 0; suite Angular (4 archivos)
e2e: PASS — exit_code: 0; passed: 4, failed: 0; rutas, formularios, CRUD, Local Storage y Dashboard
filters: NOT IMPLEMENTED — no existen controles ni lógica de filtros de tareas; cobertura pendiente
overall: PASS WITH GAP — las pruebas ejecutadas pasan; el comportamiento de filtros no puede verificarse hasta que se implemente
```
