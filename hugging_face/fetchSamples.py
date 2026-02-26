from PIL import Image
from ddgs import *
from fastcore.all import *
import time
from fastdownload import download_url
from fastai.vision.all import *

## Step 1: Download images of carrots and vegtetables

def search_images(keywords, max_images=200): return L(DDGS().images(keywords, max_results=max_images)).itemgot('image')

urls = search_images('fugazzeta', max_images=1)
urls[0]

dest = 'fugazzeta.jpg'
download_url(urls[0], dest, show_progress=False)

im = Image.open(dest)
im.to_thumb(256,256)

searches = 'fugazzeta','pizza argentina'
path = Path('fugazzeta_or_pizza')

for o in searches:
    dest = (path/o)
    dest.mkdir(exist_ok=True, parents=True)
    download_images(dest, urls=search_images(f'{o} photo'))
    time.sleep(5)
    resize_images(path/o, max_size=400, dest=path/o)