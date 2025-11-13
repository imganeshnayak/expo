import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Minus,
  Save,
  Trash2,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import {
  useExternalLoyaltyStore,
  formatProgress,
  getProgressPercentage,
  getCategoryIcon,
  type ExternalLoyaltyProgram,
} from '../store/externalLoyaltyStore';
import { theme } from '../constants/theme';

export default function LoyaltyEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const programId = params.programId as string;

  const { programs, updateProgram, updateProgress, deleteProgram } = useExternalLoyaltyStore();
  const program = programs.find(p => p.id === programId);

  const [currentProgress, setCurrentProgress] = useState(program?.currentProgress.toString() || '0');
  const [notes, setNotes] = useState(program?.notes || '');

  useEffect(() => {
    if (program) {
      setCurrentProgress(program.currentProgress.toString());
      setNotes(program.notes || '');
    }
  }, [program]);

  if (!program) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, color: '#9ca3af' }}>Program not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleIncrement = () => {
    const newValue = (parseInt(currentProgress) || 0) + 1;
    setCurrentProgress(newValue.toString());
  };

  const handleDecrement = () => {
    const newValue = Math.max(0, (parseInt(currentProgress) || 0) - 1);
    setCurrentProgress(newValue.toString());
  };

  const handleQuickAdd = (amount: number) => {
    const newValue = (parseInt(currentProgress) || 0) + amount;
    setCurrentProgress(newValue.toString());
  };

  const handleSave = () => {
    const newProgressValue = parseInt(currentProgress) || 0;
    
    updateProgram(programId, {
      currentProgress: newProgressValue,
      notes: notes || undefined,
    });

    // Show success feedback
    Alert.alert(
      'Updated!',
      `Progress updated to ${formatProgress(newProgressValue, program.requiredForReward, program.programType)}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete ${program.merchantName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProgram(programId);
            router.back();
          },
        },
      ]
    );
  };

  const progressPercentage = getProgressPercentage(
    parseInt(currentProgress) || 0,
    program.requiredForReward
  );
  const isReady = (parseInt(currentProgress) || 0) >= program.requiredForReward;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <ArrowLeft color="#111827" size={24} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
              Update Progress
            </Text>
          </View>
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 color="#ef4444" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Program Header */}
        <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 32 }}>
                {program.merchantLogo || getCategoryIcon(program.category)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                {program.merchantName}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                {program.category}
              </Text>
            </View>
          </View>

          {/* Reward */}
          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Award color="#10b981" size={24} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 12, flex: 1 }}>
              {program.reward}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            Current Progress
          </Text>

          {/* Large Progress Display */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: isReady ? '#dcfce7' : 'rgba(37, 99, 235, 0.05)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 8,
                borderColor: isReady ? '#10b981' : theme.colors.primary,
              }}
            >
              <Text style={{ fontSize: 48, fontWeight: 'bold', color: isReady ? '#10b981' : theme.colors.primary }}>
                {currentProgress}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                of {program.requiredForReward}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={{ width: '100%', marginTop: 24 }}>
              <View style={{ height: 12, backgroundColor: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${progressPercentage}%`,
                    backgroundColor: isReady ? '#10b981' : theme.colors.primary,
                    borderRadius: 6,
                  }}
                />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
                {Math.round(progressPercentage)}% Complete
              </Text>
            </View>

            {isReady && (
              <View
                style={{
                  backgroundColor: '#dcfce7',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginTop: 16,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
                  🎉 Reward Ready to Redeem!
                </Text>
              </View>
            )}
          </View>

          {/* Increment/Decrement Controls */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
              Adjust {program.programType === 'stamps' ? 'Stamps' : program.programType === 'points' ? 'Points' : 'Level'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <TouchableOpacity
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleDecrement}
              >
                <Minus color="#111827" size={24} />
              </TouchableOpacity>

              <TextInput
                value={currentProgress}
                onChangeText={setCurrentProgress}
                keyboardType="numeric"
                style={{
                  width: 120,
                  backgroundColor: '#f9fafb',
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#111827',
                  textAlign: 'center',
                  borderWidth: 2,
                  borderColor: '#e5e7eb',
                }}
              />

              <TouchableOpacity
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleIncrement}
              >
                <Plus color="#ffffff" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Add Buttons */}
          {program.programType !== 'tiers' && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
                Quick Add
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[1, 5, 10, 25, 50, 100].map(amount => (
                  <TouchableOpacity
                    key={amount}
                    style={{
                      flex: 1,
                      minWidth: 80,
                      backgroundColor: '#f3f4f6',
                      borderRadius: 8,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                    }}
                    onPress={() => handleQuickAdd(amount)}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>+{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this loyalty program"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                color: '#111827',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                minHeight: 80,
              }}
            />
          </View>
        </View>

        {/* Progress Stats */}
        <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            Statistics
          </Text>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Progress Percentage</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Remaining</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                {Math.max(0, program.requiredForReward - (parseInt(currentProgress) || 0))} more
              </Text>
            </View>

            {program.programType === 'points' && program.pointsValue && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Points Value</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  ₹{Math.round((program.pointsValue || 0) * 0.1)}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Last Updated</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                {new Date(program.lastUpdated).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={handleSave}
        >
          <Save color="#ffffff" size={20} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', marginLeft: 8 }}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
