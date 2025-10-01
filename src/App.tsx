import { useState } from "react";
import { Upload, Loader2, Pizza } from "lucide-react";
import { FaGithub } from "react-icons/fa";
const { Client } = await import("@gradio/client");

interface Confidence {
  label: string;
  confidence: number;
}

interface GradioResult {
  label: string;
  confidences: Confidence[];
}

export default function FugazzetaDetector() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");

  const translations = {
    en: {
      title: "Fugazzeta Detector",
      subtitle: "AI-powered pizza classification",
      whatIs: "What is a Fugazzeta?",
      description1:
        "Fugazzeta is a traditional Argentine pizza style, originating from Buenos Aires. It's characterized by its thick, fluffy dough filled with mozzarella cheese, topped with onions, and often finished with oregano and olive oil.",
      description2:
        "Unlike regular pizza, fugazzeta has cheese both inside the dough and on top, creating a unique double-cheese experience that sets it apart from other pizza styles.",
      testYourPizza: "Test Your Pizza",
      uploadImage: "Upload a pizza image",
      fileTypes: "PNG, JPG up to 10MB",
      clickToChange: "Click to change image",
      analyzePizza: "Analyze Pizza",
      analyzing: "Analyzing...",
      errorMessage: "Failed to analyze pizza. Please try again.",
      classificationResult: "Classification Result",
      isFugazzeta: "🎉 It's a Fugazzeta!",
      notFugazzeta: "❌ Not a Fugazzeta",
      confidence: "Confidence:",
      tryAnother: "Try Another Pizza",
      footer:
        "Powered by machine learning (fastAI) • Project by Jonathan Orlowski",
    },
    es: {
      title: "Detector de Fugazzeta",
      subtitle: "Clasificación de pizza con inteligencia artificial",
      whatIs: "¿Qué es una Fugazzeta?",
      description1:
        "La fugazzeta es un estilo tradicional de pizza argentina, originario de Buenos Aires. Se caracteriza por su masa gruesa y esponjosa rellena de queso muzzarella, cubierta con cebollas, orégano y aceite de oliva.",
      description2:
        "A diferencia de la pizza común, la fugazzeta tiene queso tanto dentro de la masa como encima, creando una experiencia única de doble queso que la distingue de otros estilos de pizza.",
      testYourPizza: "Es tu pizza una fugazzeta?",
      uploadImage: "Subi una imagen de una pizza",
      fileTypes: "PNG, JPG hasta 10MB",
      clickToChange: "Hace click para cambiar la imagen",
      analyzePizza: "Analizar Pizza",
      analyzing: "Analizando...",
      errorMessage:
        "Error al analizar la pizza. Por favor, inténtalo de nuevo.",
      classificationResult: "Resultado del analisis",
      isFugazzeta: "🎉 ¡Es una Fugazzeta!",
      notFugazzeta: "❌ No es una Fugazzeta",
      confidence: "Confianza:",
      tryAnother: "Probar Otra Pizza",
      footer:
        "Hecho con machine learning (fastAI) • Proyecto hecho por Jonathan Orlowski",
    },
  };

  const t = translations[language as keyof typeof translations];
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePizza = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const client: any = await Client.connect("jonorl/fugazzeta");

      const fileToConvert = image as File;
      const imageBlob =
        fileToConvert instanceof Blob
          ? fileToConvert
          : await (fileToConvert as Blob)
              .arrayBuffer()
              .then((b: ArrayBuffer) => new Blob([b]));

      // The 'response' type is generic, so we cast the final data.
      const response = await client.predict("/predict", {
        img: imageBlob,
      });

      // 3. Fix the `setResult` error by casting the data
      const predictionData = response.data[0] as GradioResult;

      setResult(predictionData);
    } catch (err) {
      setError("Failed to analyze pizza. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isFugazzeta = result?.label === "fugazzeta";
  const confidence =
    result?.confidences?.find((c) => c.label === result?.label)?.confidence ||
    0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === "en" ? "es" : "en")}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
          >
            <span className="text-sm">{language === "en" ? "ES" : "EN"}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4">
            <Pizza className="w-16 h-16 text-orange-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {t.title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">{t.subtitle}</p>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {t.whatIs}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">{t.description1}</p>
          <p className="text-gray-700 leading-relaxed">{t.description2}</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t.testYourPizza}
          </h2>

          <div className="space-y-4">
            {/* Upload Area */}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600">{t.clickToChange}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-gray-600 font-medium">{t.uploadImage}</p>
                    <p className="text-sm text-gray-500">{t.fileTypes}</p>
                  </div>
                )}
              </div>
            </label>

            {/* Analyze Button */}
            {image && !loading && !result && (
              <button
                onClick={analyzePizza}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md"
              >
                {t.analyzePizza}
              </button>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                <span className="ml-3 text-gray-700">{t.analyzing}</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm">{t.errorMessage}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4 pt-4">
                <div
                  className={`rounded-xl p-6 ${
                    isFugazzeta
                      ? "bg-green-50 border-2 border-green-200"
                      : "bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {t.classificationResult}
                    </p>
                    <p
                      className={`text-2xl sm:text-3xl font-bold mb-3 ${
                        isFugazzeta ? "text-green-700" : "text-gray-700"
                      }`}
                    >
                      {isFugazzeta ? t.isFugazzeta : t.notFugazzeta}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t.confidence}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {(confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFugazzeta ? "bg-green-500" : "bg-gray-400"
                          }`}
                          style={{ width: `${confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                    setResult(null);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {t.tryAnother}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>{t.footer}</p>
          <a
              href="https://github.com/jonorl/fugazzeta-frontend"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center align-middle ml-2 hover:text-white/80"
            >
              <FaGithub className="mb-1" aria-label="GitHub" />
            </a>
        </div>
      </div>
    </div>
  );
}
