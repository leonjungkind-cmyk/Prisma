import { type ClientErrorStatusCode } from 'hono/utils/http-status';
import { type Context } from 'hono';

export const badRequest = 400;
export const unauthorized = 401;
export const forbidden = 403;
export const preconditionFailed = 412;
export const unprocessableContent = 422;
export const preconditionRequired = 428;

export type ProblemDetails = {
    title: string;
    statusCode: ClientErrorStatusCode;
    detail: any;
};

// Einheitliche Fehlerantworten nach RFC 9457
// https://www.rfc-editor.org/rfc/rfc9457
export const createProblemDetails = (
    ctx: Context,
    statusCode: ClientErrorStatusCode,
    detail: unknown,
): Response => {
    let problemDetails: ProblemDetails;

    switch (statusCode) {
        case badRequest: {
            problemDetails = { title: 'Bad Request', statusCode, detail };
            break;
        }
        case unauthorized: {
            problemDetails = { title: 'Unauthorized', statusCode, detail };
            break;
        }
        case forbidden: {
            problemDetails = { title: 'Forbidden', statusCode, detail };
            break;
        }
        case preconditionFailed: {
            problemDetails = {
                title: 'Precondition Failed',
                statusCode,
                detail,
            };
            break;
        }
        case unprocessableContent: {
            problemDetails = {
                title: 'Unprocessable Content',
                statusCode,
                detail,
            };
            break;
        }
        case preconditionRequired: {
            problemDetails = {
                title: 'Precondition Required',
                statusCode,
                detail,
            };
            break;
        }
        default: {
            problemDetails = { title: 'Client Error', statusCode, detail };
        }
    }

    // Antwort als JSON mit korrektem Content-Type für Problem Details
    const response: Response = ctx.json(problemDetails, statusCode);
    response.headers.set('Content-Type', 'application/problem+json');
    return response;
};
