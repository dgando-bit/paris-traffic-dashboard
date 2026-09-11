import TrafficChart from "@/components/charts/traffic-chart";

import type {
	Prediction,
	PredictionHorizon,
	Road,
	RoadHistory,
} from "@/types/traffic";


type RoadDetailsProps = {
	road: Road | undefined;
	prediction: Prediction | undefined;
	history: RoadHistory | null;
	horizon: PredictionHorizon;
	historyLoading: boolean;
	historyError: string | null;
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


export default function RoadDetails({
										road,
										prediction,
										history,
										horizon,
										historyLoading,
										historyError,
									}: RoadDetailsProps) {
	if (!road) {
		return (
			<div className="flex min-h-[300px] items-center justify-center p-8 lg:min-h-[440px]">
				<div className="max-w-xs text-center">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
						↖
					</div>

					<h3 className="mt-5 font-semibold text-slate-900">
						Sélectionnez un axe
					</h3>

					<p className="mt-2 text-sm leading-6 text-slate-500">
						Cliquez sur un tronçon de la
						carte pour consulter sa
						prévision et son historique.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-5 p-5">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
					Axe sélectionné
				</p>

				<h3 className="mt-2 text-xl font-bold text-slate-950">
					{road.libelle ??
						`Axe ${road.iu_ac}`}
				</h3>

				<p className="mt-1 text-sm text-slate-500">
					Identifiant {road.iu_ac}
				</p>
			</div>

			{prediction ? (
				<>
					<div className="rounded-2xl bg-slate-50 p-4">
						<div className="flex items-end justify-between gap-4">
							<div>
								<p className="text-sm text-slate-500">
									Occupation prévue
								</p>

								<p className="mt-1 text-4xl font-bold tracking-tight text-slate-950">
									{prediction.predicted_k.toFixed(
										1,
									)}
									<span className="ml-1 text-xl text-slate-400">
                                                                                %
                                                                        </span>
								</p>
							</div>

							<span
								className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
									prediction.predicted_k,
								)}`}
							>
                                                                {getTrafficStatus(
																	prediction.predicted_k,
																)}
                                                        </span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Info
							label="Horizon"
							value={`+${horizon} h`}
						/>

						<Info
							label="Modèle"
							value={`v${prediction.model_version}`}
						/>

						<Info
							label="Longueur"
							value={
								road.road_length_m !==
								null
									? `${road.road_length_m.toFixed(
										0,
									)} m`
									: "—"
							}
						/>

						<Info
							label="Prévu pour"
							value={formatDate(
								prediction.target_timestamp_utc,
							)}
						/>
					</div>
				</>
			) : (
				<div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
					Aucune prédiction disponible pour cet
					axe à +{horizon} h.
				</div>
			)}

			<div className="border-t border-slate-100 pt-5">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h4 className="font-semibold text-slate-900">
							Évolution récente
						</h4>

						<p className="mt-1 text-xs text-slate-400">
							Occupation sur les
							dernières 24 h
						</p>
					</div>

					<span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                                +{horizon}h
                                        </span>
				</div>

				{historyLoading ? (
					<div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
						Chargement de l&apos;historique…
					</div>
				) : historyError ? (
					<div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
						{historyError}
					</div>
				) : history ? (
					<TrafficChart
						history={history}
						horizon={horizon}
					/>
				) : null}
			</div>
		</div>
	);
}


function Info({
				  label,
				  value,
			  }: {
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-xl border border-slate-100 bg-white p-3">
			<p className="text-xs text-slate-400">
				{label}
			</p>

			<p className="mt-1 text-sm font-semibold text-slate-800">
				{value}
			</p>
		</div>
	);
}
