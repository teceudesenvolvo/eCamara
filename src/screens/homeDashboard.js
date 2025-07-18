import React, { Component } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement, // Importar PointElement para gráficos de linha
    LineElement,  // Importar LineElement para gráficos de linha
    Title,
    Tooltip,
    Legend,
    Filler // Importar Filler para preenchimento de área
} from 'chart.js';
import { Line } from 'react-chartjs-2'; // Mudar de Bar para Line

// Imagens (não alterado)
// Icones (não alterado)
import {
    // Adicione aqui os ícones necessários, por exemplo: FaFileAlt, FaBalanceScale, etc.
} from 'react-icons/fa';

// Components (não alterado)
import SlideFeacures from '../componets/slideFeactures'; // Componente para o carrossel de representantes

// Registrar os componentes do Chart.js necessários para um gráfico de linha
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // Registrar Filler para preenchimento de área
);

class homeDashboard extends Component {
    render() {
        // Dados de exemplo para o gráfico de produtividade (ajustado para linha)
        const data = {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Número de matérias',
                    data: [1, 2, 10, 9, 12, 18, 1, 65, 3, 2, 8, 33, 1], // Dados fictícios para cada ponto do gráfico de linha
                    borderColor: '#006400', // Cor da linha (verde escuro)
                    backgroundColor: 'rgba(0, 100, 0, 0.2)', // Cor de preenchimento da área (verde claro com transparência)
                    fill: true, // Habilita o preenchimento da área abaixo da linha
                    tension: 0.4, // Suaviza a linha do gráfico
                    pointRadius: 0, // Remove os pontos na linha para um visual mais limpo
                    pointHitRadius: 10, // Aumenta a área clicável dos pontos (mesmo invisíveis)
                },
            ],
        };

        // Opções do gráfico
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: false, // Oculta a legenda, como na imagem
                },
                title: {
                    display: false, // O título já está no H1 acima
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR').format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true, // Mantém as linhas de grade do eixo X para referência visual
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.05)' // Cor suave para as linhas de grade
                    },
                    ticks: {
                        color: '#555', // Cor dos rótulos do eixo X
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.05)' // Cor suave para as linhas de grade
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR').format(value); // Formata os números do eixo Y
                        },
                        color: '#555', // Cor dos rótulos do eixo Y
                    },
                    title: {
                        display: true,
                        text: 'Número de matérias', // Título do eixo Y
                        color: '#555',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        };

        return (
            <div className='App-header'>
                <div className='Home-Dach'>
                    {/* Cabeçalho do Balanço Legislativo */}
                    <div className='header-Dach'>
                        <div className='header-Dach-div'>
                            <h1>Balanço Legislativo</h1>
                            <select className='select-input-ano inputLogin'>
                                <option>Selecione o ano</option>
                                <option>2025</option>
                                <option>2024</option>
                                <option>2023</option>
                                {/* Adicione mais anos conforme necessário */}
                            </select>
                        </div>
                    </div>

                    {/* Cards de Métricas Superiores */}
                    <div className='balanco-metricas-top'>
                        <div className='balanco-metric-card'>
                            <p>Matérias Protocoladas</p>
                            <h2>435</h2>
                        </div>
                        <div className='balanco-metric-card'>
                            <p>Requerimentos</p>
                            <h2>297</h2>
                        </div>
                        <div className='balanco-metric-card'>
                            <p>Indicações</p>
                            <h2>12</h2>
                        </div>
                        <div className='balanco-metric-card'>
                            <p>Projetos de Lei</p>
                            <h2>54</h2>
                        </div>
                        <div className='balanco-metric-card'>
                            <p>Projetos de Resolução</p>
                            <h2>63</h2>
                        </div>
                    </div>

                    {/* Seção Nossos Representantes */}
                    

                    {/* Seção Produtividade */}
                    <div className='header-Dach'>
                        <div className='header-Dach-div'>
                            <h1>Produtividade</h1>
                        </div>
                    </div>
                    <div className='Conteiner-Home-Dach-list'>
                        {/* Gráfico de linha de produtividade */}
                        <Line height={65} data={data} options={options} />
                    </div>

                    <div className='header-Dach'>
                        <div className='header-Dach-div'>
                            <h1>Nossos Representantes</h1>
                        </div>
                    </div>
                    <div className='HomeDesktopCarrosel'>
                        {/* O componente SlideFeacures deve ser responsável por renderizar o carrossel de representantes */}
                        <SlideFeacures />
                    </div>

                </div>
            </div>
        );
    }
}

export default homeDashboard;
