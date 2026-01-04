
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text, Dimensions, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import {
  Home,
  LayoutGrid, // For Categories
  Trophy, // For Missions (~Gamification)
  Target, // For Missions
  Users, // For Social
  User, // For Profile
  QrCode,
  Gamepad2, // For Game
} from 'lucide-react-native';
import { useAppTheme } from '@/store/themeStore';
import * as Haptics from 'expo-haptics';


const { width } = Dimensions.get('window');

// ------------------------------------------------------------------
// CUSTOM TAB BUTTON
// ------------------------------------------------------------------
const TabButton = ({
  label,
  icon: Icon,
  focused,
  onPress,
  color,
  isCenter = false
}: any) => {
  const animatedValue = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const scaleValue = useRef(new Animated.Value(isCenter ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }),
      Animated.spring(scaleValue, {
        toValue: focused ? (isCenter ? 1.1 : 1.2) : (isCenter ? 1 : 1), // Gentle scale
        useNativeDriver: true,
      })
    ]).start();
  }, [focused]);

  // Center Button Styles (Floating Home)
  if (isCenter) {
    return (
      <View style={styles.centerBtnWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
          }}
          style={[styles.centerBtn, { backgroundColor: focused ? color : '#333' }]}
        >
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Icon size={28} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }

  // Standard Button Styles
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={styles.tabBtn}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }], marginBottom: 4 }}>
        <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      </Animated.View>
      {focused && (
        <Animated.View style={{ opacity: animatedValue }}>
          <View style={[styles.activeDot, { backgroundColor: color }]} />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

// ------------------------------------------------------------------
// ROOT LAYOUT
// ------------------------------------------------------------------
export default function TabLayout() {
  const theme = useAppTheme();

  // Custom Tab Bar Container
  // We use this to render the custom shape or background if needed.
  // For "Smart Animated Footer", we'll just use the standard tab bar styling with our custom buttons.

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // We handle labels/dots manually
        tabBarStyle: {
          position: 'absolute',
          bottom: 10, // Moved down from 20 to reduce overlap
          left: 16,
          right: 16,
          height: 65, // Slightly reduced from 70
          backgroundColor: theme.colors.surface, // Floating pill look
          borderRadius: 32,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          paddingBottom: 0, // Reset default
        },
      }}
    >
      {/* 1. HOME (Left) */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              label="Home"
              icon={Home}
              color={props.accessibilityState?.selected ? theme.colors.primary : theme.colors.textSecondary}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />

      {/* 2. MISSIONS (Left-Center) */}
      <Tabs.Screen
        name="missions"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              label="Missions"
              icon={Target}
              color={props.accessibilityState?.selected ? '#FFD700' : theme.colors.textSecondary}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />

      {/* 3. GAME (Center - Floating) - PRIMARY EXPERIENCE */}
      <Tabs.Screen
        name="game"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              label="Hunt"
              icon={Gamepad2}
              isCenter={true}
              color={'#00D9A3'}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />

      {/* 4. SOCIAL (Right-Center) */}
      <Tabs.Screen
        name="social"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              label="Social"
              icon={Users}
              color={props.accessibilityState?.selected ? '#FF6B6B' : theme.colors.textSecondary}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />

      {/* 5. PROFILE (Right) */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              label="Profile"
              icon={User}
              color={props.accessibilityState?.selected ? theme.colors.text : theme.colors.textSecondary}
              focused={props.accessibilityState?.selected}
            />
          ),
        }}
      />

      {/* HIDDEN TABS */}
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtnWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40, // Floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#F2F2F2', // Match background color to simulate "cutout" if possible, or just white border
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});