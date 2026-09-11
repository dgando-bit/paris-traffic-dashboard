import {
	NextRequest,
	NextResponse,
} from "next/server";


const API_URL =
	process.env.NEXT_PUBLIC_API_URL ??
	"http://localhost:8000";


export async function GET(
	request: NextRequest,
) {
	const horizonHours =
		request.nextUrl.searchParams.get(
			"horizon_hours",
		) ?? "1";

	const response = await fetch(
		`${API_URL}/predictions/latest?horizon_hours=${encodeURIComponent(
			horizonHours,
		)}`,
		{
			cache: "no-store",
		},
	);

	if (!response.ok) {
		return NextResponse.json(
			{
				error:
					"Unable to retrieve predictions",
			},
			{
				status: response.status,
			},
		);
	}

	const data = await response.json();

	return NextResponse.json(data);
}
