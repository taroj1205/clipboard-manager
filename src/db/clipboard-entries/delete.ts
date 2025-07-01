import { emit } from '@tauri-apps/api/event';
import { db } from '~/db';

export const deleteAllClipboardEntries = async () => {
  await db.execute('DELETE FROM clipboard_entries');
  emit('clipboard-entry-updated');
};
