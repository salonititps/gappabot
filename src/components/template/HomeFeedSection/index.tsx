import React, { useCallback } from 'react';
import { View, ListRenderItem } from 'react-native';

import PageTitle from '../../common/PageTitle';
import List from '../../common/List';
import ImageCard from '../../cards/ImageCard';
import styles from './styles';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Item {
  id: string;
  name: string;
  imageUrl: string;
}

interface HomeFeedData {
  title: string;
  items: Item[];
}

interface HomeFeedSectionProps {
  data: HomeFeedData;
}

// Define specific type if needed, or use any/generic for now
type RootStackParamList = {
  Dynamic: {
    screenId: string;
    type?: string;
    title?: string;
    data?: any;
  };
};

const HomeFeedSection = ({ data }: HomeFeedSectionProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderItem: ListRenderItem<Item> = useCallback(
    ({ item }) => {
      return (
        <ImageCard
          name={item.name}
          imageUrl={item.imageUrl}
          onPress={() =>
            navigation.push('Dynamic', {
              screenId: `details-feed-${item.id}`,
              type: 'layout_details',
              title: item.name,
              data: item,
            })
          }
        />
      );
    },
    [navigation],
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  return (
    <View style={styles.container}>
      <PageTitle title={data.title} />
      <List
        data={data.items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
};

export default HomeFeedSection;
