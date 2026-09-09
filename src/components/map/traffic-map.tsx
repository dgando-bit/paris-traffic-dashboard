"use client";

import {
	MapContainer,
	Polyline,
	Popup,
	TileLayer,
} from "react-leaflet";

import type {
	Prediction,
	Road,
} from "@/types/traffic";

type TrafficMapProps = {
	roads: Road[];
	predictions: Prediction[];
};

type GeoShape = {
	geometry?: {
		type?: string;
		coordinates?: number[][];
	};
};

function getPrediction(
	predictions: Prediction[],
	iuAc: string,
) {
	return predictions.find(
		(prediction) => prediction.iu_ac === iuAc,
	);
}

function getTrafficColor(k: number | undefined) {
	if (k === undefined) return "#94a3b8";
	if (k < 15) return "#22c55e";
	if (k < 30) return "#eab308";
	if (k < 50) return "#f97316";

	return "#ef4444";
}

function getTrafficStatus(k: number | undefined) {
	if (k === undefined) return "Indisponible";
	if (k < 15) return "Fluide";
	if (k < 30) return "Pré-saturé";
	if (k < 50) return "Saturé";

	return "Bloqué";
}

export default function TrafficMap({
									   roads,
									   predictions,
								   }: TrafficMapProps) {
	return (
		<MapContainer
			center={[48.8566, 2.3522]}
			zoom={12}
			scrollWheelZoom
			className="h-[460px] w-full"
		>
			<TileLayer
				attribution="&copy; OpenStreetMap contributors"
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{roads.map((road) => {
				if (!road.geo_shape) {
					return null;
				}

				let geoShape: GeoShape;

				try {
					geoShape = JSON.parse(
						road.geo_shape,
					) as GeoShape;
				} catch {
					return null;
				}

				const coordinates =
					geoShape.geometry?.coordinates;

				if (
					geoShape.geometry?.type !== "LineString" ||
					!coordinates
				) {
					return null;
				}

				const positions = coordinates.map(
					([longitude, latitude]) =>
						[latitude, longitude] as [number, number],
				);

				const prediction = getPrediction(
					predictions,
					road.iu_ac,
				);

				const predictedK =
					prediction?.predicted_k;

				return (
					<Polyline
						key={road.iu_ac}
						positions={positions}
						pathOptions={{
							color: getTrafficColor(predictedK),
							weight: 7,
							opacity: 0.85,
						}}
					>
						<Popup>
							<div className="min-w-48">
								<strong>
									{road.libelle ?? `Axe ${road.iu_ac}`}
								</strong>

								<p>Axe : {road.iu_ac}</p>

								<p>
									Prévision :{" "}
									{predictedK !== undefined
										? `${predictedK.toFixed(1)} %`
										: "indisponible"}
								</p>

								<p>
									État :{" "}
									{getTrafficStatus(predictedK)}
								</p>

								{prediction && (
									<p>
										Modèle : v
										{prediction.model_version}
									</p>
								)}
							</div>
						</Popup>
					</Polyline>
				);
			})}
		</MapContainer>
	);
}
