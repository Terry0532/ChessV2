import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

interface UseChessAIReturn {
  getSuggestion: (moves: string[], boardState?: any) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export const useChessAI = (): UseChessAIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestion = async (
    moves: string[],
    boardState?: any
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.REACT_APP_GEMINI_API_KEY,
      });

      const config = {
        responseMimeType: "text/plain",
      };

      const model = "gemini-2.5-flash-preview-04-17";

      const prompt =
        "Analyze this chess game and suggest the best next move. " +
        "Game moves so far: " +
        moves.join(", ") +
        ". Please suggest the best move in standard algebraic notation (e.g., 'e4', 'Nf3', 'O-O', 'Qxd5'). " +
        "Only return the move notation, nothing else.";

      const contents = [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ];

      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      let result = "";
      for await (const chunk of response) {
        result += chunk.text;
      }

      return result.trim();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get AI suggestion";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { getSuggestion, loading, error };
};
