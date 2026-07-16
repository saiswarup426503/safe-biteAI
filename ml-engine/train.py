import os
import sys
import argparse
from ultralytics import YOLO

def main():
    parser = argparse.ArgumentParser(description="SafeBite AI - YOLOv8 Training Script")
    parser.add_argument(
        "--model", 
        type=str, 
        default="yolov8s.pt", 
        choices=["yolov8n.pt", "yolov8s.pt", "yolov8m.pt", "yolov8l.pt", "yolov8x.pt"],
        help="Base model size to train on for higher accuracy (default: yolov8s.pt)"
    )
    args = parser.parse_args()

    print("==================================================")
    print("🚀 Starting SafeBite AI YOLOv8 Training Script")
    print(f"📦 Selected Base Model: {args.model}")
    print("==================================================")
    
    # Locate dataset configuration path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_yaml_path = os.path.abspath(os.path.join(current_dir, "..", "data.yaml"))
    
    if not os.path.exists(data_yaml_path):
        print(f"❌ Error: data.yaml not found at {data_yaml_path}")
        sys.exit(1)
        
    print(f"✅ Found dataset configuration at: {data_yaml_path}")

    # Load pre-trained model (weights will download automatically if not present)
    print(f"⚡ Loading pre-trained {args.model} base model...")
    model = YOLO(args.model)

    # Start training process
    # Note: workers=0 is required on Windows to prevent multiprocessing issues.
    # imgsz=640 is standard, epochs=6 is set as requested.
    print("🏋️ Training custom object detection layers (apron, hairnet, gloves, pests)...")
    try:
        model.train(
            data=data_yaml_path,
            epochs=4,
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
