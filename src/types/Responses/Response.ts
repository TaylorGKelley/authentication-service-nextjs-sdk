export type Response<T> = DataResponse<T> | ErrorResponse;

export type DataResponse<T> = {
  success: true;
  data: T;
};

export type ErrorResponse<E = string> = {
  success: false;
  error: E;
};
