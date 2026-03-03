import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import '../App.css';

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

    const callGeminiAPI = async (prompt) => {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!API_KEY) {
            console.error("Chave de API não encontrada. Verifique se o arquivo .env foi criado corretamente na raiz do projeto.");
            return "Erro de Configuração: Chave de API não encontrada. Crie um arquivo .env com VITE_GEMINI_API_KEY=sua_chave.";
        }
        const MODEL_NAME = 'gemini-2.5-flash';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            if (data.error) {
                console.error("Erro retornado pela API Gemini:", data.error);
                return `Erro na IA: ${data.error.message}`;
            }
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            return "Não foi possível gerar uma resposta válida.";
        } catch (error) {
            console.error("Erro ao chamar a API do Gemini:", error);
            return "Desculpe, não consegui processar sua solicitação no momento.";
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isGenerating) return;

        const newMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        const currentInputText = inputText;
        setInputText('');
        setIsGenerating(true);

        const prompt = `Você é o 'Camara AI', um assistente virtual da Câmara Municipal de ${city || 'Nossa Cidade'}. Sua função é responder perguntas dos cidadãos sobre leis municipais, projetos em tramitação, sessões plenárias e o trabalho dos vereadores. Use uma linguagem clara, objetiva e neutra. A pergunta do cidadão é: "${currentInputText}"`;

        const aiResponse = await callGeminiAPI(prompt);

        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: aiResponse,
            sender: 'ai'
        }]);
        setIsGenerating(false);
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
