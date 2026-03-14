import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaAddressBook,
    FaPlusCircle,
    FaPencilAlt,
    FaRegUser,
    FaHome,
    FaUsers,
    FaBalanceScale,
    FaList,
    FaCog,
    FaRobot,
    FaPalette,
    FaBars,
    FaTimes
} from "react-icons/fa";
import logoCamaraAI from '../assets/logo-camara-ai-sf.png';
import '../App.css';
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, get } from 'firebase/database';

const MenuDashboard = ({ logo: propLogo }) => {
    const location = useLocation();
    const [logo, setLogo] = useState(logoCamaraAI);

    // Função auxiliar para verificar se a rota está ativa
    const isActive = (path) => location.pathname === path ? 'link-desktop-active' : '';

    useEffect(() => {
        if (propLogo) {
            setLogo(propLogo);
            return;
        }

        const fetchLogo = async () => {
            const pathParts = location.pathname.split('/').filter(Boolean);
            const camaraId = pathParts.length > 1 ? pathParts[1] : 'pacatuba';
            
            try {
                const snapshot = await get(ref(db, `${camaraId}/dados-config/layout/logo`));
                if (snapshot.exists()) setLogo(snapshot.val());
            } catch (e) {
                console.error("Erro ao carregar logo do dashboard", e);
            }
        };
        fetchLogo();
    }, [location.pathname, propLogo]);

    return (
        <>
            {/* Checkbox e labels para controlar o menu mobile sem JavaScript */}
            <input type="checkbox" id="mobile-menu-toggle-checkbox" className="mobile-menu-toggle-checkbox" />
            <label htmlFor="mobile-menu-toggle-checkbox" className="mobile-menu-toggle">
                <FaBars className="hamburger-icon" />
                <FaTimes className="close-icon" />
            </label>
            <label htmlFor="mobile-menu-toggle-checkbox" className="mobile-menu-overlay"></label>

            <div className="menuDesktop"> {/* Reutilizando a classe do menu da home */}
            <div className="logoDesktop">
                <img src={logo} alt="Logo" className="logo-sidebar" />
            </div>

            <nav className="nav-desktop">
                

                <Link to="/materias-dash" className={`aDesktop ${isActive('/materias-dash')}`}>
                    <FaAddressBook className="icon-desktop" />
                    <span className="text-desktop">Minhas Matérias</span>
                </Link>

                <Link to="/protocolar-materia" className={`aDesktop ${isActive('/protocolar-materia')}`}>
                    <FaPlusCircle className="icon-desktop" />
                    <span className="text-desktop">Protocolar</span>
                </Link>

                <Link to="/juizo-materia" className={`aDesktop ${isActive('/juizo-materia')}`}>
                    <FaPencilAlt className="icon-desktop" />
                    <span className="text-desktop">Parecer</span>
                </Link>

                <Link to="/juizo-presidente" className={`aDesktop ${isActive('/juizo-presidente')}`}>
                    <FaBalanceScale className="icon-desktop" />
                    <span className="text-desktop">Presidência</span>
                </Link>

                <Link to="/comissoes-dash" className={`aDesktop ${isActive('/comissoes-dash')}`}>
                    <FaUsers className="icon-desktop" />
                    <span className="text-desktop">Comissões</span>
                </Link>

                <Link to="/pautas-sessao" className={`aDesktop ${isActive('/pautas-sessao')}`}>
                    <FaList className="icon-desktop" />
                    <span className="text-desktop">Sessões</span>
                </Link>

                <Link to="/configuracoes" className={`aDesktop ${isActive('/configuracoes')}`}>
                    <FaCog className="icon-desktop" />
                    <span className="text-desktop">Configurações</span>
                </Link>

                <Link to="/assistente-admin" className={`aDesktop ${isActive('/assistente-admin')}`}>
                    <FaRobot className="icon-desktop" />
                    <span className="text-desktop">Assistente</span>
                </Link>

                <Link to="/layout-manager" className={`aDesktop ${isActive('/layout-manager')}`}>
                    <FaPalette className="icon-desktop" />
                    <span className="text-desktop">Layouts</span>
                </Link>

                <Link to="/perfil" className={`aDesktop ${isActive('/perfil')}`}>
                    <FaRegUser className="icon-desktop" />
                    <span className="text-desktop">Minha Conta</span>
                </Link>
                
                
                <Link to="/" className={`aDesktop`}>
                    <FaHome className="icon-desktop" />
                    <span className="text-desktop">Sair da Conta</span>
                </Link>
            </nav>
        </div>
        </>
    );
};

export default MenuDashboard;
