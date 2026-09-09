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

import type { RoadHistory } from "@/types/traffic";

type TrafficChartProps = {
	history: RoadHistory;
};

type ChartPoint = {
	timestamp: string;
	actual: number | null;
	prediction: number | null;
};

function formatHour(timestamp: string) {
	return new Intl.DateTimeFormat("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Europe/Paris",
	}).format(new Date(timestamp));
}

export default function TrafficChart({
										 history,
									 }: TrafficChartProps) {
	const data: ChartPoint[] =
		history.observations.map((observation) => ({
			timestamp: observation.timestamp_utc,
			actual: observation.k,
			prediction: null,
		}));

	const prediction = history.prediction;

	if (prediction) {
		data.push({
			timestamp: prediction.target_timestamp_utc,
			actual: null,
			prediction: prediction.predicted_k,
		});
	}

	return (
		<div className="h-[320px] w-full">
			<ResponsiveContainer
				width="100%"
				height="100%"
			>
				<LineChart
					data={data}
					margin={{
						top: 10,
						right: 20,
						bottom: 10,
						left: 0,
					}}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
					/>

					<XAxis
						dataKey="timestamp"
						tickFormatter={formatHour}
						minTickGap={30}
						tickLine={false}
					/>

					<YAxis
						unit="%"
						domain={[0, "auto"]}
						tickLine={false}
					/>

					<Tooltip
						labelFormatter={(value) =>
							new Intl.DateTimeFormat("fr-FR", {
								dateStyle: "short",
								timeStyle: "short",
								timeZone: "Europe/Paris",
							}).format(new Date(String(value)))
						}
						formatter={(
							value,
							name,
						) => [
							`${Number(value).toFixed(1)} %`,
							name === "actual"
								? "Occupation réelle"
								: "Prévision +1h",
						]}
					/>

					<ReferenceLine
						y={15}
						strokeDasharray="4 4"
						label="Pré-saturé"
					/>

					<ReferenceLine
						y={30}
						strokeDasharray="4 4"
						label="Saturé"
					/>

					<ReferenceLine
						y={50}
						strokeDasharray="4 4"
						label="Bloqué"
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
							r: 6,
						}}
						connectNulls={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
