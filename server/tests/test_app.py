import pytest
import torch
from PIL import Image

from conftest import VOCAB


def test_health_reports_ok_with_classes_and_version(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "classes": VOCAB, "version": "test-sha"}


def test_health_answers_head_for_the_status_badge(client):
    assert client.head("/health").status_code == 200


def test_gradio_exposes_the_endpoint_the_frontend_calls(client):
    config = client.get("/config").json()

    assert "classify_image" in [dependency.get("api_name") for dependency in config["dependencies"]]


def test_gradio_page_is_served_at_the_root(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/html")


@pytest.mark.parametrize("size", [(800, 600), (335, 597), (50, 50)])
def test_classify_image_feeds_the_model_a_normalised_224_square(app_module, stub_learner, tmp_path, size):
    path = tmp_path / "pizza.png"
    Image.new("RGB", size, (255, 128, 0)).save(path)

    app_module.classify_image(str(path))

    tensor = stub_learner.model.inputs[-1]
    assert tensor.shape == (1, 3, 224, 224)
    # A flat orange image normalised with the ImageNet statistics the model was trained with. It is a PNG because
    # JPEG compression would shift the colour.
    expected = [(1.0 - 0.485) / 0.229, (128 / 255 - 0.456) / 0.224, (0.0 - 0.406) / 0.225]
    assert tensor[0, :, 112, 112].tolist() == pytest.approx(expected, abs=1e-2)


def test_classify_image_returns_a_probability_per_class(app_module, tmp_path):
    path = tmp_path / "pizza.png"
    Image.new("RGB", (300, 300), "white").save(path)

    result = app_module.classify_image(str(path))

    assert list(result) == VOCAB
    assert sum(result.values()) == pytest.approx(1.0)
    assert result["fugazzeta"] == pytest.approx(torch.softmax(torch.tensor([2.0, 0.0]), 0)[0].item())


def test_classify_image_accepts_images_that_are_not_rgb(app_module, tmp_path):
    path = tmp_path / "pizza.png"
    Image.new("RGBA", (300, 300), (0, 0, 0, 0)).save(path)

    assert set(app_module.classify_image(str(path))) == set(VOCAB)
