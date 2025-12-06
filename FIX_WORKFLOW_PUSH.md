# 🔧 Fix: Error al hacer push del workflow

## ❌ Error

```
refusing to allow a Personal Access Token to create or update workflow 
`.github/workflows/deploy.yml` without `workflow` scope
```

## 🎯 Solución

GitHub requiere que el Personal Access Token (PAT) tenga el scope `workflow` para poder crear/modificar workflows.

---

## 📋 Opción 1: Actualizar tu PAT (Recomendado)

### Paso 1: Crear nuevo PAT con scope correcto

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. **Note**: `hevy-mcp deployment` (o cualquier nombre descriptivo)
4. **Expiration**: `No expiration` (o el tiempo que prefieras)
5. **Selecciona estos scopes:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` ← **ESTE ES EL IMPORTANTE**
6. Click en **"Generate token"**
7. **¡COPIA EL TOKEN!** (solo se muestra una vez)

### Paso 2: Actualizar credenciales en tu PC

#### Windows (Credential Manager)

```powershell
# Abrir Credential Manager
control /name Microsoft.CredentialManager

# O desde terminal:
cmdkey /list

# Buscar "github.com" y eliminarlo:
cmdkey /delete:git:https://github.com

# Luego, en el próximo git push te pedirá el nuevo token
```

#### Método directo (si lo anterior no funciona)

```powershell
# Configurar el token directamente en el remote
git remote set-url origin https://TU_NUEVO_TOKEN@github.com/roberwild/hevy-mcp.git
```

**Reemplaza** `TU_NUEVO_TOKEN` por el token que acabas de generar.

### Paso 3: Intentar push de nuevo

```bash
git push origin main
```

Ahora debería funcionar! ✅

---

## 📋 Opción 2: Usar SSH en lugar de HTTPS (Más profesional)

Si ya configuraste SSH keys con GitHub (como en SSH_SETUP_GUIDE.md):

```bash
# Cambiar remote a SSH
git remote set-url origin git@github.com:roberwild/hevy-mcp.git

# Verificar
git remote -v

# Ahora push funciona sin tokens
git push origin main
```

**Ventajas:**
- ✅ No necesitas PAT
- ✅ Más seguro
- ✅ No expira nunca
- ✅ Configuración profesional

---

## ✅ Verificar que funcionó

Después del push exitoso:

1. Ve a: https://github.com/roberwild/hevy-mcp
2. Deberías ver el archivo `.github/workflows/deploy.yml`
3. Ve a la pestaña **"Actions"**
4. Verás el workflow (pero aún NO lo ejecutes hasta configurar los secrets)

---

## 🚀 Próximo Paso

Una vez que el push funcione:

1. **NO HAGAS MÁS PUSHES TODAVÍA**
2. Primero configura los secrets siguiendo: [AUTO_DEPLOY_SETUP.md](AUTO_DEPLOY_SETUP.md)
3. Una vez configurados los secrets, cualquier push activará el auto-deploy

---

## 💡 Recomendación

**Usar SSH es mejor:**
- No necesitas tokens
- No expira
- Más seguro
- Es el estándar profesional

Ver [SSH_SETUP_GUIDE.md](SSH_SETUP_GUIDE.md) para configurarlo.

---

**Última actualización**: 6 de Diciembre de 2025

