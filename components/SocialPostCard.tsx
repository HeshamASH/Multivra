
import React, { useState, useCallback } from 'react';
import { GeneratedPost, SocialPlatform } from '../types';
import { LinkedInIcon, TwitterIcon, InstagramIcon } from './IconComponents';
import { editImage, editText } from '../services/geminiService';

interface SocialPostCardProps {
  post: GeneratedPost;
}

const platformConfig = {
  [SocialPlatform.LinkedIn]: { Icon: LinkedInIcon, color: 'hover:bg-blue-600', bgColor: 'bg-blue-500' },
  [SocialPlatform.Twitter]: { Icon: TwitterIcon, color: 'hover:bg-gray-600', bgColor: 'bg-gray-500' },
  [SocialPlatform.Instagram]: { Icon: InstagramIcon, color: 'hover:bg-pink-600', bgColor: 'bg-pink-500' },
};

const SocialPostCard: React.FC<SocialPostCardProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  
  // State for image editing
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(post.image);
  const [editError, setEditError] = useState<string | null>(null);

  // State for AI text editing
  const [currentContent, setCurrentContent] = useState<string>(post.content);
  const [isEditingText, setIsEditingText] = useState(false);
  const [textEditPrompt, setTextEditPrompt] = useState('');
  const [isApplyingTextEdit, setIsApplyingTextEdit] = useState(false);
  const [textEditError, setTextEditError] = useState<string | null>(null);

  const { Icon, color, bgColor } = platformConfig[post.platform];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentContent]);
  
  const handleApplyImageEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || !currentImage) return;

    setIsApplyingEdit(true);
    setEditError(null);
    try {
        const newImage = await editImage(currentImage, editPrompt);
        setCurrentImage(newImage);
        setIsEditingImage(false);
        setEditPrompt('');
    } catch(err) {
        setEditError(err instanceof Error ? err.message : 'Failed to apply image edit.');
    } finally {
        setIsApplyingEdit(false);
    }
  };

  const handleApplyTextEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textEditPrompt.trim()) return;

    setIsApplyingTextEdit(true);
    setTextEditError(null);
    try {
      const newContent = await editText(currentContent, textEditPrompt);
      setCurrentContent(newContent);
      setIsEditingText(false);
      setTextEditPrompt('');
    } catch (err) {
      setTextEditError(err instanceof Error ? err.message : 'Failed to apply text edit.');
    } finally {
      setIsApplyingTextEdit(false);
    }
  };

  const handleSaveImage = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    const fileName = `ai-social-post-${post.platform.toLowerCase().replace('/x', '')}-${Date.now()}.png`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAspectRatioClass = (aspectRatio: string) => {
    return { '1:1': 'aspect-square', '16:9': 'aspect-video', '3:4': 'aspect-[3/4]' }[aspectRatio] || 'aspect-square';
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <Icon className="w-8 h-8 text-gray-300" />
                <h3 className="text-2xl font-bold text-white">{post.platform}</h3>
            </div>
            <button
                onClick={handleCopy}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${ copied ? 'bg-green-500' : `${bgColor} ${color}` }`}
            >
                {copied ? 'Copied!' : 'Copy Text'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="w-full">
                {currentImage ? (
                    <img src={currentImage} alt={`${post.platform} post visual`} className={`w-full h-auto object-cover rounded-lg ${getAspectRatioClass(post.aspectRatio)}`} />
                ) : (
                    <div className={`w-full bg-gray-700 rounded-lg flex items-center justify-center ${getAspectRatioClass(post.aspectRatio)}`}>
                        <p className="text-gray-400">Image failed to generate</p>
                    </div>
                )}
                 {currentImage && (
                    <div className="mt-3">
                        <div className="flex items-center gap-4">
                           <button onClick={() => setIsEditingImage(!isEditingImage)} className="text-sm text-purple-400 hover:text-purple-300 font-semibold" disabled={isApplyingEdit}>
                               {isEditingImage ? 'Cancel' : '✏️ Edit Image'}
                           </button>
                           <button onClick={handleSaveImage} className="text-sm text-teal-400 hover:text-teal-300 font-semibold">
                               💾 Save Image
                           </button>
                        </div>
                        {isEditingImage && (
                            <form onSubmit={handleApplyImageEdit} className="mt-2 space-y-2">
                                <input 
                                    type="text"
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    placeholder="e.g., add a retro filter"
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500"
                                />
                                <button type="submit" className="w-full px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50" disabled={isApplyingEdit || !editPrompt.trim()}>
                                    {isApplyingEdit ? 'Applying...' : 'Apply Edit'}
                                </button>
                                {editError && <p className="text-xs text-red-400">{editError}</p>}
                            </form>
                        )}
                    </div>
                )}
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg h-full flex flex-col justify-between">
                <p className="flex-grow text-gray-300 whitespace-pre-wrap font-sans leading-relaxed mb-4">
                    {currentContent}
                </p>
                <div className="mt-auto">
                    <button 
                        onClick={() => setIsEditingText(!isEditingText)} 
                        className="text-sm text-purple-400 hover:text-purple-300 font-semibold" 
                        disabled={isApplyingTextEdit}
                    >
                       {isEditingText ? 'Cancel' : '✏️ Edit Text with AI'}
                    </button>
                    {isEditingText && (
                        <form onSubmit={handleApplyTextEdit} className="mt-2 space-y-2">
                            <input 
                                type="text"
                                value={textEditPrompt}
                                onChange={(e) => setTextEditPrompt(e.target.value)}
                                placeholder="e.g., make it more witty"
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500"
                            />
                            <button 
                                type="submit" 
                                className="w-full px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50" 
                                disabled={isApplyingTextEdit || !textEditPrompt.trim()}
                            >
                                {isApplyingTextEdit ? 'Applying...' : 'Apply Edit'}
                            </button>
                            {textEditError && <p className="text-xs text-red-400">{textEditError}</p>}
                        </form>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPostCard;
