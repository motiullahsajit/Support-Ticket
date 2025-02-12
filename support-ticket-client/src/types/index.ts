export type UserRole = 'user' | 'executive' | 'admin';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  image_url: string | null;
  role: UserRole;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: 'open' | 'resolved' | 'closed';
  customer_id: number;
  executive_id: number | null;
  created_at: string;
  updated_at: string;
}