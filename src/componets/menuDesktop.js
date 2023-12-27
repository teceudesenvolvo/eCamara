import React, { Component } from 'react';


//Imagens
import Logo from '../assets/e-compras-branco-05.png';

// Icones
import {
    FaFilter,
    FaNewspaper,
    FaBan,
    FaRegLightbulb,
    FaUser,
    FaQuestionCircle

} from "react-icons/fa";

// Components

//mudança de páginas

class menuDesktop extends Component {

    constructor(props) {
        super(props)
        this.state = {
            linkMenu: 'aDesktop',
            linkMenu2: 'aDesktop',
            linkMenu3: 'aDesktop',
            linkMenu4: 'aDesktop',
            linkMenu5: 'aDesktop',
            window: window.location.pathname,
        }
    }


    btnHome = () => {
        switch (this.state.window) {
            case `/consultas`:
                return this.setState({ linkMenu: 'aDesktop link-desktop-active' })
            case `/publicacoes`:
                return this.setState({ linkMenu2: 'aDesktop link-desktop-active' })
            case `/impulgnacoes`:
                return this.setState({ linkMenu3: 'aDesktop link-desktop-active' })
            case `/esclarecimentos`:
                return this.setState({ linkMenu4: 'aDesktop link-desktop-active' })
            case `/Mais`:
                return this.setState({ linkMenu5: 'aDesktop link-desktop-active' })
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
            <nav className='menuDesktop'>

                <a href='/' className="logoDesktopM" >
                    <img src={Logo} alt="logomarca" ></img>
                    {/* <h1 className='h1-logo'>| List</h1> */}
                </a>

                <a href="/consultas" className={this.state.linkMenu}>
                    <FaFilter className='fas fa-home'></FaFilter>
                    <span className='nav-item'>Consultas</span> 
                </a>

                <a href="/publicacoes" className={this.state.linkMenu2}>
                    <FaNewspaper className='fas fa-favoritos'></FaNewspaper>
                    <span className='nav-item'>Publicacoes</span>
                </a>

                <a href="/impulgnacoes" className={this.state.linkMenu3}>
                    <FaBan className='fas fa-Compras'></FaBan>
                    <span className='nav-item'>Impulgnações</span>
                </a>

                <a href="/esclarecimentos" className={this.state.linkMenu4}>
                    <FaRegLightbulb className='fas fa-Notificacoes'></FaRegLightbulb>
                    <span className='nav-item'>Esclarecimentos</span>
                </a>
                <a href="/login" className={this.state.linkMenu5}>
                    <FaUser className='fas fa-Ajuda'></FaUser>
                    <span className='nav-item'>Minha Conta</span>
                </a>
                <a href="/Ajuda" className={this.state.linkMenu5}>
                    <FaQuestionCircle className='fas fa-Ajuda'></FaQuestionCircle>
                    <span className='nav-item'>Ajuda</span>
                </a>




            </nav>

        );
    }
}

export default menuDesktop;