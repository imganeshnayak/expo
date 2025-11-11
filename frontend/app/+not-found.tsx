import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { AlertCircle } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertCircle size={64} color={theme.colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.text}>This screen doesn't exist.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Go to home</Text>
          </View>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  text: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  link: {
    marginTop: 8,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.background,
  },
});
