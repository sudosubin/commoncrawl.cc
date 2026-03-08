function resolveApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is required");
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function orvalFetch<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(resolveApiUrl(path), options);
  const data = await parseResponseBody(response);

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
}
