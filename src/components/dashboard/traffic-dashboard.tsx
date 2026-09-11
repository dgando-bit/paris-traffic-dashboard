"use client";

import {
	useEffect,
	useMemo,
	useState,
} from "react";

import DashboardKpis from "@/components/dashboard/dashboard-kpis";
import RoadDetails from "@/components/dashboard/road-details";
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


export default function TrafficDashboard({
											 roads,
											 predictions,
										 }: TrafficDashboardProps) {
	const [
		selectedRoadId,
		setSelectedRoadId,
	] =
		useState<string | null>(
			predictions[0]?.iu_ac ??
			roads[0]?.iu_ac ??
			null,
		);

	const [horizon, setHorizon] =
		useState<PredictionHorizon>(1);

	const [
		currentPredictions,
		setCurrentPredictions,
	] =
		useState<Prediction[]>(
			predictions,
		);

	const [
		predictionsLoading,
		setPredictionsLoading,
	] =
		useState(false);

	const [
		predictionsError,
		setPredictionsError,
	] =
		useState<string | null>(null);

	const [
		history,
		setHistory,
	] =
		useState<RoadHistory | null>(
			null,
		);

	const [
		historyLoading,
		setHistoryLoading,
	] =
		useState(false);

	const [
		historyError,
		setHistoryError,
	] =
		useState<string | null>(null);

	const selectedRoad =
		roads.find(
			(road) =>
				road.iu_ac ===
				selectedRoadId,
		);

	const selectedPrediction =
		currentPredictions.find(
			(prediction) =>
				prediction.iu_ac ===
				selectedRoadId,
		);

	const criticalRoads =
		useMemo(
			() =>
				[...currentPredictions]
					.sort(
						(
							a,
							b,
						) =>
							b.predicted_k -
							a.predicted_k,
					)
					.slice(
						0,
						6,
					),
			[
				currentPredictions,
			],
		);

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
							cache:
								"no-store",
						},
					);

				if (
					!response.ok
				) {
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

					if (
						selectedRoadId &&
						!data.some(
							(
								prediction,
							) =>
								prediction.iu_ac ===
								selectedRoadId,
						)
					) {
						setSelectedRoadId(
							data[0]
								?.iu_ac ??
							null,
						);
					}
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
	}, [
		horizon,
		selectedRoadId,
	]);

	useEffect(() => {
		if (!selectedRoadId) {
			setHistory(null);
			return;
		}

		const controller =
			new AbortController();

		async function loadHistory() {
			try {
				setHistoryLoading(
					true,
				);

				setHistoryError(
					null,
				);

				const response =
					await fetch(
						`/api/roads/${encodeURIComponent(
							selectedRoadId!,
						)}/history?hours=24&horizon_hours=${horizon}`,
						{
							signal:
							controller.signal,
							cache:
								"no-store",
						},
					);

				if (
					!response.ok
				) {
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
	}, [
		selectedRoadId,
		horizon,
	]);

	return (
		<div className="space-y-5 lg:space-y-6">
			<DashboardKpis
				roads={roads}
				predictions={
					currentPredictions
				}
				horizon={horizon}
				loading={
					predictionsLoading
				}
			/>

			<section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
							Prévisions
						</p>

						<h2 className="mt-1 text-lg font-bold text-slate-950">
							Horizon de
							prédiction
						</h2>
					</div>

					<div className="inline-flex w-fit items-center rounded-xl bg-slate-100 p-1">
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
									className={`min-w-16 rounded-lg px-4 py-2 text-sm font-semibold transition ${
										horizon ===
										value
											? "bg-white text-blue-600 shadow-sm"
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
					<div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
						{
							predictionsError
						}
					</div>
				)}
			</section>

			<section
				id="map"
				className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,0.9fr)]"
			>
				<article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
					<div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
						<div>
							<h3 className="font-bold text-slate-950">
								Carte
								du
								trafic
							</h3>

							<p className="mt-1 text-sm text-slate-500">
								Prévision
								de
								congestion
								à +
								{
									horizon
								}
								h
							</p>
						</div>

						<div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
							<span className="h-2 w-2 rounded-full bg-emerald-500" />
							{
								currentPredictions.length
							}{" "}
							axes
						</div>
					</div>

					<div className="h-[420px] sm:h-[500px] xl:h-[620px]">
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
					className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
				>
					<RoadDetails
						road={
							selectedRoad
						}
						prediction={
							selectedPrediction
						}
						history={
							history
						}
						horizon={
							horizon
						}
						historyLoading={
							historyLoading
						}
						historyError={
							historyError
						}
					/>
				</article>
			</section>

			<section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
				<article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
								Analyse
							</p>

							<h3 className="mt-1 text-lg font-bold text-slate-950">
								Répartition
								du
								trafic
							</h3>
						</div>

						<span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                                        +
							{
								horizon
							}
							h
                                                </span>
					</div>

					<TrafficDistribution
						predictions={
							currentPredictions
						}
					/>
				</article>

				<article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
					<div className="mb-4">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
							Surveillance
						</p>

						<h3 className="mt-1 text-lg font-bold text-slate-950">
							Axes
							critiques
						</h3>
					</div>

					<div className="space-y-3">
						{criticalRoads.map(
							(
								prediction,
								index,
							) => {
								const road =
									roads.find(
										(
											item,
										) =>
											item.iu_ac ===
											prediction.iu_ac,
									);

								return (
									<button
										key={
											prediction.iu_ac
										}
										type="button"
										onClick={() =>
											setSelectedRoadId(
												prediction.iu_ac,
											)
										}
										className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
									>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
											{index +
												1}
										</div>

										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-slate-900">
												{road
														?.libelle ??
													`Axe ${prediction.iu_ac}`}
											</p>

											<p className="mt-0.5 text-xs text-slate-400">
												Axe{" "}
												{
													prediction.iu_ac
												}
											</p>
										</div>

										<div className="text-right">
											<p className="text-sm font-bold text-slate-900">
												{prediction.predicted_k.toFixed(
													1,
												)}
												%
											</p>

											<span
												className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusClass(
													prediction.predicted_k,
												)}`}
											>
                                                                                                {getTrafficStatus(
																									prediction.predicted_k,
																								)}
                                                                                        </span>
										</div>
									</button>
								);
							},
						)}
					</div>
				</article>
			</section>
		</div>
	);
}


