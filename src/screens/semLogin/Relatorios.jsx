import React, { Component } from 'react';

// Removido os componentes de ícone, pois o menu sidebar foi removido.

class Relatórios extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Dados simulados para as matérias. Em um cenário real, isso viria de uma API.
      materials: [
        {
          id: 'PL542/2010',
          code: 'PL 542/2010',
          ementa: 'DENOMINA RUA FRANCISCO FERNANDES DE OLIVEIRA O LOGRADOURO PÚBLICO INOMINADO: TRAVESSA DA RUA OTELO AUGUSTO RIBEIRO, ALTURA DO Nº 1158, GUAMANASES.',
          observations: 'FASE DA DISCUSSÃO: 2°',
          promoter: 'SENIVAL MOURA',
          voteDetails: {
            majority: 'Maioria Simples',
            yes: 41,
            no: 1,
            abs: 0,
            plFls: 0,
            total: 42,
          },
          status: 'Aprovado', // 'Aprovado', 'Rejeitado', 'Pendente', etc.
        },
        {
          id: 'REQ123/2023',
          code: 'REQ 123/2023',
          ementa: 'REQUERIMENTO PARA IMPLANTAÇÃO DE POSTO DE SAÚDE NO BAIRRO ALTO ALEGRE.',
          observations: 'Aguardando parecer da comissão de saúde.',
          promoter: 'Vereador João Silva',
          voteDetails: {
            majority: 'Maioria Simples',
            yes: 30,
            no: 10,
            abs: 2,
            plFls: 0,
            total: 42,
          },
          status: 'Aprovado',
        },
        {
          id: 'PDL005/2024',
          code: 'PDL 005/2024',
          ementa: 'PROJETO DE DECRETO LEGISLATIVO QUE CONCEDE TÍTULO DE CIDADÃO HONORÁRIO AO SR. ANTONIO CARLOS PEREIRA.',
          observations: 'Em fase de discussão inicial.',
          promoter: 'Vereadora Maria Souza',
          voteDetails: {
            majority: 'Maioria Qualificada (2/3)',
            yes: 25,
            no: 15,
            abs: 2,
            plFls: 0,
            total: 42,
          },
          status: 'Pendente', // Um exemplo de status diferente
        },
      ],
    };
  }

  // Se você quiser carregar os dados de uma API, pode usar componentDidMount
  /*
  componentDidMount() {
    this.fetchMaterials();
  }

  fetchMaterials = async () => {
    try {
      // const response = await fetch('/api/materials');
      // const data = await response.json();
      // this.setState({ materials: data });
      // Ou use os dados mockados temporariamente aqui também
    } catch (error) {
      console.error("Erro ao buscar matérias:", error);
    }
  };
  */

  render() {
    const { materials } = this.state; // Desestrutura materials do estado

    return (
      <div className='app-container'>
        {/* Main Content */}
        <div className='main-content'>
          {/* Header - Removido conforme sua instrução anterior. Se precisar de um, reintroduza aqui. */}
          {/* <header className='header'>
            <img src="/câmara_municipal_logo.png" alt="Câmara Municipal Logo" className="logo" />
          </header> */}

          {/* Session and Filter Section */}
          <div className='filter-section'>
            <div className='session-selector'>
              <select>
                <option>Selecionar Sessão</option>
                {/* Add more options here */}
              </select>
            </div>
            <div className='status-indicators'>
              <div className='status-item gray'>0</div>
              <div className='status-item green'>10</div>
              <div className='status-item red'>5</div>
              <div className='status-text'>Finalizada</div>
              <div className='status-text'>Ordinária</div>
              <div className='status-text'>2023</div>
              <div className='status-text'>10/10/2023</div>
            </div>
          </div>

          {/* Materials Section */}
          <div className='materials-section'>
            <h2>Matérias</h2>
            {/* Mapeia sobre o array 'materials' no estado para renderizar cada card */}
            {materials.map((material) => (
              <div className='material-card' key={material.id}>
                {/* Note que no seu JSX original para "material-card" havia um "material-description"
                    que continha o "material-code" e um "material-details" separado com o "<p>".
                    Ajustei isso para ser mais lógico, com "material-details" contendo ambos.
                    Ajuste o seu CSS se a estrutura não corresponder exatamente ao que você espera.
                */}
                <div className='material-details'> {/* Contém o código e a descrição */}
                  <a href={`/materia/${material.id}`} className='material-code'>
                    {material.code}
                  </a>
                  <p className='material-description'>
                    {material.ementa}
                    <br />
                    OBSERVAÇÕES: {material.observations}
                    <br />
                    PROMOVENTE: {material.promoter}
                  </p>
                </div>

                <div className='vote-summary'>
                  <p>{material.voteDetails.majority}</p>
                  <p>Sim: {material.voteDetails.yes}</p>
                  <p>Não: {material.voteDetails.no}</p>
                  <p>Abs: {material.voteDetails.abs}</p>
                  <p>PL_Fls: {material.voteDetails.plFls}</p>
                  <p>Total: {material.voteDetails.total}</p>
                </div>

                <div className='voting-results'>
                  <div className='vote-actions'>
                    {/* A classe 'button-aprovado' é usada. Para status diferentes,
                        você precisaria de classes adicionais no seu CSS,
                        ex: .button-pendente, .button-rejeitado, e aplicá-las condicionalmente.
                        Ex: className={`button-aprovado ${material.status === 'Pendente' ? 'button-pendente' : ''}`}
                    */}
                    <button
                      className={`button-aprovado ${material.status === 'Pendente' ? 'button-pendente' : ''}`}
                      disabled={material.status === 'Pendente'}
                    >
                      {material.status}
                    </button>
                    <a href={`/votos/${material.id}`} className='link-ver-votos'>
                      Ver votos
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Relatórios;