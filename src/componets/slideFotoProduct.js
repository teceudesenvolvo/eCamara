import React, { Component } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
// Default theme
import '@splidejs/react-splide/css';


// or other themes
import '@splidejs/react-splide/css/skyblue';
import '@splidejs/react-splide/css/sea-green';


// or only core styles
import '@splidejs/react-splide/css/core';

//Imagen

// Icones


// Components

//mudança de páginas

class slideFotoProduct extends Component {
    state = {
        servicos: [
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/BATERIA-ALFACELL-LITHIUM-3V-CARTELA-C-2.webp',
                desc: 'Descrição do Produto  1',
              
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/PILHA-ALFACELL-COMUM-PQ-AA-1.5V-C-4-CARTELA.webp',
                desc: 'Descrição do  Produto 2',
              
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/PISTOLA-PCOLA-QUENTE.webp',
                desc: 'Descrição do Produto 3',
               
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/VDA06020-PETISQUEIRA-DE-VIDRO-D.webp',
                desc: 'Descrição do  Produto 4',
             
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/POTE-C-TAMPA-CLEAN-PRA.jpg',
                desc: 'Descrição do  Produto 5',
              
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/tabua-bambu-nv.webp',
                desc: 'Descrição do  Produto 6',
             
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/JARRA-DE-VIDRO-LOSANGO-416x416.jpg',
                desc: 'Descrição do  Produto 7',
              
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/POTE-DE-VIDRO-RT-C-DIV.jpg',
                desc: 'Descrição do  Produto 8',
                
            }, 
        ]
    }

   


    render() {
        const servicos = this.state.servicos 

        if(servicos.length > 8){
            servicos.length = 8
        }
        // const randomObject = servicos[Math.floor(Math.random() * servicos.length)];

        const listServicos = servicos.map((servico) => 
        <SplideSlide key={(servico.id)} 
       
        >
              
            
              <img className='Produto-img'  src={servico.image} alt=""></img>
              
      </SplideSlide>
    )


        return (
            <>
                <Splide 
                 options={{ height: 260, }} aria-label="My Favorite Images"  >
                    {listServicos}
                </Splide>
            </>

        );
    }
}

export default slideFotoProduct;