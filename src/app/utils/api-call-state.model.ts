interface ApiCallLoading<TResult> {
  status: 'loading';
  result: TResult;
  total: number;
}

interface ApiCallLoaded<TResult> {
  status: 'loaded';
  result: TResult;
  total: number;
}

interface ApiCallError<TError> {
  status: 'error';
  error: TError;
}

export type ApiCallState<TResult, TError = string> =
  | ApiCallLoading<TResult>
  | ApiCallLoaded<TResult>
  | ApiCallError<TError>;
