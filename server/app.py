import os

import gradio as gr
import torchvision.transforms.functional as TF
import uvicorn
from fastai.vision.all import *
from fastapi import FastAPI
from PIL import Image as PILImage

try:
    learn = load_learner("./models/model.pkl", cpu=True)
    print("Successfully loaded learner onto CPU.")
    print(f"Classes: {learn.dls.vocab}")
except Exception as e:
    print(f"Load failed: {e}")
    raise e


def classify_image(img_path):
    # Step 1: replicate after_item (Resize to 460 with squish = no crop, just resize)
    pil_img = PILImage.open(img_path).convert("RGB")
    pil_img = pil_img.resize((460, 460), PILImage.BILINEAR)

    # Step 2: to float tensor [0,1], shape [1, 3, 460, 460]
    tensor = TF.to_tensor(pil_img).unsqueeze(0)

    # Step 3: centre-crop to 224x224 (replicates RandomResizedCropGPU at valid_scale=1.0)
    tensor = TF.center_crop(tensor, [224, 224])

    # Step 4: exact normalisation stats from the model
    mean = tensor.new_tensor([0.4850, 0.4560, 0.4060]).view(1, 3, 1, 1)
    std = tensor.new_tensor([0.2290, 0.2240, 0.2250]).view(1, 3, 1, 1)
    tensor = (tensor - mean) / std

    # Step 5: call the model directly, bypassing fastai's DataLoader/transform pipeline
    learn.model.eval()
    with torch.no_grad():
        logits = learn.model(tensor)
        probs = torch.softmax(logits, dim=1)[0]

    return {learn.dls.vocab[i]: float(probs[i]) for i in range(len(learn.dls.vocab))}


interface = gr.Interface(
    fn=classify_image,
    inputs=gr.Image(type="filepath"),
    outputs=gr.Label(num_top_classes=2),
    title="Pizza vs Fugazzeta Classifier",
)

app = FastAPI()


# The process exits if the model fails to load, so answering at all means it is ready. version is the commit the
# image was built from, so the deploy's smoke test can tell the new container is the one answering.
# HEAD is listed because the README's status badge (Shields) checks with it, and FastAPI does not add it to GET routes.
@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok", "classes": list(learn.dls.vocab), "version": os.environ.get("GIT_SHA", "dev")}


# Gradio is mounted on FastAPI rather than launched on its own so /health can sit beside it on the same port.
app = gr.mount_gradio_app(app, interface, path="")

if __name__ == "__main__":
    port = 7861
    print(f"Launching Gradio app on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
