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
import { db } from '../../firebaseConfig';
import { ref, get, query, orderByChild } from 'firebase/database';

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
      showFilters: false,
    };
  }

  componentDidMount() {
    this.fetchMaterias();
  }

  fetchMaterias = async () => {
    const { camaraId } = this.state;
    if (!camaraId) return;

    try {
      const materiasRef = ref(db, `${camaraId}/materias`);
      const q = query(materiasRef, orderByChild('createdAt'));
      const snapshot = await get(q);
      const fetchedRows = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const val = child.val();
          // Gera imagem baseada no contexto (Título ou Ementa)
          const keyword = this.extractKeyword(val.titulo || val.ementa || 'lei');
          
          fetchedRows.push({
            camaraId: camaraId, // Importante para o link
            id: child.key,
            materia: `${val.tipoMateria || 'Matéria'} ${val.numero || ''}/${val.ano || ''}`,
            tituloCompleto: val.titulo || val.ementa || 'Sem título',
            situacao: val.status || 'Tramitando',
            autor: val.autor || 'Desconhecido',
            apresentacao: val.tipoApresentacao || 'Escrita',
            tramitacao: val.regTramita || 'Ordinária',
            exercicio: val.ano || '',
            data: val.dataApresenta || new Date(val.createdAt).toLocaleDateString('pt-BR'),
            linkId: child.key
          });
        });
      }

      // Reverte para mostrar as mais recentes primeiro
      this.setState({ rows: fetchedRows.reverse(), loading: false });

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

  render() {
    const { rows, filterText, showFilters, loading, camaraId } = this.state;

    // Filter the rows array based on the search term
    const filteredRows = rows.filter((row) => {
      return Object.keys(filterText).every(key => {
        const rowValue = String(row[key] || '').toLowerCase();
        const filterValue = filterText[key].toLowerCase();
        return rowValue.includes(filterValue);
      });
    });

    // Helper function to get unique values for select options
    const getUniqueValues = (key) => {
      return [...new Set(rows.map(item => item[key]))].filter(Boolean).sort();
    };

    const selectFields = ['autor', 'apresentacao', 'tramitacao', 'exercicio', 'data'];

    return (
      <div className='App-header'>
        <div className='openai-section'>
          <PageHeader 
            title="Matérias Legislativas" 
            onToggleFilters={this.toggleFilters} 
          />
          
          <div>
          
          {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <FaSpinner className="animate-spin" size={30} color="#126B5E" />
              </div>
          )}

          {showFilters && (
            <Box sx={{ mb: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Grid container spacing={2}>
                {['materia', 'situacao', 'autor', 'apresentacao', 'tramitacao', 'exercicio', 'data'].map((column) => (
                  <Grid item xs={12} sm={6} md={3} key={column}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <Typography variant="caption" style={{ fontWeight: 'bold', color: '#555' }}>
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                      </Typography>
                      {selectFields.includes(column) ? (
                        <TextField
                          select
                          name={column}
                          value={filterText[column]}
                          onChange={this.handleFilterChange}
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ bgcolor: '#fff' }}
                        >
                          <MenuItem value=""><em>Todos</em></MenuItem>
                          {getUniqueValues(column).map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          name={column}
                          value={filterText[column]}
                          onChange={this.handleFilterChange}
                          placeholder={`Buscar...`}
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ bgcolor: '#fff' }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" style={{ color: '#999' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <div className="openai-grid">
            {filteredRows.map((row) => (
              <div className="openai-card" key={row.id} onClick={() => this.props.history.push(`/materia/${row.camaraId}/${row.id}`)} style={{ cursor: 'pointer' }}>
                
                <div className="card-content-openai">
                  <span className="card-date">{row.data} • {row.situacao}</span>
                  <h3>
                    {row.materia}
                  </h3>
                  <p style={{fontSize: '0.9rem', marginBottom: '10px', color: '#555', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                    {row.tituloCompleto}
                  </p>
                  <p>{row.autor} • {row.tramitacao}</p>
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