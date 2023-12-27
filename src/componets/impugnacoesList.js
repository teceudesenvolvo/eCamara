import React, { Component } from 'react';

//Imagen

// Icones


// Components

//mudança de páginas

class vacinaList extends Component {
    state = {
        impulgnacoes: [
            {
                id: '1',
                pregao: '014-2023 - REPUBLICADO',
                nome: 'VANGUARDA INFORMATICA LTDA',
                doc: '36.521.392/0001-81',
                email: 'producao@sandieoliveira.adv.br',
                data: '16/05/2023 16:35',
                resposta: 'SIM'
            },
            {
                id: '1',
                pregao: '014-2023 - REPUBLICADO',
                nome: 'VANGUARDA INFORMATICA LTDA',
                doc: '36.521.392/0001-81',
                email: 'producao@sandieoliveira.adv.br',
                data: '16/05/2023 16:35',
                resposta: 'SIM'
            },{
                id: '1',
                pregao: '014-2023 - REPUBLICADO',
                nome: 'VANGUARDA INFORMATICA LTDA',
                doc: '36.521.392/0001-81',
                email: 'producao@sandieoliveira.adv.br',
                data: '16/05/2023 16:35',
                resposta: 'SIM'
            },
        ]
    }




    render() {
        const impulgnacoes = this.state.impulgnacoes

        const listCategories = impulgnacoes.map((impulgnacao) =>
            <li key={(impulgnacao.id)} className="favoritoItem vacinaItem"
                onClick={
                    () => {
                        window.location.href = "/produto"
                        // this.setState({id: aviso.id}, () => {
                        // (this.props.clickButton(this.state))
                        //   }
                    }
                }
            >
                <div className='areaTextDescProductF vacinaItem' >
                    <p className='valueProduct' >{impulgnacao.pregao}</p>
                    <p className='descricaoProduct' >{impulgnacao.nome}</p>
                    <p className='descricaoProduct' >{impulgnacao.doc}</p>
                    <p className='descricaoProduct' >{impulgnacao.email}</p>
                    <p className='descricaoProduct' >{impulgnacao.data}</p>
                    <p className='descricaoProduct' >{impulgnacao.resposta}</p>
                </div>
            </li>
        )


        return (
            <>
                <ul className='vistosHome'>
                    {listCategories}
                </ul>
            </>

        );
    }
}

export default vacinaList;