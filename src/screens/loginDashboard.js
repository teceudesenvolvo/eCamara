import React, { Component } from 'react';


//Imagens
import logo from '../assets/logoLaranga.png';

import video from '../assets/pexels-shvets-production-7525343.mp4';

// Icones

// Components

//mudança de páginas

class loginDashboard extends Component {
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
                        
                        <input type="text" placeholder="E-mail" className='inputLoginDesktop ' />
                        <input type="password" placeholder="Senha" className='inputLoginDesktop ' />
                        <a href='#' className='pDesktop' >Esqueceu a senha?</a>
                        <button className='buttonLoginDesktop'>Entrar</button>
                       

                        <p className='pDesktop'>Não tem uma conta? <a href='/registerDashboard' className='pDesktop'>Crie uma</a></p>
                    </form>

                </div>
            </div>
        );
    }
}

export default loginDashboard;