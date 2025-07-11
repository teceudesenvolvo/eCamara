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

// Icons
import SearchIcon from '@mui/icons-material/Search'; // Import a search icon

// Data for the table
// Note: 'id' is added to each row for unique key prop in React
function createData(id, materia, situacao, votoSim, votoNao, semVoto, autor, apresentacao, tramitacao, exercicio, data) {
  return { id, materia, situacao, votoSim, votoNao, semVoto, autor, apresentacao, tramitacao, exercicio, data };
}

const initialRows = [
  createData('1', 'PL 542/2010', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('2', 'PL 542/2011', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Extraordinária', 2023, '10/10/2023'),
  createData('3', 'PL 542/2012', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('4', 'PL 542/2013', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('5', 'PL 542/2014', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('6', 'PL 542/2015', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
  createData('7', 'PL 542/2016', 'Em votação', 0, 10, 5, 'Promovente', 'Escrita', 'Ordinária', 2023, '10/10/2023'),
];

class Notificacoes extends Component {
  state = {
    searchTerm: '', // State for the search input
    rows: initialRows, // Use initialRows for the table data
  };

  // Handler for search input changes
  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  render() {
    const { searchTerm, rows } = this.state;

    // Filter the rows array based on the search term
    const filteredRows = rows.filter((row) => {
      // Convert all values to string and lowercase for case-insensitive search
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return (
      <div className='App-header'>
        <div className='favoritos agendarConsulta' style={{ padding: '20px' }}>
          <Typography variant="h5" component="h1" gutterBottom style={{ marginBottom: '20px' }}>
            Matérias Legislativas
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pesquisar Matéria"
            value={searchTerm}
            onChange={this.handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, borderRadius: '8px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />

          <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Table sx={{ minWidth: 650 }} aria-label="matérias legislativas table">
              <TableHead sx={{ backgroundColor: '#e0e5e9' }}>
                <TableRow>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: '#333' }}>ID</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: '#333' }}>Matéria</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: '#333' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333' }}>Votos</TableCell> {/* Combined Votos column */}
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: '#333' }}>Promovente</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: '#333' }}>Apresentação</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: '#333' }}>Regime da Tramitação</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: '#333' }}>Exercício</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'bold', color: '#333' }}>Votação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f8f9fa' } }}
                  >
                    <TableCell align="left">{row.id}</TableCell> {/* Use row.id for ID column */}
                    <TableCell align="left">
                      {/* Added Link component for navigation */}
                      <Link to={`/materias-dash/${row.id}`} style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
                        {row.materia}
                      </Link>
                    </TableCell>
                    <TableCell align="left">{row.situacao}</TableCell>
                    <TableCell align="center">
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                        {/* Voto Sim (Grey circle) */}
                        <div style={{
                          backgroundColor: '#e0e0e0', // Grey color
                          color: '#333',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.9em'
                        }}>
                          {row.votoSim}
                        </div>
                        {/* Voto Não (Green circle) */}
                        <div style={{
                          backgroundColor: '#a8e6cf', // Light green color
                          color: '#333',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.9em'
                        }}>
                          {row.votoNao}
                        </div>
                        {/* Sem Voto / Branco (Red circle) */}
                        <div style={{
                          backgroundColor: '#ffadad', // Light red color
                          color: '#333',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.9em'
                        }}>
                          {row.semVoto}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align="left">{row.autor}</TableCell> {/* Promovente */}
                    <TableCell align="left">{row.apresentacao}</TableCell>
                    <TableCell align="left">{row.tramitacao}</TableCell> {/* Regime da Tramitação */}
                    <TableCell align="left">{row.exercicio}</TableCell>
                    <TableCell align="left">{row.data}</TableCell> {/* Votação */}
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Nenhuma matéria encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    );
  }
}

export default Notificacoes;
