import gradio as gr
from fastai.vision.all import *
from PIL import Image as PILImage
import torchvision.transforms.functional as TF

try:
    learn = load_learner('./models/model.pkl', cpu=True)
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
    std  = tensor.new_tensor([0.2290, 0.2240, 0.2250]).view(1, 3, 1, 1)
    tensor = (tensor - mean) / std

    # Step 5: call the model directly, bypassing fastai's DataLoader/transform pipeline
    learn.model.eval()
    with torch.no_grad():
        logits = learn.model(tensor)
        probs  = torch.softmax(logits, dim=1)[0]

    return {learn.dls.vocab[i]: float(probs[i]) for i in range(len(learn.dls.vocab))}

interface = gr.Interface(
    fn=classify_image,
    inputs=gr.Image(type="filepath"),
    outputs=gr.Label(num_top_classes=2),
    title="Pizza vs Fugazzeta Classifier"
)

if __name__ == "__main__":
    port = 7861
    print(f"Launching Gradio app on port {port}...")
    interface.launch(
        server_name="0.0.0.0",
        server_port=port,
        share=False
    )