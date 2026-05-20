import React, { Component } from 'react';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';
import { FaVideo, FaArrowLeft, FaCheck, FaTimes, FaFileAlt, FaLock } from 'react-icons/fa';

class VirtualMeetingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jitsiUrl: '',
            reuniao: null,
            comissao: null,
            materias: [],
            loading: true,
            error: null,
            camaraId: (this.props.match && this.props.match.params && this.props.match.params.camaraId) || '',
            comissaoId: (this.props.match && this.props.match.params && this.props.match.params.comissaoId) || '',
            reuniaoId: (this.props.match && this.props.match.params && this.props.match.params.reuniaoId) || '',
            homeConfig: {},
            councilName: '',
            userRole: 'Visitante',
            currentUser: null,
            
            // Voting state
            showVotingModal: false,
            votingMateria: null,
            memberVote: 'Favorável',
            votoEmSeparadoFile: null
        };
    }

    componentDidMount() {
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        this.setState({ currentUser: user });

        const camaraId = this.getCurrentCamaraId();
        if (camaraId && camaraId !== this.state.camaraId) {
            this.setState({ camaraId }, () => {
                this.fetchConfigsAndLogo();
                this.fetchMeetingDetails();
                this.fetchMaterias();
            });
            return;
        }
        this.fetchConfigsAndLogo();
        this.fetchMeetingDetails();
    };

    // --- Voting Methods ---

    handleOpenVoting = (materia) => {
        this.setState({ showVotingModal: true, votingMateria: materia, memberVote: 'Favorável' });
    };

    handleVotoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            this.setState({ votoEmSeparadoFile: file });
        }
    };

    handleCastVote = async () => {
        const { votingMateria, memberVote, votoEmSeparadoFile, currentUser, camaraId } = this.state;
        if (!currentUser) return;

        const signatureMetadata = {
            nome: currentUser.name || currentUser.displayName || 'Membro',
            email: currentUser.email,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        const voteData = {
            voto: memberVote,
            data: new Date().toISOString(),
            nome: currentUser.name || currentUser.displayName || 'Membro',
            signature: signatureMetadata
        };

        if (memberVote === 'Voto em Separado' && votoEmSeparadoFile) {
            try {
                const formData = new FormData();
                formData.append('file', votoEmSeparadoFile, votoEmSeparadoFile.name);
                formData.append('slug', camaraId);
                formData.append('userId', currentUser.id || 'anonymous');
                formData.append('ref', `voto_${votingMateria.id}_${currentUser.id}`);
                const uploadResponse = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                voteData.parecerUrl = uploadResponse.data.url;
            } catch (uploadError) {
                console.warn('[Upload] Falha no upload:', uploadError);
            }
        }

        try {
            const updatedVotos = { ...votingMateria.votosComissao, [currentUser.id]: voteData };
            await api.patch(`/legislative-matters/id/${votingMateria.id}`, { votosComissao: updatedVotos });
            alert('Voto computado com sucesso!');
            this.setState({ showVotingModal: false, votingMateria: null, memberVote: 'Favorável', votoEmSeparadoFile: null });
            this.fetchMeetingDetails(); // Refresh meeting details including matters
        } catch (error) {
            console.error("Erro ao computar voto:", error);
            alert('Erro ao computar voto.');
        }
    };

    handleFinalizeVoting = async (materiaId, resultado) => {
        try {
            await api.patch(`/legislative-matters/id/${materiaId}`, {
                status: resultado === 'Aprovado' ? 'Aprovado na Comissão' : 'Rejeitado na Comissão',
                dataVotacaoComissao: new Date().toISOString()
            });
            alert(`Matéria ${resultado === 'Aprovado' ? 'Aprovada' : 'Rejeitada'} na comissão com sucesso!`);
            this.fetchMaterias();
        } catch (error) {
            console.error("Erro ao finalizar votação:", error);
        }
    };

    getCurrentCamaraId = () => {
        const urlCamaraId = this.props.match?.params?.camaraId;
        if (urlCamaraId && urlCamaraId !== 'undefined') return urlCamaraId;

        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        return user.camaraId || '';
    }

    fetchConfigsAndLogo = async () => {
        const camaraId = this.getCurrentCamaraId();
        if (!camaraId || camaraId === 'undefined' || camaraId === 'null') return;

        try {
            const response = await api.get(`/councils/${camaraId}`);
            const councilData = Array.isArray(response.data) ? response.data[0] : (response.data || {});
            const configData = councilData.config || councilData.dadosConfig || {};

            this.setState({
                councilName: councilData.name || '',
                homeConfig: configData.home || {},
            });
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error("Erro ao carregar configurações da câmara:", error);
            }
        }
    };

    fetchMeetingDetails = async () => {
        const { comissaoId, reuniaoId } = this.state;

        if (!comissaoId || comissaoId === 'undefined' || comissaoId === 'null' || !reuniaoId || reuniaoId === 'undefined' || reuniaoId === 'null') {
            this.setState({ loading: false, error: "Parâmetros da reunião incompletos." });
            return;
        }

        try {
            // Buscamos os detalhes da comissão e os dados dos usuários simultaneamente
            const [commissionResponse, usersResponse] = await Promise.all([
                api.get(`/commission-detail/${comissaoId}`),
                api.get(`/users/council/${this.state.camaraId}`)
            ]);

            const data = Array.isArray(commissionResponse.data) ? commissionResponse.data[0] : commissionResponse.data;
            const usersData = usersResponse.data || [];
            const usersMap = new Map(usersData.map(user => [user.id || user.uid, user]));

            if (data) {
                const rawReunioes = data.reunioes || data.meetings || [];
                const reunioesList = Array.isArray(rawReunioes) ? rawReunioes : Object.values(rawReunioes);
                
                // Localizar a reunião específica antes de processar pautas ou membros
                const reuniaoIdToFind = reuniaoId;
                const reuniaoData = reunioesList.find(r => (r.id || r._id) == reuniaoIdToFind);

                const { currentUser } = this.state;
                let userRole = 'Visitante';
                let normalizedMembros = [];
                
                if (data.membros) {
                    normalizedMembros = (Array.isArray(data.membros) ? data.membros : Object.values(data.membros))
                        .map(m => {
                            const memberId = m.id || m._id;
                            const userProfile = usersMap.get(memberId);
                            return {
                                ...m,
                                id: memberId,
                                nome: userProfile?.name || m.name || m.nome || 'Parlamentar',
                                foto: userProfile?.foto || userProfile?.avatar || userProfile?.photoURL || m.foto || m.avatar || m.photoURL || 'https://via.placeholder.com/150'
                            };
                        });
                    
                    if (currentUser) {
                        const membro = normalizedMembros.find(m => m.id === currentUser.id);
                        if (membro) userRole = membro.cargo;
                    }
                }

                // Fetch full details for pautadas matters
                let pautadasMateriasDetails = [];
                if (reuniaoData && reuniaoData.materiasPautadas && reuniaoData.materiasPautadas.length > 0) {
                    const pautadasIds = reuniaoData.materiasPautadas.map(m => m.id);
                    const allMateriasResponse = await api.get(`/legislative-matters/${this.state.camaraId}`);
                    const allMaterias = allMateriasResponse.data || [];
                    pautadasMateriasDetails = allMaterias.filter(m => pautadasIds.includes(m.id)).map(m => {
                        if (m.relatorId && normalizedMembros.length > 0) {
                            const member = normalizedMembros.find(mem => mem.id === m.relatorId);
                            if (member && member.nome) {
                                return {
                                    ...m,
                                    relatorNome: member.nome,
                                    status: (m.status || '').startsWith('Em Análise pelo Relator') ? `Em Análise pelo Relator (${member.nome})` : m.status
                                };
                            }
                        }
                        return m;
                    });
                }


                if (reuniaoData) {
                    const tipo = (reuniaoData.tipo || reuniaoData.type || '').toLowerCase();
                    const url = reuniaoData.url || reuniaoData.link || reuniaoData.meetingUrl;

                    if (tipo === 'virtual') {
                        // Fallback: se a URL não estiver no banco, reconstrói o padrão do Jitsi
                        const finalUrl = url || `https://meet.jit.si/camara-ai-${this.state.camaraId}-${comissaoId}-${reuniaoId}`;
                        
                        this.setState({
                            reuniao: { ...reuniaoData, tipo: 'Virtual', url: finalUrl },
                            jitsiUrl: finalUrl,
                            comissao: { ...data, membros: normalizedMembros },
                            materias: pautadasMateriasDetails, // Set the pautadas matters here
                            userRole,
                            loading: false,
                        });
                    } else {
                        this.setState({ 
                            loading: false, 
                            error: "Esta não é uma reunião virtual ou o link (URL) ainda não foi configurado." 
                        });
                    }
                } else {
                    this.setState({ loading: false, error: "Reunião não encontrada nos registros desta comissão." });
                }
            } else {
                this.setState({ loading: false, error: "Dados da comissão não encontrados." });
            }
        } catch (error) {
            const status = error.response?.status;
            console.error(`[Error] Erro ao buscar detalhes da reunião (${status}):`, error);
            this.setState({ 
                loading: false, 
                error: status === 404 ? "Comissão ou reunião não encontrada (404)." : "Erro ao carregar detalhes da reunião." 
            });
        }
    };

    render() {
        const { jitsiUrl, reuniao, loading, error, materias, userRole, currentUser, showVotingModal, votingMateria, memberVote, votoEmSeparadoFile } = this.state;

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

        const dateObj = new Date(reuniao?.data);
        const formattedDate = !isNaN(dateObj.getTime()) 
            ? dateObj.toLocaleDateString('pt-BR') 
            : (reuniao?.data || 'Data pendente');

        const isPresidente = userRole === 'Presidente';
        const isMembro = ['Presidente', 'Membro', 'Relator', 'Presidente da Comissão', 'Vice-Presidente'].includes(userRole);

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5', overflow: 'hidden' }}>
                <MenuDashboard />
                <div className="dashboard-content" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <button onClick={() => this.props.history.goBack()} className="btn-back">
                            <FaArrowLeft /> Voltar
                        </button>
                        <h1 className="dashboard-header-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                            <FaVideo /> {reuniao?.tipo || 'Reunião'} - {formattedDate}
                        </h1>
                        <div style={{ padding: '4px 12px', background: '#e0e0e0', borderRadius: '20px', fontSize: '0.8rem' }}>
                            Perfil: <strong>{userRole}</strong>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
                        {/* Coluna da Esquerda: Jitsi */}
                        <div className="dashboard-card" style={{ flex: 2, padding: '10px', display: 'flex', flexDirection: 'column' }}>
                            {jitsiUrl ? (
                                <iframe
                                    src={jitsiUrl + "#config.startWithVideoMuted=false&config.startWithAudioMuted=false"}
                                    allow="camera; microphone; display-capture"
                                    style={{ width: '100%', flex: 1, border: 0, borderRadius: '8px' }}
                                    title="Jitsi Meeting"
                                ></iframe>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee' }}>
                                    Link da reunião Jitsi não disponível.
                                </div>
                            )}
                        </div>

                        {/* Coluna da Direita: Painel Legislativo / Votação */}
                        <div className="dashboard-card" style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                Painel Legislativo
                            </h2>
                            
                            {materias.length === 0 ? (
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Nenhuma matéria em pauta encontrada.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {materias.map(materia => {
                                        const jaVotou = materia.votosComissao && currentUser && materia.votosComissao[currentUser.id];
                                        const estaEmVotacao = (materia.status || '').toLowerCase().includes('parecer') || (materia.status || '').toLowerCase().includes('relator');
                                        
                                        return (
                                            <div key={materia.id} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>{materia.titulo}</h4>
                                                <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#666' }}>Status: {materia.status}</p>
                                                
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {isMembro && estaEmVotacao && !jaVotou && (
                                                        <button 
                                                            className="btn-primary" 
                                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                            onClick={() => this.handleOpenVoting(materia)}
                                                        >
                                                            <FaCheck /> Votar
                                                        </button>
                                                    )}
                                                    
                                                    {jaVotou && (
                                                        <span style={{ fontSize: '0.8rem', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaCheck /> Voto: {jaVotou.voto}
                                                        </span>
                                                    )}

                                                    {isPresidente && estaEmVotacao && (
                                                        <div style={{ display: 'flex', gap: '5px', width: '100%', marginTop: '5px' }}>
                                                            <button 
                                                                className="btn-secondary" 
                                                                style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#2e7d32', color: '#2e7d32' }}
                                                                onClick={() => this.handleFinalizeVoting(materia.id, 'Aprovado')}
                                                            >
                                                                Aprovar
                                                            </button>
                                                            <button 
                                                                className="btn-secondary" 
                                                                style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#c62828', color: '#c62828' }}
                                                                onClick={() => this.handleFinalizeVoting(materia.id, 'Rejeitado')}
                                                            >
                                                                Rejeitar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal de Votação */}
                {showVotingModal && votingMateria && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '400px' }}>
                            <h3 className="modal-header">Votar Parecer</h3>
                            <p style={{ marginBottom: '15px' }}>Matéria: {votingMateria.titulo}</p>
                            <label className="label-form">Seu Voto:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', marginBottom: '20px' }}>
                                <button
                                    className="btn-secondary"
                                    style={{
                                        backgroundColor: memberVote === 'Favorável' ? '#e8f5e9' : '#fff',
                                        color: memberVote === 'Favorável' ? '#2e7d32' : '#666',
                                        borderColor: memberVote === 'Favorável' ? '#2e7d32' : '#ccc'
                                    }}
                                    onClick={() => this.setState({ memberVote: 'Favorável' })}
                                >
                                    <FaCheck /> Favorável
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{
                                        backgroundColor: memberVote === 'Contrário' ? '#ffebee' : '#fff',
                                        color: memberVote === 'Contrário' ? '#c62828' : '#666',
                                        borderColor: memberVote === 'Contrário' ? '#c62828' : '#ccc'
                                    }}
                                    onClick={() => this.setState({ memberVote: 'Contrário' })}
                                >
                                    <FaTimes /> Contrário
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{
                                        backgroundColor: memberVote === 'Abstenção' ? '#f5f5f5' : '#fff',
                                        color: memberVote === 'Abstenção' ? '#333' : '#666',
                                        borderColor: memberVote === 'Abstenção' ? '#333' : '#ccc'
                                    }}
                                    onClick={() => this.setState({ memberVote: 'Abstenção' })}
                                >
                                    Abster-se
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{
                                        backgroundColor: memberVote === 'Voto em Separado' ? '#e3f2fd' : '#fff',
                                        color: memberVote === 'Voto em Separado' ? '#1565c0' : '#666',
                                        borderColor: memberVote === 'Voto em Separado' ? '#1565c0' : '#ccc'
                                    }}
                                    onClick={() => this.setState({ memberVote: 'Voto em Separado' })}
                                >
                                    <FaFileAlt /> Voto em Separado
                                </button>
                            </div>

                            {memberVote === 'Voto em Separado' && (
                                <div style={{ marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
                                    <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Anexar Parecer Próprio (PDF)</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="modal-input"
                                        onChange={this.handleVotoFileChange}
                                    />
                                    {votoEmSeparadoFile && (
                                        <p style={{ fontSize: '0.8rem', color: '#126B5E', marginTop: '5px' }}>
                                            Arquivo selecionado: {votoEmSeparadoFile.name}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => this.setState({ showVotingModal: false })}>Cancelar</button>
                                <button className="btn-primary" onClick={this.handleCastVote}>Confirmar Voto</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default VirtualMeetingPage;
