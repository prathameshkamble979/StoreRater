import { useState, useCallback } from 'react';
import type { AxiosError, AxiosResponse } from 'axios';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useApi<T, P = any>(apiFunc: (params: P) => Promise<AxiosResponse<T>>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (params: P) => {
      setState(s => ({ ...s, isLoading: true, error: null }));
      try {
        const response = await apiFunc(params);
        setState({ data: response.data, isLoading: false, error: null });
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<{ error: string }>;
        const errorMessage = axiosError.response?.data?.error || axiosError.message || 'An error occurred';
        setState(s => ({ ...s, isLoading: false, error: errorMessage }));
        throw error;
      }
    },
    [apiFunc]
  );

  return { ...state, execute };
}
