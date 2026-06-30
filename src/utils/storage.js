
import { MMKV } from 'react-native-mmkv';

let storageInstance = null;
let memoryHistory = [];
const memoryListeners = new Set();

try {
    storageInstance = new MMKV();
} catch (error) {
    console.warn('MMKV storage init failed:', error);
}

export const storage = storageInstance;

const notifyHistoryListeners = () => {
    memoryListeners.forEach(listener => listener());
};

export const addHistoryListener = (listener) => {
    memoryListeners.add(listener);

    const mmkvListener =
        storage && typeof storage.addOnChangeListener === 'function'
            ? storage.addOnChangeListener(changedKey => {
                if (!changedKey || changedKey === 'history') {
                    listener();
                }
            })
            : null;

    return {
        remove: () => {
            memoryListeners.delete(listener);
            mmkvListener?.remove?.();
        },
    };
};

export const saveMeetingData = (data, transcript = '') => {
    const historyItem = {
        id: Date.now(),
        content: data,
        transcript,
    };

    if (!storage) {
        memoryHistory = [historyItem, ...memoryHistory];
        notifyHistoryListeners();
        console.warn('MMKV storage unavailable. Meeting saved in memory for this app session only.');
        return true;
    }

    try {
        const existingData = storage.getString('history');
        const history = existingData ? JSON.parse(existingData) : [];
        const updatedHistory = [historyItem, ...history];
        storage.set('history', JSON.stringify(updatedHistory));
        memoryHistory = updatedHistory;
        notifyHistoryListeners();
        return true;
    } catch (error) {
        console.warn('Failed to save meeting data:', error);
        memoryHistory = [historyItem, ...memoryHistory];
        notifyHistoryListeners();
        return false;
    }
};

export const getHistory = () => {
    if (!storage) return memoryHistory;

    try {
        const data = storage.getString('history');
        const history = data ? JSON.parse(data) : memoryHistory;
        memoryHistory = history;
        return history;
    } catch (error) {
        console.warn('Failed to load meeting history:', error);
        return memoryHistory;
    }
};
