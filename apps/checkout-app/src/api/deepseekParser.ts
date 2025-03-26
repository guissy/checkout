interface ChatCompletionChunkDelta {
  role?: string;
  content?: string;
}

interface ChatCompletionChunkChoice {
  index: number;
  delta: ChatCompletionChunkDelta;
  logprobs: null;
  finish_reason: null | string;
}

interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint: string;
  choices: ChatCompletionChunkChoice[];
}

// Function to process the SSE stream chunks
export function processSSEChunk(chunk: string): string {
  // Split by newlines to handle multiple data events in one chunk
  const lines = chunk.split("\n");
  let mergedText = "";

  for (const line of lines) {
    // Only process lines that start with "data: "
    if (line.startsWith("data: ")) {
      try {
        // Remove the "data: " prefix and parse JSON
        const jsonData = line.replace(/^data: /, "");
        if (jsonData !== "[DONE]") {
          const data = JSON.parse(jsonData) as ChatCompletionChunk;
          // Extract content if it exists
          mergedText += data?.choices[0]?.delta?.content || "";
        } else {
          // console.log("Stream finished");
          return mergedText;
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return mergedText;
      }
    }
  }

  return mergedText;
}

