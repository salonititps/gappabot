import React from 'react';
import { FlatList, FlatListProps } from 'react-native';

import styles from './styles';

// Generic List Component
// Extends FlatListProps but ensures consistent styling and optimization
interface ListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  // Enforcing renderItem to be passed down
  renderItem: FlatListProps<T>['renderItem'];
}

const List = <T,>({
  data,
  renderItem,
  keyExtractor,
  contentContainerStyle,
  ...props
}: ListProps<T>) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      initialNumToRender={5}
      windowSize={10}
      removeClippedSubviews={true}
      {...props}
    />
  );
};

export default List;
