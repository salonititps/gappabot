import { useScreens } from '../store/app';

const DATA_MAP: Record<string, any> = {
  about: null,
  blogs: null,
  faqs: null,
  news: null,
};

export const fetchScreenData = async (screenId: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const config = useScreens.getState().data?.[screenId];
  const data = DATA_MAP[screenId];

  if (config && data) {
    return { ...config, data };
  }

  // If we have config but no specific data map (maybe static screen or just error), return config
  if (config) {
    return { ...config };
  }

  return null;
};
