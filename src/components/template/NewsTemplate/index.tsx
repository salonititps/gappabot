import React, { useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AccordionItem from '../../cards/AccordionItem';
import ImageCard from '../../cards/ImageCard';
import styles from './styles';

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  details?: string;
}

interface AccordionData {
  id: string;
  title: string;
  content: string;
}

interface NewsData {
  accordionItems: AccordionData[];
  feedItems: Item[];
}

interface NewsTemplateProps {
  data: NewsData;
}

type RootStackParamList = {
  Dynamic: {
    screenId: string;
    type?: string;
    title?: string;
    data?: any;
  };
};

const NewsTemplate = ({ data }: NewsTemplateProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleFeedItemPress = (item: Item) => {
    navigation.push('Dynamic', {
      screenId: `details-news-${item.id}`,
      type: 'layout_details',
      title: item.name,
      data: item,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}>
      {data.accordionItems && data.accordionItems.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {data.accordionItems.map(item => (
            <AccordionItem
              key={item.id}
              title={item.title}
              content={item.content}
            />
          ))}
        </View>
      )}

      {data.feedItems && data.feedItems.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Featured Stories</Text>
          {data.feedItems.map(item => (
            <ImageCard
              key={item.id}
              name={item.name}
              imageUrl={item.imageUrl}
              onPress={() => handleFeedItemPress(item)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default NewsTemplate;
