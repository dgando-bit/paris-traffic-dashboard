import type {
	HealthResponse,
	Prediction,
	Road,
	RoadHistory,
} from "@/types/traffic";

const API_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(endpoint: string): Promise<T> {
	const response = await fetch(`${API_URL}${endpoint}`);

	if (!response.ok) {
		throw new Error(
			`API request failed: ${response.status} ${response.statusText}`,
		);
	}

	return response.json() as Promise<T>;
}

export function getHealth(): Promise<HealthResponse> {
	return apiFetch<HealthResponse>("/health");
}

export function getRoads(): Promise<Road[]> {
	return apiFetch<Road[]>("/roads");
}

export function getLatestPredictions(): Promise<Prediction[]> {
	return apiFetch<Prediction[]>("/predictions/latest");
}

export function getPrediction(iuAc: string): Promise<Prediction> {
	return apiFetch<Prediction>(
		`/predictions/${encodeURIComponent(iuAc)}`,
	);
}

export function getRoadHistory(
	iuAc: string,
	hours = 24,
): Promise<RoadHistory> {
	return apiFetch<RoadHistory>(
		`/roads/${encodeURIComponent(iuAc)}/history?hours=${hours}`,
	);
}
