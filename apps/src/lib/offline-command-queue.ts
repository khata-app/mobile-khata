import { getItem, removeItem, setItem } from './storage';

export type OfflineCommandKind = 'post-voucher' | 'record-write' | 'record-delete';

export type OfflineCommandStatus = 'pending' | 'processing' | 'failed';

export type OfflineCommand = {
  id: string;
  kind: OfflineCommandKind;
  payload: unknown;
  createdAt: string;
  attempts: number;
  status: OfflineCommandStatus;
  lastError?: string;
};

const KEY = 'khata.offline.commands.v1';

export const readOfflineCommands = (): OfflineCommand[] => {
  const stored = getItem<Partial<OfflineCommand>[]>(KEY) ?? [];
  return stored.map(command => ({
    id: command.id || fallbackId(),
    kind: command.kind || 'record-write',
    payload: command.payload,
    createdAt: command.createdAt || new Date().toISOString(),
    attempts: command.attempts || 0,
    status: command.status || 'pending',
    ...(command.lastError ? { lastError: command.lastError } : {}),
  }));
};

function fallbackId() {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function commandId() {
  return globalThis.crypto?.randomUUID?.() || fallbackId();
}

export async function enqueueOfflineCommand(command: Omit<OfflineCommand, 'id' | 'createdAt' | 'attempts' | 'status'>) {
  const next = [...readOfflineCommands(), { ...command, id: commandId(), createdAt: new Date().toISOString(), attempts: 0, status: 'pending' as const }];
  await setItem(KEY, next);
  return next.at(-1)!.id;
}

export async function updateOfflineCommand(id: string, update: Partial<Pick<OfflineCommand, 'attempts' | 'status' | 'lastError'>>) {
  const next = readOfflineCommands().map(command => command.id === id ? { ...command, ...update } : command);
  if (next.length) await setItem(KEY, next);
}

export async function drainOfflineCommands(handler: (command: OfflineCommand) => Promise<void>) {
  for (const command of readOfflineCommands()) {
    if (command.status === 'processing') command.status = 'pending';
    if (command.status !== 'pending' && command.status !== 'failed') continue;
    await updateOfflineCommand(command.id, { status: 'processing', attempts: command.attempts + 1, lastError: undefined });
    try {
      await handler(command);
      await removeOfflineCommand(command.id);
    } catch (error) {
      await updateOfflineCommand(command.id, { status: 'failed', lastError: error instanceof Error ? error.message : 'Command failed' });
    }
  }
}

export async function removeOfflineCommand(id: string) {
  const next = readOfflineCommands().filter(command => command.id !== id);
  if (next.length) await setItem(KEY, next);
  else await removeItem(KEY);
}
