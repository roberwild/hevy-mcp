# ⚡ Quick Deploy Guide

## 🚀 Actualizar Servidor (30 segundos)

```bash
ssh rober@raspberry-rober
~/hevy-mcp/update.sh
exit
```

¡Listo!

## 📋 URLs Importantes

- **Producción**: https://hevy-rober.duckdns.org
- **Health**: https://hevy-rober.duckdns.org/health
- **MCP**: https://hevy-rober.duckdns.org/mcp

## 🔧 Comandos Rápidos

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs hevy-mcp

# Reiniciar
pm2 restart hevy-mcp
```

## 🆕 Nuevo Método Disponible: searchWorkouts

Ahora puedes buscar entrenamientos por texto:

```json
{
  "method": "searchWorkouts",
  "params": {
    "query": "VivaGym"
  }
}
```

Prueba con el GPT: **"Busca mis entrenamientos de VivaGym"**

---

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para documentación completa.

