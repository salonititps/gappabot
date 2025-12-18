import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AccordionItem from '../../cards/AccordionItem';
import ImageCard from '../../cards/ImageCard';
import { ScreenData } from '../../../utils/constants';
import styles from './styles';

interface UniversalTemplateProps {
  screenData: ScreenData;
}

type RootStackParamList = {
  Dynamic: {
    screenId: string;
    type?: string;
    title?: string;
    data?: any;
  };
};

const UniversalTemplate = ({ screenData }: UniversalTemplateProps) => {
  const { type, data, nestedScreens } = screenData;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLinkPress = (screenId: string) => {
    navigation.push('Dynamic', { screenId });
  };

  const handleItemPress = (item: any) => {
    navigation.push('Dynamic', {
      screenId: `details-${item.id}`,
      type: 'layout_details',
      title: item.name,
      data: item,
    });
  };

  // Helper to render Accordion Lists
  const rAccordionList = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return items.map((item: any) => (
      <AccordionItem key={item.id} title={item.title} content={item.content} />
    ));
  };

  // Helper to render Image Card Lists
  const rCardList = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return items.map((item: any) => (
      <ImageCard
        key={item.id}
        name={item.name}
        imageUrl={item.imageUrl}
        onPress={() => handleItemPress(item)}
      />
    ));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 1. INFO TEXT (About) */}
      {data.info && <Text style={styles.infoText}>{data.info}</Text>}

      {/* 2. DETAILS HEADER (Details Layout) */}
      {type === 'layout_details' && (
        <View>
          <Image
            source={{ uri: data.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{data.name}</Text>
            {data.details && (
              <Text style={styles.description}>{data.details}</Text>
            )}
          </View>
        </View>
      )}

      {/* 3. HERO IMAGE (About) */}
      {data.heroImage && (
        <View>
          <Text style={styles.sectionTitle}>Featured</Text>
          <ImageCard
            name={data.heroImage.name}
            imageUrl={data.heroImage.imageUrl}
            onPress={() => handleItemPress(data.heroImage)}
          />
        </View>
      )}

      {/* 4. ACCORDION SECTIONS */}
      {/* Explicit accordion items (News) */}
      {data.accordionItems && data.accordionItems.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {rAccordionList(data.accordionItems)}
        </View>
      )}
      {/* Implicit accordion items (FAQs) - detected by type or structure */}
      {type === 'layout_accordion' && data.items && (
        <View>{rAccordionList(data.items)}</View>
      )}

      {/* 5. CARD LIST SECTIONS */}
      {/* Explicit feed items (News) */}
      {data.feedItems && data.feedItems.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Featured Stories</Text>
          {rCardList(data.feedItems)}
        </View>
      )}
      {/* Implicit feed items (Blogs) */}
      {type === 'layout_feed' && data.items && (
        <View>{rCardList(data.items)}</View>
      )}
      {/* Related items (Details) */}
      {data.relatedItems && data.relatedItems.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Related Items</Text>
          {rCardList(data.relatedItems)}
        </View>
      )}

      {/* 6. NESTED SCREENS (About) */}
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

export default UniversalTemplate;
