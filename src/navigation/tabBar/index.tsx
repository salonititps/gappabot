import React, { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Cog6ToothIcon, HomeModernIcon } from 'react-native-heroicons/outline';
import { colors } from '../../utils/colors';
import { styles } from './styles';

const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Icon selection based on route
        const renderIcon = () => {
          const iconColor = isFocused ? colors.primary : colors.gray400;
          const iconSize = 24;

          if (index === 0) {
            return <HomeModernIcon size={iconSize} color={iconColor} />;
          } else if (index === 1) {
            return <Cog6ToothIcon size={iconSize} color={iconColor} />;
          }
          return null;
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.wrapper}
          >
            {renderIcon()}
            <Text
              style={[
                styles.label,
                { color: isFocused ? colors.primary : colors.gray400 },
              ]}
            >
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default memo(TabBar);
