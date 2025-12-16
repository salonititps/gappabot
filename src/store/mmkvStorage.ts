import MMKVStorage from 'react-native-mmkv-storage';
import type { PersistStorage } from 'zustand/middleware';

const MMKV = new MMKVStorage.Loader().initialize();

export const mmkvZustandStorage: PersistStorage<any> = {
  getItem: (name: string) => {
    const value = MMKV.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    MMKV.setString(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    MMKV.removeItem(name);
  },
};
