import './App.css';

import { Switch, Route } from 'react-router-dom'

//Screen Navigate
import HomeDashboard from './screens/homeDashboard';

// Páginas Principais
import Sessoes from './screens/semLogin/Sessoes';
import Relatorios from './screens/semLogin/Relatorios';
import SessaoVirtual from './screens/semLogin/SessaoVirtual';
import NormasJuridicas from './screens/semLogin/NormasJuridicas';
import Comissoes from './screens/semLogin/Comissoes';

// News
import Home from './screens/home';

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


function App() {
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
        <Route path="/novidades" component={Home} />
      </Switch>
      <Menu />
      <MenuDesktop />
      
      {/* Rodapé Melhorado */}
      <footer className='footer'>
        <div className='footer-content'>
          <div className='footer-section'>
            <h4>eCâmara</h4>
            <p>Plenário Virtual da Câmara Municipal Democratizando o acesso à participação legislativa</p>
          </div>
          
          <div className='footer-section'>
            <h4>Links Úteis</h4>
            <ul>
              <li><a href="/Sessoes">Sessões</a></li>
              <li><a href="/Relatorios">Relatórios</a></li>
              <li><a href="/Normas">Normas Jurídicas</a></li>
              <li><a href="/Comissoes">Comissões</a></li>
            </ul>
          </div>
          
          <div className='footer-section'>
            <h4>Transparência</h4>
            <ul>
              <li><a href="/Materias">Matérias</a></li>
              <li><a href="/Sessao-Virtual">Sessão Virtual</a></li>
              <li><a href="/novidades">Novidades</a></li>
            </ul>
          </div>
          
          <div className='footer-section'>
            <h4>Contato</h4>
            <p>📧 contato@ecamara.gov.br</p>
            <p>📞 (11) 3000-0000</p>
            <p>📍 Câmara Municipal</p>
          </div>
        </div>
        
        <div className='footer-bottom'>
          <div className='footer-bottom-content'>
            <p>&copy; 2025 eCâmara - Todos os direitos reservados</p>
            <p>Desenvolvido por <strong>Blu Sistemas</strong></p>
            <div className='footer-links'>
              <a href="/politica-privacidade">Política de Privacidade</a>
              <span>|</span>
              <a href="/termos-uso">Termos de Uso</a>
              <span>|</span>
              <a href="/acessibilidade">Acessibilidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
