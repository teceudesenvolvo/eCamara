import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaHome, FaGavel, FaFileAlt, FaVideo, FaBook, FaBars, FaTimes,
    FaRobot
} from 'react-icons/fa';
import logoCamaraAI from '../assets/logo-camara-ai-sf.png';
import '../App.css';

const MenuDesktop = ({ onOpenChat, camaraId, logo }) => {
    const location = useLocation();

    // Função auxiliar para verificar se a rota está ativa
    const isActive = (path) => location.pathname === path ? 'link-desktop-active' : '';

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
                    <img src={logo || logoCamaraAI} alt="Camara AI Logo" className="logo-sidebar" />
                </div>

                <nav className="nav-desktop">
                    <Link to={`/home/${camaraId}`} className={`aDesktop ${isActive(`/home/${camaraId}`)}`}>
                        <FaHome className="icon-desktop" />
                        <span className="text-desktop">Início</span>
                    </Link>

                    <div className="divider-desktop">Legislativo</div>

                    <Link to={`/sessoes/${camaraId}`} className={`aDesktop ${isActive(`/sessoes/${camaraId}`)}`}>
                        <FaGavel className="icon-desktop" />
                        <span className="text-desktop">Sessões</span>
                    </Link>
                    <Link to={`/materias/${camaraId}`} className={`aDesktop ${isActive(`/materias/${camaraId}`)}`}>
                        <FaFileAlt className="icon-desktop" />
                        <span className="text-desktop">Matérias</span>
                    </Link>

                    <Link to={`/normas/${camaraId}`} className={`aDesktop ${isActive(`/normas/${camaraId}`)}`}>
                        <FaBook className="icon-desktop" />
                        <span className="text-desktop">Normas</span>
                    </Link>
                    <Link to={`/sessao-virtual/${camaraId}`} className={`aDesktop ${isActive(`/sessao-virtual/${camaraId}`)}`}>
                        <FaVideo className="icon-desktop" />
                        <span className="text-desktop">Sessão Virtual</span>
                    </Link>

                    <div className="divider-desktop">Camara AI</div>

                    <div className={`aDesktop`} onClick={onOpenChat} style={{ cursor: 'pointer' }}>
                        <FaRobot className="icon-desktop" />
                        <span className="text-desktop">Falar com IA</span>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default MenuDesktop;
