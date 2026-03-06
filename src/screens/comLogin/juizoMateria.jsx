import React, { Component } from 'react';
import { FaGavel, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaPenFancy, FaMagic, FaFileAlt } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuDashboard.jsx';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../assets/logo.png';
import { sendMessageToAIPrivate } from '../../aiService';
import { db } from '../../firebaseConfig';
import { ref, query, orderByChild, equalTo, get, update } from 'firebase/database';

pdfMake.vfs = pdfFonts.vfs;

class JuizoMateria extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: '',
            filterStatus: 'Todos',
            showParecerModal: false,
            selectedMateria: null,
            parecerText: '',
            logoBase64: null,
            isGeneratingParecer: false,
            materias: [],
            loading: true
        };
    }

    componentDidMount() {
        this.loadLogo();
        this.fetchMaterias();
    }

    fetchMaterias = async () => {
        this.setState({ loading: true });
        try {
            const materiasRef = ref(db, 'camara-teste/materias');
            // Busca matérias que precisam de parecer
            const q = query(materiasRef, orderByChild('status'), equalTo('Aguardando Parecer'));
            const snapshot = await get(q);
            const materias = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    materias.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
            }
            this.setState({ materias, loading: false });
        } catch (error) {
            console.error("Erro ao buscar matérias para parecer:", error);
            this.setState({ loading: false });
        }
    };

    loadLogo = async () => {
        try {
            const getBase64 = async (url) => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            };
            const logoBase64 = await getBase64(logo);
            this.setState({ logoBase64 });
        } catch (error) {
            console.error("Erro ao carregar o logo para o PDF:", error);
        }
    };

    handleOpenParecer = (materia) => {
        this.setState({ showParecerModal: true, selectedMateria: materia, parecerText: '' });
    };

    handleCloseParecer = () => {
        this.setState({ showParecerModal: false, selectedMateria: null });
    };

    handleSubmitParecer = async (decisao) => {
        const { selectedMateria, parecerText } = this.state;
        if (!selectedMateria) return;

        const newStatus = decisao === 'favoravel' ? 'Parecer Favorável' : 'Parecer Contrário';
        const parecerData = {
            status: newStatus,
            parecer: parecerText || "Não foi fornecida fundamentação.",
            decisao: decisao,
            parecerDate: new Date().toISOString(),
        };

        try {
            // Salva o parecer no nó da matéria
            const materiaRef = ref(db, `camara-teste/materias/${selectedMateria.id}`);
            await update(materiaRef, parecerData);

            // Gera o PDF
            this.generateParecerPDF(selectedMateria, parecerText, decisao);

            // Atualiza a lista local e fecha o modal
            this.setState(prevState => ({
                materias: prevState.materias.filter(m => m.id !== selectedMateria.id),
                showParecerModal: false,
                selectedMateria: null
            }));
        } catch (error) {
            console.error("Erro ao salvar parecer:", error);
            alert("Ocorreu um erro ao salvar o parecer. Tente novamente.");
        }
    };

    handleGenerateParecerWithAI = async () => {
        const { selectedMateria } = this.state;
        if (!selectedMateria) return;

        this.setState({ isGeneratingParecer: true, parecerText: '' });

        const prompt = `Atue como um Procurador Jurídico de uma Câmara Municipal. Elabore um parecer técnico-jurídico completo sobre a constitucionalidade e legalidade do seguinte projeto:
        - Tipo: ${selectedMateria.tipo}
        - Número: ${selectedMateria.numero}
        - Autor: ${selectedMateria.autor}
        - Ementa: "${selectedMateria.ementa}"

        Sua análise deve abordar:
        1.  **Competência Legislativa:** O município tem competência para legislar sobre o tema?
        2.  **Vício de Iniciativa:** O projeto foi proposto pelo poder correto (Legislativo ou Executivo)? Ele cria despesas para o Executivo sem indicar a fonte de custeio?
        3.  **Aspectos Formais:** A redação segue a técnica legislativa (Lei Complementar 95/98)?
        4.  **Aspectos Materiais:** O conteúdo do projeto conflita com a Constituição Federal, Estadual ou a Lei Orgânica do Município?

        Estruture o parecer com as seções: I - RELATÓRIO, II - ANÁLISE JURÍDICA, e III - CONCLUSÃO.
        Na conclusão, opine de forma clara pela constitucionalidade/legalidade ou inconstitucionalidade/ilegalidade da matéria.
        Use uma linguagem formal e técnica.`;

        try {
            const response = await sendMessageToAIPrivate(prompt);
            this.setState({ parecerText: response, isGeneratingParecer: false });
        } catch (error) {
            console.error("Erro na IA:", error);
            this.setState({ parecerText: "Erro ao gerar parecer. Tente novamente.", isGeneratingParecer: false });
        }
    };

    generateParecerPDF = (materia, parecerText, decisao) => {
        const { logoBase64 } = this.state;
        const dataAtual = new Date().toLocaleDateString('pt-BR');

        const docDefinition = {
            content: [
                logoBase64 && {
                    image: logoBase64,
                    width: 80,
                    alignment: 'center',
                    marginBottom: 10
                },
                { text: 'Câmara Municipal de Teste', style: 'header', alignment: 'center' },
                { text: 'Procuradoria Jurídica', style: 'subheader', alignment: 'center', marginBottom: 30 },

                { text: 'PARECER JURÍDICO', style: 'title', alignment: 'center' },

                {
                    style: 'infoBox',
                    table: {
                        widths: ['*'],
                        body: [
                            [[
                                { text: `Matéria: ${materia.tipo} nº ${materia.numero}`, style: 'infoText' },
                                { text: `Ementa: ${materia.ementa}`, style: 'infoText' },
                                { text: `Autor: ${materia.autor}`, style: 'infoText' },
                            ]]
                        ]
                    },
                    layout: {
                        hLineWidth: () => 1, vLineWidth: () => 1,
                        hLineColor: () => '#ccc', vLineColor: () => '#ccc',
                    }
                },

                { text: 'I - RELATÓRIO', style: 'sectionHeader' },
                { text: `Trata-se de análise jurídica do ${materia.tipo} nº ${materia.numero}, de autoria do(a) ${materia.autor}, que visa a dispor sobre "${materia.ementa}". A matéria foi encaminhada a esta Procuradoria para verificação de sua constitucionalidade e legalidade.`, style: 'bodyText' },

                { text: 'II - ANÁLISE JURÍDICA', style: 'sectionHeader' },
                { text: parecerText || "Não foi fornecida fundamentação.", style: 'bodyText' },

                { text: 'III - CONCLUSÃO', style: 'sectionHeader' },
                { text: [ 'Diante do exposto, esta Procuradoria Jurídica opina pela ', { text: decisao === 'favoravel' ? 'CONSTITUCIONALIDADE e LEGALIDADE' : 'INCONSTITUCIONALIDADE e ILEGALIDADE', bold: true }, ' da proposição, nos termos da análise apresentada.' ], style: 'bodyText' },

                { text: `\n\nCâmara Municipal, ${dataAtual}.`, style: 'bodyText', alignment: 'right' },

                { text: '\n\n\n\n________________________________', style: 'signature', alignment: 'center' },
                { text: 'Procurador Jurídico', style: 'signatureName', alignment: 'center' },
                { text: 'OAB/XX 123.456', style: 'signatureOAB', alignment: 'center' },
            ].filter(Boolean),
            styles: {
                header: { fontSize: 16, bold: true }, subheader: { fontSize: 12, color: '#555' },
                title: { fontSize: 14, bold: true, marginBottom: 20 }, infoBox: { margin: [0, 0, 0, 20] },
                infoText: { fontSize: 10, margin: [5, 2, 5, 2] }, sectionHeader: { fontSize: 12, bold: true, marginTop: 15, marginBottom: 5 },
                bodyText: { fontSize: 11, alignment: 'justify', lineHeight: 1.5 }, signature: { fontSize: 11 },
                signatureName: { fontSize: 11, bold: true }, signatureOAB: { fontSize: 10, color: '#555' },
            }
        };

        pdfMake.createPdf(docDefinition).open();
    };

    render() {
        const { searchTerm, filterStatus, materias, showParecerModal, selectedMateria } = this.state;

        // Filtros
        const filteredMaterias = materias.filter(m => 
            (filterStatus === 'Todos' || m.status === filterStatus) &&
            (m.ementa.toLowerCase().includes(searchTerm.toLowerCase()) || m.numero.includes(searchTerm))
        );

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    
                    {/* Header */}
                    <div className="dashboard-header">
                        <h1 className="dashboard-header-title">
                            <FaGavel style={{color: '#126B5E'}} /> Triagem e Pareceres
                        </h1>
                        <p className="dashboard-header-desc">Gestão jurídica e legislativa das matérias em tramitação.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#f57c00' }}>
                            <h3 style={{ margin: 0, color: '#f57c00', fontSize: '2rem' }}>12</h3>
                            <p style={{ margin: 0, color: '#666' }}>Aguardando Parecer</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ margin: 0, color: '#126B5E', fontSize: '2rem' }}>45</h3>
                            <p style={{ margin: 0, color: '#666' }}>Pareceres Emitidos</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#d32f2f' }}>
                            <h3 style={{ margin: 0, color: '#d32f2f', fontSize: '2rem' }}>3</h3>
                            <p style={{ margin: 0, color: '#666' }}>Urgências Pendentes</p>
                        </div>
                    </div>

                    {/* Filtros e Busca */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text"  
                                placeholder="Buscar por número, ementa ou autor..." 
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                className="search-input"
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaFilter color="#666" />
                            <select 
                                value={filterStatus}
                                onChange={(e) => this.setState({ filterStatus: e.target.value })}
                                className="filter-select"
                            >
                                <option value="Todos">Todos os Status</option>
                                <option value="Aguardando Parecer">Aguardando Parecer</option>
                                <option value="Em Análise">Em Análise</option>
                                <option value="Parecer Emitido">Parecer Emitido</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista de Matérias */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {filteredMaterias.map((materia) => (
                            <div key={materia.id} className="list-item" style={{ borderLeft: materia.urgencia ? '4px solid #d32f2f' : '4px solid transparent' }}>
                                <div className="list-item-content">
                                    <div className="list-item-header">
                                        <span className="tag tag-primary">
                                            {materia.tipo} {materia.numero}
                                        </span>
                                        {materia.urgencia && (
                                            <span className="tag tag-danger">
                                                <FaExclamationTriangle size={12} /> Urgente
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="list-item-title">{materia.ementa}</h3>
                                    <div className="list-item-meta">
                                        <span><strong>Autor:</strong> {materia.autor}</span>
                                        <span style={{ color: '#ccc' }}>|</span>
                                        <span><strong>Data:</strong> {materia.data}</span>
                                    </div>
                                </div>

                                <div className="list-item-actions">
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ 
                                            display: 'block',
                                            padding: '6px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold',
                                            background: materia.status.includes('Aguardando') ? '#fff3e0' : (materia.status.includes('Favorável') ? '#e8f5e9' : '#f5f5f5'),
                                            color: materia.status.includes('Aguardando') ? '#ef6c00' : (materia.status.includes('Favorável') ? '#2e7d32' : '#666')
                                        }}>
                                            {materia.status}
                                        </span>
                                    </div>
                                    {materia.parecer ? (
                                        <button 
                                            onClick={() => this.generateParecerPDF(materia, materia.parecer, materia.decisao)}
                                            className="btn-primary"
                                        >
                                            <FaFileAlt /> Visualizar
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => this.handleOpenParecer(materia)}
                                            className="btn-primary"
                                        >
                                            <FaPenFancy /> Analisar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Modal de Parecer */}
                    {showParecerModal && selectedMateria && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h2 className="modal-header">
                                    Emitir Parecer Jurídico
                                </h2>
                                <div style={{ marginBottom: '20px', color: '#126B5E' }}>
                                    <p style={{color: '#126B5E'}}><strong>Matéria:</strong> {selectedMateria.tipo} {selectedMateria.numero}</p>
                                    <p  style={{color: '#126B5E'}}><strong>Ementa:</strong> {selectedMateria.ementa}</p>
                                </div>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', color: '#555' }}>Texto do Parecer</label>
                                        <button 
                                            onClick={this.handleGenerateParecerWithAI}
                                            disabled={this.state.isGeneratingParecer}
                                            className="btn-secondary"
                                            style={{ padding: '8px 15px', color: '#126B5E', borderColor: '#126B5E', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <FaMagic /> {this.state.isGeneratingParecer ? 'Gerando...' : 'Sugerir com IA'}
                                        </button>
                                    </div>
                                    <textarea 
                                        rows="15" 
                                        className="modal-textarea"
                                        style={{ background: this.state.isGeneratingParecer ? '#f5f5f5' : '#f9f9f9' }}
                                        placeholder={this.state.isGeneratingParecer ? "Aguarde, a IA está elaborando uma sugestão de parecer..." : "Escreva aqui a fundamentação jurídica ou clique em 'Sugerir com IA'."}
                                        value={this.state.parecerText}
                                        onChange={(e) => this.setState({ parecerText: e.target.value })}
                                        readOnly={this.state.isGeneratingParecer}
                                    ></textarea>
                                </div>

                                <div className="modal-footer">
                                    <button 
                                        onClick={this.handleCloseParecer}
                                        className="btn-secondary"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={() => this.handleSubmitParecer('contrario')}
                                        className="btn-danger"
                                    >
                                        <FaTimesCircle /> Contrário
                                    </button>
                                    <button 
                                        onClick={() => this.handleSubmitParecer('favoravel')}
                                        className="btn-success"
                                    >
                                        <FaCheckCircle /> Favorável
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    }
}

export default JuizoMateria;
