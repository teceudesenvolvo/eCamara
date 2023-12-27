import React, { Component } from 'react';

//Imagen

// Icones

// Components

//mudança de páginas

class CategoriasDesktop extends Component {
    state = {
        categories: [
            {
                id: '1',
                icon: 'https://github.com/teceudesenvolvo/e-list-1/blob/master/src/assets/ICONS%20FOR%20SITE_Prancheta%201%20c%C3%B3pia.png?raw=true',
                desc: 'Carros'
            }, 
            {
                id: '2',
                icon: 'https://github.com/teceudesenvolvo/e-list-1/blob/master/src/assets/ICONS%20FOR%20SITE_Prancheta%201%20c%C3%B3pia%205.png?raw=true',
                desc: 'Cursos'
            },
            {
                id: '3',
                icon: 'https://github.com/teceudesenvolvo/e-list-1/blob/master/src/assets/ICONS%20FOR%20SITE_Prancheta%201.png?raw=true',
                desc: 'Beleza'
            },
            {
                id: '5',
                icon: 'https://github.com/teceudesenvolvo/e-list-1/blob/master/src/assets/ICONS%20FOR%20SITE_Prancheta%201%20c%C3%B3pia%203.png?raw=true',
                desc: 'Pet'
            },
            {
                id: '6',
                icon: 'https://github.com/teceudesenvolvo/e-list-1/blob/c4bfe182cce56ed1026de8834e95903bd2c2bd38/src/assets/ICONS%20FOR%20SITE__Prancheta%201%20c%C3%B3pia%202.png?raw=true',
                desc: 'Esportes'
            },
            {
                id: '7',
                icon: 'https://github.com/teceudesenvolvo/e-list-1/blob/master/src/assets/ICONS%20FOR%20SITE_Prancheta%201%20c%C3%B3pia%204.png?raw=true',
                desc: 'Jogos'
            },
        ]
    }

   


    render() {
        const categories = this.state.categories 

        if(categories.length > 7){
            categories.length = 7
        }
       

        const listCategories = categories.map((categorie) => 
        <li key={(categorie.id)} className="categoriasIte"

        onClick={
            () => {
                window.location.href = "/categorias"
              // this.setState({id: aviso.id}, () => {
              // (this.props.clickButton(this.state))
          //   }
          }
          }



        // onClick={
        //   () => {this.setState({id: aviso.id}, () => {
        //     (this.props.clickButton(this.state))
        //     (window.location.href = "/item")
        //   })}
        // }
        >
                <img alt="logomarca" src={categorie.icon} width="50%" className='iconCategori'/>
                <p className='descricaoCategori' >{categorie.desc}</p>
      </li>
    )


        return (
            <>
                <ul className='categoriasHom'>
                    {listCategories}
                </ul>
            </>

        );
    }
}

export default CategoriasDesktop;