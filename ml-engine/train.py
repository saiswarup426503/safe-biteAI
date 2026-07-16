import os
import sys
from ultralytics import YOLO

def main():
    print("==================================================")
    print("🚀 Starting SafeBite AI YOLOv8 Training Script")
    print("==================================================")
    
    # Locate dataset configuration path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_yaml_path = os.path.abspath(os.path.join(current_dir, "..", "data.yaml"))
    
    if not os.path.exists(data_yaml_path):
        print(f"❌ Error: data.yaml not found at {data_yaml_path}")
        sys.exit(1)
        
    print(f"✅ Found dataset configuration at: {data_yaml_path}")

    # Load pre-trained model (weights will download automatically if not present)
    print("⚡ Loading pre-trained YOLOv8n base model...")
    model = YOLO("yolov8n.pt")

    # Start training process
    # Note: workers=0 is required on Windows to prevent multiprocessing issues.
    # imgsz=640 is standard, epochs=6 is set as requested.
    print("🏋️ Training custom object detection layers (apron, hairnet, gloves, pests)...")
    try:
        model.train(
            data=data_yaml_path,
            epochs=6,
            imgsz=640,
            device="cpu",   # Uses CPU for compatibility. Change to device=0 if you have a CUDA GPU.
            workers=0,      # Prevents multi-threading errors on Windows
            optimizer="AdamW",
            cos_lr=True,
            lr0=0.001,
            verbose=True
        )
        print("==================================================")
        print("🎉 Training completed successfully!")
        print("📁 Best weights are saved in: runs/detect/train/weights/best.pt")
        print("==================================================")
    except Exception as e:
        print(f"❌ Error occurred during training: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
