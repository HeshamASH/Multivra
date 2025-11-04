import React, { useState, useCallback } from 'react';
import { Tone, GeneratedPost, Audience } from './types';
import { TONES, AUDIENCES } from './constants';
import { generateSocialPosts } from './services/geminiService';
import SocialPostCard from './components/SocialPostCard';
import Loader from './components/Loader';
import ImageAnalyzer from './components/ImageAnalyzer';

const App: React.FC = () => {
  const [idea, setIdea] = useState<string>('');
  const [tone, setTone] = useState<Tone>(Tone.Professional);
  const [audience, setAudience] = useState<Audience>(Audience.General);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useGrounding, setUseGrounding] = useState<boolean>(false);
  const [useAdvancedAnalysis, setUseAdvancedAnalysis] = useState<boolean>(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('Please enter an idea.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPosts(null);

    try {
      const posts = await generateSocialPosts(idea, tone, audience, useGrounding, useAdvancedAnalysis);
      setGeneratedPosts(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [idea, tone, audience, useGrounding, useAdvancedAnalysis]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                AI Social Content Suite
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                Generate, refine, and analyze social media content. Turn one idea into tailored posts with AI-refined, platform-optimized images.
            </p>
        </header>

        <main>
          <div className="max-w-3xl mx-auto bg-gray-800/50 p-8 rounded-2xl shadow-2xl border border-gray-700">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="idea" className="block text-xl font-semibold mb-3 text-gray-200">1. Enter your content idea</label>
                <textarea
                  id="idea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g., Launching a new AI-powered productivity app..."
                  className="w-full h-32 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6 grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-semibold mb-3 text-gray-200">2. Select a tone</label>
                  <div className="flex flex-wrap gap-3">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${ tone === t ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}
                        disabled={isLoading}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                 <div>
                  <label className="block text-xl font-semibold mb-3 text-gray-200">3. Select an Audience</label>
                  <div className="flex flex-wrap gap-3">
                    {AUDIENCES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAudience(a)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${ audience === a ? 'bg-teal-600 text-white shadow-lg scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}
                        disabled={isLoading}
                      >{a}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-8 p-4 bg-gray-900/50 rounded-lg space-y-4">
                  <h3 className="text-xl font-semibold text-gray-200">4. Advanced Options</h3>
                  <div className="flex items-center justify-between">
                      <label htmlFor="grounding-toggle" className="flex flex-col cursor-pointer">
                          <span className="font-medium text-gray-300">Use Latest Info (via Google Search)</span>
                          <span className="text-sm text-gray-500">For posts about recent news or events.</span>
                      </label>
                      <button type="button" role="switch" aria-checked={useGrounding} onClick={() => setUseGrounding(!useGrounding)} className={`${useGrounding ? 'bg-purple-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`} id="grounding-toggle"><span className={`${useGrounding ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/></button>
                  </div>
                   <div className="flex items-center justify-between">
                      <label htmlFor="analysis-toggle" className="flex flex-col cursor-pointer">
                          <span className="font-medium text-gray-300">Advanced Image Refinement</span>
                          <span className="text-sm text-gray-500">AI art director analyzes and improves generated images. (Slower)</span>
                      </label>
                      <button type="button" role="switch" aria-checked={useAdvancedAnalysis} onClick={() => setUseAdvancedAnalysis(!useAdvancedAnalysis)} className={`${useAdvancedAnalysis ? 'bg-purple-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`} id="analysis-toggle"><span className={`${useAdvancedAnalysis ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/></button>
                  </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : '✨ Generate Content'}
              </button>
            </form>
          </div>

          <div className="mt-16">
            {isLoading && <Loader subMessage={useAdvancedAnalysis ? 'The AI Art Director is reviewing and refining your images. This advanced step takes a bit longer.' : undefined} />}
            {error && (
              <div className="text-center p-4 bg-red-900/50 border border-red-500 rounded-lg max-w-2xl mx-auto">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
              </div>
            )}
            {generatedPosts && (
              <div className="grid gap-8">
                {generatedPosts.map((post) => (
                  <SocialPostCard key={post.platform} post={post} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-20 pt-10 border-t border-gray-700">
             <ImageAnalyzer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
