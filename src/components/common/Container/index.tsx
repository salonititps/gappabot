import React, { ReactNode } from 'react';
import { View } from 'react-native';

import styles from './styles';

interface ContainerProps {
  children: ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return <View style={styles.container}>{children}</View>;
};

export default Container;
