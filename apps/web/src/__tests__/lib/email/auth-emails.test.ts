jest.mock('@/lib/email/service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ id: 'msg-1' }),
}));

jest.mock('@/lib/features/flags', () => ({
  getFeatureFlag: jest.fn(),
}));

jest.mock('@/emails/templates/Welcome', () => ({
  Welcome: () => null,
}));

jest.mock('@/emails/templates/Reengagement', () => ({
  Reengagement: () => null,
}));

import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeEmail,
  sendReengagementEmail,
} from '@/lib/email/auth-emails';
import { sendEmail } from '@/lib/email/service';
import { getFeatureFlag } from '@/lib/features/flags';

const mockGetFeatureFlag = getFeatureFlag as jest.MockedFunction<typeof getFeatureFlag>;
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sendWelcomeEmail', () => {
  it('sends email when feature enabled', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    await sendWelcomeEmail('user@test.com');
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Welcome to Siza',
      })
    );
  });

  it('skips when feature disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    await sendWelcomeEmail('user@test.com');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

describe('sendVerificationEmail', () => {
  it('sends email with token URL', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    await sendVerificationEmail('user@test.com', 'token-123');
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Verify your email - Siza',
      })
    );
  });

  it('skips when feature disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    await sendVerificationEmail('user@test.com', 'token-123');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

describe('sendPasswordResetEmail', () => {
  it('sends reset email when enabled', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    await sendPasswordResetEmail('user@test.com', 'reset-token');
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Reset your password - Siza',
      })
    );
  });

  it('skips when feature disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    await sendPasswordResetEmail('user@test.com', 'reset-token');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

describe('sendReengagementEmail', () => {
  it('sends reengagement email when enabled', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    await sendReengagementEmail('user@test.com', 'Alice');
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Your first AI component is one click away',
      })
    );
  });

  it('sends without firstName', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    await sendReengagementEmail('user@test.com');
    expect(mockSendEmail).toHaveBeenCalled();
  });

  it('skips when feature disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    await sendReengagementEmail('user@test.com');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

describe('sendEmailChangeEmail', () => {
  it('sends email change confirmation', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    await sendEmailChangeEmail('user@test.com', 'new@test.com', 'change-token');
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Confirm your new email - Siza',
      })
    );
  });

  it('skips when feature disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    await sendEmailChangeEmail('user@test.com', 'new@test.com', 'change-token');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
