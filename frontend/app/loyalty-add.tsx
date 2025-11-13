import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Store,
  Award,
  Calendar,
  Bell,
  Info,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import {
  useExternalLoyaltyStore,
  getCategoryIcon,
  type ProgramType,
  type LoyaltyTemplate,
  type ProgramSource,
} from '../store/externalLoyaltyStore';
import { theme } from '../constants/theme';

export default function AddLoyaltyProgramScreen() {
  const router = useRouter();
  const { templates, addProgram, createFromTemplate } = useExternalLoyaltyStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LoyaltyTemplate | null>(null);
  
  // Form state
  const [merchantName, setMerchantName] = useState('');
  const [merchantLogo, setMerchantLogo] = useState('');
  const [category, setCategory] = useState('Food & Drink');
  const [programType, setProgramType] = useState<ProgramType>('stamps');
  const [programSource, setProgramSource] = useState<ProgramSource>('local');
  const [currentProgress, setCurrentProgress] = useState('0');
  const [requiredForReward, setRequiredForReward] = useState('10');
  const [reward, setReward] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [expirationDays, setExpirationDays] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'Food & Drink',
    'Retail',
    'Fuel',
    'Beauty & Wellness',
    'Health & Fitness',
    'Entertainment',
    'Travel',
    'Services',
  ];

  const programTypes: { value: ProgramType; label: string; description: string }[] = [
    { value: 'stamps', label: 'Stamp Card', description: 'Collect stamps for each visit' },
    { value: 'points', label: 'Points Program', description: 'Earn points based on spending' },
    { value: 'tiers', label: 'Tier System', description: 'Level up with continued loyalty' },
  ];

  const filteredTemplates = templates.filter(
    t =>
      t.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTemplates = filteredTemplates.filter(t => t.isPopular);
  const otherTemplates = filteredTemplates.filter(t => !t.isPopular);

  const handleTemplateSelect = (template: LoyaltyTemplate) => {
    setSelectedTemplate(template);
    setMerchantName(template.merchantName);
    setCategory(template.category);
    setProgramType(template.programType);
    setRequiredForReward(template.requiredForReward.toString());
    setReward(template.defaultReward);
    setShowTemplates(false);
  };

  const handleSubmit = () => {
    if (!merchantName || !reward) {
      alert('Please fill in merchant name and reward');
      return;
    }

    const expirationDate = expirationDays
      ? Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000
      : undefined;

    const programNotes = [
      notes,
      location ? `Location: ${location}` : '',
      contactInfo ? `Contact: ${contactInfo}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    addProgram({
      merchantName,
      merchantLogo: merchantLogo || getCategoryIcon(category),
      category,
      programType,
      programSource,
      currentProgress: parseInt(currentProgress) || 0,
      requiredForReward: parseInt(requiredForReward) || 10,
      reward,
      cardNumber: cardNumber || undefined,
      notes: programNotes || undefined,
      expirationDate,
      isManual: true,
      autoSync: false,
      manualUpdates: [],
      reminderEnabled,
    });

    Alert.alert(
      'Success!',
      `${merchantName} loyalty program has been added.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  // ============================================================================
  // RENDER TEMPLATES MODAL
  // ============================================================================
  const renderTemplatesModal = () => {
    return (
      <Modal visible={showTemplates} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setShowTemplates(false)} style={{ marginRight: 12 }}>
                <ArrowLeft color="#111827" size={24} />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                Choose Template
              </Text>
            </View>

            {/* Search */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                paddingHorizontal: 12,
              }}
            >
              <Search color="#9ca3af" size={20} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search brands..."
                placeholderTextColor="#9ca3af"
                style={{ flex: 1, padding: 12, fontSize: 16, color: '#111827' }}
              />
            </View>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {/* Popular Templates */}
            {popularTemplates.length > 0 && (
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                  Popular Brands
                </Text>
                {popularTemplates.map(template => (
                  <TouchableOpacity
                    key={template.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#f3f4f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{template.merchantLogo}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                        {template.merchantName}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {template.category} • {template.programType === 'stamps' ? 'Stamp Card' : template.programType === 'points' ? 'Points' : 'Tiers'}
                      </Text>
                    </View>
                    <ChevronRight color="#9ca3af" size={20} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Other Templates */}
            {otherTemplates.length > 0 && (
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                  More Templates
                </Text>
                {otherTemplates.map(template => (
                  <TouchableOpacity
                    key={template.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#f3f4f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{template.merchantLogo}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                        {template.merchantName}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {template.category}
                      </Text>
                    </View>
                    <ChevronRight color="#9ca3af" size={20} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No Results */}
            {filteredTemplates.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Store color="#d1d5db" size={64} />
                <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 16 }}>
                  No templates found
                </Text>
                <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>
                  Create a custom loyalty program instead
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // ============================================================================
  // RENDER MAIN UI
  // ============================================================================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <ArrowLeft color="#111827" size={24} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
              Add Loyalty Program
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Use Template Button */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setShowTemplates(true)}
          >
            <Store color="#ffffff" size={20} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', marginLeft: 8 }}>
              Use Popular Brand Template
            </Text>
          </TouchableOpacity>

          {selectedTemplate && (
            <View
              style={{
                backgroundColor: '#dcfce7',
                borderRadius: 8,
                padding: 12,
                marginTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Check color="#166534" size={20} />
              <Text style={{ fontSize: 14, color: '#166534', marginLeft: 8, flex: 1 }}>
                Using template: {selectedTemplate.merchantName}
              </Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View style={{ backgroundColor: '#ffffff', padding: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            Program Details
          </Text>

          {/* Merchant Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Merchant Name *
            </Text>
            <TextInput
              value={merchantName}
              onChangeText={setMerchantName}
              placeholder="e.g., Starbucks"
              placeholderTextColor="#9ca3af"
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#111827',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />
          </View>

          {/* Category */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: category === cat ? theme.colors.primary : '#f3f4f6',
                    borderWidth: 1,
                    borderColor: category === cat ? theme.colors.primary : '#e5e7eb',
                  }}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: category === cat ? '#ffffff' : '#6b7280',
                    }}
                  >
                    {getCategoryIcon(cat)} {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Program Type */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Program Type
            </Text>
            {programTypes.map(type => (
              <TouchableOpacity
                key={type.value}
                style={{
                  backgroundColor: programType === type.value ? 'rgba(37, 99, 235, 0.05)' : '#f9fafb',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: programType === type.value ? theme.colors.primary : '#e5e7eb',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setProgramType(type.value)}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: programType === type.value ? theme.colors.primary : '#d1d5db',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  {programType === type.value && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    {type.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {type.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Progress */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Current {programType === 'stamps' ? 'Stamps' : programType === 'points' ? 'Points' : 'Level'}
              </Text>
              <TextInput
                value={currentProgress}
                onChangeText={setCurrentProgress}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#111827',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Required for Reward
              </Text>
              <TextInput
                value={requiredForReward}
                onChangeText={setRequiredForReward}
                placeholder="10"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#111827',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}
              />
            </View>
          </View>

          {/* Reward */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Reward *
            </Text>
            <TextInput
              value={reward}
              onChangeText={setReward}
              placeholder="e.g., Free Beverage of Choice"
              placeholderTextColor="#9ca3af"
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#111827',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />
          </View>

          {/* Card Number (Optional) */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Card Number (Optional)
            </Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="e.g., 1234567890"
              placeholderTextColor="#9ca3af"
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#111827',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />
          </View>

          {/* Expiration */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Expires in (days)
            </Text>
            <TextInput
              value={expirationDays}
              onChangeText={setExpirationDays}
              placeholder="e.g., 90"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#111827',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              Leave empty if no expiration
            </Text>
          </View>

          {/* Reminders */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                Enable Reminders
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                Get notified about expiration and milestones
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#d1d5db', true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Notes */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Notes (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes or special instructions"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#111827',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                minHeight: 80,
              }}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={{ padding: 16, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: '#eff6ff',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: '#bfdbfe',
            }}
          >
            <Info color="#3b82f6" size={20} style={{ marginRight: 12, marginTop: 2 }} />
            <Text style={{ fontSize: 14, color: '#1e40af', flex: 1, lineHeight: 20 }}>
              Manual loyalty programs allow you to track rewards from any business, even if they don't have a digital program. Update your progress manually as you earn stamps or points.
            </Text>
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
            alignItems: 'center',
          }}
          onPress={handleSubmit}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
            Add Loyalty Program
          </Text>
        </TouchableOpacity>
      </View>

      {/* Templates Modal */}
      {renderTemplatesModal()}
    </SafeAreaView>
  );
}
