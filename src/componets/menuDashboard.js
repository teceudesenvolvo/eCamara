import React, { Component } from 'react';


//Imagens
import Logo from '../assets/logoLaranga.png';

// Icones
import {
    FaAddressBook ,
    FaPlusCircle ,
    FaPencilAlt ,
    FaRegUser

} from "react-icons/fa";


// Components

//mudança de páginas

class menuDashboard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            linkMenu: 'aDesktop',
            linkMenu2: 'aDesktop',
            linkMenu3: 'aDesktop',
            linkMenu4: 'aDesktop',
            linkMenu5: 'aDesktop',
            linkMenu6: 'aDesktop',
            window: window.location.pathname,
        }
    }


    btnHome = () => {
        switch (this.state.window) {
            case `/materias-dash`:
                return this.setState({ linkMenu: 'aDesktop link-desktop-active' })
            case `/favoritos`:
                return this.setState({ linkMenu2: 'aDesktop link-desktop-active' })
            case `/Compras`:
                return this.setState({ linkMenu3: 'aDesktop link-desktop-active' })
            case `/protocolar-materia`:
                return this.setState({ linkMenu4: 'aDesktop link-desktop-active' })
            case `/juizo-materia`:
                return this.setState({ linkMenu5: 'aDesktop link-desktop-active' })
            case `/perfil`:
                return this.setState({ linkMenu6: 'aDesktop link-desktop-active' })
            default:
                return null
        }
    }

    componentDidMount() {
        const loadPage = () => {
            this.btnHome()
        }

        loadPage()
    }


    render() {
        return (
            <nav className='menuDashboard'>

                <a href="/materias-dash" className={this.state.linkMenu}>
                    <FaAddressBook className='fas fa-home'></FaAddressBook>
                    <span className='nav-item'>Minhas Materias</span>
                </a>

             
                <a href="/protocolar-materia" className={this.state.linkMenu4}>
                    <FaPlusCircle  className='fas fa-Notificacoes'></FaPlusCircle >
                    <span className='nav-item'>Protocolar Matéria</span>
                </a>
            
                <a href="/juizo-materia" className={this.state.linkMenu5}>
                    <FaPencilAlt  className='fas fa-Ajuda'></FaPencilAlt >
                    <span className='nav-item'>Parecer</span>
                </a>
                
                <a href="/perfil" className={this.state.linkMenu6}>
                    <FaRegUser className='fas fa-Ajuda'></FaRegUser>
                    <span className='nav-item'>Minha Conta</span>
                </a>


                <a href='/homeDashboard' className="logoDashbord" >
                    <img src={Logo} alt="logomarca" ></img>
                    {/* <h1 className='h1-logo'>| List</h1> */}
                </a>
            </nav>

        );
    }
}

export default menuDashboard;