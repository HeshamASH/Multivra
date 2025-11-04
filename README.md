<pre><code>
.----------------.  .----------------.  .----------------.
| .--------------. || .--------------. || .--------------. |
| |      __      | || |     _____    | || |    ______    | |
| |     /  \     | || |    |_   _|   | || |  .' ____ '.  | |
| |    / /\ \    | || |      | |     | || |  | (____) |  | |
| |   / ____ \   | || |      | |     | || |  '_.____. |  | |
| | _/ /    \ \_ | || |     _| |_    | || |  | (____)| |  | |
| ||____|  |____|| || |    |_____|   | || |   \______.'  | |
| |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'
</code></pre>

# AI Social Content Suite

> An AI-powered suite to generate, edit, analyze, and optimize social media content across LinkedIn, Twitter/X, and Instagram.

---

## ✨ Key Features

This application is more than just a content generator; it's a comprehensive toolset for the modern social media manager.

-   **Multi-Platform Generation:** Input a single idea and get tailored posts for LinkedIn (professional), Twitter/X (punchy), and Instagram (visual-focused), all generated simultaneously.
-   **Platform-Optimized Images:** Automatically generates unique, high-quality images for each post, perfectly sized with the optimal aspect ratio for each network (1:1, 16:9, 3:4).
-   **Two-Agent Image Refinement:** An optional advanced workflow where a second AI "Art Director" agent (`gemini-2.5-pro`) analyzes the initial image and provides precise feedback to an editing AI (`gemini-2.5-flash-image`) for automated improvements, ensuring top-tier visual quality.
-   **Interactive AI Editing:**
    -   **Image Editor:** Modify any generated image with simple text prompts. Type "add a retro filter" or "make the colors more vibrant," and the AI will regenerate the image accordingly.
    -   **Text Editor:** Refine any generated text with AI assistance. Ask it to "make this more witty" or "add a call to action," and get instant revisions.
-   **Search Grounding:** Keep your content relevant and timely. An optional toggle uses Google Search to ground the AI's text generation in the latest information, perfect for posts about current events.
-   **Image Analyzer:** Upload your own images and use Gemini's multimodal capabilities to understand them. Ask questions, get descriptions, identify objects, and more.
-   **Save & Copy:** Easily save your generated images and copy the post text to your clipboard with one-click buttons.

---

## 🚀 How to Use

1.  **Enter Idea:** Start by typing your core content idea into the main text area.
2.  **Select Tone & Audience:** Choose the desired tone and target audience for your posts.
3.  **Choose Advanced Options (Optional):**
    -   Toggle **"Use Latest Info"** to ground the text in recent Google Search results.
    -   Toggle **"Advanced Image Refinement"** to enable the two-agent image analysis workflow for higher quality (note: this is slower).
4.  **Generate:** Click the "Generate Content" button. The app will create posts for LinkedIn, Twitter/X, and Instagram.
5.  **Review & Refine:**
    -   Use the "✏️ Edit Image" and "✏️ Edit Text with AI" buttons to make AI-powered adjustments.
    -   Use the "💾 Save Image" and "Copy Text" buttons to export your final content.
6.  **Analyze (Separate Tool):**
    -   Scroll down to the "Analyze an Image" section.
    -   Upload an image file and type a question or prompt about it.
    -   Click "Analyze Image" to get insights from the AI.

---
## 🧠 AI Agent Workflow

This application's core logic is orchestrated through a workflow of specialized AI agents that collaborate to fulfill the user's request. The diagram below illustrates this process from initial input to final, editable content.

```
[User Input: Idea, Tone, Audience, Options]
           |
           v
[App Orchestrator]
    |
    +-----> [Text Generation Task] ------------------------------------------------------------------------------------------------> [Post Text]
    |           |
    |           +-- (If 'Use Latest Info' is ON) --> [Agent 1A: Grounded Writer (gemini-2.5-flash)] -> Uses [Google Search Tool] -> Generates JSON
    |           |
    |           +-- (If 'Use Latest Info' is OFF) -> [Agent 1B: Creative Writer (gemini-2.5-pro)] ----------------------------------> Generates JSON
    |
    |
    +-----> [Image Generation Task (for each platform: LinkedIn, Twitter/X, Instagram)] --------------------------------------------> [Post Image]
                |
                v
                [Agent 2: Image Generator (imagen-4.0-generate-001)] -> Creates [Base Image]
                |
                +-- (If 'Advanced Refinement' is OFF) ------------------------------------------------------------------------------> [Final Image]
                |
                +-- (If 'Advanced Refinement' is ON) --> [Agent 3: Art Director (gemini-2.5-pro)]
                                                              |
                                                              v
                                                              Analyzes [Base Image] -> Outputs ("PERFECT" or "Edit Prompt")
                                                              |
                                                              +-- (If "PERFECT") --------------------------------------------------> [Final Image]
                                                              |
                                                              +-- (If "Edit Prompt") --> [Agent 4: Image Editor (gemini-2.5-flash-image)]
                                                                                            |
                                                                                            v
                                                                                            Applies edit to [Base Image] ----------> [Refined Image] -> [Final Image]


[Final Output Displayed to User]
    |
    +-----> [User activates 'Edit Text with AI' with a prompt] -> [Agent 5: Copy Editor (gemini-2.5-flash)] -> Rewrites Text -> [Updated Post Text]
    |
    +-----> [User activates 'Edit Image' with a prompt] ------> [Agent 4: Image Editor (gemini-2.5-flash-image)] -> Edits Image -> [Updated Post Image]
```

