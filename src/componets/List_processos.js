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
                unidade: 'SEAF',
                modalidade: 'Pregão Eletrônico',
                edital: '014-2023 - REPUBLICADO',
                objeto: 'Registro de Preços para eventual e futura contratação de empresa especializada para aquisição de Aparelhos de Ar Condicionado destinados a atender as necessidades das diversas secretarias da Prefeitura Municipal de Presidente Dutra - MA.',
                abertura: '12/06/2023 09:00',
                situacao: 'Acolhimento de Propostas',
            },
            {
                id: '2',
                unidade: 'SMAS',
                modalidade: 'Pregão Eletrônico',
                edital: '012-2023 - REPUBLICADO',
                objeto: 'Registro de preços para eventual e futura contratação de empresa especializada no fornecimento de urnas funerárias, vestimentas e prestação de serviços de translado e formalização para atender a demanda da Secretaria Municipal de Assistência Social de Presidente Dutra-MA.',
                abertura: '31/05/2023 09:00',
                situacao: 'Suspenso',
            },
        ]
    }




    render() {
        const processos = this.state.processos

        const listCategories = processos.map((processo) =>
            <li key={(processo.id)} className="productItem-minhasCompras"
                onClick={
                    () => {
                        window.location.href = "/Servico"
                        // this.setState({id: aviso.id}, () => {
                        // (this.props.clickButton(this.state))
                        //   }
                    }
                }
            >
                <div className='areaTextDescProduct-minhasCompras' >
                    <div className='descricaoProduct-minhasCompras'>
                        <p><b>{processo.unidade}</b></p>
                        <p className='status'>{processo.modalidade}</p>
                        <p>{processo.edital}</p>
                        <p>{processo.objeto}</p>
                        <p>{processo.abertura}</p>
                        <p><b>{processo.situacao}</b></p>
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