import gradio as gr
from fastai.vision.all import *

# 1. Force PyTorch to load the pickle file directly onto the CPU
try:
    # This overrides the hardware mapping during unpickling
    learn = load_learner('model.pkl', cpu=True)
    print("Successfully loaded learner onto CPU.")
except Exception as e:
    print(f"Load failed: {e}")
    raise e

# 2. Prediction function
def classify_image(img):
    if img is None: return None
    pred, idx, probs = learn.predict(img)
    return dict(zip(learn.dls.vocab, map(float, probs)))

# 3. Interface
interface = gr.Interface(
    fn=classify_image,
    inputs=gr.Image(type="pil"),
    outputs=gr.Label(num_top_classes=2),
    title="Pizza vs Fugazzeta Classifier"
)

# 4. Correctly bind the Gradio runtime inside Docker
if __name__ == "__main__":
    port = 7861
    print(f"Launching Gradio app on port {port}...")
    interface.launch(
        server_name="0.0.0.0", 
        server_port=port,
        share=False
    )