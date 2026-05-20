from ddgs import *
from fastcore.all import *
from fastai.vision.all import *
from fastai.callback.tracker import EarlyStoppingCallback, SaveModelCallback

## Step 1: Clean and verify images
path = Path('fugazzeta_or_pizza')
failed = verify_images(get_image_files(path))
failed.map(Path.unlink)
print(f"Removed {len(failed)} corrupted images")

## Step 2: Create DataBlock with improved augmentation
print("Creating dataloaders")
pizza = DataBlock(
    blocks=(ImageBlock, CategoryBlock),
    get_items=get_image_files,
    splitter=RandomSplitter(valid_pct=0.2, seed=42),
    get_y=parent_label,
    item_tfms=[Resize(460, method='squish')],  # Larger initial resize
    batch_tfms=[
        *aug_transforms(
            size=224,
            min_scale=0.75,  # More aggressive cropping
            do_flip=True,
            flip_vert=False,
            max_rotate=15.0,
            max_lighting=0.3,
            max_warp=0.2,
            p_affine=0.75,
            p_lighting=0.75
        ),
        Normalize.from_stats(*imagenet_stats)
    ]
)

dls = pizza.dataloaders(path, bs=32)  # Reduced batch size for better generalization
dls.show_batch(max_n=9, nrows=3)  # Visual check
print("Dataloaders created")

## Step 3: Train with better architecture and callbacks
print("Starting training")

# Use a more powerful architecture
learn = vision_learner(
    dls, 
    convnext_tiny,  # Upgraded from resnet18
    metrics=[error_rate, accuracy],
    pretrained=True
)

# Better callbacks
cbs = [
    SaveModelCallback(monitor='valid_loss', fname='best_model'),
    EarlyStoppingCallback(monitor='valid_loss', patience=5)  # More patience
]

# Step 3a: Find optimal learning rate
print("Finding learning rate...")
lr_min, lr_steep = learn.lr_find(suggest_funcs=(minimum, steep))
print(f"Suggested LR (minimum): {lr_min}, LR (steep): {lr_steep}")

# Step 3b: Train head first with frozen body
print("Training head (frozen body)...")
learn.fine_tune(
    10,  # Initial epochs for head
    base_lr=lr_steep/10,  # Conservative learning rate
    freeze_epochs=3,
    cbs=cbs
)

# Step 3c: Optional - Progressive unfreezing for better results
print("\nProgressive unfreezing...")
learn.unfreeze()

# Train different layer groups with discriminative learning rates
learn.fit_one_cycle(
    20, 
    lr_max=slice(1e-6, lr_steep/5),  # Lower LR for earlier layers
    cbs=cbs
)

print("Training complete")

## Step 4: Analyze results
print("\n=== Training Results ===")
learn.show_results(max_n=9, nrows=3)

# Confusion matrix
interp = ClassificationInterpretation.from_learner(learn)
interp.plot_confusion_matrix(figsize=(6,6))
interp.plot_top_losses(9, nrows=3, figsize=(12,9))

## Step 5: Export model
learn.save('best_model')
print("\nExporting model...")
learn.export('model.pkl')
print(f"Model is on: {next(learn.model.parameters()).device}")
print("Model exported successfully!")

## Optional: Check class distribution
print("\n=== Dataset Statistics ===")
print(f"Total images: {len(get_image_files(path))}")
for category in dls.vocab:
    count = len(list((path/category).ls()))
    print(f"{category}: {count} images")

    print("Training complete")

# Load the best model weights
print("Loading best model...")
learn.load('best_model')  # This loads best_model.pth

# Now export it as pkl for Gradio
print("Exporting best model as pkl...")
learn.export('model.pkl')

print(f"Model is on: {next(learn.model.parameters()).device}")
print("Best model exported successfully as model.pkl!")