import React, { useCallback } from 'react';
import { ListRenderItem } from 'react-native';

import List from '../../common/List';
import AccordionItem from '../../cards/AccordionItem';
import styles from './styles';

interface FAQItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionTemplateProps {
  data: {
    items: FAQItem[];
  };
}

const AccordionTemplate = ({ data }: AccordionTemplateProps) => {
  const renderItem: ListRenderItem<FAQItem> = useCallback(({ item }) => {
    return <AccordionItem title={item.title} content={item.content} />;
  }, []);

  const keyExtractor = useCallback((item: FAQItem) => item.id, []);

  return (
    <List
      data={data.items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.container}
    />
  );
};

export default AccordionTemplate;
