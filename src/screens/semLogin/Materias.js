import React, { Component } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

// Material-UI Table Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField'; // Import TextField for search input
import InputAdornment from '@mui/material/InputAdornment'; // For search icon
import Typography from '@mui/material/Typography'; // For the title
import MenuItem from '@mui/material/MenuItem';

// Icons
import SearchIcon from '@mui/icons-material/Search'; // Import a search icon

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

  render() {
    const { rows, filterText } = this.state;

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
        <div className='favoritos agendarConsulta' style={{ padding: '40px', width: '100%', maxWidth: '1200px', boxSizing: 'border-box' }}>
          <Typography variant="h4" component="h1" gutterBottom style={{ marginBottom: '30px', color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
            Matérias Legislativas
          </Typography>

          <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <TableContainer sx={{ maxHeight: 800 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {['id', 'materia', 'situacao', 'votos', 'autor', 'apresentacao', 'tramitacao', 'exercicio', 'data'].map((column) => (
                      <TableCell
                        key={column}
                        align="left"
                        style={{ backgroundColor: '#126B5E', color: '#fff', fontWeight: 'bold', fontSize: '1rem', padding: '20px' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {column.charAt(0).toUpperCase() + column.slice(1)}
                          {column !== 'votos' && (
                            selectFields.includes(column) ? (
                              <TextField
                                select
                                name={column}
                                value={filterText[column]}
                                onChange={this.handleFilterChange}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' }, backgroundColor: '#fff', borderRadius: '8px' } }}
                              >
                                <MenuItem value="">
                                  <em>Todos</em>
                                </MenuItem>
                                {getUniqueValues(column).map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
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
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <SearchIcon fontSize="small" style={{ color: '#999' }} />
                                  </InputAdornment>
                                ),
                                style: { backgroundColor: '#fff', borderRadius: '8px', fontSize: '0.875rem' }
                              }}
                              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } } }}
                            />
                            )
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.id}
                      sx={{ '&:hover': { backgroundColor: '#f9f9f9' }, cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                      <TableCell style={{ padding: '20px' }}>{row.id}</TableCell>
                      <TableCell style={{ fontWeight: '500', padding: '20px' }}>
                        <Link to={`/materias-dash/${row.id}`} style={{ textDecoration: 'none', color: '#126B5E', fontWeight: 'bold' }}>
                          {row.materia}
                        </Link>
                      </TableCell>
                      <TableCell style={{ padding: '20px' }}>{row.situacao}</TableCell>
                      <TableCell style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
                          <div className="vote-circle vote-sim-circle">{row.votoSim}</div>
                          <div className="vote-circle vote-nao-circle">{row.votoNao}</div>
                          <div className="vote-circle vote-abs-circle">{row.semVoto}</div>
                        </div>
                      </TableCell>
                      <TableCell style={{ padding: '20px' }}>{row.autor}</TableCell>
                      <TableCell style={{ padding: '20px' }}>{row.apresentacao}</TableCell>
                      <TableCell style={{ padding: '20px' }}>{row.tramitacao}</TableCell>
                      <TableCell style={{ padding: '20px' }}>{row.exercicio}</TableCell>
                      <TableCell style={{ padding: '20px' }}>{row.data}</TableCell>
                    </TableRow>
                  ))}
                  {filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" style={{ padding: '30px', color: '#666' }}>
                        Nenhuma matéria encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
    );
  }
}

export default Materias;
