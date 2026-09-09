export interface HealthResponse {
	status: string;
}

export interface Road {
	iu_ac: string;
	libelle: string | null;
	latitude: number;
	longitude: number;
	road_length_m: number | null;
	geo_shape: string | null;
}

export interface Prediction {
	iu_ac: string;
	prediction_timestamp_utc: string;
	target_timestamp_utc: string;
	predicted_k: number;
	model_version: string;
}
