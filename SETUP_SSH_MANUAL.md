# 🔑 Configurar SSH Manualmente en Raspberry Pi

## Ejecuta esto DESDE la Raspberry Pi

Conéctate primero a la Raspberry Pi:

```bash
ssh rober@192.168.1.210
```

Una vez dentro, ejecuta estos comandos:

```bash
# 1. Crear directorio .ssh si no existe
mkdir -p ~/.ssh

# 2. Configurar permisos del directorio
chmod 700 ~/.ssh

# 3. Añadir la clave pública de GitHub Actions
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILQlcG/oXwEYyhV4SS/xGv1bl638TUQUnzgVwTcLlQNh github-actions@hevy-mcp' >> ~/.ssh/authorized_keys

# 4. Configurar permisos del archivo
chmod 600 ~/.ssh/authorized_keys

# 5. Verificar que se añadió correctamente
tail -1 ~/.ssh/authorized_keys
# Debe mostrar: ssh-ed25519 AAAAC3... github-actions@hevy-mcp

# 6. Salir de la Raspberry Pi
exit
```

## ✅ Verificar que funcionó

Desde tu PC Windows, verifica que GitHub Actions pueda conectarse:

```powershell
# Esto NO debería pedir contraseña
ssh -i $HOME\.ssh\raspberry_deploy rober@192.168.1.210 "echo 'Conexión SSH exitosa!'"
```

Si muestra "Conexión SSH exitosa!" sin pedir contraseña, ¡está listo! ✅

---

## 🔐 Siguiente paso: Configurar Secrets en GitHub

Una vez que la clave SSH funcione:

1. Ve a: https://github.com/roberwild/hevy-mcp/settings/secrets/actions

2. Crea estos 3 secrets:

### Secret 1: RASPBERRY_SSH_KEY
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACC0JXBv6F8BGMoVeEkv8Rr9W5et/E1EFJ84FcE3C5UDYQAAAKDhDVgY4Q1Y
GAAAAAtzc2gtZWQyNTUxOQAAACC0JXBv6F8BGMoVeEkv8Rr9W5et/E1EFJ84FcE3C5UDYQ
AAAEDN6CBGJRMW+HqNMLFIWFNC49i2xfvfEec6A54yTcEaabQlcG/oXwEYyhV4SS/xGv1b
l638TUQUnzgVwTcLlQNhAAAAF2dpdGh1Yi1hY3Rpb25zQGhldnktbWNwAQIDBAUG
-----END OPENSSH PRIVATE KEY-----
```

### Secret 2: RASPBERRY_HOST
```
192.168.1.210
```

### Secret 3: RASPBERRY_USER
```
rober
```

---

## 🚀 Probar el Auto-Deploy

```bash
# Hacer un cambio pequeño
echo "# Test" >> README.md

# Commit y push
git add README.md
git commit -m "test: auto-deploy"
git push origin main

# Ver en: https://github.com/roberwild/hevy-mcp/actions
```

¡Listo! 🎉

