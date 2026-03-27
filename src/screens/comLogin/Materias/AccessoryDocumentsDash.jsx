import React, { Component } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, TextField, Button, 
    CircularProgress, IconButton, Divider, Paper
} from '@mui/material';
import { FaFileSignature, FaSearch, FaEye, FaArrowLeft, FaHistory, FaUserTie, FaTimes, FaPlus } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import { db, auth } from '../../../firebaseConfig';
import { ref, get, onValue } from 'firebase/database';

class AccessoryDocumentsDash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            camaraId: this.props.match.params.camaraId,
            loading: true,
            documents: [],
            searchTerm: '',
            selectedDoc: null,
            showModal: false
        };
    }

    componentDidMount() {
        this.unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userIndexRef = ref(db, `users_index/${user.uid}`);
                const snapshot = await get(userIndexRef);
                const camaraId = snapshot.exists() ? snapshot.val().camaraId : (this.props.match.params.camaraId || this.state.camaraId);

                this.setState({ camaraId }, () => {
                    this.fetchDocuments(user.uid);
                });
            } else {
                this.props.history.push(`/login/${this.props.match.params.camaraId || ''}`);
            }
        });
    }

    componentWillUnmount() {
        if (this.unsubscribeAuth) this.unsubscribeAuth();
    }

    fetchDocuments = (uid) => {
        const docsRef = ref(db, `${this.state.camaraId}/documentos_acessorios`);
        onValue(docsRef, (snapshot) => {
            const data = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const val = child.val();
                    // Mostra documentos de autoria própria ou que permitem subscrição
                    if (val.autorId === uid || val.permiteSubscricao) {
                        data.push({ id: child.key, ...val });
                    }
                });
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            this.setState({ documents: data, loading: false });
        });
    };

    handleOpenDoc = (doc) => {
        this.setState({ selectedDoc: doc, showModal: true });
    };

    render() {
        const { loading, documents, searchTerm, showModal, selectedDoc, camaraId } = this.state;

        const filteredDocs = documents.filter(doc => 
            (doc.titulo && doc.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (doc.autorNome && doc.autorNome.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return (
            <Box sx={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', flexDirection: 'row' }}>
                <MenuDashboard />
                <Box component="main" sx={{ 
                    flexGrow: 1, 
                    p: { xs: 2, md: 4 }, 
                    ml: { xs: 0, md: '85px' },
                    width: { xs: '100%', md: 'calc(100% - 85px)' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box textAlign="left">
                            <Typography variant="h4" sx={{ color: '#126B5E', fontWeight: 800, fontSize: "17px" }}>
                                Documentos Acessórios
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: "13px" }}>
                                Requerimentos e solicitações vinculadas às matérias legislativas.
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2}>
                          
                            <Button 
                                variant="contained"
                                startIcon={<FaPlus />}
                                onClick={() => this.props.history.push(`/admin/criar-documento-acessorio/${camaraId}`)}
                                sx={{ backgroundColor: '#126B5E', '&:hover': { backgroundColor: '#0e554a' }, borderRadius: '12px', textTransform: 'none' }}
                            >
                                Novo Requerimento
                            </Button>
                        </Box>
                    </Box>

                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #edf2f7' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <FaSearch color="#94a3b8" />
                                <TextField
                                    fullWidth
                                    placeholder="Pesquisar por título ou autor..."
                                    variant="standard"
                                    value={searchTerm}
                                    onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                    InputProps={{ disableUnderline: true, sx: { fontSize: '0.95rem' } }}
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={10}><CircularProgress color="primary" /></Box>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredDocs.map(doc => (
                                <Grid item xs={12} md={6} lg={4} key={doc.id}>
                                    <Card sx={{ 
                                        borderRadius: '20px', 
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        border: '1px solid #f1f5f9',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)' }
                                    }}>
                                        <CardContent sx={{ p: 3, textAlign: 'left', flexGrow: 1 }}>
                                            <Box display="flex" justifyContent="space-between" mb={2}>
                                                <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: 'rgba(18, 107, 94, 0.1)', display: 'flex' }}>
                                                    <FaFileSignature color="#126B5E" />
                                                </Box>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', 
                                                    fontWeight: 'bold', background: '#e8f5e9', color: '#2e7d32' 
                                                }}>
                                                    {doc.status}
                                                </span>
                                            </Box>
                                            
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem', color: '#1e293b' }}>
                                                {doc.titulo}
                                            </Typography>

                                            <Box display="flex" flexDirection="column" gap={1}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <FaUserTie size={12} color="#94a3b8" />
                                                    <Typography variant="body2" color="#64748b" fontSize="0.85rem">Autor: {doc.autorNome}</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <FaHistory size={12} color="#94a3b8" />
                                                    <Typography variant="body2" color="#64748b" fontSize="0.85rem">
                                                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                        <Divider />
                                        <Box p={2}>
                                            <Button 
                                                fullWidth 
                                                startIcon={<FaEye />}
                                                onClick={() => this.handleOpenDoc(doc)}
                                                sx={{ borderRadius: '10px', textTransform: 'none', color: '#126B5E', fontWeight: 600 }}
                                            >
                                                Ver Conteúdo
                                            </Button>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                            {filteredDocs.length === 0 && (
                                <Grid item xs={12}>
                                    <Paper sx={{ py: 10, textAlign: 'center', borderRadius: '24px', backgroundColor: 'transparent', border: '2px dashed #e2e8f0' }}>
                                        <FaFileSignature size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                        <Typography color="textSecondary">Nenhum documento gerado ainda.</Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Box>

                {showModal && selectedDoc && (
                    <div className="modal-overlay" onClick={() => this.setState({ showModal: false })}>
                        <Paper sx={{ 
                            maxWidth: '850px', width: '90%', height: '85vh', display: 'flex', flexDirection: 'column',
                            borderRadius: '24px', overflow: 'hidden'
                        }} onClick={e => e.stopPropagation()}>
                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <Typography variant="h6" fontWeight={800} color="#1e293b">{selectedDoc.titulo}</Typography>
                                <IconButton onClick={() => this.setState({ showModal: false })}><FaTimes /></IconButton>
                            </Box>
                            <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
                                <Box 
                                    className="ql-editor"
                                    sx={{ 
                                        textAlign: 'left', 
                                        lineHeight: 1.8, 
                                        color: '#334155',
                                        '& h2': { textAlign: 'center', mb: 4, color: '#1e293b' },
                                        '& p': { mb: 2 }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: selectedDoc.conteudo }}
                                />
                            </Box>
                        </Paper>
                    </div>
                )}
            </Box>
        );
    }
}

export default AccessoryDocumentsDash;