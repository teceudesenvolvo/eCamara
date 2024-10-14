import React, { Component } from 'react';

//Imagen

// Icones


// Components

//mudança de páginas

class ProductsList_minhaConsultas extends Component {
    state = {
        processos: [
            {
                id: '1',
                sessao: '3ª Sessão Extraordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '27 de Dezembro de 2023',
                Legislatura: '19ª (2021 - 2024) (Atual)',
                sessaoleg: '3º (2023 - 2023) ',
                tipo: 'Sessão Extraordinária',
            },
            {
                id: '2',
                sessao: '13ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '14 de Dezembro de 2023',
                Legislatura: '19ª (2021 - 2024) (Atual)',
                sessaoleg: '3º (2023 - 2023) ',
                tipo: 'Sessão Ordinária',
            },
        ]
    }




    render() {
        const processos = this.state.processos

        const listCategories = processos.map((processo) =>
            <li key={(processo.id)} className="productItem-minhasCompras"
                onClick={
                    () => {
                        // window.location.href = "/Servico"
                        // this.setState({id: aviso.id}, () => {
                        // (this.props.clickButton(this.state))
                        //   }
                    }
                }
            >
                <div className='areaTextDescProduct-minhasCompras' >
                    <div className='descricaoProduct-minhasCompras'>
                        <p><a href='/sessao-virtual' color='blue'><b>{processo.sessao}</b></a></p>
                        <p className='status'><b>Abertura:</b> {processo.abertura}</p>
                        <p><b>Legislatura:</b> {processo.Legislatura}</p>
                        <p><b>Sessão Legislativa:</b> {processo.sessaoleg}</p>
                        <p><b>Tipo:</b> {processo.tipo}</p>
                    </div>
                    <div className='status'></div>
                </div>
            </li>
        )


        return (
            <>
                <ul className='vistosHome consultas'>
                    {listCategories}
                </ul>
            </>

        );
    }
}

export default ProductsList_minhaConsultas;