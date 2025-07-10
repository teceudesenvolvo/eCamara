import React, { Component } from 'react';


//Imagens
import logo from '../assets/logoLaranga.png';

import video from '../assets/pexels-shvets-production-7525343.mp4';

// Icones

// Components

//mudança de páginas

class registerDashboard extends Component {
    render() {
        return (
            <div className='App-header' >
                <video src={video} autoPlay loop muted ></video>
                <div className='ContainerDesktop ' >

                    <form className='formLoginDesktop '>
                        <img src={logo} alt="logo" className='logo' />
                        <div className='h1Desktop'>
                            <h1 >Seja bem-vindo!</h1>

                        </div>
                        <input type="text" placeholder="Nome" className='inputLoginDesktop ' />
                        <input type="emeil" placeholder="E-mail" className='inputLoginDesktop ' />
                        <input type="tel" placeholder="(85) 9 9999-9999" className='inputLoginDesktop ' />


                        <button 
                          onClick={
                            () => {
                              window.location.href = "/registerEndereco"
                              
                            }
                          }
                        className='buttonLoginDesktop'>Cadastrar Agora</button>



                    </form>

                </div>
            </div>
        );
    }
}

export default registerDashboard;