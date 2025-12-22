import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

import AccordionItem from '../../cards/AccordionItem';
import ImageCard from '../../cards/ImageCard';
import { ScreenData } from '../../../utils/constants';
import styles from './styles';
import useUniversalTemplate from './useUniversalTemplate';

interface UniversalTemplateProps {
  screenData: ScreenData;
}

const UniversalTemplate = ({ screenData }: UniversalTemplateProps) => {
  const {
    handleLinkPress,
    handleItemPress,
    cards,
    accordions,
    type,
    data,
    nestedScreens,
  } = useUniversalTemplate({ screenData });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}>
      {data?.info && <Text style={styles.infoText}>{data?.info}</Text>}

      {type === 'layout_details' && (
        <View>
          <Image
            source={{ uri: data?.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{data?.name}</Text>
            {data?.details && (
              <Text style={styles.description}>{data?.details}</Text>
            )}
          </View>
        </View>
      )}

      {!!cards?.length && (
        <View>
          {cards?.map?.((item: any, index: number) => (
            <ImageCard
              key={`${item.id}-${index}`}
              name={item.name}
              imageUrl={item.imageUrl}
              onPress={() => handleItemPress(item)}
            />
          ))}
        </View>
      )}

      {!!accordions?.length && (
        <View>
          {accordions?.map?.((item: any, index: number) => (
            <AccordionItem
              key={`${item.id}-${index}`}
              title={item.title}
              content={item.content}
            />
          ))}
        </View>
      )}

      {!!nestedScreens?.length && (
        <View>
          <Text style={styles.sectionTitle}>More Information</Text>
          {nestedScreens.map((screenId: string) => (
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
