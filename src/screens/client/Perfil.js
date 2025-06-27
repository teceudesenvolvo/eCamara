import React, { Component } from 'react';

// Imagens
import Profile from '../../assets/face.png'; // Imagem do perfil
import Assinatura from '../../assets/assinatura-teste.png'; // Imagem da assinatura
import MenuDashboard from '../../componets/menuDashboard'; // Certifique-se de que este caminho está correto

// Imagem da pessoa no laptop (ilustração do dashboard)
// Você precisaria de um arquivo como 'ilustracao-dashboard.png' em seus assets
// Por simplicidade, vou usar um placeholder ou você pode fornecer uma SVG inline se preferir
// import DashboardIllustration from '../../assets/ilustracao-dashboard.png'; // Exemplo de importação

class Perfil extends Component {
    render() {
        return (
            <div className='profile-page-container'>
                {/* O MenuDashboard provavelmente é a sidebar do lado esquerdo.
                    Se for, ele precisará ter seus próprios estilos para se encaixar com este layout.
                    Por ora, vou assumir que ele já lida com sua posição.
                */}
                <MenuDashboard />

                <div className='profile-main-content'>
                    {/* Top Header inspirado no dashboard */}
                    <div className='profile-top-bar'>
                        <div className='top-bar-left'>
                            <h1 className='dashboard-title'>Dashboard</h1>
                            <p className='dashboard-date'>Monday, 02 March 2020</p>
                        </div>
                        <div className='top-bar-right'>
                            {/* Ícones do cabeçalho - placeholders */}
                            <span className='header-icon'>✉️</span>
                            <span className='header-icon'>🔔</span>
                            <div className='user-profile-summary'>
                                <div className='user-initials'>AJ</div>
                                <span className='user-name'>Alyssa Jones</span>
                                <span className='dropdown-arrow'>▼</span>
                            </div>
                        </div>
                    </div>

                    {/* Cartão de Boas-Vindas Grande */}
                    <div className='welcome-card'>
                        <div className='welcome-text-section'>
                            <h2 className='welcome-title'>Olá, [Nome do Usuário]!</h2> {/* Adaptado para perfil */}
                            <p className='welcome-subtitle'>Pronto para gerenciar suas informações de perfil hoje?</p>
                        </div>
                        <div className='welcome-illustration-section'>
                            {/* Ilustração da pessoa no laptop - substituir por uma imagem real */}
                            <img src="/ilustracao-dashboard.png" alt="Ilustração de boas-vindas" className="dashboard-illustration"/>
                        </div>
                    </div>

                    {/* Seção de Visão Geral (Overview) - Adaptada para informações do perfil */}
                    <h3 className='overview-heading'>Informações Essenciais</h3>
                    <div className='profile-info-cards-grid'>
                        {/* Cartões de informações de perfil */}
                        <div className='info-card info-card-yellow'>
                            <p className='card-value'>Nome Completo</p>
                            <p className='card-label'>[Nome do Usuário]</p>
                        </div>
                        <div className='info-card info-card-purple'>
                            <p className='card-value'>Cargo</p>
                            <p className='card-label'>[Cargo do Usuário]</p>
                        </div>
                        <div className='info-card info-card-pink'>
                            <p className='card-value'>Email</p>
                            <p className='card-label'>teste@teste.com</p>
                        </div>
                        <div className='info-card info-card-gray'>
                            <p className='card-value'>Telefone</p>
                            <p className='card-label'>85 99999-1213</p>
                        </div>
                        <div className='info-card info-card-orange'>
                            <p className='card-value'>Mandato</p>
                            <p className='card-label'>2020/2024</p>
                        </div>
                    </div>

                    {/* Seção da Imagem de Perfil e Assinatura */}
                    <div className='profile-details-section'>
                        <div className='profile-image-container'>
                            <img className='profile-img' src={Profile} alt='Imagem do perfil' />
                            <h4 className='profile-section-title'>Sua Foto de Perfil</h4>
                        </div>
                        <div className='signature-container'>
                            <h4 className='profile-section-title'>Sua Assinatura Digital</h4>
                            <img alt='assinatura' src={Assinatura} className='signature-img' />
                            {/* <input type="file" onChange={this.handleFileChange} /> */}
                            <button className='upload-signature-btn'>Upload Nova Assinatura</button>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className='profile-action-buttons'>
                        <input className='btnProfile btnProfileEdit' type="button" value="Editar Perfil" />
                        <input className='btnProfile' type="button" value="Salvar Alterações" />
                    </div>
                    <p className='profile-logout-link'><a href='/'>Sair da conta</a></p>
                </div>
            </div>
        );
    }
}

export default Perfil;