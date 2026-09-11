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

	return (
		<div className="min-h-screen bg-[#f5f7fb]">
			<div className="flex min-h-screen">
				<aside className="hidden w-[260px] shrink-0 flex-col bg-[#0f172a] px-5 py-6 text-white lg:flex">
					<div className="mb-10">
						<div className="flex items-center gap-3">
							<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-900/20">
								P
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
									Paris
								</p>

								<h1 className="text-base font-semibold">
									Traffic AI
								</h1>
							</div>
						</div>

						<p className="mt-5 text-sm leading-6 text-slate-400">
							Supervision et
							prédiction de la
							congestion routière
							parisienne.
						</p>
					</div>

					<nav className="space-y-2">
						<a
							href="#overview"
							className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white"
						>
                                                        <span className="text-base">
                                                                ◫
                                                        </span>

							Vue d&apos;ensemble
						</a>

						<a
							href="#map"
							className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
						>
                                                        <span className="text-base">
                                                                ⌖
                                                        </span>

							Carte du trafic
						</a>

						<a
							href="#predictions"
							className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
						>
                                                        <span className="text-base">
                                                                ◒
                                                        </span>

							Prédictions
						</a>
					</nav>

					<div className="mt-auto space-y-4">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs uppercase tracking-[0.16em] text-slate-500">
								Intelligence
							</p>

							<p className="mt-2 text-sm font-semibold text-white">
								LightGBM
							</p>

							<p className="mt-1 text-xs leading-5 text-slate-400">
								Modèles
								multi-horizon
								+1h / +2h / +3h
							</p>
						</div>

						<div className="text-xs text-slate-600">
							Traffic Prediction Paris
						</div>
					</div>
				</aside>

				<main className="min-w-0 flex-1">
					<header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
						<div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
							<div className="flex min-w-0 items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white lg:hidden">
									P
								</div>

								<div className="min-w-0">
									<p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">
										Traffic
										Prediction
										Paris
									</p>

									<h2 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
										Tableau de bord
										trafic
									</h2>
								</div>
							</div>

							<div
								className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${
									apiAvailable
										? "border-emerald-200 bg-emerald-50 text-emerald-700"
										: "border-red-200 bg-red-50 text-red-700"
								}`}
							>
                                                                <span
																	className={`h-2 w-2 rounded-full ${
																		apiAvailable
																			? "bg-emerald-500"
																			: "bg-red-500"
																	}`}
																/>

								<span className="hidden sm:inline">
                                                                        {apiAvailable
																			? "API opérationnelle"
																			: "API indisponible"}
                                                                </span>

								<span className="sm:hidden">
                                                                        {apiAvailable
																			? "Live"
																			: "Offline"}
                                                                </span>
							</div>
						</div>
					</header>

					<div
						id="overview"
						className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
					>
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
