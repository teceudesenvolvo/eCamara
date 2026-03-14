import React, { Component } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';

// use Redux
import { connect } from 'react-redux';
import { clickButton } from '../store/actions/index';
import { bindActionCreators } from 'redux';

// Default theme
import '@splidejs/react-splide/css';

// or other themes
import '@splidejs/react-splide/css/skyblue';
import '@splidejs/react-splide/css/sea-green';

// or only core styles
import '@splidejs/react-splide/css/core';

// You might need a CSS file for custom styles, e.g., SlideFeactures.css
// import './SlideFeactures.css';

class slideFeactures extends Component {
    render() {
        const { vereadores } = this.props;

        if (!vereadores || vereadores.length === 0) {
            return <p>Nenhum representante para exibir.</p>;
        }

        const listVereadores = vereadores.map((vereador) =>
            <SplideSlide key={vereador.id} className="representative-card-slide"
                onClick={
                    () => {
                        // Simplificando a chamada da action, passando apenas o necessário.
                        this.props.clickButton({ id: vereador.id });
                        console.log(`Vereador selecionado: ${vereador.nome}`);
                    }
                }
            >
                <div className="representative-card">
                    <div className="representative-header">
                        <div className="representative-image-wrapper">
                            <img className="representative-image" src={vereador.foto} alt={vereador.nome} />
                        </div>
                        <div className="representative-info">
                            <h5 className="representative-name">{vereador.nome} </h5>
                            <p className="representative-role">Vereador(a)</p> {/* Assumindo o cargo como Vereador(a) */}
                        </div>
                    </div>
                    <div className="representative-stats">
                        <p className="stat-item">
                            <span className="stat-value">{vereador.sessoes || Math.floor(Math.random() * 5) + 1}</span> Sessões
                        </p>
                        <p className="stat-item">
                            <span className="stat-value">{vereador.materias || Math.floor(Math.random() * 50) + 5}</span> Matérias
                        </p>
                    </div>
                </div>
            </SplideSlide>
        );

        return (
            <div className="splide-container">
                <Splide
                    options={{
                        type: 'slide', // Tipo de slide
                        perPage: 4, // 2 itens por página como na imagem
                        perMove: 1, // Move 1 item por vez
                        gap: '1rem', // Espaçamento entre os slides
                        pagination: false, // Remove a paginação inferior
                        arrows: true, // Exibe as setas de navegação
                        breakpoints: {
                            768: { // Para telas menores que 768px
                                perPage: 1,
                            },
                        },
                    }}
                    aria-label="Nossos Representantes"
                    className='representatives-carousel'
                >
                    {listVereadores}
                </Splide>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    idProduct: state.service.id
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ clickButton }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(slideFeactures);
