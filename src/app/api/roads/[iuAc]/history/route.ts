import { NextRequest, NextResponse } from "next/server";

const API_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RouteContext = {
	params: Promise<{
		iuAc: string;
	}>;
};

export async function GET(
	request: NextRequest,
	context: RouteContext,
) {
	const { iuAc } = await context.params;

	const hours =
		request.nextUrl.searchParams.get("hours") ?? "24";

	const horizonHours =
		request.nextUrl.searchParams.get(
			"horizon_hours",
		) ?? "1";

	const response = await fetch(
		`${API_URL}/roads/${encodeURIComponent(
			iuAc,
		)}/history?hours=${encodeURIComponent(
			hours,
		)}&horizon_hours=${encodeURIComponent(
			horizonHours,
		)}`,
		{
			cache: "no-store",
		},
	);

	if (!response.ok) {
		return NextResponse.json(
			{
				error: "Unable to retrieve traffic history",
			},
			{
				status: response.status,
			},
		);
	}

	const data = await response.json();

	return NextResponse.json(data);
}
