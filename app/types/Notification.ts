export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'update' | 'promotion' | 'warning';
  target_audience: 'user' | 'merchant' | 'franchise' | 'all';
  target_ids?: string[];
  icon?: string;
  expires_at?: Date;
  is_active: boolean;
  is_read: boolean | string[];
  created_at: Date;
  additional_field?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  byType: Record<string, number>;
  unread: number;
}

export type ModalType = 'view' | 'edit' | 'delete' | 'create';
