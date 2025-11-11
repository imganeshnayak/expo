import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { 
  Home, 
  Search, 
  SquareStack,
  User,
  LucideIcon
} from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface TabIconProps {
  icon: LucideIcon;
  focused: boolean;
  size: number;
  color: string;
}

// Simple animated icon with scale effect
const AnimatedTabIcon = ({ icon: Icon, focused, size, color }: TabIconProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      tension: 200,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Icon 
        size={size} 
        color={color} 
        fill={focused ? color : 'transparent'} 
      />
    </Animated.View>
  );
};

// Simple active dot indicator
const ActiveDot = ({ focused }: { focused: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1 : 0,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={[
        styles.activeDot,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    />
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceLight,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={styles.iconContainer}>
              <AnimatedTabIcon 
                icon={Home}
                focused={focused}
                size={size}
                color={color}
              />
              <ActiveDot focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={styles.iconContainer}>
              <AnimatedTabIcon 
                icon={SquareStack}
                focused={focused}
                size={size}
                color={color}
              />
              <ActiveDot focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={styles.iconContainer}>
              <AnimatedTabIcon 
                icon={Search}
                focused={focused}
                size={size}
                color={color}
              />
              <ActiveDot focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={styles.iconContainer}>
              <AnimatedTabIcon 
                icon={User}
                focused={focused}
                size={size}
                color={color}
              />
              <ActiveDot focused={focused} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});