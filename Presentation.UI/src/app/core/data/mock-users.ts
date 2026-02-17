import { User } from '../models';

/**
 * Mock Users for Testing
 * These users can be used to login and test the application without backend
 */

export interface MockUser {
  email: string;
  password: string;
  user: User;
}

export const MOCK_USERS: MockUser[] = [
  {
    email: 'admin@medipos.com',
    password: 'Admin@123',
    user: {
      id: '1',
      userName: 'admin',
      email: 'admin@medipos.com',
      userFName: 'System',
      userLName: 'Administrator',
      mobile: '+880-1712-000001',
      isActive: true,
      roles: ['Admin', 'SystemAdmin'],
      branchId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  },
  {
    email: 'doctor@medipos.com',
    password: 'Doctor@123',
    user: {
      id: '2',
      userName: 'doctor',
      email: 'doctor@medipos.com',
      userFName: 'Dr. Ahmed',
      userLName: 'Rahman',
      mobile: '+880-1712-000002',
      isActive: true,
      roles: ['Doctor'],
      branchId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  },
  {
    email: 'organization@medipos.com',
    password: 'Org@123',
    user: {
      id: '3',
      userName: 'organization',
      email: 'organization@medipos.com',
      userFName: 'Medical',
      userLName: 'Center',
      mobile: '+880-1712-000003',
      isActive: true,
      roles: ['Organization', 'Company'],
      branchId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  }
];

/**
 * Find mock user by email or username
 */
export function findMockUser(emailOrUsername: string, password: string): MockUser | null {
  return MOCK_USERS.find(
    mockUser => 
      (mockUser.email.toLowerCase() === emailOrUsername.toLowerCase() || 
       mockUser.user.userName.toLowerCase() === emailOrUsername.toLowerCase()) &&
      mockUser.password === password
  ) || null;
}

/**
 * Generate mock JWT token (for testing purposes only)
 */
export function generateMockToken(userId: string): string {
  // Simple base64 encoded token for mock purposes
  const payload = {
    sub: userId,
    email: MOCK_USERS.find(u => u.user.id === userId)?.email || '',
    roles: MOCK_USERS.find(u => u.user.id === userId)?.user.roles || [],
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };
  return btoa(JSON.stringify(payload));
}
