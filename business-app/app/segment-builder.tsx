import React, { useState, useEffect } from 'react';
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
import { useAdvancedFeaturesStore, type VisualCriterion, type CriteriaField, type CriteriaOperator } from '../store/advancedFeaturesStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SegmentBuilderScreen() {
  const {
    segments,
    createSegment,
    updateSegment,
    deleteSegment,
    duplicateSegment,
    addCriterion,
    updateCriterion,
    removeCriterion,
    previewSegment,
    calculateSegmentSize,
    getSegmentPerformance,
  } = useAdvancedFeaturesStore();

  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [showCriteriaLibrary, setShowCriteriaLibrary] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);

  const currentSegment = segments.find((s) => s.id === selectedSegment);

  // Criteria library (templates for quick adding)
  const criteriaLibrary: Array<Omit<VisualCriterion, 'id'>> = [
    {
      field: 'visitFrequency',
      operator: 'greaterThan',
      value: 5,
      visualType: 'slider',
      group: 'AND',
      label: 'Visit Frequency (per month)',
      description: 'Number of visits in the last 30 days',
    },
    {
      field: 'averageSpend',
      operator: 'greaterThan',
      value: 100,
      visualType: 'slider',
      group: 'AND',
      label: 'Average Spend',
      description: 'Average transaction value',
    },
    {
      field: 'lastVisit',
      operator: 'inLast',
      value: 30,
      visualType: 'dateRange',
      group: 'AND',
      label: 'Last Visit',
      description: 'Days since last visit',
    },
    {
      field: 'loyaltyStatus',
      operator: 'equals',
      value: 'Gold',
      visualType: 'dropdown',
      group: 'AND',
      label: 'Loyalty Status',
      description: 'Customer loyalty tier',
    },
    {
      field: 'totalSpend',
      operator: 'greaterThan',
      value: 1000,
      visualType: 'slider',
      group: 'AND',
      label: 'Total Lifetime Spend',
      description: 'Total amount spent across all transactions',
    },
  ];

  useEffect(() => {
    if (currentSegment) {
      const count = calculateSegmentSize(currentSegment.criteria);
      setPreviewCount(count);
    }
  }, [currentSegment?.criteria]);

  const handleCreateSegment = () => {
    if (!newSegmentName.trim()) {
      Alert.alert('Error', 'Please enter a segment name');
      return;
    }

    const segmentId = createSegment({
      name: newSegmentName,
      description: '',
      criteria: [],
      customerCount: 0,
      previewCustomers: [],
      isDynamic: true,
      color: '#4A90E2',
      icon: 'users',
    });

    setSelectedSegment(segmentId);
    setNewSegmentName('');
    setIsCreating(false);
  };

  const handleAddCriterion = (criterion: Omit<VisualCriterion, 'id'>) => {
    if (!selectedSegment) return;
    addCriterion(selectedSegment, criterion);
    setShowCriteriaLibrary(false);
  };

  const handleUpdateCriterionValue = (criterionId: string, value: any) => {
    if (!selectedSegment) return;
    updateCriterion(selectedSegment, criterionId, { value });
  };

  const handleRemoveCriterion = (criterionId: string) => {
    if (!selectedSegment) return;
    removeCriterion(selectedSegment, criterionId);
  };

  const handleDeleteSegment = (segmentId: string) => {
    Alert.alert('Delete Segment', 'Are you sure you want to delete this segment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSegment(segmentId);
          setSelectedSegment(null);
        },
      },
    ]);
  };

  const renderSegmentCard = (segment: typeof segments[0]) => {
    const performance = getSegmentPerformance(segment.id);

    return (
      <TouchableOpacity
        key={segment.id}
        style={[
          styles.segmentCard,
          selectedSegment === segment.id && styles.segmentCardSelected,
        ]}
        onPress={() => setSelectedSegment(segment.id)}
      >
        <View style={styles.segmentHeader}>
          <View style={[styles.segmentIcon, { backgroundColor: segment.color }]}>
            <Text style={styles.segmentIconText}>
              {segment.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.segmentInfo}>
            <Text style={styles.segmentName}>{segment.name}</Text>
            <Text style={styles.segmentCount}>
              {segment.customerCount.toLocaleString()} customers
            </Text>
          </View>
        </View>

        {performance && (
          <View style={styles.performanceRow}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Revenue</Text>
              <Text style={styles.performanceValue}>
                ${performance.totalRevenue.toLocaleString()}
              </Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Conv. Rate</Text>
              <Text style={styles.performanceValue}>
                {performance.conversionRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>LTV</Text>
              <Text style={styles.performanceValue}>
                ${performance.lifetimeValue.toFixed(0)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.segmentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => duplicateSegment(segment.id)}
          >
            <Text style={styles.actionButtonText}>Duplicate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteSegment(segment.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCriterion = (criterion: VisualCriterion) => {
    return (
      <View key={criterion.id} style={styles.criterionCard}>
        <View style={styles.criterionHeader}>
          <Text style={styles.criterionLabel}>{criterion.label}</Text>
          <TouchableOpacity onPress={() => handleRemoveCriterion(criterion.id)}>
            <Text style={styles.removeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.criterionBody}>
          <Text style={styles.operatorText}>
            {criterion.operator.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </Text>

          {criterion.visualType === 'slider' && (
            <View style={styles.sliderContainer}>
              <TextInput
                style={styles.sliderInput}
                value={criterion.value.toString()}
                onChangeText={(text) =>
                  handleUpdateCriterionValue(criterion.id, parseFloat(text) || 0)
                }
                keyboardType="numeric"
              />
            </View>
          )}

          {criterion.visualType === 'dropdown' && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownValue}>{criterion.value}</Text>
            </View>
          )}

          {criterion.visualType === 'dateRange' && (
            <View style={styles.dateRangeContainer}>
              <TextInput
                style={styles.dateInput}
                value={criterion.value.toString()}
                onChangeText={(text) =>
                  handleUpdateCriterionValue(criterion.id, parseInt(text) || 0)
                }
                keyboardType="numeric"
                placeholder="Days"
              />
              <Text style={styles.dateLabel}>days</Text>
            </View>
          )}
        </View>

        <View style={styles.criterionFooter}>
          <Text style={styles.groupBadge}>{criterion.group}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visual Segment Builder</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsCreating(true)}
        >
          <Text style={styles.createButtonText}>+ New Segment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Segment List */}
        <View style={styles.segmentList}>
          <Text style={styles.sectionTitle}>My Segments ({segments.length})</Text>
          <ScrollView style={styles.segmentScroll}>
            {segments.map(renderSegmentCard)}
          </ScrollView>
        </View>

        {/* Criteria Builder */}
        {currentSegment ? (
          <View style={styles.criteriaBuilder}>
            <View style={styles.builderHeader}>
              <View>
                <Text style={styles.builderTitle}>{currentSegment.name}</Text>
                <Text style={styles.previewCount}>
                  ~{previewCount.toLocaleString()} customers match
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addCriteriaButton}
                onPress={() => setShowCriteriaLibrary(true)}
              >
                <Text style={styles.addCriteriaButtonText}>+ Add Criteria</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.criteriaScroll}>
              {currentSegment.criteria.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No criteria yet. Add criteria to define your segment.
                  </Text>
                </View>
              ) : (
                currentSegment.criteria.map(renderCriterion)
              )}
            </ScrollView>

            {/* Preview Customers */}
            {currentSegment.criteria.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Preview Customers</Text>
                {currentSegment.previewCustomers.slice(0, 3).map((customer) => (
                  <View key={customer.id} style={styles.customerPreview}>
                    <View>
                      <Text style={styles.customerName}>{customer.name}</Text>
                      <Text style={styles.customerEmail}>{customer.email}</Text>
                    </View>
                    <View style={styles.customerStats}>
                      <Text style={styles.customerStat}>
                        {customer.visitCount} visits
                      </Text>
                      <Text style={styles.customerStat}>
                        ${customer.totalSpend.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyBuilder}>
            <Text style={styles.emptyBuilderText}>
              Select a segment or create a new one to get started
            </Text>
          </View>
        )}
      </View>

      {/* Create Segment Modal */}
      <Modal visible={isCreating} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Segment</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Segment Name"
              value={newSegmentName}
              onChangeText={setNewSegmentName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsCreating(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateSegment}
              >
                <Text style={styles.modalButtonTextPrimary}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Criteria Library Modal */}
      <Modal visible={showCriteriaLibrary} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Criteria</Text>
            <ScrollView style={styles.libraryScroll}>
              {criteriaLibrary.map((criterion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.libraryItem}
                  onPress={() => handleAddCriterion(criterion)}
                >
                  <Text style={styles.libraryItemLabel}>{criterion.label}</Text>
                  <Text style={styles.libraryItemDescription}>
                    {criterion.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCriteriaLibrary(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
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
  segmentList: {
    width: width * 0.35,
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
  segmentScroll: {
    flex: 1,
  },
  segmentCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  segmentCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF2FF',
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  segmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  segmentInfo: {
    flex: 1,
  },
  segmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  segmentCount: {
    fontSize: 14,
    color: '#6B7280',
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
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  segmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
  criteriaBuilder: {
    flex: 1,
    padding: 20,
  },
  builderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  builderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  previewCount: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  addCriteriaButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addCriteriaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  criteriaScroll: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  criterionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  criterionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  criterionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: '600',
  },
  criterionBody: {
    marginBottom: 12,
  },
  operatorText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderInput: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownContainer: {
    marginTop: 8,
  },
  dropdownValue: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateInput: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 100,
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  criterionFooter: {
    flexDirection: 'row',
  },
  groupBadge: {
    backgroundColor: '#EEF2FF',
    color: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  previewSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  customerPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  customerEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  customerStats: {
    alignItems: 'flex-end',
  },
  customerStat: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyBuilder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBuilderText: {
    fontSize: 16,
    color: '#6B7280',
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
    maxHeight: '80%',
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
  libraryScroll: {
    maxHeight: 400,
    marginBottom: 20,
  },
  libraryItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  libraryItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  libraryItemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
});
