import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import styles from './styles';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItemProps {
  title: string;
  content: string;
}

const AccordionItem = ({ title, content }: AccordionItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.icon}>{expanded ? '-' : '+'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{content}</Text>
        </View>
      )}
    </View>
  );
};

export default AccordionItem;
