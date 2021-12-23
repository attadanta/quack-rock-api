export class HttpException extends Error {
  statusCode?: number;
  message: string;
  error: string | null;

  constructor(statusCode: number, message: string, error?: string) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.error = error || null;
  }
}

export class InternalServerError extends HttpException {
  constructor(error?: string) {
    super(500, "Internal Server Error", error);
  }
}

export class NotFoundError extends HttpException {
  constructor(error?: string) {
    super(404, "Not Found", error);
  }
}

export class BadRequestException extends HttpException {
  constructor(error?: string) {
    super(400, "Bad Request", error);
  }
}
