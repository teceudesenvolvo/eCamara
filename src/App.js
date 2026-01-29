import './App.css';

import { Switch, Route } from 'react-router-dom'

//Screen Navigate
import HomeDashboard from './screens/HomePage';
import ChatAI from './screens/ChatAI';

// Páginas Principais
import Sessoes from './screens/semLogin/Sessoes';
import Relatorios from './screens/semLogin/Relatorios';
import SessaoVirtual from './screens/semLogin/SessaoVirtual';
import NormasJuridicas from './screens/semLogin/NormasJuridicas';
import Comissoes from './screens/semLogin/Comissoes';

// News
import Home from './screens/HomePage';

// Páginas Secundárias
import Materias from './screens/semLogin/Materias';
import Mais from './screens/semLogin/Mais';
import Perfil from './screens/comLogin/Perfil';

import AddMateria from './screens/comLogin/addMaterias';
import MateriasDash from './screens/comLogin/materiasDash';
import JuizoMateria from './screens/juizoMateria';
import Register from './screens/comLogin/register';

// SingIn / SignUp
import Login from './screens/login';

// Navigate Components
import TopBar from './componets/topBarSearch';
import Menu from './componets/menu';
import MenuDesktop from './componets/menuDesktop';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';


function App() {
  // Configuração do Tenant (Pode vir de um Contexto ou API)
  const tenant = {
    name: "Câmara Municipal de Blumenau",
    email: "contato@camarablumenau.sc.gov.br",
    phone: "(47) 3322-0000",
    address: "Rua XV de Novembro, 55 - Centro"
  };

  return (
    <div className="App">
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

        {/* Páginas de Formulários */}
        <Route path="/protocolar-materia" component={AddMateria} />
        <Route path="/juizo-materia" component={JuizoMateria} />
        <Route path="/chat-ai" component={ChatAI} />
        <Route path="/novidades" component={Home} />
      </Switch>
      <Menu />
      <MenuDesktop />
      
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
    </div>
  );
}

export default App;
