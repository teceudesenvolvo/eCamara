import React, { Component } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

// Material-UI Table Components
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField'; // Import TextField for search input
import InputAdornment from '@mui/material/InputAdornment'; // For search icon
import Typography from '@mui/material/Typography'; // For the title
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

// Icons
import SearchIcon from '@mui/icons-material/Search'; // Import a search icon
import PageHeader from '../../componets/PageHeader';

// Data for the table
// Note: 'id' is added to each row for unique key prop in React
function createData(id, materia, situacao, votoSim, votoNao, semVoto, autor, apresentacao, tramitacao, exercicio, data, imagem) {
  return { id, materia, situacao, votoSim, votoNao, semVoto, autor, apresentacao, tramitacao, exercicio, data, imagem };
}

const rows = [
  createData('1', 'PL 542/2010', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=500&q=60'),
  createData('2', 'PL 542/2011', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Extraordinária', 2023, '10/10/2023', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=500&q=60'),
  createData('3', 'PL 542/2012', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023', 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&w=500&q=60'),
  createData('4', 'PL 542/2013', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=60'),
  createData('5', 'PL 542/2014', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023', 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=500&q=60'),
  createData('6', 'PL 542/2015', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023', 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=500&q=60'),
  createData('7', 'PL 542/2016', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=60'),
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
        <div className='openai-section'>
          <PageHeader 
            title="Matérias Legislativas" 
            onToggleFilters={this.toggleFilters} 
          />
          
          <div>
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
              <div className="openai-card" key={row.id}>
                <img src={row.imagem} alt={row.materia} className="card-image" />
                <div className="card-content-openai">
                  <span className="card-date">{row.data} • {row.situacao}</span>
                  <h3>
                    <Link to={`/materias-dash/${row.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {row.materia}
                    </Link>
                  </h3>
                  <p>{row.autor} • {row.tramitacao}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredRows.length === 0 && (
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
