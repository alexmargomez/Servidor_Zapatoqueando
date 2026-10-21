# 🗺️ Plataforma Zapatoqueando

**Zapatoqueando** es una plataforma web moderna, interactiva y autogestionable orientada al turismo y la exploración territorial. Diseñada originalmente para el municipio de Zapatoca (Santander, Colombia), esta plataforma ofrece un ecosistema completo para mapear lugares de interés, trazar rutas interactivas y mostrar anuncios comerciales o turísticos.

La visión de esta herramienta trasciende a un solo lugar: **es un sistema altamente escalable que puede ser replicado y adaptado para cualquier otro municipio, ciudad o región** que busque digitalizar su oferta turística y comercial mediante mapas amigables.

![Node.js 20](https://img.shields.io/badge/Node.js-20_Alpine-339933?logo=nodedotjs&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue_3-Composition_API-4FC08D?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-REST_API-000000?logo=express&logoColor=white)
![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-5.22-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15_Alpine-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900?logo=leaflet&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker-Multi--Container-2496ED?logo=docker&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-Hexagonal_(Ports_%26_Adapters)-8A2BE2)
![Unit Tests](https://img.shields.io/badge/Tests-41_Passing_(Jest_%2B_ts--jest)-C21325?logo=jest&logoColor=white)

---

## ✨ Características Principales

- 📍 **Mapeo Dinámico y Categorizado:** Los lugares se pueden agregar en el mapa con colores únicos dependiendo de su categoría (*Hospedajes*, *Restaurantes*, *CafeBar*, *Fuentes de soda*, *Lugares turísticos*, *Puntos de interés*).
- 🛣️ **Gestor de Rutas Avanzado (GeoJSON):** Trazado de rutas punto a punto sobre el mapa con cálculo de color (`RouteColorVO`), dificultad, duración y geometría `LineString`.
- 📱 **Panel de Administración (Backoffice `/admin`) y Acceso Discreto:** Vista privada protegida con JWT donde cualquier gestor puede añadir, editar o eliminar lugares, publicidad (eventos/comercios) y rutas, con botón discreto de acceso rápido (`Login` / `Panel Admin`) integrado en la barra superior del mapa.
- 🔍 **Buscador y Filtros Multi-línea en Tiempo Real:** Búsqueda instantánea y *chips* interactivos con ajuste responsivo (`flex-wrap`) para filtrar categorías en el mapa sin recortes en pantallas móviles o de escritorio.
- 🗺️ **Caché Local de Tiles OpenStreetMap y Vectores Viales:** Proxy de teselas con almacenamiento en caché local (`public/map-cache/`) y descarga/sembrado automático de la red vial de Zapatoca vía Overpass API (`osmtogeojson`).
- ⚡ **Integración Nativa con ALpanel (`Git Pull & Restart`):**
  - Sincronización automática de puertos (`PORT`, `POSTGRES_PORT`) y credenciales desde `.env`.
  - El *healthcheck* de `zapatoqueando-db` sincroniza automáticamente `POSTGRES_PASSWORD` en el volumen persistente `pgdata` si cambia en `.env`.
  - Volúmenes de código (`./src`, `./prisma`, `./public`) montados en caliente y compilación automática de TypeScript (`tsc`) al iniciar el contenedor, permitiendo desplegar cambios con **`Git Pull & Restart`** sin necesidad de reconstruir la imagen Docker.

---

## 🚀 Uso en Otros Municipios

El diseño agnóstico del mapa de **Zapatoqueando** (impulsado por coordenadas satelitales vía OpenStreetMap) permite que la aplicación se adapte a **cualquier geografía**. 

Si un municipio como Barichara, Villa de Leyva o cualquier otra localidad desea usar la plataforma, solo se necesita:
1. Cambiar las coordenadas iniciales de centrado en el archivo principal del mapa.
2. Reemplazar los textos estáticos principales (Ej: Cambiar "Zapatoca" por el nombre de la nueva región).
3. Vaciar la base de datos y comenzar a cargar los nuevos comercios, puntos de interés y rutas.

Al ser *Open Source / Libre*, cualquier Alcaldía, oficina de turismo o emprendedor local puede clonar este proyecto y tener su propio portal geográfico moderno en cuestión de horas.

---

## 💻 Tecnologías y Arquitectura

La plataforma está construida utilizando un ecosistema moderno Fullstack separando responsabilidades entre Frontend y Backend:

### Frontend (`frontend/`)
- **[Vue.js 3 (Composition API)](https://vuejs.org/) & [Vue Router](https://router.vuejs.org/)** - Framework reactivo SPA para el mapa público y panel administrativo (`/admin`).
- **[Vite](https://vitejs.dev/)** - Empaquetador y servidor de desarrollo ultra-rápido.
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de estilos y utilidades CSS.
- **[Leaflet](https://leafletjs.com/)** - Renderizado del mapa interactivo (OpenStreetMap).

### Backend (`src/` y `prisma/`)
- **[TypeScript](https://www.typescriptlang.org/) & [Node.js](https://nodejs.org/) ([Express](https://expressjs.com/))** - API REST tipada estáticamente.
- **Arquitectura Hexagonal (Puertos y Adaptadores — Vertical Slicing):** Organización modular bajo `src/modules/` (`users`, `places`, `posters`, `routes`, `streets`, `uploads`) separando estrictamente:
  - `domain/`: Entidades (`UserEntity`, `PlaceEntity`, `PosterEntity`, `RouteEntity`, `StreetEntity`), Value Objects (`CoordinatesVO`, `UsernameVO`, `PosterTypeVO`, `RouteColorVO`) y Excepciones de Dominio.
  - `application/`: Casos de Uso (`UseCases`) y Puertos (`RepositoryPort`, `ServicePort`).
  - `infrastructure/`: Adaptadores de Prisma ORM, Controladores Express, DTOs y Rutas HTTP.
- **[Prisma ORM](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/)** - Acceso tipado a datos y persistencia relacional (`prisma/schema.prisma`).
- **[Jest](https://jestjs.io/) (`ts-jest`)** - Suite de pruebas unitarias para Dominio y Casos de Uso (`tests/unit/`).

### ¿Por qué existen dos archivos `package.json`?
1. **`package.json` (Raíz — Backend / Servidor Node.js):** Contiene únicamente las dependencias del servidor (Express, Prisma ORM, JWT, Multer, Bcrypt, TypeScript, Jest) que se ejecutan en Node.js / Docker.
2. **`frontend/package.json` (Carpeta `frontend/` — Cliente Web Vue 3):** Contiene las dependencias que corren en el navegador y el empaquetador Vite (Vue 3, Leaflet, Swiper, TailwindCSS). Su compilado estático se deposita en `public/` para que el contenedor de producción sea ligero y no requiera dependencias de compilación de UI.

### Infraestructura
- **[Docker & Docker Compose](https://www.docker.com/)** - Contenerización del servidor y base de datos PostgreSQL.

### Estructura de Carpetas: Backend (`src/`), Frontend (`frontend/`) y Tests (`tests/`)

```text
Servidor_Zapatoqueando/
├── frontend/                                # 🎨 FRONTEND (Vue 3 Composition API + Vite + Tailwind CSS + Leaflet)
│   └── src/
│       ├── main.js                          # Punto de entrada de la SPA Vue 3
│       ├── App.vue                          # Layout raíz y enrutamiento de vistas
│       ├── router/                          # Rutas públicas (/) y protegidas (/admin, /login)
│       ├── views/
│       │   ├── HomeView.vue                 # Mapa interactivo, filtros por categoría y buscador en vivo
│       │   ├── LoginView.vue                # Autenticación JWT para administradores
│       │   └── admin/
│       │       ├── AdminLayout.vue          # Backoffice lateral para gestión territorial
│       │       ├── PlacesManager.vue        # CRUD visual de lugares y comercios en el mapa
│       │       ├── RoutesManager.vue        # Trazado y edición de rutas turísticas GeoJSON
│       │       └── PostersManager.vue       # Gestión de anuncios y eventos destacados
│       └── components/                      # Componentes reutilizables (Sliders, Modales, Tarjetas)
│
├── prisma/                                  # 🗄️ ESQUEMA PRISMA ORM
│   └── schema.prisma                        # Modelos: User, Place, Route, Poster, Street
│
├── src/                                     # ⚙️ BACKEND HEXAGONAL (TypeScript + Express + Prisma ORM)
│   ├── app.ts                               # Configuración de Express, seguridad (Helmet, Rate-Limit) y estáticos
│   ├── server.ts                            # Bootstrap del servidor, seed de admin y calles OSM
│   ├── shared/                              # 🏛️ NÚCLEO COMPARTIDO (Cross-Cutting Concerns)
│   │   ├── domain/
│   │   │   └── exceptions/domain.exception.ts # Excepción base tipada con statusCode HTTP
│   │   └── infrastructure/
│   │       ├── database/
│   │       │   ├── prisma.service.ts        # Cliente Prisma Singleton con resolución dinámica de DATABASE_URL
│   │       │   └── migrate.ts               # Inicialización automática de tablas en PostgreSQL
│   │       └── http/
│   │           ├── middlewares/             # Guardias JWT (auth.middleware.ts) y Multer (upload.middleware.ts)
│   │           └── routes/api.routes.ts     # Enrutador maestro (/api/*)
│   └── modules/                             # ⬢ MÓDULOS HEXAGONALES (Domain / Application / Infrastructure)
│       ├── users/                           # Autenticación JWT, UsernameVO, UserRepositoryPort y PrismaUserRepository
│       ├── places/                          # Lugares de interés, CoordinatesVO, PlaceEntity y CRUD casos de uso
│       ├── posters/                         # Eventos y comercios destacados, PosterTypeVO y CRUD casos de uso
│       ├── routes/                          # Rutas turísticas GeoJSON, RouteColorVO y CRUD casos de uso
│       ├── streets/                         # Red vial OpenStreetMap (GetStreetsUseCase y SeedStreetsUseCase)
│       └── uploads/                         # Almacenamiento de imágenes y caché local de tiles del mapa
│
├── tests/                                   # 🧪 PRUEBAS UNITARIAS CENTRALIZADAS (Jest + ts-jest)
│   └── unit/
│       ├── users/                           # username.vo.spec.ts, login-user y ensure-default-admin
│       ├── places/                          # coordinates.vo.spec.ts y places.use-cases.spec.ts
│       ├── posters/                         # poster-type.vo.spec.ts y posters.use-cases.spec.ts
│       ├── routes/                          # route-color.vo.spec.ts y routes.use-cases.spec.ts
│       ├── streets/                         # streets.use-cases.spec.ts
│       └── uploads/                         # upload-image.use-case.spec.ts
│
└── public/                                  # 📦 Activos estáticos servidos por Express + uploads y map-cache
```

---

## 🧪 Pruebas Unitarias Centralizadas (`tests/` + Jest)

Todas las pruebas unitarias están centralizadas en la carpeta raíz [`tests/unit/`](tests/unit/) y se ejecutan con **Jest (`jest` + `ts-jest`)**, manteniendo `src/` y `dist/` exclusivamente para código de producción.

Gracias a la **Arquitectura Hexagonal**, toda la lógica de dominio y los casos de uso se prueban de forma **100% aislada en memoria** mediante *mocks* de los puertos (`RepositoryPort`, `TokenGeneratorServicePort`, `FileStorageServicePort`), sin requerir contenedores Docker activos ni base de datos PostgreSQL conectada:

```bash
# Ejecutar las 11 suites (41 tests unitarios)
npm test

# Ejecutar con reporte de cobertura de código
npm run test:coverage
```

### Cobertura de las 11 Suites (41 Tests)
- **Dominio y Value Objects (`domain/`):**
  - `UsernameVO`: Sanitización (`trim`) y lanzamiento de `MissingCredentialsException` (`400`) ante entradas vacías.
  - `CoordinatesVO` y `PlaceEntity`: Conversión segura de coordenadas numéricas/cadenas, manejo de valores nulos y transformación a formato público (`location: { lat, lng }`) o registro crudo.
  - `PosterTypeVO` y `PosterEntity`: Normalización de tipos de anuncio (`event` / `business`) y compatibilidad de campos `image_url` / `imageurl`.
  - `RouteColorVO` y `RouteEntity`: Validación de colores hexadecimales (`#RRGGBB`) con fallback seguro (`#eab308`) y serialización a `GeoJSON Feature`.
- **Casos de Uso con Puertos Mockeados en Memoria (`application/`):**
  - `users`: `LoginUserUseCase` (autenticación exitosa con `username` o `email`, rechazo por credenciales faltantes o inválidas) y `EnsureDefaultAdminUseCase` (creación idempotente del administrador inicial).
  - `places`: `GetPlacesUseCase`, `CreatePlaceUseCase`, `UpdatePlaceUseCase` y `DeletePlaceUseCase` (incluyendo verificación de `PlaceNotFoundException` `404`).
  - `posters`: `GetPostersUseCase`, `CreatePosterUseCase`, `UpdatePosterUseCase` y `DeletePosterUseCase` (incluyendo `PosterNotFoundException` `404`).
  - `routes`: `GetRoutesUseCase`, `CreateRouteUseCase`, `UpdateRouteUseCase` y `DeleteRouteUseCase` (incluyendo `RouteNotFoundException` `404`).
  - `streets`: `GetStreetsUseCase` (extracción de geometrías GeoJSON de la red vial).
  - `uploads`: `UploadImageUseCase` (resolución de URL pública `/uploads/...` y validación `InvalidUploadException` `400`).

---

## 🛠️ Instalación y Entorno de Desarrollo (Colaboradores)

### Prerrequisitos
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/products/docker-desktop/) y [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js 20+](https://nodejs.org/) (opcional en host para correr pruebas unitarias o compilar el frontend)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/alexmargomez/Servidor_Zapatoqueando.git
cd Servidor_Zapatoqueando
```

### 2. Configurar Variables de Entorno
En la raíz del proyecto (junto al `docker-compose.yml`), crea el archivo `.env`:
```env
NODE_ENV=production
PORT=3000
POSTGRES_USER=admin
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=zapatoqueando
POSTGRES_HOST=zapatoqueando-db
POSTGRES_PORT=5432
JWT_SECRET=tu_secreto_jwt_seguro
```

### 3. Compilar el Frontend (Cuando realices cambios visuales en `frontend/`)
Si modificas vistas o componentes en `frontend/src`, compila los estáticos y cópialos a `public/` (sin borrar `public/uploads` ni `public/map-cache`):
```bash
cd frontend
npm install
npm run build
rm -rf ../public/assets ../public/index.html
cp -r dist/* ../public/
cd ..
```

### 4. Desplegar Contenedores con Docker
Levanta el servidor y la base de datos PostgreSQL:
```bash
docker compose -f docker-compose.yml up -d --build --force-recreate
```

### 5. Verificar Funcionamiento
- **Mapa Público:** [http://localhost:3000](http://localhost:3000)
- **Panel de Administración:** [http://localhost:3000/admin](http://localhost:3000/admin)

> *Nota sobre la base de datos:* Al iniciar, el contenedor compila TypeScript (`tsc`), asegura el esquema de tablas en PostgreSQL (`migrate.js`) y crea el usuario administrador inicial si la tabla `users` está vacía.

---

¡Disfruta aportando a la modernización turística de las regiones! Si encuentras algún problema, no dudes en abrir un *Issue* o proponer un *Pull Request*.
