import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { FaBalanceScale, FaMoneyBillWave, FaHardHat, FaGraduationCap, FaHeartbeat } from 'react-icons/fa';
import '../App.css';

const committees = [
    { id: 1, name: 'Constituição e Justiça', icon: <FaBalanceScale />, desc: 'Analisa a legalidade e constitucionalidade dos projetos.' },
    { id: 2, name: 'Finanças e Orçamento', icon: <FaMoneyBillWave />, desc: 'Fiscaliza as contas e o orçamento municipal.' },
    { id: 3, name: 'Obras e Serviços', icon: <FaHardHat />, desc: 'Acompanha obras públicas e serviços urbanos.' },
    { id: 4, name: 'Educação e Cultura', icon: <FaGraduationCap />, desc: 'Pautas sobre ensino, cultura e patrimônio.' },
    { id: 5, name: 'Saúde e Assistência', icon: <FaHeartbeat />, desc: 'Políticas de saúde pública e assistência social.' },
];

const SlideComissoes = () => {
    const splideOptions = {
        type: 'loop',
        perPage: 3,
        perMove: 1,
        gap: '1.5rem',
        pagination: true,
        arrows: true,
        autoplay: true,
        interval: 5000,
        breakpoints: {
            1024: {
                perPage: 2,
                gap: '1rem',
            },
            768: {
                perPage: 1,
                gap: '1rem',
            },
        },
    };

    return (
        <Splide options={splideOptions} aria-label="Comissões Permanentes">
            {committees.map((committee) => (
                <SplideSlide key={committee.id}>
                    <div className="committee-card">
                        <div className="committee-icon">{committee.icon}</div>
                        <h3 className="committee-title">{committee.name}</h3>
                        <p className="committee-desc">{committee.desc}</p>
                    </div>
                </SplideSlide>
            ))}
        </Splide>
    );
};

export default SlideComissoes;