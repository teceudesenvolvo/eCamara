



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

class slideFotoServ extends Component {
    state = {
        servicos: [
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/limpeza.jpg',
                desc: 'Limpeza Técnica',
               
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/motor.jpg',
                desc: 'Limpeza de motor',
              
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/rodas.jpg',
                desc: 'Limpeza Em Rodas',
               
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/moto.jpg',
                desc: 'Limpeza Em Motocicletas',
             
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/limpeza.jpg',
                desc: 'Limpeza Técnica',
             
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/motor.jpg',
                desc: 'Limpeza de motor',
               
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/rodas.jpg',
                desc: 'Limpeza  Em Rodas',
                
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/moto.jpg',
                desc: 'Limpeza Em Motocicletas',
                
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

export default slideFotoServ;