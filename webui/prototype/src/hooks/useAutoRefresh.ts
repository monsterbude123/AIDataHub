/**
 * 自动刷新 Hook
 * 基于 MASTER.md Dashboard Auto-Refresh 规范
 *
 * 功能：
 * - 可配置的刷新间隔
 * - 手动刷新支持
 * - 最后刷新时间显示
 * - 页面可见性检测（切换 tab 时暂停/恢复）
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface AutoRefreshOptions {
  /** 刷新间隔（毫秒），默认 30000 (30秒) */
  interval?: number;
  /** 是否启用，默认 true */
  enabled?: boolean;
  /** 页面不可见时是否暂停，默认 true */
  pauseOnHidden?: boolean;
  /** 刷新回调 */
  onRefresh: () => Promise<void> | void;
}

export interface AutoRefreshState {
  /** 是否正在刷新 */
  isRefreshing: boolean;
  /** 最后刷新时间 */
  lastRefreshTime: Date | null;
  /** 下次刷新倒计时（秒） */
  countdown: number;
  /** 手动刷新 */
  refresh: () => Promise<void>;
  /** 开始自动刷新 */
  start: () => void;
  /** 停止自动刷新 */
  stop: () => void;
  /** 是否正在运行 */
  isRunning: boolean;
}

/**
 * 自动刷新 Hook
 */
export function useAutoRefresh(options: AutoRefreshOptions): AutoRefreshState {
  const {
    interval = 30000,
    enabled = true,
    pauseOnHidden = true,
    onRefresh,
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isRunning, setIsRunning] = useState(enabled);

  // 使用 ref 存储定时器 ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 执行刷新
   */
  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefreshTime(new Date());
      setCountdown(Math.floor(interval / 1000));
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing, interval]);

  /**
   * 开始自动刷新
   */
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  /**
   * 停止自动刷新
   */
  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  /**
   * 设置刷新定时器
   */
  useEffect(() => {
    if (!isRunning || !enabled) {
      // 清除定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    // 初始刷新
    refresh();

    // 设置刷新定时器
    intervalRef.current = setInterval(() => {
      refresh();
    }, interval);

    // 设置倒计时定时器
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : Math.floor(interval / 1000)));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [isRunning, enabled, interval, refresh]);

  /**
   * 页面可见性检测
   */
  useEffect(() => {
    if (!pauseOnHidden) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面不可见，暂停刷新
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // 页面可见，恢复刷新并立即刷新一次
        if (isRunning && enabled) {
          refresh();
          intervalRef.current = setInterval(() => {
            refresh();
          }, interval);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pauseOnHidden, isRunning, enabled, interval, refresh]);

  return {
    isRefreshing,
    lastRefreshTime,
    countdown,
    refresh,
    start,
    stop,
    isRunning,
  };
}

/**
 * 格式化最后刷新时间
 */
export function formatLastRefreshTime(date: Date | null): string {
  if (!date) return "未刷新";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 10) return "刚刚";
  if (diffSeconds < 60) return `${diffSeconds}秒前`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}小时前`;

  return date.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}