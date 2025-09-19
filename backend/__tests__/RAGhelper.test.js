const { getAnswerWithContext } = require("../utils/RAGhelper.js");
const { searchChroma } = require("../services/chromaService");
const { getAIResponse } = require("../services/Apicaller");

jest.mock("../services/chromaService");
jest.mock("../services/Apicaller");
jest.mock("chromadb", () => ({
    ChromaClient: jest.fn().mockImplementation(() => ({
      getOrCreateCollection: jest.fn().mockResolvedValue({}),
    })),
  }));
  
  jest.mock("@chroma-core/default-embed", () => ({
    DefaultEmbeddingFunction: jest.fn(),
  }));
  jest.mock("axios", () => ({
    post: jest.fn().mockResolvedValue({
      data: { candidates: [{ content: { parts: [{ text: "Mocked response" }] } }] }
    }),
  }));
    


describe("getAnswerWithContext", () => {
    it("should return AI response when context exists", async () => {
      searchChroma.mockResolvedValue([
        { completion: "Reset password via settings.", distance: 0.2 }
      ]);
      getAIResponse.mockResolvedValue("You can reset your password in settings.");
  
      const result = await getAnswerWithContext("How do I reset my password?");
      expect(result).toContain("reset your password");
    });
  
    it("should handle no results gracefully", async () => {
      searchChroma.mockResolvedValue([]);
      getAIResponse.mockResolvedValue("Sorry, no info found.");
  
      const result = await getAnswerWithContext("Random question?");
      expect(result).toBe("Sorry, no info found.");
    });
  
    it("should return fallback if AI response is null", async () => {
      searchChroma.mockResolvedValue([]);
      getAIResponse.mockResolvedValue(null);
  
      const result = await getAnswerWithContext("Unknown?");
      expect(result).toBe("Sorry, I couldn't find that—try rephrasing.");
    });
  });