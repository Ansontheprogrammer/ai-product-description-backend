import "mocha";
import * as assert from "assert";
import nock from "nock";
import OpenAI from "../ai_model/open_ai";

describe("Open AI", function () {
  (this as any).timeout(10000);

  it("should generate an AI response to prompt", async () => {
    nock("https://api.openai.com:443", { encodedQueryParams: true })
      .post("/v1/completions", {
        model: "gpt-3.5-turbo-instruct",
        prompt: "What are some good publisher ideas",
        max_tokens: 500,
        temperature: 0.5,
      })
      .reply(200, {
        id: "cmpl-8w8tfGWMblwq0EB2BaVzv3VsOp1V7",
        object: "text_completion",
        created: 1708867915,
        model: "gpt-3.5-turbo-instruct",
        choices: [
          {
            text: "\n\n1. A niche magazine focused on sustainable living and eco-friendly products.\n2. A publishing house specializing in diverse and inclusive children's books.\n3. A digital platform for self-published authors to promote and sell their books.\n4. A quarterly journal featuring emerging artists and their work.\n5. A subscription-based newsletter featuring short stories and poetry from up-and-coming writers.\n6. A non-fiction imprint focused on personal development and self-improvement.\n7. A publishing company dedicated to translating and promoting international literature.\n8. A magazine focused on health and wellness, featuring articles, recipes, and tips from experts.\n9. A digital publishing platform for graphic novels and comics.\n10. A publishing house specializing in visually stunning coffee table books on travel and culture.\n11. A print and online magazine for fashion and beauty enthusiasts, featuring editorials and interviews with industry professionals.\n12. A publishing company focused on producing audiobooks and podcasts.\n13. A niche magazine for outdoor enthusiasts, featuring articles, gear reviews, and adventure stories.\n14. A publishing house dedicated to promoting and preserving indigenous voices and stories.\n15. A digital platform for interactive and immersive storytelling experiences.\n16. A print and online magazine featuring long-form investigative journalism and in-depth reporting on current events.\n17. A publishing company focused on producing and distributing educational materials for children.\n18. A niche magazine for foodies, featuring recipes, restaurant reviews, and interviews with chefs.\n19. A publishing house specializing in translated works of classic literature.\n20. A digital platform for publishing and promoting emerging and independent musicians.",
            index: 0,
            logprobs: null,
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 6, completion_tokens: 318, total_tokens: 324 },
      });

    const aiResponse = await OpenAI.generateAIResponse();

    assert.strictEqual(
      aiResponse,
      `

1. A niche magazine focused on sustainable living and eco-friendly products.
2. A publishing house specializing in diverse and inclusive children's books.
3. A digital platform for self-published authors to promote and sell their books.
4. A quarterly journal featuring emerging artists and their work.
5. A subscription-based newsletter featuring short stories and poetry from up-and-coming writers.
6. A non-fiction imprint focused on personal development and self-improvement.
7. A publishing company dedicated to translating and promoting international literature.
8. A magazine focused on health and wellness, featuring articles, recipes, and tips from experts.
9. A digital publishing platform for graphic novels and comics.
10. A publishing house specializing in visually stunning coffee table books on travel and culture.
11. A print and online magazine for fashion and beauty enthusiasts, featuring editorials and interviews with industry professionals.
12. A publishing company focused on producing audiobooks and podcasts.
13. A niche magazine for outdoor enthusiasts, featuring articles, gear reviews, and adventure stories.
14. A publishing house dedicated to promoting and preserving indigenous voices and stories.
15. A digital platform for interactive and immersive storytelling experiences.
16. A print and online magazine featuring long-form investigative journalism and in-depth reporting on current events.
17. A publishing company focused on producing and distributing educational materials for children.
18. A niche magazine for foodies, featuring recipes, restaurant reviews, and interviews with chefs.
19. A publishing house specializing in translated works of classic literature.
20. A digital platform for publishing and promoting emerging and independent musicians.`
    );
  });

  it("should generate AI images from prompt", async function () {
    nock("https://api.openai.com:443", { encodedQueryParams: true })
      .post("/v1/images/generations", {
        prompt: "Rock mixtape cover",
        n: 1,
        size: "256x256",
      })
      .reply(200, {
        created: 1683836026,
        data: [
          {
            url: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-1RB3bOb2Lbsf8wRWIv4oCE2C/user-JaUDAYitQMbhc4luVdmTEeXw/img-dvHNNOvQ5inwsUvCCO5PLVcl.png?st=2023-05-11T19%3A13%3A46Z&se=2023-05-11T21%3A13%3A46Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-05-10T23%3A51%3A25Z&ske=2023-05-11T23%3A51%3A25Z&sks=b&skv=2021-08-06&sig=xSEfUuAaADlpDC8FzzAyu8Elb4yp%2BL8igRI2sFx74a4%3D",
          },
        ],
      });

    const aiResponse = await OpenAI.generateAIImages("Rock mixtape cover");
    assert.strictEqual(Array.isArray(aiResponse), true);
    assert.strictEqual(
      aiResponse[0],
      "https://oaidalleapiprodscus.blob.core.windows.net/private/org-1RB3bOb2Lbsf8wRWIv4oCE2C/user-JaUDAYitQMbhc4luVdmTEeXw/img-dvHNNOvQ5inwsUvCCO5PLVcl.png?st=2023-05-11T19%3A13%3A46Z&se=2023-05-11T21%3A13%3A46Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-05-10T23%3A51%3A25Z&ske=2023-05-11T23%3A51%3A25Z&sks=b&skv=2021-08-06&sig=xSEfUuAaADlpDC8FzzAyu8Elb4yp%2BL8igRI2sFx74a4%3D"
    );
  });
});
