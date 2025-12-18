import React, { useCallback } from 'react';
import { View, Text, Image, ScrollView, ListRenderItem } from 'react-native';

import List from '../../common/List';
import ImageCard from '../../cards/ImageCard';
import styles from './styles';

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  details?: string;
  relatedItems?: Item[];
}

interface DetailsTemplateProps {
  data: Item;
  onItemPress: (item: Item) => void;
}

const DetailsTemplate = ({ data, onItemPress }: DetailsTemplateProps) => {
  const renderItem: ListRenderItem<Item> = useCallback(
    ({ item }) => {
      return (
        <ImageCard
          name={item.name}
          imageUrl={item.imageUrl}
          onPress={() => onItemPress(item)}
        />
      );
    },
    [onItemPress],
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  // Use List for the whole page if related items exist to avoid nested ScrollViews?
  // User asked for "Main container : image, name, detail".
  // Simplest approach: ScrollView for top details, then List for related items.
  // BUT recursive list inside ScrollView is bad.
  // BETTER: Use List with ListHeaderComponent for the details.

  const renderHeader = () => (
    <View>
      <Image
        source={{ uri: data.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{data.name}</Text>
        {data.details ? (
          <Text style={styles.description}>{data.details}</Text>
        ) : null}

        {data.relatedItems && data.relatedItems.length > 0 && (
          <Text style={styles.sectionTitle}>Related Items</Text>
        )}
      </View>
    </View>
  );

  return (
    <List
      data={data.relatedItems || []}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderHeader}
    />
  );
};

export default DetailsTemplate;
