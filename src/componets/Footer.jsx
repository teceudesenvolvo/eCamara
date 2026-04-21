import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Footer = ({ camaraId }) => {
    const [footerData, setFooterData] = useState({
        slogan: 'Governança Legislativa 4.0: Inteligência Artificial, Transparência e Participação Cidadã.',
        address: 'Endereço não informado',
        phone: 'Telefone não informado',
        email: 'Email não informado',
        title: 'Camara AI'
    });

    useEffect(() => {
        const fetchFooterConfig = async () => {
            if (!camaraId || camaraId === 'master' || camaraId === ':camaraId') return;

            try {
                const response = await api.get(`/councils/${camaraId}`);
                const data = Array.isArray(response.data) ? response.data[0] : response.data;

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
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar configurações do rodapé:", error);
            }
        };

        fetchFooterConfig();
    }, [camaraId]);

    const { title, slogan, address, phone, email } = footerData;

    return (
        <footer className='footer'>
            <div className='footer-content'>
                <div className='footer-section footer-about'>
                    <h4 className='footer-logo-text'>{title}</h4>
                    <p>{slogan}</p>
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

                <div className='footer-section footer-contact'>
                    <h4>Contato</h4>
                    <p>📍 {address}</p>
                    <p>📞 {phone}</p>
                    <p>📧 {email}</p>
                </div>
            </div>

            <div className='footer-bottom-wrapper'>
                <div className='footer-bottom'>
                    <p>
                        &copy; {new Date().getFullYear()} {title} - Todos os direitos reservados. 
                        Desenvolvido por <strong>Blu Tecnologias</strong>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;