#!/bin/bash
# Script para completar el despliegue después de agregar facturación

echo "🚀 Completando despliegue de Hevy MCP en Fly.io..."
echo "================================================"

# Verificar estado de la app
echo "📊 Verificando estado actual..."
fly status --app hevy-mcp

# Verificar secretos
echo "🔐 Verificando secretos..."
fly secrets list --app hevy-mcp

# Desplegar
echo "🚀 Iniciando despliegue..."
fly deploy --dockerfile Dockerfile.flyio --app hevy-mcp

# Verificar salud
echo "🏥 Verificando salud del servidor..."
sleep 30
curl -f https://hevy-mcp.fly.dev/health

# Probar endpoint MCP
echo "📡 Probando endpoint MCP..."
curl -X POST https://hevy-mcp.fly.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"help","params":{}}'

echo ""
echo "✅ ¡Despliegue completado!"
echo "🌐 URL: https://hevy-mcp.fly.dev"
echo "📊 Monitoreo: https://fly.io/apps/hevy-mcp/monitoring"
