type ApiResponse = { status: number; data: unknown };

type AwaitedResponse<TRequest extends () => Promise<ApiResponse>> = Awaited<
  ReturnType<TRequest>
>;
type StatusOf<TResponse extends ApiResponse> = TResponse["status"];
type DataOfStatus<
  TResponse extends ApiResponse,
  TStatus extends StatusOf<TResponse>,
> =
  Extract<TResponse, { status: TStatus }> extends { data: infer TData }
    ? TData
    : never;

export const validateStatus = <
  TResponse extends ApiResponse,
  TStatus extends StatusOf<TResponse>,
>(
  response: TResponse,
  expectedStatus: TStatus,
  resourceName: string,
): DataOfStatus<TResponse, TStatus> => {
  if (response.status !== expectedStatus) {
    throw new Error(`Failed to load ${resourceName} (${response.status})`);
  }

  return response.data as DataOfStatus<TResponse, TStatus>;
};

export const withStatus = async <
  TRequest extends () => Promise<ApiResponse>,
  TStatus extends StatusOf<AwaitedResponse<TRequest>>,
>(
  request: TRequest,
  expectedStatus: TStatus,
  resourceName: string,
): Promise<DataOfStatus<AwaitedResponse<TRequest>, TStatus>> =>
  validateStatus(await request(), expectedStatus, resourceName);
