#!/bin/bash

echo "🔄 Actualizando Hevy MCP Server..."

# Ir al directorio del proyecto
cd ~/hevy-mcp

# Guardar cambios locales si los hay
git stash

# Obtener últimos cambios
echo "📥 Descargando últimos cambios..."
git pull origin main

# Restaurar cambios locales si los había
git stash pop 2>/dev/null || true

# Instalar dependencias nuevas (si las hay)
echo "📦 Instalando dependencias..."
npm install

# Compilar el proyecto
echo "🏗️ Compilando proyecto..."
npm run build

# Reiniciar servidor con PM2
echo "♻️ Reiniciando servidor..."
pm2 restart hevy-mcp

# Ver estado
echo "✅ Actualización completada"
pm2 status

# Mostrar logs
echo ""
echo "📋 Últimos logs:"
pm2 logs hevy-mcp --lines 10 --nostream

