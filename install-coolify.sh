#!/bin/bash

################################################################################
# Script: Instalar Coolify
# Autor: Rober
# Fecha: 8 Diciembre 2025
# Descripción: Instala Coolify en Raspberry Pi
# PREREQUISITO: Haber ejecutado cleanup-and-setup-docker.sh y reconectado SSH
################################################################################

set -e  # Detener si hay error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🚀 INSTALACIÓN DE COOLIFY                                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

#------------------------------------------------------------------------------
# VERIFICACIONES PREVIAS
#------------------------------------------------------------------------------

echo -e "${BLUE}[1/3]${NC} 🔍 Verificando requisitos previos..."

# Verificar que Docker funciona sin sudo
if ! docker ps &>/dev/null; then
    echo -e "${RED}❌ ERROR: Docker no funciona sin sudo${NC}"
    echo -e "${RED}¿Cerraste sesión SSH y volviste a conectar después del script anterior?${NC}"
    echo ""
    echo "Ejecuta:"
    echo -e "${BLUE}  exit${NC}"
    echo -e "${BLUE}  ssh rober@192.168.1.210${NC}"
    echo ""
    echo "Y luego ejecuta este script de nuevo."
    exit 1
fi

echo -e "${GREEN}✓ Docker funciona correctamente${NC}"

#------------------------------------------------------------------------------
# INSTALAR COOLIFY
#------------------------------------------------------------------------------

echo ""
echo -e "${BLUE}[2/3]${NC} 📦 Descargando e instalando Coolify..."
echo ""
echo -e "${YELLOW}⏳ Esto tardará 5-10 minutos. Por favor, espera...${NC}"
echo ""

# Instalar Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

echo ""
echo -e "${GREEN}✓ Coolify instalado correctamente${NC}"

#------------------------------------------------------------------------------
# VERIFICAR INSTALACIÓN
#------------------------------------------------------------------------------

echo ""
echo -e "${BLUE}[3/3]${NC} 🔍 Verificando instalación..."

# Esperar a que Coolify inicie (máximo 60 segundos)
echo "  → Esperando a que Coolify inicie..."
COUNTER=0
MAX_WAIT=60

while [ $COUNTER -lt $MAX_WAIT ]; do
    if docker ps | grep -q coolify; then
        echo -e "${GREEN}✓ Coolify está corriendo${NC}"
        break
    fi
    sleep 2
    COUNTER=$((COUNTER + 2))
    echo -n "."
done

echo ""

if [ $COUNTER -ge $MAX_WAIT ]; then
    echo -e "${RED}⚠️  Coolify tardó más de lo esperado en iniciar${NC}"
    echo "Verifica manualmente con: docker ps"
else
    # Mostrar contenedores
    echo ""
    echo -e "${GREEN}📦 Contenedores de Coolify corriendo:${NC}"
    docker ps --filter "name=coolify" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

#------------------------------------------------------------------------------
# OBTENER IP PÚBLICA
#------------------------------------------------------------------------------

echo ""
echo -e "${BLUE}🌐 Obteniendo IP pública...${NC}"
PUBLIC_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}✓ IP Pública: $PUBLIC_IP${NC}"

#------------------------------------------------------------------------------
# RESUMEN FINAL
#------------------------------------------------------------------------------

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✅ COOLIFY INSTALADO CORRECTAMENTE                           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 ¡Instalación completada!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📋 PRÓXIMOS PASOS:${NC}"
echo ""
echo -e "${BLUE}1. Acceder a Coolify:${NC}"
echo "   Abre tu navegador en:"
echo -e "   ${GREEN}http://$PUBLIC_IP:8000${NC}"
echo "   O desde tu red local:"
echo -e "   ${GREEN}http://192.168.1.210:8000${NC}"
echo ""
echo -e "${BLUE}2. Configurar DNS en Cloudflare:${NC}"
echo "   Ve a: https://dash.cloudflare.com/"
echo "   Añade estos registros DNS (A Records):"
echo ""
echo "   ┌─────────────┬──────────────┬────────────┬────────────┐"
echo "   │ Type        │ Name         │ Content    │ Proxy      │"
echo "   ├─────────────┼──────────────┼────────────┼────────────┤"
echo "   │ A           │ coolify      │ $PUBLIC_IP │ DNS only   │"
echo "   │ A           │ hevy         │ $PUBLIC_IP │ DNS only   │"
echo "   │ A           │ freelytics   │ $PUBLIC_IP │ DNS only   │"
echo "   └─────────────┴──────────────┴────────────┴────────────┘"
echo ""
echo -e "${BLUE}3. Configurar Port Forwarding en tu Router:${NC}"
echo "   Accede a: http://192.168.1.1"
echo "   Configura:"
echo "   - Puerto 80 → 192.168.1.210:80"
echo "   - Puerto 443 → 192.168.1.210:443"
echo ""
echo -e "${BLUE}4. Setup inicial en Coolify:${NC}"
echo "   - Email: roberto.gmourente@gmail.com"
echo "   - Password: [tu password seguro]"
echo "   - Luego: Settings → Configuration"
echo "   - FQDN: coolify.roberace.com"
echo "   - Click 'Save' y 'Restart Coolify'"
echo ""
echo -e "${BLUE}5. Esperar 2-3 minutos${NC}"
echo "   Luego acceder a:"
echo -e "   ${GREEN}https://coolify.roberace.com${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Guarda tu IP pública para referencia:"
echo -e "   ${GREEN}$PUBLIC_IP${NC}"
echo ""

