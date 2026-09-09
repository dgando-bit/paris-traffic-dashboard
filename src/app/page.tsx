import TrafficDashboard from "@/components/dashboard/traffic-dashboard";
import {
	getLatestPredictions,
	getRoads,
} from "@/lib/api";

import type {
	Prediction,
	Road,
} from "@/types/traffic";

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

						<TrafficDashboard
							roads={roads}
							predictions={predictions}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}
