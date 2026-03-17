import React, { Component } from 'react';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';
import { FaVideo, FaArrowLeft } from 'react-icons/fa';

class VirtualMeetingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jitsiUrl: '',
            reuniao: null,
            loading: true,
            error: null,
            camaraId: this.props.match.params.camaraId,
            comissaoId: this.props.match.params.comissaoId,
            reuniaoId: this.props.match.params.reuniaoId,
        };
    }

    componentDidMount() {
        this.fetchMeetingDetails();
    }

    fetchMeetingDetails = async () => {
        const { camaraId, comissaoId, reuniaoId } = this.state;

        if (!camaraId || !comissaoId || !reuniaoId) {
            this.setState({ loading: false, error: "Parâmetros da reunião incompletos." });
            return;
        }

        try {
            const reuniaoRef = ref(db, `${camaraId}/comissoes//reunioes/`);
            const snapshot = await get(reuniaoRef);

            if (snapshot.exists()) {
                const reuniaoData = snapshot.val();
                if (reuniaoData.tipo === 'Virtual' && reuniaoData.url) {
                    this.setState({
                        reuniao: reuniaoData,
                        jitsiUrl: reuniaoData.url,
                        loading: false,
                    });
                } else {
                    this.setState({ loading: false, error: "Esta não é uma reunião virtual ou o link não está disponível." });
                }
            } else {
                this.setState({ loading: false, error: "Reunião não encontrada." });
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da reunião:", error);
            this.setState({ loading: false, error: "Erro ao carregar detalhes da reunião." });
        }
    };

    render() {
        const { jitsiUrl, reuniao, loading, error, camaraId } = this.state;

        if (loading) {
            return (
                <div className='App-header' style={{ justifyContent: 'center' }}>
                    Carregando reunião...
                </div>
            );
        }

        if (error) {
            return (
                <div className='App-header' style={{ justifyContent: 'center' }}>
                    {error}
                    <button onClick={() => this.props.history.goBack()} className="btn-back" style={{ marginTop: '20px' }}>
                        <FaArrowLeft /> Voltar
                    </button>
                </div>
            );
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content" style={{ flex: 1, padding: '20px' }}>
                    <button onClick={() => this.props.history.goBack()} className="btn-back" style={{ marginBottom: '20px' }}>
                        <FaArrowLeft /> Voltar para Detalhes da Comissão
                    </button>

                    <div className="dashboard-card" style={{ padding: '20px' }}>
                        <h1 className="dashboard-header-title" style={{ marginBottom: '20px' }}>
                            <FaVideo /> Reunião Virtual: {reuniao?.tipo} - {new Date(reuniao?.data).toLocaleDateString()}
                        </h1>
                        {jitsiUrl ? (
                            <div style={{ width: '100%', height: 'calc(100vh - 250px)', minHeight: '500px' }}>
                                <iframe
                                    src={jitsiUrl + "#config.startWithVideoMuted=false&config.startWithAudioMuted=false"}
                                    allow="camera; microphone; display-capture"
                                    style={{ width: '100%', height: '100%', border: 0 }}
                                    title="Jitsi Meeting"
                                ></iframe>
                            </div>
                        ) : (
                            <p>Link da reunião Jitsi não disponível.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default VirtualMeetingPage;
