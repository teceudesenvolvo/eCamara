import React, { Component } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import axios from 'axios'

// use Redux
import { connect } from 'react-redux'
import { clickButton } from '../store/actions/index'
import { bindActionCreators } from 'redux';

// Default theme
import '@splidejs/react-splide/css';


// or other themes
import '@splidejs/react-splide/css/skyblue';
import '@splidejs/react-splide/css/sea-green';


// or only core styles
import '@splidejs/react-splide/css/core';

//Imagen

//mudança de páginas

class slideFeactures extends Component {
    constructor(props) {
        super(props)
        this.state = {
            posts: []
        }
    }
    loadNoticias = async () => {
        await axios.get(`https://sapl.saogoncalodoamarante.ce.leg.br/api/parlamentares/legislatura/19/parlamentares/?get_all=true`)
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
        const posts = this.state.posts

        const listPosts = posts.map((post) =>
            <SplideSlide key={post.id} className="slidesFeacture"
                onClick={
                    () => {
                        this.setState({ id: post.id }, () => {
                            (this.props.clickButton(this.state))
                            console.log(this.state)
                                // (window.location.href = "/produto")

                        })
                    }
                }
            >
                <img class="imagDestaques" src={post.fotografia} alt=""></img>
                <div class="DestaquesDescricao" >
                    <h5>{post.nome_parlamentar}</h5> 
                    <p>Partido: {post.partido}</p> 
                </div>
            </SplideSlide>
        )


        return (
            <>
                <Splide
                    options={{
                        perPage: 3,
                        focus: 'center',
                        drag: 'free'
                    }} aria-label="My Favorite Images" className='slideMatriz' >
                    {listPosts}
                </Splide>
            </>

        );
    }
}

const mapStateToProps = state => ({
    idProduct: state.service.id
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ clickButton }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(slideFeactures);
