"use client";

import dynamic from "next/dynamic";

import type {
	Prediction,
	Road,
} from "@/types/traffic";

const TrafficMap = dynamic(
	() => import("./traffic-map"),
	{
		ssr: false,
	},
);

type TrafficMapWrapperProps = {
	roads: Road[];
	predictions: Prediction[];
	selectedRoadId: string | null;
	onSelectRoad: (iuAc: string) => void;
};

export default function TrafficMapWrapper({
											  roads,
											  predictions,
											  selectedRoadId,
											  onSelectRoad,
										  }: TrafficMapWrapperProps) {
	return (
		<TrafficMap
			roads={roads}
			predictions={predictions}
			selectedRoadId={selectedRoadId}
			onSelectRoad={onSelectRoad}
		/>
	);
}
