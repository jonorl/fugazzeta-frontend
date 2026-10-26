# Fugazzeta Detector

[![Test](https://github.com/jonorl/fugazzeta-frontend/actions/workflows/test.yml/badge.svg)](https://github.com/jonorl/fugazzeta-frontend/actions/workflows/test.yml)
[![Build and Deploy](https://github.com/jonorl/fugazzeta-frontend/actions/workflows/deploy.yml/badge.svg)](https://github.com/jonorl/fugazzeta-frontend/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/jonorl/fugazzeta-frontend/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/jonorl/fugazzeta-frontend/security/code-scanning)
[![API status](https://img.shields.io/website?url=https%3A%2F%2Fpizza.jonathan-orlowski.dev%2Fhealth&label=api&up_message=healthy&down_message=down)](https://pizza.jonathan-orlowski.dev/health)
[![Licence](https://img.shields.io/github/license/jonorl/fugazzeta-frontend)](LICENSE)

Upload a photo of a pizza and find out whether it is a fugazzeta. Try it at [jonathan-orlowski.dev/fugazzeta/](https://jonathan-orlowski.dev/fugazzeta/).

Fugazzeta is a pizza from Buenos Aires: a thick, fluffy dough filled with mozzarella and topped with onions, so the cheese sits inside the dough as well as on top. The classifier is a fine-tuned `convnext_tiny` built with fastai. It was my first machine-learning project, made while following Jeremy Howard's [Practical Deep Learning for Coders](https://course.fast.ai/).

## Architecture

- **Frontend** (repository root): a React single-page app, built by Cloudflare Pages on every push. It sends the image to the model with `@gradio/client` and shows the label and confidence, in English or Spanish.
- **Model API** (`/server`): a Gradio app mounted on FastAPI, which adds `/health`. It runs in Docker on a VPS behind Caddy at `pizza.jonathan-orlowski.dev`. The trained `model.pkl` is not in the repository; the VPS mounts it into the container at `/app/models`.

## Project structure

```
├── src/
│   ├── App.tsx                 # The whole UI: upload, analysis and result
│   └── consts/translations.ts  # English and Spanish strings
├── public/
│   ├── _headers                # Cloudflare Pages security headers (CSP)
│   └── gtag-init.js            # Google Analytics bootstrap
└── server/
    ├── app.py                  # Gradio + FastAPI app served in production
    ├── fetchSamples.py         # Downloads training images
    ├── trainingModel.py        # Trains the classifier and exports model.pkl
    ├── modelOutput.py          # Tries the exported model on one image
    └── Dockerfile
```

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide and React Icons
- **Model:** fastai and PyTorch (CPU), served with Gradio and FastAPI
- **Hosting:** Cloudflare Pages for the frontend; Docker, Caddy and GHCR on the VPS for the model

## Getting started

### Frontend

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`. The app calls the production model API, so nothing else needs to run.

### Model API

You need a trained `model.pkl` in `server/models/`. Run `fetchSamples.py` and then `trainingModel.py` to make one.

```bash
cd server
docker build -t fugazzeta .
docker run -p 7861:7861 -v "$PWD/models:/app/models" fugazzeta
```

`http://localhost:7861` serves the Gradio page, and `http://localhost:7861/health` the health check.

## Testing

```bash
npm test                # once
npm run test:watch      # re-run on changes
npm run test:coverage   # with a coverage report
npm run typecheck       # TypeScript, without building
npm run lint            # ESLint
```

The Jest suite covers the language toggle, uploading an image, both results, the error message and starting again, with the Gradio client mocked. It also checks that both languages have the same strings. The model API has no automated tests; the deploy's smoke test checks it once it is live.

## Deployment

- **Model API:** pushing to `main` with changes under `server/` runs the `Build and Deploy` workflow. It builds the Docker image, pushes it to `ghcr.io/jonorl/fugazzeta`, then pulls it on the VPS and recreates the container with Docker Compose. A final smoke test waits until `/health` reports the new commit, then checks that Gradio still exposes the endpoint the frontend calls, and fails the run otherwise.
- **Frontend:** Cloudflare Pages builds it on every push, with preview deployments for other branches.

## Security and maintenance

- **CI:** the `Test` workflow type-checks, lints and tests the frontend on every push and pull request.
- **Branch ruleset:** changes to `main` go through a pull request with passing tests and no new high or critical CodeQL alerts. Force-pushes and deletion are blocked; repository admins can bypass.
- **CodeQL:** scans the TypeScript, the Python and the workflows weekly and on every pull request.
- **Content Security Policy:** set in report-only mode in [`public/_headers`](public/_headers), alongside other security headers.
- **Dependabot:** version updates every Monday for npm, pip and the Docker base image, and monthly for GitHub Actions. Minor and patch bumps arrive grouped. The model's own stack (fastai, fastcore, timm), Pillow and torch are held back; [`.github/dependabot.yml`](.github/dependabot.yml) explains why.
- **Secret scanning** with push protection is on.

## Author

Developed by [Jonathan Orlowski](https://jonathan-orlowski.dev/). Licensed under the Apache License 2.0, see [`LICENSE`](LICENSE).
