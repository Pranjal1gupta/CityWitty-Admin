export interface IReadStatus {
  target_id: string;
  target_type: "user" | "merchant" | "franchise";
  read: boolean;
  read_at?: Date | null;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "alert" | "update" | "promotion" | "warning";
  status: "draft" | "sent" | "unsent";
  target_audience: "user" | "merchant" | "franchise" | "all";
  target_ids?: string[];
  icon?: string;
  is_read: IReadStatus[];
  additional_field?: Record<string, any>;
  expires_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  total: number;
  byType: Record<string, number>;
  unread: number;
}

export type ModalType = "view" | "edit" | "delete" | "create" | null;
