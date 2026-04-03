/**
 * UI 组件导出索引
 * 所有基础 UI 组件统一导出
 */

export { PageBreadcrumb, type BreadcrumbItem } from "./PageBreadcrumb";
export { StatusBadge, SensitivityBadge, type StatusType, type SensitivityLevel } from "./StatusBadge";
export { FilterBar, type FilterItem } from "./FilterBar";
export { DirectoryTree, type DirectoryTreeNode, type ContextMenuItem } from "./DirectoryTree";
export { CardGrid, type CardGridItem } from "./CardGrid";
export { KPICard, KPICardGrid, KPICardRow, type KPICardData, type KPITrend } from "./KPICard";
export { TabsLayout, TabsLayoutWithBreadcrumb, type TabConfig } from "./TabsLayout";
export { DataTable, createStandardActions, STANDARD_ACTIONS, type TableActionItem, type TableColumnConfig } from "./DataTable";
export { ModalForm, type FormFieldConfig as ModalFormFieldConfig } from "./ModalForm";

// 多步骤表单组件
export {
  MultiStepForm,
  createMultiStepForm,
  type StepConfig,
  type FormFieldConfig,
  type MultiStepFormProps,
} from "./MultiStepForm";

// 空状态组件
export {
  EmptyState,
  EmptyData,
  EmptyPermission,
  EmptySearch,
  EmptyNetworkError,
  type EmptyStateScenario,
} from "./EmptyState";

// 加载状态组件
export {
  LoadingState,
  PageLoadingSkeleton,
  TableLoadingSkeleton,
  ListLoadingSkeleton,
  ButtonSpinner,
  FullscreenLoading,
  type LoadingType,
  type SkeletonVariant,
} from "./LoadingState";