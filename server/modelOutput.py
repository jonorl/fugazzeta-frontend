"""Tries the exported model on one image: python modelOutput.py <image> [model.pkl]"""

import sys

from fastai.vision.all import *


def main(image_path, model_path="model.pkl"):
    learn = load_learner(model_path)
    label, _, probs = learn.predict(PILImage.create(image_path))
    print(f"This is a: {label}")
    for name, prob in zip(learn.dls.vocab, probs, strict=True):
        print(f"  {name}: {prob:.4f}")


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    main(*sys.argv[1:])
