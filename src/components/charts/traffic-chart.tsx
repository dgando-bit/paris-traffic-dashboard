"use client";

import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import type {
	PredictionHorizon,
	RoadHistory,
} from "@/types/traffic";


type TrafficChartProps = {
	history: RoadHistory;
	horizon: PredictionHorizon;
};


type ChartPoint = {
	timestamp: string;
	actual: number | null;
	prediction: number | null;
};


function formatHour(timestamp: string) {
	return new Intl.DateTimeFormat(
		"fr-FR",
		{
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Europe/Paris",
		},
	).format(
		new Date(timestamp),
	);
}


export default function TrafficChart({
										 history,
										 horizon,
									 }: TrafficChartProps) {
	const data: ChartPoint[] =
		history.observations.map(
			(observation) => ({
				timestamp:
				observation.timestamp_utc,
				actual:
				observation.k,
				prediction:
					null,
			}),
		);

	const prediction =
		history.prediction;

	if (prediction) {
		data.push({
			timestamp:
			prediction.target_timestamp_utc,
			actual: null,
			prediction:
			prediction.predicted_k,
		});
	}

	return (
		<div className="h-[260px] w-full sm:h-[300px]">
			<ResponsiveContainer
				width="100%"
				height="100%"
			>
				<LineChart
					data={data}
					margin={{
						top: 10,
						right: 12,
						bottom: 0,
						left: -12,
					}}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="#e2e8f0"
					/>

					<XAxis
						dataKey="timestamp"
						tickFormatter={
							formatHour
						}
						minTickGap={28}
						tickLine={false}
						axisLine={false}
						tick={{
							fontSize: 11,
							fill: "#94a3b8",
						}}
					/>

					<YAxis
						unit="%"
						domain={[
							0,
							"auto",
						]}
						tickLine={false}
						axisLine={false}
						tick={{
							fontSize: 11,
							fill: "#94a3b8",
						}}
					/>

					<Tooltip
						contentStyle={{
							borderRadius:
								12,
							border:
								"1px solid #e2e8f0",
							boxShadow:
								"0 10px 30px rgba(15, 23, 42, 0.08)",
							fontSize:
								12,
						}}
						labelFormatter={(
							value,
						) =>
							new Intl.DateTimeFormat(
								"fr-FR",
								{
									dateStyle:
										"short",
									timeStyle:
										"short",
									timeZone:
										"Europe/Paris",
								},
							).format(
								new Date(
									String(
										value,
									),
								),
							)
						}
						formatter={(
							value,
							name,
						) => [
							`${Number(
								value,
							).toFixed(
								1,
							)} %`,
							name ===
							"actual"
								? "Occupation réelle"
								: `Prévision +${horizon}h`,
						]}
					/>

					<ReferenceLine
						y={15}
						stroke="#f59e0b"
						strokeDasharray="4 4"
						strokeOpacity={
							0.45
						}
					/>

					<ReferenceLine
						y={30}
						stroke="#f97316"
						strokeDasharray="4 4"
						strokeOpacity={
							0.45
						}
					/>

					<ReferenceLine
						y={50}
						stroke="#ef4444"
						strokeDasharray="4 4"
						strokeOpacity={
							0.45
						}
					/>

					<Line
						type="monotone"
						dataKey="actual"
						name="actual"
						stroke="#2563eb"
						strokeWidth={3}
						dot={false}
						connectNulls={false}
					/>

					<Line
						type="monotone"
						dataKey="prediction"
						name="prediction"
						stroke="#ef4444"
						strokeWidth={3}
						dot={{
							r: 5,
							fill:
								"#ef4444",
							stroke:
								"#ffffff",
							strokeWidth:
								2,
						}}
						connectNulls={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
