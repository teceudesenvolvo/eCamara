import React, { Component } from 'react';


//Imagens
import logo from '../assets/logoLaranga.png';

import video from '../assets/pexels-shvets-production-7525343.mp4';

// Icones

// Components

//mudança de páginas

class registerEndereco extends Component {
    render() {
        return (
            <div className='App-header' >
                <video src={video} autoPlay loop muted ></video>
                <div className='ContainerDesktop ' >

                    <form className='formLoginDesktop '>
                        <img src={logo} alt="logo" className='logo' />
                        <div className='h1Desktop'>
                            <h1 >Endereço da loja</h1>

                        </div>
                        <input type="text" placeholder="CEP" className='inputLoginDesktop ' />
                        <input type="text" placeholder="Estado" className='inputLoginDesktop ' />
                        <input type="text" placeholder="Cidade" className='inputLoginDesktop ' />
                        <input type="text" placeholder="Bairro" className='inputLoginDesktop ' />
                        <input type="text" placeholder="Endereço" className='inputLoginDesktop ' />
                        <input type="text" placeholder="Número" className='inputLoginDesktop ' />
                        <input type="text" placeholder="Complemento(Opicional)" className='inputLoginDesktop ' />




                        <button
                           onClick={
                            () => {
                              window.location.href = "/registerLoja"
                              
                            }
                          }
                         className='buttonLoginDesktop'>Cadastrar Agora</button>



                    </form>

                </div>
            </div>
        );
    }
}

export default registerEndereco;