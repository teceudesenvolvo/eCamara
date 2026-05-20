import React, { Component } from 'react';

// Material-UI Table Components
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField'; // Import TextField for search input
import InputAdornment from '@mui/material/InputAdornment'; // For search icon
import Typography from '@mui/material/Typography'; // For the title
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

// Icons
import SearchIcon from '@mui/icons-material/Search'; // Import a search icon
import PageHeader from '../../componets/PageHeader.jsx';
import { FaSpinner } from 'react-icons/fa';

// Firebase
import api from '../../services/api.js';

class Materias extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      loading: true,
      camaraId: this.props.match.params.camaraId || '',
      filterText: {
        id: '',
        materia: '',
        situacao: '',
        autor: '',
        apresentacao: '',
        tramitacao: '',
        exercicio: '',
        data: '',
      },
      showFilters: true,
      activeTab: 'todas', // 'todas' ou o tipo da matéria
    };
  }

  componentDidMount() {
    this.fetchMaterias();
  }

  fetchMaterias = async () => {
    const { camaraId } = this.state;
    if (!camaraId) return;

    try {
      const response = await api.get(`/legislative-matters/${camaraId}`);
      const data = response.data || [];
      
      const fetchedRows = data.map((val) => ({
        camaraId: camaraId,
        id: val.id,
        materia: `${val.tipoMateria || 'Matéria'} ${val.numero || ''}/${val.ano || ''}`,
        tituloCompleto: val.titulo || val.ementa || 'Sem título',
        situacao: val.status || 'Tramitando',
        autor: val.autor || 'Desconhecido',
        apresentacao: val.tipoApresentacao || 'Escrita',
        tramitacao: val.regTramita || 'Ordinária',
        exercicio: val.ano || '',
        tipoMateria: val.tipoMateria || 'Matéria',
        createdAt: val.createdAt,
        data: val.dataApresenta || (val.createdAt ? new Date(val.createdAt).toLocaleDateString('pt-BR') : ''),
        linkId: val.id
      }));

      // Ordena por data de criação (mais recentes primeiro)
      fetchedRows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).reverse();

      this.setState({ rows: fetchedRows, loading: false });

    } catch (error) {
      console.error("Erro ao buscar matérias:", error);
      this.setState({ loading: false });
    }
  };

  extractKeyword = (text) => {
    if (!text) return 'camara';
    const keywords = ['saúde', 'educação', 'transporte', 'obras', 'cultura', 'esporte', 'meio ambiente', 'finanças', 'segurança', 'pavimentação', 'homenagem', 'escola', 'hospital', 'turismo'];
    const lowerText = text.toLowerCase();
    
    for (let k of keywords) {
      if (lowerText.includes(k)) return k.replace(' ', ',');
    }
    return 'legislativo';
  }

  // Handler for search input changes
  handleFilterChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      filterText: {
        ...prevState.filterText,
        [name]: value,
      },
    }));
  };

  toggleFilters = () => {
    this.setState(prevState => ({ showFilters: !prevState.showFilters }));
  };

  // Helper function to get unique matter types for tabs
  getUniqueMatterTypesForTabs = () => {
    const { rows } = this.state;
    const types = new Set(rows.map(item => item.tipoMateria).filter(Boolean));
    return ['todas', ...Array.from(types).sort()];
  };
  render() {
    const { rows, filterText, showFilters, loading, camaraId, activeTab } = this.state;

    // Filter the rows array based on the search term
    const filteredRows = rows.filter((row) => {
      const matchesSearch = Object.keys(filterText).every(key => {
        const rowValue = String(row[key] || '').toLowerCase();
        const filterValue = String(filterText[key] || '').toLowerCase();
        return rowValue.includes(filterValue);
      });

      const matchesTab = activeTab === 'todas' || (row.tipoMateria || '').toLowerCase() === activeTab.toLowerCase();

      return matchesSearch && matchesTab;
    });

    // Helper function to get unique values for select options
    const getUniqueValues = (key) => {
      return [...new Set(rows.map(item => item[key]))].filter(Boolean).sort();
    };

    const selectFields = ['autor', 'apresentacao', 'tramitacao', 'exercicio', 'data'];

    const uniqueMatterTypesForTabs = this.getUniqueMatterTypesForTabs();

    return (
      <div className='App-header-modern'>
        <div className='home-content-wrapper' style={{ gap: '30px' }}>
          
          
          <div>
          {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <FaSpinner className="animate-spin" size={30} color="#126B5E" />
              </div>
          )}

          {!loading && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
              <div style={{ 
                display: 'flex', 
                background: 'rgba(255, 255, 255, 0.4)', 
                borderRadius: '30px', 
                padding: '5px', 
                backdropFilter: 'blur(20px)', 
                border: '1px solid rgba(255,255,255,0.6)', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                overflowX: 'auto',
                maxWidth: '100%',
                marginBottom: '70px',
                scrollbarWidth: 'none' // Esconde scrollbar no Firefox
              }}>
                {uniqueMatterTypesForTabs.map(type => {
                  const isActive = activeTab === type;
                  return (
                    <button
                      key={type}
                      onClick={() => this.setState({ activeTab: type })}
                      style={{
                        background: isActive ? '#fff' : 'transparent',
                        color: isActive ? '#1a1a1a' : '#555',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '12px 24px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {type === 'todas' ? 'Todas' : type}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="search-box-wrapper-openai" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: 'none', marginBottom: '10px', padding: '10px 5px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
              {['materia', 'situacao', 'autor', 'apresentacao', 'tramitacao', 'exercicio', 'data'].map((column, index, array) => (
                <div key={column} style={{ flex: '1 1 calc(25% - 10px)', minWidth: '200px', borderRight: (index + 1) % 4 !== 0 && index !== array.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none', padding: '5px 15px' }}>
                  {selectFields.includes(column) ? (
                    <TextField
                      select
                      name={column}
                      value={filterText[column]}
                      onChange={this.handleFilterChange}
                      variant="outlined"
                      size="small"
                      fullWidth
                      label={column.charAt(0).toUpperCase() + column.slice(1)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: 'transparent', '& fieldset': { border: 'none' } }, '& .MuiInputLabel-root': { fontSize: '0.75rem', color: '#777' } }}
                    >
                      <MenuItem value=""><em>{column.charAt(0).toUpperCase() + column.slice(1)}: Todos</em></MenuItem>
                      {getUniqueValues(column).map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      name={column}
                      value={filterText[column]}
                      onChange={this.handleFilterChange}
                      placeholder={column.charAt(0).toUpperCase() + column.slice(1)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: 'transparent', '& fieldset': { border: 'none' } } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" style={{ color: '#bbb' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </div>
              ))}
          </div>
          <h1 style={{ marginBottom: '0px', color: '#333', textAlign: 'left', marginTop: '30px' }}>Matérias Legislativas</h1>  

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}></div>

          
          <div className="modern-grid">
            {filteredRows.map((row) => (
              <div className="glass-card" key={row.id} onClick={() => this.props.history.push(`/materia/${row.camaraId}/${row.id}`)} style={{ cursor: 'pointer', padding: '24px' }}>
                
                <div className="card-content-modern">
                  <span className="card-tag">{row.data} • {row.situacao}</span>
                  <h3 className="card-title-modern">
                    {row.materia}
                  </h3>
                  <p className="card-desc-modern" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {row.tituloCompleto}
                  </p>
                  <p style={{ color: '#888', fontSize: '0.85rem', fontWeight: 600, marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    {row.autor} • {row.tramitacao}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {!loading && filteredRows.length === 0 && (
            <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
              Nenhuma matéria encontrada.
            </Typography>
          )}
          </div>
        </div>
      </div>
    );
  }
}

export default Materias;