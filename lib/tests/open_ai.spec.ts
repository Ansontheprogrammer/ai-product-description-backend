// tests/system.test.ts
import dotenv from "dotenv";
import { db } from "../db/client.server";
import { addDoc, collection } from "@firebase/firestore";
import OpenAIInterface from "../ai_model/open_ai";
import { getDocs } from "firebase/firestore";

dotenv.config();
// Create a concrete subclass for testing
class TestOpenAI extends OpenAIInterface {
  public async runPrompt(settings: any) {
    return this.generateAIResponse(settings);
  }
}
const testInstance = new TestOpenAI();
describe("System Checks", () => {
  it("should make sure Firestore is online", async () => {
    const systemCollection = collection(db, "system-test");
    await addDoc(systemCollection, {
      online: "ping",
      datetime: new Date(),
    });
  });

  it("should make sure 'descriptions' collections exist", async () => {
    const descriptionCollection = collection(db, "descriptions");
    const querySnapshot = await getDocs(descriptionCollection);
    expect(querySnapshot.docs.length > 1);
  });

  it("should build the prompt with title only", async () => {
    const promptSettings = { title: "Snowboard" };

    const result = await testInstance.runPrompt(promptSettings);

    expect(result).toContain("<BlockStack>");
    expect(result).toContain("<h3>Snowboard</h3>");
  });

  it("should make a request to OpenAI using model 4.1.0", async () => {
    jest.unmock("openai"); // <- Bypass the mock for this test
    const OpenAI = (await import("openai")).default; // Import after unmocking

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: "Say 'Hello World!'",
        },
      ],
    });

    expect(response.choices[0].message.content).toMatch(/Hello World!/i);
  });
});
