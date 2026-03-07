import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import '../../App.css';

import { sendMessageToAIPublic } from '../../aiService';

const ChatAI = ({ onClose, city }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: `Olá! Sou o Camara AI. Como posso ajudar você a entender melhor as leis e projetos de ${city || 'sua cidade'} hoje?`, sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const messagesEndRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Aguarda a animação terminar (300ms)
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isGenerating) return;

        const newMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        const currentInputText = inputText;
        setInputText('');
        setIsGenerating(true);

        try {
            // Envia apenas a mensagem do usuário. O prompt do sistema será adicionado no backend.
            const aiResponse = await sendMessageToAIPublic(currentInputText);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: aiResponse,
                sender: 'ai'
            }]);
        } catch (error) {
            console.error("Erro ao chamar a IA:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
                sender: 'ai'
            }]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`chat-popup-overlay ${isClosing ? 'closing' : ''}`}>
        <div className={`chat-ai-container ${isClosing ? 'closing' : ''}`}>
            <div className="chat-header">
                <button onClick={handleClose} className="back-button">
                    <FaArrowLeft /> Voltar
                </button>
                <div className="chat-header-info">
                    <h2>Camara AI</h2>
                </div>
            </div>
            
            <div className="chat-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}>
                        <div className="message-icon">
                            {msg.sender === 'ai' ? <FaRobot /> : <FaUser />}
                        </div>
                        <div className="message-bubble" dangerouslySetInnerHTML={{ __html: msg.text }} />
                    </div>
                ))}
                {isGenerating && (
                    <div className="message message-ai">
                        <div className="message-icon">
                            <FaRobot />
                        </div>
                        <div className="message-bubble">
                            <em>Digitando...</em>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <div className="search-box-wrapper-chat">
                    <input 
                        type="text" 
                        className="smart-search-input-chat"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Digite sua pergunta..."
                        disabled={isGenerating}
                        autoFocus
                    />
                    <button type="submit" className="smart-search-btn-chat" disabled={isGenerating}>
                        <FaPaperPlane />
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
};

export default ChatAI;
