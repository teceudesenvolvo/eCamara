import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoApp from '../../assets/logo-camara-ai-sf.png';
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';
import { FaBuilding, FaArrowRight } from 'react-icons/fa';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const CamaraSelector = () => {
    const [camaras, setCamaras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCamaras = async () => {
            const rootRef = ref(db, '/');
            try {
                const snapshot = await get(rootRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const camaraList = Object.keys(data).map(id => {
                        const homeConfig = data[id]?.['dados-config']?.home;
                        const layoutConfig = data[id]?.['dados-config']?.layout;
                        return {
                            id: id,
                            name: homeConfig?.titulo || id.replace(/-/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                            logo: layoutConfig?.logoLight || null
                        };
                    });
                    setCamaras(camaraList);
                }
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar lista de câmaras:", error);
                setLoading(false);
            }
        };

        fetchCamaras();
    }, []);

    if (loading) {
        return (
            <div className="selector-page-container">
                <div className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    const splideOptions = {
        type: 'slide',
        perPage: 3,
        perMove: 1,
        gap: '2rem',
        focus: 'center', // Centraliza o slide ativo
        arrows: true,
        pagination: true,
        padding: '5%',
        breakpoints: {
            1024: { perPage: 2, gap: '1.5rem' },
            768: { perPage: 1, gap: '1rem', padding: '10%' },
        },
    };

    return (
        <div className="selector-page-container">
            <div className="selector-header">
                <img src={logoApp} alt="Camara AI" className="selector-logo" />
                <h1 className="selector-title">Escolha sua Câmara</h1>
                <p className="selector-subtitle">Transparência, inteligência e participação cidadã. Selecione o município para acessar.</p>
            </div>

            <div className="camera-slider-wrapper">
                <Splide options={splideOptions}>
                    {camaras.map(camara => (
                        <SplideSlide key={camara.id}>
                            <Link to={`/home/${camara.id}`} className="camera-card-link">
                                <div className="camera-card">
                                    <div className="camera-icon-wrapper">
                                        {camara.logo ? <img src={camara.logo} alt={camara.name} className="camera-custom-logo" /> : <FaBuilding />}
                                    </div>
                                    <h2 className="camera-name">{camara.name}</h2>
                                    <span className="camera-action">Acessar Portal <FaArrowRight size={12} /></span>
                                </div>
                            </Link>
                        </SplideSlide>
                    ))}
                </Splide>
            </div>
        </div>
    );
};

export default CamaraSelector;