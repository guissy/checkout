import { failResponse } from "./api.mock";
import type { FpResponse } from "./api.type";

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const printError = <T>(error: APIError): Promise<FpResponse<T>> => {
  console.error(error);
  return failResponse({} as T);
};
