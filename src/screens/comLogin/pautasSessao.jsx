import React, { Component } from 'react';
import { FaCalendarAlt, FaPlus, FaList, FaCheckCircle, FaPrint, FaSearch, FaTrash, FaFileAlt, FaMagic } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuDashboard.jsx';

class PautasSessao extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pautas: [
                { id: 1, data: '10/03/2024', tipo: 'Sessão Ordinária', numero: '10/2024', status: 'Em Elaboração', itens: [
                    { id: 101, titulo: 'PL 12/2024 - Dispõe sobre câmeras em escolas', autor: 'Ver. Teste' },
                ], edital: '' },
                { id: 2, data: '03/03/2024', tipo: 'Sessão Ordinária', numero: '09/2024', status: 'Publicada', itens: [], edital: '' }
            ],
            showModal: false,
            selectedPauta: null,
            novaData: '',
            novoTipo: 'Sessão Ordinária',
            materiasDisponiveis: [
                { id: 201, titulo: 'REQ 100/2024 - Voto de Pesar', autor: 'Ver. Maria' },
                { id: 202, titulo: 'IND 45/2024 - Pavimentação Rua X', autor: 'Ver. João' },
                { id: 203, titulo: 'PL 05/2024 - Dia do Ciclista', autor: 'Ver. Pedro' }
            ],
            selectedMateriaToAdd: '',
            isGeneratingEdital: false,
            editalText: '',
            isFinalizing: false,
            selectedMonth: ''
        };
    }

    handleOpenModal = () => {
        this.setState({ showModal: true, selectedPauta: null, novaData: '', novoTipo: 'Sessão Ordinária' });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, selectedPauta: null });
    };

    handleCreatePauta = () => {
        const { novaData, novoTipo, pautas } = this.state;
        if (!novaData) {
            alert("Por favor, selecione uma data.");
            return;
        }
        const newPauta = {
            id: Date.now(),
            data: novaData.split('-').reverse().join('/'), // Formata para DD/MM/AAAA
            tipo: novoTipo,
            numero: `${pautas.length + 1}/2024`,
            status: 'Em Elaboração',
            itens: [],
            edital: ''
        };
        this.setState({ pautas: [newPauta, ...pautas], showModal: false });
    };

    handleSelectPauta = (pauta) => {
        this.setState({ selectedPauta: pauta, editalText: pauta.edital || '' });
    };

    handleAddItem = () => {
        const { selectedPauta, selectedMateriaToAdd, materiasDisponiveis, pautas } = this.state;
        if (!selectedMateriaToAdd) return;

        const materia = materiasDisponiveis.find(m => m.id.toString() === selectedMateriaToAdd);
        if (materia) {
            const updatedPauta = { ...selectedPauta, itens: [...selectedPauta.itens, materia] };
            const updatedPautas = pautas.map(p => p.id === updatedPauta.id ? updatedPauta : p);
            
            this.setState({ 
                pautas: updatedPautas, 
                selectedPauta: updatedPauta,
                selectedMateriaToAdd: '' 
            });
        }
    };

    handleRemoveItem = (itemId) => {
        const { selectedPauta, pautas } = this.state;
        const updatedPauta = { ...selectedPauta, itens: selectedPauta.itens.filter(i => i.id !== itemId) };
        const updatedPautas = pautas.map(p => p.id === updatedPauta.id ? updatedPauta : p);
        this.setState({ pautas: updatedPautas, selectedPauta: updatedPauta });
    };

    handleFinalizePauta = async () => {
        const { selectedPauta } = this.state;
        if (!selectedPauta) return;
    
        this.setState({ isFinalizing: true });
    
        const itensTexto = selectedPauta.itens.map((item, index) => `${index + 1}. ${item.titulo} (${item.autor})`).join('\n');
    
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
    
        const prompt = `Atue como Secretário Legislativo da Câmara Municipal. Sua tarefa é gerar o roteiro completo e formal para a ${selectedPauta.tipo} nº ${selectedPauta.numero}, a ser realizada em ${selectedPauta.data}.
    
        Use o seguinte Regimento Interno para estruturar o roteiro da sessão:
        --- REGIMENTO INTERNO (ROTEIRO DA SESSÃO) ---
        ${REGIMENTO_INTERNO_ROTEIRO}
        --- FIM DO REGIMENTO ---
    
        As matérias a serem votadas na Ordem do Dia são:
        ${itensTexto || "Nenhuma matéria cadastrada na ordem do dia."}
    
        Com base no regimento e na lista de matérias, gere o documento "Roteiro da Sessão" completo, detalhando cada fase e incluindo os nomes das matérias nos locais apropriados da Ordem do Dia. O texto deve ser formal e pronto para ser lido pelo Presidente da Câmara. Não use markdown.`;
    
        const roteiroText = await this.callGeminiAPI(prompt);
        
        this.generateRoteiroPDF(selectedPauta, roteiroText);
    
        this.setState({ isFinalizing: false });
    };

    generateRoteiroPDF = (pauta, roteiroText) => {
        const dataAtual = new Date().toLocaleDateString('pt-BR');
    
        const docDefinition = {
            content: [
                { text: 'Câmara Municipal de Teste', style: 'header', alignment: 'center' },
                { text: `PAUTA DA ${pauta.tipo.toUpperCase()} Nº ${pauta.numero}`, style: 'title', alignment: 'center' },
                { text: `Data: ${pauta.data}`, style: 'subheader', alignment: 'center', marginBottom: 30 },
                { text: 'ROTEIRO DA SESSÃO', style: 'sectionHeader' },
                { text: roteiroText, style: 'bodyText' },
                { text: `\n\nCâmara Municipal, ${dataAtual}.`, style: 'bodyText', alignment: 'right' },
            ],
            styles: { header: { fontSize: 16, bold: true }, subheader: { fontSize: 12, color: '#555' }, title: { fontSize: 14, bold: true, marginTop: 20, marginBottom: 5 }, sectionHeader: { fontSize: 12, bold: true, marginTop: 15, marginBottom: 10, color: '#126B5E' }, bodyText: { fontSize: 11, alignment: 'justify', lineHeight: 1.5 } }
        };
    
        pdfMake.createPdf(docDefinition).open();
    };

    // Função para chamar a API do Gemini
    async callGeminiAPI(prompt) {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        const MODEL_NAME = 'gemini-2.5-flash';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();

            if (data.error) {
                console.error("Erro retornado pela API Gemini:", data.error);
                if (data.error.code === 404) {
                    return `Erro: O modelo ${MODEL_NAME} não está disponível.`;
                }
                return `Erro na IA: ${data.error.message}`;
            }

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            
            return "Não foi possível gerar uma resposta válida.";
        } catch (error) {
            console.error("Erro ao chamar a API do Gemini:", error);
            return "Desculpe, não consegui processar sua solicitação no momento.";
        }
    }

    handleGenerateEditalWithAI = async () => {
        const { selectedPauta } = this.state;
        if (!selectedPauta) return;

        this.setState({ isGeneratingEdital: true, editalText: '' });

        const itensTexto = selectedPauta.itens.map((item, index) => `${index + 1}. ${item.titulo} (${item.autor})`).join('\n');

        const prompt = `Atue como Presidente da Câmara Municipal. Redija um Edital de Convocação formal para a ${selectedPauta.tipo} nº ${selectedPauta.numero}, a ser realizada no dia ${selectedPauta.data}.
        
        A Pauta da Ordem do Dia será:
        ${itensTexto || "Nenhuma matéria cadastrada na ordem do dia."}

        O texto deve seguir a estrutura padrão de editais legislativos, convocando os Senhores Vereadores, mencionando o horário regimental (ou definir 19h) e o local (Plenário da Câmara). Finalize com a data e assinatura. Não use markdown.`;

        const response = await this.callGeminiAPI(prompt);
        this.setState({ editalText: response, isGeneratingEdital: false });
    };

    render() {
        const { pautas, showModal, selectedPauta, novaData, novoTipo, materiasDisponiveis, selectedMateriaToAdd, editalText, isGeneratingEdital, isFinalizing, selectedMonth } = this.state;

        // Ordenar pautas por data (mais recente primeiro)
        const sortedPautas = [...pautas].sort((a, b) => {
            const [dayA, monthA, yearA] = a.data.split('/');
            const [dayB, monthB, yearB] = b.data.split('/');
            return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
        });

        // Agrupar por mês
        const groupedPautas = [];
        sortedPautas.forEach(pauta => {
            const [day, month, year] = pauta.data.split('/');
            const date = new Date(year, month - 1, day);
            const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

            let group = groupedPautas.find(g => g.month === key);
            if (!group) {
                group = { month: key, pautas: [] };
                groupedPautas.push(group);
            }
            group.pautas.push(pauta);
        });

        const availableMonths = groupedPautas.map(g => g.month);
        const currentMonth = selectedMonth && availableMonths.includes(selectedMonth) ? selectedMonth : (availableMonths.length > 0 ? availableMonths[0] : '');
        const displayedGroups = groupedPautas.filter(g => g.month === currentMonth);

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    
                    {/* Coluna Esquerda: Lista de Pautas */}
                    <div style={{ flex: 1, maxWidth: '400px' }}>
                        <div className="dashboard-header" style={{ marginBottom: '20px' }}>
                            <div>
                                <h1 className="dashboard-header-title">
                                    <FaCalendarAlt className="icon-primary" /> Pautas
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
                                    {group.pautas.map(pauta => (
                                        <div 
                                            key={pauta.id} 
                                            className="list-item dashboard-card-hover" 
                                            style={{ 
                                                cursor: 'pointer', 
                                                borderLeft: `4px solid ${selectedPauta && selectedPauta.id === pauta.id ? '#FF740F' : '#126B5E'}`,
                                                marginBottom: '10px'
                                            }}
                                            onClick={() => this.handleSelectPauta(pauta)}
                                        >
                                            <div className="list-item-content">
                                                <div className="list-item-header">
                                                    <span className="tag tag-primary">{pauta.numero}</span>
                                                    <span className={`tag ${pauta.status === 'Publicada' ? 'tag-success' : 'tag-warning'}`}>{pauta.status}</span>
                                                </div>
                                                <h3 className="list-item-title">{pauta.tipo}</h3>
                                                <div className="list-item-meta">
                                                    <FaCalendarAlt size={12} className="icon-primary" /> {pauta.data}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {pautas.length === 0 && <p style={{color: '#666', textAlign: 'center', marginTop: '20px'}}>Nenhuma pauta cadastrada.</p>}
                        </div>
                    </div>

                    {/* Coluna Direita: Detalhes e Itens */}
                    <div style={{ flex: 1.5 }}>
                        {selectedPauta ? (
                            <div className="dashboard-card">
                                <div className="modal-header" style={{ justifyContent: 'space-between' }}>
                                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FaList className="icon-primary" /> Detalhes da Pauta {selectedPauta.numero}
                                    </h2>
                                    <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                                        <FaPrint style={{color: '#126b5e'}} /> Imprimir
                                    </button>
                                </div>

                                <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                                    <div><strong>Data:</strong> {selectedPauta.data}</div>
                                    <div><strong>Tipo:</strong> {selectedPauta.tipo}</div>
                                    <div><strong>Status:</strong> {selectedPauta.status}</div>
                                </div>

                                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <h4 style={{ marginTop: 0, color: '#555' }}>Adicionar Matéria à Ordem do Dia</h4>
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
                                    <h4 style={{ color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Itens da Pauta</h4>
                                    {selectedPauta.itens.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {selectedPauta.itens.map((item, index) => (
                                                <li key={item.id} style={{ background: 'white', border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#126B5E' }}>{index + 1}º</span>
                                                        <div>
                                                            <div style={{ textAlign: 'left', fontWeight: 'bold', color: '#333' }}>{item.titulo}</div>
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
                                        <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Nenhum item adicionado à pauta ainda.</p>
                                    )}
                                </div>

                                {/* Seção de Edital com IA */}
                                <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h4 style={{ margin: 0, color: '#126B5E' }}>Edital de Convocação</h4>
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
                                        onClick={this.handleFinalizePauta}
                                        disabled={isFinalizing}
                                        className="btn-primary"
                                    >
                                        <FaCheckCircle /> {isFinalizing ? 'Gerando Roteiro...' : 'Finalizar e Gerar Roteiro'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="dashboard-card" style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                                <FaList size={50} style={{ marginBottom: '20px', color: '#ddd' }} />
                                <h3>Selecione uma pauta para gerenciar</h3>
                            </div>
                        )}
                    </div>

                    {/* Modal Create */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ width: '400px' }}>
                                <h2 className="modal-header">Nova Pauta</h2>
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
                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={this.handleCloseModal}>Cancelar</button>
                                    <button className="btn-primary" onClick={this.handleCreatePauta}>Criar</button>
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