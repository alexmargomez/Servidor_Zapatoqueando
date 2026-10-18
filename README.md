# 🗺️ Plataforma Zapatoqueando

**Zapatoqueando** es una plataforma web moderna, interactiva y autogestionable orientada al turismo y la exploración territorial. Diseñada originalmente para el municipio de Zapatoca (Santander, Colombia), esta plataforma ofrece un ecosistema completo para mapear lugares de interés, trazar rutas interactivas y mostrar anuncios comerciales o turísticos.

La visión de esta herramienta trasciende a un solo lugar: **es un sistema altamente escalable que puede ser replicado y adaptado para cualquier otro municipio, ciudad o región** que busque digitalizar su oferta turística y comercial mediante mapas amigables.

---

## ✨ Características Principales

- 📍 **Mapeo Dinámico y Categorizado:** Los lugares se pueden agregar en el mapa con colores únicos dependiendo de su categoría (Hospedajes, Restaurantes, CafeBar, Fuentes de soda, Lugares turísticos, Puntos de interés).
- 🛣️ **Gestor de Rutas Avanzado:** Trazado de rutas punto a punto sobre el mapa, con cálculo de color, dificultad y distancias.
- 📱 **Panel de Administración (Backoffice):** Una vista privada y protegida (`/admin`) donde cualquier gestor sin conocimientos de código puede añadir, editar o eliminar lugares, publicidad (sliders) y rutas.
- 🔍 **Buscador y Filtros en Tiempo Real:** El usuario final puede buscar o usar *chips* interactivos para ocultar o mostrar categorías instantáneamente en el mapa.
- 🎨 **Interfaz Premium:** Diseño altamente responsivo ("mobile-first") e inmersivo, utilizando cristalografía (glassmorphism), sombras profundas y mapas estéticos que ocultan calles innecesarias hasta que el usuario hace zoom (Clean Map).

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
- **Arquitectura Hexagonal (Vertical Slicing):** Organización modular bajo `src/modules/` (`users`, `places`, `posters`, `routes`, `streets`, `uploads`) separando estrictamente:
  - `domain/`: Entidades, Value Objects (`CoordinatesVO`, `UsernameVO`, `PosterTypeVO`, `RouteColorVO`) y Excepciones de Dominio.
  - `application/`: Casos de Uso (`UseCases`) y Puertos (`RepositoryPort`, `ServicePort`).
  - `infrastructure/`: Adaptadores de Prisma ORM, Controladores Express, DTOs y Rutas HTTP.
- **[Prisma ORM](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/)** - Acceso tipado a datos y persistencia relacional (`prisma/schema.prisma`).
- **[Jest](https://jestjs.io/) (`ts-jest`)** - Suite de pruebas unitarias para Dominio y Casos de Uso (`tests/unit/`).

### ¿Por qué existen dos archivos `package.json`?
1. **`package.json` (Raíz — Backend / Servidor Node.js):** Contiene únicamente las dependencias del servidor (Express, Prisma ORM, JWT, Multer, Bcrypt, TypeScript, Jest) que se ejecutan en Node.js / Docker.
2. **`frontend/package.json` (Carpeta `frontend/` — Cliente Web Vue 3):** Contiene las dependencias que corren en el navegador y el empaquetador Vite (Vue 3, Leaflet, Swiper, TailwindCSS). Su compilado estático se deposita en `public/` para que el contenedor de producción sea ligero y no requiera dependencias de compilación de UI.

### Infraestructura
- **[Docker & Docker Compose](https://www.docker.com/)** - Contenerización del servidor y base de datos PostgreSQL.

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

### 4. Ejecutar Pruebas Unitarias (Backend Hexagonal)
La capa de Dominio y los Casos de Uso cuentan con pruebas unitarias aisladas mediante mocks de los puertos:
```bash
npm install
npm test
# O para ver el reporte de cobertura:
npm run test:coverage
```

### 5. Desplegar Contenedores con Docker
Levanta el servidor y la base de datos PostgreSQL:
```bash
docker compose -f docker-compose.yml up -d --build --force-recreate
```

### 6. Verificar Funcionamiento
- **Mapa Público:** [http://localhost:3000](http://localhost:3000)
- **Panel de Administración:** [http://localhost:3000/admin](http://localhost:3000/admin)

> *Nota sobre la base de datos:* Al iniciar, el contenedor compila TypeScript (`tsc`), asegura el esquema de tablas en PostgreSQL (`migrate.js`) y crea el usuario administrador inicial si la tabla `users` está vacía.

---

¡Disfruta aportando a la modernización turística de las regiones! Si encuentras algún problema, no dudes en abrir un *Issue* o proponer un *Pull Request*.
