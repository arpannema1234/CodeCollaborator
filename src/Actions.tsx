type ActionType = 'join' | 'joined' | 'disconnected' | 'code-change' | 'sync-code' | 'leave';

export const ACTIONS = {
  JOIN: 'join',
  JOINED: 'joined',
  DISCONNECTED: 'disconnected',
  CODE_CHANGE: 'code-change',
  SYNC_CODE: 'sync-code',
  LEAVE: 'leave',
} as const;

export type Actions = typeof ACTIONS[keyof typeof ACTIONS];
