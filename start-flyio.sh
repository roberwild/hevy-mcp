#!/bin/sh
# Fly.io startup script for Hevy MCP Server

echo "🚀 Starting Hevy MCP Server on Fly.io..."
echo "📊 Environment variables:"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"
echo "  HOST: $HOST"
echo "  MCP_TRANSPORT: $MCP_TRANSPORT"

# Force the correct host and port for Fly.io
export HOST=0.0.0.0
export PORT=8080
export MCP_TRANSPORT=http

echo "🔧 Forced environment variables:"
echo "  HOST: $HOST"
echo "  PORT: $PORT"
echo "  MCP_TRANSPORT: $MCP_TRANSPORT"

# Start the MCP server
echo "🎯 Starting MCP server..."
exec node dist/index.js --http --host 0.0.0.0 --port 8080
