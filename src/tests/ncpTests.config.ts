export interface NCPTestCase {
  id: string;
  name: string;
  category: 'Health' | 'Auth' | 'Translation' | 'Perception' | 'Radar' | 'Debt' | 'Chat' | 'Languages';
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  headers?: Record<string, string>;
  payload?: any;
  expectedStatus: number;
  validator?: (data: any, status: number) => { pass: boolean; error?: string };
}

export const NCP_TEST_SUITE: NCPTestCase[] = [
  // 1. Health
  {
    id: 'ncp-health-01',
    name: 'Server Health & Diagnostics',
    category: 'Health',
    description: 'Verifies the core Express server responds with status ok and timestamp.',
    endpoint: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.status === 'ok' && !!data.service,
      error: !data.status ? 'Health status field missing' : undefined,
    }),
  },

  // 2. Auth Endpoints
  {
    id: 'ncp-auth-01',
    name: 'User Registration Flow',
    category: 'Auth',
    description: 'Registers a new user account and returns JWT token + user profile.',
    endpoint: '/api/auth/register',
    method: 'POST',
    payload: {
      username: 'Test Analyst',
      email: 'test.analyst@linguachat.ai',
      password: 'SecurePassword123!',
      preferredLanguage: 'ta',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && !!data.token && !!data.user?.userId,
      error: !data.token ? 'JWT token missing from register response' : undefined,
    }),
  },
  {
    id: 'ncp-auth-02',
    name: 'User Login & JWT Issuance',
    category: 'Auth',
    description: 'Authenticates existing user credentials and generates valid session token.',
    endpoint: '/api/auth/login',
    method: 'POST',
    payload: {
      email: 'alex.chen@linguachat.ai',
      password: 'password123',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && !!data.token && data.user?.email === 'alex.chen@linguachat.ai',
      error: !data.token ? 'Login token missing' : undefined,
    }),
  },
  {
    id: 'ncp-auth-03',
    name: 'Social OAuth Sign-In',
    category: 'Auth',
    description: 'Verifies Google/GitHub OAuth identity integration.',
    endpoint: '/api/auth/signin',
    method: 'POST',
    payload: {
      provider: 'google',
      token: 'oauth_mock_verify_token',
      email: 'alex.oauth@gmail.com',
      name: 'Alex Google',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && !!data.token,
      error: !data.success ? 'OAuth signin returned failure' : undefined,
    }),
  },
  {
    id: 'ncp-auth-04',
    name: 'JWT Session Verification',
    category: 'Auth',
    description: 'Validates authorization header Bearer token authenticity.',
    endpoint: '/api/auth/verify',
    method: 'GET',
    headers: {
      Authorization: 'Bearer jwt_mock_token_linguachat_test',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.valid === true && !!data.user,
      error: !data.valid ? 'Token verification returned invalid' : undefined,
    }),
  },

  // 3. Translation Endpoints
  {
    id: 'ncp-trans-01',
    name: 'Single Text Translation Engine',
    category: 'Translation',
    description: 'Translates source text into target language with confidence and key terms.',
    endpoint: '/api/translate',
    method: 'POST',
    payload: {
      text: 'Good morning team! We are launching the multilingual AI interface today.',
      targetLanguage: 'es',
      sourceLanguage: 'en',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && !!data.translatedText && data.confidenceScore > 0,
      error: !data.translatedText ? 'Translation text output empty' : undefined,
    }),
  },
  {
    id: 'ncp-trans-02',
    name: 'Batch Text Translation',
    category: 'Translation',
    description: 'Translates multiple strings in parallel with high throughput.',
    endpoint: '/api/translate/batch',
    method: 'POST',
    payload: {
      texts: ['Hello world', 'Welcome to the platform', 'Ready for deployment'],
      targetLanguage: 'fr',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && Array.isArray(data.translations) && data.translations.length === 3,
      error: !data.translations ? 'Batch translations array missing' : undefined,
    }),
  },
  {
    id: 'ncp-trans-03',
    name: 'Echo Mode Semantic Back-Translation',
    category: 'Translation',
    description: 'Performs bidirectional translation to evaluate semantic fidelity score.',
    endpoint: '/api/translate/echo',
    method: 'POST',
    payload: {
      text: 'The architecture handles zero packet loss during network handover.',
      targetLanguage: 'de',
      sourceLanguage: 'en',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass:
        data.success === true &&
        data.echoResult?.fidelityScore >= 0 &&
        !!data.echoResult?.backTranslatedText,
      error: !data.echoResult?.fidelityScore ? 'Echo fidelity score missing' : undefined,
    }),
  },
  {
    id: 'ncp-trans-04',
    name: 'Zero-Shot Language Detection',
    category: 'Translation',
    description: 'Detects natural language and script of incoming user text.',
    endpoint: '/api/translate/detect',
    method: 'POST',
    payload: {
      text: 'Bonjour tout le monde, comment allez-vous aujourd hui?',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && data.language === 'fr',
      error: data.language !== 'fr' ? `Expected "fr", received "${data.language}"` : undefined,
    }),
  },
  {
    id: 'ncp-trans-05',
    name: 'Supported Languages Catalogue',
    category: 'Languages',
    description: 'Fetches comprehensive ISO-639 catalog with 100+ languages.',
    endpoint: '/api/languages',
    method: 'GET',
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && Array.isArray(data.languages) && data.languages.length >= 10,
      error: !data.languages ? 'Language catalogue empty' : undefined,
    }),
  },

  // 4. Perception & Tone Analysis
  {
    id: 'ncp-perception-01',
    name: 'Sentiment & Tone Perception Preview',
    category: 'Perception',
    description: 'Computes politeness, formality, urgency, and emoji sentiment ratings.',
    endpoint: '/api/perception/analyze',
    method: 'POST',
    payload: {
      text: 'Could you please review the attached contract at your earliest convenience?',
      targetLanguage: 'en',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass:
        data.success === true &&
        data.perception?.sentimentLabel &&
        data.perception?.toneDetails?.politeness >= 50,
      error: !data.perception ? 'Perception result payload missing' : undefined,
    }),
  },

  // 5. Code-Switch Radar
  {
    id: 'ncp-radar-01',
    name: 'Token-Level Code-Switching Radar',
    category: 'Radar',
    description: 'Detects token transitions across languages in mixed multilingual speech.',
    endpoint: '/api/radar/analyze',
    method: 'POST',
    payload: {
      text: 'Hey buddy, romba thanks for your help in the project!',
      messageId: 'msg_test_radar_101',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass:
        data.success === true &&
        data.radarData?.isCodeMixed === true &&
        Array.isArray(data.radarData?.tokens),
      error: !data.radarData?.tokens ? 'Radar token breakdown missing' : undefined,
    }),
  },

  // 6. Translation Debt Ledger
  {
    id: 'ncp-debt-01',
    name: '5-Weight Translation Debt Ledger Formula',
    category: 'Debt',
    description: 'Calculates overall debt score, severity risk, and remediation category.',
    endpoint: '/api/debt/calculate',
    method: 'POST',
    payload: {
      originalMessage: 'நன்றி நண்பா',
      aiTranslation: 'Thank you friend',
      confidenceScore: 70,
      correctionCount: 2,
      isAuditApproved: false,
      codeSwitchComplexity: 60,
      hoursSinceReview: 8,
      sourceLanguage: 'ta',
      targetLanguage: 'en',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass:
        data.success === true &&
        typeof data.debtItem?.debtScore === 'number' &&
        data.debtItem?.debtScore >= 0 &&
        !!data.debtItem?.debtCategory,
      error: !data.debtItem?.debtScore ? 'Debt calculation score missing' : undefined,
    }),
  },

  // 7. Chat Endpoints
  {
    id: 'ncp-chat-01',
    name: 'Fetch User Conversations',
    category: 'Chat',
    description: 'Retrieves all 1-on-1 and group chat threads for the user.',
    endpoint: '/api/chats',
    method: 'GET',
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && Array.isArray(data.chats),
      error: !Array.isArray(data.chats) ? 'Chats array missing' : undefined,
    }),
  },
  {
    id: 'ncp-chat-02',
    name: 'Create New Conversation Thread',
    category: 'Chat',
    description: 'Creates a new group or 1-on-1 chat room.',
    endpoint: '/api/chats',
    method: 'POST',
    payload: {
      name: 'NCP Integration Testing Group',
      isGroup: true,
      participantIds: ['usr_me', 'usr_priya'],
      languages: ['en', 'ta', 'es'],
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && !!data.chat?.id,
      error: !data.chat?.id ? 'Created chat id missing' : undefined,
    }),
  },
  {
    id: 'ncp-chat-03',
    name: 'Send Real-time Multilingual Message',
    category: 'Chat',
    description: 'Sends and translates message in chat with Socket.io broadcast dispatch.',
    endpoint: '/api/chats/grp_global_project/messages',
    method: 'POST',
    payload: {
      text: 'NCP Automated Test Packet #8892',
      senderId: 'usr_me',
      senderName: 'Alex Chen',
      targetLanguage: 'es',
    },
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && !!data.message?.messageId,
      error: !data.message?.messageId ? 'MessageId missing from response' : undefined,
    }),
  },
  {
    id: 'ncp-chat-04',
    name: 'Retrieve Message History with Translations',
    category: 'Chat',
    description: 'Loads historical chat messages with translation metadata.',
    endpoint: '/api/chats/grp_global_project/messages',
    method: 'GET',
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && Array.isArray(data.messages),
      error: !Array.isArray(data.messages) ? 'Messages array missing' : undefined,
    }),
  },
  {
    id: 'ncp-chat-05',
    name: 'Search Chat Message Logs',
    category: 'Chat',
    description: 'Searches message text across all chats.',
    endpoint: '/api/chats/search?q=Titan',
    method: 'GET',
    expectedStatus: 200,
    validator: (data) => ({
      pass: data.success === true && Array.isArray(data.results),
      error: !Array.isArray(data.results) ? 'Search results array missing' : undefined,
    }),
  },
];
