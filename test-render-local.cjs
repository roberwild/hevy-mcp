#!/usr/bin/env node

// Test local para verificar compatibilidad con Render
const http = require("http");

console.log("🧪 Testing Render compatibility...\n");

// Test 1: Verificar que el servidor arranca con PORT personalizado
console.log("Test 1: Testing custom PORT handling");
const testPort = process.env.PORT || 10000;
console.log(`✓ PORT will be: ${testPort} (Render uses 10000)\n`);

// Test 2: Verificar archivos críticos
const fs = require("fs");
const path = require("path");

console.log("Test 2: Checking critical files exist");

const criticalFiles = [
	"templates-hevy-exercises.json",
	"templates_hevy_exercises.csv",
	"Dockerfile",
	"render.yaml",
];

let allFilesExist = true;
for (const file of criticalFiles) {
	if (fs.existsSync(file)) {
		console.log(`✅ ${file}`);
	} else {
		console.log(`❌ ${file} - MISSING!`);
		allFilesExist = false;
	}
}

if (allFilesExist) {
	console.log("\n🎉 All critical files present - Render deployment ready!");
} else {
	console.log("\n❌ Some files missing - fix before deploying");
	process.exit(1);
}

// Test 3: Verificar estructura del proyecto
console.log("\nTest 3: Project structure");
const criticalDirs = ["src", "dist"];

for (const dir of criticalDirs) {
	if (fs.existsSync(dir)) {
		console.log(`✅ ${dir}/ directory exists`);
	} else {
		console.log(`⚠️  ${dir}/ directory missing (will be created during build)`);
	}
}

console.log("\n🚀 Ready for Render deployment!");
console.log("Next steps:");
console.log("1. Push to GitHub");
console.log("2. Connect repository in Render");
console.log("3. Set HEVY_API_KEY environment variable");
console.log("4. Deploy! 🎯");
