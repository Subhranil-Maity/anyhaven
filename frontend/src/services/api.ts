import type { ApiError } from "@/types";

export class ApiFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiFetchError";
  }
}

export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiFetchError((data as ApiError).error || `API Error: ${response.status}`);
  }

  if (data && typeof data === 'object' && 'error' in data) {
    throw new ApiFetchError((data as ApiError).error);
  }

  return data as T;
}
