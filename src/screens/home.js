import React, { Component } from 'react';
import '../App.css'

//Imagens


// Icones


// Components
import Hero from '../componets/heroHome';
import SlideFeacures from '../componets/slideFeactures';
import TopBar from '../componets/topBarSearch'
// import ProductsList from '../componets/productsListHome';

//mudança de páginas

class Home extends Component {
  
  render() {
    return (

      <div className='App-header' >

        {/* Search */}
        <div className='header-home'>
          <TopBar />
        </div>
          <Hero/>


        <div className='conteinerHome'>
          <div>
            <input className='btnHomeAcess btnLoginHome' type="button" value="Quero ser Fornecedor"
            onClick={
              () => {
                window.location.pathname = '/register'
              }
            }
            />
            <input className='btnHomeAcess btnCadastroHome' type="button" value="Licitações" 
            onClick={
              () => {
                window.location.pathname = '/consultas'
              }
            }
            />
          </div>

          {/* Carrosel */}
          <p className='textoDestaques'>Destaques</p>

          <div className='HomeDesktopCarrosel'>
            <SlideFeacures />

          </div>
          {/* Destaque Lista */}
          <div className=''>
            {/* <ProductsList /> */}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;