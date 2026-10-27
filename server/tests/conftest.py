import os
import sys
import types
from pathlib import Path

import pytest
import torch

# app.py loads models/model.pkl as soon as it is imported, and the model is not in the repository. A stub learner
# stands in for it, so the tests run the real preprocessing, routes and Gradio wiring without the trained weights.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

VOCAB = ["fugazzeta", "pizza argentina"]


class StubModel(torch.nn.Module):
    """Records what it is given and answers with fixed logits that favour fugazzeta."""

    def __init__(self):
        super().__init__()
        self.inputs = []

    def forward(self, x):
        self.inputs.append(x)
        return torch.tensor([[2.0, 0.0]])


@pytest.fixture(scope="session")
def stub_learner():
    return types.SimpleNamespace(model=StubModel(), dls=types.SimpleNamespace(vocab=VOCAB))


@pytest.fixture(scope="session")
def app_module(stub_learner):
    import fastai.learner
    import fastai.vision.all

    os.environ["GIT_SHA"] = "test-sha"
    fastai.learner.load_learner = fastai.vision.all.load_learner = lambda *args, **kwargs: stub_learner
    import app

    return app


@pytest.fixture
def client(app_module):
    from fastapi.testclient import TestClient

    return TestClient(app_module.app)
