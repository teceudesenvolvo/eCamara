import './App.css'; 

import { Switch, Route } from 'react-router-dom'


//Screen Navigate
import homeDashboard from '../src/screens/homeDashboard';

  // Páginas Principais
import Sessoes from './screens/client/Sessoes';
import Relatorios from './screens/client/Relatorios';
import SessaoVirtual from './screens/client/SessaoVirtual';
import NormasJuridicas from './screens/client/NormasJuridicas'
import Comissoes from './screens/client/Comissoes'
  // News
import Home from '../src/screens/home';
  // Páginas Secundárias
import Materias from './screens/client/Materias';
import Mais from './screens/client/Mais';
import Servico from './screens/client/Servico';
import Produto from './screens/client/Produto';
import Carrinho from './screens/client/carrinho';
import pagamento from './screens/client/pagamento';
import Pesquisar from './screens/client/pesquisa';
import Perfil from './screens/client/Perfil';

import addMateria from './screens/addMaterias';
import materiasDash from './screens/materiasDash';
import registerDashboard from './screens/registerDashboard';
import registerEndereco from './screens/registerEndereco';
import registerLoja from './screens/resgisterLoja';
import juizoMateria from './screens/juizoMateria';


// SingIn / SignUp
import register from './screens/client/register';
import login from './screens/client/login';


// Navigate Components
import TopBar from '../src/componets/topBarSearch'
import Menu from './componets/menu';
import MenuDesktop from './componets/menuDesktop';


import testeGeneratePDF from './screens/testePage'


function App() {
  return (
    <div className="App">
      
      <TopBar />
      <Switch>
        {/* Página Principal */}
        <Route exact path="/" component={homeDashboard} />
        
        <Route path="/login" component={login} />
        <Route path="/register" component={register} />

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
        <Route path="/Carrinho" component={Carrinho} />
        <Route path="/pesquisar" component={Pesquisar} />


        
        <Route path="/pagamento" component={pagamento} />
        <Route path="/materias-dash" component={materiasDash} />

        
        {/* Páginas de Formulários */}
        <Route path="/protocolar-materia" component={addMateria} />
        <Route path="/registerDashboard" component={registerDashboard} />
        <Route path="/registerEndereco" component={registerEndereco} />
        <Route path="/juizo-materia" component={juizoMateria} />
        <Route path="/registerLoja" component={registerLoja} />
        
        
        <Route path="/testePage" component={testeGeneratePDF} />





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
