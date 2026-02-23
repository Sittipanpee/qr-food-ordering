/**
 * Notification utilities for admin and customer notifications
 */

// ============================================================================
// ADMIN NOTIFICATIONS (Sound alerts for new orders)
// ============================================================================

/**
 * Play notification sound using Web Audio API
 * Creates a pleasant "ding" sound without requiring audio files
 */
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create oscillator for the "ding" sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound (pleasant notification tone)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High pitch
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1); // Sweep down

    // Volume envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5); // Decay

    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

/**
 * Play a double beep for urgent notifications
 */
export function playUrgentNotificationSound(): void {
  playNotificationSound();
  setTimeout(() => playNotificationSound(), 200);
}

// ============================================================================
// CUSTOMER NOTIFICATIONS (Browser push notifications)
// ============================================================================

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

/**
 * Request notification permission from user
 * @returns Promise<boolean> - true if granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  // Already granted
  if (Notification.permission === 'granted') {
    return true;
  }

  // Already denied
  if (Notification.permission === 'denied') {
    return false;
  }

  // Request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Send a browser notification
 */
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
  onClick?: () => void;
}

export function sendNotification(options: NotificationOptions): Notification | null {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/logo.png',
      badge: options.badge,
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      data: options.data,
    });

    // Handle click event
    if (options.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    // Auto-close after 10 seconds if not requireInteraction
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

// ============================================================================
// PREDEFINED NOTIFICATIONS
// ============================================================================

/**
 * Send notification for new order (Admin)
 */
export function notifyNewOrder(orderNumber: string): void {
  playNotificationSound();

  sendNotification({
    title: '🔔 ออเดอร์ใหม่เข้ามาแล้ว!',
    body: `มีออเดอร์ใหม่: ${orderNumber}`,
    tag: 'new-order',
    requireInteraction: true,
    onClick: () => {
      // Navigate to orders page
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/orders';
      }
    },
  });
}

/**
 * Send notification when order is ready (Customer)
 */
export function notifyOrderReady(orderNumber: string, queueNumber?: number): void {
  const body = queueNumber
    ? `คิวที่ ${queueNumber} - ออเดอร์ของคุณพร้อมแล้ว! กรุณามารับที่ร้าน`
    : `ออเดอร์ ${orderNumber} พร้อมเสิร์ฟแล้ว!`;

  sendNotification({
    title: '✅ ออเดอร์พร้อมแล้ว!',
    body,
    tag: `order-ready-${orderNumber}`,
    requireInteraction: true,
    silent: false,
  });

  // Also play sound
  playUrgentNotificationSound();
}

/**
 * Send notification when order status changes (Customer)
 */
export function notifyOrderStatusChange(
  orderNumber: string,
  status: string,
  statusText: string
): void {
  const statusEmoji: Record<string, string> = {
    confirmed: '✅',
    preparing: '👨‍🍳',
    ready: '🎉',
    completed: '✔️',
    cancelled: '❌',
  };

  sendNotification({
    title: `${statusEmoji[status] || '📦'} สถานะออเดอร์อัพเดต`,
    body: `ออเดอร์ ${orderNumber}: ${statusText}`,
    tag: `order-status-${orderNumber}`,
    silent: status === 'confirmed', // Silent for confirmed, sound for others
  });

  // Play sound for important status changes
  if (status === 'ready') {
    playUrgentNotificationSound();
  } else if (status !== 'confirmed') {
    playNotificationSound();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test notification (for settings page)
 */
export async function testNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermission();

  if (hasPermission) {
    playNotificationSound();
    sendNotification({
      title: '🔔 ทดสอบการแจ้งเตือน',
      body: 'ระบบแจ้งเตือนทำงานปกติ!',
      tag: 'test-notification',
    });
  } else {
    alert('ไม่สามารถแจ้งเตือนได้ กรุณาอนุญาตการแจ้งเตือนในเบราว์เซอร์');
  }
}

/**
 * Show notification permission prompt with custom UI
 */
export function showNotificationPrompt(): boolean {
  if (!isNotificationSupported()) {
    return false;
  }

  const permission = Notification.permission;

  if (permission === 'denied') {
    alert(
      'การแจ้งเตือนถูกปิดใช้งาน\n\n' +
      'กรุณาเปิดใช้งานใน:\n' +
      '1. คลิกไอคอนกุญแจ/โล๊คข้าง URL\n' +
      '2. เลือก Notifications → Allow'
    );
    return false;
  }

  return true;
}
