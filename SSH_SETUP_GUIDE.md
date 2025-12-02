# 🔐 Guía Completa: Configurar SSH con GitHub

## 📌 ¿Por qué usar SSH en lugar de HTTPS?

| Característica | HTTPS | SSH |
|---------------|-------|-----|
| **Pide contraseña** | ✅ Sí, cada vez | ❌ No, nunca |
| **Seguridad** | ⭐⭐⭐ Buena | ⭐⭐⭐⭐⭐ Excelente |
| **Velocidad** | Normal | Más rápido |
| **Automatización** | Difícil | Muy fácil |
| **Tokens de acceso** | Necesario | No necesario |
| **Profesional** | Básico | ✅ Profesional |

---

## 🎯 Objetivo

Al finalizar esta guía, podrás hacer `git pull` en la Raspberry Pi **sin introducir contraseña nunca más**.

---

## 📋 Requisitos Previos

- ✅ Raspberry Pi con acceso SSH
- ✅ Git instalado
- ✅ Cuenta de GitHub
- ✅ Proyecto `hevy-mcp` ya clonado

---

## 🚀 Paso a Paso

### Paso 1: Conectar a la Raspberry Pi

Desde tu PC Windows (PowerShell o CMD):

```bash
ssh rober@192.168.1.141
```

Introduce tu contraseña cuando te la pida.

---

### Paso 2: Verificar si ya tienes claves SSH

```bash
ls -la ~/.ssh
```

**Si ves archivos como `id_rsa`, `id_ed25519`, etc.**:
- Ya tienes claves generadas
- Puedes usarlas o generar unas nuevas

**Si ves "No such file or directory"**:
- No tienes claves aún
- Continúa al siguiente paso

---

### Paso 3: Generar nueva clave SSH

```bash
ssh-keygen -t ed25519 -C "tu_email@gmail.com"
```

**Importante**: Cambia `tu_email@gmail.com` por tu email real de GitHub.

**Preguntas que te hará:**

1. **"Enter file in which to save the key"**
   - Presiona `Enter` (usa la ubicación por defecto)

2. **"Enter passphrase"**
   - **Opción A (Recomendada)**: Deja en blanco (presiona `Enter`) para no usar contraseña
   - **Opción B (Más segura)**: Introduce una contraseña (tendrás que introducirla la primera vez que uses la clave en cada sesión)

3. **"Enter same passphrase again"**
   - Presiona `Enter` de nuevo (o repite la contraseña si elegiste la opción B)

**Salida esperada:**

```
Generating public/private ed25519 key pair.
Your identification has been saved in /home/rober/.ssh/id_ed25519
Your public key has been saved in /home/rober/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx tu_email@gmail.com
The key's randomart image is:
+--[ED25519 256]--+
|    .o+.         |
|   . + .         |
|  . . o .        |
|   . . .         |
|    .   S        |
|   . . o         |
|  . . o .        |
| . . . .         |
|  .     .        |
+----[SHA256]-----+
```

---

### Paso 4: Copiar la clave pública

```bash
cat ~/.ssh/id_ed25519.pub
```

**Salida (ejemplo):**

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx tu_email@gmail.com
```

**¡COPIA TODA ESA LÍNEA!** (empieza con `ssh-ed25519` y termina con tu email)

**Métodos para copiar:**

1. **Desde PowerShell/SSH**: Selecciona el texto con el ratón y presiona `Ctrl+C`
2. **Desde terminal local**: El mismo texto se puede copiar directamente

---

### Paso 5: Añadir la clave a GitHub

#### 5.1: Ir a la configuración de SSH en GitHub

1. Abre tu navegador
2. Ve a: **https://github.com/settings/keys**
3. O navega: GitHub → Settings (tu perfil) → SSH and GPG keys

#### 5.2: Añadir nueva clave

1. Click en **"New SSH key"** (botón verde)
2. Completa el formulario:

   - **Title**: `Raspberry Pi - Hevy MCP Server`
     (Puedes poner cualquier nombre descriptivo)
   
   - **Key type**: Deja `Authentication Key` seleccionado
   
   - **Key**: Pega la clave que copiaste (la línea completa que empieza con `ssh-ed25519`)

3. Click en **"Add SSH key"**

4. **Confirma con tu contraseña de GitHub** si te la pide

---

### Paso 6: Verificar la conexión SSH con GitHub

De vuelta en la terminal de la Raspberry Pi:

```bash
ssh -T git@github.com
```

**Primera vez que te conectas:**

Verás algo como:

```
The authenticity of host 'github.com (140.82.121.4)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
This key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Escribe `yes` y presiona Enter.**

