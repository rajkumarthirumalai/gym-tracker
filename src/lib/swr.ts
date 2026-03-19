import { safeFetch } from "./fetch";

export const fetcher = (url: string) => safeFetch<any>(url);

export const swrConfig = {
  fetcher,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  dedupingInterval: 5000,
};
