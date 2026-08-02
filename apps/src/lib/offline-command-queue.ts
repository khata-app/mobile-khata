import { getItem, removeItem, setItem } from './storage';

export type OfflineCommand = {
  id: string;
  kind: 'post-voucher';
  payload: unknown;
  createdAt: string;
};

const KEY = 'khata.offline.commands.v1';

export const readOfflineCommands = (): OfflineCommand[] => getItem<OfflineCommand[]>(KEY) ?? [];

export async function enqueueOfflineCommand(command: Omit<OfflineCommand, 'id' | 'createdAt'>) {
  const next = [...readOfflineCommands(), { ...command, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
  await setItem(KEY, next);
}

export async function removeOfflineCommand(id: string) {
  const next = readOfflineCommands().filter(command => command.id !== id);
  if (next.length) await setItem(KEY, next);
  else await removeItem(KEY);
}
