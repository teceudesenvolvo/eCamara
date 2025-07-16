import React, { Component } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Imagens (não alterado)
// Icones (não alterado)
import {
    // Adicione aqui os ícones necessários, por exemplo: FaFileAlt, FaBalanceScale, etc.
} from 'react-icons/fa';

// Components (não alterado)
import SlideFeacures from '../componets/slideFeactures'; // Componente para o carrossel de representantes

// Registrar os componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

class homeDashboard extends Component {
    render() {
        // Dados de exemplo para o gráfico de produtividade
        const data = {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Quantidade de Matérias',
                    data: [65, 59, 80, 81, 56, 55, 40, 60, 75, 70, 85, 90], // Dados fictícios para cada mês
                    backgroundColor: 'rgb(255, 124, 1)', // Cor laranja do balanço legislativo
                    borderColor: 'rgba(255, 123, 0, 1)',
                    borderWidth: 1,
                    borderRadius: 12,
                },
            ],
        };

        // Opções do gráfico
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false, // O título já está no H1 acima
                    text: 'Produtividade Mensal',
                },
                tooltip: {
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
                        display: false // Remove as linhas de grade do eixo X
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR').format(value); // Formata os números do eixo Y
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
                    <div className='header-Dach'>
                        <div className='header-Dach-div'>
                            <h1>Nossos Representantes</h1>
                        </div>
                    </div>
                    <div className='HomeDesktopCarrosel'>
                        {/* O componente SlideFeacures deve ser responsável por renderizar o carrossel de representantes */}
                        <SlideFeacures />
                    </div>

                    {/* Seção Produtividade */}
                    <div className='header-Dach'>
                        <div className='header-Dach-div'>
                            <h1>Produtividade</h1>
                        </div>
                    </div>
                    <div className='Conteiner-Home-Dach-list'>
                        {/* Gráfico de barras de produtividade */}
                        <Bar data={data} options={options} />
                    </div>

                </div>
            </div>
        );
    }
}

export default homeDashboard;