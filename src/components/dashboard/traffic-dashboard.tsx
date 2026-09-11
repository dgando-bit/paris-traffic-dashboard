"use client";

import {
	useEffect,
	useState,
} from "react";

import TrafficChart from "@/components/charts/traffic-chart";
import TrafficMapWrapper from "@/components/map/traffic-map-wrapper";

import type {
	Prediction,
	PredictionHorizon,
	Road,
	RoadHistory,
} from "@/types/traffic";


type TrafficDashboardProps = {
	roads: Road[];
	predictions: Prediction[];
};


function getTrafficStatus(k: number) {
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


function formatDate(value: string) {
	return new Intl.DateTimeFormat(
		"fr-FR",
		{
			dateStyle: "short",
			timeStyle: "short",
			timeZone: "Europe/Paris",
		},
	).format(
		new Date(value),
	);
}


export default function TrafficDashboard({
											 roads,
											 predictions,
										 }: TrafficDashboardProps) {
	const [selectedRoadId, setSelectedRoadId] =
		useState<string | null>(null);

	const [horizon, setHorizon] =
		useState<PredictionHorizon>(1);

	const [currentPredictions, setCurrentPredictions] =
		useState<Prediction[]>(predictions);

	const [predictionsLoading, setPredictionsLoading] =
		useState(false);

	const [predictionsError, setPredictionsError] =
		useState<string | null>(null);

	const [history, setHistory] =
		useState<RoadHistory | null>(null);

	const [historyLoading, setHistoryLoading] =
		useState(false);

	const [historyError, setHistoryError] =
		useState<string | null>(null);

	const selectedRoad = roads.find(
		(road) =>
			road.iu_ac === selectedRoadId,
	);

	const selectedPrediction =
		currentPredictions.find(
			(prediction) =>
				prediction.iu_ac ===
				selectedRoadId,
		);

	const congestedRoads =
		currentPredictions.filter(
			(prediction) =>
				prediction.predicted_k >= 30,
		).length;

	const averageK =
		currentPredictions.length > 0
			? currentPredictions.reduce(
				(
					sum,
					prediction,
				) =>
					sum +
					prediction.predicted_k,
				0,
			) /
			currentPredictions.length
			: 0;

	const modelVersion =
		currentPredictions.length > 0
			? `v${currentPredictions[0].model_version}`
			: "—";

	const kpis = [
		{
			label: "Axes surveillés",
			value: roads.length.toString(),
			description:
				"axes routiers disponibles",
		},
		{
			label: "Axes saturés",
			value: congestedRoads.toString(),
			description:
				"occupation prévue ≥ 30 %",
		},
		{
			label: "Occupation moyenne prédite",
			value:
				currentPredictions.length > 0
					? `${averageK.toFixed(1)} %`
					: "—",
			description:
				currentPredictions.length > 0
					? `sur ${currentPredictions.length} axes à +${horizon} h`
					: `à +${horizon} h`,
		},
		{
			label: "Modèle actif",
			value: modelVersion,
			description:
				`champion +${horizon} h`,
		},
	];

	useEffect(() => {
		const controller =
			new AbortController();

		async function loadPredictions() {
			try {
				setPredictionsLoading(
					true,
				);

				setPredictionsError(
					null,
				);

				const response =
					await fetch(
						`/api/predictions/latest?horizon_hours=${horizon}`,
						{
							signal:
							controller.signal,
							cache: "no-store",
						},
					);

				if (!response.ok) {
					throw new Error(
						"Impossible de récupérer les prédictions",
					);
				}

				const data =
					(await response.json()) as Prediction[];

				if (
					!controller.signal.aborted
				) {
					setCurrentPredictions(
						data,
					);

					setPredictionsError(
						null,
					);
				}
			} catch (error) {
				if (
					error instanceof DOMException &&
					error.name ===
					"AbortError"
				) {
					return;
				}

				if (
					!controller.signal.aborted
				) {
					setPredictionsError(
						"Les prédictions sont indisponibles.",
					);
				}
			} finally {
				if (
					!controller.signal.aborted
				) {
					setPredictionsLoading(
						false,
					);
				}
			}
		}

		void loadPredictions();

		return () => {
			controller.abort();
		};
	}, [horizon]);

	useEffect(() => {
		if (!selectedRoadId) {
			return;
		}

		const controller =
			new AbortController();

		async function loadHistory() {
			try {
				setHistoryLoading(
					true,
				);

				const response =
					await fetch(
						`/api/roads/${encodeURIComponent(
							selectedRoadId!,
						)}/history?hours=24&horizon_hours=${horizon}`,
						{
							signal:
							controller.signal,
							cache: "no-store",
						},
					);

				if (!response.ok) {
					throw new Error(
						"Impossible de récupérer l'historique",
					);
				}

				const data =
					(await response.json()) as RoadHistory;

				if (
					!controller.signal.aborted
				) {
					setHistory(
						data,
					);

					setHistoryError(
						null,
					);
				}
			} catch (error) {
				if (
					error instanceof DOMException &&
					error.name ===
					"AbortError"
				) {
					return;
				}

				if (
					!controller.signal.aborted
				) {
					setHistory(
						null,
					);

					setHistoryError(
						"L'historique du trafic est indisponible.",
					);
				}
			} finally {
				if (
					!controller.signal.aborted
				) {
					setHistoryLoading(
						false,
					);
				}
			}
		}

		void loadHistory();

		return () => {
			controller.abort();
		};
	}, [selectedRoadId, horizon]);

	return (
		<div className="space-y-6">
			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{kpis.map((kpi) => (
					<article
						key={
							kpi.label
						}
						className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
					>
						<p className="text-sm font-medium text-slate-500">
							{
								kpi.label
							}
						</p>

						<div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
							{predictionsLoading &&
							kpi.label !==
							"Axes surveillés"
								? "…"
								: kpi.value}
						</div>

						<p className="mt-2 text-sm text-slate-500">
							{
								kpi.description
							}
						</p>
					</article>
				))}
			</section>

			<section
				id="map"
				className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"
			>
				<article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
						<div>
							<h3 className="font-semibold text-slate-950">
								Carte du trafic
								parisien
							</h3>

							<p className="mt-1 text-sm text-slate-500">
								Cliquez sur un axe
								pour afficher ses
								détails
							</p>
						</div>

						<div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
							{(
								[
									1,
									2,
									3,
								] as PredictionHorizon[]
							).map(
								(
									value,
								) => (
									<button
										key={
											value
										}
										type="button"
										onClick={() =>
											setHorizon(
												value,
											)
										}
										disabled={
											predictionsLoading
										}
										className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
											horizon ===
											value
												? "bg-white text-slate-950 shadow-sm"
												: "text-slate-500 hover:text-slate-900"
										}`}
									>
										+
										{
											value
										}
										h
									</button>
								),
							)}
						</div>
					</div>

					{predictionsError && (
						<div className="border-b border-red-100 bg-red-50 px-5 py-2 text-sm text-red-700">
							{
								predictionsError
							}
						</div>
					)}

					<div className="h-[460px]">
						<TrafficMapWrapper
							roads={
								roads
							}
							predictions={
								currentPredictions
							}
							selectedRoadId={
								selectedRoadId
							}
							onSelectRoad={
								setSelectedRoadId
							}
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
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
									↖
								</div>

								<p className="mt-4 font-medium text-slate-800">
									Aucun axe
									sélectionné
								</p>

								<p className="mt-2 text-sm leading-6 text-slate-500">
									Cliquez sur un
									tronçon de la
									carte pour
									consulter sa
									prévision de
									trafic.
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
									{
										selectedRoad.iu_ac
									}
								</p>

								<p className="mt-1 text-sm text-slate-500">
									{selectedRoad.libelle ??
										"Nom indisponible"}
								</p>
							</div>

							{selectedPrediction ? (
								<>
									<div className="grid grid-cols-2 gap-3">
										<div className="rounded-xl bg-slate-50 p-4">
											<p className="text-xs text-slate-500">
												Occupation
												prévue
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
												selectedRoad.road_length_m !==
												null
													? `${selectedRoad.road_length_m.toFixed(
														0,
													)} m`
													: "—"
											}
										/>

										<DetailRow
											label="Horizon"
											value={`+${horizon} heure${
												horizon >
												1
													? "s"
													: ""
											}`}
										/>

										<DetailRow
											label="Prévision pour"
											value={formatDate(
												selectedPrediction.target_timestamp_utc,
											)}
										/>

										<DetailRow
											label="Modèle"
											value={`v${selectedPrediction.model_version}`}
										/>
									</div>
								</>
							) : (
								<div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
									Aucune prédiction
									disponible pour
									cet axe.
								</div>
							)}
						</div>
					)}
				</article>
			</section>

			<section
				id="history"
				className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
			>
				<div className="mb-6">
					<h3 className="font-semibold text-slate-950">
						Évolution du trafic
					</h3>

					<p className="mt-1 text-sm text-slate-500">
						{selectedRoad
							? `Occupation sur les dernières 24 h — ${
								selectedRoad.libelle ??
								`axe ${selectedRoad.iu_ac}`
							}`
							: "Sélectionnez un axe pour afficher son historique"}
					</p>
				</div>

				{!selectedRoadId ? (
					<div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
						Sélectionnez un axe sur
						la carte.
					</div>
				) : historyLoading ? (
					<div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
						Chargement de
						l&apos;historique…
					</div>
				) : historyError ? (
					<div className="flex h-[280px] items-center justify-center text-sm text-red-600">
						{
							historyError
						}
					</div>
				) : history ? (
					<TrafficChart
						history={
							history
						}
					/>
				) : (
					<div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
						Aucun historique
						disponible.
					</div>
				)}
			</section>
		</div>
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

			<span className="text-right font-medium text-slate-900">
                                {value}
                        </span>
		</div>
	);
}
