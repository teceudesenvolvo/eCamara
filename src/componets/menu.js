import React, { Component } from 'react';

//Imagens


// Icones
import {
  FaFilter,
  FaNewspaper,
  FaBan,
  FaRegLightbulb,
  FaBars
} from "react-icons/fa";

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
      case `/consultas`:
        return this.setState({ linkMenu: 'linkMenu link-active' })
      case `/publicacoes`:
        return this.setState({ linkMenu2: 'linkMenu link-active' })
      case `/impulgnacoes`:
        return this.setState({ linkMenu3: 'linkMenu link-active' })
      case `/esclarecimentos`:
        return this.setState({ linkMenu4: 'linkMenu link-active' })
      case `/Mais`:
        return this.setState({ linkMenu5: 'linkMenu link-active' })
      case `/login`:
        return this.setState({ menuClass: 'menuNone' })
      case `/register`:
        return this.setState({ menuClass: 'menuNone' })
      case `/`:
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

        <a href='/consultas' className={this.state.linkMenu}><FaFilter /></a>
        <a href='/publicacoes' className={this.state.linkMenu2}> < FaNewspaper /> </a>
        <a href='/impulgnacoes' className={this.state.linkMenu3}> <FaBan /> </a>
        <a href='/esclarecimentos' className={this.state.linkMenu4}> <FaRegLightbulb /> </a>
        <a href='/mais' className={this.state.linkMenu5}> <FaBars /> </a>

      </nav>

    );
  }
}

export default menu;