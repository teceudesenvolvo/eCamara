import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, get, update, set } from 'firebase/database';
import logo from '../../assets/logo-camara-ai-font-verde.png';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nome: '',
            email: '',
            senha: '',
            confirmarSenha: '',
            camaraId: this.props.match.params.camaraId,
            inviteId: null,
            tipo: null,
            loading: true,
            error: '',
            success: false,
        };
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const inviteId = params.get('invite');
        const tipo = params.get('tipo');
        const camaraId = params.get('camara');

        // Se tiver inviteId, validamos no banco. Se tiver tipo direto (link genérico), usamos direto.
        if (inviteId && camaraId) {
            this.validateInvite(inviteId, camaraId);
        } else if (tipo && camaraId) {
            this.setState({ tipo, camaraId, loading: false });
        } else {
            this.setState({ error: 'Link de convite inválido ou incompleto. Verifique se o link possui "camara" e ("invite" ou "tipo").', loading: false });
        }
    }

    validateInvite = async (inviteId, camaraId) => {
        const inviteRef = ref(db, `${camaraId}/convites/${inviteId}`);
        try {
            const snapshot = await get(inviteRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.used) {
                    this.setState({ error: 'Este convite já foi utilizado.', loading: false });
                } else {
                    this.setState({ inviteId, camaraId, tipo: data.tipo, email: data.email || '', loading: false });
                }
            } else {
                this.setState({ error: 'Convite não encontrado.', loading: false });
            }
        } catch (error) {
            console.error("Erro ao validar convite:", error);
            this.setState({ error: 'Erro ao validar convite.', loading: false });
        }
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleRegister = async (e) => {
        e.preventDefault();
        const { nome, email, senha, confirmarSenha, camaraId, tipo, inviteId } = this.state;

        if (senha !== confirmarSenha) {
            this.setState({ error: 'As senhas não coincidem.' });
            return;
        }

        this.setState({ loading: true, error: '' });

        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            // 2. Save user data to Realtime Database
            const userRef = ref(db, `${camaraId}/users/${user.uid}`);
            await update(userRef, {
                uid: user.uid,
                nome: nome,
                email: email,
                tipo: tipo,
                createdAt: new Date().toISOString(),
            });

            // // 3. Salvar no índice global para facilitar o login
            // const globalUserRef = ref(db, `${camaraId}/users${user.uid}`);
            // await set(globalUserRef, { camaraId });

            // 4. Se houver inviteId, marcar como usado
            if (inviteId) {
                const inviteRef = ref(db, `${camaraId}/convites/${inviteId}`);
                await update(inviteRef, {
                    used: true,
                    usedBy: user.uid,
                    usedAt: new Date().toISOString()
                });
            }

            this.setState({ success: true, loading: false });

        } catch (error) {
            let errorMessage = 'Ocorreu um erro ao realizar o cadastro.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este email já está em uso. Tente fazer login.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
            }
            console.error("Erro no cadastro:", error);
            this.setState({ error: errorMessage, loading: false });
        }
    };

    render() {
        const { loading, error, success, nome, email, senha, confirmarSenha } = this.state;

        const renderContent = () => {
            if (loading) {
                return <p>Verificando convite...</p>;
            }
            if (error) {
                return (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#d32f2f' }}>Erro no Convite</h2>
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
                    <p>Você foi convidado para se juntar à plataforma. Complete seus dados abaixo.</p>
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
                        {error && <p className="txtErro">{error}</p>}
                        <button type="submit" className="buttonLogin" disabled={loading}>
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