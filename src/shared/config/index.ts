export const BASE_URL = import.meta.env.VITE_API_URL;

const LOCATION_IQ_API_URL = import.meta.env.VITE_LOCATION_IQ_API_URL;
const LOCATION_IQ_ACCESS_TOKEN = import.meta.env.VITE_LOCATION_IQ_ACCESS_TOKEN;

export const locationIqUrl = 
  (query: string) => 
    `${LOCATION_IQ_API_URL}?key=${LOCATION_IQ_ACCESS_TOKEN}&q=${encodeURIComponent(query)}&limit=5&dedupe=1&format=json&`;