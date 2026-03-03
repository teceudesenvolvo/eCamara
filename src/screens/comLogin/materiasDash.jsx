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

                <div className="dashboard-content" style={{ marginLeft: '85px', width: '100%', padding: '40px', boxSizing: 'border-box', minHeight: '100vh' }}>
                    
                    {/* Header da Página */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'left', textAlign: 'left', marginBottom: '40px' }}>
                        <div>
                            <h1 style={{ color: '#126B5E', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Minhas Matérias</h1>
                            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Gerencie suas proposições legislativas</p>
                        </div>
                        <button 
                            className="btn-protocolar-final" 
                            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px' }}
                            onClick={() => this.props.history.push('/protocolar-materia')}
                        >
                            <FaPlus /> Nova Matéria
                        </button>
                    </div>

                    {/* Barra de Filtros (Visual) */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input 
                                type="text"  
                                placeholder="Buscar por número, tipo ou status..." 
                                style={{ width: '94%', padding: '12px 12px 12px 45px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }}
                            />
                        </div>
                        <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#555', width: '20%', height: '45px' }}>
                            <option>Todos os Status</option>
                            <option>Em Tramitação</option>
                            <option>Aprovados</option>
                            <option>Arquivados</option>
                        </select>
                    </div>

                    {/* Grid de Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                        {rows.map((row) => (
                            <div key={row.id} style={{ 
                                background: 'white', 
                                borderRadius: '16px', 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
                                overflow: 'hidden',
                                transition: 'transform 0.2s ease',
                                border: '1px solid #eee',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
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
                                    <button style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #126B5E', 
                                        background: 'transparent', 
                                        color: '#126B5E', 
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
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