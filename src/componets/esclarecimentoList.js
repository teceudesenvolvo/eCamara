import React, { Component } from 'react';

//Imagen

// Icones


// Components

//mudança de páginas

class receitaList extends Component {
    state = {
        esclarecimentos: [
            {
                id: '1',
                pregao: '003-2023',
                nome: 'Horizonte Distribuidora',
                doc: '27.975.551/0001-27',
                email: 'prevenda@vanguardadf.com.br',
                data: '31/01/2023 17:17',
                resposta: 'NÃO',
            },

        ]
    }




    render() {
        const esclarecimentos = this.state.esclarecimentos

        const listCategories = esclarecimentos.map((esclarecimento) =>
            <li key={(esclarecimento.id)} className="favoritoItem vacinaItem"
                onClick={
                    () => {
                        // window.location.href = "/produto"
                        // this.setState({id: aviso.id}, () => {
                        // (this.props.clickButton(this.state))
                        //   }
                    }
                }
            >
                <div className='areaTextDescProductF vacinaItem receitaItem' >
                    <p className='valueProduct' >{esclarecimento.pregao}</p>
                    <p className='descricaoProduct' >{esclarecimento.nome}</p> 
                    <p className='descricaoProduct' >{esclarecimento.doc}</p> 
                    <p className='descricaoProduct' >{esclarecimento.email}</p> 
                    <p className='descricaoProduct' >{esclarecimento.data}</p> 
                    <p className='descricaoProduct' >{esclarecimento.resposta}</p>
                    {/* <button className='buttonLogin btnExame'>Ver</button>                   */}
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

export default receitaList;