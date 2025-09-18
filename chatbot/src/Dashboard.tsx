import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaSearch, FaChevronDown,
  FaUser, FaRobot, FaThumbsUp, FaThumbsDown, FaEllipsisH, FaRegStar, 
  FaStar, FaRegLightbulb, FaBook, FaVideo, FaCode, FaExternalLinkAlt } from 'react-icons/fa';
import './index.css'; 
import axios from 'axios';

interface Message {
  id: number;
  sessionId: string;
  sender: 'user' | 'bot';
  text: string;
  intent: string;
  timestamp: Date;
  status?: 'sending' | 'delivered' | 'read';
  metadata: Object;
  helpful?: boolean;
}

interface Resource {
  id: number;
  title: string;
  type: string;
  read: boolean;
}

const Dashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [thinking, setThinking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or load session
  useEffect(() => {
    const initSession = async () => {
      let storedSessionId = localStorage.getItem('chatSessionId');
      if (!storedSessionId) {
        storedSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chatSessionId', storedSessionId);
      }
      setSessionId(storedSessionId);
      setSessionReady(true);
    };
    initSession();
  }, []);

  // Fetch message history once session is ready
  useEffect(() => {
    if (!sessionReady) return;

    const fetchMessageHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/messages/${sessionId}`, { withCredentials: true });
        const formattedMessages = response.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          status: 'read'
        }));
        setMessages(formattedMessages);
      } catch (err: any) {
        console.error('Failed to fetch message history:', err);
        // Add default welcome message if no history exists
        setMessages([{
          id: Date.now(),
          sessionId,
          text: "Hi there! I'm your Linkbuilder Assistant. How can I help you today?",
          sender: 'bot',
          intent: 'greeting',
          timestamp: new Date(),
          status: 'read',
          metadata: {}
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessageHistory();
  }, [sessionReady, sessionId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, thinking]);

  const handleSendMessage = async () => {
    if (!sessionReady || inputText.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now(),
      sessionId,
      text: inputText,
      sender: 'user',
      intent: 'user_query',
      timestamp: new Date(),
      status: 'sending',
      metadata: {}
    };

    setMessages(prev => [...prev, newUserMessage]);
    const messageText = inputText;
    setInputText('');

    try {
      // Mark message as delivered
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newUserMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );

      setIsTyping(true);
      setThinking(true);

      // Send message to backend for bot response
      const botResponse = await axios.post(`http://localhost:3001/api/messages/send`, {
        sessionId,
        message: messageText
      }, { withCredentials: true });

      // Simulate thinking time for better UX
      setTimeout(() => {
        setIsTyping(false);
        setThinking(false);

        const newBotMessage: Message = {
          id: Date.now() + 1,
          sessionId,
          text: botResponse.data?.text || "Sorry, I couldn't understand that.",
          sender: 'bot',
          intent: botResponse.data?.intent || 'response',
          timestamp: new Date(),
          status: 'read',
          metadata: botResponse.data?.metadata || {}
        };

        setMessages(prev => [...prev, newBotMessage]);
      }, 1500); // 1.5 seconds thinking time

    } catch (err: any) {
      console.error('Failed to send message:', err);
      setIsTyping(false);
      setThinking(false);

      const errorMessage: Message = {
        id: Date.now() + 1,
        sessionId,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: 'bot',
        intent: 'error',
        timestamp: new Date(),
        status: 'read',
        metadata: {}
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const toggleChat = () => { 
    setIsChatOpen(!isChatOpen); 
    if (!isChatOpen) { 
      setTimeout(() => inputRef.current?.focus(), 100); 
    } 
  };

  const handleEndSession = () => {
    localStorage.removeItem('chatSessionId');

    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    localStorage.setItem('chatSessionId', newSessionId);

    setMessages([{
      id: Date.now(),
      sessionId: newSessionId,
      text: "Hi there! I'm your Linkbuilder Assistant. How can I help you today?",
      sender: 'bot',
      intent: 'greeting',
      timestamp: new Date(),
      status: 'read',
      metadata: {}
    }]);
    
    setShowEndSessionModal(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleFeedback = (messageId: number, helpful: boolean) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, helpful } : msg
      )
    );
    
    // Send feedback to backend
    axios.post(`http://localhost:3001/api/feedback/${sessionId}`, {
      messageId,
      helpful
    }, { withCredentials: true }).catch(err => {
      console.error('Failed to send feedback:', err);
    });
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleFAQClick = (question: string) => {
    setActiveTab('chat');
    setInputText(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const markResourceAsRead = (resourceId: number) => {
    // This would typically update the resource as read in the backend
    console.log(`Resource ${resourceId} marked as read`);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  
  const renderMessageStatus = (status: string | undefined) => { 
    switch (status) { 
      case 'sending': return <span className="message-status">Sending...</span>; 
      case 'delivered': return <span className="message-status">Delivered</span>; 
      default: return null; 
    } 
  }; 
  
  const renderResourceIcon = (type: string) => { 
    switch (type) { 
      case 'documentation': return <FaBook />; 
      case 'guide': return <FaRegLightbulb />; 
      case 'video': return <FaVideo />; 
      case 'code': return <FaCode />; 
      default: return <FaBook />; 
    } 
  };

  // Sample data
  const faqCategories = [ 
    { title: "Getting Started", questions: [ "How do I create my first cluster?", "How to connect to my Atlas Cluster?", " can I find sample data?" ] }, 
    { title: "Account & Billing", questions: [ "How do I reset my password?", "How to update my payment method?", "What does Basic Support cover?" ] }, 
    { title: "Troubleshooting", questions: [ "How to close connections in Linkbuilder Atlas?", "Why is my cluster slow?", "How to resolve connection issues?" ] } 
  ];
  
  const quickReplies = [ "Can I export my website list", "How do I contact support?", "I can't find the group filter", "How do I leave feedback?" ]; 
  
  const learningResources = [ 
    { icon: <FaBook />, title: "Documentation", description: "Complete technical reference" }, 
    { icon: <FaVideo />, title: "Video Tutorials", description: "Step-by-step guides" }, 
    { icon: <FaCode />, title: "Code Examples", description: "Real-world use cases" }, 
    { icon: <FaRegLightbulb />, title: "Best Practices", description: "Expert recommendations" } 
  ];
  
  const helpResources: Resource[] = [
    { id: 1, title: "Getting Started Guide", type: "guide", read: false },
    { id: 2, title: "API Documentation", type: "documentation", read: true },
    { id: 3, title: "Troubleshooting Common Issues", type: "guide", read: false },
    { id: 4, title: "Advanced Configuration", type: "documentation", read: false }
  ];

  return (
    <div className="app">
      {/* Enhanced Chat Bot */}
      <div className={`chatbot-container ${isChatOpen ? 'open' : ''}`}>
        {isChatOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <div className="assistant-info">
                <div className="assistant-avatar">
                  <FaRobot />
                </div>
                <div>
                  <h3>Linkbuilder Assistant</h3>
                  <span className="status-indicator">Online</span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="icon-btn" onClick={() => setShowEndSessionModal(true)}>
                  <FaEllipsisH />
                </button>
                <button className="close-btn" onClick={toggleChat}>
                  <FaTimes />
                </button>
              </div>
            </div>
  
            <div className="chat-tabs">
              <button 
                className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </button>
              <button 
                className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                onClick={() => setActiveTab('resources')}
              >
                Resources
              </button>
              <button 
                className={`tab ${activeTab === 'help' ? 'active' : ''}`}
                onClick={() => setActiveTab('help')}
              >
                Help Topics
              </button>
            </div>
  
            {activeTab === 'chat' && (
              <>
                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="loading-container">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <p>Loading conversation...</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div key={message.id} className={`message ${message.sender}`}>
                          <div className="message-avatar">
                            {message.sender === 'user' ? <FaUser /> : <FaRobot />}
                          </div>
                          <div className="message-content">
                            <p>{message.text}</p>
                            <div className="message-footer">
                              <span className="timestamp">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {message.sender === 'user' && renderMessageStatus(message.status)}
                            </div>
                            {message.sender === 'bot' && message.status === 'read' && (
                              <div className="feedback-buttons">
                                <span>Was this helpful?</span>
                                <button 
                                  className={`feedback-btn ${message.helpful === true ? 'active' : ''}`}
                                  onClick={() => handleFeedback(message.id, true)}
                                >
                                  <FaThumbsUp />
                                </button>
                                <button 
                                  className={`feedback-btn ${message.helpful === false ? 'active' : ''}`}
                                  onClick={() => handleFeedback(message.id, false)}
                                >
                                  <FaThumbsDown />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
  
                      {isTyping && (
                        <div className="message bot">
                          <div className="message-avatar">
                            <FaRobot />
                          </div>
                          <div className="message-content">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            {thinking && <p className="thinking-text">Thinking...</p>}
                          </div>
                        </div>
                      )}
                    </>
                  )}
  
                  <div ref={messagesEndRef} />
                </div>
  
                {/* Quick Replies */}
                {!isTyping && messages.length > 0 && (
                  <div className="quick-replies">
                    {quickReplies.map((reply, index) => (
                      <button 
                        key={index} 
                        className="quick-reply"
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
  
                {/* Input Box */}
                <div className="input-container">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    disabled={isTyping}
                  />
                  <button 
                    className="send-btn" 
                    onClick={handleSendMessage}
                    disabled={inputText.trim() === '' || isTyping}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </>
            )}
  
            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="resources-container">
                <h4>Recommended Resources</h4>
                <div className="resources-grid">
                  {learningResources.map((resource, index) => (
                    <div key={index} className="resource-card">
                      <div className="resource-icon">{resource.icon}</div>
                      <h5>{resource.title}</h5>
                      <p>{resource.description}</p>
                      <button className="resource-link">
                        Explore <FaExternalLinkAlt />
                      </button>
                    </div>
                  ))}
                </div>
  
                <div className="suggested-resources">
                  <h5>Suggested for you</h5>
                  <div className="resource-list">
                    {helpResources.map(resource => (
                      <div 
                        key={resource.id} 
                        className={`resource-item ${resource.read ? 'read' : ''}`}
                        onClick={() => markResourceAsRead(resource.id)}
                      >
                        <div className="resource-type">{renderResourceIcon(resource.type)}</div>
                        <span>{resource.title}</span>
                        {!resource.read && <div className="unread-indicator"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
  
            {/* Help Tab */}
            {activeTab === 'help' && (
              <div className="help-container">
                <h4>Frequently Asked Questions</h4>
                <div className="faq-categories">
                  {faqCategories.map((category, index) => (
                    <div key={index} className="faq-category">
                      <h5>{category.title}</h5>
                      <div className="faq-list">
                        {category.questions.map((question, qIndex) => (
                          <button 
                            key={qIndex} 
                            className="faq-item"
                            onClick={() => handleFAQClick(question)}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
  
                <div className="contact-support">
                  <h5>Need more help?</h5>
                  <p>Connect with our support team for personalized assistance</p>
                  <button className="btn-support">
                    Contact Support
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
  
        {/* Chat toggle button */}
        <button className="chat-toggle" onClick={toggleChat}>
          {isChatOpen ? <FaTimes /> : <FaComments />}
          {!isChatOpen && messages.length > 0 && <span className="notification-badge">{messages.length}</span>}
        </button>
      </div>
  
      {/* End Session Modal */}
      {showEndSessionModal && (
        <div className="modal-overlay" onClick={() => setShowEndSessionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3>End Chat Session?</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowEndSessionModal(false)}
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 7.22z" />
                </svg>
              </button>
            </div>
  
            <div className="modal-body">
              <p>Ending this session will clear all messages from this conversation. This action cannot be undone.</p>
              <div className="session-info">
                <div className="info-item">
                  <span className="info-label">Session ID:</span>
                  <span className="info-value">{sessionId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Messages:</span>
                  <span className="info-value">{messages.length}</span>
                </div>
              </div>
            </div>
  
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowEndSessionModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary btn-danger"
                onClick={handleEndSession}
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}
export default Dashboard;