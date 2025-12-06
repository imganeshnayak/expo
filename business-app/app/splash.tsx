import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";
import { theme } from "@/constants/theme";

export default function SplashScreen() {
  // Animation Values
  const scaleU = useRef(new Animated.Value(0)).current;
  const shockwave = useRef(new Animated.Value(0)).current;
  const slideText = useRef(new Animated.Value(0)).current;
  const opacityText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Step 1: Dramatic Zoom in of "U"
      Animated.timing(scaleU, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),

      // Step 2: Parallel Shockwave & Reveal
      Animated.parallel([
        Animated.timing(shockwave, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideText, {
          toValue: 1,
          duration: 900,
          // FIXED: Replaced 'quartic' with poly(4) for the same effect
          easing: Easing.out(Easing.poly(4)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityText, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* Background Shockwave */}
      <Animated.View
        style={[
          styles.shockwave,
          {
            transform: [
              { scale: shockwave.interpolate({ inputRange: [0, 1], outputRange: [0.5, 4] }) }
            ],
            opacity: shockwave.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.1, 0] }),
          },
        ]}
      />

      <View style={styles.logoContainer}>
        {/* The Icon "U" */}
        <Animated.Text
          style={[
            styles.proText,
            styles.uChar,
            {
              transform: [
                { scale: scaleU },
                { scale: shockwave.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }
              ],
            },
          ]}
        >
          U
        </Animated.Text>

        {/* The Identity "topia" */}
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: opacityText,
              transform: [
                {
                  translateX: slideText.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.proText, styles.restOfWord]}>topia</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
  },
  shockwave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
    zIndex: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    zIndex: 1,
    // Optical alignment to center the whole word better
    marginLeft: 10,
  },
  // "Pro" Font Base Style
  proText: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-condensed' }),
    fontSize: 84,
    // Using 900/800 weight for that Premium/Netflix blocky feel
    fontWeight: Platform.select({ ios: '900', android: 'bold' }),
    includeFontPadding: false,
  },
  uChar: {
    color: theme.colors.primary,
    zIndex: 10,
    // Negative letter spacing is key for the "Pro" look
    letterSpacing: -2,
  },
  textWrapper: {
    zIndex: 0,
  },
  restOfWord: {
    color: theme.colors.text,
    letterSpacing: -3,
    marginLeft: -1,
  },
});