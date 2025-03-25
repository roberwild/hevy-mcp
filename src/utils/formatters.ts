/**
 * Utility functions for formatting data for display in MCP responses
 */

/**
 * Format a date string to a more readable format
 * @param dateStr ISO-formatted date string
 * @returns Formatted date string
 */
export function formatDate(dateStr: string | number): string {
	try {
		const date =
			typeof dateStr === "string" ? new Date(dateStr) : new Date(dateStr);
		return date.toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch (error) {
		return String(dateStr);
	}
}

/**
 * Format weight to display units
 * @param weightKg Weight in kilograms
 * @param useImperial Whether to convert to pounds
 * @returns Formatted weight string
 */
export function formatWeight(
	weightKg: number | null | undefined,
	useImperial = false,
): string {
	if (weightKg == null) return "N/A";

	if (useImperial) {
		// Convert to pounds
		const weightLbs = weightKg * 2.20462;
		return `${weightLbs.toFixed(1)} lbs`;
	}

	return `${weightKg.toFixed(1)} kg`;
}

/**
 * Format distance to display units
 * @param meters Distance in meters
 * @param useImperial Whether to convert to miles
 * @returns Formatted distance string
 */
export function formatDistance(
	meters: number | null | undefined,
	useImperial = false,
): string {
	if (meters == null) return "N/A";

	if (useImperial) {
		if (meters < 1609) {
			// If less than a mile, show in feet
			const feet = meters * 3.28084;
			return `${Math.round(feet)} ft`;
		}
		// Show in miles
		const miles = meters / 1609;
		return `${miles.toFixed(2)} mi`;
	}

	if (meters < 1000) {
		return `${meters} m`;
	}
	const km = meters / 1000;
	return `${km.toFixed(2)} km`;
}

/**
 * Format duration in seconds to a human-readable format
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number | null | undefined): string {
	if (seconds == null) return "N/A";

	if (seconds < 60) {
		return `${seconds}s`;
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes < 60) {
		return remainingSeconds > 0
			? `${minutes}m ${remainingSeconds}s`
			: `${minutes}m`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return `${hours}h`;
	}
	if (remainingSeconds === 0) {
		return `${hours}h ${remainingMinutes}m`;
	}
	return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}

/**
 * Format set type to a more user-friendly display
 * @param type Set type from API
 * @returns Formatted set type
 */
export function formatSetType(type: string): string {
	switch (type) {
		case "normal":
			return "Normal";
		case "warmup":
			return "Warm-up";
		case "dropset":
			return "Drop Set";
		case "failure":
			return "To Failure";
		default:
			return type.charAt(0).toUpperCase() + type.slice(1);
	}
}
