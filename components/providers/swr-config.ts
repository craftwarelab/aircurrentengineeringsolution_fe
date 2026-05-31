import axios from 'axios';

export const swrConfig = {
  fetcher: (url: string) => axios.get(url).then(res => {
    const data = res.data;
    // Handle different API response structures
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data; // Handle { data: [...] } structure
    }
    if (data && typeof data === 'object' && 'success' in data && data.success && 'data' in data) {
      return data.data; // Handle { success: true, data: [...] } structure
    }
    return data; // Return as-is for other structures
  }),
};