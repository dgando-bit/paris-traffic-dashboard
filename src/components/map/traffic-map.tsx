"use client";

import { useMemo } from "react";
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
	selectedRoadId: string | null;
	onSelectRoad: (iuAc: string) => void;
};


type GeoShape = {
	geometry?: {
		type?: string;
		coordinates?: number[][];
	};
};


function getTrafficColor(
	k: number | undefined,
) {
	if (k === undefined) {
		return "#94a3b8";
	}

	if (k < 15) {
		return "#22c55e";
	}

	if (k < 30) {
		return "#eab308";
	}

	if (k < 50) {
		return "#f97316";
	}

	return "#ef4444";
}


function getTrafficStatus(
	k: number | undefined,
) {
	if (k === undefined) {
		return "Indisponible";
	}

	if (k < 15) {
		return "Fluide";
	}

	if (k < 30) {
		return "Pré-saturé";
	}

	if (k < 50) {
		return "Saturé";
	}

	return "Bloqué";
}


export default function TrafficMap({
									   roads,
									   predictions,
									   selectedRoadId,
									   onSelectRoad,
								   }: TrafficMapProps) {
	const predictionsByRoad = useMemo(
		() =>
			new Map(
				predictions.map(
					(prediction) => [
						prediction.iu_ac,
						prediction,
					],
				),
			),
		[predictions],
	);

	return (
		<div className="relative h-full w-full">
			<MapContainer
				center={[48.8566, 2.3522]}
				zoom={12}
				scrollWheelZoom
				className="h-full w-full"
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
						geoShape.geometry
							?.coordinates;

					if (
						geoShape.geometry
							?.type !==
						"LineString" ||
						!coordinates
					) {
						return null;
					}

					const positions =
						coordinates.map(
							([
								 longitude,
								 latitude,
							 ]) =>
								[
									latitude,
									longitude,
								] as [
									number,
									number,
								],
						);

					const prediction =
						predictionsByRoad.get(
							road.iu_ac,
						);

					const predictedK =
						prediction
							?.predicted_k;

					const isSelected =
						selectedRoadId ===
						road.iu_ac;

					const predictionKey =
						prediction
							? [
								road.iu_ac,
								prediction
									.horizon_hours,
								prediction
									.prediction_timestamp_utc,
								prediction
									.model_version,
								prediction
									.predicted_k,
							].join("-")
							: `${road.iu_ac}-no-prediction`;

					return (
						<Polyline
							key={
								predictionKey
							}
							positions={
								positions
							}
							pathOptions={{
								color:
									getTrafficColor(
										predictedK,
									),
								weight:
									isSelected
										? 11
										: 7,
								opacity:
									isSelected
										? 1
										: 0.8,
							}}
							eventHandlers={{
								click: () => {
									onSelectRoad(
										road.iu_ac,
									);
								},
							}}
						>
							<Popup>
								<div className="min-w-52">
									<p className="mb-1 text-xs text-slate-500">
										Axe{" "}
										{
											road.iu_ac
										}
									</p>

									<strong className="text-sm">
										{road.libelle ??
											`Axe ${road.iu_ac}`}
									</strong>

									<div className="mt-3 space-y-1">
										<p>
											Occupation
											prévue
											:{" "}
											<strong>
												{predictedK !==
												undefined
													? `${predictedK.toFixed(
														1,
													)} %`
													: "indisponible"}
											</strong>
										</p>

										<p>
											État
											:{" "}
											<strong>
												{getTrafficStatus(
													predictedK,
												)}
											</strong>
										</p>

										{road.road_length_m !==
											null && (
												<p>
													Longueur
													:{" "}
													{road.road_length_m.toFixed(
														0,
													)}{" "}
													m
												</p>
											)}

										{prediction && (
											<p>
												Horizon
												: +
												{
													prediction.horizon_hours
												}{" "}
												h
											</p>
										)}

										{prediction && (
											<p>
												Modèle
												:
												v
												{
													prediction.model_version
												}
											</p>
										)}
									</div>
								</div>
							</Popup>
						</Polyline>
					);
				})}
			</MapContainer>

			<div className="pointer-events-none absolute bottom-5 left-5 z-[1000] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
				<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
					Congestion prévue
				</p>

				<div className="space-y-1.5 text-xs text-slate-700">
					<LegendItem
						color="bg-green-500"
						label="Fluide"
						range="< 15 %"
					/>

					<LegendItem
						color="bg-yellow-500"
						label="Pré-saturé"
						range="15–30 %"
					/>

					<LegendItem
						color="bg-orange-500"
						label="Saturé"
						range="30–50 %"
					/>

					<LegendItem
						color="bg-red-500"
						label="Bloqué"
						range="≥ 50 %"
					/>
				</div>
			</div>
		</div>
	);
}


function LegendItem({
						color,
						label,
						range,
					}: {
	color: string;
	label: string;
	range: string;
}) {
	return (
		<div className="flex items-center gap-2">
                        <span
							className={`h-2.5 w-2.5 rounded-full ${color}`}
						/>

			<span className="font-medium">
                                {label}
                        </span>

			<span className="text-slate-400">
                                {range}
                        </span>
		</div>
	);
}
