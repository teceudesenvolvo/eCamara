import React, { Component } from 'react';
import { FaCalendarAlt, FaPlus, FaList, FaCheckCircle, FaPrint, FaSearch, FaTrash, FaFileAlt, FaMagic, FaVideo, FaLink, FaPencilAlt } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { sendMessageToAIPrivate } from '../../aiService';
import { db } from '../../firebaseConfig';
import { ref, onValue, push, update, get } from 'firebase/database';
import { auth } from '../../firebaseConfig';

pdfMake.vfs = pdfFonts.vfs;

class PautasSessao extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessoes: [],
            showModal: false,
            selectedSessao: null,
            novaData: '',
            novoTipo: 'Sessão Ordinária',
            novaTransmissaoUrl: '',
            materiasDisponiveis: [],
            selectedMateriaToAdd: '',
            isGeneratingEdital: false,
            editalText: '',
            isFinalizing: false,
            selectedMonth: '',
            roteiroPdfUrl: null, // Novo estado para armazenar a URL do PDF gerado
            isEditingUrl: false,
            editedTransmissaoUrl: '',
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userIndexRef = ref(db, `users_index/${user.uid}`);
                const snapshot = await get(userIndexRef);
                const camaraId = snapshot.exists() ? snapshot.val().camaraId : this.props.match.params.camaraId;
                this.setState({ camaraId }, () => {
                    this.fetchSessoes();
                    this.fetchMateriasDisponiveis();
                });
            }
        });
    }

    fetchSessoes = () => {
        const { camaraId } = this.state;
        const sessoesRef = ref(db, `${this.props.match.params.camaraId}/sessoes`);
        onValue(sessoesRef, (snapshot) => {
            const sessoes = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    sessoes.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
            }
            this.setState({ sessoes });
        });
    };

    fetchMateriasDisponiveis = async () => {
        const { camaraId } = this.state;
        const materiasRef = ref(db, `${this.props.match.params.camaraId}/materias`);
        try {
            const snapshot = await get(materiasRef);
            const materiasDisponiveis = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const materia = childSnapshot.val();
                    // Condição para matéria estar apta para pauta (ex: status favorável ou aguardando plenário)
                    if (materia.status === 'Enviado para Plenário') {
                        materiasDisponiveis.push({ id: childSnapshot.key, ...materia });
                    }
                });
            }
            this.setState({ materiasDisponiveis });
        } catch (error) {
            console.error("Erro ao buscar matérias disponíveis:", error);
        }
    };

    handleOpenModal = () => {
        this.setState({ showModal: true, selectedSessao: null, novaData: '', novoTipo: 'Sessão Ordinária', novaTransmissaoUrl: '' });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, selectedSessao: null });
    };

    handleCreateSessao = async () => {
        const { novaData, novoTipo, sessoes, novaTransmissaoUrl, camaraId } = this.state;
        if (!novaData) {
            alert("Por favor, selecione uma data.");
            return;
        }
        const year = new Date(novaData).getFullYear();
        const sessoesDoAno = sessoes.filter(s => s.data.endsWith(`/${year}`)).length;

        const newSessao = {
            data: novaData.split('-').reverse().join('/'), // Formata para DD/MM/AAAA
            tipo: novoTipo,
            numero: `${sessoesDoAno + 1}/${year}`,
            transmissaoUrl: novaTransmissaoUrl || '',
            status: 'Em Elaboração',
            itens: [],
            edital: '',
            createdAt: Date.now()
        };
        try {
            const sessoesRef = ref(db, `${this.props.match.params.camaraId}/sessoes`);
            await push(sessoesRef, newSessao);
            this.setState({ showModal: false }); // O listener onValue atualizará a lista
        } catch (error) {
            console.error("Erro ao criar sessão:", error);
            alert("Erro ao criar sessão.");
        }
    };

    handleSelectSessao = (sessao) => {
        this.setState({ 
            selectedSessao: sessao, 
            editalText: sessao.edital || '', 
            roteiroPdfUrl: null, // Reseta o PDF ao selecionar nova sessão
            isEditingUrl: false, // Reseta o modo de edição da URL
            editedTransmissaoUrl: sessao.transmissaoUrl || '', // Define a URL atual para edição
        });
    };

    handleAddItem = async () => {
        const { selectedSessao, selectedMateriaToAdd, materiasDisponiveis, camaraId } = this.state;
        if (!selectedMateriaToAdd || !selectedSessao) return;

        const materia = materiasDisponiveis.find(m => m.id.toString() === selectedMateriaToAdd);
        if (materia) {
            // Verifica se a matéria já está nesta pauta
            const currentItens = selectedSessao.itens || [];
            if (currentItens.some(item => item.id === materia.id)) {
                alert("Esta matéria já foi adicionada a esta sessão.");
                return;
            }

            const updatedItens = [...currentItens, materia];
            
            const sessaoRef = ref(db, `${this.props.match.params.camaraId}/sessoes/${selectedSessao.id}`);
            const materiaRef = ref(db, `${this.props.match.params.camaraId}/materias/${materia.id}`);

            try {
                // Atualiza a sessão com a nova lista de itens
                await update(sessaoRef, { itens: updatedItens });
                // Atualiza o status da matéria para "Em Pauta"
                await update(materiaRef, { status: 'Em Pauta' });

                // O listener onValue atualizará o estado, mas podemos atualizar localmente para feedback imediato
                this.setState(prevState => ({
                    selectedMateriaToAdd: '' // Limpa a seleção
                }));
            } catch (error) {
                console.error("Erro ao adicionar item:", error);
                alert("Erro ao adicionar item à sessão.");
            }
        }
    };

    handleRemoveItem = async (itemId) => {
        const { selectedSessao, camaraId } = this.state;
        // Encontra o item a ser removido para ter referência dele
        const itemToRemove = (selectedSessao.itens || []).find(i => i.id === itemId);
        const updatedItens = (selectedSessao.itens || []).filter(i => i.id !== itemId); // Remove da lista local

        const sessaoRef = ref(db, `${this.props.match.params.camaraId}/sessoes/${selectedSessao.id}`);
        const materiaRef = ref(db, `${this.props.match.params.camaraId}/materias/${itemId}`);

        try {
            await update(sessaoRef, { itens: updatedItens });
            // Restaura o status da matéria para que ela possa ser adicionada novamente se necessário
            if (itemToRemove) {
                await update(materiaRef, { status: 'Enviado para Plenário' });
            }
        } catch (error) {
            console.error("Erro ao remover item:", error);
            alert("Erro ao remover item da sessão.");
        }
    };

    handleFinalizeSessao = async () => {
        const { selectedSessao } = this.state;
        if (!selectedSessao) return;
    
        this.setState({ isFinalizing: true });
    
        const itensTexto = (selectedSessao.itens || []).map((item, index) => `${index + 1}. ${item.titulo} (${item.autor})`).join('\n');
    
        const REGIMENTO_INTERNO_ROTEIRO = `
        1. Abertura: Verificação de quórum e invocação da proteção de Deus pelo Presidente.
        2. Expediente: Leitura da ata da sessão anterior para aprovação, seguida da leitura de correspondências e ofícios recebidos.
        3. Pequeno Expediente: Espaço de 5 minutos para cada Vereador inscrito falar sobre temas de livre escolha.
        4. Ordem do Dia: Votação das matérias incluídas na pauta. Para cada matéria, o rito é:
            a. Anúncio da matéria.
            b. Leitura do parecer da comissão competente.
            c. Discussão (fala dos Vereadores inscritos).
            d. Encaminhamento de votação (orientação dos líderes de bancada).
            e. Processo de votação (nominal ou simbólica).
            f. Proclamação do resultado pelo Presidente.
        5. Grande Expediente: Espaço de 15 minutos para cada Vereador inscrito discursar sobre temas previamente definidos.
        6. Encerramento: Considerações finais e encerramento da sessão pelo Presidente.
        `;
    
        const prompt = `Atue como Secretário Legislativo da Câmara Municipal. Sua tarefa é gerar o roteiro completo e formal para a ${selectedSessao.tipo} nº ${selectedSessao.numero}, a ser realizada em ${selectedSessao.data}.
    
        Use o seguinte Regimento Interno para estruturar o roteiro da sessão:
        --- REGIMENTO INTERNO (ROTEIRO DA SESSÃO) ---
        ${REGIMENTO_INTERNO_ROTEIRO}
        --- FIM DO REGIMENTO ---
    
        As matérias a serem votadas na Ordem do Dia são:
        ${itensTexto || "Nenhuma matéria cadastrada na ordem do dia."}
    
        Com base no regimento e na lista de matérias, gere o documento "Roteiro da Sessão" completo, detalhando cada fase e incluindo os nomes das matérias nos locais apropriados da Ordem do Dia. O texto deve ser formal e pronto para ser lido pelo Presidente da Câmara. Não use markdown.`;
    
        try {
            const roteiroText = await sendMessageToAIPrivate(prompt);
            this.generateRoteiroPDF(selectedSessao, roteiroText, true); // Passa true para armazenar em vez de abrir
        } catch (error) {
            console.error("Erro na IA:", error);
            alert("Erro ao gerar roteiro com IA.");
        } finally {
            this.setState({ isFinalizing: false });
        }
    };

    generateRoteiroPDF = (sessao, roteiroText, storeUrl = false) => {
        const dataAtual = new Date().toLocaleDateString('pt-BR');
    
        const docDefinition = {
            content: [
                { text: 'Câmara Municipal de Teste', style: 'header', alignment: 'center' },
                { text: `ROTEIRO DA ${sessao.tipo.toUpperCase()} Nº ${sessao.numero}`, style: 'title', alignment: 'center' },
                { text: `Data: ${sessao.data}`, style: 'subheader', alignment: 'center', marginBottom: 30 },
                { text: 'ROTEIRO DA SESSÃO', style: 'sectionHeader' },
                { text: roteiroText, style: 'bodyText' },
                { text: `\n\nCâmara Municipal, ${dataAtual}.`, style: 'bodyText', alignment: 'right' },
            ],
            styles: { header: { fontSize: 16, bold: true }, subheader: { fontSize: 12, color: '#555' }, title: { fontSize: 14, bold: true, marginTop: 20, marginBottom: 5 }, sectionHeader: { fontSize: 12, bold: true, marginTop: 15, marginBottom: 10, color: '#126B5E' }, bodyText: { fontSize: 11, alignment: 'justify', lineHeight: 1.5 } }
        };
    
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);

        if (storeUrl) {
            pdfDocGenerator.getDataUrl((dataUrl) => {
                this.setState({ roteiroPdfUrl: dataUrl });
            });
        } else {
            pdfDocGenerator.open();
        }
    };

    handleGenerateEditalWithAI = async () => {
        const { selectedSessao } = this.state;
        if (!selectedSessao) return;

        this.setState({ isGeneratingEdital: true, editalText: '' });

        const itensTexto = (selectedSessao.itens || []).map((item, index) => `${index + 1}. ${item.titulo} (${item.autor})`).join('\n');

        const prompt = `Atue como Presidente da Câmara Municipal. Redija um Edital de Convocação formal para a ${selectedSessao.tipo} nº ${selectedSessao.numero}, a ser realizada no dia ${selectedSessao.data}.
        
        A Ordem do Dia será:
        ${itensTexto || "Nenhuma matéria cadastrada na ordem do dia."}

        O texto deve seguir a estrutura padrão de editais legislativos, convocando os Senhores Vereadores, mencionando o horário regimental (ou definir 19h) e o local (Plenário da Câmara). Finalize com a data e assinatura. Não use markdown.`;

        try {
            const response = await sendMessageToAIPrivate(prompt);
            this.setState({ editalText: response, isGeneratingEdital: false });
        } catch (error) {
            console.error("Erro na IA:", error);
            this.setState({ editalText: "Erro ao gerar edital.", isGeneratingEdital: false });
        }
    };

    handleUrlInputChange = (e) => {
        this.setState({ editedTransmissaoUrl: e.target.value });
    };

    handleSaveUrl = async () => {
        const { selectedSessao, editedTransmissaoUrl, camaraId } = this.state;
        if (!selectedSessao) return;

        const sessaoRef = ref(db, `${this.props.match.params.camaraId}/sessoes/${selectedSessao.id}`);
        try {
            await update(sessaoRef, { transmissaoUrl: editedTransmissaoUrl });
            this.setState({ isEditingUrl: false });
            // O listener onValue cuidará da atualização da UI.
            alert('URL da transmissão atualizada com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar URL:", error);
            alert("Erro ao atualizar a URL da transmissão.");
        }
    };

    render() {
        const { sessoes, showModal, selectedSessao, novaData, novoTipo, novaTransmissaoUrl, materiasDisponiveis, selectedMateriaToAdd, editalText, isGeneratingEdital, isFinalizing, selectedMonth, roteiroPdfUrl, isEditingUrl, editedTransmissaoUrl } = this.state;

        // Ordenar sessoes por data (mais recente primeiro)
        const sortedSessoes = [...sessoes].sort((a, b) => {
            const [dayA, monthA, yearA] = a.data.split('/');
            const [dayB, monthB, yearB] = b.data.split('/');
            return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
        });

        // Agrupar por mês
        const groupedSessoes = [];
        sortedSessoes.forEach(sessao => {
            const [day, month, year] = sessao.data.split('/');
            const date = new Date(year, month - 1, day);
            const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

            let group = groupedSessoes.find(g => g.month === key);
            if (!group) {
                group = { month: key, sessoes: [] };
                groupedSessoes.push(group);
            }
            group.sessoes.push(sessao);
        });

        const availableMonths = groupedSessoes.map(g => g.month);
        const currentMonth = selectedMonth && availableMonths.includes(selectedMonth) ? selectedMonth : (availableMonths.length > 0 ? availableMonths[0] : '');
        const displayedGroups = groupedSessoes.filter(g => g.month === currentMonth);

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    
                    {/* Coluna Esquerda: Lista de Sessões */}
                    <div style={{ flex: 1, maxWidth: '400px' }}>
                        <div className="dashboard-header" style={{ marginBottom: '20px' }}>
                            <div>
                                <h1 className="dashboard-header-title">
                                    <FaCalendarAlt className="icon-primary" /> Sessões
                                </h1>
                                <p className="dashboard-header-desc">Gestão das sessões plenárias.</p>
                            </div>
                            <button className="btn-primary" onClick={this.handleOpenModal} style={{ width: 'auto', padding: '8px 15px' }}>
                                <FaPlus /> Nova
                            </button>
                        </div>

                        {availableMonths.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <select 
                                    className="modal-input" 
                                    style={{ padding: '10px', fontSize: '0.95rem', backgroundColor: '#fff', cursor: 'pointer' }}
                                    value={currentMonth}
                                    onChange={(e) => this.setState({ selectedMonth: e.target.value })}
                                >
                                    {availableMonths.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: '5px' }}>
                            {displayedGroups.map(group => (
                                <div key={group.month}>
                                    <h4 style={{ color: '#126B5E', margin: '15px 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{group.month}</h4>
                                    {group.sessoes.map(sessao => (
                                        <div 
                                            key={sessao.id} 
                                            className="list-item dashboard-card-hover" 
                                            style={{ 
                                                cursor: 'pointer', 
                                                borderLeft: `4px solid ${selectedSessao && selectedSessao.id === sessao.id ? '#FF740F' : '#126B5E'}`,
                                                marginBottom: '10px'
                                            }}
                                            onClick={() => this.handleSelectSessao(sessao)}
                                        >
                                            <div className="list-item-content">
                                                <div className="list-item-header">
                                                    <span className="tag tag-primary">{sessao.numero}</span>
                                                    <span className={`tag ${sessao.status === 'Publicada' ? 'tag-success' : 'tag-warning'}`} style={{fontSize: '0.7rem'}}>{sessao.status}</span>
                                                </div>
                                                <h3 className="list-item-title" style={{fontSize: '1rem', fontWeight: '600', marginBottom: '5px'}}>{sessao.tipo}</h3>
                                                <div className="list-item-meta">
                                                    <FaCalendarAlt size={12} style={{color: 'var(--primary-color)'}} /> <span style={{fontSize: '0.85rem', color: '#666'}}>{sessao.data}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {sessoes.length === 0 && <p style={{color: '#666', textAlign: 'center', marginTop: '20px'}}>Nenhuma sessão cadastrada.</p>}
                        </div>
                    </div>

                    {/* Coluna Direita: Detalhes e Itens */}
                    <div style={{ flex: 1.5 }}>
                        {selectedSessao ? (
                            <div className="dashboard-card">
                                <div className="modal-header" style={{ justifyContent: 'space-between' }}>
                                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FaList className="icon-primary" /> Detalhes da Sessão {selectedSessao.numero}
                                    </h2>
                                    <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                                        <FaPrint style={{color: '#126b5e'}} /> Imprimir
                                    </button>
                                </div>

                                <div style={{ marginBottom: '25px', display: 'flex', gap: '30px', flexWrap: 'wrap', background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                                    <div>
                                        <label style={{display: 'block', fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase'}}>Data</label>
                                        <span style={{fontWeight: '600', fontSize: '0.9rem'}}>{selectedSessao.data}</span>
                                    </div>
                                    <div>
                                        <label style={{display: 'block', fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase'}}>Tipo</label>
                                        <span style={{fontWeight: '600', fontSize: '0.9rem'}}>{selectedSessao.tipo}</span>
                                    </div>
                                    <div>
                                        <label style={{display: 'block', fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase'}}>Status</label>
                                        <span style={{fontWeight: '600', fontSize: '0.9rem'}}>{selectedSessao.status}</span>
                                    </div>
                                    <div style={{ width: '100%', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                        <label style={{display: 'block', fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase'}}>Link da Transmissão</label>
                                        {isEditingUrl ? (
                                            <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px'}}>
                                                <input 
                                                    type="text" 
                                                    className="modal-input" 
                                                    value={editedTransmissaoUrl} 
                                                    onChange={this.handleUrlInputChange}
                                                    placeholder="https://youtube.com/..."
                                                />
                                                <button className="btn-primary" onClick={this.handleSaveUrl} style={{padding: '8px 12px', fontSize: '0.8rem'}}>Salvar</button>
                                                <button className="btn-secondary" onClick={() => this.setState({ isEditingUrl: false })} style={{padding: '8px 12px', fontSize: '0.8rem'}}>Cancelar</button>
                                            </div>
                                        ) : (
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px'}}>
                                                {selectedSessao.transmissaoUrl ? (
                                                    <a href={selectedSessao.transmissaoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontWeight: '500' }}>
                                                        <FaVideo size={14} /> {selectedSessao.transmissaoUrl}
                                                    </a>
                                                ) : (
                                                    <p style={{margin: 0, color: '#999', fontStyle: 'italic', fontSize: '0.9rem'}}>Nenhum link cadastrado.</p>
                                                )}
                                                <button className="btn-secondary" onClick={() => this.setState({ isEditingUrl: true, editedTransmissaoUrl: selectedSessao.transmissaoUrl || '' })} style={{padding: '5px 10px', fontSize: '0.8rem'}}>
                                                    <FaPencilAlt size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <h4 style={{ marginTop: 0, color: '#555', fontSize: '0.9rem', fontWeight: '600',}}>Adicionar Matéria à Ordem do Dia</h4>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select 
                                            className="modal-input" 
                                            value={selectedMateriaToAdd}
                                            onChange={(e) => this.setState({ selectedMateriaToAdd: e.target.value })}
                                        >
                                            <option value="">Selecione uma matéria apta...</option>
                                            {materiasDisponiveis.map(m => (
                                                <option key={m.id} value={m.id}>{m.titulo}</option>
                                            ))}
                                        </select>
                                        <button className="btn-primary" onClick={this.handleAddItem} style={{ width: 'auto' }}>
                                            <FaPlus /> Adicionar
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '0.9rem', marginTop: '20px'}}>Ordem do Dia</h4>
                                    {selectedSessao.itens && selectedSessao.itens.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {(selectedSessao.itens || []).map((item, index) => (
                                                <li key={item.id} style={{ background: 'white', border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#126B5E' }}>{index + 1}º</span>
                                                        <div>
                                                            <div style={{ textAlign: 'left', fontWeight: 'bold', color: '#333', fontSize: '0.9rem'}}>{item.titulo}</div>
                                                            <div style={{  textAlign: 'left', fontSize: '0.85rem', color: '#666' }}>{item.autor}</div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => this.handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer' }}>
                                                        <FaTrash />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Nenhum item adicionado à ordem do dia ainda.</p>
                                    )}
                                </div>

                                {/* Seção de Edital com IA */}
                                <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h4 style={{ margin: 0, color: '#126B5E', fontSize: '0.9rem', fontWeight: '600'}}>Edital de Convocação</h4>
                                        <button 
                                            onClick={this.handleGenerateEditalWithAI}
                                            disabled={isGeneratingEdital}
                                            className="btn-secondary"
                                            style={{ padding: '8px 15px', color: '#126B5E', borderColor: '#126B5E', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <FaMagic className="icon-primary" /> {isGeneratingEdital ? 'Gerando...' : 'Gerar Edital com IA'}
                                        </button>
                                    </div>
                                    <textarea 
                                        rows="12" 
                                        className="modal-textarea"
                                        style={{ color: '#000', backgroundColor: isGeneratingEdital ? '#f5f5f5' : '#fff' }}
                                        placeholder={isGeneratingEdital ? "Aguarde, a IA está redigindo o edital..." : "O texto do edital aparecerá aqui..."}
                                        value={editalText}
                                        onChange={(e) => this.setState({ editalText: e.target.value })}
                                        readOnly={isGeneratingEdital}
                                    ></textarea>
                                </div>

                                <div className="modal-footer" style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px' }}>
                                    <button 
                                        onClick={this.handleFinalizeSessao}
                                        disabled={isFinalizing}
                                        className="btn-primary"
                                    >
                                        <FaCheckCircle /> {isFinalizing ? 'Gerando Roteiro...' : 'Finalizar e Gerar Roteiro'}
                                    </button>
                                    {roteiroPdfUrl &&
                                        <button onClick={() => window.open(this.state.roteiroPdfUrl)} className="btn-success" style={{ marginLeft: '10px' }}>
                                            Visualizar Roteiro Gerado
                                        </button>}
                                </div>
                            </div>
                        ) : (
                            <div className="dashboard-card" style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                                <FaList size={50} style={{ marginBottom: '20px', color: '#ddd' }} />
                                <h3>Selecione uma sessão para gerenciar</h3>
                            </div>
                        )}
                    </div>

                    {/* Modal Create */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ width: '400px' }}>
                                <h2 className="modal-header">Nova Sessão</h2>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Data da Sessão</label>
                                    <input type="date" className="modal-input" value={novaData} onChange={(e) => this.setState({ novaData: e.target.value })} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Tipo de Sessão</label>
                                    <select className="modal-input" value={novoTipo} onChange={(e) => this.setState({ novoTipo: e.target.value })}>
                                        <option>Sessão Ordinária</option>
                                        <option>Sessão Extraordinária</option>
                                        <option>Sessão Solene</option>
                                        <option>Audiência Pública</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>URL da Transmissão (YouTube/Facebook)</label>
                                    <div style={{position: 'relative'}}>
                                        <FaLink style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa'}} />
                                        <input 
                                            type="text" 
                                            className="modal-input" 
                                            style={{paddingLeft: '35px'}}
                                            placeholder="https://www.youtube.com/watch?v=..." 
                                            value={novaTransmissaoUrl} 
                                            onChange={(e) => this.setState({ novaTransmissaoUrl: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={this.handleCloseModal}>Cancelar</button>
                                    <button className="btn-primary" onClick={this.handleCreateSessao}>Criar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default PautasSessao;