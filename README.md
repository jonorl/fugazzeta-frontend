# 🍕 Fugazzeta Detector

A machine learning-powered web application that detects whether a pizza is a traditional Argentine fugazzeta or not. Built with React, TypeScript, and Vite, featuring a mobile-first design and bilingual support (English/Spanish).

## What is a Fugazzeta?

Fugazzeta is a traditional Argentine pizza style originating from Buenos Aires. It's characterized by its thick, fluffy dough filled with mozzarella cheese, topped with sweet onions, and often finished with oregano and olive oil. Unlike regular pizza, fugazzeta has cheese both inside the dough and on top, creating a unique double-cheese experience.

## Features

- 🤖 **AI-Powered Classification**: Uses a custom-trained machine learning model to identify fugazzeta pizzas
- 📱 **Mobile-First Design**: Responsive layout optimized for all screen sizes
- 🌍 **Bilingual Support**: Toggle between English and Spanish
- 📊 **Confidence Scores**: Shows prediction confidence with visual progress bars
- 🎨 **Pizza-Themed UI**: Warm, inviting color scheme with smooth animations
- ⚡ **Fast & Lightweight**: Built with Vite for optimal performance

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **ML API**: Gradio Client (HuggingFace)
- **Model**: Custom image classification model hosted on HuggingFace

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

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
│   ├── components/
│   │   └── FugazzetaDetector.tsx    # Main detector component
│   ├── App.tsx                       # Root component
│   └── main.tsx                      # Entry point
├── public/                           # Static assets
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

## Customization

### Changing Colors

The color scheme uses Tailwind's color palette. To modify:

1. Open `FugazzetaDetector.tsx`
2. Replace color classes (e.g., `orange-600`, `amber-50`) with your preferred colors
3. Update the gradient in the main container: `bg-gradient-to-br from-amber-50 via-orange-50 to-red-50`

### Adding More Languages

To add additional languages:

1. Add a new language object to the `translations` object
2. Update the language toggle button logic
3. Add the language code to the state management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- ML model hosted on [HuggingFace](https://huggingface.co/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by the delicious Argentine pizza tradition

## Contact

For questions or feedback, please open an issue on GitHub.

---

Made with 🍕 and ❤️