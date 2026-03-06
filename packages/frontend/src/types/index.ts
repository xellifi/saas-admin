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
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: Record<string, boolean>;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
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

export interface Plan {
  id: number;
  name: string;
  description?: string;
  price: string;
  currency: string;
  billingCycle: string;
  features: string[] | Record<string, any>;
  isActive: boolean;
  maxUsers: number;
  currentUsers?: number;
  maxStorage: number;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Addon {
  id: number;
  name: string;
  folderName?: string;
  version: string;
  description?: string;
  author?: string;
  category?: string;
  icon?: string;
  manifest: AddonManifest;
  isEnabled: boolean;
  isInstalled: boolean;
  installedAt?: string;
  installPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddonManifest {
  name: string;
  displayName?: string;
  version: string;
  description?: string;
  author?: string;
  category?: string;
  icon?: string;
  main?: string;
  sidebar?: {
    icon?: string;
    position?: number;
    items?: {
      title: string;
      href: string;
      icon?: string;
      permission?: string;
    }[];
  };
  frontend?: {
    routes?: {
      path: string;
      label: string;
      icon?: string;
    }[];
  };
  routes?: {
    path: string;
    component: string;
    roles: string[];
  }[];
  permissions?: string[];
  dbTables?: string[];
  dependencies?: string[];
  database?: {
    migrations?: string[];
  };
  'saas-dashboard'?: any;
}


export interface Setting {
  id: number;
  key: string;
  value?: string;
  type: string;
  category: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPlans: number;
  totalRevenue: number;
  recentActivity: Array<{
    id: number;
    action: string;
    resource: string;
    timestamp: string;
    user: string;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: string[];
  children?: SidebarItem[];
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}
