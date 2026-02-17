import { test, expect } from '@playwright/test';

test.describe('GB Account Frontend E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display loading screen initially', async ({ page }) => {
    // Check if loading screen is visible
    await expect(page.locator('text=HRM System')).toBeVisible();
    await expect(page.locator('text=Loading your workspace...')).toBeVisible();
  });

  test('should navigate to login page when not authenticated', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForTimeout(2000);
    
    // Should redirect to login page
    await expect(page).toHaveURL('/auth/login');
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    
    // Check if register page loads
    await expect(page.locator('text=Company Registration')).toBeVisible();
  });

  test('should display 404 page for invalid route', async ({ page }) => {
    await page.goto('/invalid-route');
    
    // Should show 404 page
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Find theme toggle button
    const themeToggle = page.locator('button[title*="theme"], button[title*="mode"]').first();
    
    if (await themeToggle.isVisible()) {
      // Click theme toggle
      await themeToggle.click();
      
      // Check if dark class is applied to html element
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveClass(/dark/);
    }
  });

  test('should display responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/login');
    
    // Check if mobile layout is applied
    await expect(page.locator('button[class*="lg:hidden"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // Check if desktop layout is applied
    await expect(page.locator('button[class*="lg:hidden"]')).not.toBeVisible();
  });

  test('should handle form submission with valid data', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill in valid credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show loading state
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should display error messages for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Check for error notification
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should navigate to dashboard after successful login', async ({ page }) => {
    // Mock successful login
    await page.goto('/auth/login');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Mock API response
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600,
            tokenType: 'Bearer'
          }
        })
      });
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/app/dashboard');
    
    // Check if dashboard elements are visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/app/dashboard');
    
    // Check if sidebar is visible
    await expect(page.locator('text=HRM System')).toBeVisible();
    
    // Check navigation items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Employees')).toBeVisible();
    await expect(page.locator('text=Leave Management')).toBeVisible();
  });

  test('should handle mobile menu toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/app/dashboard');
    
    // Find mobile menu button
    const mobileMenuButton = page.locator('button[class*="lg:hidden"]').first();
    
    if (await mobileMenuButton.isVisible()) {
      // Click mobile menu button
      await mobileMenuButton.click();
      
      // Check if mobile menu is visible
      await expect(page.locator('aside[class*="fixed"]')).toBeVisible();
    }
  });

  test('should display notifications', async ({ page }) => {
    await page.goto('/app/dashboard');
    
    // Find notification bell
    const notificationBell = page.locator('button[title*="notification"], button[title*="bell"]').first();
    
    if (await notificationBell.isVisible()) {
      // Click notification bell
      await notificationBell.click();
      
      // Check if notification panel is visible
      await expect(page.locator('text=Notifications')).toBeVisible();
    }
  });

  test('should handle user menu', async ({ page }) => {
    await page.goto('/app/dashboard');
    
    // Find user menu button
    const userMenuButton = page.locator('button[class*="user"], button[class*="profile"]').first();
    
    if (await userMenuButton.isVisible()) {
      // Click user menu button
      await userMenuButton.click();
      
      // Check if user menu is visible
      await expect(page.locator('text=Profile')).toBeVisible();
      await expect(page.locator('text=Settings')).toBeVisible();
      await expect(page.locator('text=Logout')).toBeVisible();
    }
  });
});

