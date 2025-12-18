import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ImageCard from '../../cards/ImageCard';
import styles from './styles';

// Needs to match the AppNavigator params
type RootStackParamList = {
  Dynamic: {
    screenId: string;
    type?: string;
    title?: string;
    data?: any;
  };
};

interface AboutTemplateProps {
  data: {
    info: string;
    heroImage: {
      id: string;
      name: string;
      imageUrl: string;
      details?: string;
    };
  };
  nestedScreens?: string[]; // Array of screen IDs like ['blogs', 'faqs']
}

const AboutTemplate = ({ data, nestedScreens }: AboutTemplateProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLinkPress = (screenId: string) => {
    navigation.push('Dynamic', { screenId });
  };

  const handleHeroPress = () => {
    if (data.heroImage) {
      navigation.push('Dynamic', {
        screenId: `details-hero-${data.heroImage.id}`,
        type: 'layout_details',
        title: data.heroImage.name,
        data: data.heroImage,
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.infoText}>{data.info}</Text>

      {/* Hero Image Section */}
      {data.heroImage && (
        <View>
          <Text style={styles.sectionTitle}>Featured</Text>
          <ImageCard
            name={data.heroImage.name}
            imageUrl={data.heroImage.imageUrl}
            onPress={handleHeroPress}
          />
        </View>
      )}

      {/* Nested Menu Section */}
      {nestedScreens && nestedScreens.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>More Information</Text>
          {nestedScreens.map(screenId => (
            <TouchableOpacity
              key={screenId}
              style={styles.menuButton}
              onPress={() => handleLinkPress(screenId)}>
              <Text style={styles.menuButtonText}>
                Go to {screenId.charAt(0).toUpperCase() + screenId.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default AboutTemplate;
