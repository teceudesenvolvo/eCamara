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

class slideFeactures extends Component {
    state = {
        servicos: [
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/limpeza.jpg',
                desc: 'Limpeza Técnica',
                value: '192,50'
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/motor.jpg',
                desc: 'Limpeza de motor',
                value: '192,50'
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/rodas.jpg',
                desc: 'Limpeza Em Rodas',
                value: '192,50'
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/moto.jpg',
                desc: 'Limpeza Em Motocicletas',
                value: '192,50'
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/limpeza.jpg',
                desc: 'Limpeza Técnica',
                value: '192,50'
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/motor.jpg',
                desc: 'Limpeza de motor',
                value: '192,50'
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/rodas.jpg',
                desc: 'Limpeza  Em Rodas',
                value: '192,50'
            },
            {
                id: '1',
                image: 'https://autolider-ok6fhsopc-felipe00007.vercel.app/img/moto.jpg',
                desc: 'Limpeza Em Motocicletas',
                value: '192,50'
            }]
    }




    render() {
        const servicos = this.state.servicos

        if (servicos.length > 8) {
            servicos.length = 8
        }
        // const randomObject = servicos[Math.floor(Math.random() * servicos.length)];

        const listServicos = servicos.map((servico) =>
            <SplideSlide key={(servico.id)} className="slidesFeacture"
                onClick={
                    () => {
                        window.location.href = "/Servico"

                    }
                }
            // onClick={
            //   () => {this.setState({id: aviso.id}, () => {
            //     (this.props.clickButton(this.state))
            //     (window.location.href = "/item")
            //   })}
            // }
            >
                {/* <img src={aviso.imageUrl}/> */}

                <img class="imagDestaques" src={servico.image} alt=""></img>
                <div class="DestaquesDescricao" >
                    <p>{servico.desc}</p>
                </div>
            </SplideSlide>
        )


        return (
            <>
                <Splide
                    options={{
                        perPage: 3,
                        focus: 'center',
                        drag: 'free'
                    }} aria-label="My Favorite Images" className='slideMatriz' >
                    {listServicos}
                </Splide>
            </>

        );
    }
}

export default slideFeactures;
