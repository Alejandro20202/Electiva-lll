# EduTrack

EduTrack es una aplicación web para organizar la vida académica en un solo espacio. Permite registrar materias y tareas, consultar una agenda de entregas y visualizar el progreso mediante estadísticas reactivas.

## Funcionalidades

### Dashboard

- Resumen de materias registradas.
- Conteo de tareas pendientes y completadas.
- Porcentaje general de progreso.
- Progreso de tareas por materia.
- Próximas entregas pendientes.

### Materias

- Crear, editar y eliminar materias.
- Registrar nombre, profesor, descripción y color identificador.
- Mostrar la cantidad de tareas asociadas a cada materia.
- Eliminar automáticamente las tareas asociadas al eliminar una materia.

### Tareas

- Crear, editar y eliminar tareas.
- Asociar tareas a una materia.
- Registrar descripción, fecha de entrega, prioridad y estado.
- Cambiar rápidamente una tarea entre pendiente y completada.
- Buscar tareas por título.
- Filtrar por materia, prioridad y estado.
- Limpiar todos los filtros con un solo control.

### Agenda académica

- Agrupar tareas por fecha de entrega.
- Identificar entregas próximas, vencidas, completadas y sin fecha.
- Mostrar materia, prioridad, estado, fecha y descripción.
- Consultar un resumen de entregas próximas y vencidas.

### Estadísticas

- Progreso general de tareas completadas.
- Distribución de actividades por materia.
- Barras de progreso por asignatura.
- Distribución de tareas por prioridad.
- Conteo de tareas sin materia asignada.

### Persistencia

- Los datos se guardan en `localStorage` del navegador.
- La información se conserva entre sesiones en el mismo navegador.
- El servicio valida la estructura de los datos restaurados antes de utilizarlos.

## Tecnologías

- Angular 21.
- TypeScript 5.9.
- Angular Router con carga lazy de páginas.
- Angular Signals y `computed` para estado reactivo.
- Formularios reactivos con `ReactiveFormsModule`.
- SCSS para estilos por componente.
- Angular SSR y prerenderizado.
- RxJS para eventos de navegación.
- Vitest mediante el builder de pruebas de Angular.
- npm como gestor de paquetes.

## Requisitos previos

- Node.js compatible con Angular 21.
- npm instalado.
- Navegador moderno con soporte para `localStorage`.

La versión del gestor de paquetes utilizada por el proyecto está declarada en `package.json`:

```text
npm@11.9.0
```

## Instalación

