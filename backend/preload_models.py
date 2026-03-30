"""
Preload Demucs models during container startup to avoid first-request delays.
This script downloads and caches the models before the API server starts.
"""
import sys

def preload_demucs():
    """Download and cache Demucs models at startup."""
    try:
        print("🔄 Preloading Demucs models...")
        
        # Verify torch + torchaudio ABI compatibility FIRST
        import torch
        print(f"   torch version: {torch.__version__}")
        try:
            import torchaudio
            print(f"   torchaudio version: {torchaudio.__version__}")
        except Exception as e:
            print(f"❌ torchaudio import failed — ABI mismatch! Error: {e}")
            print("   Fix: ensure torch and torchaudio are installed from the SAME index")
            return False
        
        from demucs.pretrained import get_model
        
        # Download the htdemucs model (2-stem: vocals + instrumental)
        model = get_model("htdemucs")
        print("✅ Demucs htdemucs (2-stem) model loaded successfully")
        del model
        
        # Download the htdemucs_6s model (6-stem: vocals, drums, bass, guitar, piano, other)
        model_6s = get_model("htdemucs_6s")
        print("✅ Demucs htdemucs_6s (6-stem) model loaded successfully")
        del model_6s
        
        # Clean up to free memory
        torch.cuda.empty_cache() if torch.cuda.is_available() else None
        print("✅ All models cached and ready for inference")
        return True
        
    except Exception as e:
        print(f"⚠️  Model preload failed: {e}")
        print("Models will be downloaded on first request instead.")
        return False

if __name__ == "__main__":
    success = preload_demucs()
    sys.exit(0 if success else 1)
