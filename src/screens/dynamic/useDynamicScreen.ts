import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchScreenData } from '../../api/screenApi';
import {
  useScreens,
  useAbout,
  useBlogs,
  useFaqs,
  useNews,
} from '../../store/app';

type RootStackParamList = {
  Dynamic: {
    screenId: string;
    type?: string;
    title?: string;
    data?: any;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Dynamic'>;

export const useDynamicScreen = ({ route, navigation }: Props) => {
  const { screenId, type, title, data: paramData } = route.params;

  const [screenData, setScreenData] = useState<any>(null);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  /** Stores */
  const screens = useScreens();
  const about = useAbout();
  const blogs = useBlogs();
  const faqs = useFaqs();
  const news = useNews();

  const screensConfig = screens.data;

  /** Fallback data */
  const fallbackData = useMemo(
    () => ({
      id: screenId,
      type,
      title,
      data: paramData,
    }),
    [screenId, type, title, paramData],
  );

  /** Resolve store + fetcher */
  const { store, fetcher, clear } = useMemo(() => {
    if (screenId === screensConfig?.about?.id)
      return { store: about, fetcher: about.getAbout, clear: about.clearAbout };

    if (screenId === screensConfig?.blogs?.id)
      return { store: blogs, fetcher: blogs.getBlogs, clear: blogs.clearBlogs };

    if (screenId === screensConfig?.faqs?.id)
      return { store: faqs, fetcher: faqs.getFaqs, clear: faqs.clearFaqs };

    if (screenId === screensConfig?.news?.id)
      return { store: news, fetcher: news.getNews, clear: news.clearNews };

    return { store: null, fetcher: null, clear: null };
  }, [screenId, screensConfig, about, blogs, faqs, news]);

  /** 2-second minimum delay */
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [screenId]);

  /** Derived loading state */
  const loading = useMemo(() => {
    // 1. Show loader for at least 1 second
    if (!minTimeElapsed) return true;

    // 2. After 1 second, if we have a fetcher, wait for the store to finish loading
    if (fetcher) {
      return store?.loading ?? true;
    }

    // 3. After 1 second, if no fetcher, check screenData to hide loader (Error UI if null)
    return !screenData;
  }, [minTimeElapsed, fetcher, store?.loading, store?.data, screenData]);

  /** Initial load */
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        // Always load screen config
        const config = await fetchScreenData(screenId);
        const baseData = config || fallbackData;

        if (!isMounted) return;

        // Set base structure first
        setScreenData(baseData);

        // Trigger API if available
        if (fetcher) {
          await fetcher(); // triggers store update
        }
      } catch (error) {
        console.error('Dynamic screen load error:', error);
        if (isMounted) {
          setScreenData(fallbackData);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [screenId, fetcher, fallbackData]);

  /** React to store updates (THIS is the real "wait") */
  useEffect(() => {
    if (store?.loading) return;
    if (!store?.data) return;

    setScreenData((prev: any) => ({
      ...(prev || fallbackData),
      data: store?.data,
    }));
  }, [store, fallbackData]);

  return {
    screenData,
    loading,
    screenId,
    title,
    handleBack: navigation.goBack,
  };
};

export default useDynamicScreen;
