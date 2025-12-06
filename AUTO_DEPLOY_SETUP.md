# 🚀 Auto-Deploy Automático - GitHub → Raspberry Pi

## 🎯 Objetivo

Configurar deployment automático tipo Vercel:
- Haces `git push` → GitHub Actions → Raspberry Pi actualiza automáticamente
- Todo en menos de 1 minuto
- Sin intervención manual

---

## 📋 Requisitos Previos

- ✅ Raspberry Pi con SSH habilitado
- ✅ GitHub repository del proyecto
- ✅ Git configurado en la Raspberry Pi
- ✅ PM2 configurado y funcionando

---

## 🔧 Configuración Paso a Paso

### Paso 1: Generar Clave SSH Dedicada para GitHub Actions

En tu **PC** (no en la Raspberry Pi):

```bash
# Generar una clave SSH específica para deployment
ssh-keygen -t ed25519 -C "github-actions@hevy-mcp" -f ~/.ssh/raspberry_deploy

# Esto crea dos archivos:
# - raspberry_deploy       (clave PRIVADA - para GitHub)
# - raspberry_deploy.pub   (clave PÚBLICA - para Raspberry Pi)
```

**Importante**: No pongas passphrase (presiona Enter cuando te pregunte).

---

### Paso 2: Copiar Clave Pública a la Raspberry Pi

```bash
# Ver la clave pública
cat ~/.ssh/raspberry_deploy.pub

# Copiarla a la Raspberry Pi
ssh-copy-id -i ~/.ssh/raspberry_deploy.pub rober@192.168.1.141

# O manualmente (si ssh-copy-id no funciona):
# En tu PC:
cat ~/.ssh/raspberry_deploy.pub

# Copiar la salida, luego en la Raspberry Pi:
ssh rober@192.168.1.141
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Pegar la clave al final del archivo
# Guardar: Ctrl+O, Enter, Ctrl+X

# Configurar permisos correctos
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
exit
```

---

### Paso 3: Probar la Conexión SSH

En tu PC:

```bash
# Probar que la clave funciona
ssh -i ~/.ssh/raspberry_deploy rober@192.168.1.141 "echo 'SSH funciona correctamente!'"

# Debe mostrar: SSH funciona correctamente!
# Sin pedir contraseña
```

---

### Paso 4: Añadir Secrets a GitHub

#### 4.1: Copiar la clave privada

En tu PC:

```bash
# Ver la clave PRIVADA
cat ~/.ssh/raspberry_deploy

# Copiar TODA la salida (incluye las líneas BEGIN y END)
```

#### 4.2: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú izquierdo: **Secrets and variables** → **Actions**
4. Click en **New repository secret**

**Crear estos 3 secrets:**

##### Secret 1: `RASPBERRY_SSH_KEY`
- **Name**: `RASPBERRY_SSH_KEY`
- **Value**: Pega la clave privada completa (de `cat ~/.ssh/raspberry_deploy`)
- Click **Add secret**

##### Secret 2: `RASPBERRY_HOST`
- **Name**: `RASPBERRY_HOST`
- **Value**: `192.168.1.141`
- Click **Add secret**

##### Secret 3: `RASPBERRY_USER`
- **Name**: `RASPBERRY_USER`
- **Value**: `rober`
- Click **Add secret**

---

### Paso 5: Verificar que el archivo de GitHub Actions existe

El archivo ya está creado en: `.github/workflows/deploy.yml`

Verifica que existe:

```bash
cat .github/workflows/deploy.yml
```

---

### Paso 6: Hacer Commit y Push

```bash
# Añadir el archivo de workflow
git add .github/workflows/deploy.yml
git add AUTO_DEPLOY_SETUP.md

# Commit
git commit -m "feat: añadir auto-deploy con GitHub Actions

- Configurar workflow para deployment automático
- Deploy se ejecuta en cada push a main
- Incluye verificación de health endpoint
- Documentación completa de setup"

# Push (esto activará el workflow por primera vez)
git push origin main
```

---

### Paso 7: Verificar el Deploy Automático

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Verás tu workflow ejecutándose
4. Click en el workflow para ver los logs en tiempo real

**Estados posibles:**
- 🟡 Amarillo (En progreso): Deployando...
- ✅ Verde (Success): Deploy exitoso
- ❌ Rojo (Failed): Algo falló, revisa los logs

