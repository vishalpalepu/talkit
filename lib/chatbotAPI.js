export const getBotReplyGemini = async (userMessage) => {
  console.log("inside the getBotReplyGemini function");

  if (!userMessage || userMessage.trim() === "") {
    return "Please provide a valid message.";
  }

  try {
    const response = await fetch("https://talkito-34as.onrender.com/talkito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `
You are Talkito, an intelligent assistant specialized in providing clear, concise, and helpful answers. 
Always provide answers that are accurate, relevant, and easy to understand. 
If the question is ambiguous, ask for clarification. 
Keep answers polite and professional.

User Question: "${userMessage}"
Answer:
    `,
      }),
    });

    const data = await response.json();

    if (data.reply) {
      return data.reply;
    } else if (data.error) {
      return "Error from Talkito: " + data.error;
    } else {
      return "Unexpected response from Talkito.";
    }
  } catch (error) {
    console.error("Error calling Talkito backend:", error);
    return "Something went wrong while getting response from Talkito.";
  }
};
