import './App.css';
import { useState, useEffect } from 'react';

import { Switch, Route, useLocation } from 'react-router-dom'
import { db } from './firebaseConfig';
import { ref, get } from 'firebase/database';

//Screen Navigate
import HomeDashboard from './screens/semLogin/HomePage.jsx';

// Páginas Principais
import Sessoes from './screens/semLogin/Sessoes.jsx';
import Relatorios from './screens/semLogin/Relatorios.jsx';
import SessaoVirtual from './screens/semLogin/SessaoVirtual.jsx';
import NormasJuridicas from './screens/semLogin/NormasJuridicas.jsx';
import Comissoes from './screens/semLogin/Comissoes.jsx';

// Com Login - Formulários e Dashboards
import AddMateria from './screens/comLogin/FormsCreate/addMaterias.jsx';
import Configuracoes from './screens/comLogin/FormsCreate/Configuracoes.jsx';
import AdminAssistant from './screens/comLogin/FormsCreate/AdminAssistant.jsx';

// Com Login - Dashboards e Detalhes
import MateriasDash from './screens/comLogin/materiasDash.jsx';
import JuizoMateria from './screens/comLogin/juizoMateria.jsx';
import JuizoPresidente from './screens/comLogin/juizoPresidente.jsx';
import ComissoesDash from './screens/comLogin/comissoesDash.jsx';
import PautasSessao from './screens/comLogin/pautasSessao.jsx';
import AdminDocumentsDash from './screens/comLogin/AdminDocumentsDash.jsx';
import AdminDocumentDetails from './screens/comLogin/AdminDocumentDetails.jsx';

// Páginas Secundárias
import MateriaDetails from './screens/comLogin/materiaDetails.jsx';
import Perfil from './screens/comLogin/Perfil.jsx';

// Páginas de Login e Registro
import Register from './screens/semLogin/register.jsx';
import Login from './screens/semLogin/login.jsx';

// Páginas Publico
import Mais from './screens/semLogin/Mais.jsx';
import Materias from './screens/semLogin/Materias.jsx';

// Paginas Configurações e Gerenciamento
import LayoutManager from './screens/comLogin/LayoutManager.jsx';
import CamaraSelector from './screens/semLogin/CamaraSelector.jsx';

// Navigate Components
import ChatAI from './screens/semLogin/ChatAI.jsx';
import TopBar from './componets/topBarSearch.jsx';
import MenuDesktop from './componets/menuDesktop.jsx'; // Verifique se este arquivo existe ou se deveria ser menuDashboard.jsx
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';


