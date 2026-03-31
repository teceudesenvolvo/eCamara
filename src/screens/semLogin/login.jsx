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

    componentDidMount() {
        // Verifica se o usuário já está logado ao carregar o componente
        this.unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const { camaraId } = this.props.match.params; // Get camaraId from URL
                if (camaraId) {
                    // Verify if the logged-in user exists in the specific camaraId/users collection
                    const userRef = ref(db, `${camaraId}/users/${user.uid}`);
                    get(userRef).then((userSnapshot) => {
                        if (userSnapshot.exists()) {
                            // User is logged in and belongs to this camara, redirect
                            this.props.history.push(`/admin/materias-dash/${camaraId}`);
                        } else {
                            // User is logged in but does not belong to this camara, log them out
                            auth.signOut(); // Log out the user from Firebase Auth
                            this.setState({ error: "Você não tem permissão para acessar esta câmara.", loading: false });
                        }
                    }).catch(error => {
                        console.error("Erro ao verificar usuário no componentDidMount:", error);
                        auth.signOut();
                        this.setState({ error: "Erro ao verificar permissões de acesso.", loading: false });
                    });
                } else {
                    // If camaraId is not in URL, maybe redirect to a camara selector or show error
                    auth.signOut();
                    this.setState({ error: "ID da câmara não especificado na URL.", loading: false });
                }
            }
        });
    }

    componentWillUnmount() {
        // Limpa o listener para evitar memory leaks
        if (this.unsubscribe) this.unsubscribe();
    }

    handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = this.state;
        const { camaraId } = this.props.match.params; // Get camaraId from URL
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
                // Verifique se o usuário existe na câmara correta
                const userRef = ref(db, `${camaraId}/users/${user.uid}`);
                const userSnapshot = await get(userRef);

                 if (userSnapshot.exists()) {
                     window.location.href = `/admin/materias-dash/${camaraId}`;
                }
                else{
                    // User authenticated with Firebase, but is not registered for this specific camaraId
                    // Log out the user from Firebase Auth as they don't have access to this camara
                    await auth.signOut();
                    this.setState({ 
                        error: "Você não tem permissão para acessar esta câmara.", 
                        loading: false 
                    });
                }
            }
        } catch (error) {
            console.error("Erro no login:", error);
            let errorMessage = "Você não faz parte desta câmara!";

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
