import React, { Component } from 'react';

// Imagens
import ProfileImage from '../../assets/vereador.jpg'; // Imagem do perfil do vereador
import MenuDashboard from '../../componets/menuDashboard'; // Certifique-se de que este caminho está correto

// Ícones (se necessário, pode adicionar do Material-UI ou Font Awesome)
// import EditIcon from '@mui/icons-material/Edit';
// import ShareIcon from '@mui/icons-material/Share'; // Ícone de compartilhamento
// import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Ícone de email
// import PhoneIcon from '@mui/icons-material/Phone'; // Ícone de telefone

// Importações para os gráficos
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registrar os componentes do Chart.js necessários
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement // Necessário para gráficos de pizza
);

class Perfil extends Component {
    render() {
        // Dados para o gráfico de barras (similar ao da imagem de perfil)
        const barChartData = {
            labels: ['Requerimentos', 'Indicações', 'Projetos de Lei', 'Emendas'],
            datasets: [
                {
                    label: 'Quantidade',
                    data: [120, 80, 45, 20], // Dados fictícios
                    backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#F44336'], // Cores de exemplo
                    borderColor: ['#4CAF50', '#FF9800', '#2196F3', '#F44336'],
                    borderWidth: 1,
                },
            ],
        };

        const barChartOptions = {
            indexAxis: 'y', // Gráfico de barras horizontal
            responsive: true,
            height: 50,
            plugins: {
                legend: {
                    display: false, // Não mostrar a legenda se for um único dataset
                },
                title: {
                    display: false,
                    text: 'Produtividade por Tipo de Matéria',
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        };

        // Dados para o gráfico de pizza (similar ao da imagem de perfil)
        const pieChartData = {
            labels: ['Aprovadas', 'Em Tramitação', 'Arquivadas'],
            datasets: [
                {
                    data: [70, 20, 10], // Dados fictícios em porcentagem
                    backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
                    borderColor: ['#fff', '#fff', '#fff'],
                    borderWidth: 2,
                },
            ],
        };

        const pieChartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right', // Legenda à direita
                    labels: {
                        boxWidth: 20,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + '%'; // Exibe como porcentagem
                            }
                            return label;
                        }
                    }
                }
            },
        };

        return (
            <div className='profile-page-wrapper'> {/* Contêiner principal para a página */}
                <MenuDashboard /> {/* Barra lateral de navegação */}

                <div className='profile-main-content'> {/* Conteúdo principal da página */}
                    {/* Header do Perfil com Imagem e Nome */}
                    <div className='profile-header-card'>
                        <div className='profile-header-info'>
                            <img className='profile-header-img' src={ProfileImage} alt='Imagem de Perfil' />
                            <div className='profile-header-text'>
                                <h2 className='profile-header-name'>Diogo Queiroz</h2> {/* Nome do vereador */}
                                <p className='profile-header-details'>Vereador</p> {/* Cargo/Detalhes */}
                            </div>
                        </div>
                       
                    </div>

                    {/* Seções de Legislatura e Exercício Atual */}
                    <div className='profile-data-cards-container'>
                        <div className='profile-data-card'>
                            <h3>Legislatura Atual - 2023/2026</h3>
                            <div className='progress-item'>
                                <p>Sessões Plenárias: <span>85% (17/20)</span></p>
                                <div className='progress-bar-container'>
                                    <div className='progress-bar-fill' style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div className='progress-item'>
                                <p>Presença em Comissões: <span>90% (9/10)</span></p>
                                <div className='progress-bar-container'>
                                    <div className='progress-bar-fill' style={{ width: '90%', backgroundColor: '#2196F3' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className='profile-data-card'>
                            <h3>Exercício Atual - 2025</h3>
                            <div className='progress-item'>
                                <p>Proposições Apresentadas: <span>75% (30/40)</span></p>
                                <div className='progress-bar-container'>
                                    <div className='progress-bar-fill' style={{ width: '75%', backgroundColor: '#FF9800' }}></div>
                                </div>
                            </div>
                            <div className='progress-item'>
                                <p>Projetos Aprovados: <span>60% (12/20)</span></p>
                                <div className='progress-bar-container'>
                                    <div className='progress-bar-fill' style={{ width: '60%', backgroundColor: '#F44336' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Matérias */}
                    <div className='profile-section-header'>
                        <h3>Matérias</h3>
                    </div>
                    <div className='matters-list-container'>
                        {/* Exemplo de item de matéria - Repita conforme necessário */}
                        <div className='matter-item'>
                            <div className='matter-title-date'>
                                <p className='matter-type'>REQUERIMENTO - 2023/00001</p>
                                <p className='matter-description'>Solicita informações sobre a implantação de um projeto social na comunidade X.</p>
                            </div>
                            <div className='matter-status-button'>
                                <span className='matter-date'>10/05/2023</span>
                                <button className='matter-view-button'>Ver</button>
                            </div>
                        </div>
                        <div className='matter-item'>
                            <div className='matter-title-date'>
                                <p className='matter-type'>INDICAÇÃO - 2023/00005</p>
                                <p className='matter-description'>Sugere a pavimentação da Rua Y no bairro Z para melhoria da infraestrutura.</p>
                            </div>
                            <div className='matter-status-button'>
                                <span className='matter-date'>22/04/2023</span>
                                <button className='matter-view-button'>Ver</button>
                            </div>
                        </div>
                        <div className='matter-item'>
                            <div className='matter-title-date'>
                                <p className='matter-type'>PROJETO DE LEI - 2024/00010</p>
                                <p className='matter-description'>Dispõe sobre a criação do Fundo Municipal de Meio Ambiente.</p>
                            </div>
                            <div className='matter-status-button'>
                                <span className='matter-date'>01/03/2024</span>
                                <button className='matter-view-button'>Ver</button>
                            </div>
                        </div>
                        {/* Adicione mais itens de matéria aqui */}
                    </div>

                    {/* Seção de Gráficos */}
                    <div className='profile-section-header'>
                        <h3>Produtividade Detalhada</h3>
                    </div>
                    <div className='charts-container'>
                        <div className='chart-card'>
                            <h4>Produtividade por Tipo</h4>
                            <Bar data={barChartData} options={barChartOptions} />
                        </div>
                        <div className='chart-card'>
                            <h4>Status das Matérias</h4>
                            <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                    </div>

                   

                    
                </div>
            </div>
        );
    }
}

export default Perfil;