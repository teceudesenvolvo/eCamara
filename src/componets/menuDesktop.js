import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaHome, FaGavel, FaFileAlt, FaVideo, FaBook, 
    FaRobot 
} from 'react-icons/fa';
import '../App.css';

const MenuDesktop = ({ onOpenChat }) => {
    const location = useLocation();

    // Função auxiliar para verificar se a rota está ativa
    const isActive = (path) => location.pathname === path ? 'link-desktop-active' : '';

    return (
        <div className="menuDesktop">
            <div className="logoDesktop">
                {/* Você pode descomentar a imagem se tiver o logo importado */}
                {/* <img src={logo} alt="Logo" /> */}
                <h1 className="h1-logo">Camara AI</h1> 
            </div>

            <nav className="nav-desktop">
                <Link to="/" className={`aDesktop ${isActive('/')}`}>
                    <FaHome className="icon-desktop" />
                    <span className="text-desktop">Início</span>
                </Link>

                <div className="divider-desktop">Legislativo</div>

                <Link to="/Sessoes" className={`aDesktop ${isActive('/Sessoes')}`}>
                    <FaGavel className="icon-desktop" />
                    <span className="text-desktop">Sessões</span>
                </Link>
                <Link to="/Materias" className={`aDesktop ${isActive('/Materias')}`}>
                    <FaFileAlt className="icon-desktop" />
                    <span className="text-desktop">Matérias</span>
                </Link>
                
                 <Link to="/Normas" className={`aDesktop ${isActive('/Normas')}`}>
                    <FaBook className="icon-desktop" />
                    <span className="text-desktop">Normas</span>
                </Link>
                <Link to="/Sessao-Virtual" className={`aDesktop ${isActive('/Sessao-Virtual')}`}>
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
    );
};

export default MenuDesktop;