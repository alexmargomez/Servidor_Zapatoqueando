const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/views/admin');
const files = ['AdminRoutes.vue', 'AdminPlaces.vue', 'AdminPosters.vue', 'LoginView.vue', 'AdminLayout.vue'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Botones primarios verdes -> Botones minimalistas negros/oscuros (Premium)
  content = content.replace(/bg-green-700 hover:bg-green-800 text-white font-bold (py-[^\s]+) (px-[^\s]+) rounded-lg shadow/g, 'bg-gray-900 hover:bg-black text-white font-medium $1 $2 rounded-xl shadow-sm');
  
  // Otra variante común de botones
  content = content.replace(/bg-green-600 hover:bg-green-700 text-white font-bold (py-[^\s]+) (px-[^\s]+) rounded-lg/g, 'bg-gray-900 hover:bg-black text-white font-medium $1 $2 rounded-xl shadow-sm');

  // Labels
  content = content.replace(/font-bold text-gray-700/g, 'font-medium text-gray-500 text-sm');
  
  // Inputs/Textareas/Selects normales y las variaciones que hicimos
  content = content.replace(/px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none/g, 'px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all');
  
  // Inputs en el componente de rutas que tienen transition-colors
  content = content.replace(/px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors/g, 'px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