**Salida exitosa:**

```
Hi TU_USUARIO! You've successfully authenticated, but GitHub does not provide shell access.
```

**Si ves esto, ¡perfecto! ✅ La conexión SSH funciona.**

---

### Paso 7: Cambiar el remote de HTTPS a SSH

```bash
cd ~/hevy-mcp
```

#### 7.1: Ver el remote actual

```bash
git remote -v
```

**Salida actual (HTTPS):**

```
origin  https://github.com/TU_USUARIO/hevy-mcp.git (fetch)
origin  https://github.com/TU_USUARIO/hevy-mcp.git (push)
```

#### 7.2: Cambiar a SSH

**Importante**: Cambia `TU_USUARIO` por tu nombre de usuario real de GitHub.

```bash
git remote set-url origin git@github.com:TU_USUARIO/hevy-mcp.git
```

**Ejemplo real:**

Si tu usuario es `rober-dev`:

```bash
git remote set-url origin git@github.com:rober-dev/hevy-mcp.git
```

#### 7.3: Verificar el cambio

```bash
git remote -v
```

**Salida después del cambio (SSH):**

```
origin  git@github.com:TU_USUARIO/hevy-mcp.git (fetch)
origin  git@github.com:TU_USUARIO/hevy-mcp.git (push)
```

**¡Perfecto! Ya está configurado para usar SSH.** 🎉

---

### Paso 8: Probar git pull sin contraseña

```bash
git pull origin main
```

**Salida esperada:**

```
Already up to date.
```

**O si hay cambios:**

```
Updating abc1234..def5678
Fast-forward
 src/simple-server.ts | 10 ++++++++--
 1 file changed, 8 insertions(+), 2 deletions(-)
```

**¡Si NO te pide contraseña, funciona perfectamente!** ✅

---

## ✅ Verificación Final

### Test completo:

```bash
# 1. Ver estado de git
git status

# 2. Hacer pull (no debe pedir contraseña)
git pull origin main

# 3. Ver últimos commits
git log --oneline -5

# 4. Ver configuración de remote
git remote -v
```

**Si todo esto funciona sin pedir contraseña, ¡ya está listo!** 🎉

---

## 🎯 Actualizar el script update.sh (Opcional)

Tu script `update.sh` ahora funcionará **sin pedir contraseña** en el `git pull`.

Opcionalmente, puedes mejorar el script:

```bash
nano ~/hevy-mcp/update.sh
```

**Versión mejorada (opcional):**

```bash
#!/bin/bash

set -e  # Detener si hay error

echo "🔄 Actualizando Hevy MCP Server..."
echo "=================================================="

cd ~/hevy-mcp

# Verificar conexión SSH con GitHub
echo "🔐 Verificando conexión SSH con GitHub..."
if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "❌ Error: No se puede conectar a GitHub vía SSH"
    echo "Ejecuta: ssh -T git@github.com"
    exit 1
fi

# Guardar cambios locales
echo "💾 Guardando cambios locales..."
git stash

# Obtener últimos cambios
echo "📥 Descargando últimos cambios..."
git pull origin main

# Restaurar cambios locales
git stash pop 2>/dev/null || true

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Compilar
echo "🏗️ Compilando proyecto..."
npm run build

# Reiniciar servidor
echo "♻️ Reiniciando servidor..."
pm2 restart hevy-mcp

# Estado
echo ""
echo "✅ Actualización completada"
echo "=================================================="
pm2 status

# Logs
echo ""
echo "📋 Últimos logs:"
pm2 logs hevy-mcp --lines 15 --nostream

# URLs
echo ""
echo "🌐 Servidor disponible en:"
echo "   - Local: http://localhost:3000/health"
echo "   - Internet: https://hevy-rober.duckdns.org/health"
```

