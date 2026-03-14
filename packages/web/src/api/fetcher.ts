const resolveApiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) throw new Error("VITE_API_BASE_URL is required");

  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

const parseResponseBody = async (response: Response) => {
  if (response.status === 204 || response.status === 205) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
};

export const orvalFetch = async <T>(
  path: string,
  options: RequestInit,
): Promise<T> => {
  const response = await fetch(resolveApiUrl(path), options);
  const data = await parseResponseBody(response);

  return { data, status: response.status, headers: response.headers } as T;
};
