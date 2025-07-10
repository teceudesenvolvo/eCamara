import React, { Component } from 'react';


//Imagens
import logo from '../assets/logoLaranga.png';

import video from '../assets/pexels-shvets-production-7525343.mp4';

// Icones

// Components

//mudança de páginas

class registerLoja extends Component {
    render() {
        return (
            <div className='App-header' >
                <video src={video} autoPlay loop muted ></video>
                <div className='ContainerDesktop ' >

                    <form className='formLoginDesktop '>
                        <img src={logo} alt="logo" className='logo' />
                        <div className='h1Desktop'>
                            <h1 >Responsável da loja</h1>

                        </div>
                        <input type="text" placeholder="Nome Completo" className='inputLoginDesktop ' />
                        <input type="text" placeholder="CPF" className='inputLoginDesktop ' />
                        <input type="text" placeholder="RG" className='inputLoginDesktop ' />
                        

                        <button
                           onClick={
                            () => {
                              window.location.href = "/homeDashboard"
                              
                            }
                          }
                         className='buttonLoginDesktop'>Cadastrar Agora</button>



                    </form>

                </div>
            </div>
        );
    }
}

export default registerLoja;