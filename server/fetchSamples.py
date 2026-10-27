"""Downloads the training images: up to 200 DuckDuckGo results per class into fugazzeta_or_pizza/<class>/."""

import time

from ddgs import DDGS
from fastai.vision.all import *

DATA_PATH = Path("fugazzeta_or_pizza")
# Folder names become the model's labels, so renaming one changes what the API answers.
CLASSES = ("fugazzeta", "pizza argentina")


def search_images(keywords, max_images=200):
    return L(DDGS().images(keywords, max_results=max_images)).itemgot("image")


def main():
    for label in CLASSES:
        dest = DATA_PATH / label
        dest.mkdir(exist_ok=True, parents=True)
        download_images(dest, urls=search_images(f"{label} photo"))
        # Pauses between searches so DuckDuckGo does not rate-limit the second one.
        time.sleep(5)
        resize_images(dest, max_size=400, dest=dest)
        print(f"{label}: {len(get_image_files(dest))} images")


if __name__ == "__main__":
    main()
