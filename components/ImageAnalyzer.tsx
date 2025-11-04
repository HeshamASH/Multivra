import React, { useState, useCallback } from 'react';
import { analyzeUploadedImage } from '../services/geminiService';
import Loader from './Loader';

const ImageAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [result, setResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!file || !prompt.trim()) {
            setError("Please upload an image and enter a question or prompt.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const analysisResult = await analyzeUploadedImage(file, prompt);
            setResult(analysisResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [file, prompt]);

    return (
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">
                Analyze an Image
            </h2>
            <p className="text-lg text-gray-400 mb-8">
                Upload an image and ask Gemini anything about it.
            </p>

            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border border-gray-700">
                {!preview && (
                     <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center">
                        <label htmlFor="file-upload" className="cursor-pointer text-purple-400 font-semibold hover:text-purple-300">
                           Choose an image to upload
                        </label>
                        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WEBP</p>
                    </div>
                )}

                {preview && (
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <div className="text-left">
                            <img src={preview} alt="Image preview" className="rounded-lg max-h-80 w-auto mx-auto md:mx-0 mb-4" />
                             <label htmlFor="file-upload-replace" className="cursor-pointer text-sm text-purple-400 hover:text-purple-300 font-semibold">
                                Change image
                            </label>
                             <input id="file-upload-replace" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="space-y-4 text-left">
                             <div>
                                <label htmlFor="analysis-prompt" className="block text-md font-semibold mb-2 text-gray-200">What do you want to know?</label>
                                <textarea
                                    id="analysis-prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., Describe this image in detail. What objects are in this photo?"
                                    className="w-full h-28 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors"
                                    disabled={isAnalyzing}
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !prompt.trim()}
                                className="w-full py-3 text-md font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg hover:from-teal-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8">
                {isAnalyzing && <Loader message="Analyzing Image..." subMessage="The AI is looking closely at your image to answer your question." />}
                {error && (
                    <div className="text-center p-4 bg-red-900/50 border border-red-500 rounded-lg max-w-2xl mx-auto">
                        <p className="font-bold">An Error Occurred</p>
                        <p>{error}</p>
                    </div>
                )}
                {result && (
                    <div className="bg-gray-800/50 p-6 rounded-lg text-left max-w-3xl mx-auto">
                        <h3 className="text-xl font-bold mb-3 text-gray-100">Analysis Result:</h3>
                        <p className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{result}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageAnalyzer;
