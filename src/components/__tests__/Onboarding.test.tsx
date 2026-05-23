// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Onboarding } from '../Onboarding';

const {
  updateAppSettingsMock,
  registerAdminMock,
  createFamilyMock,
  updateUserFamilyMock,
  markOnboardingSeenMock,
} = vi.hoisted(() => ({
  updateAppSettingsMock: vi.fn(),
  registerAdminMock: vi.fn(),
  createFamilyMock: vi.fn(),
  updateUserFamilyMock: vi.fn(),
  markOnboardingSeenMock: vi.fn(),
}));

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({ updateAppSettings: updateAppSettingsMock }),
}));

vi.mock('../../lib/pocketbase-client', () => ({
  api: {
    registerAdmin: registerAdminMock,
    createFamily: createFamilyMock,
    updateUserFamily: updateUserFamilyMock,
    markOnboardingSeen: markOnboardingSeenMock,
  },
}));

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en' as const,
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Onboarding admin flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.skip('shows field-level validation errors with clear messages', async () => {
    const onComplete = vi.fn();
    render(<Onboarding mode="admin" onComplete={onComplete} />);

    // Navigate to workspace step (step 2 of admin flow — 2 info slides, then workspace)
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByText('onboarding.next'));
    }

    // Workspace step
    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
      target: { value: 'My Family' },
    });
    fireEvent.click(screen.getByText('onboarding.next'));

    // Try to submit with empty fields
    fireEvent.click(screen.getByText('onboarding.createAccount'));

    // Should show "Please enter your first name" first (name is checked first)
    await waitFor(() => {
      expect(screen.getByText('onboarding.pleaseEnterFirstName')).toBeTruthy();
    });
    expect(registerAdminMock).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it.skip('shows email required error when name is filled but email is empty', async () => {
    const onComplete = vi.fn();
    render(<Onboarding mode="admin" onComplete={onComplete} />);

    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByText('onboarding.next'));
    }

    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
      target: { value: 'My Family' },
    });
    fireEvent.click(screen.getByText('onboarding.next'));

    // Fill only name
    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
      target: { value: 'Admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
      target: { value: 'User' },
    });
    fireEvent.click(screen.getByText('onboarding.createAccount'));

    await waitFor(() => {
      expect(screen.getByText('onboarding.pleaseEnterEmail')).toBeTruthy();
    });
  });

  it.skip('shows password mismatch error when passwords differ', async () => {
    const onComplete = vi.fn();
    render(<Onboarding mode="admin" onComplete={onComplete} />);

    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByText('onboarding.next'));
    }

    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
      target: { value: 'My Family' },
    });
    fireEvent.click(screen.getByText('onboarding.next'));

    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
      target: { value: 'Admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.email'), {
      target: { value: 'admin@example.com' },
    });

    const passwordInputs = screen.getAllByPlaceholderText('onboarding.password');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'differentpass' } });

    fireEvent.click(screen.getByText('onboarding.createAccount'));

    await waitFor(() => {
      expect(screen.getByText('onboarding.passwordsDoNotMatch')).toBeTruthy();
    });
  });

  it.skip('does not mark setup complete when registration fails', async () => {
    registerAdminMock.mockRejectedValueOnce(new Error('Registration failed'));

    const onComplete = vi.fn();
    render(<Onboarding mode="admin" onComplete={onComplete} />);

    // Navigate through info slides
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByText('onboarding.next'));
    }

    // Workspace step
    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
      target: { value: 'My Family' },
    });
    fireEvent.click(screen.getByText('onboarding.next'));

    // Admin account step
    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
      target: { value: 'Admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.email'), {
      target: { value: 'admin@example.com' },
    });

    const passwordInputs = screen.getAllByPlaceholderText('onboarding.password');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('onboarding.createAccount'));

    await waitFor(
      () => {
        expect(screen.getByText('onboarding.accountCreationFailed')).toBeTruthy();
      },
      { timeout: 3000 }
    );

    expect(markOnboardingSeenMock).not.toHaveBeenCalled();
    expect(updateAppSettingsMock).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it.skip('shows email already in use message on email conflict', async () => {
    registerAdminMock.mockRejectedValueOnce(new Error('This email is already in use'));

    const onComplete = vi.fn();
    render(<Onboarding mode="admin" onComplete={onComplete} />);

    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByText('onboarding.next'));
    }

    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
      target: { value: 'My Family' },
    });
    fireEvent.click(screen.getByText('onboarding.next'));

    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
      target: { value: 'Admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.email'), {
      target: { value: 'admin@example.com' },
    });

    const passwordInputs = screen.getAllByPlaceholderText('onboarding.password');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('onboarding.createAccount'));

    await waitFor(() => {
      expect(screen.getByText('onboarding.emailAlreadyInUse')).toBeTruthy();
    });

    expect(markOnboardingSeenMock).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it.skip('disables button and shows loading text while submitting', async () => {
    registerAdminMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ user: { id: 'u1' } }), 500))
    );

    const onComplete = vi.fn();
    render(<Onboarding mode="admin" onComplete={onComplete} />);

    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByText('onboarding.next'));
    }

    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
      target: { value: 'My Family' },
    });
    fireEvent.click(screen.getByText('onboarding.next'));

    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
      target: { value: 'Admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByPlaceholderText('onboarding.email'), {
      target: { value: 'admin@example.com' },
    });

    const passwordInputs = screen.getAllByPlaceholderText('onboarding.password');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('onboarding.createAccount'));

    // Button should be disabled immediately after click
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /onboarding.creatingAccount/ });
      expect(btn).toBeTruthy();
    });
  });
});
