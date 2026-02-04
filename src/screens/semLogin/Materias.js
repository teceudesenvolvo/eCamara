import React, { Component } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

// Material-UI Table Components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField'; // Import TextField for search input
import InputAdornment from '@mui/material/InputAdornment'; // For search icon
import Typography from '@mui/material/Typography'; // For the title
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// Icons
import SearchIcon from '@mui/icons-material/Search'; // Import a search icon
import PageHeader from '../../componets/PageHeader';

// Data for the table
// Note: 'id' is added to each row for unique key prop in React
function createData(id, materia, situacao, votoSim, votoNao, semVoto, autor, apresentacao, tramitacao, exercicio, data) {
  return { id, materia, situacao, votoSim, votoNao, semVoto, autor, apresentacao, tramitacao, exercicio, data };
}

const rows = [
  createData('1', 'PL 542/2010', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('2', 'PL 542/2011', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Extraordinária', 2023, '10/10/2023'),
  createData('3', 'PL 542/2012', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('4', 'PL 542/2013', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('5', 'PL 542/2014', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('6', 'PL 542/2015', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('7', 'PL 542/2016', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
];

class Materias extends Component {
  state = {
    rows: rows,
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
    const { rows, filterText, showFilters } = this.state;

    // Filter the rows array based on the search term
    const filteredRows = rows.filter((row) => {
      return Object.keys(filterText).every(key => {
        const rowValue = String(row[key]).toLowerCase();
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
        <div className='favoritos agendarConsulta' style={{ padding: '0 40px 40px 40px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <PageHeader 
            title="Matérias Legislativas" 
            onToggleFilters={this.toggleFilters} 
          />
          
          <div style={{ marginTop: '100px', marginLeft: '60px' }}>
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

          <Grid container spacing={3} justifyContent="flex-start">
            {filteredRows.map((row) => (
              <Grid item xs={12} sm={6} md={4} key={row.id}>
                <Card elevation={3} sx={{ height: '100%', borderRadius: '12px', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                  <CardContent sx={{ textAlign: 'left', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        <Link to={`/materias-dash/${row.id}`} style={{ textDecoration: 'none', color: '#126B5E', fontWeight: 'bold' }}>
                          {row.materia}
                        </Link>
                      </Typography>
                      <Chip label={row.situacao} size="small" sx={{ backgroundColor: '#e0f2f1', color: '#00695c', fontWeight: 'bold' }} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Autor:</strong> {row.autor}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Apresentação:</strong> {row.apresentacao}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Tramitação:</strong> {row.tramitacao}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Data:</strong> {row.data} ({row.exercicio})
                    </Typography>

                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                      <Typography variant="caption" display="block" sx={{ mb: 1, color: '#888' }}>Votação:</Typography>
                      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
                        <div className="vote-circle vote-sim-circle" title="Sim">{row.votoSim}</div>
                        <div className="vote-circle vote-nao-circle" title="Não">{row.votoNao}</div>
                        <div className="vote-circle vote-abs-circle" title="Abstenção">{row.semVoto}</div>
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {filteredRows.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                  Nenhuma matéria encontrada.
                </Typography>
              </Grid>
            )}
          </Grid>
          </div>
        </div>
      </div>
    );
  }
}

export default Materias;
