import { AxiosError } from "axios";
import type { IBaseResponse } from "@/@base/interfaces/interfaces";

export function ErrorHandler(error: unknown): never {
  if (error instanceof AxiosError) {
    const data = error.response?.data as IBaseResponse | undefined;
    const messages = data?.errorMessages?.filter(Boolean);
    if (messages?.length) {
      throw new Error(messages.join(" "));
    }
    if (data?.message) {
      throw new Error(data.message);
    }
    if (error.message) {
      throw new Error(error.message);
    }
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error("Something went wrong");
}
