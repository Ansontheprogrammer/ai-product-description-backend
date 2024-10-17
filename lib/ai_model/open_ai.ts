import { Configuration, OpenAIApi } from "openai";

import * as dotenv from "dotenv";

/// Load enviroment variables
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

interface IPromptSettings {
  title: string;
  description?: string;
  customRequest?: string;
}
class OpenAIInterface {
  /// Generate chat response from the AI
  async generateAIChatResponse(message: string) {
    try {
      const response = await this.callWithRetry(() =>
        openai.createChatCompletion({
          model: "gpt-3.5-turbo-instruct",
          messages: [{ role: "user", content: message }],
        })
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw error.response.data.error;
    }
  }
  /// Generate a list of images from the AI
  async generateAIImages(prompt: string) {
    try {
      const response = await this.callWithRetry(() =>
        openai.createImage({
          prompt,
          n: 1,
          size: "256x256",
        })
      );

      return response.data.data.map((images) => images.url);
    } catch (error) {
      throw error.response.data.error;
    }
  }

  /// Generate Product Description Prompt
  private generateProductDescriptionPrompt = (
    promptSettings: IPromptSettings
  ) => {
    let prompt = `
  This needs to be all in Remix React format!
  The code block also has to make sure syntax is perfect!
  Must start the code block wrapped with <BlockStack gap="300">
  For example:
          <BlockStack gap="500">
            <ul>
              <li></li>
            </ul>
            <Text as='p'></Text>
          </BlockStack>
  Substitute <p> for <Text as='p'></Text>
  Use <ul> for lists
  Use <li> for bullet items
  Substitute <h3> for <Text variant="bodyMd" fontWeight="bold" as="h3"></Text>
  Can you make a shopify product description for sales for the following product.


   Don't use the words introducing or ultimate.
   Don't repeat the title in description
   Put bullet points on new lines
   Only 2 sentences about the product the rest of the descriptions should be bullet points.
   No colons, quotations or special characters.
   Also use the following information?`;
    /// add product title
    prompt += `\nProduct Title - ${promptSettings.title}`;
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
  async generateAIResponse(
    prompt: string = "What are some good publisher ideas"
  ) {
    try {
      const response = await this.callWithRetry(() =>
        openai.createCompletion({
          model: "gpt-3.5-turbo-instruct",
          prompt,
          max_tokens: 500,
          temperature: 0.5,
        })
      );

      const aiResponse = response.data.choices[0].text;
      if (process.env.NODE_ENV !== "production") {
        console.log({ prompt }, { aiResponse });
      }
      return aiResponse;
    } catch (error) {
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
