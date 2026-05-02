import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from "../../services/api";
import LogoIcon from '../../assets/logo-camaraai-icon.png'

class loginClient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: '',
            loading: false
        };
    }

    componentDidMount() {
        // Verifica se o usuário já está logado localmente
        const token = localStorage.getItem('@CamaraAI:token');
        const { camaraId } = this.props.match.params;
        if (token && camaraId) {
            // Redireciona se já houver um token
            this.props.history.push(`/admin/materias-dash/${camaraId}`);
        }
    }

    handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = this.state;
        const { camaraId } = this.props.match.params; // slug da câmara

        if (!email || !password) {
            this.setState({ error: 'Por favor, preencha todos os campos.' });
            return;
        }

        this.setState({ loading: true, error: '' });

        try {
            const response = await api.post('/login', {
                email,
                password,
                councilSlug: camaraId
            });

            const { token, user } = response.data;

            // Salva os dados no localStorage
            localStorage.setItem('@CamaraAI:token', token);
            localStorage.setItem('@CamaraAI:user', JSON.stringify(user));
            localStorage.setItem('@CamaraAI:councilId', camaraId);

            window.location.href = `/admin/materias-dash/${camaraId}`;
        } catch (error) {
            console.error("Erro no login:", error);
            let errorMessage = "Usuário ou senha incorretos!";

            if (error.response) {
                if (error.response.status === 403) {
                    errorMessage = "Usuário legado detectado. Por favor, realize a migração seguindo as instruções enviadas ao seu e-mail.";
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }

            this.setState({ error: errorMessage, loading: false });
        }
    };

    render() {
        const { email, password, error, loading } = this.state;
        const { camaraId } = this.props.match.params;
        return (
            <div className='App-header loginPage' >
                <div className='Container' >
                    <div className='formLogin'>
                        <div className='login-header'>
                            <img src={LogoIcon} alt="Logo Câmara AI" style={{marginBottom: '20px', width: '150px'}} />
                            <h1>Câmara AI</h1>
                            <p>Inicie sessão com seu ID da Câmara</p>
                        </div>

                        <form onSubmit={this.handleLogin} style={{ width: '100%' }}>
                            {error && <p className="txtErro" style={{ marginBottom: '20px' }}>{error}</p>}

                            <input type="email" placeholder="E-mail" className='inputLogin' value={email} onChange={(e) => this.setState({ email: e.target.value })} />
                            <input type="password" placeholder="Senha" className='inputLogin' value={password} onChange={(e) => this.setState({ password: e.target.value })} />
                            
                            <button type="submit" className='buttonLogin' disabled={loading}>
                                {loading ? 'Processando...' : 'Entrar'}
                            </button>
                        </form>

                        <div className='login-footer'>
                            <a href='/consultas' className='linkLogin'>Esqueceu a senha?</a>
                            <p className="register-text">Não tem um ID? <a href="https://blu-tecnologias-site.vercel.app/#/products/2" target="_blank" rel="noopener noreferrer">Crie o seu agora.</a></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default loginClient;
