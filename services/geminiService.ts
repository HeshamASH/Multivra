import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeneratedPost, SocialPlatform, SocialPostText, Tone, Audience } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper Functions ---

const dataUrlToGenerativePart = (dataUrl: string) => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return {
        inlineData: { data, mimeType }
    };
};

// --- Text Generation ---

const generateTextPrompt = (idea: string, tone: Tone, audience: Audience): string => `
You are an expert social media manager. Based on the following idea, desired tone, and target audience, generate social media posts for LinkedIn, Twitter/X, and Instagram.

**Idea:** ${idea}
**Tone:** ${tone}
**Target Audience:** ${audience}

**Instructions:**
1.  **LinkedIn:** Write a professional, slightly longer post tailored for the specified audience. Use professional language and structure it for engagement (e.g., ask a relevant question at the end).
2.  **Twitter/X:** Write a short, punchy tweet (well under 280 characters) that will resonate with the target audience. Use 2-3 relevant hashtags and a strong, concise message.
3.  **Instagram:** Write a visually-focused caption. Start with a hook that grabs the audience's attention, provide value or tell a short story relevant to them, and include a set of 5-7 relevant, popular hashtags.

Return ONLY a valid JSON object with the keys "linkedin", "twitter", and "instagram". Do not include any other text or markdown formatting like \`\`\`json.
`;

const generateTextStandard = async (idea: string, tone: Tone, audience: Audience): Promise<SocialPostText> => {
     const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: generateTextPrompt(idea, tone, audience),
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    linkedin: { type: Type.STRING },
                    twitter: { type: Type.STRING },
                    instagram: { type: Type.STRING },
                },
                required: ["linkedin", "twitter", "instagram"]
            }
        }
    });
    return JSON.parse(textResponse.text);
};

const generateTextWithGrounding = async (idea: string, tone: Tone, audience: Audience): Promise<SocialPostText> => {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: generateTextPrompt(idea, tone, audience),
        config: {
            tools: [{googleSearch: {}}],
        },
    });
    // Attempt to parse a JSON object from the potentially markdown-formatted response
    const text = result.text.replace(/^```json\s*|```\s*$/g, '');
    return JSON.parse(text);
};


// --- Image Generation & Editing Workflow ---

const generateBaseImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '3:4'): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
};

const analyzeAndSuggestEdit = async (imageDataUrl: string, originalPrompt: string): Promise<string> => {
    const imagePart = dataUrlToGenerativePart(imageDataUrl);
    const analysisPrompt = `You are a world-class art director. You are given an image that was generated based on the following prompt: '${originalPrompt}'. Your task is to analyze the image for quality, accuracy, and aesthetic appeal. Provide a concise, actionable instruction for an image editing AI to improve it. The instruction should be a direct command, like 'Add a subtle lens flare in the top left corner' or 'Make the person's smile more genuine'. If the image is already excellent and needs no changes, respond with the exact word 'PERFECT'. Do not add any other explanations or pleasantries. Just the editing command or 'PERFECT'.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, { text: analysisPrompt }] },
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });

    return response.text.trim();
};

export const editImage = async (imageDataUrl: string, editPrompt: string): Promise<string> => {
    const imagePart = dataUrlToGenerativePart(imageDataUrl);
    const textPart = { text: editPrompt };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("Failed to edit image.");
};

const generateImageWithRefinement = async (prompt: string, aspectRatio: '1:1' | '16:9' | '3:4'): Promise<string> => {
    const initialImage = await generateBaseImage(prompt, aspectRatio);
    const suggestion = await analyzeAndSuggestEdit(initialImage, prompt);

    if (suggestion.toUpperCase() === 'PERFECT') {
        return initialImage;
    }
    
    console.log(`Applying AI-suggested edit: "${suggestion}"`);
    return await editImage(initialImage, suggestion);
};

// --- Text Editing ---

export const editText = async (originalText: string, editPrompt: string): Promise<string> => {
    const prompt = `
You are an expert copy editor. You are given the following text and an instruction to edit it.
Rewrite the text to fulfill the instruction precisely.

**Original Text:**
"${originalText}"

**Instruction:**
"${editPrompt}"

Return ONLY the rewritten text. Do not add any introductory phrases, explanations, or markdown formatting. Just the final, edited text.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};


// --- Public Service Functions ---

export const analyzeUploadedImage = async (file: File, prompt: string): Promise<string> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });

    const imagePart = {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] }
    });
    
    return response.text;
};

export const generateSocialPosts = async (
    idea: string,
    tone: Tone,
    audience: Audience,
    useGrounding: boolean,
    useAdvancedAnalysis: boolean
): Promise<GeneratedPost[]> => {
    try {
        const textPromise = useGrounding 
            ? generateTextWithGrounding(idea, tone, audience)
            : generateTextStandard(idea, tone, audience);
            
        const imageGenerationFunc = useAdvancedAnalysis
            ? generateImageWithRefinement
            : generateBaseImage;

        const imagePrompt = `Create a vibrant, high-quality, cinematic photograph representing the concept of: '${idea}'. The mood should be ${tone}, and the style should appeal to ${audience}. Focus on photorealism and dynamic lighting.`;

        const [socialTexts, ...imageResults] = await Promise.all([
            textPromise,
            ...([
                { platform: SocialPlatform.LinkedIn, aspectRatio: '1:1' },
                { platform: SocialPlatform.Twitter, aspectRatio: '16:9' },
                { platform: SocialPlatform.Instagram, aspectRatio: '3:4' },
            ] as const).map(p => 
                imageGenerationFunc(imagePrompt, p.aspectRatio)
                    // FIX: Use 'as const' to create literal types for 'status', enabling discriminated union type narrowing.
                    .then(image => ({ status: 'fulfilled' as const, value: image, ...p }))
                    .catch(error => ({ status: 'rejected' as const, reason: error, ...p }))
            )
        ]);

        const platformOrder = [SocialPlatform.LinkedIn, SocialPlatform.Twitter, SocialPlatform.Instagram];
        const posts: GeneratedPost[] = platformOrder.map(platform => {
            const imageData = imageResults.find(r => r.platform === platform);
            const contentKey = platform.toLowerCase().replace('/x', '') as keyof SocialPostText;
            return {
                platform,
                content: socialTexts[contentKey],
                aspectRatio: imageData!.aspectRatio,
                image: imageData?.status === 'fulfilled' ? imageData.value : null,
            };
        });

        return posts;

    } catch (error) {
        console.error("Error generating social media content:", error);
        throw new Error("Failed to generate content. Please check the console for details.");
    }
};
