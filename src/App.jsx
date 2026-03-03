import './App.css';
import { useState } from 'react';

import { Switch, Route, useLocation } from 'react-router-dom'

//Screen Navigate
import HomeDashboard from './screens/HomePage.jsx';

// Páginas Principais
import Sessoes from './screens/semLogin/Sessoes.jsx';
import Relatorios from './screens/semLogin/Relatorios.jsx';
import SessaoVirtual from './screens/semLogin/SessaoVirtual.jsx';
import NormasJuridicas from './screens/semLogin/NormasJuridicas.jsx';
import Comissoes from './screens/semLogin/Comissoes.jsx';

// Páginas Secundárias
import Materias from './screens/semLogin/Materias.jsx';
import Mais from './screens/semLogin/Mais.jsx';
import Perfil from './screens/comLogin/Perfil.jsx';

import AddMateria from './screens/comLogin/addMaterias.jsx';
import MateriasDash from './screens/comLogin/materiasDash.jsx';
import JuizoMateria from './screens/comLogin/juizoMateria.jsx';
import Register from './screens/comLogin/register.jsx';
import JuizoPresidente from './screens/comLogin/juizoPresidente.jsx';
import ComissoesDash from './screens/comLogin/comissoesDash.jsx';
import PautasSessao from './screens/comLogin/pautasSessao.jsx';

import MateriaDetails from './screens/comLogin/materiaDetails.jsx';

// SingIn / SignUp
import Login from './screens/login.jsx';

// Navigate Components
import ChatAI from './screens/ChatAI.jsx';
import TopBar from './componets/topBarSearch.jsx';
import Menu from './componets/menu.jsx';
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

  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const location = useLocation();
  // Lista de rotas onde o MenuDesktop (público) NÃO deve aparecer
  const hideMenuDesktop = ['/login', '/register', '/perfil', '/materias-dash', '/protocolar-materia', '/juizo-materia', '/materia-detalhes', '/comissoes-dash', '/juizo-presidente', '/pautas-sessao'].includes(location.pathname);

  return (
    <div className="App">
      {!hideMenuDesktop && <MenuDesktop onOpenChat={openChat} />}
      
      <div className="main-content-wrapper">
        <TopBar />
        <Switch>
          {/* Página Principal */}
          <Route exact path="/" component={HomeDashboard} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />

          {/* Perfis de Acesso */}
          <Route path="/perfil" component={Perfil} />

          {/*Menu Publico*/}
          <Route path="/Sessoes" component={Sessoes} />
          <Route path="/Relatorios" component={Relatorios} />
          <Route path="/Sessao-Virtual" component={SessaoVirtual} />
          <Route path="/Normas" component={NormasJuridicas} />
          <Route path="/Comissoes" component={Comissoes} />
          <Route path="/Materias" component={Materias} />

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
        </Switch>

        {!hideMenuDesktop && (
        <footer className='footer'>
          <div className='footer-content'>
            <div className='footer-section footer-about'>
              <h4 className='footer-logo-text'>Camara AI</h4>
              <p>Governança Legislativa 4.0: Inteligência Artificial, Transparência e Participação Cidadã.</p>
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
                <li><a href="/Sessoes">Sessões</a></li>
                <li><a href="/Materias">Matérias</a></li>
                <li><a href="/Normas">Normas Jurídicas</a></li>
                <li><a href="/Comissoes">Comissões</a></li>
              </ul>
            </div>
            
            <div className='footer-section footer-links-section'>
              <h4>Transparência</h4>
              <ul>
                <li><a href="/Relatorios">Relatórios</a></li>
                <li><a href="/Sessao-Virtual">Sessão Virtual</a></li>
                <li><a href="/novidades">Novidades</a></li>
                <li><a href="/acessibilidade">Acessibilidade</a></li>
              </ul>
            </div>
            
            <div className='footer-section footer-contact'>
              <h4>Contato</h4>
              <p>📍 {tenant.address}</p>
              <p>📞 {tenant.phone}</p>
              <p>📧 {tenant.email}</p>
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

      <Menu />
      {isChatOpen && <ChatAI onClose={closeChat} />}
    </div>
  );
}

export default App;
