import React, { Component } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import axios from 'axios';

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
    constructor(props) {
        super(props);
        this.state = {
            posts: []
        };
    }

    loadNoticias = async () => {
        await axios.get(`https://sapl.saogoncalodoamarante.ce.leg.br/api/parlamentares/legislatura/20/parlamentares/?get_all=true`)
            .catch(err => console.log(`o erro foi esse aqui: ${err}`))
            .then(
                res => {
                    const postsAll = res.data;
                    let posts = [];
                    for (let key in postsAll) {
                        // Adicionando dados fictícios para 'sessoes' e 'materias'
                        posts.push({
                            ...postsAll[key],
                            id: key,
                            sessoes: Math.floor(Math.random() * 5) + 1, // 1 a 5 sessões
                            materias: Math.floor(Math.random() * 50) + 5, // 5 a 54 matérias
                        });
                    }
                    this.setState({ posts: posts });
                    console.log(res.data);
                }
            );
    };

    componentDidMount() {
        const loadPage = () => this.loadNoticias();
        loadPage();
    }

    render() {
        const posts = this.state.posts;

        const listPosts = posts.map((post) =>
            <SplideSlide key={post.id} className="representative-card-slide"
                onClick={
                    () => {
                        this.setState({ id: post.id }, () => {
                            (this.props.clickButton(this.state));
                            console.log(this.state);
                            // (window.location.href = "/produto"); // Descomente se precisar redirecionar
                        });
                    }
                }
            >
                <div className="representative-card">
                    <div className="representative-header">
                        <div className="representative-image-wrapper">
                            <img className="representative-image" src={post.fotografia} alt={post.nome_parlamentar} />
                        </div>
                        <div className="representative-info">
                            <h5 className="representative-name">{post.nome_parlamentar} </h5>
                            <p className="representative-role">Vereador(a)</p> {/* Assumindo o cargo como Vereador(a) */}
                        </div>
                    </div>
                    <div className="representative-stats">
                        <p className="stat-item">
                            <span className="stat-value">{post.sessoes}</span> Sessões
                        </p>
                        <p className="stat-item">
                            <span className="stat-value">{post.materias}</span> Matérias
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
                    {listPosts}
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
