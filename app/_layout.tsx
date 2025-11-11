
import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import SplashScreen from './splash';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <>
          <Slot />
        </>
      )}
    </>
  );
}
