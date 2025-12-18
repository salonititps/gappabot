import React from 'react';
import { View, Text } from 'react-native';

import { ScreenData } from '../../../utils/constants';
import UniversalTemplate from '../../template/UniversalTemplate';

interface DynamicRendererProps {
  screenData: ScreenData;
}

const DynamicRenderer = ({ screenData }: DynamicRendererProps) => {
  return <UniversalTemplate screenData={screenData} />;
};

export default DynamicRenderer;
