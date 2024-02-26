import React, { Component } from 'react';



//Imagens
import Profile from '../../assets/face.png'

// Icones

// Components
import MenuDashboard from '../../componets/menuDashboard';

//mudança de páginas

class Perfil extends Component {
    render() {
        return (

            <div className='App-header' >
                 <MenuDashboard />

                <div className='favoritos agendarConsulta'>



                    <ul className='vistosHome'>

                        {/* Informações Pessoais */}
                        <img className='profile-img' src={Profile} alt='imagem do perfil'></img>
                        <li className="profile-desc">
                            <div className='profile-desc' >
                                <p className='profile-desc-item' >Nome Completo</p>
                                <p className='profile-desc-item' >Prefeito</p>
                                <p className='profile-desc-item' >teste@teste.com</p>
                                <p className='profile-desc-item' >85 99999-1213</p>
                                <p className='profile-desc-item' >03/11/1997</p>
                            </div>
                        </li>
                    </ul>
                    <div className='profile-btn-div'>
                        <input className='btnProfile btnProfileEdit btnHomeAcess btnCadastroHome buttonLogin' type="button" value="Editar"
                            onClick={
                                () => {
                                    // window.location.pathname = '#'
                                }
                            }
                        />
                        <input className='btnProfile btnHomeAcess btnCadastroHome buttonLogin' type="button" value="Salvar"
                            onClick={
                                () => {
                                    // window.location.pathname = '/login'
                                }
                            }
                        />
                    </div>
                    <p><a href='/' className='profile-btn-exit'>Sair da conta</a></p>
                </div>
            </div>

        );
    }
}

export default Perfil;