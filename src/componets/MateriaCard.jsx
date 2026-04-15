import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { FaSignature, FaUsers, FaCheckCircle, FaUserPlus, FaInfoCircle } from 'react-icons/fa';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const MateriaCard = ({ materia, user, camaraId, sessaoId, index, isAdmin, onOpenModal, onSetDiscussao, onSetVotacao }) => {
    const [subscricoes, setSubscricoes] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (!materia || !materia.id) return;

        const fetchSubscriptions = async () => {
            try {
                const response = await api.get(`/legislative-matters/id/${materia.id}`);
                if (response.data && response.data.subscricoes) {
                    setSubscricoes(response.data.subscricoes);
                } else {
                    setSubscricoes({});
                }
            } catch (error) {
                console.error("Erro ao buscar subscrições:", error);
            }
        };

        fetchSubscriptions();
        const intervalId = setInterval(fetchSubscriptions, 5000); // Polling every 5 seconds

        return () => clearInterval(intervalId);
    }, [camaraId, materia.id]);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleSubscribe = async (tipo) => {
        if (!user) return;
        
        const subData = {
            uid: user.id || user.uid,
            nome: user.name || user.displayName || 'Parlamentar',
            tipo: tipo,
            timestamp: new Date().toISOString(),
            avatar: user.photoURL || user.foto || null
        };

        try {
            const updatedSubscricoes = { ...subscricoes, [subData.uid]: subData };
            await api.patch(`/legislative-matters/id/${materia.id}`, { subscricoes: updatedSubscricoes });
            
            // Também salva um log na sessão para o operador ver instantaneamente
            if (sessaoId) {
                try {
                    const sessionResponse = await api.get(`/sessions/id/${sessaoId}`);
                    const currentLogs = sessionResponse.data?.logs || [];
                    const newLog = {
                        id: Date.now().toString(),
                        tipo: 'subscricao',
                        texto: `${subData.nome} subscreveu a matéria ${materia.tipoMateria} ${materia.numero} como ${tipo}`,
                        timestamp: subData.timestamp
                    };
                    await api.patch(`/sessions/id/${sessaoId}`, { logs: [...currentLogs, newLog] });
                } catch (logError) {
                    console.error("Erro ao salvar log da sessão:", logError);
                }
            }

            setSubscricoes(updatedSubscricoes);
            setToast({ open: true, message: `Subscrição realizada como ${tipo}!`, severity: 'success' });
            handleCloseMenu();
        } catch (error) {
            console.error("Erro ao subscrever:", error);
            setToast({ open: true, message: "Erro ao realizar subscrição.", severity: 'error' });
        }
    };

    const isSubscribed = user && subscricoes[user.id || user.uid];
    const canSubscribe = user && !isSubscribed && (materia.permiteSubscricao !== false) && (materia.userId !== (user.id || user.uid));
    const subscritoresList = Object.values(subscricoes);

    return (
        <div className="materia-card-container" style={{ 
            padding: '16px', 
            border: '1px solid #e0e0e0', 
            borderRadius: '12px', 
            marginBottom: '16px',
            backgroundColor: '#fff',
            transition: 'box-shadow 0.3s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            textAlign: 'left'
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#126B5E' }}>
                    {materia.tipoMateria} {materia.numero}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    {materia.status && (
                        <span className={`status-badge ${materia.status === 'Em Votação' ? 'status-em-votacao' : ''}`} style={{ fontSize: '0.7rem' }}>
                            {materia.status}
                        </span>
                    )}
                </Box>
            </Box>

            <Typography 
                variant="body2" 
                style={{ 
                    color: '#555', 
                    fontSize: '0.85rem', 
                    marginBottom: '12px', 
                    cursor: 'pointer',
                    lineHeight: '1.4'
                }} 
                onClick={() => onOpenModal(materia)}
            >
                {materia.ementa}
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    {subscritoresList.length > 0 && (
                        <AvatarGroup max={4} total={subscritoresList.length}>
                            {subscritoresList.map((sub) => (
                                <Tooltip key={sub.uid} title={`${sub.nome} (${sub.tipo})`}>
                                    <Avatar 
                                        alt={sub.nome} 
                                        src={sub.avatar} 
                                        sx={{ width: 28, height: 28, fontSize: '0.75rem', border: `2px solid ${sub.tipo === 'Coautoria' ? '#FF740F' : '#126B5E'}` }}
                                    >
                                        {sub.nome.charAt(0)}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    )}
                </Box>

                <Box display="flex" gap={1}>
                    <IconButton size="small" onClick={() => onOpenModal(materia)} title="Ver Detalhes">
                        <FaInfoCircle size={18} color="#999" />
                    </IconButton>
                    
                    {canSubscribe && (
                        <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<FaUserPlus />}
                            onClick={handleOpenMenu}
                            sx={{ 
                                textTransform: 'none', 
                                borderRadius: '20px', 
                                fontSize: '0.75rem',
                                color: '#126B5E',
                                borderColor: '#126B5E',
                                '&:hover': { backgroundColor: '#e0f2f1', borderColor: '#126B5E' }
                            }}
                        >
                            Subscrever
                        </Button>
                    )}

                    {isSubscribed && (
                        <Tooltip title={`Você subscreveu como ${subscricoes[user.id || user.uid].tipo}`}>
                            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: 600 }}>
                                <FaCheckCircle /> Subscrito
                            </Box>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {isAdmin && materia.status !== 'Em Votação' && materia.status !== 'Aprovada' && materia.status !== 'Rejeitada' && (
                <Box mt={2} display="flex" flexDirection="column" gap={1}>
                    <Button 
                        variant="contained" 
                        size="small" 
                        onClick={() => onSetDiscussao(index)}
                        sx={{ 
                            textTransform: 'none', 
                            fontSize: '0.7rem', 
                            backgroundColor: '#00695c',
                            '&:hover': { backgroundColor: '#004d40' }
                        }}
                    >
                        Colocar em Discussão
                    </Button>
                    <Button 
                        variant="contained" 
                        size="small" 
                        onClick={() => onSetVotacao(index)}
                        sx={{ 
                            textTransform: 'none', 
                            fontSize: '0.7rem', 
                            backgroundColor: '#00695c',
                            '&:hover': { backgroundColor: '#004d40' }
                        }}
                    >
                        Colocar em Votação
                    </Button>
                </Box>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: '12px', mt: 1 }
                }}
            >
                <MenuItem onClick={() => handleSubscribe('Apoio')} sx={{ fontSize: '0.9rem', gap: 1 }}>
                    <FaSignature color="#126B5E" /> Apoio
                </MenuItem>
                <MenuItem onClick={() => handleSubscribe('Coautoria')} sx={{ fontSize: '0.9rem', gap: 1 }}>
                    <FaSignature color="#FF740F" /> Coautoria
                </MenuItem>
            </Menu>

            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default MateriaCard;
