import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoApp from '../../assets/logo-camara-ai-vertical.png';
import Background from '../../assets/bg-waves2.png';
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';
import { FaBuilding, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import '@splidejs/react-splide/css';

const CamaraSelector = () => {
    const [camaras, setCamaras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [detectedCamara, setDetectedCamara] = useState(null);
    const [hasAttemptedLocate, setHasAttemptedLocate] = useState(false);

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
                            logo: layoutConfig?.logoDark || layoutConfig?.logo || null,
                            cityName: homeConfig?.cidade || '',
                            corPrimaria: layoutConfig?.corPrimaria || '#126B5E'
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

    const normalize = (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

    const handleLocateUser = (isAutomatic = false) => {
        if (!navigator.geolocation) {
            if (!isAutomatic) alert("Geolocalização não é suportada pelo seu navegador.");
            return;
        }

        setDetectingLocation(true);
        setDetectedCamara(null);

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Usando Nominatim (OpenStreetMap) para geocodificação reversa
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                
                // Tenta extrair a cidade de diferentes campos possíveis da resposta
                const cityDetected = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality;

                if (cityDetected) {
                    const normDetected = normalize(cityDetected);
                    // Busca flexível: verifica se o nome da cidade está contido no nome da câmara ou no ID
                    const match = camaras.find(c => 
                        normalize(c.cityName) === normDetected || 
                        normalize(c.name).includes(normDetected) ||
                        normalize(c.id).includes(normDetected)
                    );

                    if (match) {
                        setDetectedCamara(match);
                    } else if (!isAutomatic) {
                        alert(`Localizamos você em ${cityDetected}, mas esta câmara ainda não está cadastrada em nossa rede.`);
                    }
                } else {
                    if (!isAutomatic) alert("Não foi possível determinar sua cidade.");
                }
            } catch (error) {
                console.error("Erro ao detectar cidade:", error);
                if (!isAutomatic) alert("Erro ao processar sua localização.");
            } finally {
                setDetectingLocation(false);
            }
        }, (error) => {
            setDetectingLocation(false);
            if (!isAutomatic) alert("Acesso à localização negado ou indisponível.");
        });
    };

    useEffect(() => {
        // Dispara a localização assim que as câmaras terminam de carregar, mas apenas uma vez.
        if (!loading && camaras.length > 0 && !hasAttemptedLocate) {
            setHasAttemptedLocate(true);
            handleLocateUser(true);
        }
    }, [loading, camaras, hasAttemptedLocate]);

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

    return (
        <div className="selector-page-container" style={{ 
            backgroundImage: `linear-gradient(135deg, rgba(18, 107, 94, 0.85) 0%, rgba(0, 63, 54, 0.95) 100%), url(${Background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            <div className="selector-top-nav">
                <img src={logoApp} alt="Camara AI" style={{ width: '150px', height: 'auto' }} />
                <Link to="/camara-ai-admin-geral" className="btn-parliament" style={{ margin: 0 }}>
                    ...
                </Link>
            </div>

            <div className="selector-header">
                {/* <h1 className="selector-title">Escolha sua Câmara</h1>
                <p className="selector-subtitle">Transparência, inteligência e participação cidadã. Selecione o município para acessar.</p>
                
                <button 
                    className="btn-hero btn-parliament" 
                    onClick={handleLocateUser}
                    disabled={detectingLocation}
                    style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                >
                    {detectingLocation ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt />}
                    {detectingLocation ? "Detectando cidade..." : "Localizar minha cidade"}
                </button> */}
            </div>

            {detectedCamara && (
                <div className="detected-camara-section" style={{ marginBottom: '60px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s' }}>
                    <p style={{ color: '#fff', marginBottom: '15px', fontWeight: 'bold' }}>A câmara da sua localização:</p>
                    <Link to={`/home/${detectedCamara.id}`} className="camera-card-link" style={{ width: '100%', maxWidth: '350px' }}>
                        <div className="camera-card" style={{ backgroundColor: detectedCamara.corPrimaria }}>
                                {detectedCamara.logo ? <img src={detectedCamara.logo} alt={detectedCamara.name} className="camera-custom-logo" /> : <FaBuilding />}
                            
                        </div>
                        <h2 className="camera-name-label">{detectedCamara.name}</h2>
                    </Link>
                    <hr style={{ width: '200px', margin: '40px 0', opacity: 0.3 }} />
                </div>
            )}

            <div className="camera-grid-wrapper">
                <div className="camera-grid">
                    {camaras.map(camara => (
                        <div key={camara.id} className="camera-grid-item">
                            <Link to={`/home/${camara.id}`} className="camera-card-link">
                                <div className="camera-card" style={{ backgroundColor: camara.corPrimaria }}>
                                        {camara.logo ? <img src={camara.logo} alt={camara.name} className="camera-custom-logo" /> : <FaBuilding />}
                                    
                                </div>
                                <h2 className="camera-name-label">{camara.name}</h2>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CamaraSelector;