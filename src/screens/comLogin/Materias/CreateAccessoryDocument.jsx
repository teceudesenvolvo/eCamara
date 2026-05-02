import React, { Component } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, TextField, Button, 
    Autocomplete, FormControlLabel, Switch, CircularProgress, Alert,
    Divider, Paper, Tooltip
} from '@mui/material';
import { 
    FaFileSignature, FaSearch, FaEye, FaArrowLeft, FaSave, FaMagic, FaInfoCircle, FaLightbulb, FaPencilAlt,
    FaCheckCircle, FaTimes, FaRobot
} from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api';
import { sendMessageToAIPrivate } from '../../../aiService';
import LogoIcon from '../../../assets/logo-camaraai-icon.png'; // Import the CameraAI logo

class CreateAccessoryDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            camaraId: this.props.match.params.camaraId,
            loading: true,
            materias: [],
            selectedMateria: null,
            documentType: 'Requerimento de Urgência',
            documentNumber: '',
            content: '',
            justificationInput: '',
            isGenerating: false,
            isSubscriptionEnabled: false,
            saving: false,
            autorNome: '', // Estado para armazenar o nome recuperado do banco
            
            // Digital Signature states
            isSigned: false,
            signatureMetadata: null,
            camaraAILogoBase64: null,
            showPasswordModal: false,
            passwordInput: '',
            passwordError: ''
        };
    }

    async componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        const camaraId = this.props.match.params.camaraId;

        if (token && user.id) {
            // No backend novo, as permissões e dados da câmara já vêm no perfil do usuário ou via API
            this.setState({ 
                autorNome: user.name || 'Parlamentar',
                camaraId: this.state.camaraId 
            }, () => {
                this.fetchMaterias(user.id, this.state.camaraId);
                this.generateNextNumber(this.state.camaraId);
            });
        } else {
            this.props.history.push(`/login/${this.state.camaraId || ''}`);
        }

        // Fetch CameraAI logo for digital signature
        try {
            const camaraAILogoB64 = await this.getBase64(LogoIcon);
            this.setState({ camaraAILogoBase64: camaraAILogoB64 });
        } catch (error) {
            console.error("Error loading CameraAI logo:", error);
        }
    }

    getBase64 = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    fetchMaterias = async (userId, camaraId) => {
        try {
            const targetCamara = camaraId || this.state.camaraId;
            const response = await api.get(`/legislative-matters/${targetCamara}`);
            const rawData = response.data;

            // Garante a extração de um array, lidando com diferentes padrões de retorno da API
            const allMaterias = Array.isArray(rawData) ? rawData : (rawData?.matters || rawData?.materias || Object.values(rawData || {}));
            
            const data = [];
            if (Array.isArray(allMaterias)) {
                allMaterias.forEach(val => {
                    // Verifica se a matéria pertence ao usuário logado
                    const mAuthorId = val.authorId || val.userId;
                    if (mAuthorId !== userId) return;

                    const status = val.status || '';
                    
                    // Permite matérias em tramitação que ainda não foram finalizadas ou arquivadas
                    const isTramitating = !['Aprovada', 'Rejeitada', 'Sancionado', 'Arquivado'].includes(status);
                    const hasValidStatus = status.includes('Parecer') || status.includes('Comissão') || status.includes('Aguardando') || status.includes('Plenário') || status === 'Em Tramitação';

                    if (!isTramitating && !hasValidStatus) return;

                    const tipo = (val.tipoMateria || '').toLowerCase();
                    if (tipo.includes('lei') || tipo.includes('indica') || tipo.includes('projeto') || tipo.includes('requerimento')) {
                        data.push({ ...val });
                    }
                });

                // Ordenar por data de criação (mais recentes primeiro)
                data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            }
            this.setState({ materias: data, loading: false });
        } catch (error) {
            console.error("Erro ao buscar matérias:", error);
            this.setState({ loading: false });
        }
    };

    generateNextNumber = async (camaraId) => {
        try {
            const response = await api.get(`/legislative-matters/${camaraId}/accessory-count`);
            const count = response.data.count || 0;
            this.setState({ documentNumber: (count + 1).toString() });
        } catch (error) {
            console.error("Erro ao gerar número:", error);
            this.setState({ documentNumber: "1" });
        }
    };

    handleMateriaChange = (event, newValue) => {
        if (!newValue) {
            this.setState({ selectedMateria: null, content: '' });
            return;
        }

        const currentYear = new Date().getFullYear();
        const template = `
            <h2 style="text-align: center;">REQUERIMENTO DE URGÊNCIA Nº ${this.state.documentNumber}/${currentYear}</h2>
            <p><br></p>
            <p><strong>Excelentíssimo Senhor Presidente,</strong></p>
            <p><br></p>
            <p>O Vereador que este subscreve, no uso de suas atribuições regimentais, vem respeitosamente à presença de Vossa Excelência, requerer que a Matéria <strong>${newValue.tipoMateria} nº ${newValue.numero}/${newValue.ano}</strong>, que <em>"${newValue.ementa}"</em>, passe a tramitar em <strong>REGIME DE URGÊNCIA</strong>, com fulcro nos artigos pertinentes do Regimento Interno desta Casa Legislativa.</p>
            <p><br></p>
            <p><strong>Justificativa:</strong></p>
            <p>[Aguardando redação da IA ou preenchimento manual...]</p>
        `;

        this.setState({ selectedMateria: newValue, content: template });
    };

    handleAIGenerateJustification = async () => {
        const { justificationInput, selectedMateria, camaraId } = this.state;
        if (!selectedMateria || !justificationInput) {
            alert("Selecione uma matéria e descreva os motivos primeiro.");
            return;
        }

        this.setState({ isGenerating: true });

        const prompt = `Atue como um consultor jurídico legislativo. 
        Escreva uma justificativa formal e técnica para um Requerimento de Urgência.
        Matéria de referência: ${selectedMateria.tipoMateria} nº ${selectedMateria.numero} (${selectedMateria.ementa}).
        Motivos fornecidos pelo parlamentar: "${justificationInput}".
        Responda APENAS o texto da justificativa em parágrafos HTML (<p>).`;

        try {
            const aiResponse = await sendMessageToAIPrivate(prompt, camaraId);
            const cleaned = aiResponse.replace(/```html|```/g, '').trim();
            
            // Insere a justificativa no template
            const updatedContent = this.state.content.replace(
                "<p>[Aguardando redação da IA ou preenchimento manual...]</p>",
                cleaned
            );

            this.setState({ content: updatedContent, isGenerating: false });
        } catch (error) {
            console.error("Erro na IA:", error);
            this.setState({ isGenerating: false });
            alert("Falha ao gerar redação com IA.");
        }
    };

    handleSign = () => {
        this.setState({ showPasswordModal: true, passwordInput: '', passwordError: '' });
    };

    handleSave = async () => {
        const { camaraId, content, selectedMateria, isSubscriptionEnabled, documentNumber } = this.state;
        if (!selectedMateria || !content) return;

        this.setState({ saving: true });
        try {
            await api.post(`/legislative-matters/${camaraId}/accessory`, {
                titulo: `Requerimento de Urgência ${documentNumber}/${new Date().getFullYear()}`,
                materiaReferenciaId: selectedMateria.id,
                conteudo: content,
                autorNome: this.state.autorNome,
                status: 'Protocolado',
                permiteSubscricao: isSubscriptionEnabled,
                isSigned: this.state.isSigned,
                signatureMetadata: this.state.signatureMetadata
            });
            alert("Documento gerado e protocolado com sucesso!");
            this.props.history.push(`/admin/materias-dash/${camaraId}`);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            this.setState({ saving: false });
            alert("Erro ao protocolar o documento acessório.");
        }
    };

    generateHash = async (content) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    confirmSignature = async () => {
        const { passwordInput, content, camaraId } = this.state;
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (!user.email || !passwordInput) {
            this.setState({ passwordError: 'Senha necessária.' });
            return;
        }

        // In a real application, you would send the password to your backend
        // for verification. For this example, we'll just check if it's not empty.
        if (passwordInput.length < 3) { // Simple validation
            this.setState({ passwordError: 'Senha muito curta.' });
            return;
        }

        try {
            this.setState({ passwordError: '' });

            // Collect security data (IP)
            const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => ({ json: () => ({ ip: '0.0.0.0' }) }));
            const ipData = await ipRes.json();
            const ip = ipData.ip;
            const userAgent = navigator.userAgent;
            const timestamp = new Date().toISOString();
            const hash = await this.generateHash(content || '');

            const signatureMetadata = {
                nome: user.name || 'Usuário',
                email: user.email,
                cpf: user.cpf || 'CPF não informado',
                timestamp: timestamp,
                ip: ip,
                userAgent: userAgent,
                documentHash: hash,
                hash: hash
            };

            this.setState({
                isSigned: true,
                signatureMetadata,
                showPasswordModal: false
            });
            alert("Documento assinado digitalmente! Agora você pode protocolá-lo.");

        } catch (error) {
            console.error("Erro na assinatura:", error);
            this.setState({ passwordError: 'Ocorreu um erro ao processar a assinatura.' });
        }
    };

    generateDocDefinition = () => {
        const { camaraAILogoBase64, signatureMetadata, isSigned, content, documentType, documentNumber } = this.state;
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        const autor = user.name || 'Parlamentar';
        const currentYear = new Date().getFullYear();

        return {
            content: [
                { text: documentType.toUpperCase(), style: 'title', alignment: 'center', margin: [0, 0, 0, 20] },
                { text: `Nº ${documentNumber}/${currentYear}`, alignment: 'center', margin: [0, 0, 0, 20] },
                { text: autor, alignment: 'center', style: 'author', margin: [0, 0, 0, 20] },
                { text: '\n\n' },
                { rawHtml: content, style: 'bodyText' }, // Use rawHtml for Quill content
                { text: '\n\n\n\n________________________________', style: 'signatureLine', alignment: 'center' },
                { text: autor, style: 'signatureName', alignment: 'center' },
                { text: 'Vereador(a)', style: 'signatureRole', alignment: 'center' },
                // Digital Signature Block
                isSigned && signatureMetadata && {
                    columns: [
                        camaraAILogoBase64
                            ? {
                                image: camaraAILogoBase64,
                                width: 50
                            }
                            : { text: '' },

                        {
                            width: '*',
                            stack: [
                                {
                                    text: 'Documento assinado digitalmente',
                                    style: 'signatureHeader'
                                },
                                {
                                    text: (signatureMetadata.nome || '').toUpperCase(),
                                    style: 'signatureName'
                                },
                                {
                                    text: `Data: ${new Date(signatureMetadata.timestamp).toLocaleString('pt-BR')}`,
                                    style: 'signatureDetail'
                                },
                                {
                                    text: `IP: ${signatureMetadata.ip}`,
                                    style: 'signatureDetail'
                                },
                                {
                                    text: 'Assinado via CâmaraAI',
                                    style: 'signatureAI'
                                },
                                {
                                    text: `Verifique em: https://verificador.camaraai.com/${signatureMetadata.hash}`,
                                    link: `https://verificador.camaraai.com/${signatureMetadata.hash}`,
                                    style: 'signatureLink'
                                }
                            ]
                        }
                    ],
                    columnGap: 10,
                    margin: [0, 20, 0, 10]
                }
            ].filter(Boolean),
            styles: {
                title: { fontSize: 16, bold: true },
                author: { fontSize: 12 },
                bodyText: { fontSize: 12, margin: [0, 0, 0, 10] },
                signatureLine: { margin: [0, 40, 0, 5] },
                signatureRole: { fontSize: 10 },
                signatureHeader: {
                    fontSize: 8,
                    bold: true,
                    color: '#666'
                },
                signatureName: {
                    fontSize: 10,
                    bold: true,
                    color: '#000'
                },
                signatureDetail: {
                    fontSize: 8,
                    color: '#444'
                },
                signatureAI: {
                    fontSize: 8,
                    italics: true,
                    color: '#126B5E'
                },
                signatureLink: {
                    fontSize: 7,
                    color: '#0066cc'
                }
            }
        };
    };

    render() {
        const { 
            loading, materias, content, isGenerating, isSubscriptionEnabled, saving,
            showPasswordModal, passwordInput, passwordError, isSigned
        } = this.state;

        return (
            <Box sx={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
                <MenuDashboard />
                <Box component="main" sx={{ flexGrow: 1, p: 4, ml: { md: '85px' } }}>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FaFileSignature color="#126B5E" /> Criar Requerimento de Urgência
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#126B5E', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <span style={{ background: '#126B5E', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>1</span>
                                                Vincular Matéria Alvo
                                            </Typography>
                                        <Autocomplete
                                            options={materias}
                                            getOptionLabel={(option) => `${option.tipoMateria || 'Matéria'} ${option.numero || 'S/N'}/${option.ano || ''} - ${option.autor || 'Autor Desconhecido'}`}
                                            onChange={this.handleMateriaChange}
                                            loading={loading}
                                            loadingText="Carregando suas matérias..."
                                            noOptionsText="Nenhuma matéria encontrada."
                                            renderInput={(params) => (
                                                <TextField {...params} label="Pesquisar por número ou ementa" size="small" variant="outlined" />
                                            )}
                                        />
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#64748b' }}>
                                            O requerimento será vinculado à matéria selecionada acima.
                                        </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#126B5E', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <span style={{ background: '#126B5E', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>2</span>
                                                Motivos da Solicitação
                                            </Typography>
                                        
                                        <TextField
                                            label="Motivos da Urgência"
                                            multiline
                                            rows={4}
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Ex: Relevância pública imediata devido ao início das chuvas..."
                                            value={this.state.justificationInput}
                                            onChange={(e) => this.setState({ justificationInput: e.target.value })}
                                        />

                                        <Button
                                            variant="contained"
                                            fullWidth
                                            startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <FaRobot />}
                                            onClick={this.handleAIGenerateJustification}
                                            disabled={isGenerating || !this.state.selectedMateria}
                                            sx={{ backgroundColor: '#126B5E', '&:hover': { backgroundColor: '#0e554a' }, borderRadius: '8px', py: 1, marginTop: 4, textTransform: 'none' }}
                                        >
                                            {isGenerating ? 'IA Processando...' : 'Sugerir Redação com IA'}
                                        </Button>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#126B5E', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <span style={{ background: '#126B5E', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>3</span>
                                                Opções de Assinatura
                                            </Typography>
                                        
                                        <Alert icon={<FaLightbulb />} severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
                                            Ative a subscrição se desejar que outros parlamentares também assinem este requerimento.
                                        </Alert>

                                        <FormControlLabel
                                            control={
                                                <Switch 
                                                    checked={isSubscriptionEnabled} 
                                                    onChange={(e) => this.setState({ isSubscriptionEnabled: e.target.checked })} 
                                                    color="primary"
                                                />
                                            }
                                            label={<Typography variant="body2">Disponibilizar para Coautoria (Subscrição)</Typography>}
                                        />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper sx={{ borderRadius: '16px', p: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ p: 2, background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FaPencilAlt size={14} color="#64748b" />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>Visualização e Edição da Minuta</Typography>
                                    </Box>
                                    <Button 
                                        variant="contained" 
                                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <FaFileSignature />}
                                        onClick={this.handleSave}
                                        disabled={!content || saving}
                                        color={isSigned ? 'success' : 'primary'}
                                        sx={{ backgroundColor: '#FF740F', '&:hover': { backgroundColor: '#e6680d' }, textTransform: 'none' }}
                                    >
                                        Protocolar Requerimento
                                    </Button>
                                </Box>
                                
                                {!this.state.selectedMateria ? (
                                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center', color: '#94a3b8' }}>
                                        <Box>
                                            <Box sx={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                                <FaFileSignature size={32} color="#cbd5e1" />
                                            </Box>
                                            <Typography sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>Aguardando Matéria Alvo</Typography>
                                            <Typography variant="body2" sx={{ maxWidth: '300px' }}>Selecione um Projeto de Lei ou Indicação para começar.</Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ flexGrow: 1 }}>
                                        <ReactQuill
                                            theme="snow"
                                            value={content}
                                            onChange={(val) => this.setState({ content: val })}
                                            style={{ height: '600px', border: 'none' }}
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, false] }],
                                                    ['bold', 'italic', 'underline'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ['clean']
                                                ]
                                            }}
                                        />
                                    </Box>
                                )}
                            </Paper>

                            {/* Digital Signature Button */}
                            {!isSigned && (
                                <Box sx={{ mt: 3, textAlign: 'right' }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<FaFileSignature />}
                                        onClick={this.handleSign}
                                        disabled={!content || isGenerating || saving}
                                        sx={{ 
                                            borderColor: '#126B5E', 
                                            color: '#126B5E', 
                                            '&:hover': { borderColor: '#0e554a', color: '#0e554a' },
                                            textTransform: 'none',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        Assinar Digitalmente
                                    </Button>
                                </Box>
                            )}

                            {/* Password Modal for Digital Signature */}
                            {showPasswordModal && (
                                <Box className="pdf-popup-overlay">
                                    <Box sx={{
                                        backgroundColor: 'white',
                                        p: 5,
                                        borderRadius: '32px',
                                        maxWidth: '480px',
                                        width: '90%',
                                        textAlign: 'center',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                                    }}>
                                        <Box sx={{
                                            width: 60, height: 60, borderRadius: '50%',
                                            backgroundColor: 'rgba(18, 107, 94, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                                        }}>
                                            <FaCheckCircle size={30} color="#126B5E" />
                                        </Box>
                                        <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: '#1a1a1a' }}>Assinatura Digital</Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 4, px: 2 }}>
                                            Para assinar juridicamente este documento, confirme sua senha de acesso ao ecossistema e-Câmara.
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="Sua Senha"
                                            variant="outlined"
                                            value={passwordInput}
                                            onChange={(e) => this.setState({ passwordInput: e.target.value })}
                                            error={!!passwordError}
                                            helperText={passwordError}
                                            sx={{ mb: 4 }}
                                            InputProps={{ sx: { borderRadius: '12px' } }}
                                        />

                                        <Box display="flex" gap={2}>
                                            <Button fullWidth variant="outlined" onClick={() => this.setState({ showPasswordModal: false })} sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
                                            <Button fullWidth variant="contained" onClick={this.confirmSignature} disabled={isGenerating} sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 600, backgroundColor: '#126B5E', '&:hover': { backgroundColor: '#0e554a' } }}>Confirmar Assinatura</Button>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }
}

export default CreateAccessoryDocument;