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
    FaCog
} from "react-icons/fa";
import '../App.css';

const MenuDashboard = () => {
    const location = useLocation();

    // Função auxiliar para verificar se a rota está ativa
    const isActive = (path) => location.pathname === path ? 'link-desktop-active' : '';

    return (
        <div className="menuDesktop"> {/* Reutilizando a classe do menu da home */}
            <div className="logoDesktop">
                <h1 className="h1-logo">Camara AI</h1>
            </div>

            <nav className="nav-desktop">
                <div className="divider-desktop">Gestão</div>

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
                    <span className="text-desktop">Pautas</span>
                </Link>

                <Link to="/configuracoes" className={`aDesktop ${isActive('/configuracoes')}`}>
                    <FaCog className="icon-desktop" />
                    <span className="text-desktop">Configurações</span>
                </Link>

                <div className="divider-desktop">Conta</div>

                <Link to="/perfil" className={`aDesktop ${isActive('/perfil')}`}>
                    <FaRegUser className="icon-desktop" />
                    <span className="text-desktop">Minha Conta</span>
                </Link>
                
                <div className="divider-desktop">Sair</div>
                
                <Link to="/" className={`aDesktop`}>
                    <FaHome className="icon-desktop" />
                    <span className="text-desktop">Voltar ao Início</span>
                </Link>
            </nav>
        </div>
    );
};

export default MenuDashboard;