function App() {
  // Configuração do Tenant (Pode vir de um Contexto ou API)
  const tenant = {
    name: "Câmara Municipal de Blumenau",
    email: "contato@camarablumenau.sc.gov.br",
    phone: "(47) 3322-0000",
    address: "Rua XV de Novembro, 55 - Centro"
  };
  const [footerConfig, setFooterConfig] = useState({
    slogan: "Governança Legislativa 4.0: Inteligência Artificial, Transparência e Participação Cidadã.",
    address: "Endereço não informado",
    phone: "Telefone não informado",
    email: "Email não informado",
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState({
    corPrimaria: '#126B5E', // Default primary color
    corDestaque: '#FF740F', // Default highlight color
    logo: '', // Logo dynamic
  });

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const location = useLocation();
  // Lista de rotas onde o MenuDesktop (público) NÃO deve aparecer
  const hideMenuDesktop = ['/', '/login', '/register', '/perfil', '/materias-dash', '/protocolar-materia', '/juizo-materia', '/materia-detalhes', '/comissoes-dash', '/juizo-presidente', '/pautas-sessao', '/configuracoes', '/assistente-admin', '/assistente-admin/novo', '/assistente-admin/detalhes', '/layout-manager'].includes(location.pathname);

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const camaraId = pathParts.length > 1 ? pathParts[1] : 'pacatuba'; // Extract camaraId from URL

    const fetchLayoutConfig = async () => {
      if (camaraId) {
        const layoutRef = ref(db, `${camaraId}/dados-config/layout`);
        const footerRef = ref(db, `${camaraId}/dados-config/footer`);
        try {
          const snapshot = await get(layoutRef);
          const footerSnapshot = await get(footerRef);

          if (snapshot.exists()) {
            setLayoutConfig(snapshot.val());
          } else {
            // Reset to default if no config found
            setLayoutConfig({ corPrimaria: '#126B5E', corDestaque: '#FF740F' });
          }

          if (footerSnapshot.exists()) {
            setFooterConfig(footerSnapshot.val());
          }
        } catch (error) {
          console.error("Error fetching layout config:", error);
        }
      }
    };

    fetchLayoutConfig();
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', layoutConfig.corPrimaria);
    root.style.setProperty('--secondary-color', layoutConfig.corDestaque);
  }, [layoutConfig]);

  return (
    <div className="App">
      {!hideMenuDesktop && (
        <Route 
          path="/:page?/:camaraId?"
          render={({ match }) => (
            <MenuDesktop onOpenChat={openChat} camaraId={match.params.camaraId || 'pacatuba'} logo={layoutConfig.logo} />
          )} />
      )}
      
      <div className="main-content-wrapper">
        <TopBar />
        <Switch>
          {/* Página Principal */}
          <Route exact path="/" component={CamaraSelector} />

          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Dynamic routes for each city council */}
          <Route path="/home/:camaraId" component={HomeDashboard} />
          <Route path="/sessoes/:camaraId" component={Sessoes} />
          <Route path="/relatorios/:camaraId" component={Relatorios} />
          <Route path="/sessao-virtual/:camaraId" component={SessaoVirtual} />
          <Route path="/normas/:camaraId" component={NormasJuridicas} />
          <Route path="/comissoes/:camaraId" component={Comissoes} />
          <Route path="/materias/:camaraId" component={Materias} />

          {/* Perfis de Acesso */}
          <Route path="/perfil" component={Perfil} />

          {/* Páginas Mobile */}
          <Route path="/Mais" component={Mais} />

          {/* Páginas Filho */}
          <Route path="/materias-dash" component={MateriasDash} />

          <Route path="/materia-detalhes" component={MateriaDetails} />

          {/* Páginas de Formulários */}
          <Route path="/protocolar-materia" component={AddMateria} />
          <Route path="/juizo-materia" component={JuizoMateria} />
          <Route path="/juizo-presidente" component={JuizoPresidente} />
          <Route path="/comissoes-dash" component={ComissoesDash} />
          <Route path="/pautas-sessao" component={PautasSessao} />
          <Route path="/configuracoes" component={Configuracoes} />
          <Route exact path="/assistente-admin" component={AdminDocumentsDash} />
          <Route path="/assistente-admin/novo" component={AdminAssistant} />
          <Route path="/assistente-admin/detalhes" component={AdminDocumentDetails} />

          {/* Paginas de Gerenciamento */}
          <Route path="/layout-manager" component={LayoutManager} />
        </Switch>

        {!hideMenuDesktop && (
        <footer className='footer'>
          <div className='footer-content'>
            <div className='footer-section footer-about'>
              <h4 className='footer-logo-text'>Camara AI</h4>
              <p>{footerConfig.slogan}</p>
              <div className='social-icons'>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
              </div>
            </div>
            
            <div className='footer-section footer-links-section'>
              <h4>Legislativo</h4>
              <ul>
                <li><a href="/sessoes/pacatuba">Sessões</a></li>
                <li><a href="/materias/pacatuba">Matérias</a></li>
                <li><a href="/normas/pacatuba">Normas Jurídicas</a></li>
                <li><a href="/comissoes/pacatuba">Comissões</a></li>
              </ul>
            </div>
            
            <div className='footer-section footer-links-section'>
              <h4>Transparência</h4>
              <ul>
                <li><a href="/relatorios/pacatuba">Relatórios</a></li>
                <li><a href="/sessao-virtual/pacatuba">Sessão Virtual</a></li>
                <li><a href="/novidades">Novidades</a></li>
                <li><a href="/acessibilidade">Acessibilidade</a></li>
              </ul>
            </div>
            
            <div className='footer-section footer-contact'>
              <h4>Contato</h4>
              <p>📍 {footerConfig.address}</p>
              <p>📞 {footerConfig.phone}</p>
              <p>📧 {footerConfig.email}</p>
            </div>
          </div>
          
          <div className='footer-bottom-wrapper'>
            <div className='footer-bottom'>
              <p>&copy; 2026 Camara AI - Todos os direitos reservados. Desenvolvido por <strong>Blu Sistemas</strong></p>
              <div className='footer-bottom-links'>
                  <a href="/politica-privacidade">Política de Privacidade</a>
                  <a href="/termos-uso">Termos de Uso</a>
                </div>
            </div>
          </div>
        </footer>
        )}
      </div>

      
      {isChatOpen && <ChatAI onClose={closeChat} />}
    </div>
  );
}

export default App;
