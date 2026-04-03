/**
 * DAG 详情页布局
 * 阻止继承父 layout，直接渲染 children
 */

export default function DAGDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}