import React, { useState, useRef, useEffect } from 'react';
import { diseaseService } from '../services/api';
import { Upload, Leaf, Search, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
    const [uiState, setUiState] = useState('idle');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [apiError, setApiError] = useState(null);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setAnalysisResult(null);
        setApiError(null);
        setUiState('idle');
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setUiState('loading');
        setApiError(null);
        
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const { data } = await diseaseService.analyze(formData);
            setAnalysisResult(data);
            setUiState('success');
        } catch (err) {
            console.error('Analysis failed:', err);
            setApiError({
                title: err.response?.data?.error || 'Analysis Failed',
                message: err.response?.data?.message || 'The system encountered an error while processing the image. Please try again.'
            });
            setUiState('error');
        }
    };

    const handleReset = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setApiError(null);
        setUiState('idle');
    };

    const triggerFileBrowser = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold text-green-900 tracking-tight">🌱 KrishiSathi AI</h1>
                <p className="text-lg text-gray-600">Instant Plant Disease Diagnosis & Treatment Remedies</p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                {uiState === 'error' && (
                    <ErrorStage error={apiError} onReset={handleReset} />
                )}
                
                {uiState === 'success' && (
                    <ResultStage result={analysisResult} preview={previewUrl} onReset={handleReset} />
                )}
                
                {(uiState === 'idle' || uiState === 'loading') && (
                    <UploadStage 
                        preview={previewUrl}
                        loading={uiState === 'loading'}
                        hasFile={!!selectedFile}
                        fileInputRef={fileInputRef}
                        onUploadClick={triggerFileBrowser}
                        onFileChange={handleFileChange}
                        onReset={handleReset}
                        onAnalyze={handleAnalyze}
                    />
                )}
            </div>
            
            <footer className="text-center pb-8 text-gray-400 text-sm font-medium">
                <p>© 2026 KrishiSathi AI • Intelligent Agricultural Assistant</p>
            </footer>
        </div>
    );
};

const UploadStage = ({ preview, loading, hasFile, fileInputRef, onUploadClick, onFileChange, onReset, onAnalyze }) => (
    <div className="p-8 md:p-12 text-center">
        <div 
            className={`border-4 border-dashed rounded-3xl p-10 transition-all duration-300 flex flex-col items-center justify-center min-h-[350px]
                ${loading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:border-green-400 hover:bg-green-50'}
                ${preview ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50'}`}
            onClick={() => !loading && onUploadClick()}
        >
            {preview ? (
                <img src={preview} alt="Preview" className="max-w-full max-h-[450px] rounded-2xl shadow-2xl border-4 border-white" />
            ) : (
                <>
                    <div className="bg-green-100 p-6 rounded-full mb-6">
                        <Upload className="w-12 h-12 text-green-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Upload Leaf Image</h3>
                    <p className="text-gray-500 mb-4">Drag and drop or click to browse files</p>
                    <p className="text-xs text-gray-400">Supports JPG, PNG, WEBP (Max 5MB)</p>
                </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} accept="image/*" />
        </div>

        {hasFile && !loading && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={onReset} className="btn btn-outline py-4 px-8 text-lg">
                    Change Image
                </button>
                <button onClick={onAnalyze} className="btn btn-primary py-4 px-10 text-lg flex items-center justify-center gap-2">
                    <Search className="w-6 h-6" />
                    <span>Start Analysis</span>
                </button>
            </div>
        )}

        {loading && (
            <div className="mt-8 space-y-4">
                <div className="spinner w-16 h-16 border-t-green-600"></div>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-green-800">AI is Analyzing...</h3>
                    <p className="text-gray-500">Identifying plant species and disease patterns</p>
                </div>
            </div>
        )}
    </div>
);

const ErrorStage = ({ error, onReset }) => (
    <div className="p-12 text-center space-y-6">
        <div className="text-red-600">
            <AlertCircle className="w-20 h-20 mx-auto" />
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-bold text-red-700">{error?.title}</h2>
            <p className="text-gray-600 text-lg max-w-lg mx-auto leading-relaxed">
                {error?.message}
            </p>
        </div>
        <button onClick={onReset} className="btn btn-primary py-4 px-10 flex items-center gap-2 mx-auto">
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
        </button>
    </div>
);

const ResultStage = ({ result, preview, onReset }) => {
    if (!result) return null;
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 md:p-10">
                <div className="grid md:grid-cols-5 gap-10 items-start">
                    <div className="md:col-span-2 space-y-6">
                        <div className="relative group">
                            <img src={preview} alt="Analyzed leaf" className="w-full rounded-3xl shadow-2xl border-4 border-white object-cover aspect-square" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                                <button onClick={onReset} className="bg-white text-green-800 p-4 rounded-full shadow-lg hover:scale-110 transition-transform">
                                    <RefreshCw className="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                        <button onClick={onReset} className="btn btn-outline w-full py-4 flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            <span>Analyze Another Leaf</span>
                        </button>
                    </div>
                    
                    <div className="md:col-span-3 space-y-8">
                        <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100 space-y-6">
                            <div className="flex items-center gap-3 text-green-700">
                                <CheckCircle2 className="w-8 h-8" />
                                <span className="font-bold uppercase tracking-widest text-sm">Diagnosis Complete</span>
                            </div>
                            <h2 className="text-4xl font-black text-green-900 leading-tight">
                                {result.disease}
                            </h2>
                            
                            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">AI Confidence Score</span>
                                    <span className="font-black text-green-700 text-2xl">{result.confidence?.toFixed(1)}%</span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-green-500 to-green-800 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${result.confidence}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="px-2 space-y-4">
                            <h3 className="text-2xl font-bold text-green-900 flex items-center gap-3">
                                <Leaf className="w-6 h-6" />
                                <span>About this condition</span>
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                {result.remedy?.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                    <div className="bg-white border border-green-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-3">
                            <span className="bg-green-100 p-3 rounded-2xl">🌿</span>
                            <span>Organic Control</span>
                        </h4>
                        <ul className="space-y-4">
                            {result.remedy?.organic?.map((item, i) => (
                                <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                                    <span className="text-green-500 font-bold">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-white border border-orange-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-xl font-bold text-orange-800 mb-6 flex items-center gap-3">
                            <span className="bg-orange-50 p-3 rounded-2xl">🧪</span>
                            <span>Chemical Control</span>
                        </h4>
                        <ul className="space-y-4">
                            {result.remedy?.chemical?.map((item, i) => (
                                <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                                    <span className="text-orange-500 font-bold">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;