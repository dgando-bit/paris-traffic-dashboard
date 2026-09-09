"use client";

import {useState} from "react";

import TrafficMapWrapper from "@/components/map/traffic-map-wrapper";

import type {Prediction, Road,} from "@/types/traffic";

type TrafficDashboardProps = {
	roads: Road[];
	predictions: Prediction[];
};

function getTrafficStatus(k: number) {
	if (k < 15) return "Fluide";
	if (k < 30) return "Pré-saturé";
	if (k < 50) return "Saturé";

	return "Bloqué";
}

function getStatusClass(k: number) {
	if (k < 15) {
		return "bg-emerald-50 text-emerald-700";
	}

	if (k < 30) {
		return "bg-amber-50 text-amber-700";
	}

	if (k < 50) {
		return "bg-orange-50 text-orange-700";
	}

	return "bg-red-50 text-red-700";
}

export default function TrafficDashboard({
											 roads,
											 predictions,
										 }: TrafficDashboardProps) {
	const [selectedRoadId, setSelectedRoadId] =
		useState<string | null>(null);

	const selectedRoad = roads.find(
		(road) => road.iu_ac === selectedRoadId,
	);

	const selectedPrediction = predictions.find(
		(prediction) =>
			prediction.iu_ac === selectedRoadId,
	);

	return (
		<section
			id="map"
			className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"
		>
			<article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
					<div>
						<h3 className="font-semibold text-slate-950">
							Carte du trafic parisien
						</h3>

						<p className="mt-1 text-sm text-slate-500">
							Cliquez sur un axe pour afficher ses détails
						</p>
					</div>

					<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            +1 h
          </span>
				</div>

				<div className="h-[460px]">
					<TrafficMapWrapper
						roads={roads}
						predictions={predictions}
						selectedRoadId={selectedRoadId}
						onSelectRoad={setSelectedRoadId}
					/>
				</div>
			</article>

			<article
				id="predictions"
				className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
			>
				<div className="border-b border-slate-200 px-5 py-4">
					<h3 className="font-semibold text-slate-950">
						Détail de l&apos;axe
					</h3>

					<p className="mt-1 text-sm text-slate-500">
						{selectedRoad
							? selectedRoad.libelle ??
							`Axe ${selectedRoad.iu_ac}`
							: "Sélectionnez un axe sur la carte"}
					</p>
				</div>

				{!selectedRoad ? (
					<div className="flex min-h-[380px] items-center justify-center p-8">
						<div className="max-w-xs text-center">
							<div
								className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
								↖
							</div>

							<p className="mt-4 font-medium text-slate-800">
								Aucun axe sélectionné
							</p>

							<p className="mt-2 text-sm leading-6 text-slate-500">
								Cliquez sur un tronçon de la carte pour
								consulter sa prévision de trafic.
							</p>
						</div>
					</div>
				) : (
					<div className="space-y-5 p-5">
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-slate-400">
								Axe
							</p>

							<p className="mt-1 text-2xl font-semibold text-slate-950">
								{selectedRoad.iu_ac}
							</p>

							<p className="mt-1 text-sm text-slate-500">
								{selectedRoad.libelle}
							</p>
						</div>

						{selectedPrediction ? (
							<>
								<div className="grid grid-cols-2 gap-3">
									<div className="rounded-xl bg-slate-50 p-4">
										<p className="text-xs text-slate-500">
											Occupation prévue
										</p>

										<p className="mt-2 text-2xl font-semibold text-slate-950">
											{selectedPrediction.predicted_k.toFixed(
												1,
											)}{" "}
											%
										</p>
									</div>

									<div className="rounded-xl bg-slate-50 p-4">
										<p className="text-xs text-slate-500">
											État
										</p>

										<span
											className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
												selectedPrediction.predicted_k,
											)}`}
										>
                      {getTrafficStatus(
						  selectedPrediction.predicted_k,
					  )}
                    </span>
									</div>
								</div>

								<div className="space-y-3 border-t border-slate-100 pt-5 text-sm">
									<DetailRow
										label="Longueur"
										value={
											selectedRoad.road_length_m !== null
												? `${selectedRoad.road_length_m.toFixed(
													0,
												)} m`
												: "—"
										}
									/>

									<DetailRow
										label="Horizon"
										value="+1 heure"
									/>

									<DetailRow
										label="Modèle"
										value={`v${selectedPrediction.model_version}`}
									/>
								</div>
							</>
						) : (
							<div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
								Aucune prédiction disponible pour cet axe.
							</div>
						)}
					</div>
				)}
			</article>
		</section>
	);
}

function DetailRow({
					   label,
					   value,
				   }: {
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">
        {label}
      </span>

			<span className="font-medium text-slate-900">
        {value}
      </span>
		</div>
	);
}