Guardar: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🔒 Seguridad: Notas Importantes

### ✅ Buenas Prácticas

1. **Nunca compartas tu clave privada** (`id_ed25519`)
   - Solo comparte la clave pública (`id_ed25519.pub`)

2. **Usa passphrase para mayor seguridad** (opcional)
   - Agrega una capa extra de protección
   - Solo la introduces una vez por sesión

3. **Diferentes claves para diferentes máquinas**
   - Tu PC: una clave
   - Raspberry Pi: otra clave
   - Servidor producción: otra clave

4. **Revisa tus claves regularmente**
   - GitHub → Settings → SSH and GPG keys
   - Elimina claves que ya no uses

---

## 🆘 Troubleshooting

### Problema 1: "Permission denied (publickey)"

**Causa**: La clave SSH no está agregada a GitHub o no se está usando correctamente.

**Solución:**

```bash
# Verificar que la clave existe
ls -la ~/.ssh/

# Verificar conexión con GitHub
ssh -T git@github.com

# Ver contenido de la clave pública
cat ~/.ssh/id_ed25519.pub

# Copiar y añadir a GitHub de nuevo
```

---

### Problema 2: "Host key verification failed"

**Causa**: Primera vez que te conectas a GitHub desde esta máquina.

**Solución:**

```bash
ssh -T git@github.com
# Escribir "yes" cuando te pregunte
```

---

### Problema 3: Git sigue pidiendo contraseña

**Causa**: El remote sigue usando HTTPS en lugar de SSH.

**Solución:**

```bash
cd ~/hevy-mcp
git remote -v  # Verificar que dice git@github.com

# Si dice https://, cambiar a SSH:
git remote set-url origin git@github.com:TU_USUARIO/hevy-mcp.git
```

---

### Problema 4: "Could not open a connection to your authentication agent"

**Causa**: El agente SSH no está corriendo.

**Solución:**

```bash
# Iniciar el agente
eval "$(ssh-agent -s)"

# Añadir tu clave
ssh-add ~/.ssh/id_ed25519
```

---

### Problema 5: "Bad permissions" en la clave

**Causa**: Permisos incorrectos en el directorio .ssh

**Solución:**

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

---

## 📚 Comandos de Referencia Rápida

```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu_email@gmail.com"

# Ver clave pública
cat ~/.ssh/id_ed25519.pub

# Probar conexión con GitHub
ssh -T git@github.com

# Cambiar remote a SSH
git remote set-url origin git@github.com:USUARIO/REPO.git

# Ver remote actual
git remote -v

# Añadir clave al agente
ssh-add ~/.ssh/id_ed25519

# Listar claves en el agente
ssh-add -l
```

---

## 🎉 ¡Felicidades!

Ahora tienes configurado SSH con GitHub en tu Raspberry Pi.

**Beneficios que obtienes:**

- ✅ No más contraseñas en git pull/push
- ✅ Más rápido y seguro
- ✅ Automatización fácil con scripts
- ✅ Configuración profesional
- ✅ Compatible con CI/CD

---

## 🔗 Enlaces Útiles

- **GitHub SSH Docs**: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- **Generar claves SSH**: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
- **Solucionar problemas SSH**: https://docs.github.com/en/authentication/troubleshooting-ssh

---

**Última actualización**: 2 de Diciembre de 2025  
**Autor**: Rober  
**Proyecto**: hevy-mcp en Raspberry Pi

