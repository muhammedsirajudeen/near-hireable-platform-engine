class RouteError extends Error {
	statusCode: number;
	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "RouteError";
		this.statusCode = statusCode;
	}
}

export default RouteError;
