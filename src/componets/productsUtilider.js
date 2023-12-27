import React, { Component } from 'react';

//Imagen

// Icones


// Components


//mudança de páginas

class ProductsUtilider extends Component {
    state = {
        products: [
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/BATERIA-ALFACELL-LITHIUM-3V-CARTELA-C-2.webp',
                desc: 'Descrição do serviço 1',
                value: '192,50' 
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/PILHA-ALFACELL-COMUM-PQ-AA-1.5V-C-4-CARTELA.webp',
                desc: 'Descrição do serviço 1',
                value: '192,50' 
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/PISTOLA-PCOLA-QUENTE.webp',
                desc: 'Descrição do serviço 1',
                value: '192,50' 
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/VDA06020-PETISQUEIRA-DE-VIDRO-D.webp',
                desc: 'Descrição do serviço 1',
                value: '192,50' 
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/POTE-C-TAMPA-CLEAN-PRA.jpg',
                desc: 'Descrição do serviço 1',
                value: '192,50' 
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/tabua-bambu-nv.webp',
                desc: 'Descrição do serviço 1',
                value: '192,50' 
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/JARRA-DE-VIDRO-LOSANGO-416x416.jpg',
                desc: 'Descrição do serviço 1',
                value: '192,50' 
            }, 
            {
                id: '1',
                image: 'https://utilider.com/wp-content/uploads/2022/04/POTE-DE-VIDRO-RT-C-DIV.jpg',
                desc: 'Descrição do serviço que vai',
                value: '192,50' 
            }, 
        ]
    }

   


    render() {
        const products = this.state.products 

        if(products.length > 10){
            products.length = 10
        }
        
        const listCategories = products.map((product) => 
        <li key={(product.id)} className="productItemUtilider"
        onClick={
          () => {
              window.location.href = "/produto"
            // this.setState({id: aviso.id}, () => {
            // (this.props.clickButton(this.state))
        //   }
        }
        }
        >
                <img src={product.image} width="50%" className='imgProduct'/>
            <div className='areaTextDescProductU' >
                <p className='valueProduct' >R$ {product.value}</p>
                <p className='descricaoProduct' >{product.desc}</p>
                
            </div>
      </li>
    )


        return (
            <>
                <ul className='vistosHome'>
                    {listCategories}
                </ul>
            </>

        );
    }
}

export default ProductsUtilider;