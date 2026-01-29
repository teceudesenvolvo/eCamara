import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import '../App.css';

const ChatAI = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Olá! Sou o Camara AI. Como posso ajudar você a entender melhor as leis e projetos da sua cidade hoje?", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const messagesEndRef = useRef(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Aguarda a animação terminar (300ms)
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        setInputText('');

        // Simular resposta da IA (Delay para parecer natural)
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: "Entendi sua pergunta. Estou consultando a base de dados legislativa de Blumenau para trazer a resposta mais precisa sobre esse tema. Um momento, por favor...", 
                sender: 'ai' 
            }]);
        }, 1500);
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
                        <div className="message-bubble">
                            {msg.text}
                        </div>
                    </div>
                ))}
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
                        autoFocus
                    />
                    <button type="submit" className="smart-search-btn-chat">
                        <FaPaperPlane />
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
};

export default ChatAI;