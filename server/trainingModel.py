"""Trains the classifier on fugazzeta_or_pizza/ and exports model.pkl, plus its validation results for the README."""

import json
import sys

import matplotlib

matplotlib.use("Agg")  # Figures are saved to files, so no display is needed.

from fastai.callback.tracker import EarlyStoppingCallback, SaveModelCallback  # noqa: E402
from fastai.vision.all import *  # noqa: E402

DATA_PATH = Path("fugazzeta_or_pizza")
DOCS_PATH = Path(__file__).resolve().parent.parent / "docs"


def build_dataloaders():
    # fastai fails with an unhelpful TypeError on an empty folder, so this says what is actually wrong.
    if not get_image_files(DATA_PATH):
        sys.exit(f"No images in {DATA_PATH}/; run fetchSamples.py first.")
    failed = verify_images(get_image_files(DATA_PATH))
    failed.map(Path.unlink)
    print(f"Removed {len(failed)} corrupted images")

    pizza = DataBlock(
        blocks=(ImageBlock, CategoryBlock),
        get_items=get_image_files,
        splitter=RandomSplitter(valid_pct=0.2, seed=42),
        get_y=parent_label,
        # app.py repeats this resize and the validation crop by hand, so change both together.
        item_tfms=[Resize(460, method="squish")],
        batch_tfms=[
            *aug_transforms(
                size=224,
                min_scale=0.75,
                do_flip=True,
                flip_vert=False,
                max_rotate=15.0,
                max_lighting=0.3,
                max_warp=0.2,
                p_affine=0.75,
                p_lighting=0.75,
            ),
            Normalize.from_stats(*imagenet_stats),
        ],
    )
    return pizza.dataloaders(DATA_PATH, bs=32)


def train(dls):
    learn = vision_learner(dls, convnext_tiny, metrics=[error_rate, accuracy], pretrained=True)
    # SaveModelCallback reloads the best epoch's weights when each fit ends, so the export is the best model seen.
    cbs = [
        SaveModelCallback(monitor="valid_loss", fname="best_model"),
        EarlyStoppingCallback(monitor="valid_loss", patience=5),
    ]

    lr_min, lr_steep = learn.lr_find(suggest_funcs=(minimum, steep))
    print(f"Suggested learning rates: minimum {lr_min}, steep {lr_steep}")

    print("Training the head with the body frozen...")
    learn.fine_tune(10, base_lr=lr_steep / 10, freeze_epochs=3, cbs=cbs)

    print("Training the whole network with discriminative learning rates...")
    learn.unfreeze()
    learn.fit_one_cycle(20, lr_max=slice(1e-6, lr_steep / 5), cbs=cbs)
    return learn


def report(learn, dls):
    valid_loss, error, acc = learn.validate()
    counts = {label: len(get_image_files(DATA_PATH / label)) for label in dls.vocab}
    results = {
        "architecture": "convnext_tiny",
        "images": counts,
        "validation_images": len(dls.valid_ds),
        "validation_loss": round(float(valid_loss), 4),
        "error_rate": round(float(error), 4),
        "accuracy": round(float(acc), 4),
    }
    print(json.dumps(results, indent=2))

    DOCS_PATH.mkdir(exist_ok=True)
    (DOCS_PATH / "model-results.json").write_text(json.dumps(results, indent=2) + "\n")
    interp = ClassificationInterpretation.from_learner(learn)
    interp.plot_confusion_matrix(figsize=(5, 5))
    plt.savefig(DOCS_PATH / "confusion-matrix.png", bbox_inches="tight", dpi=120)
    print(f"Saved the results and confusion matrix to {DOCS_PATH}")


def main():
    dls = build_dataloaders()
    learn = train(dls)
    report(learn, dls)
    learn.export("model.pkl")
    print("Exported model.pkl; copy it to the VPS's models folder to deploy it")


if __name__ == "__main__":
    main()
