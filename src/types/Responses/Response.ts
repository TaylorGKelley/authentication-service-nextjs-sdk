export type Response<T> = DataResponse<T> | ErrorResponse;

type DataResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse<E = string> = {
  success: false;
  error: E;
};
