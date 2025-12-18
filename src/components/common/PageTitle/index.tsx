import React, { memo } from 'react';
import { Text } from 'react-native';

import styles from './styles';

interface PageTitleProps {
  title: string;
}

const PageTitle = memo(({ title }: PageTitleProps) => {
  return <Text style={styles.title}>{title}</Text>;
});

export default PageTitle;
