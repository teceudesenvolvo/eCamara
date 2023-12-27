import React, { Component } from 'react';



//Imagens
import camera from '../assets/Camera.png';
// Icones


// Components
import MenuDashboard from '../componets/menuDashboard';


//mudança de páginas

class addProducts extends Component {
    render() {
        return (

            <div className='App-header' >
                <MenuDashboard />
                <div className='conteinar-Add-Products'>
                    <div>

                        <h1>Adicionar Serviço</h1>
                        <input type="text" placeholder="Nome Do Serviço" />
                        <input type="text" placeholder="Tempo" />
                        <input type="text" placeholder="Preço" />
                        <textarea placeholder="Descrição"></textarea>

                        <button type="submit" name="Add" value="Add" >Salvar</button>
                    </div>
                    <div className='addImg'>

                        <div>
                            <img src={camera} alt={camera}></img>
                        </div>

                    </div>

                </div>

            </div>
        );
    }
}

export default addProducts;