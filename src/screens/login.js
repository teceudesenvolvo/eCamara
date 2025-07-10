import React, { Component } from 'react';


//Imagens
import logo from '../assets/e-camara-16.png';

// Icones

// Components

//mudança de páginas

class loginClient extends Component {
    render() {
        return (
            <div className='App-header loginPage' >
                <div className='Container' >
                    <img src={logo} alt="logo" className='logo logoLogin' />
                    <form className='formLogin'>
                        <h1>Entre com sua conta:</h1> 
                        <input type="text" placeholder="CPF" className='inputLogin' />
                        <input type="password" placeholder="Senha" className='inputLogin' />
                        <a href='/consultas' className='linkLogin'>Esqueceu a senha?</a>
                        <input type="button" className='buttonLogin' value="Entrar"
                        onClick={
                            () => {
                                window.location.pathname = '/perfil'
                            }
                        }
                        />
                    </form>
                    {/* <p>Não tem uma conta? <a href='/register' className='linkLogin'>Crie uma</a></p> */}
                </div>
            </div>
        );
    }
}

export default loginClient;