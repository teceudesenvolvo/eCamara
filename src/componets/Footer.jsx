import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaUserTie } from 'react-icons/fa'; // Import necessary icons

const Footer = ({ camaraId }) => {
    const [footerData, setFooterData] = useState({
        slogan: 'Governança Legislativa 4.0: Inteligência Artificial, Transparência e Participação Cidadã.',
        address: 'Endereço não informado',
        phone: 'Telefone não informado',
        email: 'Email não informado',
        title: 'Camara AI',
        presidentName: 'Não informado', // New state for president's name
        presidentPhoto: '', // New state for president's photo
        copyright: `© ${new Date().getFullYear()} Camara AI - Todos os direitos reservados.` // New state for copyright
    });

    useEffect(() => {
        const fetchFooterConfig = async () => {
            if (!camaraId || camaraId === 'master' || camaraId === ':camaraId') return;

            try {
                const [councilResponse, usersResponse] = await Promise.all([
                    api.get(`/councils/${camaraId}`),
                    api.get(`/users/council/${camaraId}`).catch(error => {
                        console.error("Erro ao buscar usuários para o rodapé:", error);
                        return { data: [] }; // Return empty array on error
                    })
                ]);

                const data = Array.isArray(councilResponse.data) ? councilResponse.data[0] : councilResponse.data;

                // Extração robusta de usuários seguindo a mesma lógica do slideVereadores.jsx
                const allUsersData = usersResponse.data || [];
                const usersList = Array.isArray(allUsersData) ? allUsersData : (allUsersData?.users || Object.values(allUsersData || {}));

                let presidentName = 'Não informado';
                let presidentPhoto = '';
                const president = usersList.find(u =>
                    (u?.cargo && u.cargo.toLowerCase() === 'presidente') ||
                    (u?.role && u.role.toLowerCase() === 'presidente') ||
                    (u?.tipo && u.tipo.toLowerCase() === 'presidente')
                );
                if (president) {
                    presidentName = president.name || president.nome || 'Presidente';
                    presidentPhoto = president.foto || president.avatar || president.photoURL || 'https://www.nicepng.com/png/detail/787-7871387_our-team-person-unknown-png.png';
                }

                if (data) {
                    // Extração robusta seguindo o padrão da HomePage e AddProducts
                    const config = data.config || data.dadosConfig || {};
                    const footerConfig = config.footer || data.footer || {};
                    const homeConfig = config.home || data.home || {};

                    setFooterData({
                        title: data.name || homeConfig.titulo || 'Camara AI',
                        slogan: data.slogan || homeConfig.slogan || footerConfig.slogan || 'Governança Legislativa 4.0: Inteligência Artificial, Transparência e Participação Cidadã.',
                        address: footerConfig.address || data.address || 'Endereço não informado',
                        phone: footerConfig.phone || data.phone || 'Telefone não informado',
                        email: footerConfig.email || data.email || 'Email não informado',
                        presidentName: presidentName,
                        presidentPhoto: presidentPhoto,
                        copyright: footerConfig.copyright || `© ${new Date().getFullYear()} ${data.name || homeConfig.titulo || 'Camara AI'} - Todos os direitos reservados.`
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar configurações do rodapé:", error);
            }
        };
        fetchFooterConfig();
    }, [camaraId]);

    const { title, slogan, address, phone, email, presidentName, presidentPhoto, copyright } = footerData;

    return (
        <footer className='footer'>
            <div className='footer-content'>

                {/* New section for Mesa Diretora */}
                <div className='footer-section footer-mesa-diretora'>
                    <h4>Mesa Diretora</h4>
                    <p>Legislatura 2024 a 2026</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                        {presidentPhoto ? (
                            <img 
                                src={presidentPhoto} 
                                alt={presidentName} 
                                style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                            />
                        ) : (
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUserTie size={20} style={{ opacity: 0.7 }} /></div>
                        )}
                        <span style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#ffffff !important', textAlign: 'left' }}>{presidentName}</span>
                    </div>
                </div>
                

                <div className='footer-section footer-links-section'>
                    <h4>Legislativo</h4>
                    <ul>
                        <li><Link to={`/sessoes/${camaraId}`}>Sessões</Link></li>
                        <li><Link to={`/materias/${camaraId}`}>Matérias</Link></li>
                        <li><Link to={`/normas/${camaraId}`}>Normas Jurídicas</Link></li>
                        <li><Link to={`/comissoes/${camaraId}`}>Comissões</Link></li>
                    </ul>
                </div>

                <div className='footer-section footer-contact' >
                    <h4>Contato</h4>
                    <div className='footer-section footer-contact' style={{textAlign: 'left'}}>
                        <p><FaMapMarkerAlt /> {address}</p>
                        <p><FaPhone /> {phone}</p>
                        <p><FaEnvelope /> {email}</p>
                    </div>
                </div>

                
            </div>

            <div className='footer-bottom-wrapper'>
                <div className='footer-bottom'>
                    <p>
                        {copyright}
                        Desenvolvido por <strong>Blu Tecnologias</strong>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;