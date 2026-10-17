const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Directorio base de caché dentro de public
const CACHE_DIR = path.join(__dirname, '../../public/map-cache');

// Asegurarse de que el directorio principal de caché exista
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

router.get('/:z/:x/:y', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    
    // El cliente (Leaflet) pedirá algo como 15/345/678.jpg
    const tileDir = path.join(CACHE_DIR, z, x);
    const fileName = y; // ej: 678.jpg
    const filePath = path.join(tileDir, fileName);
    
    // Si la imagen ya existe localmente, la servimos con máxima caché (1 año)
    if (fs.existsSync(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.sendFile(filePath);
    }
    
    // Si no existe, limpiamos el .jpg para armar la URL de Google
    const yNumber = y.replace('.jpg', '');
    const googleUrl = `http://mt0.google.com/vt/lyrs=s&hl=es&x=${x}&y=${yNumber}&z=${z}`;
    
    const response = await axios({
      method: 'get',
      url: googleUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000 // 5 segundos máximo para evitar atascos
    });
    
    // Crear el directorio específico (ej: public/map-cache/15/345/) si no existe
    if (!fs.existsSync(tileDir)) {
      fs.mkdirSync(tileDir, { recursive: true });
    }
    
    // Guardar el flujo (stream) en el archivo local
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    writer.on('finish', () => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.sendFile(filePath);
    });
    
    writer.on('error', (err) => {
      console.error(`[TileProxy] Error guardando tile ${z}/${x}/${y}:`, err);
      // Fallback: Redirigir directamente a Google si falla al guardar
      res.redirect(googleUrl);
    });

  } catch (error) {
    // Si Google bloquea temporalmente o hay error, fallar elegantemente
    console.error(`[TileProxy] Error descargando tile:`, error.message);
    const yNumber = req.params.y.replace('.jpg', '');
    const googleUrl = `http://mt0.google.com/vt/lyrs=s&hl=es&x=${req.params.x}&y=${yNumber}&z=${req.params.z}`;
    res.redirect(googleUrl);
  }
});

module.exports = router;
