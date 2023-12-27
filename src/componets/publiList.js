import React, { Component } from 'react';

//Imagen

// Icones


// Components

//mudança de páginas

class exameList extends Component {
    state = {
        publicacoes: [
            {
                id: '1',
                aviso: 'AVISO DE CANCELAMENTO ',
                date: '28/12/2022',
            },
            {
                id: '1',
                aviso: 'AVISO DE CANCELAMENTO ',
                date: '28/12/2022',
            },
            {
                id: '1',
                aviso: 'AVISO DE CANCELAMENTO ',
                date: '28/12/2022',
            },
            {
                id: '1',
                aviso: 'AVISO DE CANCELAMENTO ',
                date: '28/12/2022',
            },
        ]
    }




    render() {
        const publicacoes = this.state.publicacoes

        const listPublicacoes = publicacoes.map((publicacao) =>
            <li key={(publicacao.id)} className="favoritoItem"
                onClick={
                    () => {
                        window.location.href = "/produto"
                        // this.setState({id: aviso.id}, () => {
                        // (this.props.clickButton(this.state))
                        //   }
                    }
                }
            >
                <div className='areaTextDescProductF' >
                    <p className='valueProduct' >{publicacao.aviso}</p>
                    <p className='descricaoProduct' >{publicacao.date}</p>
                </div>
            </li>
        )


        return (
            <>
                <ul className='vistosHome'>
                    {listPublicacoes}
                </ul>
            </>

        );
    }
}

export default exameList;