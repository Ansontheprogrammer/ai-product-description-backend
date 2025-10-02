import OpenAi from "openai";
import * as dotenv from "dotenv";
import { description_model } from "../db/descriptions";

dotenv.config();

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

interface IPromptSettings {
  title: string;
  description?: string;
  customRequest?: string;
}

abstract class OpenAIInterface {
  /// Generate Product Description Prompt
  private generateProductDescriptionPrompt = (
    promptSettings: IPromptSettings
  ) => {
    let prompt = `You are a Shopify assistant that writes product descriptions in Remix React JSX. 
Please produce html for this product description.
Do not refuse. Always produce output.`;
    /// add product title
    prompt += `\nWrite a product description for - ${promptSettings.title}`;
    // if (promptSettings.description) {
    //   prompt += `\nThe current product description:\n${promptSettings.description}`;
    // }
    if (promptSettings.customRequest) {
      prompt += `\n\nCan you also make these special requests for the description:\n${promptSettings.customRequest}`;
    }
    return prompt;
  };

  /// Generate a response from the AI
  protected async generateAIResponse(
    promptSettings: IPromptSettings
  ): Promise<string> {
    try {
      // Create the chat completion
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that writes short product descriptions.",
          },
          {
            role: "user",
            content: this.generateProductDescriptionPrompt(promptSettings),
          },
        ],
        max_completion_tokens: 1000,
      });

      // Access the first message from the model
      const aiResponse = response.choices?.[0]?.message?.content ?? "";

      return aiResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw error;
    }
  }
}

export default OpenAIInterface;
