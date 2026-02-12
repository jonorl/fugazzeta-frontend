# Fugazzeta Detector

This repository features an image classification model capable of distinguishing between fugazzeta (an Argentine pizza variant) and standard pizza. The model was built using the fastai library, leveraging a pre-trained convnext_tiny architecture and fine-tuned over 4 epochs. The data pipeline included downloading images, verifying file integrity, and applying data augmentation techniques. The trained model, along with its learned weights, is saved in both the standard model.pkl for easy deployment and portability.

This is my first AI/ML project following the [Practical Deep Learning for Coders](https://course.fast.ai/) course by Jeremy Howard.

[Link to my HuggingFace repo](https://huggingface.co/spaces/jonorl/fugazzeta)

## What is a Fugazzeta?

Fugazzeta is a traditional Argentine pizza style originating from Buenos Aires. It's characterized by its thick, fluffy dough filled with mozzarella cheese, topped with sweet onions, and often finished with oregano and olive oil. Unlike regular pizza, fugazzeta has cheese both inside the dough and on top, creating a unique double-cheese experience.

## Features

- **AI-Powered Classification**: Uses a custom-trained machine learning based on fastAI to identify fugazzeta pizzas
- **Mobile-First Design**: Responsive layout optimized for all screen sizes
- **Bilingual Support**: Toggle between English and Spanish
- **Confidence Scores**: Shows prediction confidence with visual progress bars
- **Pizza-Themed UI**: Warm, inviting color scheme with smooth animations
- **Fast & Lightweight**: Built with Vite for optimal performance

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **ML API**: Gradio Client (HuggingFace)
- **Model**: PyTorch / FastAI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fugazzeta-detector.git
cd fugazzeta-detector
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Usage

1. Click or tap the upload area to select a pizza image
2. Wait for the image to upload and preview
3. Click "Analyze Pizza" (or "Analizar Pizza" in Spanish)
4. View the classification result with confidence percentage
5. Try another pizza or toggle between English and Spanish

## Project Structure

```
fugazzeta-detector/
├── src/
│   ├── App.tsx                       # Root component
│   └── main.tsx                      # Entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## API Integration

This project connects to a custom Gradio model hosted on HuggingFace Spaces:

```typescript
const client = await Client.connect("jonorl/fugazzeta");
const result = await client.predict("/predict", { img: imageBlob });
```

The model returns predictions with labels and confidence scores for classification.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Dependencies

```json
{
  "react": "^18.x",
  "lucide-react": "^0.263.1",
  "@gradio/client": "latest"
}
```

## Contact

[Jonathan Orlowski](https://jonathan-orlowski.pages.dev/)