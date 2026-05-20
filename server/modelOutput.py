from ddgs import *
from fastcore.all import *
from fastai.vision.all import *
from fastai.imports import *

learn = load_learner('model.pkl')
print(learn.dls.vocab)

is_fugazzeta,_,probs = learn.predict(PILImage.create('fuga12.png'))
print(f"This is a: {is_fugazzeta}.")
print(f"Probability it's a fugazzeta: {probs[0]:.4f}")