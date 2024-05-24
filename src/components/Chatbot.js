import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaRegPaperPlane, FaPaperclip, FaSyncAlt } from 'react-icons/fa';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([{ text: "Hello 👋 and welcome! I'm here to assist you with any questions or information you need. How can I help you today?", isUser: false }]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatBodyRef = useRef(null);

  const API_KEY = "AIzaSyD2gPipnqaPKI54waTLrrM7x0gXT69Iar4";

  const handleSendMessage = async () => {
    if (input.trim() !== '' || file !== null) {
      setMessages([...messages, { text: input, isUser: true, file }]);
      setInput('');
      setFile(null);
      setIsTyping(true);

      try {
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
        const googleResponse = await axios.post(googleUrl, {
          contents: [
            {
              parts: [
                {
                  text: input,
                },
              ],
            },
          ],
        });
        if (
          googleResponse.data &&
          googleResponse.data.candidates &&
          googleResponse.data.candidates.length > 0
        ) {
          const botResponse =
            googleResponse.data.candidates[0].content.parts[0].text;

          setMessages((prevMessages) => [
            ...prevMessages,
            { text: botResponse, isUser: false },
          ]);
        } else {
          console.error(
            "No candidates found in the Google API response:",
            googleResponse.data
          );
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: "I did not understand that. Please try again.",
              isUser: false,
            },
          ]);
        }
      } catch (error) {
        console.error("Google API Error:", error.message);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Something went wrong with the Google API. Please try again later.",
            isUser: false,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(prevState => !prevState);
  };

  const handleRefresh = () => {
    setMessages([{ text: "Hello and welcome! I'm here to assist you with any questions or information you need. How can I help you today?", isUser: false }]);
    setInput('');
    setFile(null);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Only PDF and Word files are allowed. Please select a PDF or Word file.",
          isUser: false,
        },
      ]);
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  return (
    <>
      <div onClick={toggleChatbot} className="chatbot-toggle-button">
        <dotlottie-player 
          src="https://lottie.host/5e02722c-bee4-4134-b267-0cc267466528/BpzLf15779.json" 
          background="transparent" 
          speed="1" 
          style={{ width: '100px', height: '100px', cursor: 'pointer' }} 
          loop 
          autoplay>
        </dotlottie-player>
      </div>
      {isOpen && (
        <div className="chatbot-container">
          <div className="chat-header">
            <img src='chatlogo.png' alt="Robot Logo" className="chatbot-logo" />
            <span className="chatbot-name">MBTech<b>BOT</b></span>
            <FaSyncAlt style={{ cursor: 'pointer', marginRight: '10px' }} onClick={handleRefresh} />
            <FaTimes style={{ cursor: 'pointer' }} onClick={toggleChatbot} />
          </div>
          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
                {message.text}
                {message.file && <div>Attached: {message.file.name}</div>}
              </div>
            ))}
            {isTyping && (
              <div className="animation bot-message">
                <div className="typing-indicator">
                  <dotlottie-player 
                    src="https://lottie.host/df16747f-3e53-4d1f-9869-2b7bb30069d3/5TmNZBKbh3.json" 
                    background="transparent" 
                    speed="1" 
                    style={{ width: '100px', height: '100px' }} 
                    loop 
                    autoplay>
                  </dotlottie-player>
                </div>              
              </div>
            )}
          </div>
          <div className="chat-footer">
            <label htmlFor="file-input" className="attach-button">
              <FaPaperclip size={24} color="#3498db"/>
              <span className="tooltip-text">Attach your PDF or Word file</span>
            </label>
            <input
              type="file"
              id="file-input"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button onClick={handleSendMessage} className="send-button">
              <FaRegPaperPlane size={24} color="#3498db" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
