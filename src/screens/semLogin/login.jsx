import React, { Component } from 'react';
import api from "../../services/api";
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
                    <form className='formLogin' onSubmit={this.handleLogin}>
                        <h1>Entre com sua conta:</h1>

                        {error && <p style={{ color: '#e53935', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</p>}

                        <input type="email" placeholder="email@example.com" className='inputLogin' value={email} onChange={(e) => this.setState({ email: e.target.value })} />
                        <input type="password" placeholder="Senha" className='inputLogin' value={password} onChange={(e) => this.setState({ password: e.target.value })} />
                        <a href='/consultas' className='linkLogin'>Esqueceu a senha?</a>

                        <button type="submit" className='buttonLogin' disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                </div>
            </div>
        );
    }
}

export default loginClient;
