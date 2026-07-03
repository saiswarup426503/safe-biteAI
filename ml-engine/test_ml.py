from fastapi.testclient import TestClient
from main import app
import io
from PIL import Image

import traceback

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    print("✅ Root endpoint response:", response.json())

def test_analyze():
    # Create a 200x200 grey canvas in-memory
    img = Image.new('RGB', (200, 200), color='#7f7f7f')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    # 1. Test Clean Preset (Expecting 100% compliance)
    response = client.post(
        "/analyze",
        files={"file": ("kitchen_clean_pass.jpg", img_byte_arr, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    print("DEBUG Clean Pass response data:", data)
    assert data["success"] is True
    assert data["visionVerificationScore"] == 100
    print("✅ Ingestion (Clean Pass) compliance score verified:", data["visionVerificationScore"])

    # 2. Test Dirty/Failure Preset (Expecting violations and degraded score)
    response = client.post(
        "/analyze",
        files={"file": ("kitchen_dirty_fail.jpg", img_byte_arr, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["visionVerificationScore"] < 100
    assert len(data["detectedViolations"]) > 0
    print("✅ Ingestion (Dirty Fail) compliance score verified:", data["visionVerificationScore"])
    print("   Detected Violations:", data["detectedViolations"])

if __name__ == "__main__":
    print("==================================================")
    print("🧪 Running ML Engine Endpoint Tests...")
    print("==================================================")
    try:
        test_root()
        test_analyze()
        print("\n🎉 All FastAPI YOLOv8 verification scripts passed successfully!")
    except Exception as e:
        print("\n❌ Verification failed:")
        traceback.print_exc()
    print("==================================================")
