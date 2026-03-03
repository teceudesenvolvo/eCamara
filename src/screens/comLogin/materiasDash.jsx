import React, { Component } from 'react';
import { FaPlus, FaFileAlt, FaCalendarAlt, FaUserTie, FaExchangeAlt, FaSearch } from 'react-icons/fa';

// Components
import MenuDashboard from '../../componets/menuDashboard.jsx';

// Dados simulados (agora com mais detalhes para os cards)
const rows = [
    { id: 1, numero: '4', materia: 'IND 4/2024', situacao: 'Em Votação', autor: 'Vereador Teste', apresentacao: 'Escrita', tramitacao: 'Ordinária', exercicio: 2024, status: 'Aguardando Presidente', data: '25/02/2024' },
    { id: 2, numero: '5', materia: 'PL 12/2024', situacao: 'Aprovado', autor: 'Vereador Teste', apresentacao: 'Escrita', tramitacao: 'Urgência', exercicio: 2024, status: 'Sancionado', data: '20/02/2024' },
    { id: 3, numero: '6', materia: 'REQ 8/2024', situacao: 'Em Análise', autor: 'Vereador Teste', apresentacao: 'Oral', tramitacao: 'Ordinária', exercicio: 2024, status: 'Comissão de Justiça', data: '18/02/2024' },
];

class loginDashboard extends Component {
    render() {
        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    
                    {/* Header da Página */}
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">Minhas Matérias</h1>
                            <p className="dashboard-header-desc">Gerencie suas proposições legislativas</p>
                        </div>
                        <button 
                            className="btn-primary" 
                            style={{ width: 'auto' }}
                            onClick={() => this.props.history.push('/protocolar-materia')}
                        >
                            <FaPlus /> Nova Matéria
                        </button>
                    </div>

                    {/* Barra de Filtros (Visual) */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text"  
                                placeholder="Buscar por número, tipo ou status..." 
                                className="search-input"
                            />
                        </div>
                        <select className="filter-select">
                            <option>Todos os Status</option>
                            <option>Em Tramitação</option>
                            <option>Aprovados</option>
                            <option>Arquivados</option>
                        </select>
                    </div>

                    {/* Grid de Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                        {rows.map((row) => (
                            <div key={row.id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#126B5E' }}>
                                            <FaFileAlt size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>{row.materia}</h3>
                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>{row.data}</span>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        padding: '5px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 'bold',
                                        background: row.status === 'Sancionado' ? '#e8f5e9' : '#fff3e0',
                                        color: row.status === 'Sancionado' ? '#2e7d32' : '#ef6c00'
                                    }}>
                                        {row.status}
                                    </span>
                                </div>

                                <div style={{ padding: '20px', flex: 1 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                            <FaUserTie style={{ color: '#aaa' }} /> 
                                            <span><strong>Autor:</strong> {row.autor}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                            <FaExchangeAlt style={{ color: '#aaa' }} /> 
                                            <span><strong>Tramitação:</strong> {row.tramitacao}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                            <FaCalendarAlt style={{ color: '#aaa' }} /> 
                                            <span><strong>Exercício:</strong> {row.exercicio}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                                    <button className="btn-secondary" style={{ width: '100%', color: '#126B5E', borderColor: '#126B5E' }}
                                    onClick={() => this.props.history.push('/materia-detalhes', { materiaId: row.id })}
                                    onMouseOver={(e) => { e.target.style.background = '#126B5E'; e.target.style.color = 'white'; }}
                                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#126B5E'; }}
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default loginDashboard;