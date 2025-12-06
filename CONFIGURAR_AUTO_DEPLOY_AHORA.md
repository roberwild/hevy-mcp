# ✅ Configuración Final del Auto-Deploy

## 🎯 Estado Actual

✅ Workflow de GitHub Actions creado y subido  
✅ Clave SSH para deployment generada  
✅ Token de GitHub con permisos correctos configurado  
⏳ **Falta:** Configurar secrets en GitHub y añadir clave a Raspberry Pi

---

## 🔐 Paso 1: Configurar Secrets en GitHub (5 minutos)

### 1.1: Ir a GitHub Secrets

1. Abre: https://github.com/roberwild/hevy-mcp/settings/secrets/actions
2. O navega: Tu repo → Settings → Secrets and variables → Actions

### 1.2: Crear Secret 1 - RASPBERRY_SSH_KEY

1. Click en **"New repository secret"**
2. **Name**: `RASPBERRY_SSH_KEY`
3. **Secret**: Copia TODO esto (incluye BEGIN y END):

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACC0JXBv6F8BGMoVeEkv8Rr9W5et/E1EFJ84FcE3C5UDYQAAAKDhDVgY4Q1Y
GAAAAAtzc2gtZWQyNTUxOQAAACC0JXBv6F8BGMoVeEkv8Rr9W5et/E1EFJ84FcE3C5UDYQ
AAAEDN6CBGJRMW+HqNMLFIWFNC49i2xfvfEec6A54yTcEaabQlcG/oXwEYyhV4SS/xGv1b
l638TUQUnzgVwTcLlQNhAAAAF2dpdGh1Yi1hY3Rpb25zQGhldnktbWNwAQIDBAUG
-----END OPENSSH PRIVATE KEY-----
```

4. Click **"Add secret"**

### 1.3: Crear Secret 2 - RASPBERRY_HOST

1. Click en **"New repository secret"**
2. **Name**: `RASPBERRY_HOST`
3. **Secret**: `192.168.1.141`
4. Click **"Add secret"**

### 1.4: Crear Secret 3 - RASPBERRY_USER

1. Click en **"New repository secret"**
2. **Name**: `RASPBERRY_USER`
3. **Secret**: `rober`
4. Click **"Add secret"**

### ✅ Verificar

Deberías ver 3 secrets:
- `RASPBERRY_SSH_KEY`
- `RASPBERRY_HOST`
- `RASPBERRY_USER`

---

## 🔑 Paso 2: Añadir Clave Pública a la Raspberry Pi

### Cuando tengas acceso a la Raspberry Pi:

```bash
# Conectar a la Raspberry Pi
ssh rober@192.168.1.141

# Añadir la clave pública
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILQlcG/oXwEYyhV4SS/xGv1bl638TUQUnzgVwTcLlQNh github-actions@hevy-mcp' >> ~/.ssh/authorized_keys

# Verificar permisos
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Salir
exit
```

---

## 🧪 Paso 3: Probar el Auto-Deploy

### 3.1: Hacer un cambio pequeño

```bash
# En tu PC
cd D:\Proyectos\hevy-mcp

# Hacer un cambio de prueba
echo "# Auto-deploy test" >> README.md

# Commit y push
git add README.md
git commit -m "test: verificar auto-deploy funcionando"
git push origin main
```

### 3.2: Ver el deploy en acción

1. Ve a: https://github.com/roberwild/hevy-mcp/actions
2. Verás el workflow ejecutándose en tiempo real
3. Click en el workflow para ver los logs
4. Debería completarse en ~30-60 segundos

### 3.3: Verificar que funcionó

```bash
# Probar el servidor
curl https://hevy-rober.duckdns.org/health

# Debería responder con el health check
```

---

## 🎉 ¡Ya está! Flujo de trabajo final

Desde ahora, cada vez que hagas:

```bash
git add .
git commit -m "nueva feature"
git push origin main
```

**Automáticamente:**
1. GitHub detecta el push
2. GitHub Actions se conecta a la Raspberry Pi
3. Hace git pull, npm install, npm run build
4. Reinicia el servidor con PM2
5. Verifica que funciona

**Todo en menos de 1 minuto** ⚡

---

## 📊 Comparación: Antes vs Después

### Antes (Manual)
```bash
ssh rober@192.168.1.141
~/hevy-mcp/update.sh
exit
```
**Tiempo: ~30 segundos** + tienes que hacerlo manualmente

### Después (Automático) ⭐
```bash
git push origin main
```
**Tiempo: 0 segundos** + se hace solo mientras tomas un café ☕

---

## 🆘 Si algo falla

### Error en GitHub Actions

1. Ve a: https://github.com/roberwild/hevy-mcp/actions
2. Click en el workflow que falló
3. Lee los logs para ver qué pasó

### Errores comunes:

- **"Permission denied (publickey)"**: La clave pública no está en la Raspberry Pi
- **"Host key verification failed"**: Ya está solucionado en el workflow
- **"PM2 not found"**: PM2 no está instalado en la Raspberry Pi

---

## 📝 Checklist Final

- [ ] Crear 3 secrets en GitHub ✅
- [ ] Añadir clave pública a Raspberry Pi (cuando esté disponible)
- [ ] Hacer un push de prueba
- [ ] Ver el workflow ejecutarse en GitHub Actions
- [ ] Verificar que el servidor se actualizó

---

## 🎯 Próximos pasos opcionales

Una vez que funcione:

1. **Añadir notificaciones** (Discord/Slack) cuando falle un deploy
2. **Rollback automático** si el deploy falla
3. **Tests automáticos** antes del deploy
4. **Deploy solo en horarios específicos**

Todo esto está documentado en: `AUTO_DEPLOY_SETUP.md`

---

**¡Disfruta de tu auto-deploy profesional!** 🚀

Última actualización: 6 de Diciembre de 2025

