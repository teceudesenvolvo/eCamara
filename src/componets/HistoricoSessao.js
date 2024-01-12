import React, { Component } from 'react';

//Imagen

// Icones


// Components

//mudança de páginas

class vacinaList extends Component {
    state = {
        historico: [
            {
                id: '1',
                hora: '15:45',
                descricao: 'O Conselheiro Valdomiro Távora votou acompanhando divergente no processo 09144/2015-0.',
            },
            {
                id: '2',
                hora: '15:45',
                descricao: 'O Conselheiro Valdomiro Távora votou acompanhando divergente no processo 09144/2015-0.',
            },
            {
                id: '3',
                hora: '15:45',
                descricao: 'O Conselheiro Valdomiro Távora votou acompanhando divergente no processo 09144/2015-0.',
            },
            {
                id: '4',
                hora: '15:45',
                descricao: 'O Conselheiro Valdomiro Távora votou acompanhando divergente no processo 09144/2015-0.',
            },
            {
                id: '5',
                hora: '15:45',
                descricao: 'O Conselheiro Valdomiro Távora votou acompanhando divergente no processo 09144/2015-0.',
            },
        ]
    }




    render() {
        const historicos = this.state.historico
        if(historicos.length>4){
            historicos.length = 4
        }

        const listCategories = historicos.map((historico) =>
            <li key={(historico.id)} className="historicoItem"
                onClick={
                    () => {
                        // window.location.href = "/produto"
                        // this.setState({id: aviso.id}, () => {
                        // (this.props.clickButton(this.state))
                        //   }
                    }
                }
            >
                <div className='vacinaItem ' >
                    <p className='valueProduct' >{historico.hora}</p>
                    <p className='descricaoProduct' >{historico.descricao}</p>
                </div>
            </li>
        )


        return (
            <>
                <ul className='vistosHome historico-sessao-virtual'>
                    <h1>Histórico da Sessão</h1>
                    {listCategories}
                </ul>
            </>

        );
    }
}

export default vacinaList;