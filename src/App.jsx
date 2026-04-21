import './App.css';
import { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import api from './services/api';

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
import MateriasDash from './screens/comLogin/Materias/materiasDash.jsx';
import MateriaDetails from './screens/comLogin/Materias/materiaDetails.jsx';
import CreateAccessoryDocument from './screens/comLogin/Materias/CreateAccessoryDocument.jsx';
import AccessoryDocumentsDash from './screens/comLogin/Materias/AccessoryDocumentsDash.jsx';

import JuizoMateria from './screens/comLogin/Juridico/juizoMateria.jsx';
import JuizoPresidente from './screens/comLogin/Presidencia/juizoPresidente.jsx';

import PautasSessao from './screens/comLogin/Sessoes/pautasSessao.jsx';
import ResumoSessao from './screens/comLogin/Sessoes/ResumoSessao.jsx';
import PainelSessao from './screens/comLogin/Sessoes/PainelSessao.jsx';
import SessaoPlenariaRestrita from './screens/comLogin/Sessoes/SessaoPlenariaRestrita.jsx';

import ComissoesDash from './screens/comLogin/Comissoes/comissoesDash.jsx';
import ComissaoDetails from './screens/comLogin/Comissoes/comissaoDetails.jsx';
import VirtualMeetingPage from './screens/comLogin/Comissoes/VirtualMeetingPage.jsx';

import AdminDocumentsDash from './screens/comLogin/Config/AdminDocumentsDash.jsx';
import AdminDocumentDetails from './screens/comLogin/Config/AdminDocumentDetails.jsx';
import LayoutManager from './screens/comLogin/Config/LayoutManager.jsx';
import AdminGeral from './screens/comLogin/Config/AdminGeral.jsx';

// Servicos (Requerem Autenticação)
import Agendamentos from './screens/comLogin/Servicos/Agendamentos.jsx';
import AssistenciaJuridica from './screens/comLogin/Servicos/AssistenciaJuridica.jsx';
import BalcaoCidadao from './screens/comLogin/Servicos/BalcaoCidadao.jsx';
import EscolaLegislativo from './screens/comLogin/Servicos/EscolaLegislativo.jsx';
import FalarComVereador from './screens/comLogin/Servicos/FalarComVereador.jsx';
import Ouvidoria from './screens/comLogin/Servicos/Ouvidoria.jsx';
import Procon from './screens/comLogin/Servicos/Procon.jsx';
import ProcuradoriaMulher from './screens/comLogin/Servicos/ProcuradoriaMulher.jsx';
import SalaEmpreendedor from './screens/comLogin/Servicos/SalaEmpreendedor.jsx';
import TvCamara from './screens/comLogin/Servicos/TvCamara.jsx';

// Páginas Secundárias
import Perfil from './screens/comLogin/Perfil.jsx';

// Páginas de Login e Registro
import Register from './screens/semLogin/register.jsx';
import Login from './screens/semLogin/login.jsx';

// Páginas Publico
import Mais from './screens/semLogin/Mais.jsx';
import Materias from './screens/semLogin/Materias.jsx';
import MateriaDetalhesPublico from './screens/semLogin/MateriaDetalhesPublico.jsx';
import VereadorProfile from './screens/semLogin/VereadorProfile.jsx';

// Paginas Configurações e Gerenciamento
import CamaraSelector from './screens/semLogin/CamaraSelector.jsx';

// Navigate Components
import ChatAI from './screens/semLogin/ChatAI.jsx';
import TopBar from './componets/topBarSearch.jsx';
import MenuDesktop from './componets/menuDesktop.jsx';

function App() {
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

  const [layoutConfig, setLayoutConfig] = useState({
    corPrimaria: '#126B5E', // Default primary color
    corDestaque: '#FF740F', // Default highlight color
    logo: '', // Logo dynamic
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  // Extração robusta: identifica se é uma rota de detalhes ou lista para pegar o slug correto
  const isDetailRoute = pathParts.includes('materia') || pathParts.includes('painel-sessao') || pathParts.includes('reuniao-virtual') || pathParts.includes('vereador');
  const camaraId = pathParts.length > 0 ? (isDetailRoute ? pathParts[pathParts.length - 2] : pathParts[pathParts.length - 1]) : 'master';

  // Lista de rotas onde o MenuDesktop (público) NÃO deve aparecer
  const hideMenuDesktop = ['/', '/login/:camaraId', '/register', '/admin/perfil/:camaraId', '/camara-ai-admin-geral'].includes(location.pathname) || location.pathname.includes('/admin/');

  // 1. Verificar Sessão (Me)
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('@CamaraAI:token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setCurrentUser(response.data);
          localStorage.setItem('@CamaraAI:user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Erro ao verificar sessão:", error);
          localStorage.removeItem('@CamaraAI:token');
          localStorage.removeItem('@CamaraAI:user');
        }
      }
    };
    verifySession();
  }, []);

  // 2. Buscar Configurações da Câmara
  useEffect(() => {
    const fetchCamaraConfig = async () => {
      if (camaraId && camaraId !== ':camaraId' && camaraId !== 'admin') {
        try {
          const response = await api.get(`/councils/${camaraId}`);
          const council = response.data;

          if (council) {
            setHomeConfig({
              titulo: council.name || 'Camara AI',
              slogan: council.slogan || homeConfig.slogan
            });

            setFooterConfig({
              slogan: council.slogan || footerConfig.slogan,
              address: council.address || footerConfig.address,
              phone: council.phone || footerConfig.phone,
              email: council.email || footerConfig.email,
            });

            // Se o backend retornar cores, usamos elas. Caso contrário, mantemos os defaults.
            setLayoutConfig({
              corPrimaria: council.corPrimaria || '#126B5E',
              corDestaque: council.corDestaque || '#FF740F',
              logo: council.logoUrl || '',
            });
          }
        } catch (error) {
          console.error("Error fetching council config:", error);
        }
      }
    };

    fetchCamaraConfig();
  }, [camaraId]);

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
          <Route path="/vereador/:camaraId/:vereadorId" component={VereadorProfile} />

          {/* Perfis de Acesso */}
          <Route path="/admin/perfil/:camaraId" component={Perfil} />

          {/* Páginas Mobile */}
          <Route path="/Mais/:camaraId" component={Mais} />
          <Route path="/Mais" component={Mais} />

          {/* Páginas Filho */}
          <Route path="/admin/materias-dash/:camaraId" component={MateriasDash} />

          <Route path="/admin/materia-detalhes/:camaraId" component={MateriaDetails} />
          <Route path="/admin/criar-documento-acessorio/:camaraId" component={CreateAccessoryDocument} />
          <Route path="/admin/documentos-acessorios/:camaraId" component={AccessoryDocumentsDash} />

          {/* Páginas de Formulários */}
          <Route path="/admin/protocolar-materia/:camaraId" component={AddMateria} />
          <Route path="/admin/juizo-materia/:camaraId" component={JuizoMateria} />
          <Route path="/admin/juizo-presidente/:camaraId" component={JuizoPresidente} />
          <Route path="/admin/comissoes-dash/:camaraId" component={ComissoesDash} />
          <Route path="/admin/comissao-detalhes/:camaraId" component={ComissaoDetails} />
          <Route path="/admin/reuniao-virtual/:camaraId/:comissaoId/:reuniaoId" component={VirtualMeetingPage} />
          <Route path="/admin/pautas-sessao/:camaraId" component={PautasSessao} />
          <Route path="/admin/sessao-plenaria/:camaraId" component={SessaoPlenariaRestrita} />
          <Route path="/admin/resumo-sessao/:camaraId" component={ResumoSessao} />
          <Route path="/admin/painel-sessao/:camaraId/:sessaoId" component={PainelSessao} />
          <Route path="/admin/configuracoes/:camaraId" component={Configuracoes} />
          <Route exact path="/admin/assistente-admin/:camaraId" component={AdminDocumentsDash} />
          <Route path="/admin/assistente-admin/novo/:camaraId" component={AdminAssistant} />
          <Route path="/admin/assistente-admin/detalhes/:camaraId" component={AdminDocumentDetails} />

          {/* Páginas de Serviços */}
          <Route path="/admin/servicos/agendamentos/:camaraId" component={Agendamentos} />
          <Route path="/admin/servicos/assistencia-juridica/:camaraId" component={AssistenciaJuridica} />
          <Route path="/admin/servicos/balcao-cidadao/:camaraId" component={BalcaoCidadao} />
          <Route path="/admin/servicos/escola-legislativo/:camaraId" component={EscolaLegislativo} />
          <Route path="/admin/servicos/falar-com-vereador/:camaraId" component={FalarComVereador} />
          <Route path="/admin/servicos/ouvidoria/:camaraId" component={Ouvidoria} />
          <Route path="/admin/servicos/procon/:camaraId" component={Procon} />
          <Route path="/admin/servicos/procuradoria-mulher/:camaraId" component={ProcuradoriaMulher} />
          <Route path="/admin/servicos/sala-empreendedor/:camaraId" component={SalaEmpreendedor} />
          <Route path="/admin/servicos/tv-camara/:camaraId" component={TvCamara} />

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

      
      {isChatOpen && <ChatAI onClose={closeChat} city={camaraId || 'master'} />}
    </div>
  );
}

export default App;
