interface ErrorWrapperWithError {
  isError: true;
  payload: any;
}

interface ErrorWrapperWithoutError<T> {
  isError: false;
  payload: T;
}

export type ErrorWrapper<T> =
  | ErrorWrapperWithError
  | ErrorWrapperWithoutError<T>;
