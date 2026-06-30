import { create } from 'zustand';
import { generateContent } from '../api/groqApi';
import { saveMeetingData } from '../utils/storage';

export const useMeetingStore = create((set) => ({
  transcript: '',
  analysis: null,
  isLoading: false,
  error: null,

  setTranscript: (text) => set({ transcript: text }),

  processMeeting: async (nextTranscript) => {
    const transcript = nextTranscript || useMeetingStore.getState().transcript;
    if (!transcript.trim()) return;

    set({ isLoading: true, error: null });
    
    try {
      const result = await generateContent(transcript);

      const isSaved = saveMeetingData(result, transcript);
      console.log('Meeting history save status:', isSaved ? 'saved' : 'fallback/failed');
      set({ transcript, analysis: result, isLoading: false });
    } catch (error) {
      set({
        error: error?.message || 'Failed to process transcript',
        isLoading: false,
      });
    }
  },

  setAnalysis: (analysis) => set({ analysis }),

  clearData: () => set({ transcript: '', analysis: null, error: null })
}));

