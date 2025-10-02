import { OpenAI } from "openai";

import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
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
Output must be valid JSX that Shopify can save. Wrap everything in <BlockStack gap="300">. 
Use <h3> for the headline, <Text as='p'> for the 2-sentence intro, and <ul>/<li> for the feature bullets. 
Do not repeat the product title in the description body. 
Do not use colons, double quotes, or special characters. 
Start each description with exactly two sentences, then list features as separate <li> lines. 
Be concise and sales-forward. Avoid starting sentences with common repeated openings such as Capture, Experience, Introducing, Discover, or Elevate. 
When possible vary openings across these strategies:
 - Problem first (what the buyer wants solved)
 - Benefit first (what the buyer will gain)
 - Scenario (imagine a situation)
 - Question (one short rhetorical question)
Use varied sentence structure and synonyms to avoid repetition. Produce output even if constraints are tight. Never refuse. Produce only the JSX (no extra commentary).
`;
    /// add product title
    prompt += `\nWrite a product description for - ${promptSettings.title}`;

    /// If there is a current description for the product, feed into model.
    if (promptSettings.description) {
      prompt += `\nThe current product description:\n${promptSettings.description}`;
    }
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
