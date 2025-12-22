import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenData } from '../../../utils/constants';

type RootStackParamList = {
  Dynamic: {
    screenId: string;
    type?: string;
    title?: string;
    data?: any;
  };
};

interface UseUniversalTemplateProps {
  screenData: ScreenData;
}

const useUniversalTemplate = ({ screenData }: UseUniversalTemplateProps) => {
  const { type, data } = screenData;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLinkPress = (screenId: string) =>
    navigation.push('Dynamic', { screenId });

  const handleItemPress = (item: any) => {
    navigation.push('Dynamic', {
      screenId: `details-${item.id}`,
      type: 'layout_details',
      title: item.name,
      data: item,
    });
  };

  const cards = useMemo(() => {
    if (type === 'layout_accordion' || !data?.items) return [];
    return Array.isArray(data?.items) ? data?.items : [data?.items];
  }, [data?.items, type]);

  const accordions = useMemo(() => {
    return data?.accordionItems || [];
  }, [data?.accordionItems]);

  return {
    handleLinkPress,
    handleItemPress,
    cards,
    accordions,
    type,
    data,
    nestedScreens: screenData.nestedScreens,
  };
};

export default useUniversalTemplate;
