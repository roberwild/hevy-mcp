// Test local de la función de búsqueda
import { searchExerciseTemplatesLocal } from "./src/tools/templates.js";

console.log("🔍 Testing local search function...\n");

// Test 1: Face Pull
console.log("Test 1: Face Pull");
try {
	const result1 = searchExerciseTemplatesLocal("Face Pull", 5);
	console.log(`Results: ${result1.exerciseTemplates.length}`);

	result1.exerciseTemplates.forEach((ex) => {
		console.log(`  - ${ex.id}: ${ex.title} | Spanish: ${ex.spanishTitle}`);
	});

	const facePullFound = result1.exerciseTemplates.find(
		(ex) => ex.id === "BE640BA0",
	);
	console.log(facePullFound ? "✅ Face Pull FOUND!" : "❌ Face Pull NOT found");
} catch (error) {
	console.error("❌ Error in test 1:", error.message);
}

console.log("\n" + "=".repeat(50) + "\n");

// Test 2: face pull (lowercase)
console.log("Test 2: face pull (lowercase)");
try {
	const result2 = searchExerciseTemplatesLocal("face pull", 5);
	console.log(`Results: ${result2.exerciseTemplates.length}`);

	result2.exerciseTemplates.forEach((ex) => {
		console.log(`  - ${ex.id}: ${ex.title} | Spanish: ${ex.spanishTitle}`);
	});

	const facePullFound2 = result2.exerciseTemplates.find(
		(ex) => ex.id === "BE640BA0",
	);
	console.log(
		facePullFound2 ? "✅ Face Pull FOUND!" : "❌ Face Pull NOT found",
	);
} catch (error) {
	console.error("❌ Error in test 2:", error.message);
}

console.log("\n" + "=".repeat(50) + "\n");

// Test 3: Spanish search
console.log("Test 3: tiron cara (Spanish)");
try {
	const result3 = searchExerciseTemplatesLocal("tiron cara", 5);
	console.log(`Results: ${result3.exerciseTemplates.length}`);

	result3.exerciseTemplates.forEach((ex) => {
		console.log(`  - ${ex.id}: ${ex.title} | Spanish: ${ex.spanishTitle}`);
	});

	const facePullFound3 = result3.exerciseTemplates.find(
		(ex) => ex.id === "BE640BA0",
	);
	console.log(
		facePullFound3 ? "✅ Face Pull FOUND!" : "❌ Face Pull NOT found",
	);
} catch (error) {
	console.error("❌ Error in test 3:", error.message);
}
