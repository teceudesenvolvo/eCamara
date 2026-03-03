import React, { Component } from 'react';
import { FaGavel, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaPenFancy, FaMagic, FaFileAlt } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuDashboard.jsx';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../assets/logo.png';

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
            materias: [
                { id: 1, tipo: 'Projeto de Lei', numero: '12/2024', ementa: 'Dispõe sobre a obrigatoriedade de instalação de câmeras de segurança em escolas municipais.', autor: 'Ver. Teste', data: '20/02/2024', status: 'Aguardando Parecer', urgencia: true, parecer: null, decisao: null },
                { id: 2, tipo: 'Indicação', numero: '45/2024', ementa: 'Solicita pavimentação da Rua XV de Novembro.', autor: 'Ver. João', data: '21/02/2024', status: 'Em Análise', urgencia: false, parecer: null, decisao: null },
                { id: 3, tipo: 'Requerimento', numero: '08/2024', ementa: 'Requer informações sobre gastos com publicidade.', autor: 'Ver. Maria', data: '22/02/2024', status: 'Parecer Favorável', urgencia: false, parecer: 'Após análise, constatou-se que o requerimento está em conformidade com as normas regimentais e legais, não havendo óbice para sua tramitação.', decisao: 'favoravel' },
            ]
        };
    }

    componentDidMount() {
        this.loadLogo();
    }

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

    handleSubmitParecer = (decisao) => {
        const { selectedMateria, materias, parecerText } = this.state;
        // Atualiza o status da matéria na lista (simulação)
        const updatedMaterias = materias.map(m => 
            m.id === selectedMateria.id ? { 
                ...m, 
                status: decisao === 'favoravel' ? 'Parecer Favorável' : 'Parecer Contrário',
                parecer: parecerText || "Não foi fornecida fundamentação.", // Salva o texto do parecer
                decisao: decisao // Salva a decisão
            } : m
        );

        this.setState({ 
            materias: updatedMaterias, 
            showParecerModal: false,
            selectedMateria: null 
        });
        
        // Gera o edital em PDF em vez de um simples alerta
        this.generateParecerPDF(selectedMateria, parecerText, decisao);
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

        const response = await this.callGeminiAPI(prompt);
        this.setState({ parecerText: response, isGeneratingParecer: false });
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

    // Função para chamar a API do Gemini (copiada de addMaterias.jsx)
    async callGeminiAPI(prompt) {
        const API_KEY = 'AIzaSyDdvxyaBpOK098zGU8fq5dI6p_SeRARDvU';
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
                    return `Erro: O modelo ${MODEL_NAME} não está disponível. Verifique o nome do modelo.`;
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

                <div className="dashboard-content" style={{ marginLeft: '85px', width: '100%', padding: '40px', boxSizing: 'border-box', minHeight: '100vh' }}>
                    
                    {/* Header */}
                    <div style={{ marginBottom: '40px', textAlign: 'left' }}>
                        <h1 style={{ color: '#126B5E', margin: 0, fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaGavel style={{color: '#126B5E'}} /> Triagem e Pareceres
                        </h1>
                        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Gestão jurídica e legislativa das matérias em tramitação.</p>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #f57c00' }}>
                            <h3 style={{ margin: 0, color: '#f57c00', fontSize: '2rem' }}>12</h3>
                            <p style={{ margin: 0, color: '#666' }}>Aguardando Parecer</p>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #126B5E' }}>
                            <h3 style={{ margin: 0, color: '#126B5E', fontSize: '2rem' }}>45</h3>
                            <p style={{ margin: 0, color: '#666' }}>Pareceres Emitidos</p>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #d32f2f' }}>
                            <h3 style={{ margin: 0, color: '#d32f2f', fontSize: '2rem' }}>3</h3>
                            <p style={{ margin: 0, color: '#666' }}>Urgências Pendentes</p>
                        </div>
                    </div>

                    {/* Filtros e Busca */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input 
                                type="text"  
                                placeholder="Buscar por número, ementa ou autor..." 
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                style={{ width: '94%', padding: '12px 12px 12px 45px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaFilter color="#666" />
                            <select 
                                value={filterStatus}
                                onChange={(e) => this.setState({ filterStatus: e.target.value })}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#555', minWidth: '150px' }}
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
                            <div key={materia.id} style={{ 
                                background: 'white', 
                                padding: '25px', 
                                borderRadius: '12px', 
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: materia.urgencia ? '4px solid #d32f2f' : '4px solid transparent'
                            }}>
                                <div style={{ flex: 1, marginRight: '20px', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#126B5E', background: '#e0f2f1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {materia.tipo} {materia.numero}
                                        </span>
                                        {materia.urgencia && (
                                            <span style={{ fontWeight: 'bold', color: '#d32f2f', background: '#ffebee', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaExclamationTriangle size={12} /> Urgente
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.1rem', lineHeight: '1.4' }}>{materia.ementa}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#666' }}>
                                        <span><strong>Autor:</strong> {materia.autor}</span>
                                        <span style={{ color: '#ccc' }}>|</span>
                                        <span><strong>Data:</strong> {materia.data}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                                            style={{ background: '#126B5E', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <FaFileAlt /> Visualizar
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => this.handleOpenParecer(materia)}
                                            style={{ 
                                                background: '#126B5E', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '10px 20px', 
                                                borderRadius: '8px', 
                                                cursor: 'pointer', 
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
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
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '600px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                <h2 style={{ marginTop: 0, color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
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
                                            style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #126B5E', background: 'white', color: '#126B5E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <FaMagic /> {this.state.isGeneratingParecer ? 'Gerando...' : 'Sugerir com IA'}
                                        </button>
                                    </div>
                                    <textarea 
                                        rows="15" 
                                        style={{ width: '90%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit', resize: 'vertical', background: this.state.isGeneratingParecer ? '#f5f5f5' : '#f9f9f9', color: '#333' }}
                                        placeholder={this.state.isGeneratingParecer ? "Aguarde, a IA está elaborando uma sugestão de parecer..." : "Escreva aqui a fundamentação jurídica ou clique em 'Sugerir com IA'."}
                                        value={this.state.parecerText}
                                        onChange={(e) => this.setState({ parecerText: e.target.value })}
                                        readOnly={this.state.isGeneratingParecer}
                                    ></textarea>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button 
                                        onClick={this.handleCloseParecer}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', color: '#666' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={() => this.handleSubmitParecer('contrario')}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d32f2f', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <FaTimesCircle /> Contrário
                                    </button>
                                    <button 
                                        onClick={() => this.handleSubmitParecer('favoravel')}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2e7d32', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
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
