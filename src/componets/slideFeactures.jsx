import React, { Component } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { withRouter } from 'react-router-dom';

// use Redux
import { connect } from 'react-redux';
import { clickButton } from '../store/actions/index';
import { bindActionCreators } from 'redux';
import api from '../services/api.js';

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
        if (!camaraId || camaraId === ':camaraId') return;

        try {
            // Buscar usuários, matérias e comissões simultaneamente via API
            const [usersResponse, materiasResponse, comissoesResponse] = await Promise.all([
                api.get(`/users/council/${camaraId}`),
                api.get(`/legislative-matters/${camaraId}`),
                api.get(`/commissions/${camaraId}`)
            ]);

            const usersData = usersResponse.data || [];
            const materiasData = materiasResponse.data || [];
            const comissoesData = comissoesResponse.data || [];

            // Calcular contagem de matérias por usuário
            const materiasCountByUserId = {};
            materiasData.forEach(mat => {
                if (mat.userId) {
                    materiasCountByUserId[mat.userId] = (materiasCountByUserId[mat.userId] || 0) + 1;
                }
            });

            // Calcular contagem de comissões por usuário
            const comissoesCountByUserId = {};
            comissoesData.forEach(com => {
                if (com.membros) {
                    Object.values(com.membros).forEach(member => {
                        const memberId = member.id || member.uid;
                        if (memberId) {
                            comissoesCountByUserId[memberId] = (comissoesCountByUserId[memberId] || 0) + 1;
                        }
                    });
                }
            });

            const fetchedVereadores = usersData
                .filter(u => {
                    const role = (u.role || u.tipo || '').toLowerCase();
                    const cargo = (u.cargo || '').toLowerCase();
                    // Filtra por nível de acesso ou cargo institucional para identificar parlamentares
                    return role === 'vereador' || role === 'presidente' || role === 'parlamentar' || 
                           cargo.includes('vereador') || cargo.includes('presidente');
                })
                .map(u => ({
                    ...u,
                    id: u.id,
                    foto: u.foto || u.avatar || u.photoURL || 'https://via.placeholder.com/150',
                    materiasCount: materiasCountByUserId[u.id] || u._count?.matters || 0,
                    comissoesCount: comissoesCountByUserId[u.id] || 0
                }));

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
                            <img className="representative-image" src={vereador.foto || vereador.avatar || vereador.photoURL || 'https://via.placeholder.com/150'} alt={vereador.nome} />
                        </div>
                        <div className="representative-info">
                            <h5 className="representative-name">{vereador.nome} </h5>
                            <p className="representative-role" style={{ textTransform: 'capitalize' }}>{vereador.cargo || vereador.tipo || vereador.role}</p>
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