---

## 🎉 ¡Ya está! Ahora funciona así:

### Flujo Automático

```
1. En tu PC:
   git add .
   git commit -m "nueva feature"
   git push origin main

2. GitHub (automático):
   ✅ Detecta el push
   ✅ Inicia GitHub Actions
   ✅ Se conecta a Raspberry Pi vía SSH

3. Raspberry Pi (automático):
   ✅ git pull origin main
   ✅ npm install
   ✅ npm run build
   ✅ pm2 restart hevy-mcp
   ✅ Verifica que funciona

4. GitHub (automático):
   ✅ Prueba health endpoint
   ✅ Notifica éxito/fallo

Total: ~30-60 segundos ⚡
```

---

## 📊 Comparación con Vercel

| Característica | Vercel | Tu Setup |
|---------------|--------|----------|
| **Auto-deploy** | ✅ | ✅ |
| **En cada push** | ✅ | ✅ |
| **Rollback** | ✅ | ⚠️ Manual |
| **Logs en tiempo real** | ✅ | ✅ (GitHub Actions) |
| **Notificaciones** | ✅ | ✅ (GitHub) |
| **Preview deployments** | ✅ | ❌ |
| **Costo** | €20+/mes | **€0.87/mes** ✅ |
| **Control total** | ❌ | ✅ |

---

## 🔐 Seguridad

### ✅ Implementado

- Clave SSH dedicada solo para deployment
- Sin acceso root (usa usuario `rober`)
- Clave privada solo en GitHub Secrets (encriptada)
- Verificación de health endpoint después del deploy

### ⚠️ Recomendaciones Adicionales

#### 1. Restringir la clave SSH solo a comandos específicos

En la Raspberry Pi:

```bash
nano ~/.ssh/authorized_keys
```

Al inicio de la línea con la clave de deploy, añadir:

```
command="cd ~/hevy-mcp && git pull origin main && npm install && npm run build && pm2 restart hevy-mcp" ssh-ed25519 AAAA...
```

Esto hace que la clave SOLO pueda ejecutar esos comandos específicos.

#### 2. IP Whitelisting (Opcional)

Si tienes IP estática en GitHub Actions, puedes restringir SSH solo a esas IPs.

---

## 🧪 Testing

### Test Manual del Workflow

```bash
# Hacer un cambio pequeño
echo "# Test auto-deploy" >> README.md

# Commit y push
git add README.md
git commit -m "test: verificar auto-deploy"
git push origin main

# Ver en GitHub Actions: https://github.com/TU_USUARIO/hevy-mcp/actions
```

### Verificar que funcionó

```bash
# En la Raspberry Pi, ver logs de PM2
ssh rober@192.168.1.141 "pm2 logs hevy-mcp --lines 20 --nostream"

# O probar el health endpoint
curl https://hevy-rober.duckdns.org/health
```

---

## 🆘 Troubleshooting

### Problema 1: "Permission denied (publickey)"

**Causa**: La clave SSH no está configurada correctamente.

**Solución**:

```bash
# Verificar que la clave pública está en la Raspberry Pi
ssh rober@192.168.1.141 "cat ~/.ssh/authorized_keys"

# Debe contener la clave que generaste

# Verificar permisos
ssh rober@192.168.1.141 "ls -la ~/.ssh/"
# .ssh debe ser 700
# authorized_keys debe ser 600

# Corregir permisos si es necesario
ssh rober@192.168.1.141 "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

---

### Problema 2: Workflow falla en "Deploy to Raspberry Pi"

**Causa**: Comandos fallan en la Raspberry Pi.

**Solución**:

```bash
# Conectar manualmente y ejecutar los comandos
ssh rober@192.168.1.141
cd ~/hevy-mcp
git pull origin main  # ¿Funciona?
npm install           # ¿Funciona?
npm run build         # ¿Funciona?
pm2 restart hevy-mcp  # ¿Funciona?

# Si alguno falla, arreglarlo primero
```

---

### Problema 3: "Host key verification failed"

**Causa**: GitHub Actions no conoce el host de la Raspberry Pi.

**Solución**: El workflow ya incluye `ssh-keyscan`, pero si falla:

```bash
# Obtener la huella digital del host
ssh-keyscan -H 192.168.1.141

