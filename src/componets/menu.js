import React, { Component } from 'react';

//Imagens


// Icones
import {
  GoNote,
  GoBroadcast,
  GoBook,
  GoRepo,

} from "react-icons/go";

import { FaBars } from "react-icons/fa";

// Components

//mudança de páginas

class menu extends Component {

  constructor(props) {
    super(props)
    this.state = {
      linkMenu: 'linkMenu',
      linkMenu2: 'linkMenu',
      linkMenu3: 'linkMenu',
      linkMenu4: 'linkMenu',
      linkMenu5: 'linkMenu',
      menuClass: 'menu',
      window: window.location.pathname,
    }
  }


  btnHome = () => {
    switch (this.state.window) {
      case `/sessoes`:
        return this.setState({ linkMenu: 'linkMenu link-active' })
      case `/sessao-virtual`:
        return this.setState({ linkMenu2: 'linkMenu link-active' })
      case `/comissoes`:
        return this.setState({ linkMenu3: 'linkMenu link-active' })
      case `/materias`:
        return this.setState({ linkMenu4: 'linkMenu link-active' })
      case `/login`:
        return this.setState({ menuClass: 'menuNone' })
      case `/register`:
        return this.setState({ menuClass: 'menuNone' })
      case `/mais`:
        return this.setState({ menuClass: 'menuNone' })
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
      <nav className={this.state.menuClass}>

        <a href='/sessoes' className={this.state.linkMenu}><GoNote /></a>
        <a href='/sessao-virtual' className={this.state.linkMenu2}> < GoBroadcast /> </a>
        <a href='/comissoes' className={this.state.linkMenu3}> <GoBook /> </a>
        <a href='/materias' className={this.state.linkMenu4}> <GoRepo /> </a>
        <a href='/mais' className={this.state.linkMenu5}> <FaBars /> </a>

      </nav>

    );
  }
}

export default menu;