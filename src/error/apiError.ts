import { NextResponse } from "next/server";
import RouteError from "./routeError";

export default function ApiError(error: unknown) {
	if(error instanceof RouteError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
	return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}