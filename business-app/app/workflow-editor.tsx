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
import { useAdvancedFeaturesStore, type WorkflowNode, type TriggerType, type ActionType } from '../store/advancedFeaturesStore';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function WorkflowEditorScreen() {
  const {
    workflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    activateWorkflow,
    deactivateWorkflow,
    testWorkflow,
    addNode,
    updateNode,
    removeNode,
    connectNodes,
  } = useAdvancedFeaturesStore();

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [showNodeLibrary, setShowNodeLibrary] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  const currentWorkflow = workflows.find((w) => w.id === selectedWorkflow);

  // Node templates library
  const nodeLibrary = [
    {
      type: 'trigger' as const,
      label: 'Customer Visits',
      icon: '🚶',
      config: { eventName: 'customer_visit', type: 'event_based' },
    },
    {
      type: 'trigger' as const,
      label: 'Time Schedule',
      icon: '⏰',
      config: { scheduleTime: '0 9 * * *', type: 'time_based' },
    },
    {
      type: 'trigger' as const,
      label: 'Segment Entry',
      icon: '👥',
      config: { segmentId: '', type: 'segment_entry' },
    },
    {
      type: 'condition' as const,
      label: 'Check Visits',
      icon: '❓',
      config: { field: 'visitCount', operator: 'greaterThan', value: 5 },
    },
    {
      type: 'action' as const,
      label: 'Send Message',
      icon: '💬',
      config: { actionType: 'send_message', messageTemplate: '' },
    },
    {
      type: 'action' as const,
      label: 'Award Stamps',
      icon: '🎁',
      config: { actionType: 'award_stamps', stampCount: 1 },
    },
    {
      type: 'action' as const,
      label: 'Send Email',
      icon: '📧',
      config: { actionType: 'send_email', emailTemplate: '' },
    },
    {
      type: 'delay' as const,
      label: 'Wait 1 Day',
      icon: '⏸',
      config: { delayMinutes: 1440 },
    },
    {
      type: 'split' as const,
      label: 'A/B Split',
      icon: '🔀',
      config: { splitRatio: 0.5 },
    },
  ];

  const handleCreateWorkflow = () => {
    if (!newWorkflowName.trim()) {
      Alert.alert('Error', 'Please enter a workflow name');
      return;
    }

    const workflowId = createWorkflow({
      name: newWorkflowName,
      description: '',
      nodes: [],
      trigger: {
        type: 'event_based',
        config: { eventName: 'customer_visit' },
      },
      actions: [],
      isActive: false,
      isDraft: true,
      totalExecutions: 0,
      successRate: 0,
      performance: {
        customersProcessed: 0,
        conversionRate: 0,
        totalRevenue: 0,
      },
    });

    setSelectedWorkflow(workflowId);
    setNewWorkflowName('');
    setIsCreating(false);
  };

  const handleAddNode = (template: typeof nodeLibrary[0]) => {
    if (!selectedWorkflow) return;

    const newNode: Omit<WorkflowNode, 'id'> = {
      type: template.type,
      position: {
        x: Math.random() * 300,
        y: (currentWorkflow?.nodes.length || 0) * 150 + 100,
      },
      data: {
        label: template.label,
        config: template.config,
      },
      connections: [],
    };

    addNode(selectedWorkflow, newNode);
    setShowNodeLibrary(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!selectedWorkflow) return;
    removeNode(selectedWorkflow, nodeId);
  };

  const handleToggleWorkflow = (workflowId: string, isActive: boolean) => {
    if (isActive) {
      deactivateWorkflow(workflowId);
    } else {
      Alert.alert(
        'Activate Workflow',
        'This workflow will start running automatically. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Activate', onPress: () => activateWorkflow(workflowId) },
        ]
      );
    }
  };

  const handleTestWorkflow = async () => {
    if (!selectedWorkflow) return;

    const results = await testWorkflow(selectedWorkflow, {
      customerId: 'test_customer',
      testData: {},
    });

    setTestResults(results);
    setShowTestModal(true);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    Alert.alert('Delete Workflow', 'Are you sure you want to delete this workflow?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteWorkflow(workflowId);
          setSelectedWorkflow(null);
        },
      },
    ]);
  };

  const renderWorkflowCard = (workflow: typeof workflows[0]) => {
    return (
      <TouchableOpacity
        key={workflow.id}
        style={[
          styles.workflowCard,
          selectedWorkflow === workflow.id && styles.workflowCardSelected,
        ]}
        onPress={() => setSelectedWorkflow(workflow.id)}
      >
        <View style={styles.workflowHeader}>
          <View>
            <Text style={styles.workflowName}>{workflow.name}</Text>
            <Text style={styles.workflowDescription}>
              {workflow.nodes.length} steps • {workflow.totalExecutions} executions
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              workflow.isActive ? styles.statusActive : styles.statusDraft,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                workflow.isActive ? styles.statusTextActive : styles.statusTextDraft,
              ]}
            >
              {workflow.isActive ? 'Active' : workflow.isDraft ? 'Draft' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.performanceRow}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Success Rate</Text>
            <Text style={styles.performanceValue}>
              {workflow.successRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Revenue</Text>
            <Text style={styles.performanceValue}>
              ${workflow.performance.totalRevenue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Conv. Rate</Text>
            <Text style={styles.performanceValue}>
              {workflow.performance.conversionRate.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.workflowActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              workflow.isActive && styles.actionButtonActive,
            ]}
            onPress={() => handleToggleWorkflow(workflow.id, workflow.isActive)}
          >
            <Text
              style={[
                styles.actionButtonText,
                workflow.isActive && styles.actionButtonTextActive,
              ]}
            >
              {workflow.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => duplicateWorkflow(workflow.id)}
          >
            <Text style={styles.actionButtonText}>Duplicate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteWorkflow(workflow.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNode = (node: WorkflowNode) => {
    const getNodeColor = () => {
      switch (node.type) {
        case 'trigger':
          return '#10B981';
        case 'condition':
          return '#F59E0B';
        case 'action':
          return '#3B82F6';
        case 'delay':
          return '#8B5CF6';
        case 'split':
          return '#EC4899';
        default:
          return '#6B7280';
      }
    };

    return (
      <View key={node.id} style={[styles.node, { borderColor: getNodeColor() }]}>
        <View style={styles.nodeHeader}>
          <View style={[styles.nodeIcon, { backgroundColor: getNodeColor() }]}>
            <Text style={styles.nodeType}>{node.type.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.nodeLabel}>{node.data.label}</Text>
          <TouchableOpacity onPress={() => handleDeleteNode(node.id)}>
            <Text style={styles.nodeDelete}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nodeBody}>
          <Text style={styles.nodeConfigLabel}>Configuration:</Text>
          {Object.entries(node.data.config).map(([key, value]) => (
            <Text key={key} style={styles.nodeConfigItem}>
              {key}: {String(value)}
            </Text>
          ))}
        </View>

        {node.connections.length > 0 && (
          <View style={styles.nodeConnections}>
            <Text style={styles.nodeConnectionsText}>
              → {node.connections.length} connection(s)
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Automated Workflow Editor</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsCreating(true)}
        >
          <Text style={styles.createButtonText}>+ New Workflow</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Workflow List */}
        <View style={styles.workflowList}>
          <Text style={styles.sectionTitle}>My Workflows ({workflows.length})</Text>
          <ScrollView style={styles.workflowScroll}>
            {workflows.map(renderWorkflowCard)}
          </ScrollView>
        </View>

        {/* Workflow Canvas */}
        {currentWorkflow ? (
          <View style={styles.workflowCanvas}>
            <View style={styles.canvasHeader}>
              <View>
                <Text style={styles.canvasTitle}>{currentWorkflow.name}</Text>
                <Text style={styles.canvasSubtitle}>
                  {currentWorkflow.nodes.length} nodes •{' '}
                  {currentWorkflow.isActive ? 'Active' : 'Draft'}
                </Text>
              </View>
              <View style={styles.canvasActions}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={handleTestWorkflow}
                >
                  <Text style={styles.testButtonText}>🧪 Test Workflow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addNodeButton}
                  onPress={() => setShowNodeLibrary(true)}
                >
                  <Text style={styles.addNodeButtonText}>+ Add Node</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.canvasScroll}>
              {currentWorkflow.nodes.length === 0 ? (
                <View style={styles.emptyCanvas}>
                  <Text style={styles.emptyCanvasText}>
                    No nodes yet. Add nodes to build your workflow.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyCanvasButton}
                    onPress={() => setShowNodeLibrary(true)}
                  >
                    <Text style={styles.emptyCanvasButtonText}>
                      Add Your First Node
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nodesContainer}>
                  {currentWorkflow.nodes.map(renderNode)}
                </View>
              )}
            </ScrollView>

            {/* Workflow Stats */}
            {currentWorkflow.totalExecutions > 0 && (
              <View style={styles.statsSection}>
                <Text style={styles.statsTitle}>Performance</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {currentWorkflow.performance.customersProcessed}
                    </Text>
                    <Text style={styles.statLabel}>Customers Processed</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {currentWorkflow.performance.conversionRate.toFixed(1)}%
                    </Text>
                    <Text style={styles.statLabel}>Conversion Rate</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      ${currentWorkflow.performance.totalRevenue.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Revenue Generated</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyWorkflow}>
            <Text style={styles.emptyWorkflowText}>
              Select a workflow or create a new one to get started
            </Text>
          </View>
        )}
      </View>

      {/* Create Workflow Modal */}
      <Modal visible={isCreating} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Workflow</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Workflow Name"
              value={newWorkflowName}
              onChangeText={setNewWorkflowName}
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
                onPress={handleCreateWorkflow}
              >
                <Text style={styles.modalButtonTextPrimary}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Node Library Modal */}
      <Modal visible={showNodeLibrary} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Node</Text>
            <ScrollView style={styles.libraryScroll}>
              {nodeLibrary.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.libraryItem}
                  onPress={() => handleAddNode(template)}
                >
                  <Text style={styles.libraryIcon}>{template.icon}</Text>
                  <View style={styles.libraryItemInfo}>
                    <Text style={styles.libraryItemLabel}>{template.label}</Text>
                    <Text style={styles.libraryItemType}>{template.type}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNodeLibrary(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Test Results Modal */}
      <Modal visible={showTestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Test Results</Text>
            {testResults && (
              <View style={styles.testResultsContainer}>
                <View style={styles.testResultRow}>
                  <Text style={styles.testResultLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.testResultValue,
                      testResults.success ? styles.testSuccess : styles.testError,
                    ]}
                  >
                    {testResults.success ? '✓ Success' : '✗ Failed'}
                  </Text>
                </View>
                <View style={styles.testResultRow}>
                  <Text style={styles.testResultLabel}>Execution Time:</Text>
                  <Text style={styles.testResultValue}>
                    {testResults.executionTime}ms
                  </Text>
                </View>
                <View style={styles.testResultRow}>
                  <Text style={styles.testResultLabel}>Steps Executed:</Text>
                  <Text style={styles.testResultValue}>
                    {testResults.stepsExecuted}
                  </Text>
                </View>
                {testResults.testResults && (
                  <>
                    <View style={styles.testResultRow}>
                      <Text style={styles.testResultLabel}>Customers Matched:</Text>
                      <Text style={styles.testResultValue}>
                        {testResults.testResults.customersMatched}
                      </Text>
                    </View>
                    <View style={styles.testResultRow}>
                      <Text style={styles.testResultLabel}>Actions Triggered:</Text>
                      <Text style={styles.testResultValue}>
                        {testResults.testResults.actionsTriggered}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTestModal(false)}
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
  workflowList: {
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
  workflowScroll: {
    flex: 1,
  },
  workflowCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  workflowCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF2FF',
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextDraft: {
    color: '#D97706',
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
  workflowActions: {
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
  actionButtonActive: {
    backgroundColor: '#D1FAE5',
  },
  actionButtonTextActive: {
    color: '#059669',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
  workflowCanvas: {
    flex: 1,
    padding: 20,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  canvasTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  canvasSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  canvasActions: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  addNodeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addNodeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  canvasScroll: {
    flex: 1,
  },
  emptyCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCanvasText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  emptyCanvasButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCanvasButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nodesContainer: {
    padding: 20,
  },
  node: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nodeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nodeType: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nodeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  nodeDelete: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '600',
  },
  nodeBody: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  nodeConfigLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  nodeConfigItem: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
  },
  nodeConnections: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  nodeConnectionsText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  statsSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyWorkflow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWorkflowText: {
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  libraryIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  libraryItemInfo: {
    flex: 1,
  },
  libraryItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  libraryItemType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  testResultsContainer: {
    marginBottom: 20,
  },
  testResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  testResultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  testResultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  testSuccess: {
    color: '#059669',
  },
  testError: {
    color: '#DC2626',
  },
});
