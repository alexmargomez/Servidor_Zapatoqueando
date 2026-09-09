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

## 💻 Tecnologías Utilizadas

La plataforma está construida utilizando un ecosistema moderno "Fullstack" de JavaScript:

### Frontend
- **[Vue.js 3 (Composition API)](https://vuejs.org/)** - Framework reactivo para la interfaz.
- **[Vite](https://vitejs.dev/)** - Empaquetador y servidor de desarrollo ultra-rápido.
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de estilos y utilidades CSS.
- **[Leaflet](https://leafletjs.com/)** - Librería principal para el renderizado del mapa interactivo libre (OpenStreetMap).

### Backend
- **[Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)** - API REST para la gestión de datos.
- **[PostgreSQL](https://www.postgresql.org/)** - Motor de base de datos relacional para persistir rutas, lugares y anuncios.

### Infraestructura
- **[Docker & Docker Compose](https://www.docker.com/)** - Contenerización absoluta del frontend, backend y base de datos para despliegues instantáneos.

---

## 🛠️ Instalación y Entorno de Desarrollo (Colaboradores)

Si eres un colaborador o desarrollador que se une al proyecto, la plataforma está completamente dockerizada, por lo que levantar el entorno es sumamente sencillo.

### Prerrequisitos
Debes tener instalado en tu máquina:
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clonar el Repositorio
Abre tu terminal y clona el proyecto en tu entorno local:
```bash
git clone https://github.com/tu-usuario/zapatoqueando.git
cd zapatoqueando/Servidor_Zapatoqueando
```

### 2. Configurar Variables de Entorno
En la raíz del proyecto (junto al `docker-compose.yml`), asegúrate de que el archivo `.env` exista con las credenciales de la base de datos (por ejemplo):
```env
DB_USER=postgres
DB_PASSWORD=root
DB_HOST=zapatoqueando-db
DB_PORT=5432
DB_NAME=zapatoqueando
PORT=3000
```

### 3. Compilar el Frontend (Opcional si deseas ver los cambios de UI en Producción)
Si vas a realizar cambios en la vista, debes ingresar a la carpeta `frontend`, instalar dependencias y construir los archivos estáticos.
```bash
cd frontend
npm install
npm run build

# Luego movemos el resultado a la carpeta pública del backend
rm -rf ../public/*
cp -r dist/* ../public/
cd ..
```
> *Nota:* Durante el desarrollo, puedes correr `npm run dev` en la carpeta frontend para tener un servidor de pruebas con Hot-Reload (cambios en tiempo real).

### 4. Desplegar Contenedores (Modo Producción Local)
Finalmente, levanta la orquestación de servicios mediante Docker. Esto construirá el servidor Node.js y la base de datos Postgres:
```bash
docker compose -f docker-compose.yml up -d --build --force-recreate
```

### 5. Verificar Funcionamiento
Una vez los contenedores estén corriendo, la plataforma estará disponible en:
- **Sitio Web:** [http://localhost:3000](http://localhost:3000)
- **Panel de Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)

> *Nota sobre la base de datos:* El backend está programado para crear automáticamente la estructura de tablas (`places`, `routes`, etc.) en Postgres la primera vez que arranca. No necesitas ejecutar migraciones manuales.

---

¡Disfruta aportando a la modernización turística de las regiones! Si encuentras algún problema, no dudes en abrir un *Issue* o proponer un *Pull Request*.
