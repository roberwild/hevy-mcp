import { describe, expect, it } from "vitest";
import type {
	Routine,
	RoutineFolder,
	Workout,
} from "../generated/client/models";
import {
	calculateDuration,
	formatRoutine,
	formatRoutineFolder,
	formatWorkout,
} from "./formatters";

describe("Formatters", () => {
	describe("formatWorkout", () => {
		it("should format a workout correctly", () => {
			const workoutId = crypto.randomUUID();
			const workout = {
				id: workoutId,
				createdAt: "2025-03-27T07:00:00Z",
				title: "Morning Workout",
				description: "Great session",
				startTime: 1711522800000,
				endTime: 1711526400000,
				exercises: [],
			};

			const result = formatWorkout(workout as Workout);
			expect(result).toEqual({
				id: workoutId,
				date: "2025-03-27T07:00:00Z",
				name: "Morning Workout",
				description: "Great session",
				duration: "1h 0m 0s",
				exercises: [],
			});
		});
	});

	describe("formatRoutine", () => {
		it("should format a routine correctly", () => {
			const routineId = crypto.randomUUID();
			const folderId = 12345;
			const routine = {
				id: routineId,
				title: "Evening Routine",
				folderId: folderId,
				createdAt: "2025-03-26T19:00:00Z",
				updatedAt: "2025-03-26T19:30:00Z",
				exercises: [],
			};

			const result = formatRoutine(routine as Routine);
			expect(result).toEqual({
				id: routineId,
				title: "Evening Routine",
				folderId: folderId,
				createdAt: "2025-03-26T19:00:00Z",
				updatedAt: "2025-03-26T19:30:00Z",
				exercises: [],
			});
		});
	});

	describe("formatRoutineFolder", () => {
		it("should format a routine folder correctly", () => {
			const folderId = 12345;
			const folder = {
				id: folderId,
				title: "Cardio",
				createdAt: "2025-03-25T10:00:00Z",
				updatedAt: "2025-03-25T10:15:00Z",
			};

			const result = formatRoutineFolder(folder as RoutineFolder);
			expect(result).toEqual({
				id: folderId,
				title: "Cardio",
				createdAt: "2025-03-25T10:00:00Z",
				updatedAt: "2025-03-25T10:15:00Z",
			});
		});
	});

	describe("calculateDuration", () => {
		it("should calculate duration correctly", () => {
			const startTime = "2025-03-27T07:00:00Z";
			const endTime = "2025-03-27T08:30:15Z";
			const result = calculateDuration(startTime, endTime);
			expect(result).toBe("1h 30m 15s");
		});

		it("should return 'Unknown duration' for invalid inputs", () => {
			expect(calculateDuration(null, "2025-03-27T08:00:00Z")).toBe(
				"Unknown duration",
			);
			expect(calculateDuration("2025-03-27T07:00:00Z", undefined)).toBe(
				"Unknown duration",
			);
			expect(calculateDuration(null, null)).toBe("Unknown duration");
		});
	});
});
