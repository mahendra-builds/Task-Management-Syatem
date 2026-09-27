import axios from 'axios';
import { ApiError } from '../services/api';

export const getApiErrorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    if (data?.message) return data.message;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};
