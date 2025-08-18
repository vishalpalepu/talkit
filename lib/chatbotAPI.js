export const getBotReplyGemini = async (userMessage) => {
  console.log("inside the getBotReplyGemini function");

  if (!userMessage || userMessage.trim() === "") {
    return "Please provide a valid message.";
  }

  try {
    const response = await fetch("http://localhost:8000/talkito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt:
          "your name is talkito , the next is my prompt answer it" +
          userMessage,
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
