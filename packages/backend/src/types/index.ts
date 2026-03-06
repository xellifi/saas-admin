export interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  status: 'active' | 'blocked';
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: Omit<User, 'hashedPassword'>;
  accessToken: string;
  refreshToken: string;
}

export interface Plan {
  id: number;
  name: string;
  description?: string;
  price: string;
  currency: string;
  billingCycle: string;
  features: any;
  isActive: boolean;
  maxUsers: number;
  maxStorage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  userId: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Addon {
  id: number;
  name: string;
  version: string;
  description?: string;
  author?: string;
  manifest: any;
  isEnabled: boolean;
  isInstalled: boolean;
  installPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Setting {
  id: number;
  key: string;
  value?: string;
  type: string;
  category: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: number;
  userId?: number;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'upload';
  resource: string;
  resourceId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AddonManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  main?: string;
  routes?: {
    path: string;
    component: string;
    roles: string[];
  }[];
  permissions?: string[];
  dependencies?: string[];
  database?: {
    migrations?: string[];
  };
}
