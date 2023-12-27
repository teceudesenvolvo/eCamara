import React, { Component } from 'react';
import axios from 'axios'

//Imagen

// Icones


// Components

//mudança de páginas

class ProductsList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            posts: []
        }
    }
    loadNoticias = async () => {
        await axios.get(`https://www.maracanau.ce.gov.br/wp-json/wp/v2/posts`)
            .catch(err => console.log(`o erro foi esse aqui: ${err}`))
            .then(
                res => {
                const postsAll = res.data
                let posts = []
                for (let key in postsAll){
                    posts.push({
                        ...postsAll[key],
                        id: key
                    })
                }
                this.setState({posts: posts})
                console.log(res.data)
            })

    }

    componentDidMount(){
        const loadPage = () => this.loadNoticias()
        loadPage()
    }


   


    render() {
        const posts = this.state.posts.reverse()
        
        if(posts.length > 1){
            posts.length = 1
        }
        
        const listPosts = posts.map((post) => 

        <li key={(post.id)} className="hero"
        onClick={
          () => {
            //   window.location.href = "/Servico"
            // this.setState({id: aviso.id}, () => {
            // (this.props.clickButton(this.state))
        //   }
        }
        }
        >
                <img alt='imagem do serviço' src={post.yoast_head_json.og_image[0].url}  className=' heroImg'/>
            <div className='areaTextDescProduct heroDesc' >
                <p className='descricaoProduct' >{post.yoast_head_json.title}</p>
                {/* <p className='descricaoProduct authorProduct' >{post.yoast_head_json.og_site_name}</p> */}
            </div>
      </li>
    )


        return (
            <>
                <ul className='vistosHome heroDiv'>
                    {listPosts}
                </ul>
            </>

        );
    }
}

export default ProductsList;
