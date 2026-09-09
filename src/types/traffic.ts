export interface HealthResponse {
	status: string;
}

export interface Road {
	iu_ac: string;
}

export interface Prediction {
	iu_ac: string;
	prediction_timestamp_utc: string;
	target_timestamp_utc: string;
	predicted_k: number;
	model_version: string;
}
