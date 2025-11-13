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
import { useAdvancedFeaturesStore, type MetricType, type DimensionType, type ChartType, type ExportFormat } from '../store/advancedFeaturesStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AdvancedReportingScreen() {
  const {
    customReports,
    reportData,
    createReport,
    updateReport,
    deleteReport,
    runReport,
    scheduleReport,
    exportReport,
    getChartData,
    updateVisualization,
  } = useAdvancedFeaturesStore();

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [showMetricLibrary, setShowMetricLibrary] = useState(false);
  const [showDimensionLibrary, setShowDimensionLibrary] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const currentReport = customReports.find((r) => r.id === selectedReport);
  const currentData = currentReport ? reportData.get(currentReport.id) : null;

  // Available metrics
  const metricsLibrary: Array<{
    type: MetricType;
    label: string;
    formula?: string;
    format: 'currency' | 'number' | 'percentage';
  }> = [
    { type: 'revenue', label: 'Total Revenue', format: 'currency' },
    { type: 'customers', label: 'Total Customers', format: 'number' },
    { type: 'campaigns', label: 'Total Campaigns', format: 'number' },
    { type: 'engagement', label: 'Engagement Rate', format: 'percentage' },
    { type: 'retention', label: 'Customer Retention', format: 'percentage' },
    { type: 'conversion', label: 'Conversion Rate', format: 'percentage' },
    { type: 'roi', label: 'Return on Investment', formula: '(Revenue - Cost) / Cost', format: 'percentage' },
  ];

  // Available dimensions
  const dimensionsLibrary: Array<{
    type: DimensionType;
    label: string;
    groupBy?: string;
  }> = [
    { type: 'time', label: 'Time Period', groupBy: 'day' },
    { type: 'location', label: 'Location', groupBy: 'store' },
    { type: 'segment', label: 'Customer Segment', groupBy: 'segment_id' },
    { type: 'campaign', label: 'Campaign', groupBy: 'campaign_id' },
    { type: 'product', label: 'Product/Service', groupBy: 'product_id' },
    { type: 'channel', label: 'Marketing Channel', groupBy: 'channel' },
  ];

  const chartTypes: Array<{ type: ChartType; icon: string; label: string }> = [
    { type: 'line', icon: '📈', label: 'Line Chart' },
    { type: 'bar', icon: '📊', label: 'Bar Chart' },
    { type: 'pie', icon: '🥧', label: 'Pie Chart' },
    { type: 'area', icon: '📉', label: 'Area Chart' },
    { type: 'table', icon: '📋', label: 'Table' },
    { type: 'number', icon: '🔢', label: 'Number' },
  ];

  const handleCreateReport = () => {
    if (!newReportName.trim()) {
      Alert.alert('Error', 'Please enter a report name');
      return;
    }

    const reportId = createReport({
      name: newReportName,
      description: '',
      metrics: [],
      dimensions: [],
      filters: {
        dateRange: {
          start: Date.now() - 2592000000, // 30 days ago
          end: Date.now(),
        },
      },
      visualization: {
        chartType: 'bar',
        layout: 'single',
      },
    });

    setSelectedReport(reportId);
    setNewReportName('');
    setIsCreating(false);
  };

  const handleAddMetric = (metric: typeof metricsLibrary[0]) => {
    if (!selectedReport) return;

    const currentMetrics = currentReport?.metrics || [];
    updateReport(selectedReport, {
      metrics: [
        ...currentMetrics,
        {
          id: `metric_${Date.now()}`,
          type: metric.type,
          label: metric.label,
          formula: metric.formula,
          format: metric.format,
        },
      ],
    });

    setShowMetricLibrary(false);
  };

  const handleAddDimension = (dimension: typeof dimensionsLibrary[0]) => {
    if (!selectedReport) return;

    const currentDimensions = currentReport?.dimensions || [];
    updateReport(selectedReport, {
      dimensions: [
        ...currentDimensions,
        {
          id: `dim_${Date.now()}`,
          type: dimension.type,
          label: dimension.label,
          groupBy: dimension.groupBy,
        },
      ],
    });

    setShowDimensionLibrary(false);
  };

  const handleRunReport = async () => {
    if (!selectedReport) return;

    setIsRunning(true);
    try {
      await runReport(selectedReport);
      Alert.alert('Success', 'Report executed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to run report');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportReport = async (format: ExportFormat) => {
    if (!selectedReport) return;

    try {
      const blob = await exportReport(selectedReport, format);
      Alert.alert('Success', `Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const handleDeleteReport = (reportId: string) => {
    Alert.alert('Delete Report', 'Are you sure you want to delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteReport(reportId);
          setSelectedReport(null);
        },
      },
    ]);
  };

  const renderReportCard = (report: typeof customReports[0]) => {
    return (
      <TouchableOpacity
        key={report.id}
        style={[
          styles.reportCard,
          selectedReport === report.id && styles.reportCardSelected,
        ]}
        onPress={() => setSelectedReport(report.id)}
      >
        <View style={styles.reportHeader}>
          <Text style={styles.reportName}>{report.name}</Text>
          <Text style={styles.reportIcon}>
            {chartTypes.find((ct) => ct.type === report.visualization.chartType)?.icon}
          </Text>
        </View>

        <Text style={styles.reportDescription}>
          {report.metrics.length} metrics • {report.dimensions.length} dimensions
        </Text>

        {report.lastRun && (
          <Text style={styles.reportLastRun}>
            Last run: {new Date(report.lastRun).toLocaleDateString()}
          </Text>
        )}

        <View style={styles.reportActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteReport(report.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDataVisualization = () => {
    if (!currentData) {
      return (
        <View style={styles.emptyData}>
          <Text style={styles.emptyDataText}>No data yet. Run the report to see results.</Text>
        </View>
      );
    }

    const chartType = currentReport?.visualization.chartType || 'bar';

    return (
      <View style={styles.dataVisualization}>
        <Text style={styles.dataTitle}>Report Results</Text>
        <Text style={styles.dataSubtitle}>
          Executed at {new Date(currentData.executedAt).toLocaleString()}
        </Text>

        {/* Metrics Summary */}
        <View style={styles.metricsGrid}>
          {currentData.data.metrics.map((metric: any, index: number) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>
                {metric.value.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Chart Placeholder */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartType}>
            {chartTypes.find((ct) => ct.type === chartType)?.icon} {chartType.toUpperCase()} CHART
          </Text>
          <View style={styles.chartPlaceholder}>
            {chartType === 'bar' && renderBarChart()}
            {chartType === 'line' && renderLineChart()}
            {chartType === 'pie' && renderPieChart()}
            {chartType === 'table' && renderTable()}
          </View>
        </View>

        {/* Dimensions Breakdown */}
        {currentData.data.dimensions.map((dimension: any, index: number) => (
          <View key={index} style={styles.dimensionSection}>
            <Text style={styles.dimensionTitle}>{dimension.label}</Text>
            {dimension.values.map((value: any, valueIndex: number) => (
              <View key={valueIndex} style={styles.dimensionRow}>
                <Text style={styles.dimensionLabel}>{value.label}</Text>
                <Text style={styles.dimensionValue}>{value.value.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderBarChart = () => (
    <View style={styles.barChart}>
      {[80, 60, 90, 40, 70].map((height, index) => (
        <View key={index} style={styles.barContainer}>
          <View style={[styles.bar, { height: `${height}%` }]} />
          <Text style={styles.barLabel}>Item {index + 1}</Text>
        </View>
      ))}
    </View>
  );

  const renderLineChart = () => (
    <View style={styles.lineChart}>
      <Text style={styles.chartPlaceholderText}>Line chart visualization</Text>
    </View>
  );

  const renderPieChart = () => (
    <View style={styles.pieChart}>
      <View style={styles.pie}>
        <View style={[styles.pieSlice, { backgroundColor: '#4A90E2' }]} />
        <View style={[styles.pieSlice, { backgroundColor: '#50C878' }]} />
        <View style={[styles.pieSlice, { backgroundColor: '#F59E0B' }]} />
      </View>
      <View style={styles.pieLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4A90E2' }]} />
          <Text style={styles.legendLabel}>Segment A (40%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#50C878' }]} />
          <Text style={styles.legendLabel}>Segment B (35%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendLabel}>Segment C (25%)</Text>
        </View>
      </View>
    </View>
  );

  const renderTable = () => (
    <View style={styles.dataTable}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Metric</Text>
        <Text style={styles.tableHeaderCell}>Value</Text>
      </View>
      {[1, 2, 3, 4, 5].map((row) => (
        <View key={row} style={styles.tableRow}>
          <Text style={styles.tableCell}>Item {row}</Text>
          <Text style={styles.tableCell}>{(Math.random() * 1000).toFixed(0)}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Advanced Reporting Suite</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsCreating(true)}
        >
          <Text style={styles.createButtonText}>+ New Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Report List */}
        <View style={styles.reportList}>
          <Text style={styles.sectionTitle}>My Reports ({customReports.length})</Text>
          <ScrollView style={styles.reportScroll}>
            {customReports.map(renderReportCard)}
          </ScrollView>
        </View>

        {/* Report Builder */}
        {currentReport ? (
          <View style={styles.reportBuilder}>
            <View style={styles.builderHeader}>
              <View>
                <Text style={styles.builderTitle}>{currentReport.name}</Text>
                <Text style={styles.builderSubtitle}>
                  {currentReport.metrics.length} metrics • {currentReport.dimensions.length}{' '}
                  dimensions
                </Text>
              </View>
              <View style={styles.builderActions}>
                <TouchableOpacity
                  style={styles.runButton}
                  onPress={handleRunReport}
                  disabled={isRunning}
                >
                  <Text style={styles.runButtonText}>
                    {isRunning ? '⏳ Running...' : '▶️ Run Report'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.builderScroll}>
              {/* Metrics Section */}
              <View style={styles.builderSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Metrics</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowMetricLibrary(true)}
                  >
                    <Text style={styles.addButtonText}>+ Add Metric</Text>
                  </TouchableOpacity>
                </View>
                {currentReport.metrics.length === 0 ? (
                  <Text style={styles.emptyText}>No metrics added yet</Text>
                ) : (
                  currentReport.metrics.map((metric) => (
                    <View key={metric.id} style={styles.itemCard}>
                      <Text style={styles.itemLabel}>{metric.label}</Text>
                      <Text style={styles.itemType}>{metric.format}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Dimensions Section */}
              <View style={styles.builderSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Dimensions</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowDimensionLibrary(true)}
                  >
                    <Text style={styles.addButtonText}>+ Add Dimension</Text>
                  </TouchableOpacity>
                </View>
                {currentReport.dimensions.length === 0 ? (
                  <Text style={styles.emptyText}>No dimensions added yet</Text>
                ) : (
                  currentReport.dimensions.map((dimension) => (
                    <View key={dimension.id} style={styles.itemCard}>
                      <Text style={styles.itemLabel}>{dimension.label}</Text>
                      <Text style={styles.itemType}>{dimension.type}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Visualization Section */}
              <View style={styles.builderSection}>
                <Text style={styles.sectionLabel}>Visualization</Text>
                <View style={styles.chartTypeSelector}>
                  {chartTypes.map((chart) => (
                    <TouchableOpacity
                      key={chart.type}
                      style={[
                        styles.chartTypeOption,
                        currentReport.visualization.chartType === chart.type &&
                          styles.chartTypeOptionSelected,
                      ]}
                      onPress={() =>
                        updateVisualization(currentReport.id, {
                          chartType: chart.type,
                          layout: 'single',
                        })
                      }
                    >
                      <Text style={styles.chartTypeIcon}>{chart.icon}</Text>
                      <Text style={styles.chartTypeLabel}>{chart.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Export Section */}
              <View style={styles.builderSection}>
                <Text style={styles.sectionLabel}>Export Options</Text>
                <View style={styles.exportButtons}>
                  {(['pdf', 'excel', 'csv'] as ExportFormat[]).map((format) => (
                    <TouchableOpacity
                      key={format}
                      style={styles.exportButton}
                      onPress={() => handleExportReport(format)}
                    >
                      <Text style={styles.exportButtonText}>
                        {format.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Data Visualization */}
              {renderDataVisualization()}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.emptyBuilder}>
            <Text style={styles.emptyBuilderText}>
              Select a report or create a new one to get started
            </Text>
          </View>
        )}
      </View>

      {/* Create Report Modal */}
      <Modal visible={isCreating} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Report</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Report Name"
              value={newReportName}
              onChangeText={setNewReportName}
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
                onPress={handleCreateReport}
              >
                <Text style={styles.modalButtonTextPrimary}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Metric Library Modal */}
      <Modal visible={showMetricLibrary} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Metric</Text>
            <ScrollView style={styles.libraryScroll}>
              {metricsLibrary.map((metric, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.libraryItem}
                  onPress={() => handleAddMetric(metric)}
                >
                  <Text style={styles.libraryItemLabel}>{metric.label}</Text>
                  <Text style={styles.libraryItemType}>{metric.format}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMetricLibrary(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dimension Library Modal */}
      <Modal visible={showDimensionLibrary} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Dimension</Text>
            <ScrollView style={styles.libraryScroll}>
              {dimensionsLibrary.map((dimension, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.libraryItem}
                  onPress={() => handleAddDimension(dimension)}
                >
                  <Text style={styles.libraryItemLabel}>{dimension.label}</Text>
                  <Text style={styles.libraryItemType}>{dimension.type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDimensionLibrary(false)}
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
  reportList: {
    width: width * 0.3,
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
  reportScroll: {
    flex: 1,
  },
  reportCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reportCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF2FF',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  reportIcon: {
    fontSize: 24,
  },
  reportDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  reportLastRun: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  reportActions: {
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
  reportBuilder: {
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
  builderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  builderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  runButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  builderScroll: {
    flex: 1,
  },
  builderSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  itemType: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chartTypeOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    width: (width * 0.7 - 80) / 3,
  },
  chartTypeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF2FF',
  },
  chartTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  chartTypeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  dataVisualization: {
    marginTop: 24,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dataSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: (width * 0.7 - 80) / 3,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  chartType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  chartPlaceholder: {
    minHeight: 200,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  bar: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 8,
  },
  lineChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  pieChart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  pie: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  pieSlice: {
    flex: 1,
  },
  pieLegend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  dataTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  dimensionSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  dimensionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dimensionLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  dimensionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyData: {
    padding: 40,
    alignItems: 'center',
  },
  emptyDataText: {
    fontSize: 14,
    color: '#9CA3AF',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  libraryItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  libraryItemType: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
});
