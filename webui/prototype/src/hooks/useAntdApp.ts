"use client";

/**
 * Antd App Hooks
 * 提供基于 App 组件上下文的 message、notification、modal 实例
 * 解决静态方法调用警告问题
 */

import { App } from "antd";

/**
 * 获取 antd message 实例的 Hook
 * 用于替代静态方法调用 message.success() 等
 */
export function useMessage() {
  const { message } = App.useApp();
  return message;
}

/**
 * 获取 antd notification 实例的 Hook
 * 用于替代静态方法调用 notification.success() 等
 */
export function useNotification() {
  const { notification } = App.useApp();
  return notification;
}

/**
 * 获取 antd modal 实例的 Hook
 * 用于替代静态方法调用 Modal.confirm() 等
 */
export function useModal() {
  const { modal } = App.useApp();
  return modal;
}