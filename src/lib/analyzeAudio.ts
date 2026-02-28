import * as Comlink from 'comlink';
import { AnalysisResult } from "@/types/chordAI";

export type AnalyzeTrackResult = AnalysisResult;

// Define the worker type based on what we exposed in audioAnalysisWorker.ts
export interface AudioAnalysisWorker {
  analyzeAudioBuffer(channelData: Float32Array, sampleRate: number, duration: number): Promise<AnalysisResult>;
}

export async function analyzeTrack(audioBuffer: AudioBuffer): Promise<AnalyzeTrackResult> {
  try {
    // 1. Get the Raw Audio Data on the Main Thread (cannot offload AudioBuffer decoding!)
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    // 2. Instantiate the Worker
    // We use Vite's ?worker syntax to bundle it properly
    const worker = new Worker(new URL('../workers/audioAnalysisWorker.ts', import.meta.url), {
      type: 'module',
    });

    // 3. Wrap it in Comlink
    const analysisWorker = Comlink.wrap<AudioAnalysisWorker>(worker);

    // 4. Call the worker, passing the Float32Array
    // Since we are not transferring ownership (channel data is tiny overall), we can just pass it directly.
    const result = await analysisWorker.analyzeAudioBuffer(channelData, sampleRate, duration);

    // 5. Clean up worker thread
    worker.terminate();

    return result;
  } catch (err) {
    console.error("analyzeTrack failed to run on worker", err);
    // Return a safe fallback instead of throwing so UI can continue
    return {
      tempo: 0,
      meter: 4,
      key: "--",
      scale: "--",
      chords: [],
      simpleChords: [],
    };
  }
}

