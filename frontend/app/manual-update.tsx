import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  useExternalLoyaltyStore,
  ExternalLoyaltyProgram,
  ManualUpdate,
} from '../store/externalLoyaltyStore';
import { theme } from '../constants/theme';

const primaryColor = theme.colors.primary;

export default function LoyaltyEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const programId = params.programId as string;

  const { programs, addManualUpdate, getManualUpdateHistory, deleteManualUpdate } =
    useExternalLoyaltyStore();

  const program = programs.find(p => p.id === programId);

  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [progressChange, setProgressChange] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(undefined);

  if (!program) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF5722" />
        <Text style={styles.errorText}>Program not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const updateHistory = getManualUpdateHistory(programId);
  const progress = (program.currentProgress / program.requiredForReward) * 100;
  const isReady = program.currentProgress >= program.requiredForReward;

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to attach receipt photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your camera to take receipt photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptPhoto(result.assets[0].uri);
    }
  };

  const handleAddUpdate = () => {
    const change = parseInt(progressChange);
    if (!change || change === 0) {
      Alert.alert('Invalid Input', 'Please enter a valid progress change');
      return;
    }

    addManualUpdate(programId, {
      date: Date.now(),
      progressChange: change,
      notes: updateNotes || undefined,
      receiptPhoto,
    });

    setShowAddUpdate(false);
    setProgressChange('');
    setUpdateNotes('');
    setReceiptPhoto(undefined);

    Alert.alert('Success', 'Progress updated successfully!');
  };

  const handleDeleteUpdate = (updateId: string) => {
    Alert.alert(
      'Delete Update',
      'Are you sure you want to delete this update? This will reverse the progress change.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteManualUpdate(programId, updateId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{program.merchantName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Program Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.merchantLogo}>{program.merchantLogo || '🏪'}</Text>
            <View style={styles.summaryInfo}>
              <Text style={styles.merchantName}>{program.merchantName}</Text>
              <Text style={styles.programCategory}>{program.category}</Text>
            </View>
            {isReady && (
              <View style={styles.readyBadge}>
                <Ionicons name="gift" size={20} color="#fff" />
              </View>
            )}
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {program.currentProgress} / {program.requiredForReward}{' '}
                {program.programType === 'stamps'
                  ? 'stamps'
                  : program.programType === 'points'
                  ? 'points'
                  : 'visits'}
              </Text>
              <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 100)}%` },
                  isReady && styles.progressFillReady,
                ]}
              />
            </View>
          </View>

          {/* Reward */}
          <View style={styles.rewardSection}>
            <Ionicons name="gift-outline" size={20} color={primaryColor} />
            <Text style={styles.rewardText}>{program.reward}</Text>
          </View>
        </View>

        {/* Add Update Button */}
        {!showAddUpdate && (
          <TouchableOpacity
            style={styles.addUpdateButton}
            onPress={() => setShowAddUpdate(true)}
          >
            <Ionicons name="add-circle" size={24} color={primaryColor} />
            <Text style={styles.addUpdateText}>Add Manual Update</Text>
          </TouchableOpacity>
        )}

        {/* Add Update Form */}
        {showAddUpdate && (
          <View style={styles.updateForm}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add Progress Update</Text>
              <TouchableOpacity onPress={() => setShowAddUpdate(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Progress Change{' '}
                {program.programType === 'stamps'
                  ? '(stamps)'
                  : program.programType === 'points'
                  ? '(points)'
                  : '(visits)'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., +1 or -1"
                value={progressChange}
                onChangeText={setProgressChange}
                keyboardType="numeric"
              />
              <Text style={styles.hint}>
                Use + to add progress, - to subtract (e.g., +2, -1)
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any notes about this update..."
                value={updateNotes}
                onChangeText={setUpdateNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Receipt Photo (Optional)</Text>
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={24} color={primaryColor} />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                  <Ionicons name="image" size={24} color={primaryColor} />
                  <Text style={styles.photoButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
              {receiptPhoto && (
                <View style={styles.photoPreview}>
                  <Image source={{ uri: receiptPhoto }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => setReceiptPhoto(undefined)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF5722" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddUpdate}
            >
              <Text style={styles.submitButtonText}>Add Update</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Update History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Update History</Text>
          {updateHistory.length > 0 ? (
            updateHistory
              .sort((a, b) => b.date - a.date)
              .map(update => (
                <View key={update.id} style={styles.updateCard}>
                  <View style={styles.updateHeader}>
                    <View
                      style={[
                        styles.changeBadge,
                        update.progressChange > 0
                          ? styles.changeBadgePositive
                          : styles.changeBadgeNegative,
                      ]}
                    >
                      <Text style={styles.changeText}>
                        {update.progressChange > 0 ? '+' : ''}
                        {update.progressChange}
                      </Text>
                    </View>
                    <View style={styles.updateInfo}>
                      <Text style={styles.updateDate}>
                        {new Date(update.date).toLocaleDateString()} at{' '}
                        {new Date(update.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {update.location && (
                        <Text style={styles.updateLocation}>
                          📍 {update.location}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteUpdate(update.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF5722" />
                    </TouchableOpacity>
                  </View>
                  {update.notes && (
                    <Text style={styles.updateNotes}>{update.notes}</Text>
                  )}
                  {update.receiptPhoto && (
                    <Image
                      source={{ uri: update.receiptPhoto }}
                      style={styles.receiptImage}
                    />
                  )}
                </View>
              ))
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No updates yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first manual update above
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: primaryColor,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  merchantLogo: {
    fontSize: 48,
    marginRight: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  programCategory: {
    fontSize: 14,
    color: '#888',
  },
  readyBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryColor,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: primaryColor,
    borderRadius: 6,
  },
  progressFillReady: {
    backgroundColor: '#4CAF50',
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rewardText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  addUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: primaryColor,
    borderStyle: 'dashed',
  },
  addUpdateText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: primaryColor,
  },
  updateForm: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 12,
    padding: 12,
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: primaryColor,
  },
  photoPreview: {
    marginTop: 12,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: primaryColor,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  historySection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  updateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  changeBadgePositive: {
    backgroundColor: '#4CAF50',
  },
  changeBadgeNegative: {
    backgroundColor: '#FF5722',
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  updateInfo: {
    flex: 1,
  },
  updateDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  updateLocation: {
    fontSize: 12,
    color: '#888',
  },
  updateNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  receiptImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: 'cover',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
  },
  bottomPadding: {
    height: 40,
  },
});
