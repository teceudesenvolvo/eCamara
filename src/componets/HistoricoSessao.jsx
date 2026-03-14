import React, { Component } from 'react';

//Imagen

// Icones


// Components

//mudança de páginas

const HistoricoSessao = ({ sessao }) => {
    if (!sessao) {
        return null;
    }

    // Calculate stats from the materias in the session
    const getStatusCount = (status) => {
        if (!sessao.itens) return 0;
        return sessao.itens.filter(item => item.status === status).length;
    }

    const stats = {
        votadas: getStatusCount('Aprovado') + getStatusCount('Rejeitado'),
        sobrestadas: getStatusCount('Sobrestado'),
        retiradas: getStatusCount('Retirado de Pauta'),
        destacadas: getStatusCount('Destaque'),
        impedidas: getStatusCount('Impedido'),
        suspeitas: getStatusCount('Suspeição'),
        vista: getStatusCount('Vista'),
    };

    return (
        <ul className='vistosHome historico-sessao-virtual'>
            <li className="historicoItem">
                <div className='vacinaItem'>
                    <p className='titleHistorico'>Resumo da Sessão</p>
                    <p className='descricaoHistorico'>
                        <span>Matérias Votadas:</span>
                        <b className='historico-numero'>{stats.votadas}</b>
                    </p>
                    <p className='descricaoHistorico'>
                        <span>Matérias Sobrestadas:</span>
                        <b className='historico-numero'>{stats.sobrestadas}</b>
                    </p>
                    <p className='descricaoHistorico'>
                        <span>Matérias Retiradas de Pauta:</span>
                        <b className='historico-numero'>{stats.retiradas}</b>
                    </p>
                    <p className='descricaoHistorico'>
                        <span>Matérias Destacadas:</span>
                        <b className='historico-numero'>{stats.destacadas}</b>
                    </p>
                    <p className='descricaoHistorico'>
                        <span>Matérias com Impedimento:</span>
                        <b className='historico-numero'>{stats.impedidas}</b>
                    </p>
                    <p className='descricaoHistorico'>
                        <span>Matérias com Suspeição:</span>
                        <b className='historico-numero'>{stats.suspeitas}</b>
                    </p>
                    <p className='descricaoHistorico'>
                        <span>Matérias em Vista:</span>
                        <b className='historico-numero'>{stats.vista}</b>
                    </p>
                </div>
            </li>
        </ul>
    );
}

export default HistoricoSessao;
