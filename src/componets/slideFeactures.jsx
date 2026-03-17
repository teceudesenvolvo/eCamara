import React, { Component } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { withRouter } from 'react-router-dom';

// use Redux
import { connect } from 'react-redux';
import { clickButton } from '../store/actions/index';
import { bindActionCreators } from 'redux';
import { db } from '../firebaseConfig';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

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
            vereadores: [],
            loading: true
        };
    }

    componentDidMount() {
        this.fetchVereadores();
    }

    fetchVereadores = async () => {
        const { camaraId } = this.props.match.params;
        if (!camaraId) return;

        try {
            const usersRef = ref(db, `${camaraId}/users`);
            const q = query(usersRef, orderByChild('tipo'), equalTo('vereador'));
            const materiasRef = ref(db, `${camaraId}/materias`);
            const comissoesRef = ref(db, `${camaraId}/comissoes`);

            // Buscar usuários, matérias e comissões simultaneamente
            const [usersSnapshot, materiasSnapshot, comissoesSnapshot] = await Promise.all([
                get(q),
                get(materiasRef),
                get(comissoesRef)
            ]);

            // Calcular contagem de matérias por usuário
            const materiasCountByUserId = {};
            if (materiasSnapshot.exists()) {
                materiasSnapshot.forEach(child => {
                    const mat = child.val();
                    if (mat.userId) {
                        materiasCountByUserId[mat.userId] = (materiasCountByUserId[mat.userId] || 0) + 1;
                    }
                });
            }

            // Calcular contagem de comissões por usuário
            const comissoesCountByUserId = {};
            if (comissoesSnapshot.exists()) {
                comissoesSnapshot.forEach(child => {
                    const com = child.val();
                    if (com.membros) {
                        Object.keys(com.membros).forEach(memberId => {
                            comissoesCountByUserId[memberId] = (comissoesCountByUserId[memberId] || 0) + 1;
                        });
                    }
                });
            }

            const fetchedVereadores = [];
            if (usersSnapshot.exists()) {
                usersSnapshot.forEach((child) => {
                    const val = child.val();
                    const userId = child.key;
                    fetchedVereadores.push({
                        id: userId,
                        nome: val.nome,
                        foto: val.foto || 'https://via.placeholder.com/150',
                        ...val,
                        materiasCount: materiasCountByUserId[userId] || 0,
                        comissoesCount: comissoesCountByUserId[userId] || 0
                    });
                });
            }
            this.setState({ vereadores: fetchedVereadores, loading: false });
        } catch (error) {
            console.error("Erro ao buscar vereadores:", error);
            this.setState({ loading: false });
        }
    };

    render() {
        // Use state vereadores if available (fetched from Firebase), 
        // otherwise fallback to props (if passed from parent)
        const vereadores = this.state.vereadores.length > 0 ? this.state.vereadores : this.props.vereadores;
        const { camaraId } = this.props.match.params;

        if (!vereadores || vereadores.length === 0) {
            if (this.state.loading) return <p>Carregando representantes...</p>;
            return <p>Nenhum representante para exibir.</p>;
        }

        const listVereadores = vereadores.map((vereador) =>
            <SplideSlide key={vereador.id} className="representative-card-slide"
                onClick={
                    () => { 
                        if (camaraId) {
                            this.props.history.push(`/vereador/${camaraId}/${vereador.id}`);
                        } else {
                            this.props.clickButton({ id: vereador.id });
                            console.log(`Vereador selecionado: ${vereador.nome}`);
                        }
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
                            <span className="stat-value">{vereador.materiasCount}</span> Matérias
                        </p>
                        <p className="stat-item">
                            <span className="stat-value">{vereador.comissoesCount}</span> Comissões
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(slideFeactures));
