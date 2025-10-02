// __mocks__/openai.js
class MockOpenAI {
  constructor(config) {
    this.apiKey = config.apiKey;
  }

  chat = {
    completions: {
      create: jest.fn(async (options) => {
        // You can customize the mocked response
        return {
          id: "mock-id",
          object: "chat.completion",
          choices: [
            {
              message: {
                role: "assistant",
                content: "<BlockStack><h3>Snowboard</h3></BlockStack>",
              },
            },
          ],
        };
      }),
    },
  };
}

module.exports = {
  OpenAI: MockOpenAI,
};
