export enum ResponseStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface IMessage {
  code: string;
  message: string;
}

export interface IResponseMeta {
  [key: string]: any;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface IApiResponse<T = unknown> {
  payload: {
    data: T | null;
    meta?: IResponseMeta;
  };
  status: ResponseStatus;
  message: IMessage;
  errors?: Record<string, unknown>;
}
