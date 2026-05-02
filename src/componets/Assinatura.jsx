import React from 'react';
import { Box, Typography, Paper, Divider, Link } from '@mui/material';
import LogoIcon from '../assets/logo-camaraai-icon.png';

const Assinatura = ({ signerName, date, ip, hash }) => {
    const formattedDate = date
        ? new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }) + ' -0300'
        : 'Data não informada';

    const verificationUrl = `https://verificador.camaraai.com/validar/${hash || 'ABC123XYZ'}`;

    return (
        <Paper
            elevation={0}
            sx={{
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                padding: '10px 12px',
                maxWidth: '520px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                backgroundColor: '#fff',
            }}
        >
            {/* Título */}
            <Typography
                sx={{
                    fontSize: '11px',
                    color: '#333',
                    fontWeight: 600,
                    marginBottom: '6px',
                }}
            >
                Documento assinado digitalmente
            </Typography>

            {/* Conteúdo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Logo estilo gov */}
                <Box sx={{ marginRight: '10px' }}>
                    <img
                        src={LogoIcon}
                        alt="CâmaraAI"
                        style={{
                            width: '70px',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                {/* Infos */}
                <Box>
                    <Typography
                        sx={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#000',
                            lineHeight: 1.2,
                        }}
                    >
                        {signerName || 'NOME DO ASSINANTE'}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '12px',
                            color: '#333',
                            lineHeight: 1.4,
                        }}
                    >
                        Data: {formattedDate}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '12px',
                            color: '#333',
                            lineHeight: 1.4,
                        }}
                    >
                        IP: {ip || '0.0.0.0'}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '12px',
                            color: '#333',
                            lineHeight: 1.4,
                        }}
                    >
                        Assinado via CâmaraAI
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ marginY: '6px' }} />

            {/* Verificação */}
            <Typography
                sx={{
                    fontSize: '11px',
                    color: '#333',
                }}
            >
                Verifique em:{' '}
                <Link
                    href={verificationUrl}
                    target="_blank"
                    underline="none"
                    sx={{
                        fontSize: '11px',
                        color: '#1a73e8',
                        wordBreak: 'break-all',
                    }}
                >
                    {verificationUrl}
                </Link>
            </Typography>
        </Paper>
    );
};

export default Assinatura;