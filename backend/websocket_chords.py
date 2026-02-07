"""
WebSocket endpoint for real-time chord streaming
"""

import base64

from fastapi import WebSocket, WebSocketDisconnect
import numpy as np
import librosa

# Chord detection setup
PITCH_CLASS_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

CHORD_TEMPLATES = []
for root in range(12):
    for name, intervals in {
        "maj": [0, 4, 7],
        "min": [0, 3, 7],
        "7": [0, 4, 7, 10],
        "maj7": [0, 4, 7, 11],
        "min7": [0, 3, 7, 10],
        "dim": [0, 3, 6],
        "aug": [0, 4, 8],
        "sus2": [0, 2, 7],
        "sus4": [0, 5, 7],
    }.items():
        v = np.zeros(12)
        for iv in intervals:
            v[(root + iv) % 12] = 1.0
        v[root] += 0.2  # Slight weight to root
        norm = np.linalg.norm(v)
        chord_name = f"{PITCH_CLASS_NAMES[root]}"
        if name != "maj":
            chord_name += f"{name}"
        CHORD_TEMPLATES.append((chord_name, v / (norm + 1e-9)))


def detect_chord_from_audio(audio_data: np.ndarray, sr: int = 22050) -> dict:
    """
    Detect chord from a short audio segment.
    
    Args:
        audio_data: Audio samples as numpy array
        sr: Sample rate
        
    Returns:
        Dict with chord name and confidence
    """
    if len(audio_data) < sr * 0.1:  # Less than 100ms
        return {"chord": "N.C.", "confidence": 0.0}
    
    try:
        # Compute chroma features
        chroma = librosa.feature.chroma_cqt(y=audio_data, sr=sr, hop_length=512)
        
        # Average across time
        vec = chroma.mean(axis=1)
        norm = np.linalg.norm(vec)
        
        if norm < 0.05:
            return {"chord": "N.C.", "confidence": 0.0}
        
        vec = vec / (norm + 1e-9)
        
        # Find best matching chord
        scores = [float(np.dot(vec, tpl[1])) for tpl in CHORD_TEMPLATES]
        best_idx = int(np.argmax(scores))
        chord_name, _ = CHORD_TEMPLATES[best_idx]
        confidence = min(1.0, scores[best_idx])
        
        return {"chord": chord_name, "confidence": float(confidence)}
        
    except Exception as e:
        print(f"[WS] Chord detection error: {e}")
        return {"chord": "N.C.", "confidence": 0.0}


class ChordStreamManager:
    """Manages WebSocket connections for real-time chord streaming."""
    
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"[WS] Client {client_id} connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"[WS] Client {client_id} disconnected. Total: {len(self.active_connections)}")
    
    async def send_chord(self, client_id: str, data: dict):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(data)
            except Exception as e:
                print(f"[WS] Error sending to {client_id}: {e}")
                self.disconnect(client_id)


# Global manager instance
chord_stream_manager = ChordStreamManager()


async def websocket_chord_endpoint(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for real-time chord detection.
    
    Client sends audio chunks as base64-encoded PCM data.
    Server responds with detected chords.
    
    Message format from client:
    {
        "type": "audio_chunk",
        "data": "<base64 PCM 16-bit mono 22050Hz>",
        "timestamp": <float seconds>
    }
    
    OR:
    {
        "type": "analyze_position",
        "audioUrl": "<url or path>",
        "position": <float seconds>
    }
    
    Response format:
    {
        "type": "chord",
        "chord": "Cmaj",
        "confidence": 0.85,
        "timestamp": <float>
    }
    """
    await chord_stream_manager.connect(websocket, client_id)
    
    audio_buffer = np.array([], dtype=np.float32)
    
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "audio_chunk":
                # Decode base64 audio
                audio_b64 = data.get("data", "")
                timestamp = data.get("timestamp", 0.0)
                
                if audio_b64:
                    try:
                        # Decode base64 to bytes
                        audio_bytes = base64.b64decode(audio_b64)
                        # Convert to numpy (assuming 16-bit PCM mono)
                        audio_chunk = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                        
                        # Append to buffer
                        audio_buffer = np.concatenate([audio_buffer, audio_chunk])
                        
                        # Keep last 1 second of audio for analysis
                        max_samples = 22050
                        if len(audio_buffer) > max_samples:
                            audio_buffer = audio_buffer[-max_samples:]
                        
                        # Detect chord if we have enough audio (at least 0.5s)
                        if len(audio_buffer) >= 11025:
                            result = detect_chord_from_audio(audio_buffer, sr=22050)
                            await chord_stream_manager.send_chord(client_id, {
                                "type": "chord",
                                "chord": result["chord"],
                                "confidence": result["confidence"],
                                "timestamp": timestamp,
                            })
                    except Exception as e:
                        print(f"[WS] Audio chunk error: {e}")
            
            elif msg_type == "ping":
                await chord_stream_manager.send_chord(client_id, {"type": "pong"})
            
            elif msg_type == "clear":
                audio_buffer = np.array([], dtype=np.float32)
                await chord_stream_manager.send_chord(client_id, {"type": "cleared"})
                
    except WebSocketDisconnect:
        chord_stream_manager.disconnect(client_id)
    except Exception as e:
        print(f"[WS] Error in chord stream: {e}")
        chord_stream_manager.disconnect(client_id)
