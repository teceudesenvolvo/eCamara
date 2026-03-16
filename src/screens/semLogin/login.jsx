import React, { Component } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../../firebaseConfig";

//Imagens

// Icones

// Components

//mudança de páginas

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

    handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = this.state;

        if (!email || !password) {
            this.setState({ error: 'Por favor, preencha todos os campos.' });
            return;
        }

        this.setState({ loading: true, error: '' });

        try {
            await signInWithEmailAndPassword(auth, email, password);
            
            // Buscar a câmara do usuário para redirecionar corretamente
            const user = auth.currentUser;
            if (user) {
                const userIndexRef = ref(db, `users_index/${user.uid}`);
                const snapshot = await get(userIndexRef);
                
                if (snapshot.exists()) {
                    const camaraId = snapshot.val().camaraId;
                    window.location.href = `/admin/materias-dash/${camaraId}`;
                } else {
                    window.location.href = '/perfil';
                }
            }
        } catch (error) {
            console.error("Erro no login:", error);
            let errorMessage = "Ocorreu um erro ao tentar fazer login.";
            
            // Tratamento de erros comuns do Firebase
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "E-mail ou senha incorretos.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Formato de e-mail inválido.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Muitas tentativas falhas. Tente novamente mais tarde.";
            }

            this.setState({ error: errorMessage, loading: false });
        }
    };

    render() {
        const { email, password, error, loading } = this.state;

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
                    {/* <p>Não tem uma conta? <a href='/register' className='linkLogin'>Crie uma</a></p> */}
                </div>
            </div>
        );
    }
}

export default loginClient;
