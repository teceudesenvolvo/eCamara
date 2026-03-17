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
import logoCamaraAI from '../assets/logo-camara-ai-vertical.png';
import '../App.css';
import { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { ref, get } from 'firebase/database';

const MenuDashboard = ({ logo: propLogo }) => {
    const location = useLocation();
    const [logo, setLogo] = useState(logoCamaraAI);
    const [camaraId, setCamaraId] = useState('pacatuba');

    // Função auxiliar para verificar se a rota está ativa
    const isActive = (path) => location.pathname.includes(path) ? 'link-desktop-active' : '';

    useEffect(() => {
        const fetchUserCamara = async () => {
            // Tenta pegar da URL primeiro
            const pathParts = location.pathname.split('/').filter(Boolean);
            let currentCamaraId = pathParts[pathParts.length - 1];
            
            // Se parecer um ID de recurso (muito longo ou numérico) ou for uma rota conhecida sem ID no final
            if (currentCamaraId === 'perfil' || currentCamaraId === 'admin') {
                currentCamaraId = null;
            }

            if (currentCamaraId && currentCamaraId !== 'perfil') {
                setCamaraId(currentCamaraId);
            } else {
                // Se não tiver na URL, busca do usuário logado
                const user = auth.currentUser;
                if (user) {
                    try {
                        const userIndexRef = ref(db, `users_index/${user.uid}`);
                        const snapshot = await get(userIndexRef);
                        if (snapshot.exists()) {
                            setCamaraId(snapshot.val().camaraId);
                        }
                    } catch (error) {
                        console.error("Erro ao buscar camaraId do usuário:", error);
                    }
                }
            }
        };

        fetchUserCamara();

        if (propLogo) {
            setLogo(propLogo);
            return;
        }

        const fetchLogo = async () => {
            try {
                // Usa o estado camaraId ou o que acabamos de determinar se o estado ainda não atualizou
                // Nota: dentro do useEffect, o estado camaraId pode ser o antigo na primeira execução
                // mas o fetchLogo depende dele.
                // Melhor estratégia: buscar o logo APÓS definir o camaraId.
                // Separando fetchLogo para rodar quando camaraId mudar.
            } catch (e) {
                console.error("Erro ao carregar logo do dashboard", e);
            }
        };
        // fetchLogo(); Movido para outro useEffect dependente de camaraId
    }, [location.pathname, propLogo]);

    // Novo useEffect para carregar o logo quando o camaraId for definido
    useEffect(() => {
        if (propLogo) return;
        
        const fetchLogo = async () => {
            try {
                const snapshot = await get(ref(db, `${camaraId}/dados-config/layout/logo`));
                if (snapshot.exists()) setLogo(snapshot.val());
            } catch (e) {
                console.error("Erro ao carregar logo do dashboard", e);
            }
        };
        fetchLogo();
    }, [camaraId, propLogo]);

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
            <div className="logoDesktop" style={{width: "100%"}}>
                <img src={logoCamaraAI} alt="Logo" className="logo-sidebar" style={{width: "100%"}} />
            </div>

            <nav className="nav-desktop">
                

                <Link to={`/admin/materias-dash/${camaraId}`} className={`aDesktop ${isActive('materias-dash')}`}>
                    <FaAddressBook className="icon-desktop" />
                    <span className="text-desktop">Minhas Matérias</span>
                </Link>

                <Link to={`/admin/protocolar-materia/${camaraId}`} className={`aDesktop ${isActive('protocolar-materia')}`}>
                    <FaPlusCircle className="icon-desktop" />
                    <span className="text-desktop">Protocolar</span>
                </Link>

                <Link to={`/admin/juizo-materia/${camaraId}`} className={`aDesktop ${isActive('juizo-materia')}`}>
                    <FaPencilAlt className="icon-desktop" />
                    <span className="text-desktop">Parecer</span>
                </Link>

                <Link to={`/admin/juizo-presidente/${camaraId}`} className={`aDesktop ${isActive('juizo-presidente')}`}>
                    <FaBalanceScale className="icon-desktop" />
                    <span className="text-desktop">Presidência</span>
                </Link>

                <Link to={`/admin/comissoes-dash/${camaraId}`} className={`aDesktop ${isActive('comissoes-dash')}`}>
                    <FaUsers className="icon-desktop" />
                    <span className="text-desktop">Comissões</span>
                </Link>

                <Link to={`/admin/pautas-sessao/${camaraId}`} className={`aDesktop ${isActive('pautas-sessao')}`}>
                    <FaList className="icon-desktop" />
                    <span className="text-desktop">Sessões</span>
                </Link>

                <Link to={`/admin/configuracoes/${camaraId}`} className={`aDesktop ${isActive('configuracoes')}`}>
                    <FaCog className="icon-desktop" />
                    <span className="text-desktop">Configurações</span>
                </Link>

                <Link to={`/admin/assistente-admin/${camaraId}`} className={`aDesktop ${isActive('assistente-admin')}`}>
                    <FaRobot className="icon-desktop" />
                    <span className="text-desktop">Assistente</span>
                </Link>

                <Link to={`/admin/layout-manager/${camaraId}`} className={`aDesktop ${isActive('layout-manager')}`}>
                    <FaPalette className="icon-desktop" />
                    <span className="text-desktop">Layouts</span>
                </Link>

                <Link to={`/admin/perfil/${camaraId}`} className={`aDesktop ${isActive('/perfil')}`}>
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