function TrafficDistribution({
								 predictions,
							 }: {
	predictions: Prediction[];
}) {
	const groups = [
		{
			label: "Fluide",
			min: 0,
			max: 15,
			bar: "bg-emerald-500",
		},
		{
			label:
				"Pré-saturé",
			min: 15,
			max: 30,
			bar: "bg-amber-400",
		},
		{
			label: "Saturé",
			min: 30,
			max: 50,
			bar: "bg-orange-500",
		},
		{
			label: "Bloqué",
			min: 50,
			max: Infinity,
			bar: "bg-red-500",
		},
	];

	return (
		<div className="mt-6 space-y-5">
			{groups.map(
				(group) => {
					const count =
						predictions.filter(
							(
								prediction,
							) =>
								prediction.predicted_k >=
								group.min &&
								prediction.predicted_k <
								group.max,
						).length;

					const percentage =
						predictions.length >
						0
							? (count /
								predictions.length) *
							100
							: 0;

					return (
						<div
							key={
								group.label
							}
						>
							<div className="mb-2 flex items-center justify-between text-sm">
                                                                <span className="font-medium text-slate-700">
                                                                        {
																			group.label
																		}
                                                                </span>

								<span className="text-slate-400">
                                                                        {
																			count
																		}{" "}
									axes
                                                                        ·{" "}
									{percentage.toFixed(
										1,
									)}
									%
                                                                </span>
							</div>

							<div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
								<div
									className={`h-full rounded-full ${group.bar}`}
									style={{
										width:
											`${percentage}%`,
									}}
								/>
							</div>
						</div>
					);
				},
			)}
		</div>
	);
}
