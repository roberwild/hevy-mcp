#!/bin/bash

################################################################################
# Script: Limpiar Raspberry Pi y Preparar para Coolify
# Autor: Rober
# Fecha: 8 Diciembre 2025
# Descripción: Limpia configuración anterior y prepara Docker para Coolify
################################################################################

set -e  # Detener si hay error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🧹 LIMPIEZA COMPLETA DE RASPBERRY PI PARA COOLIFY            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#------------------------------------------------------------------------------
# FASE 1: LIMPIEZA DE SERVICIOS ANTERIORES
#------------------------------------------------------------------------------

echo -e "${BLUE}[1/10]${NC} 🛑 Deteniendo PM2..."
if command -v pm2 &> /dev/null; then
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    pm2 kill 2>/dev/null || true
    pm2 unstartup 2>/dev/null || true
    echo -e "${GREEN}✓ PM2 detenido y deshabilitado${NC}"
else
    echo -e "${YELLOW}⚠ PM2 no está instalado, saltando...${NC}"
fi

echo ""
echo -e "${BLUE}[2/10]${NC} 🛑 Deteniendo GitHub Actions Runner..."
if [ -d "$HOME/actions-runner" ]; then
    cd "$HOME/actions-runner"
    sudo ./svc.sh stop 2>/dev/null || true
    sudo ./svc.sh uninstall 2>/dev/null || true
    echo -e "${GREEN}✓ GitHub Actions Runner detenido${NC}"
else
    echo -e "${YELLOW}⚠ GitHub Actions Runner no encontrado, saltando...${NC}"
fi

echo ""
echo -e "${BLUE}[3/10]${NC} 🛑 Deteniendo Nginx..."
if systemctl is-active --quiet nginx; then
    sudo systemctl stop nginx
    sudo systemctl disable nginx
    echo -e "${GREEN}✓ Nginx detenido y deshabilitado${NC}"
else
    echo -e "${YELLOW}⚠ Nginx no está corriendo, saltando...${NC}"
fi

echo ""
echo -e "${BLUE}[4/10]${NC} 🗑️  Desinstalando software antiguo..."

# Desinstalar Nginx
if dpkg -l | grep -q nginx; then
    echo "  → Desinstalando Nginx..."
    sudo apt remove --purge nginx nginx-common -y &>/dev/null
    echo -e "${GREEN}  ✓ Nginx desinstalado${NC}"
fi

# Desinstalar Certbot
if dpkg -l | grep -q certbot; then
    echo "  → Desinstalando Certbot..."
    sudo apt remove --purge certbot python3-certbot-nginx -y &>/dev/null
    echo -e "${GREEN}  ✓ Certbot desinstalado${NC}"
fi

# Auto-remove
echo "  → Limpiando paquetes huérfanos..."
sudo apt autoremove -y &>/dev/null
echo -e "${GREEN}  ✓ Paquetes limpiados${NC}"

echo ""
echo -e "${BLUE}[5/10]${NC} 🗂️  Limpiando configuraciones y directorios..."

# Backup de ecosystem.config.cjs si existe (contiene API key)
if [ -f "$HOME/hevy-mcp/ecosystem.config.cjs" ]; then
    echo "  → Haciendo backup de ecosystem.config.cjs..."
    cp "$HOME/hevy-mcp/ecosystem.config.cjs" "$HOME/ecosystem.config.cjs.backup"
    echo -e "${GREEN}  ✓ Backup guardado en $HOME/ecosystem.config.cjs.backup${NC}"
fi

# Eliminar directorios (con confirmación implícita por el script)
echo "  → Eliminando /etc/nginx..."
sudo rm -rf /etc/nginx 2>/dev/null || true

echo "  → Eliminando /etc/letsencrypt..."
sudo rm -rf /etc/letsencrypt 2>/dev/null || true

echo "  → Eliminando ~/duckdns..."
rm -rf "$HOME/duckdns" 2>/dev/null || true

echo "  → Eliminando ~/hevy-mcp..."
rm -rf "$HOME/hevy-mcp" 2>/dev/null || true

echo "  → Eliminando ~/actions-runner..."
rm -rf "$HOME/actions-runner" 2>/dev/null || true

echo -e "${GREEN}✓ Directorios limpiados${NC}"

echo ""
echo -e "${BLUE}[6/10]${NC} 📅 Limpiando crontab de DuckDNS..."
# Eliminar línea de DuckDNS del crontab
(crontab -l 2>/dev/null | grep -v "duckdns" | crontab -) 2>/dev/null || true
echo -e "${GREEN}✓ Crontab limpiado${NC}"

#------------------------------------------------------------------------------
# FASE 2: ACTUALIZAR SISTEMA
#------------------------------------------------------------------------------

echo ""
echo -e "${BLUE}[7/10]${NC} 🔄 Actualizando sistema..."
sudo apt update &>/dev/null
echo -e "${GREEN}✓ Repositorios actualizados${NC}"

echo "  → Instalando actualizaciones..."
sudo apt upgrade -y &>/dev/null
echo -e "${GREEN}✓ Sistema actualizado${NC}"

#------------------------------------------------------------------------------
# FASE 3: INSTALAR DOCKER
#------------------------------------------------------------------------------

echo ""
echo -e "${BLUE}[8/10]${NC} 🐳 Verificando Docker..."

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker ya instalado: $DOCKER_VERSION${NC}"
else
    echo "  → Docker no encontrado, instalando..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh &>/dev/null
    rm /tmp/get-docker.sh
    echo -e "${GREEN}✓ Docker instalado correctamente${NC}"
fi

echo ""
echo -e "${BLUE}[9/10]${NC} 👤 Añadiendo usuario al grupo docker..."
sudo usermod -aG docker $USER
echo -e "${GREEN}✓ Usuario '$USER' añadido al grupo docker${NC}"

echo ""
echo -e "${BLUE}[10/10]${NC} 🐳 Verificando Docker Compose..."
if command -v docker compose &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    echo -e "${GREEN}✓ Docker Compose ya instalado: $COMPOSE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Docker Compose no encontrado (se instalará con Coolify)${NC}"
fi

#------------------------------------------------------------------------------
# RESUMEN FINAL
#------------------------------------------------------------------------------

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✅ LIMPIEZA Y PREPARACIÓN COMPLETADA                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ PM2 eliminado${NC}"
echo -e "${GREEN}✓ Nginx eliminado${NC}"
echo -e "${GREEN}✓ Certbot eliminado${NC}"
echo -e "${GREEN}✓ DuckDNS cron eliminado${NC}"
echo -e "${GREEN}✓ Directorios antiguos eliminados${NC}"
echo -e "${GREEN}✓ Sistema actualizado${NC}"
echo -e "${GREEN}✓ Docker instalado y configurado${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE - SIGUIENTE PASO OBLIGATORIO:${NC}"
echo ""
echo -e "${RED}Debes CERRAR esta sesión SSH y VOLVER A CONECTAR${NC}"
echo -e "${RED}para que los cambios del grupo 'docker' surtan efecto.${NC}"
echo ""
echo "Ejecuta:"
echo -e "${BLUE}  exit${NC}"
echo ""
echo "Y luego reconecta:"
echo -e "${BLUE}  ssh rober@192.168.1.210${NC}"
echo ""
echo "Después, continúa con la instalación de Coolify."
echo ""