1. Clona el repositorio y entra en la carpeta del proyecto:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Electiva-lll
   ```

2. Instala las dependencias usando el lockfile:

   ```bash
   npm ci
   ```

## Ejecución en desarrollo

Inicia el servidor local con:

```bash
npm start
```

Después abre [http://localhost:4200](http://localhost:4200).

También puedes utilizar Angular CLI directamente:

```bash
npx ng serve
```

La aplicación recarga automáticamente los cambios realizados en los archivos fuente.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo con Angular. |
| `npm run build` | Genera la compilación de producción y los bundles SSR. |
| `npm run watch` | Compila en modo desarrollo y observa cambios. |
| `npm test` | Ejecuta las pruebas unitarias mediante Angular/Vitest. |
| `npm run serve:ssr:edutrack` | Inicia el servidor SSR después de ejecutar el build. |

## Compilación

Para generar los artefactos de producción:

```bash
npm run build
```

Los resultados se generan en `dist/edutrack`.

Para ejecutar la salida SSR después de compilar:

```bash
npm run serve:ssr:edutrack
```

## Pruebas

Ejecuta la suite de pruebas con:

```bash
npm test
```

Las pruebas existentes cubren principalmente:

- Creación, edición y eliminación de materias y tareas.
- Estadísticas calculadas mediante Signals.
- Persistencia en Local Storage.
- Validación de referencias a materias existentes.
- Eliminación de tareas asociadas a una materia.
- Resumen y progreso del dashboard.
- Navegación entre las secciones principales.

No hay un framework de pruebas end-to-end configurado actualmente.

## Estructura del proyecto

```text
src/
├── app/
│   ├── layout/
│   │   └── app-shell/
│   │       ├── app-shell.html
│   │       ├── app-shell.scss
│   │       └── app-shell.ts
│   ├── models/
│   │   ├── materia.model.ts
│   │   └── tarea.model.ts
│   ├── pages/
│   │   ├── calendario/
│   │   ├── dashboard/
│   │   ├── estadisticas/
│   │   ├── materias/
│   │   └── tareas/
│   ├── services/
│   │   ├── edutrack.service.spec.ts
│   │   └── edutrack.service.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.ts
├── index.html
├── main.server.ts
├── main.ts
├── server.ts
└── styles.scss
```

### Organización de la aplicación

- `models/`: interfaces y tipos de materias y tareas.
- `services/`: estado compartido, operaciones CRUD, Signals y persistencia.
- `pages/`: páginas funcionales cargadas de forma lazy por ruta.
- `layout/`: shell principal, navegación lateral y encabezado.
- `styles.scss`: estilos globales y reglas base de accesibilidad.

## Rutas principales

| Ruta | Sección |
| --- | --- |
| `/dashboard` | Resumen de actividad académica. |
| `/materias` | Administración de materias. |
| `/tareas` | Administración, búsqueda y filtrado de tareas. |
| `/calendario` | Agenda académica agrupada por fecha. |
| `/estadisticas` | Progreso y distribución de actividades. |

Las rutas se cargan mediante `loadComponent` para mantener los bundles de cada sección separados.

## Arquitectura y decisiones técnicas

### Estado reactivo

`EduTrackService` mantiene los arreglos de materias y tareas con Signals privados y expone versiones de solo lectura. Las métricas derivadas —totales, pendientes, completadas y porcentajes— se calculan con `computed`.

Las páginas de tareas, calendario y estadísticas crean sus propias señales derivadas para filtros, agrupaciones y distribuciones sin duplicar la fuente de datos.

### Persistencia local

Los datos se almacenan bajo la clave `edutrack-data` con una versión de almacenamiento. El servicio evita acceder a `localStorage` durante SSR y restaura la información en el navegador después del renderizado inicial.

### Componentes standalone

Las páginas utilizan componentes standalone y declaran explícitamente sus imports, como `ReactiveFormsModule` y `RouterLink`. La detección de cambios está configurada como `OnPush`.

## Contribuciones

### Alejandro Molina

Usuario Git: `Alejandro20202`

- Inicialización del proyecto Angular.
- Estructura visual y navegación principal.
- Modelos de datos, Signals base y persistencia en Local Storage.
- CRUD de materias.
- Dashboard académico.

### David Ordoñez

Usuario Git: `EstebanR26`

- CRUD completo de tareas.
- Agenda académica y agrupación de entregas por fecha.
- Estadísticas de progreso y distribución por materia.
- Búsqueda por título y filtros por materia, prioridad y estado.

Las contribuciones anteriores se identifican a partir del historial de commits y ramas del repositorio.

## Flujo de trabajo Git

El proyecto utiliza ramas de funcionalidad y una rama de integración:

```text
feature/<funcionalidad> → develop → main
```

- `feature/*`: desarrollo aislado de cada funcionalidad.
- `develop`: integración y validación de funcionalidades.
- `main`: versión estable o entrega final.

## Contribuir

1. Crea una rama a partir de `develop`:

   ```bash
   git switch develop
   git pull origin develop
   git switch -c feature/nombre-de-la-funcionalidad
   ```

2. Implementa los cambios manteniendo el alcance de la funcionalidad.
3. Ejecuta la compilación y las pruebas:

   ```bash
   npm run build
   npm test
   ```

4. Registra los cambios con un mensaje descriptivo:

   ```bash
   git add .
   git commit -m "feat: describir el cambio"
   ```

5. Abre un Pull Request hacia `develop` incluyendo descripción, validaciones y posibles advertencias.

## Licencia

Este proyecto fue desarrollado con fines académicos para la asignatura Electiva Proyecto Final. No se ha definido una licencia de distribución pública.
