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
    FaTimes,
    FaCalendarCheck,
    FaIdCard,
    FaGraduationCap,
    FaCommentDots,
    FaBullhorn,
    FaFemale,
    FaBriefcase,
    FaTv
} from "react-icons/fa";
import logoCamaraAI from '../assets/logo-camaraai.png';
import '../App.css';
import { useState, useEffect } from 'react';
import api from '../services/api.js';

const MenuDashboard = ({ logo: propLogo }) => {
    const location = useLocation();
    const [logo, setLogo] = useState(logoCamaraAI);
    const [camaraId, setCamaraId] = useState('pacatuba');
    const [userType, setUserType] = useState(null);
    const [userCargo, setUserCargo] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [activeModules, setActiveModules] = useState({});

    // Função auxiliar para verificar se a rota está ativa
    const isActive = (path) => location.pathname.includes(path) ? 'link-desktop-active' : '';

    useEffect(() => {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (!token || !user.id) return;

        // Usa role/tipo do usuário já salvo no localStorage (vem do login)
        const userRole = user.role || user.tipo || null;
        setUserType(userRole);
        setUserCargo(user.cargo || userRole);

        const fetchCouncilConfig = async (cId) => {
            try {
                const councilResponse = await api.get(`/councils/${cId}`);
                if (councilResponse.data) {
                    const config = councilResponse.data.config || councilResponse.data.dadosConfig || {};
                    setPermissions(config.permissoes || {});
                    setActiveModules(config.modulos_ativos || {});
                    if (config.layout?.logo) setLogo(config.layout.logo);
                }
            } catch (error) {
                console.error("Erro ao carregar config da câmara:", error);
            }
        };

        // Get camaraId from URL or User
        const pathParts = location.pathname.split('/').filter(Boolean);
        let currentCamaraId = '';

        if (pathParts[0] === 'admin') {
            // Rotas Administrativas: /admin/:page/:camaraId/...
            // O ID da câmara é o terceiro segmento (índice 2) se houver 3 ou mais partes
            currentCamaraId = (pathParts.length >= 3) ? pathParts[2] : pathParts[pathParts.length - 1];
        } else {
            // Rotas Públicas: /home/:camaraId, /materias/:camaraId, etc.
            currentCamaraId = pathParts[pathParts.length - 1];
        }

        // Se o parâmetro extraído for reservado ou inválido, usamos fallback
        if (!currentCamaraId || ['admin', 'perfil', 'materia-detalhes', 'materias-dash'].includes(currentCamaraId)) {
            currentCamaraId = user.camaraId || user.council || 'pacatuba';
        }

        setCamaraId(currentCamaraId);
        fetchCouncilConfig(currentCamaraId);

        if (propLogo) {
            setLogo(propLogo);
        }
    }, [location.pathname, propLogo]);


    // Validador de Acesso
    const hasAccess = (permissionId) => {
        if (userType === 'admin' || userType === 'superadmin') return true;
        return permissions[userCargo]?.[permissionId] === true;
    };

    // Configuração dos Serviços para iteração
    const servicesList = [
        { id: 'agendamentos', label: 'Agendamentos', path: 'agendamentos', icon: <FaCalendarCheck className="icon-desktop" /> },
        { id: 'assistenciaJuridica', label: 'Assist. Jurídica', path: 'assistencia-juridica', icon: <FaBalanceScale className="icon-desktop" /> },
        { id: 'balcaoCidadao', label: 'Balcão Cidadão', path: 'balcao-cidadao', icon: <FaIdCard className="icon-desktop" /> },
        { id: 'escolaLegislativo', label: 'Escola Legislativo', path: 'escola-legislativo', icon: <FaGraduationCap className="icon-desktop" /> },
        { id: 'falarComVereador', label: 'Falar c/ Vereador', path: 'falar-com-vereador', icon: <FaCommentDots className="icon-desktop" /> },
        { id: 'ouvidoria', label: 'Ouvidoria', path: 'ouvidoria', icon: <FaBullhorn className="icon-desktop" /> },
        { id: 'procon', label: 'Procon', path: 'procon', icon: <FaBalanceScale className="icon-desktop" /> },
        { id: 'procuradoriaMulher', label: 'Proc. da Mulher', path: 'procuradoria-mulher', icon: <FaFemale className="icon-desktop" /> },
        { id: 'salaEmpreendedor', label: 'Sala Empreendedor', path: 'sala-empreendedor', icon: <FaBriefcase className="icon-desktop" /> },
        { id: 'tvCamara', label: 'TV Câmara', path: 'tv-camara', icon: <FaTv className="icon-desktop" /> },
    ];

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
                <div className="logoDesktop" style={{ width: "100%" }}>
                    <img src={logoCamaraAI} alt="Logo" className="logo-sidebar" style={{ width: "100%" }} />
                </div>

                <nav className="nav-desktop">


                    <Link to={`/admin/materias-dash/${camaraId}`} className={`aDesktop ${isActive('materias-dash')}`}>
                        <FaAddressBook className="icon-desktop" />
                        <span className="text-desktop">Minhas Matérias</span>
                    </Link>

                    {activeModules['protocolar'] && hasAccess('create_materia') && (
                        <Link to={`/admin/protocolar-materia/${camaraId}`} className={`aDesktop ${isActive('protocolar-materia')}`}>
                            <FaPlusCircle className="icon-desktop" />
                            <span className="text-desktop">Protocolar</span>
                        </Link>
                    )}

                    {activeModules['parecer'] && hasAccess('view_parecer') && (
                        <Link to={`/admin/juizo-materia/${camaraId}`} className={`aDesktop ${isActive('juizo-materia')}`}>
                            <FaPencilAlt className="icon-desktop" />
                            <span className="text-desktop">Parecer</span>
                        </Link>
                    )}

                    {activeModules['presidencia'] && hasAccess('sign_despacho') && (
                        <Link to={`/admin/juizo-presidente/${camaraId}`} className={`aDesktop ${isActive('juizo-presidente')}`}>
                            <FaBalanceScale className="icon-desktop" />
                            <span className="text-desktop">Presidência</span>
                        </Link>
                    )}

                    {activeModules['comissoes'] && (
                        <Link to={`/admin/comissoes-dash/${camaraId}`} className={`aDesktop ${isActive('comissoes-dash')}`}>
                            <FaUsers className="icon-desktop" />
                            <span className="text-desktop">Comissões</span>
                        </Link>
                    )}

                    {activeModules['sessoes'] && hasAccess('manage_sessions') && (
                        <Link to={`/admin/pautas-sessao/${camaraId}`} className={`aDesktop ${isActive('pautas-sessao')}`}>
                            <FaList className="icon-desktop" />
                            <span className="text-desktop">Sessões</span>
                        </Link>
                    )}


                    {servicesList.map(service => activeModules[service.id] && (
                        <Link
                            key={service.id}
                            to={`/admin/servicos/${service.path}/${camaraId}`}
                            className={`aDesktop ${isActive(service.path)}`}
                        >
                            {service.icon}
                            <span className="text-desktop">{service.label}</span>
                        </Link>
                    ))}

                    {hasAccess('admin_config') && (
                        <>
                            <Link to={`/admin/configuracoes/${camaraId}`} className={`aDesktop ${isActive('configuracoes')}`}>
                                <FaCog className="icon-desktop" />
                                <span className="text-desktop">Configurações</span>
                            </Link>

                            {activeModules['assistente'] && (
                                <Link to={`/admin/assistente-admin/${camaraId}`} className={`aDesktop ${isActive('assistente-admin')}`}>
                                    <FaRobot className="icon-desktop" />
                                    <span className="text-desktop">Assistente</span>
                                </Link>
                            )}

                            <Link to={`/admin/layout-manager/${camaraId}`} className={`aDesktop ${isActive('layout-manager')}`}>
                                <FaPalette className="icon-desktop" />
                                <span className="text-desktop">Layouts</span>
                            </Link>
                        </>
                    )}

                    <Link to={`/admin/perfil/${camaraId}`} className={`aDesktop ${isActive('/perfil')}`}>
                        <FaRegUser className="icon-desktop" />
                        <span className="text-desktop">Minha Conta</span>
                    </Link>

                </nav>

                <div style={{ marginTop: 'auto', padding: '20px 0', textAlign: 'center', width: '100%' }}>
                    <p className="text-desktop" style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginLeft: 0 }}>
                        Desenvolvido por <a href="https://blu-tecnologias-site.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>Blu Tecnologias</a>
                    </p>
                </div>
            </div>
        </>
    );
};

export default MenuDashboard;
