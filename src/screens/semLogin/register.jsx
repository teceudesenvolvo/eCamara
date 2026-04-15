import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import logo from '../../assets/logo-camara-ai-font-verde.png';
class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nome: '',
            email: '',
            senha: '',
            confirmarSenha: '',
            cpf: '',
            phone: '',
            camaraId: '',
            tipo: null,
            loading: true,
            error: '',
            success: false,
        };
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const camaraId = params.get('camara');
        const tipo = params.get('tipo');

        if (camaraId) {
            this.setState({ camaraId, tipo, loading: false });
        } else {
            this.setState({ error: 'ID da câmara não encontrado no link.', loading: false });
        }
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleRegister = async (e) => {
        e.preventDefault();
        const { nome, email, senha, confirmarSenha, cpf, phone, camaraId } = this.state;

        if (senha !== confirmarSenha) {
            this.setState({ error: 'As senhas não coincidem.' });
            return;
        }

        this.setState({ loading: true, error: '' });

        try {
            await api.post('/auth/register', {
                name: nome,
                email,
                password: senha,
                cpf,
                phone,
                councilSlug: camaraId
            });

            this.setState({ success: true, loading: false });
        } catch (error) {
            let errorMessage = 'Ocorreu um erro ao realizar o cadastro.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            console.error("Erro no cadastro:", error);
            this.setState({ error: errorMessage, loading: false });
        }
    };

    render() {
        const { loading, error, success, nome, email, senha, confirmarSenha, cpf, phone } = this.state;

        const renderContent = () => {
            if (loading) {
                return <p>Carregando...</p>;
            }
            if (error && !success) {
                return (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#d32f2f' }}>Erro no Cadastro</h2>
                        <p style={{ color: '#333' }}>{error}</p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', marginTop: '20px' }}>Voltar para o Login</Link>
                    </div>
                );
            }
            if (success) {
                return (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#2e7d32' }}>Cadastro Realizado!</h2>
                        <p style={{ color: '#333' }}>Sua conta foi criada com sucesso.</p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', marginTop: '20px' }}>Ir para o Login</Link>
                    </div>
                );
            }
            return (
                <>
                    <h1>Finalize seu Cadastro</h1>
                    <p>Preencha seus dados para acessar o sistema.</p>
                    <form onSubmit={this.handleRegister} style={{ width: '100%' }}>
                        <input
                            type="text"
                            name="nome"
                            className="inputLogin"
                            placeholder="Seu nome completo"
                            value={nome}
                            onChange={this.handleInputChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            className="inputLogin"
                            placeholder="Seu email"
                            value={email}
                            onChange={this.handleInputChange}
                            required
                        />
                         <input
                            type="text"
                            name="cpf"
                            className="inputLogin"
                            placeholder="CPF (000.000.000-00)"
                            value={cpf}
                            onChange={this.handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="phone"
                            className="inputLogin"
                            placeholder="Telefone/WhatsApp"
                            value={phone}
                            onChange={this.handleInputChange}
                            required
                        />
                        <input
                            type="password"
                            name="senha"
                            className="inputLogin"
                            placeholder="Crie uma senha"
                            value={senha}
                            onChange={this.handleInputChange}
                            required
                        />
                        <input
                            type="password"
                            name="confirmarSenha"
                            className="inputLogin"
                            placeholder="Confirme sua senha"
                            value={confirmarSenha}
                            onChange={this.handleInputChange}
                            required
                        />
                        {error && <p className="txtErro" style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>{error}</p>}
                        <button type="submit" className="buttonLogin" disabled={loading} style={{ marginTop: '20px' }}>
                            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                        </button>
                    </form>
                </>
            );
        };

        return (
            <div className="loginPage">
                <div className="formLogin">
                    <img src={logo} alt="Camara AI" style={{ width: '150px', marginBottom: '20px' }} />
                    {renderContent()}
                </div>
            </div>
        );
    }
}

export default Register;