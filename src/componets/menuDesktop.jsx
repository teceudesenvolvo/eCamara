import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaHome, FaGavel, FaFileAlt, FaVideo, FaBook, FaBars, FaTimes, FaUsers, FaRobot,
    FaCalendarCheck, FaBalanceScale, FaIdCard, FaGraduationCap, FaCommentDots, FaBullhorn, FaFemale, FaBriefcase, FaTv
} from 'react-icons/fa';
import logoCamaraAI from '../assets/logo-camara-ai-sf.png';
import '../App.css';
import api from '../services/api.js';

const MenuDesktop = ({ onOpenChat, camaraId, logo }) => {
    const location = useLocation();
    const [activeModules, setActiveModules] = useState({});
    const [logoUrl, setLogoUrl] = useState(logo || logoCamaraAI);

    // Função auxiliar para verificar se a rota está ativa
    const isActive = (path) => location.pathname === path ? 'link-desktop-active' : '';

    useEffect(() => {
        if (logo) setLogoUrl(logo);
    }, [logo]);

    useEffect(() => {
        if (!camaraId) return;

        const fetchConfig = async () => {
            try {
                const response = await api.get(`/councils/${camaraId}`);
                if (response.data) {
                    const config = response.data.config || response.data.dadosConfig || {};
                    setActiveModules(config.modulos_ativos || {});
                    const dbLogo = config.layout?.logo || config.layout?.logoLight;
                    if (dbLogo && !logo) setLogoUrl(dbLogo);
                }
            } catch (error) {
                console.error("Erro ao carregar configuração da câmara:", error);
            }
        };

        fetchConfig();
    }, [camaraId, logo]);

    // Lista de serviços para renderização dinâmica (mesma lógica do menu admin)
    const publicServices = [
        { id: 'agendamentos', label: 'Agendamentos', path: 'sessoes', icon: <FaCalendarCheck className="icon-desktop" /> },
        { id: 'assistenciaJuridica', label: 'Assist. Jurídica', path: 'normas', icon: <FaBalanceScale className="icon-desktop" /> },
        { id: 'balcaoCidadao', label: 'Balcão Cidadão', path: 'home', icon: <FaIdCard className="icon-desktop" /> },
        { id: 'escolaLegislativo', label: 'Escola Legislativo', path: 'home', icon: <FaGraduationCap className="icon-desktop" /> },
        { id: 'falarComVereador', label: 'Falar c/ Vereador', path: 'home', icon: <FaCommentDots className="icon-desktop" /> },
        { id: 'ouvidoria', label: 'Ouvidoria', path: 'home', icon: <FaBullhorn className="icon-desktop" /> },
        { id: 'procon', label: 'Procon', path: 'home', icon: <FaBalanceScale className="icon-desktop" /> },
        { id: 'procuradoriaMulher', label: 'Proc. da Mulher', path: 'home', icon: <FaFemale className="icon-desktop" /> },
        { id: 'salaEmpreendedor', label: 'Sala Empreendedor', path: 'home', icon: <FaBriefcase className="icon-desktop" /> },
        { id: 'tvCamara', label: 'TV Câmara', path: 'home', icon: <FaTv className="icon-desktop" /> },
    ];

    // Verifica se deve exibir a seção de Legislativo
    const showLegislativo = activeModules.sessoes || activeModules.comissoes || true; // Matérias e Normas costumam ser core

    return (
        <>
            {/* Checkbox e labels para controlar o menu mobile sem JavaScript */}
            <input type="checkbox" id="mobile-menu-toggle-checkbox" className="mobile-menu-toggle-checkbox" />
            <label htmlFor="mobile-menu-toggle-checkbox" className="mobile-menu-toggle">
                <FaBars className="hamburger-icon" />
                <FaTimes className="close-icon" />
            </label>
            <label htmlFor="mobile-menu-toggle-checkbox" className="mobile-menu-overlay"></label>

            <div className="menuDesktop color-navMenu-public">
                <div className="logoDesktop">
                    <img src={logoUrl} alt="Camara AI Logo" className="logo-sidebar" />
                </div>

                <nav className="nav-desktop">
                    <Link to={`/home/${camaraId}`} className={`aDesktop ${isActive(`/home/${camaraId}`)}`}>
                        <FaHome className="icon-desktop" />
                        <span className="text-desktop">Início</span>
                    </Link>

                    {showLegislativo && <div className="divider-desktop">Legislativo</div>}

                    {activeModules.sessoes && (
                        <Link to={`/sessoes/${camaraId}`} className={`aDesktop ${isActive(`/sessoes/${camaraId}`)}`}>
                            <FaGavel className="icon-desktop" />
                            <span className="text-desktop">Sessões</span>
                        </Link>
                    )}
                    
                    <Link to={`/materias/${camaraId}`} className={`aDesktop ${isActive(`/materias/${camaraId}`)}`}>
                        <FaFileAlt className="icon-desktop" />
                        <span className="text-desktop">Matérias</span>
                    </Link>

                    <Link to={`/normas/${camaraId}`} className={`aDesktop ${isActive(`/normas/${camaraId}`)}`}>
                        <FaBook className="icon-desktop" />
                        <span className="text-desktop">Normas</span>
                    </Link>

                    {activeModules.comissoes && (
                        <Link to={`/comissoes/${camaraId}`} className={`aDesktop ${isActive(`/comissoes/${camaraId}`)}`}>
                            <FaUsers className="icon-desktop" />
                            <span className="text-desktop">Comissões</span>
                        </Link>
                    )}

                    {/* Seção de Serviços ao Cidadão (Dinâmica) */}
                    {publicServices.some(s => activeModules[s.id]) && (
                        <>
                            <div className="divider-desktop">Serviços</div>
                            {publicServices.map(service => activeModules[service.id] && (
                                <Link key={service.id} to={`/${service.path}/${camaraId}`} className="aDesktop">
                                    {service.icon}
                                    <span className="text-desktop">{service.label}</span>
                                </Link>
                            ))}
                        </>
                    )}

                    {activeModules.assistente && (
                        <>
                            <div className="divider-desktop">Camara AI</div>
                            <div className={`aDesktop`} onClick={onOpenChat} style={{ cursor: 'pointer' }}>
                                <FaRobot className="icon-desktop" />
                                <span className="text-desktop">Falar com IA</span>
                            </div>
                        </>
                    )}
                </nav>
            </div>
        </>
    );
};

export default MenuDesktop;
