class AI_App {
  name: string;
  description: string;
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}

const aiChat = new AI_App(
  "AI Chat",
  "This app allows you to have a conversation with an AI. Simply provide a message, and the AI will respond with a relevant answer. It's like chatting with a smart virtual assistant that can provide information and engage in conversation. Just type your message, and the AI will reply with a helpful response."
);

const aiPrompt = new AI_App(
  "Open Prompt",
  "This app allows you to get AI-generated responses to your questions or prompts. If you need suggestions, ideas, or just want to see what the AI comes up with, simply provide a prompt or question. The AI will generate a response for you, giving you valuable insights or creative suggestions. If you don't provide a prompt, it will use a default one. It's like having an AI advisor at your fingertips, ready to provide helpful information whenever you need it."
);

const aiImages = new AI_App(
  "AI Artwork",
  "This app allows you to generate custom images using the power of AI. Just provide a prompt or description of the image you want, and the AI will create it for you. It's like having an AI artist that can generate unique images based on your ideas. You'll receive a list of image URLs that you can use and share as you wish."
);

export const aiApps = [aiChat, aiPrompt, aiImages];
