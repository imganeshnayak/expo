import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Save,
  Building,
  Users,
  DollarSign,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface BusinessProfile {
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  instagram: string;
  facebook: string;
  twitter: string;
  acceptsReservations: boolean;
  acceptsWalkIns: boolean;
  parkingAvailable: boolean;
}

export default function BusinessProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({
    name: "Mario's Pizza Palace",
    category: 'Food',
    description: 'Authentic Italian pizzas made with fresh ingredients. Family-owned since 1995.',
    address: '123 Main Street, Downtown, Bangalore 560001',
    phone: '+91 98765 43210',
    email: 'info@mariospizza.com',
    website: 'www.mariospizza.com',
    hours: 'Mon-Sun: 11:00 AM - 11:00 PM',
    instagram: '@mariospizza',
    facebook: 'mariospizza',
    twitter: '@mariospizza',
    acceptsReservations: true,
    acceptsWalkIns: true,
    parkingAvailable: true,
  });

  const categories = ['Food', 'Cafe', 'Wellness', 'Shopping', 'Fitness', 'Entertainment'];

  const handleSave = () => {
    Alert.alert(
      'Profile Updated',
      'Your business profile has been updated successfully.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const renderViewMode = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Cover Image */}
      <View style={styles.coverImageContainer}>
        <View style={styles.coverPlaceholder}>
          <Camera size={32} color={theme.colors.textTertiary} />
          <Text style={styles.coverPlaceholderText}>Add cover photo</Text>
        </View>
      </View>

      {/* Profile Picture */}
      <View style={styles.profilePictureContainer}>
        <View style={styles.profilePicture}>
          <Building size={32} color={theme.colors.primary} />
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Camera size={16} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Business Info */}
      <View style={styles.infoSection}>
        <Text style={styles.businessName}>{profile.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{profile.category}</Text>
        </View>
        <Text style={styles.description}>{profile.description}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Users size={20} color={theme.colors.primary} />
          <Text style={styles.statValue}>2.4K</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </View>
        <View style={styles.statBox}>
          <DollarSign size={20} color={theme.colors.primary} />
          <Text style={styles.statValue}>₹45K</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statBox}>
          <Clock size={20} color={theme.colors.primary} />
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Contact Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <MapPin size={18} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{profile.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Phone size={18} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{profile.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Mail size={18} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{profile.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Globe size={18} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{profile.website}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={18} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{profile.hours}</Text>
          </View>
        </View>
      </View>

      {/* Social Media */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Media</Text>
        <View style={styles.socialLinks}>
          <TouchableOpacity style={styles.socialButton}>
            <Instagram size={20} color="#E4405F" />
            <Text style={styles.socialText}>{profile.instagram}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Facebook size={20} color="#1877F2" />
            <Text style={styles.socialText}>{profile.facebook}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Twitter size={20} color="#1DA1F2" />
            <Text style={styles.socialText}>{profile.twitter}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amenities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesList}>
          <View style={styles.amenityItem}>
            <View style={styles.amenityIcon}>
              <Text style={{ fontSize: 20 }}>🍽️</Text>
            </View>
            <Text style={styles.amenityText}>Accepts Reservations</Text>
          </View>
          <View style={styles.amenityItem}>
            <View style={styles.amenityIcon}>
              <Text style={{ fontSize: 20 }}>🚶</Text>
            </View>
            <Text style={styles.amenityText}>Walk-ins Welcome</Text>
          </View>
          <View style={styles.amenityItem}>
            <View style={styles.amenityIcon}>
              <Text style={{ fontSize: 20 }}>🚗</Text>
            </View>
            <Text style={styles.amenityText}>Parking Available</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderEditMode = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.editContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  profile.category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setProfile({ ...profile, category: cat })}>
                <Text
                  style={[
                    styles.categoryChipText,
                    profile.category === cat && styles.categoryChipTextActive,
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.description}
            onChangeText={(text) => setProfile({ ...profile, description: text })}
            multiline
            numberOfLines={4}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={profile.address}
            onChangeText={(text) => setProfile({ ...profile, address: text })}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            keyboardType="phone-pad"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            keyboardType="email-address"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={profile.website}
            onChangeText={(text) => setProfile({ ...profile, website: text })}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Hours</Text>
          <TextInput
            style={styles.input}
            value={profile.hours}
            onChangeText={(text) => setProfile({ ...profile, hours: text })}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <Text style={styles.sectionTitle}>Social Media</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instagram</Text>
          <TextInput
            style={styles.input}
            value={profile.instagram}
            onChangeText={(text) => setProfile({ ...profile, instagram: text })}
            placeholder="@username"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Facebook</Text>
          <TextInput
            style={styles.input}
            value={profile.facebook}
            onChangeText={(text) => setProfile({ ...profile, facebook: text })}
            placeholder="username"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Twitter</Text>
          <TextInput
            style={styles.input}
            value={profile.twitter}
            onChangeText={(text) => setProfile({ ...profile, twitter: text })}
            placeholder="@username"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <Text style={styles.sectionTitle}>Amenities</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Accepts Reservations</Text>
          <Switch
            value={profile.acceptsReservations}
            onValueChange={(value) => setProfile({ ...profile, acceptsReservations: value })}
            trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Walk-ins Welcome</Text>
          <Switch
            value={profile.acceptsWalkIns}
            onValueChange={(value) => setProfile({ ...profile, acceptsWalkIns: value })}
            trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Parking Available</Text>
          <Switch
            value={profile.parkingAvailable}
            onValueChange={(value) => setProfile({ ...profile, parkingAvailable: value })}
            trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Profile</Text>
        <TouchableOpacity
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          style={styles.actionButton}>
          {isEditing ? (
            <>
              <Save size={18} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Save</Text>
            </>
          ) : (
            <Text style={styles.actionButtonText}>Edit</Text>
          )}
        </TouchableOpacity>
      </View>

      {isEditing ? renderEditMode() : renderViewMode()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  coverImageContainer: {
    height: 160,
    backgroundColor: theme.colors.surface,
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  coverPlaceholderText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 16,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    borderWidth: 4,
    borderColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    right: '35%',
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  detailsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  socialLinks: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  socialText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  amenitiesList: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  amenityIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  editContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    maxHeight: 40,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  categoryChipTextActive: {
    color: theme.colors.background,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
});
