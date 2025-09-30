import OpenAi from "openai";
import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

interface IPromptSettings {
  title: string;
  description?: string;
  customRequest?: string;
}
class OpenAIInterface {
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
  async generateProductDescription(promptSettings: IPromptSettings) {
    try {
      const productDescription = await this.generateAIResponse(
        this.generateProductDescriptionPrompt(promptSettings)
      );
      return productDescription;
    } catch (error) {
      throw error;
    }
  }
  /// Generate a response from the AI
  private async generateAIResponse(
    prompt: string = "What are some good publisher ideas"
  ): Promise<string> {
    try {
      console.log(
        "Beginning to generate product description using model...",
        prompt
      );

      // Create the chat completion
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that writes short product descriptions.",
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 1000,
      });

      // Access the first message from the model
      const aiResponse = response.choices?.[0]?.message?.content ?? "";

      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Received response:",
          response.choices?.[0]?.message?.content
        );
      }

      return aiResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw error;
    }
  }

  /// Wait for a certain amount of time
  private wait = (ms) => new Promise((res) => setTimeout(res, ms));

  /// Retry a function 8 times with an exponential backoff
  private async callWithRetry(fn, depth = 0) {
    try {
      return await fn();
    } catch (error) {
      if (error.response) {
        console.error("Request failed retrying...", error.response.statusText);
        console.error(error.response.data || error.response.statusText);
      }

      if (error.data) {
        console.error(error.data);
      }

      if (depth > 3) {
        throw error;
      }
      await this.wait(2 ** depth * 10000);
      return this.callWithRetry(fn, depth + 1);
    }
  }
}
const OpenAI = new OpenAIInterface();

export default OpenAI;
