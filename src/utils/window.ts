import { getCurrentWindow } from '@tauri-apps/api/window';

export const hideWindow = () => {
  const window = getCurrentWindow();
  window.hide();
};

export const showWindow = () => {
  const window = getCurrentWindow();
  window.show();
};
