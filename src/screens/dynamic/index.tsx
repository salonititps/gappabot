import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import DynamicRenderer from '../../components/common/DynamicRenderer';
import { SCREEN_CONFIG, SCREEN_CONTENT } from '../../utils/constants';

// Param List Definition needed for Types
type RootStackParamList = {
  Dynamic: {
    screenId: string;
    type?: string;
    title?: string;
    data?: any;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Dynamic'>;

const DynamicScreen = ({ route, navigation }: Props) => {
  const { screenId, type, title, data } = route.params;

  // Retrieve data from Config and Content maps
  const config = SCREEN_CONFIG[screenId];
  const content = SCREEN_CONTENT[screenId];
  const registryData = config && content ? { ...config, ...content } : null;

  const screenData: any = registryData || {
    id: screenId,
    type,
    title,
    data,
  };

  const handleBack = () => {
    navigation.goBack();
  };

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
