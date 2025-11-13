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
  Dimensions,
} from 'react-native';
import { useAdvancedFeaturesStore } from '../store/advancedFeaturesStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function WhiteLabelScreen() {
  const {
    brandCustomization,
    featureToggles,
    apiAccess,
    setBrandCustomization,
    updateBrandColors,
    uploadLogo,
    setCustomDomain,
    toggleFeature,
    getEnabledFeatures,
    checkFeatureAccess,
    generateAPIKeys,
    revokeAPIAccess,
    updateRateLimit,
  } = useAdvancedFeaturesStore();

  const [clientId, setClientId] = useState('client_demo_123');
  const [brandName, setBrandName] = useState(brandCustomization?.brandName || '');
  const [primaryColor, setPrimaryColor] = useState(
    brandCustomization?.primaryColor || '#4A90E2'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    brandCustomization?.secondaryColor || '#50C878'
  );
  const [customDomain, setCustomDomainInput] = useState(
    brandCustomization?.customDomain || ''
  );

  const handleSaveBranding = () => {
    setBrandCustomization({
      clientId,
      brandName,
      primaryColor,
      secondaryColor,
      logoUrl: brandCustomization?.logoUrl || '',
      faviconUrl: brandCustomization?.faviconUrl || '',
      customDomain: customDomain || undefined,
      emailTemplate: {
        headerImage: '',
        footerText: `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`,
        primaryColor,
      },
    });

    Alert.alert('Success', 'Brand customization saved successfully!');
  };

  const handleGenerateKeys = () => {
    Alert.alert(
      'Generate API Keys',
      'This will create new API credentials for this client. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            generateAPIKeys(clientId);
            Alert.alert('Success', 'API keys generated successfully!');
          },
        },
      ]
    );
  };

  const handleRevokeKeys = () => {
    Alert.alert(
      'Revoke API Access',
      'This will immediately disable all API access for this client. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => {
            revokeAPIAccess(clientId);
            Alert.alert('Success', 'API access revoked');
          },
        },
      ]
    );
  };

  const colorPresets = [
    { name: 'Blue Ocean', primary: '#4A90E2', secondary: '#50C878' },
    { name: 'Purple Dream', primary: '#8B5CF6', secondary: '#EC4899' },
    { name: 'Sunset Orange', primary: '#F59E0B', secondary: '#EF4444' },
    { name: 'Forest Green', primary: '#10B981', secondary: '#059669' },
    { name: 'Dark Mode', primary: '#1F2937', secondary: '#6B7280' },
    { name: 'Coral Reef', primary: '#FF6B6B', secondary: '#4ECDC4' },
  ];

  const features = [
    { id: 'crm', name: 'CRM & Customer Management', tier: 'basic' },
    { id: 'campaigns', name: 'Campaign Management', tier: 'basic' },
    { id: 'analytics', name: 'Basic Analytics', tier: 'basic' },
    { id: 'loyalty', name: 'Loyalty Programs', tier: 'pro' },
    { id: 'segmentation', name: 'Customer Segmentation', tier: 'pro' },
    { id: 'workflows', name: 'Automated Workflows', tier: 'pro' },
    { id: 'multi_location', name: 'Multi-Location Management', tier: 'enterprise' },
    { id: 'white_label', name: 'White-Label Branding', tier: 'enterprise' },
    { id: 'api_access', name: 'API Access', tier: 'enterprise' },
    { id: 'custom_reports', name: 'Custom Reports', tier: 'enterprise' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>White-Label Solutions</Text>
        <Text style={styles.headerSubtitle}>
          Customize branding, features, and API access for clients
        </Text>
      </View>

      {/* Brand Customization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Brand Customization</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Client ID</Text>
          <TextInput
            style={styles.input}
            value={clientId}
            onChangeText={setClientId}
            placeholder="client_id"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Brand Name</Text>
          <TextInput
            style={styles.input}
            value={brandName}
            onChangeText={setBrandName}
            placeholder="Enter brand name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Custom Domain (Optional)</Text>
          <TextInput
            style={styles.input}
            value={customDomain}
            onChangeText={setCustomDomainInput}
            placeholder="app.yourbrand.com"
          />
        </View>

        {/* Color Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Color Scheme</Text>
          <View style={styles.colorPresets}>
            {colorPresets.map((preset) => (
              <TouchableOpacity
                key={preset.name}
                style={styles.colorPreset}
                onPress={() => {
                  setPrimaryColor(preset.primary);
                  setSecondaryColor(preset.secondary);
                }}
              >
                <View style={styles.colorPresetCircles}>
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: preset.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.colorCircle,
                      styles.colorCircleSecondary,
                      { backgroundColor: preset.secondary },
                    ]}
                  />
                </View>
                <Text style={styles.colorPresetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.colorInputs}>
          <View style={styles.colorInput}>
            <Text style={styles.label}>Primary Color</Text>
            <View style={styles.colorInputRow}>
              <View
                style={[styles.colorPreview, { backgroundColor: primaryColor }]}
              />
              <TextInput
                style={styles.input}
                value={primaryColor}
                onChangeText={setPrimaryColor}
                placeholder="#4A90E2"
              />
            </View>
          </View>

          <View style={styles.colorInput}>
            <Text style={styles.label}>Secondary Color</Text>
            <View style={styles.colorInputRow}>
              <View
                style={[styles.colorPreview, { backgroundColor: secondaryColor }]}
              />
              <TextInput
                style={styles.input}
                value={secondaryColor}
                onChangeText={setSecondaryColor}
                placeholder="#50C878"
              />
            </View>
          </View>
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={[styles.previewCard, { borderColor: primaryColor }]}>
            <View
              style={[styles.previewHeader, { backgroundColor: primaryColor }]}
            >
              <Text style={styles.previewHeaderText}>{brandName || 'Your Brand'}</Text>
            </View>
            <View style={styles.previewBody}>
              <Text style={styles.previewBodyText}>Sample dashboard content</Text>
              <TouchableOpacity
                style={[styles.previewButton, { backgroundColor: secondaryColor }]}
              >
                <Text style={styles.previewButtonText}>Action Button</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveBranding}>
          <Text style={styles.saveButtonText}>Save Branding</Text>
        </TouchableOpacity>
      </View>

      {/* Feature Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Feature Toggles</Text>
        <Text style={styles.sectionSubtitle}>
          Enable or disable features per client subscription tier
        </Text>

        {features.map((feature) => {
          const toggle = featureToggles.find((ft) => ft.featureId === feature.id);
          const isEnabled = toggle?.enabled || false;

          return (
            <View key={feature.id} style={styles.featureRow}>
              <View style={styles.featureInfo}>
                <Text style={styles.featureName}>{feature.name}</Text>
                <View
                  style={[
                    styles.tierBadge,
                    feature.tier === 'basic' && styles.tierBasic,
                    feature.tier === 'pro' && styles.tierPro,
                    feature.tier === 'enterprise' && styles.tierEnterprise,
                  ]}
                >
                  <Text style={styles.tierText}>
                    {feature.tier.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={(value) => toggleFeature(feature.id, value)}
                trackColor={{ false: '#D1D5DB', true: primaryColor }}
                thumbColor="#FFFFFF"
              />
            </View>
          );
        })}
      </View>

      {/* API Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 API Access Management</Text>

        {apiAccess ? (
          <View style={styles.apiCard}>
            <View style={styles.apiHeader}>
              <Text style={styles.apiTitle}>API Credentials</Text>
              <View
                style={[
                  styles.apiStatus,
                  apiAccess.isActive ? styles.apiStatusActive : styles.apiStatusInactive,
                ]}
              >
                <Text
                  style={[
                    styles.apiStatusText,
                    apiAccess.isActive
                      ? styles.apiStatusTextActive
                      : styles.apiStatusTextInactive,
                  ]}
                >
                  {apiAccess.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.apiKeyRow}>
              <Text style={styles.apiKeyLabel}>API Key:</Text>
              <TextInput
                style={styles.apiKeyValue}
                value={apiAccess.apiKey}
                editable={false}
                selectTextOnFocus
              />
            </View>

            <View style={styles.apiKeyRow}>
              <Text style={styles.apiKeyLabel}>Secret Key:</Text>
              <TextInput
                style={styles.apiKeyValue}
                value={apiAccess.secretKey}
                editable={false}
                selectTextOnFocus
              />
            </View>

            <View style={styles.apiStats}>
              <View style={styles.apiStat}>
                <Text style={styles.apiStatLabel}>Rate Limit</Text>
                <Text style={styles.apiStatValue}>
                  {apiAccess.rateLimit}/hour
                </Text>
              </View>
              <View style={styles.apiStat}>
                <Text style={styles.apiStatLabel}>Total Calls</Text>
                <Text style={styles.apiStatValue}>
                  {apiAccess.totalCalls.toLocaleString()}
                </Text>
              </View>
              <View style={styles.apiStat}>
                <Text style={styles.apiStatLabel}>Last Used</Text>
                <Text style={styles.apiStatValue}>
                  {apiAccess.lastUsed
                    ? new Date(apiAccess.lastUsed).toLocaleDateString()
                    : 'Never'}
                </Text>
              </View>
            </View>

            <View style={styles.apiActions}>
              <TouchableOpacity
                style={styles.apiActionButton}
                onPress={() => {
                  Alert.prompt(
                    'Update Rate Limit',
                    'Enter new rate limit (requests/hour):',
                    (text) => {
                      const newLimit = parseInt(text);
                      if (!isNaN(newLimit)) {
                        updateRateLimit(clientId, newLimit);
                      }
                    }
                  );
                }}
              >
                <Text style={styles.apiActionButtonText}>Update Rate Limit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.apiActionButton, styles.apiActionButtonDanger]}
                onPress={handleRevokeKeys}
              >
                <Text style={styles.apiActionButtonTextDanger}>Revoke Access</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.apiEmpty}>
            <Text style={styles.apiEmptyText}>No API keys generated yet</Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateKeys}
            >
              <Text style={styles.generateButtonText}>Generate API Keys</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Available Endpoints */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Available API Endpoints</Text>
        {apiAccess?.endpoints.map((endpoint) => (
          <View key={endpoint} style={styles.endpointRow}>
            <Text style={styles.endpointMethod}>GET/POST</Text>
            <Text style={styles.endpointPath}>{endpoint}</Text>
          </View>
        ))}
        {!apiAccess && (
          <Text style={styles.noEndpointsText}>
            Generate API keys to see available endpoints
          </Text>
        )}
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Configuration Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Client ID:</Text>
            <Text style={styles.summaryValue}>{clientId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Brand Name:</Text>
            <Text style={styles.summaryValue}>{brandName || 'Not set'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Custom Domain:</Text>
            <Text style={styles.summaryValue}>{customDomain || 'None'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Enabled Features:</Text>
            <Text style={styles.summaryValue}>
              {getEnabledFeatures().length} / {features.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>API Access:</Text>
            <Text style={styles.summaryValue}>
              {apiAccess?.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorPreset: {
    alignItems: 'center',
    width: (width - 64) / 3,
  },
  colorPresetCircles: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorCircleSecondary: {
    marginLeft: -12,
  },
  colorPresetName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  colorInputs: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  colorInput: {
    flex: 1,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  preview: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  previewHeader: {
    padding: 16,
    alignItems: 'center',
  },
  previewHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewBody: {
    padding: 16,
    alignItems: 'center',
  },
  previewBodyText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  previewButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 12,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tierBasic: {
    backgroundColor: '#DBEAFE',
  },
  tierPro: {
    backgroundColor: '#FEF3C7',
  },
  tierEnterprise: {
    backgroundColor: '#F3E8FF',
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
  },
  apiCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  apiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  apiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  apiStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  apiStatusActive: {
    backgroundColor: '#D1FAE5',
  },
  apiStatusInactive: {
    backgroundColor: '#FEE2E2',
  },
  apiStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  apiStatusTextActive: {
    color: '#059669',
  },
  apiStatusTextInactive: {
    color: '#DC2626',
  },
  apiKeyRow: {
    marginBottom: 12,
  },
  apiKeyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  apiKeyValue: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  apiStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  apiStat: {
    flex: 1,
    alignItems: 'center',
  },
  apiStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  apiStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  apiActions: {
    flexDirection: 'row',
    gap: 12,
  },
  apiActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  apiActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  apiActionButtonDanger: {
    backgroundColor: '#FEE2E2',
  },
  apiActionButtonTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  apiEmpty: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  apiEmptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  endpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  endpointMethod: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    width: 80,
  },
  endpointPath: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#4B5563',
  },
  noEndpointsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
