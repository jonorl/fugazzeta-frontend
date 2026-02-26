import gradio as gr
from fastai.vision.all import *
import timm
import torch

# 1. Categories
categories = ['fugazzeta', 'pizza']

# 2. Build the shell manually
# We explicitly pass loss_func because dls is empty
dls = DataLoaders.from_dsets([], [], bs=1)
dls.vocab = categories
learn = vision_learner(dls, 'convnext_tiny', metrics=error_rate, loss_func=CrossEntropyLossFlat())

# 3. Load the weights from the .pkl file
model_file = 'model.pkl'
try:
    checkpoint = torch.load(model_file, map_location='cpu', weights_only=False)
    # The exported Learner stores the model under the 'model' key
    if isinstance(checkpoint, dict) and 'model' in checkpoint:
        learn.model.load_state_dict(checkpoint['model'])
    else:
        # If you used learn.export, the whole object is there; we try to grab the model
        if hasattr(checkpoint, 'model'):
            learn.model = checkpoint.model
        else:
            learn.model.load_state_dict(checkpoint)
    print("Successfully loaded weights.")
except Exception as e:
    print(f"Load failed: {e}")
    raise e

learn.model.eval()

# 4. Prediction function
def classify_image(img):
    if img is None: return None
    img = PILImage.create(img).to_thumb(224)
    # Using learn.predict is safe now that the model is loaded
    pred, idx, probs = learn.predict(img)
    return dict(zip(categories, map(float, probs)))

# 5. Interface
interface = gr.Interface(
    fn=classify_image,
    inputs=gr.Image(type="pil"),
    outputs=gr.Label(num_top_classes=2),
    title="Pizza vs Fugazzeta Classifier"
)

if __name__ == "__main__":
    interface.launch()