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