import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { useAdvancedFeaturesStore, type LocationLevel, type UserRole, type RolePermission } from '../store/advancedFeaturesStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function MultiLocationScreen() {
  const {
    locations,
    locationPerformance,
    currentUserRole,
    addLocation,
    updateLocation,
    deleteLocation,
    getLocationHierarchy,
    updateRolePermissions,
    checkPermission,
    getLocationPerformance,
    compareLocations,
    rankLocations,
    deployCampaignToLocations,
  } = useAdvancedFeaturesStore();

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationLevel, setNewLocationLevel] = useState<LocationLevel>('store');
  const [viewMode, setViewMode] = useState<'hierarchy' | 'performance'>('hierarchy');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  const currentLocation = locations.find((l) => l.id === selectedLocation);

  // Role configurations
  const roleConfig: Record<UserRole, { color: string; label: string }> = {
    owner: { color: '#8B5CF6', label: 'Owner' },
    regional_manager: { color: '#3B82F6', label: 'Regional Manager' },
    store_manager: { color: '#10B981', label: 'Store Manager' },
    staff: { color: '#F59E0B', label: 'Staff' },
    viewer: { color: '#6B7280', label: 'Viewer' },
  };

  const levelConfig: Record<LocationLevel, { icon: string; color: string }> = {
    corporate: { icon: '🏢', color: '#8B5CF6' },
    region: { icon: '🌍', color: '#3B82F6' },
    store: { icon: '🏪', color: '#10B981' },
  };

  const handleCreateLocation = () => {
    if (!newLocationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    const locationId = addLocation({
      name: newLocationName,
      level: newLocationLevel,
      parentId: selectedLocation || undefined,
      children: [],
      managers: [],
      permissions: [
        {
          role: 'owner',
          permissions: {
            viewAnalytics: true,
            createCampaigns: true,
            manageCRM: true,
            viewRevenue: true,
            manageStaff: true,
            exportData: true,
            accessAPI: true,
          },
        },
        {
          role: 'regional_manager',
          permissions: {
            viewAnalytics: true,
            createCampaigns: true,
            manageCRM: true,
            viewRevenue: true,
            manageStaff: true,
            exportData: false,
            accessAPI: false,
          },
        },
        {
          role: 'store_manager',
          permissions: {
            viewAnalytics: true,
            createCampaigns: false,
            manageCRM: true,
            viewRevenue: false,
            manageStaff: false,
            exportData: false,
            accessAPI: false,
          },
        },
      ],
    });

    // Add to parent's children if applicable
    if (selectedLocation) {
      const parent = locations.find((l) => l.id === selectedLocation);
      if (parent) {
        updateLocation(selectedLocation, {
          children: [...parent.children, locationId],
        });
      }
    }

    setNewLocationName('');
    setIsCreating(false);
  };

  const handleDeleteLocation = (locationId: string) => {
    Alert.alert('Delete Location', 'Are you sure you want to delete this location?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteLocation(locationId);
          setSelectedLocation(null);
        },
      },
    ]);
  };

  const toggleComparison = (locationId: string) => {
    setComparisonIds((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const renderLocationCard = (location: typeof locations[0], depth = 0) => {
    const config = levelConfig[location.level];
    const performance = getLocationPerformance(location.id);
    const isComparing = comparisonIds.includes(location.id);

    return (
      <View key={location.id} style={{ marginLeft: depth * 24 }}>
        <TouchableOpacity
          style={[
            styles.locationCard,
            selectedLocation === location.id && styles.locationCardSelected,
            isComparing && styles.locationCardComparing,
          ]}
          onPress={() => setSelectedLocation(location.id)}
          onLongPress={() => viewMode === 'performance' && toggleComparison(location.id)}
        >
          <View style={styles.locationHeader}>
            <View style={styles.locationIconContainer}>
              <Text style={styles.locationIcon}>{config.icon}</Text>
              {location.children.length > 0 && (
                <View style={styles.childrenBadge}>
                  <Text style={styles.childrenBadgeText}>{location.children.length}</Text>
                </View>
              )}
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationLevel}>
                {location.level.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {performance && viewMode === 'performance' && (
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Revenue</Text>
                <Text style={styles.performanceValue}>
                  ${performance.revenue.toLocaleString()}
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Customers</Text>
                <Text style={styles.performanceValue}>
                  {performance.customerCount}
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Growth</Text>
                <Text
                  style={[
                    styles.performanceValue,
                    performance.growthRate >= 0
                      ? styles.growthPositive
                      : styles.growthNegative,
                  ]}
                >
                  {performance.growthRate >= 0 ? '+' : ''}
                  {performance.growthRate.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Rank</Text>
                <Text style={styles.performanceValue}>#{performance.rank}</Text>
              </View>
            </View>
          )}

          <View style={styles.locationActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteLocation(location.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Render children recursively */}
        {location.children.map((childId) => {
          const child = locations.find((l) => l.id === childId);
          return child ? renderLocationCard(child, depth + 1) : null;
        })}
      </View>
    );
  };

  const renderPermissionRow = (
    permission: keyof RolePermission['permissions'],
    role: UserRole
  ) => {
    if (!currentLocation) return null;

    const rolePermission = currentLocation.permissions.find((p) => p.role === role);
    const isEnabled = rolePermission?.permissions[permission] || false;

    return (
      <View key={`${role}-${permission}`} style={styles.permissionRow}>
        <Text style={styles.permissionLabel}>
          {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
        </Text>
        <TouchableOpacity
          style={[styles.permissionToggle, isEnabled && styles.permissionToggleEnabled]}
          onPress={() => {
            updateRolePermissions(currentLocation.id, role, {
              [permission]: !isEnabled,
            });
          }}
        >
          <Text
            style={[
              styles.permissionToggleText,
              isEnabled && styles.permissionToggleTextEnabled,
            ]}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderComparison = () => {
    if (comparisonIds.length === 0) {
      return (
        <View style={styles.emptyComparison}>
          <Text style={styles.emptyComparisonText}>
            Long press locations to add them to comparison
          </Text>
        </View>
      );
    }

    const performances = compareLocations(comparisonIds);

    return (
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonTitle}>
            Comparing {comparisonIds.length} Locations
          </Text>
          <TouchableOpacity onPress={() => setComparisonIds([])}>
            <Text style={styles.comparisonClear}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal style={styles.comparisonScroll}>
          {performances.map((perf) => (
            <View key={perf.locationId} style={styles.comparisonCard}>
              <Text style={styles.comparisonName}>{perf.locationName}</Text>
              <View style={styles.comparisonStats}>
                <View style={styles.comparisonStat}>
                  <Text style={styles.comparisonStatLabel}>Revenue</Text>
                  <Text style={styles.comparisonStatValue}>
                    ${perf.revenue.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.comparisonStat}>
                  <Text style={styles.comparisonStatLabel}>Customers</Text>
                  <Text style={styles.comparisonStatValue}>{perf.customerCount}</Text>
                </View>
                <View style={styles.comparisonStat}>
                  <Text style={styles.comparisonStatLabel}>AOV</Text>
                  <Text style={styles.comparisonStatValue}>
                    ${perf.averageOrderValue.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.comparisonStat}>
                  <Text style={styles.comparisonStatLabel}>Growth</Text>
                  <Text
                    style={[
                      styles.comparisonStatValue,
                      perf.growthRate >= 0
                        ? styles.growthPositive
                        : styles.growthNegative,
                    ]}
                  >
                    {perf.growthRate >= 0 ? '+' : ''}
                    {perf.growthRate.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.comparisonStat}>
                  <Text style={styles.comparisonStatLabel}>Rank</Text>
                  <Text style={styles.comparisonStatValue}>#{perf.rank}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Multi-Location Management</Text>
        <View style={styles.headerActions}>
          <View style={styles.viewModeToggle}>
            {(['hierarchy', 'performance'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.viewModeButton,
                  viewMode === mode && styles.viewModeButtonActive,
                ]}
                onPress={() => setViewMode(mode)}
              >
                <Text
                  style={[
                    styles.viewModeText,
                    viewMode === mode && styles.viewModeTextActive,
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsCreating(true)}
          >
            <Text style={styles.createButtonText}>+ Add Location</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Location List */}
        <View style={styles.locationList}>
          <Text style={styles.sectionTitle}>
            {viewMode === 'hierarchy' ? 'Hierarchy' : 'Performance'} ({locations.length})
          </Text>
          <ScrollView style={styles.locationScroll}>
            {locations
              .filter((l) => !l.parentId) // Show only root locations
              .map((loc) => renderLocationCard(loc))}
          </ScrollView>
        </View>

        {/* Details Panel */}
        {currentLocation ? (
          <View style={styles.detailsPanel}>
            <View style={styles.detailsHeader}>
              <View>
                <Text style={styles.detailsTitle}>{currentLocation.name}</Text>
                <Text style={styles.detailsSubtitle}>
                  {levelConfig[currentLocation.level].icon}{' '}
                  {currentLocation.level.replace('_', ' ')}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.detailsScroll}>
              {/* Performance Stats */}
              {getLocationPerformance(currentLocation.id) && (
                <View style={styles.statsSection}>
                  <Text style={styles.statsTitle}>Performance Metrics</Text>
                  {(() => {
                    const perf = getLocationPerformance(currentLocation.id)!;
                    return (
                      <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                          <Text style={styles.statLabel}>Revenue</Text>
                          <Text style={styles.statValue}>
                            ${perf.revenue.toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.statCard}>
                          <Text style={styles.statLabel}>Customers</Text>
                          <Text style={styles.statValue}>{perf.customerCount}</Text>
                        </View>
                        <View style={styles.statCard}>
                          <Text style={styles.statLabel}>Campaigns</Text>
                          <Text style={styles.statValue}>{perf.campaignCount}</Text>
                        </View>
                        <View style={styles.statCard}>
                          <Text style={styles.statLabel}>Avg Order Value</Text>
                          <Text style={styles.statValue}>
                            ${perf.averageOrderValue.toFixed(0)}
                          </Text>
                        </View>
                        <View style={styles.statCard}>
                          <Text style={styles.statLabel}>Growth Rate</Text>
                          <Text
                            style={[
                              styles.statValue,
                              perf.growthRate >= 0
                                ? styles.growthPositive
                                : styles.growthNegative,
                            ]}
                          >
                            {perf.growthRate >= 0 ? '+' : ''}
                            {perf.growthRate.toFixed(1)}%
                          </Text>
                        </View>
                        <View style={styles.statCard}>
                          <Text style={styles.statLabel}>Rank</Text>
                          <Text style={styles.statValue}>#{perf.rank}</Text>
                        </View>
                      </View>
                    );
                  })()}
                </View>
              )}

              {/* Role Permissions */}
              <View style={styles.permissionsSection}>
                <Text style={styles.permissionsTitle}>Role Permissions</Text>
                {currentLocation.permissions.map((rolePerms) => (
                  <View key={rolePerms.role} style={styles.roleSection}>
                    <View style={styles.roleHeader}>
                      <Text style={styles.roleLabel}>
                        {roleConfig[rolePerms.role].label}
                      </Text>
                    </View>
                    {Object.keys(rolePerms.permissions).map((perm) =>
                      renderPermissionRow(
                        perm as keyof typeof rolePerms.permissions,
                        rolePerms.role
                      )
                    )}
                  </View>
                ))}
              </View>

              {/* Child Locations */}
              {currentLocation.children.length > 0 && (
                <View style={styles.childrenSection}>
                  <Text style={styles.childrenTitle}>
                    Child Locations ({currentLocation.children.length})
                  </Text>
                  {currentLocation.children.map((childId) => {
                    const child = locations.find((l) => l.id === childId);
                    if (!child) return null;
                    return (
                      <TouchableOpacity
                        key={childId}
                        style={styles.childCard}
                        onPress={() => setSelectedLocation(childId)}
                      >
                        <Text style={styles.childIcon}>
                          {levelConfig[child.level].icon}
                        </Text>
                        <Text style={styles.childName}>{child.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.emptyDetails}>
            <Text style={styles.emptyDetailsText}>
              Select a location to view details
            </Text>
          </View>
        )}
      </View>

      {/* Comparison View */}
      {viewMode === 'performance' && renderComparison()}

      {/* Create Location Modal */}
      <Modal visible={isCreating} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Location</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Location Name"
              value={newLocationName}
              onChangeText={setNewLocationName}
            />
            <View style={styles.levelSelector}>
              {(['corporate', 'region', 'store'] as LocationLevel[]).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelOption,
                    newLocationLevel === level && styles.levelOptionSelected,
                  ]}
                  onPress={() => setNewLocationLevel(level)}
                >
                  <Text style={styles.levelIcon}>{levelConfig[level].icon}</Text>
                  <Text style={styles.levelLabel}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsCreating(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateLocation}
              >
                <Text style={styles.modalButtonTextPrimary}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewModeTextActive: {
    color: theme.colors.primary,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  locationList: {
    width: width * 0.4,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  locationScroll: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF2FF',
  },
  locationCardComparing: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  locationIcon: {
    fontSize: 32,
  },
  childrenBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childrenBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationLevel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  performanceItem: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  growthPositive: {
    color: '#10B981',
  },
  growthNegative: {
    color: '#EF4444',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
  detailsPanel: {
    flex: 1,
    padding: 20,
  },
  detailsHeader: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsScroll: {
    flex: 1,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: (width * 0.6 - 60) / 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  permissionsSection: {
    marginBottom: 24,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  roleSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  roleHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionLabel: {
    fontSize: 14,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  permissionToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  permissionToggleEnabled: {
    backgroundColor: '#D1FAE5',
  },
  permissionToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  permissionToggleTextEnabled: {
    color: '#059669',
  },
  childrenSection: {
    marginBottom: 24,
  },
  childrenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  childIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  childName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  emptyDetails: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDetailsText: {
    fontSize: 16,
    color: '#6B7280',
  },
  comparisonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  comparisonClear: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  comparisonScroll: {
    maxHeight: 200,
  },
  comparisonCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 200,
  },
  comparisonName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  comparisonStats: {
    gap: 8,
  },
  comparisonStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  comparisonStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyComparison: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  emptyComparisonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  levelSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  levelOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  levelOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF2FF',
  },
  levelIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