# Añadirla como secret RASPBERRY_KNOWN_HOSTS en GitHub
```

---

### Problema 4: Deploy funciona pero el servidor no arranca

**Causa**: Error en el código o dependencias.

**Solución**:

```bash
# Ver logs en la Raspberry Pi
ssh rober@192.168.1.141 "pm2 logs hevy-mcp --err --lines 50"

# O conectarse y debuggear
ssh rober@192.168.1.141
cd ~/hevy-mcp
pm2 logs hevy-mcp
```

---

## 🎛️ Personalización Avanzada

### Añadir Tests antes del Deploy

Edita `.github/workflows/deploy.yml`:

```yaml
jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test  # Si tienes tests

  deploy:
    name: Deploy to Production
    needs: test  # Solo deploya si los tests pasan
    runs-on: ubuntu-latest
    # ... resto del workflow
```

---

### Añadir Notificaciones a Discord/Slack

Al final del workflow:

```yaml
      - name: 📢 Notify Discord
        if: always()
        uses: sarisia/actions-status-discord@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK }}
          status: ${{ job.status }}
          title: "Deploy to Raspberry Pi"
          description: "Build and deploy completed"
```

---

### Rollback Automático si falla

Añade después del deploy:

```yaml
      - name: 🔙 Rollback on failure
        if: failure()
        env:
          RASPBERRY_USER: ${{ secrets.RASPBERRY_USER }}
          RASPBERRY_HOST: ${{ secrets.RASPBERRY_HOST }}
        run: |
          ssh $RASPBERRY_USER@$RASPBERRY_HOST << 'EOF'
            cd ~/hevy-mcp
            git reset --hard HEAD~1
            npm install
            npm run build
            pm2 restart hevy-mcp
          EOF
```

---

## 📋 Checklist de Configuración

- [ ] Generar clave SSH dedicada
- [ ] Copiar clave pública a Raspberry Pi
- [ ] Probar conexión SSH sin password
- [ ] Crear 3 secrets en GitHub:
  - [ ] `RASPBERRY_SSH_KEY`
  - [ ] `RASPBERRY_HOST`
  - [ ] `RASPBERRY_USER`
- [ ] Verificar que `.github/workflows/deploy.yml` existe
- [ ] Hacer commit y push
- [ ] Ver el workflow en GitHub Actions
- [ ] Verificar que el deploy funcionó
- [ ] Probar con un cambio real

---

## 🎯 Próximos Pasos

Una vez configurado:

1. ✅ Cada push a `main` deploya automáticamente
2. ✅ Recibes notificación si algo falla
3. ✅ Puedes ver logs en tiempo real en GitHub Actions
4. ✅ Ya no necesitas SSH manual

### Workflow de desarrollo:

```bash
# Desarrollas localmente
git add .
git commit -m "nueva feature"
git push origin main

# ☕ Tomas un café (30 segundos)
# ✅ Ya está en producción

# Verificas que funciona
curl https://hevy-rober.duckdns.org/health
```

---

## 💡 Tips Pro

### 1. Deploy solo en horarios específicos

```yaml
on:
  push:
    branches:
      - main
  schedule:
    - cron: '0 2 * * *'  # Deploy diario a las 2 AM
```

### 2. Deploy manual opcional

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:  # Permite trigger manual
```

Luego en GitHub: Actions → Deploy to Raspberry Pi → Run workflow

### 3. Deploy solo si cambian archivos específicos

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'src/**'
      - 'package.json'
      - 'tsconfig.json'
```

---

## 🔗 Enlaces Útiles

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **SSH Agent Action**: https://github.com/webfactory/ssh-agent

---

## 🎉 ¡Felicidades!

Ahora tienes:
- ✅ Auto-deploy estilo Vercel
- ✅ Gratis (GitHub Actions tiene 2000 min/mes gratis)
- ✅ Deploy en < 1 minuto
- ✅ Sin intervención manual
- ✅ Logs y notificaciones

**Total invertido en infraestructura**: €0.87/mes de electricidad 💰

---

**Última actualización**: 6 de Diciembre de 2025  
**Autor**: Rober  
**Proyecto**: hevy-mcp Auto-Deploy  
**Estado**: 🚀 Listo para usar

