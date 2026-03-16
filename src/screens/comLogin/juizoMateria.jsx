import React, { Component } from 'react';
import { FaGavel, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaPenFancy, FaMagic, FaFileAlt, FaEye, FaSpinner } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../assets/logo.png';
import { sendMessageToAIPrivate } from '../../aiService';
import { db, auth } from '../../firebaseConfig'; // Importação centralizada
import { ref, update, get } from 'firebase/database';

pdfMake.vfs = pdfFonts.vfs;

class JuizoMateria extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: '',
            filterStatus: 'Todos',
            filterType: 'Todos',
            selectedMateria: null,
            parecerText: '',
            logoBase64: null,
            isGeneratingParecer: false,
            materias: [],
            loading: true,
            camaraId: this.props.match.params.camaraId,
            viewingMateria: null,
            showDetailModal: false
        };
    }

    componentDidMount() {
        // 1. Verifica se os params existem para evitar erro de quebra
        const params = this.props.match ? this.props.match.params : {};
        const camaraIdFromUrl = params.camaraId;

        auth.onAuthStateChanged(async (authUser) => {
            try {
                if (authUser) {
                    console.log("Usuário logado:", authUser.uid);

                    // Busca o camaraId se não houver na URL
                    let idParaUso = camaraIdFromUrl;
                    if (!idParaUso) {
                        const userIndexRef = ref(db, `users_index/${authUser.uid}`);
                        const indexSnapshot = await get(userIndexRef);
                        if (indexSnapshot.exists()) {
                            idParaUso = indexSnapshot.val().camaraId;
                        }
                    }

                    if (idParaUso) {
                        this.setState({ camaraId: idParaUso });
                        await this.loadLogo();
                        await this.fetchMaterias(idParaUso);
                    }
                } else {
                    console.warn("Usuário não autenticado, redirecionando...");
                    if (this.props.history) this.props.history.push('/login');
                }
            } catch (error) {
                console.error("Erro no carregamento:", error);
            } finally {
                // ESSENCIAL: Garante que o loading saia da tela independente do resultado
                this.setState({ loading: false });
            }
        });
    }

    fetchMaterias = async (camaraId) => {
        try {
            const materiasRef = ref(db, `${this.props.match.params.camaraId}/materias`);
            const snapshot = await get(materiasRef);
            const materias = [];
            if (snapshot.exists()) {
                Object.entries(snapshot.val()).forEach(([key, val]) => {
                    materias.push({ id: key, ...val });
                });
            }
            // Ordenação por data (decrescente)
            materias.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.setState({ materias });
        } catch (error) {
            console.error("Erro ao buscar matérias:", error);
        }
    };

    loadLogo = async () => {
        try {
            const response = await fetch(logo);
            const blob = await response.blob();
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onload = () => {
                    this.setState({ logoBase64: reader.result });
                    resolve(reader.result);
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Erro ao carregar logo:", error);
        }
    };

    // ... (restante dos métodos handleOpenParecer, handleGenerateParecerWithAI permanecem iguais)

    handleSubmitParecer = async (decisao) => {
        const { selectedMateria, parecerText, camaraId } = this.state;
        if (!selectedMateria) return;

        try {
            const pdfBase64 = await this.generateParecerPDFBase64(selectedMateria, parecerText, decisao);
            const newStatus = decisao === 'favoravel' ? 'Parecer Favorável' : 'Parecer Contrário';

            const parecerData = {
                status: newStatus,
                parecer: parecerText || "Não foi fornecida fundamentação.",
                decisao: decisao,
                parecerDate: new Date().toISOString(),
                parecerPdfBase64: pdfBase64,
            };

            const materiaRef = ref(db, `${this.props.match.params.camaraId}/materias/${selectedMateria.id}`);
            await update(materiaRef, parecerData);

            // Atualiza o estado local para refletir a mudança sem precisar de novo fetch
            const updatedMaterias = this.state.materias.map(m =>
                m.id === selectedMateria.id ? { ...m, ...parecerData } : m
            );

            this.openParecerPDF(selectedMateria, parecerText, decisao);
            this.setState({ selectedMateria: null, materias: updatedMaterias });
        } catch (error) {
            console.error("Erro ao salvar parecer:", error);
            alert("Erro ao salvar. Verifique sua conexão.");
        }
    };

    render() {
        const { searchTerm, filterStatus, filterType, materias, selectedMateria, isGeneratingParecer, parecerText, loading, showDetailModal, viewingMateria } = this.state;

        if (loading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                </div>
            );
        }

        const filteredMaterias = materias.filter(m => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                (m.titulo?.toLowerCase().includes(searchLower)) ||
                (m.numero?.includes(searchTerm)) ||
                (m.autor?.toLowerCase().includes(searchLower));

            const matchesStatus = filterStatus === 'Todos' || m.status === filterStatus;
            const matchesType = filterType === 'Todos' || m.tipoMateria === filterType;

            return matchesSearch && matchesStatus && matchesType;
        });

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content">
                    {/* Renderização condicional do formulário de parecer ou da lista */}
                    {selectedMateria ? this.renderParecerForm() : this.renderListaMaterias(filteredMaterias)}
                </div>

                {/* Modal de Detalhes */}
                {showDetailModal && viewingMateria && (
                    <div className="modal-overlay">
                        <div style={{ overflowY: 'auto', paddingRight: '15px', textAlign: 'left' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                <p style={{ margin: 0 }}><strong>Tipo:</strong> {viewingMateria.tipoMateria}</p>
                                <p style={{ margin: 0 }}><strong>Número:</strong> {viewingMateria.numero}</p>
                                <p style={{ margin: 0 }}><strong>Autor:</strong> {viewingMateria.autor}</p>
                                <p style={{ margin: 0 }}><strong>Protocolo:</strong> {viewingMateria.protocolo}</p>
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Ementa</h4>
                                <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px', lineHeight: '1.5' }}>{viewingMateria.ementa}</p>

                                <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Texto da Proposição</h4>
                                <div
                                    className="materia-content-view"
                                    style={{ lineHeight: '1.6', color: '#333', fontSize: '1rem' }}
                                    dangerouslySetInnerHTML={{ __html: viewingMateria.textoMateria }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Dica: Separe o JSX em métodos menores para facilitar a leitura
    renderParecerForm() { /* ... move o JSX do form para cá ... */ }
    renderListaMaterias(filteredMaterias) { /* ... move o JSX da lista para cá ... */ }
}

export default JuizoMateria;