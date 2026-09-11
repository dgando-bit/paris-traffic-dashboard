import type {
	Prediction,
	PredictionHorizon,
	Road,
} from "@/types/traffic";


type DashboardKpisProps = {
	roads: Road[];
	predictions: Prediction[];
	horizon: PredictionHorizon;
	loading?: boolean;
};


export default function DashboardKpis({
										  roads,
										  predictions,
										  horizon,
										  loading = false,
									  }: DashboardKpisProps) {
	const congestedRoads =
		predictions.filter(
			(prediction) =>
				prediction.predicted_k >= 30,
		).length;

	const averageK =
		predictions.length > 0
			? predictions.reduce(
			(
				total,
				prediction,
			) =>
				total +
				prediction.predicted_k,
			0,
		) / predictions.length
			: null;

	const modelVersion =
		predictions.length > 0
			? `v${predictions[0].model_version}`
			: "—";

	const kpis = [
		{
			label: "Axes surveillés",
			value: roads.length.toString(),
			description:
				"axes routiers disponibles",
			icon: "⌘",
			tone:
				"bg-blue-50 text-blue-600",
		},
		{
			label: "Occupation moyenne",
			value:
				averageK !== null
					? `${averageK.toFixed(1)} %`
					: "—",
			description:
				`prévision à +${horizon} h`,
			icon: "%",
			tone:
				"bg-emerald-50 text-emerald-600",
		},
		{
			label: "Axes saturés",
			value:
				congestedRoads.toString(),
			description:
				"occupation prévue ≥ 30 %",
			icon: "!",
			tone:
				congestedRoads > 0
					? "bg-orange-50 text-orange-600"
					: "bg-emerald-50 text-emerald-600",
		},
		{
			label: "Modèle actif",
			value: modelVersion,
			description:
				`champion +${horizon} h`,
			icon: "AI",
			tone:
				"bg-violet-50 text-violet-600",
		},
	];

	return (
		<section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
			{kpis.map((kpi) => (
				<article
					key={kpi.label}
					className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500 sm:text-sm">
								{kpi.label}
							</p>

							<p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
								{loading &&
								kpi.label !==
								"Axes surveillés"
									? "…"
									: kpi.value}
							</p>
						</div>

						<div
							className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold ${kpi.tone}`}
						>
							{kpi.icon}
						</div>
					</div>

					<p className="mt-2 truncate text-xs text-slate-400 sm:text-sm">
						{kpi.description}
					</p>
				</article>
			))}
		</section>
	);
}
