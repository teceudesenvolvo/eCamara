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
import VirtualMeetingPage from './screens/comLogin/VirtualMeetingPage.jsx';
import ComissaoDetails from './screens/comLogin/comissaoDetails.jsx';
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
import MateriaDetalhesPublico from './screens/semLogin/MateriaDetalhesPublico.jsx';

// Paginas Configurações e Gerenciamento
import LayoutManager from './screens/comLogin/LayoutManager.jsx';
import CamaraSelector from './screens/semLogin/CamaraSelector.jsx';

import AdminGeral from './screens/comLogin/AdminGeral.jsx';
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

  const [homeConfig, setHomeConfig] = useState({
    titulo: 'Camara AI',
    slogan: "Governança Legislativa 4.0: Inteligência Artificial, Transparência e Participação Cidadã.",
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
  const pathParts = location.pathname.split('/').filter(Boolean);
  const camaraId = pathParts.length > 1 ? pathParts[1] : ''; // Extract camaraId from URL

  // Lista de rotas onde o MenuDesktop (público) NÃO deve aparecer
  const hideMenuDesktop = ['/', '/login/:camaraId', '/register', '/admin/perfil/:camaraId', '/camara-ai-admin-geral'].includes(location.pathname) || location.pathname.includes('/admin/');

  useEffect(() => {
    const fetchLayoutConfig = async () => {
      if (camaraId) {
        const homeRef = ref(db, `${camaraId}/dados-config/home`);
        const layoutRef = ref(db, `${camaraId}/dados-config/layout`);
        const footerRef = ref(db, `${camaraId}/dados-config/footer`);
        try {
          const snapshot = await get(layoutRef);
          const footerSnapshot = await get(footerRef);
          const homeSnapshot = await get(homeRef);


          if (snapshot.exists()) {
            setLayoutConfig(snapshot.val());
          } else {
            // Reset to default if no config found
            setLayoutConfig({ corPrimaria: '#126B5E', corDestaque: '#FF740F' });
          }

          if (footerSnapshot.exists()) {
            setFooterConfig(footerSnapshot.val());
          }

          if (homeSnapshot.exists()) {
            setHomeConfig(homeSnapshot.val());
          }
        } catch (error) {
          console.error("Error fetching layout config:", error);
        }
      }
    };

    fetchLayoutConfig();
  }, [location.pathname, camaraId]);

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
            <MenuDesktop onOpenChat={openChat} camaraId={match.params.camaraId} logo={layoutConfig.logo} />
          )} />
      )}
      
      <div className="main-content-wrapper">
        <TopBar />
        <Switch>
          {/* Página Principal */}
          <Route exact path="/" component={CamaraSelector} />

          <Route path="/login/:camaraId" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Dynamic routes for each city council */}
          <Route path="/home/:camaraId" component={HomeDashboard} />
          <Route path="/sessoes/:camaraId" component={Sessoes} />
          <Route path="/relatorios/:camaraId" component={Relatorios} />
          <Route path="/sessao-virtual/:camaraId" component={SessaoVirtual} />
          <Route path="/normas/:camaraId" component={NormasJuridicas} />
          <Route path="/comissoes/:camaraId" component={Comissoes} />
          <Route path="/materias/:camaraId" component={Materias} />
          <Route path="/materia/:camaraId/:materiaId" component={MateriaDetalhesPublico} />

          {/* Perfis de Acesso */}
          <Route path="/admin/perfil/:camaraId" component={Perfil} />

          {/* Páginas Mobile */}
          <Route path="/Mais" component={Mais} />

          {/* Páginas Filho */}
          <Route path="/admin/materias-dash/:camaraId" component={MateriasDash} />

          <Route path="/admin/materia-detalhes/:camaraId" component={MateriaDetails} />

          {/* Páginas de Formulários */}
          <Route path="/admin/protocolar-materia/:camaraId" component={AddMateria} />
          <Route path="/admin/juizo-materia/:camaraId" component={JuizoMateria} />
          <Route path="/admin/juizo-presidente/:camaraId" component={JuizoPresidente} />
          <Route path="/admin/comissoes-dash/:camaraId" component={ComissoesDash} />
          <Route path="/admin/comissao-detalhes/:camaraId" component={ComissaoDetails} />
          <Route path="/admin/reuniao-virtual/:camaraId/:comissaoId/:reuniaoId" component={VirtualMeetingPage} />
          <Route path="/admin/pautas-sessao/:camaraId" component={PautasSessao} />
          <Route path="/admin/configuracoes/:camaraId" component={Configuracoes} />
          <Route exact path="/admin/assistente-admin/:camaraId" component={AdminDocumentsDash} />
          <Route path="/admin/assistente-admin/novo/:camaraId" component={AdminAssistant} />
          <Route path="/admin/assistente-admin/detalhes/:camaraId" component={AdminDocumentDetails} />

          {/* Paginas de Gerenciamento */}
          <Route path="/admin/layout-manager/:camaraId" component={LayoutManager} />
          <Route path="/camara-ai-admin-geral" component={AdminGeral} />
        </Switch>

        {!hideMenuDesktop && (
        <footer className='footer'>
          <div className='footer-content'>
            <div className='footer-section footer-about'>
              <h4 className='footer-logo-text'>{homeConfig.titulo}</h4>
              <p>{footerConfig.slogan}</p>
              {/* <div className='social-icons'>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
              </div> */}
            </div>
            
            <div className='footer-section footer-links-section'>
              <h4>Legislativo</h4>
              <ul>
                <li><a href={`/sessoes/${camaraId}`}>Sessões</a></li>
                <li><a href={`/materias/${camaraId}`}>Matérias</a></li>
                <li><a href={`/normas/${camaraId}`}>Normas Jurídicas</a></li>
                <li><a href={`/comissoes/${camaraId}`}>Comissões</a></li>
              </ul>
            </div>  
            
            {/* <div className='footer-section footer-links-section'>
              <h4>Transparência</h4>
              <ul>
                <li><a href={`/sessao-virtual/${camaraId}`}>Sessão Virtual</a></li>
              </ul>
            </div>
             */}
            <div className='footer-section footer-contact'>
              <h4>Contato</h4>
              <p>📍 {footerConfig.address}</p>
              <p>📞 {footerConfig.phone}</p>
              <p>📧 {footerConfig.email}</p>
            </div>
          </div>
          
          <div className='footer-bottom-wrapper'>
            <div className='footer-bottom'>
              <p>&copy; 2026 Camara AI - Todos os direitos reservados. Desenvolvido por <strong>Blu Tecnologias</strong></p>
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
