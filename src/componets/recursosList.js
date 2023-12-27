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
                data: '31/01/2023 17:17',
                lote: '003',
                fornecedor: '27.975.551/0001-27',
                dataLimiteRecurso: '31/01/2023 17:17',
                dataLimiteContraRazao: '31/01/2023 17:17',
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
                    <p className='descricaoProduct' >{esclarecimento.data}</p> 
                    <p className='descricaoProduct' >{esclarecimento.lote}</p> 
                    <p className='descricaoProduct' >{esclarecimento.fornecedor}</p> 
                    <p className='descricaoProduct' ><b>Data Limite (Recurso):</b> {esclarecimento.dataLimiteRecurso}</p> 
                    <p className='descricaoProduct' ><b>Data Limite (Contra-Razão):</b>{esclarecimento.dataLimiteContraRazao}</p>
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