**Workflow Explanation:**

1.  **Orchestration:** The main application takes the user's inputs and initiates two parallel tasks: one for generating all the text content and another for generating an image for each social platform.
2.  **Text Generation:**
    -   If the user enables **"Use Latest Info"**, the task is routed to a `gemini-2.5-flash` agent equipped with the **Google Search tool** to create timely, grounded content.
    -   Otherwise, the task is handled by a more powerful `gemini-2.5-pro` agent for high-quality creative writing. Both agents are instructed to return a clean JSON object.
3.  **Image Generation:**
    -   The `imagen-4.0-generate-001` agent creates a high-quality base image for each platform, respecting the required aspect ratio.
    -   If **"Advanced Image Refinement"** is active, the process continues:
        -   The `gemini-2.5-pro` agent acts as an **Art Director**, analyzing the base image in the context of the original prompt.
        -   It either approves the image ("PERFECT") or issues a concise editing command.
        -   If an edit is required, the `gemini-2.5-flash-image` agent executes the command, producing a refined final image.
4.  **Interactive Editing:** After generation, the user can initiate refinement loops. The editing agents (`gemini-2.5-flash` for text, `gemini-2.5-flash-image` for images) take the existing content and the user's new prompt to produce an updated version on the fly.

---

## 🛠️ Technology Stack

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Engine:** Google Gemini API
-   **Core Models Used:**
    -   `gemini-2.5-pro`: For complex text generation and advanced image analysis.
    -   `gemini-2.5-flash`: For standard text generation, AI text editing, and image analysis.
    -   `imagen-4.0-generate-001`: For high-quality base image generation.
    -   `gemini-2.5-flash-image`: For powerful, prompt-based image editing.
-   **Tooling:** Vite, Esbuild

---

## 🤖 AI Studio Category (Prompts Used)

Here are the core prompts used within the application to instruct the Gemini models.

### 1. Social Post Text Generation

This prompt is sent to `gemini-2.5-pro` or `gemini-2.5-flash` to generate the text content for all three social platforms in a single, structured JSON response.

```
You are an expert social media manager. Based on the following idea, desired tone, and target audience, generate social media posts for LinkedIn, Twitter/X, and Instagram.

**Idea:** ${idea}
**Tone:** ${tone}
**Target Audience:** ${audience}

**Instructions:**
1.  **LinkedIn:** Write a professional, slightly longer post tailored for the specified audience. Use professional language and structure it for engagement (e.g., ask a relevant question at the end).
2.  **Twitter/X:** Write a short, punchy tweet (well under 280 characters) that will resonate with the target audience. Use 2-3 relevant hashtags and a strong, concise message.
3.  **Instagram:** Write a visually-focused caption. Start with a hook that grabs the audience's attention, provide value or tell a short story relevant to them, and include a set of 5-7 relevant, popular hashtags.

Return ONLY a valid JSON object with the keys "linkedin", "twitter", and "instagram". Do not include any other text or markdown formatting like ```json.
```

### 2. Base Image Generation

This prompt is sent to `imagen-4.0-generate-001` to create the initial images.

```
Create a vibrant, high-quality, cinematic photograph representing the concept of: '${idea}'. The mood should be ${tone}, and the style should appeal to ${audience}. Focus on photorealism and dynamic lighting.
```

### 3. AI Art Director Analysis (Advanced Refinement)

For the "Advanced Image Refinement" feature, this prompt is sent to `gemini-2.5-pro` to analyze the base image and suggest an edit.

```
You are a world-class art director. You are given an image that was generated based on the following prompt: '${originalPrompt}'. Your task is to analyze the image for quality, accuracy, and aesthetic appeal. Provide a concise, actionable instruction for an image editing AI to improve it. The instruction should be a direct command, like 'Add a subtle lens flare in the top left corner' or 'Make the person's smile more genuine'. If the image is already excellent and needs no changes, respond with the exact word 'PERFECT'. Do not add any other explanations or pleasantries. Just the editing command or 'PERFECT'.
```

### 4. AI-Powered Text Editing

When a user requests an edit to the generated text, this prompt is sent to `gemini-2.5-flash`.

```
You are an expert copy editor. You are given the following text and an instruction to edit it.
Rewrite the text to fulfill the instruction precisely.

**Original Text:**
"${originalText}"

**Instruction:**
"${editPrompt}"

Return ONLY the rewritten text. Do not add any introductory phrases, explanations, or markdown formatting. Just the final, edited text.
```
