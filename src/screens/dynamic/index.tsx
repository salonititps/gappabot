import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import DynamicRenderer from '../../components/common/DynamicRenderer';
import useDynamicScreen from './useDynamicScreen';

type RootStackParamList = {
  Dynamic: {
    screenId: string;
    type?: string;
    title?: string;
    data?: any;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Dynamic'>;

const DynamicScreen = (props: Props) => {
  const { screenData, loading, handleBack, title, screenId } =
    useDynamicScreen(props);

  if (loading) {
    return (
      <Container>
        <Header title={title || 'Loading...'} onBack={handleBack} />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </Container>
    );
  }

  if (!screenData || !screenData.type) {
    return (
      <Container>
        <Header title="Error" onBack={handleBack} />
        <View style={{ padding: 20 }}>
          <Text>Screen not found or invalid data: {screenId}</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <Header title={screenData.title || ''} onBack={handleBack} />
      <DynamicRenderer screenData={screenData} />
    </Container>
  );
};

export default DynamicScreen;
