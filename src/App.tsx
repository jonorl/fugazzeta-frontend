import { useState, useEffect } from "react";
import { Upload, Loader2, Pizza, AlertCircle, Power } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";

const { Client } = await import("@gradio/client");

interface Confidence {
  label: string;
  confidence: number;
}

interface GradioResult {
  label: string;
  confidences: Confidence[];
}

type SpaceStatus = "checking" | "ready" | "sleeping" | "error";

export default function FugazzetaDetector() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const [spaceStatus, setSpaceStatus] = useState<SpaceStatus>("checking");
  const [wakingUp, setWakingUp] = useState(false);

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
      footer: "Powered by machine learning (fastAI)",
      statusReady: "Model Ready",
      statusSleeping: "Model Sleeping",
      statusChecking: "Checking Status...",
      statusError: "Connection Error",
      wakeUpButton: "Wake Up Model",
      wakingUp: "Waking up model...",
      sleepingMessage: "The AI model is currently sleeping. Click the button below to wake it up (this may take 30-60 seconds).",
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
      footer: "Hecho con machine learning (fastAI)",
      statusReady: "Modelo Listo",
      statusSleeping: "Modelo Durmiendo",
      statusChecking: "Verificando Estado...",
      statusError: "Error de Conexión",
      wakeUpButton: "Despertar Modelo",
      wakingUp: "Despertando modelo...",
      sleepingMessage: "El modelo de IA está durmiendo actualmente. Haz clic en el botón de abajo para despertarlo (puede tardar 30-60 segundos).",
    },
  };

  const t = translations[language as keyof typeof translations];

  // Check space status on mount
  useEffect(() => {
    checkSpaceStatus();
  }, []);

  const checkSpaceStatus = async () => {
    setSpaceStatus("checking");
    try {
      await Client.connect("jonorl/fugazzeta", {
        hf_token: import.meta.env.VITE_HF_TOKEN,}
      );
      setSpaceStatus("ready");
    } catch (err) {
      console.error("Status check error:", err);
      setSpaceStatus("sleeping");
    }
  };

  const wakeUpSpace = async () => {
    setWakingUp(true);
    try {
      // Connecting to the space will wake it up
      await Client.connect("jonorl/fugazzeta", {
        hf_token: import.meta.env.VITE_HF_TOKEN,
      });
      setSpaceStatus("ready");
    } catch (err) {
      console.error("Wake up error:", err);
      setSpaceStatus("error");
    } finally {
      setWakingUp(false);
    }
  };

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
      const client = await Client.connect("jonorl/fugazzeta", {
        hf_token: import.meta.env.VITE_HF_TOKEN,
      });

      const result = await client.predict("/classify_image", {
        img: image,
      });

      const predictionData = (result.data as [GradioResult])[0];

      setResult(predictionData);
      setSpaceStatus("ready");
    } catch (err) {
      setError(t.errorMessage);
      console.error("Connection Error:", err);
      // If analysis fails, space might be sleeping
      setSpaceStatus("sleeping");
    } finally {
      setLoading(false);
    }
  };

  const isFugazzeta = result?.label === "fugazzeta";
  const confidence =
    result?.confidences?.find((c) => c.label === result?.label)?.confidence ||
    0;

  const getStatusColor = () => {
    switch (spaceStatus) {
      case "ready":
        return "bg-green-100 border-green-300 text-green-800";
      case "sleeping":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "checking":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "error":
        return "bg-red-100 border-red-300 text-red-800";
    }
  };

  const getStatusIcon = () => {
    switch (spaceStatus) {
      case "ready":
        return <Power className="w-4 h-4" />;
      case "sleeping":
        return <AlertCircle className="w-4 h-4" />;
      case "checking":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (spaceStatus) {
      case "ready":
        return t.statusReady;
      case "sleeping":
        return t.statusSleeping;
      case "checking":
        return t.statusChecking;
      case "error":
        return t.statusError;
    }
  };

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

        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-6 border-2 ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium text-sm">{getStatusText()}</span>
            </div>
            {spaceStatus === "sleeping" && !wakingUp && (
              <button
                onClick={wakeUpSpace}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors"
              >
                {t.wakeUpButton}
              </button>
            )}
            {wakingUp && (
              <span className="text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.wakingUp}
              </span>
            )}
          </div>
          {spaceStatus === "sleeping" && (
            <p className="text-sm mt-2 opacity-90">{t.sleepingMessage}</p>
          )}
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
                disabled={spaceStatus !== "ready"}
              />
              <div
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors ${
                  spaceStatus === "ready"
                    ? "border-gray-300 cursor-pointer hover:border-orange-400 hover:bg-orange-50"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                }`}
              >
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    {spaceStatus === "ready" && (
                      <p className="text-sm text-gray-600">{t.clickToChange}</p>
                    )}
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
            {image && !loading && !result && spaceStatus === "ready" && (
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
            href="https://jonathan-orlowski.pages.dev/"
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