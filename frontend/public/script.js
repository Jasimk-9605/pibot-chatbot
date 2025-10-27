
document.addEventListener("DOMContentLoaded", function () {
  const chatButton = document.getElementById("chatButton");
  const chatContainer = document.getElementById("chatContainer");
  const closeChat = document.getElementById("closeChat");
  const chatBody = document.getElementById("chat");
  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const typingIndicator = document.getElementById("typingIndicator");
  const errorMessage = document.getElementById("errorMessage");

  // Toggle chat visibility
  chatButton.addEventListener("click", () => {
    chatContainer.classList.toggle("active");
  });

  closeChat.addEventListener("click", () => {
    chatContainer.classList.remove("active");
  });

  function addMessage(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isUser ? "user" : "bot");
    messageDiv.innerHTML = `
            ${text.replace(/\n/g, "<br/>")}
            <div class="message-time">
                ${new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </div>
        `;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  async function sendMessageToBackend(message) {
    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    userInput.disabled = true;
    sendButton.disabled = true;
    addMessage(message, true);
    userInput.value = "";
    typingIndicator.style.display = "flex";

    try {
      const { response } = await sendMessageToBackend(message);
      addMessage(response, false);
    } catch (error) {
      showError("Connection issue. Please try again.");
      addMessage(
        "I'm temporarily unavailable. Please email operations@trackpi.in",
        false
      );
    } finally {
      typingIndicator.style.display = "none";
      userInput.disabled = false;
      sendButton.disabled = false;
      userInput.focus();
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => (errorMessage.style.display = "none"), 5000);
  }

  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener(
    "keypress",
    (e) => e.key === "Enter" && sendMessage()
  );
});
