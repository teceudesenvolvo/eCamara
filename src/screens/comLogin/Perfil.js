import React, { Component } from 'react';

// Imagens
import Profile from '../../assets/vereador.jpg'; // Imagem do perfil
// import Assinatura from '../../assets/assinatura-teste.png'; // Imagem da assinatura - Removido pois não está na nova imagem de referência
import MenuDashboard from '../../componets/menuDashboard'; // Certifique-se de que este caminho está correto

// Ícones (se necessário, pode adicionar do Material-UI ou Font Awesome)
// import EditIcon from '@mui/icons-material/Edit'; // Exemplo de ícone de edição


class Perfil extends Component {
    render() {
        return (
            <div className='profile-page-container'>
                {/* O MenuDashboard provavelmente é a sidebar do lado esquerdo. */}
                <MenuDashboard />

                <div className='profile-main-content'>
                    <div className='profile-card'>
                        {/* Imagem de Perfil com ícone de edição */}
                        <div className='profile-image-wrapper'>
                            <img className='profile-img' src={Profile} alt='Imagem do perfil' />
                            {/* Ícone de edição sobreposto à imagem */}
                            <div className='edit-icon-overlay'>✏️</div> {/* Usando um emoji como placeholder */}
                            {/* Se quiser um ícone Material-UI: <EditIcon className='edit-icon' /> */}
                        </div>

                        {/* Informações do Perfil */}
                        <div className='profile-info-section'>
                            <div className='info-item'>
                                <p className='info-label'>Nome Sobrenome</p>
                            </div>
                            <div className='info-item'>
                                <p className='info-label'>Função</p>
                            </div>
                            <div className='info-item'>
                                <p className='info-label'>Email</p>
                            </div>
                            <div className='info-item'>
                                <p className='info-label'>Telefone</p>
                            </div>
                            <div className='info-item no-border'> {/* Último item sem borda inferior */}
                                <p className='info-label'>Nascimento</p>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className='profile-action-buttons'>
                            <button className='profile-btn profile-btn-edit'>Editar</button>
                            <button className='profile-btn profile-btn-save'>Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Perfil;