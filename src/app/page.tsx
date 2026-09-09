import TrafficMapWrapper from "@/components/map/traffic-map-wrapper";

import {
	getLatestPredictions,
	getRoads,
} from "@/lib/api";

import type {
	Prediction,
	Road,
} from "@/types/traffic";

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

function formatDate(value: string) {
	return new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "short",
		timeStyle: "short",
		timeZone: "Europe/Paris",
	}).format(new Date(value));
}

export default async function Home() {
	let predictions: Prediction[] = [];
	let roads: Road[] = [];
	let apiAvailable = true;

	try {
		const [
			latestPredictions,
			roadSegments,
		] = await Promise.all([
			getLatestPredictions(),
			getRoads(),
		]);

		predictions = latestPredictions;
		roads = roadSegments;
	} catch (error) {
		apiAvailable = false;

		console.error(
			"Unable to fetch traffic API:",
			error,
		);
	}

	const congestedRoads = predictions.filter(
		(prediction) =>
			prediction.predicted_k >= 30,
	).length;

	const averageK =
		predictions.length > 0
			? predictions.reduce(
			(sum, prediction) =>
				sum + prediction.predicted_k,
			0,
		) / predictions.length
			: 0;

	const modelVersion =
		predictions.length > 0
			? `v${predictions[0].model_version}`
			: "—";

	const lastPrediction =
		predictions.length > 0
			? predictions.reduce(
				(latest, prediction) =>
					prediction.prediction_timestamp_utc >
					latest.prediction_timestamp_utc
						? prediction
						: latest,
			)
			: null;

	const kpis = [
		{
			label: "Axes surveillés",
			value: roads.length.toString(),
			description: "axes routiers disponibles",
		},
		{
			label: "Axes saturés",
			value: congestedRoads.toString(),
			description: "occupation prévue ≥ 30 %",
		},
		{
			label: "Occupation moyenne",
			value:
				predictions.length > 0
					? `${averageK.toFixed(1)} %`
					: "—",
			description: "prévision moyenne à +1 h",
		},
		{
			label: "Modèle actif",
			value: modelVersion,
			description: "modèle champion",
		},
	];

	return (
		<div className="min-h-screen bg-slate-100">
			<div className="flex min-h-screen">
				<aside className="hidden w-64 shrink-0 flex-col bg-slate-950 px-5 py-6 text-white lg:flex">
					<div className="mb-10">
						<div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400">
							Paris
						</div>

						<h1 className="mt-2 text-xl font-semibold">
							Traffic Intelligence
						</h1>

						<p className="mt-2 text-sm leading-6 text-slate-400">
							Prédiction de congestion routière
							à +1 heure
						</p>
					</div>

					<nav className="space-y-2">
						<a
							href="#overview"
							className="block rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium"
						>
							Vue d&apos;ensemble
						</a>

						<a
							href="#map"
							className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
						>
							Carte du trafic
						</a>

						<a
							href="#predictions"
							className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
						>
							Prédictions
						</a>
					</nav>

					<div className="mt-auto border-t border-slate-800 pt-5">
						<p className="text-xs uppercase tracking-wider text-slate-500">
							Modèle
						</p>

						<p className="mt-2 text-sm font-medium">
							LightGBM · {modelVersion}
						</p>
					</div>
				</aside>

				<main className="min-w-0 flex-1">
					<header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
						<div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
							<div>
								<p className="text-sm font-medium text-sky-600">
									Traffic Prediction Paris
								</p>

								<h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
									Tableau de bord trafic
								</h2>
							</div>

							<div
								className={`hidden items-center gap-3 rounded-full px-4 py-2 text-sm font-medium sm:flex ${
									apiAvailable
										? "border border-emerald-200 bg-emerald-50 text-emerald-700"
										: "border border-red-200 bg-red-50 text-red-700"
								}`}
							>
                <span
					className={`h-2 w-2 rounded-full ${
						apiAvailable
							? "bg-emerald-500"
							: "bg-red-500"
					}`}
				/>

								{apiAvailable
									? "API opérationnelle"
									: "API indisponible"}
							</div>
						</div>
					</header>

					<div
						id="overview"
						className="mx-auto max-w-7xl space-y-6 px-6 py-6 lg:px-8 lg:py-8"
					>
						<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
							{kpis.map((kpi) => (
								<article
									key={kpi.label}
									className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
								>
									<p className="text-sm font-medium text-slate-500">
										{kpi.label}
									</p>

									<div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
										{kpi.value}
									</div>

									<p className="mt-2 text-sm text-slate-500">
										{kpi.description}
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
											Carte du trafic parisien
										</h3>

										<p className="mt-1 text-sm text-slate-500">
											Prévision de congestion par axe
											routier
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
									/>
								</div>
							</article>

							<article
								id="predictions"
								className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
							>
								<div className="border-b border-slate-200 px-5 py-4">
									<h3 className="font-semibold text-slate-950">
										Prédictions actuelles
									</h3>

									<p className="mt-1 text-sm text-slate-500">
										{lastPrediction
											? `Dernière mise à jour : ${formatDate(
												lastPrediction.prediction_timestamp_utc,
											)}`
											: "Aucune prédiction disponible"}
									</p>
								</div>

								<div className="max-h-[460px] overflow-y-auto">
									{predictions.length === 0 ? (
										<div className="p-6 text-sm text-slate-500">
											Aucune donnée disponible.
										</div>
									) : (
										predictions.map(
											(prediction) => (
												<div
													key={prediction.iu_ac}
													className="border-b border-slate-100 px-5 py-4 last:border-b-0"
												>
													<div className="flex items-start justify-between gap-4">
														<div>
															<p className="text-xs uppercase tracking-wide text-slate-400">
																Axe
															</p>

															<p className="mt-1 font-semibold text-slate-950">
																{
																	prediction.iu_ac
																}
															</p>
														</div>

														<span
															className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
																prediction.predicted_k,
															)}`}
														>
                              {getTrafficStatus(
								  prediction.predicted_k,
							  )}
                            </span>
													</div>

													<div className="mt-4 flex items-end justify-between">
														<div>
															<p className="text-xs text-slate-500">
																Occupation prévue
															</p>

															<p className="mt-1 text-xl font-semibold text-slate-900">
																{prediction.predicted_k.toFixed(
																	1,
																)}{" "}
																%
															</p>
														</div>

														<p className="text-xs text-slate-400">
															+1 h
														</p>
													</div>
												</div>
											),
										)
									)}
								</div>
							</article>
						</section>

						<section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
							<div className="border-b border-slate-200 px-5 py-4">
								<h3 className="font-semibold text-slate-950">
									Évolution du trafic
								</h3>

								<p className="mt-1 text-sm text-slate-500">
									Historique et prévisions
								</p>
							</div>

							<div className="flex min-h-64 items-center justify-center p-8">
								<p className="max-w-xl text-center text-sm leading-6 text-slate-500">
									Cette section sera alimentée par
									un endpoint d&apos;historique
									FastAPI avant l&apos;intégration
									du graphique Recharts.
								</p>
							</div>
						</section>
					</div>
				</main>
			</div>
		</div>
	);
}
