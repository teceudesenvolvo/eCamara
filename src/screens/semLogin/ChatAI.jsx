import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane, FaRobot, FaUser, FaTimes, FaUndo } from 'react-icons/fa';
import '../../App.css';

import { sendMessageToAIPublic } from '../../aiService';
import api from '../../services/api'; // Import api
import logoCamaraAI from '../../assets/logo-camaraai-icon.png'; // Fallback logo

const ChatAI = ({ onClose, city }) => {
    const [councilName, setCouncilName] = useState('sua cidade');
    const [councilLogo, setCouncilLogo] = useState(logoCamaraAI);
    const [messages, setMessages] = useState([
    ]);
    const [inputText, setInputText] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const messagesEndRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastMessage, setLastMessage] = useState('');

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Aguarda a animação terminar (300ms)
    };

    useEffect(() => {
        const fetchCouncilConfig = async () => {
            if (!city || city === 'master') return;
            try {
                const response = await api.get(`/councils/${city}`);
                const councilData = response.data || {};
                const config = councilData.config || councilData.dadosConfig || {};
                const homeConfig = config.home || {};
                const layoutConfig = config.layout || {};

                setCouncilName(homeConfig.titulo || councilData.name || city);
                setCouncilLogo(layoutConfig.logoDark || layoutConfig.logo || logoCamaraAI);
            } catch (error) {
                console.error("Erro ao carregar configurações da câmara para o chat:", error);
            }
        };

        fetchCouncilConfig();
        // Set initial greeting message once councilName is loaded
        setMessages([ { id: 1, text: `Olá! Sou o Camara AI. Como posso ajudar você a entender melhor as leis e projetos da ${councilName} hoje?`, sender: 'ai' } ]);
    }, [city, councilName]); // Depend on city and councilName

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isGenerating) return;

        const newMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setLastMessage(inputText);
        setMessages(prev => [...prev, newMsg]);
        const currentInputText = inputText;
        setInputText('');
        await sendToAI(currentInputText);
    };

    const sendToAI = async (text) => {
        setIsGenerating(true);

        try {
            const aiResponse = await sendMessageToAIPublic(text, city);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
        } catch (error) {
            console.error("Erro ao chamar a IA:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Desculpe, ocorreu um erro ao processar sua solicitação.",
                sender: 'ai',
                isError: true
            }]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`chat-popup-overlay ${isClosing ? 'closing' : ''}`}>
        <div className={`chat-modal-content ${isClosing ? 'closing' : ''}`}>
            <div className="chat-header">
                <div className="chat-header-info">
                    {councilLogo && <img src={councilLogo} alt="Logo" style={{ height: '50px', marginBottom: '8px', objectFit: 'contain' }} />}
                </div>
                <button onClick={handleClose} className="close-button-chat" title="Fechar">
                    <FaTimes />
                </button>
            </div>
            
            <div className="chat-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}>
                        <div className="message-icon">
                            {msg.sender === 'ai' ? <FaRobot /> : <FaUser />}
                        </div>
                        <div className="message-bubble" dangerouslySetInnerHTML={{ __html: msg.text }} />
                        {msg.isError && (
                            <button 
                                onClick={() => sendToAI(lastMessage)} 
                                className="btn-apple-pill" 
                                style={{ 
                                    marginTop: '8px', 
                                    fontSize: '0.75rem', 
                                    padding: '6px 12px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    width: 'fit-content'
                                }}
                            >
                                <FaUndo size={10} /> Tentar Novamente
                            </button>
                        )}
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
