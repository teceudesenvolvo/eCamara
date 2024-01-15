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
                sessao: '11ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                votadas: `34`,
                sobrestadas: '21',
                retiradas: '1',
                destacadas: '5',
                impedidas: '2',
                suspeitas: '0',
                vista: '10',

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
                    <p className='titleHistorico' >{historico.sessao}</p>
                    <p className='descricaoHistorico' >Matérias Votadas: <b>{historico.votadas}</b></p>
                    <p className='descricaoHistorico' >Matérias Sobrestadas: <b>{historico.sobrestadas}</b></p>
                    <p className='descricaoHistorico' >Matérias Retiras de Pauta: <b>{historico.retiradas}</b></p>
                    <p className='descricaoHistorico' >Matérias Destacadas: <b>{historico.destacadas}</b></p>
                    <p className='descricaoHistorico' >Matérias com Impedimento: <b>{historico.impedidas}</b></p>
                    <p className='descricaoHistorico' >Matérias com suspeição: <b>{historico.suspeitas}</b></p>
                    <p className='descricaoHistorico' >Matérias em vista: <b>{historico.vista}</b></p>
                </div>
            </li>
        )


        return (
            <>
                <ul className='vistosHome historico-sessao-virtual'>
                    
                    {listCategories}
                </ul>
            </>

        );
    }
}

export default vacinaList;