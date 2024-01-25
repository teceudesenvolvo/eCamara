import React, { Component } from 'react';


//Imagens

// Icones
import {
    GoNote,
    GoGraph,
    GoBroadcast,
    GoLaw,
    GoBook,
    GoRepo,
    GoLightBulb   

} from "react-icons/go";

import { FaRegUser } from "react-icons/fa";

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
            linkMenu6: 'aDesktop',
            linkMenu7: 'aDesktop',
            linkMenu8: 'aDesktop',
            menuDesktop: 'menuDesktop',
            window: window.location.pathname,
        }
    }


    btnHome = () => {
        switch (this.state.window) {
            case `/sessoes`:
                return this.setState({ linkMenu: 'aDesktop link-desktop-active' })
            case `/relatorios`:
                return this.setState({ linkMenu2: 'aDesktop link-desktop-active' })
            case `/sessao-virtual`:
                return this.setState({ linkMenu3: 'aDesktop link-desktop-active' })
            case `/normas`:
                return this.setState({ linkMenu4: 'aDesktop link-desktop-active' })
            case `/comissoes`:
                return this.setState({ linkMenu5: 'aDesktop link-desktop-active' })
            case `/materias`:
                return this.setState({ linkMenu6: 'aDesktop link-desktop-active' })
            case `/perfil`:
                return this.setState({ linkMenu7: 'aDesktop link-desktop-active' })
            case `/ajuda`:
                return this.setState({ linkMenu8: 'aDesktop link-desktop-active' })
            case `/login`:
                return this.setState({ menuDesktop: 'menuNone' })
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
            <nav className={this.state.menuDesktop}>

                

                <a href="/sessoes" className={this.state.linkMenu}>
                    <GoNote className='fas fa-home'></GoNote>
                    <span className='nav-item'>Sessões</span> 
                </a>

                <a href="/relatorios" className={this.state.linkMenu2}>
                    <GoGraph  className='fas fa-favoritos'></GoGraph >
                    <span className='nav-item'>Relatórios</span>
                </a>

                <a href="/sessao-virtual" className={this.state.linkMenu3}>
                    <GoBroadcast  className='fas fa-Compras'></GoBroadcast >
                    <span className='nav-item'>Sessão Virtual</span>
                </a>

                <a href="/normas" className={this.state.linkMenu4}>
                    <GoLaw className='fas fa-Notificacoes'></GoLaw>
                    <span className='nav-item'>Normas Juridicas</span>
                </a>
                <a href="/comissoes" className={this.state.linkMenu5}>
                    <GoBook className='fas fa-Ajuda'></GoBook>
                    <span className='nav-item'>Comissões</span>
                </a>
                <a href="/materias" className={this.state.linkMenu6}>
                    <GoRepo className='fas fa-Ajuda'></GoRepo>
                    <span className='nav-item'>Matérias</span>
                </a>
                {/* <a href="/perfil" className={this.state.linkMenu7}>
                    <FaRegUser className='fas fa-Ajuda'></FaRegUser>
                    <span className='nav-item'>Minha Conta</span>
                </a> */}
                <a href="/ajuda" className={this.state.linkMenu8}>
                    <GoLightBulb  className='fas fa-Ajuda'></GoLightBulb >
                    <span className='nav-item'>Ajuda</span>
                </a>
                
            </nav>

        );
    }
}

export default menuDesktop;