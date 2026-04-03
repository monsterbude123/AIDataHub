/**
 * 响应式断点检测 Hook
 * 基于 MASTER.md Grid System 断点定义
 *
 * 断点定义:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: 1024px - 1440px
 * - Large: > 1440px
 */

import { useState, useEffect } from "react";

export interface ResponsiveState {
  /** 是否为移动端 (< 768px) */
  isMobile: boolean;
  /** 是否为平板端 (768px - 1024px) */
  isTablet: boolean;
  /** 是否为桌面端 (1024px - 1440px) */
  isDesktop: boolean;
  /** 是否为大屏端 (> 1440px) */
  isLarge: boolean;
  /** 当前窗口宽度 */
  width: number;
  /** 当前窗口高度 */
  height: number;
}

/**
 * 响应式断点检测 Hook
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 初始化时检测
    const checkResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1440,
        isLarge: width >= 1440,
        width,
        height,
      });
    };

    // 初始检测
    checkResponsive();

    // 监听窗口大小变化
    window.addEventListener("resize", checkResponsive);

    return () => {
      window.removeEventListener("resize", checkResponsive);
    };
  }, []);

  return state;
}

/**
 * 获取响应式列数
 * 根据当前断点返回合适的网格列数
 */
export function useResponsiveColumns(): number {
  const { isMobile, isTablet, isDesktop, isLarge } = useResponsive();

  if (isMobile) return 1;
  if (isTablet) return 2;
  if (isDesktop) return 3;
  if (isLarge) return 4;
  return 3; // 默认
}

/**
 * 获取响应式间距
 * 根据当前断点返回合适的间距值
 */
export function useResponsiveGap(): number {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return 12; // spacing-3
  if (isTablet) return 16; // spacing-4
  return 24; // spacing-6 (desktop/large)
}