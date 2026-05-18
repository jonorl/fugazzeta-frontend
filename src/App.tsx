import { useState } from "react";
import { Upload, Loader2, Pizza} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";
import { translations } from "./consts/translations";

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
      const client = await Client.connect("https://pizza.jonathan-orlowski.dev");

      const result = await client.predict("/classify_image", {
        img: image,
      });

      const predictionData = (result.data as [GradioResult])[0];

      setResult(predictionData);
    } catch (err) {
      setError(t.errorMessage);
      console.error("Connection Error:", err);
      // If analysis fails, space might be sleeping
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
              <div
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors`}
              >
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
            href="https://jonathan-orlowski.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-yellow-400 transition-colors"
          >
            Jonathan Orlowski
          </a>
          <a
            href="https://github.com/jonorl/fugazzeta-frontend"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center align-middle ml-2 hover:text-white/80"
          >
            <FaGithub className="mb-1" aria-label="GitHub" />
          </a>
          <a
            href="https://huggingface.co/spaces/jonorl/fugazzeta"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center align-middle ml-2 hover:text-white/80"
          >
            <SiHuggingface className="mb-1" aria-label="HuggingFace" />
          </a>
        </div>
      </div>
    </div>
  );
}