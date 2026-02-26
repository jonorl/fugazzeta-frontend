import gradio as gr
from fastai.vision.all import *

# 1. Load the entire learner directly
# This assumes you used learn.export('model.pkl')
try:
    learn = load_learner('model.pkl')
    print("Successfully loaded learner.")
except Exception as e:
    print(f"Load failed: {e}")
    raise e

# 2. Prediction function
def classify_image(img):
    if img is None: return None
    # fastai's load_learner expects a PIL image or path
    # and handles resizing based on the original training transforms
    pred, idx, probs = learn.predict(img)
    return dict(zip(learn.dls.vocab, map(float, probs)))

# 3. Interface
interface = gr.Interface(
    fn=classify_image,
    inputs=gr.Image(type="pil"),
    outputs=gr.Label(num_top_classes=2),
    title="Pizza vs Fugazzeta Classifier"
)

if __name__ == "__main__":
    interface.launch()