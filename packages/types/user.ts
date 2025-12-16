// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserTenant {
  id: string;
  tenantId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}
