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
import Servico from './screens/0 - semUso/Servico';
import Produto from './screens/0 - semUso/Produto';
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
        <Route path="/Servico" component={Servico} />
        <Route path="/Produto" component={Produto} />
        <Route path="/materias-dash" component={MateriasDash} />

        {/* Páginas de Formulários */}
        <Route path="/protocolar-materia" component={AddMateria} />
        <Route path="/juizo-materia" component={JuizoMateria} />
        <Route path="/novidades" component={Home} />
      </Switch>
      <Menu />
      <MenuDesktop />
      <footer className='footer'>
        <p> Copyright &copy; 2023 - eudesenvolvo</p>
      </footer>
    </div>
  );
}

export default App;