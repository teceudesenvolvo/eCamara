import React, { Component } from 'react';

//Imagens
import logo from '../../assets/e-compras-laranja-05.png';

// Libs
import { cpf } from 'cpf-cnpj-validator';
import axios from 'axios';
// import { initializeApp } from "firebase/app";
// import {firebaseConfig} from '../../firebase';


// Components

//mudança de páginas

// Cofigurações
// const app = initializeApp(firebaseConfig) 

class register extends Component {
  state={
      placeCNPJ:'CNPJ*',
      placeName:'Razão Social*',
      placeFantasia:'Nome Fantasia*',
      placeAtividade:'Atividade Principal*',
      placePorte:'Porte da Empresa*',
      placeIncricaoEstadual:'Incrição Estadual*',
      placeIncricaoMunicipal:'Inscrição Municipal*',
      placeEmail:'Email*',
      placePassword:'Senha*',
      placePasswordConfirmed:'Confirmação de Senha*',
      placeTel:'Telefone*',
      placeEndereço:'Endereço da Empresa*',
      placeBairro:'Bairro da Empresa*',
      placeMunicipio:'Municipio da Empresa*',
      placeUF:'Estado da Empresa*',
      placeCEP:'CEP*',
      placeNumberBilling:'Número*',
      placeNumberRepresentante:'Representante Legal*',
      placeNumberRGrepresentante:'RG*',
      placeNumberCPFrepresentante:'CPF*',
      placeNumberTELrepresentante:'Telefone do Representante*',
      name: '',
      cpf: '',
      cnpj:'',
      email: '',
      password: '',
      passwordConfirmed: '',
      tel: '',
      cep: '',
      adress:'',
      numberBilling: '',
      classInput: 'inputLogin',  
      classInput1: 'inputLogin', 
      classInput2: 'inputLogin', 
      classInput3: 'inputLogin', 
      classInput4: 'inputLogin', 
      classInput5: 'inputLogin', 
      classInput6: 'inputLogin', 
      classInput7: 'inputLogin', 
  }

  changeCep = () => {
    this.setState({
      adress: 'Carregando...',
      bairro: 'Carregando...',
      cidade: 'Carregando...',
      estado: 'Carregando...',
    })
    axios.get(`https://viacep.com.br/ws/${this.state.cep}/json`)
      .then((res) => {
        this.setState({
          adress: `${res.data.logradouro}, ${res.data.bairro}, ${res.data.localidade} - ${res.data.uf}`,
          classInput6: 'inputLogin'
        })
      })
      .catch((erro) => {
        this.setState({ placeCEP: 'Cep Invalido', classInput6: 'txtErro' })
        console.log(erro)
      })
  }

  // Buscar Dados do CNPJ

  changeCNPJ = () => {
    if(this.state.cnpj){
      this.setState({
        razaoSocial: 'Carregando...',
        nomeFantasia: 'Carregando...',
        porte: 'Carregando...',
        telefone: 'Carregando...',
        atividade: 'Carregando...',
        adress: 'Carregando...',
        numero: 'Carregando...',
        bairro: 'Carregando...',
        municipio: 'Carregando...',
        uf: 'Carregando...',
        email: 'Carregando...',
      })
      axios.get(`https://api-publica.speedio.com.br/buscarcnpj?cnpj=${this.state.cnpj}`)
        .then((res) => {
          console.log(res.data)
          this.setState({
            razaoSocial: `${res.data['RAZAO SOCIAL']}`,
            nomeFantasia: `${res.data['NOME FANTASIA']}`,
            telefone: `${res.data['DDD']} ${res.data['TELEFONE']}`,
            atividade: `${res.data['CNAE PRINCIPAL DESCRICAO']}`,
            adress: `${res.data['TIPO LOGRADOURO']} ${res.data['LOGRADOURO']} ${res.data['COMPLEMENTO']}`,
            numero: `${res.data['NUMERO']}`,
            bairro: `${res.data['BAIRRO']}`,
            municipio: `${res.data['MUNICIPIO']}`,
            uf: `${res.data['UF']}`,
            status: `${res.data['STATUS']}`,
            email: `${res.data['EMAIL']}`,
            classInput6: 'inputLogin'
          })
        })
        .catch((erro) => {
          this.setState({ placeCNPJ: 'CNPJ Invalido', classInput1: 'txtErro' })
          console.log(erro)
        })
    }else{
      this.setState({ placeCNPJ: 'Digite o CNPJ', classInput1: 'txtErro' })
    }
  }


  render() {
    return (
      <div className='App-header' >
        <div className='Container' >
          <img src={logo} alt="logo" className='logo' />
          <h1>Seja bem-vindo!</h1>
          <form className='formLogin'>

            {/* CNPJ */}
            <input 
            value={this.state.cnpj} 
            onChange={
              (event) => this.setState({ cnpj: event.target.value })
            } 
            type="text" placeholder={this.state.placeCNPJ} className={this.state.classInput} />            
            

            {/* Razão Social */}
            <input 
             onFocus={()=>{

                if (this.state.cnpj === '') {
                  this.setState({ placeCNPJ: 'Digite o CNPJ', classInput: 'txtErro' })
                }
                else if (this.state.status === 'INAPTA') {
                  this.setState({ razaoSocial: 'Sua empresa está em INAPTA', classInput: 'txtErro' })
                }else{
                  this.setState({classInput1: 'inputLogin' })
                }
                
                this.changeCNPJ()

              }}
            value={this.state.razaoSocial} 
            onChange={(event) => this.setState({ razaoSocial: event.target.value })}
            type="text" placeholder={this.state.placeName} className={this.state.classInput1} />

            {/* Nome Fantasia */}
            <input 
            value={this.state.nomeFantasia} 
            onChange={(event) => this.setState({ nomeFantasia: event.target.value })}
            type="text" placeholder={this.state.placeFantasia} className={this.state.classInput1} 
            />

            
            {/* Atividade Principal */}
            <input 
            value={this.state.atividade} 
            onChange={(event) => this.setState({ atividade: event.target.value })}
            type="text" placeholder={this.state.placeAtividade} className={this.state.classInput1} 
            />


            {/* Telefone */}

            <input 
            value={this.state.telefone} onChange={(event) => this.setState({ tel: event.target.value })}
            type="text" placeholder={this.state.placeTel} className={this.state.classInput5} />



            {/* Endereço */}
            <input 
            value={this.state.adress}
            onChange={(event) => this.setState({ adress: event.target.value })}
            type="text" placeholder={this.state.placeEndereço} className={this.state.classInput1} 
            />

            {/* Número */}
            <input 
            value={this.state.numero} onChange={(event) => this.setState({ numero: event.target.value })}
            type="text" placeholder={this.state.placeNumberBilling} className={this.state.classInput7} />


            {/* UF */}
            <input 
            value={this.state.uf}
            onChange={(event) => this.setState({ uf: event.target.value })}
            type="text" placeholder={this.state.placeUF} className={this.state.classInput1} 
            />
            {/* Municipio */}
            <input 
            value={this.state.municipio}
            onChange={(event) => this.setState({ municipio: event.target.value })}
            type="text" placeholder={this.state.placeMunicipio} className={this.state.classInput1} 
            />

            {/*  Bairro  */}
            
            <input 
            value={this.state.bairro} onChange={(event) => this.setState({ bairro: event.target.value })}
            onFocus={
              ()=>{
                if(this.state.passwordConfirmed === ""){
                  this.setState({ placePasswordConfirmed: 'Confirmação de senha está diferente', classInput4: 'txtErro' })
                }else if(this.state.passwordConfirmed !== this.state.password){
                  this.setState({ placePasswordConfirmed: 'Confirmação de senha está diferente', classInput4: 'txtErro' })
                }
                else{
                  this.setState({classInput4: 'inputLogin' })
                }
              }
            }
            type="text" placeholder={this.state.placeBairro} className={this.state.classInput6} />
            
            
            {/* Email */}

            <input 
            value={this.state.email} 
            onFocus={
              () => {
                   // Validação de CPF
                   if (cpf.isValid(this.state.cpf) === false) {
                    this.setState({ placeCPF: 'Digite um CPF válido', classInput: 'txtErro' })
                  }else{
                    this.setState({classInput2: 'inputLogin' })
                  }
              }
            }
            onChange={(event) => this.setState({ email: event.target.value })}
            type="text" placeholder={this.state.placeEmail} className={this.state.classInput2} />
            

            {/* Senha */}

            <input 
            value={this.state.password} onChange={(event) => this.setState({ password: event.target.value })}
            onFocus={
              ()=>{
                if (this.state.email === '') {
                  this.setState({ placeEmail: 'Digite sua email', classInput3: 'txtErro' })
                } else if (this.state.email.includes('@') === false) {
                  this.setState({ placeEmail: 'Digite um email válido', classInput3: 'txtErro' })
                } else if (this.state.email.includes('.') === false) {
                  this.setState({ placeEmail: 'Digite um email válido', classInput3: 'txtErro' })
                } else if (this.state.email.length < 8) {
                  this.setState({ placeEmail: 'Digite um email válido', classInput3: 'txtErro' })
                }else{
                  this.setState({classInput3: 'inputLogin' })
                }
              }
            }
            type="password" placeholder={this.state.placePassword} className={this.state.classInput3} />
            

            {/* Confirmação de Senha */}
            
            <input 
            value={this.state.passwordConfirmed} onChange={(event) => this.setState({ passwordConfirmed: event.target.value })}
            onFocus={
              ()=>{
                if (this.state.password === '') {
                  this.setState({ placePassword: 'Digite seu senha', classInput4: 'txtErro' })
                } else if (this.state.password.length < 6) {
                  this.setState({ placePassword: 'Digite uma senha segura, maior que 6 caracteres com números e letras', classInput4: 'txtErro' })
                } else{
                  this.setState({classInput4: 'inputLogin' })
                }
              }
            }
            type="password" placeholder={this.state.placePasswordConfirmed} className={this.state.classInput4} />
            




            {/* <div className="checkbox-politicas">
              <input type="checkbox" placeholder="Complemento" className='inputLogin' />
              <p> Concordo com os termos de uso e as politicas de privacidade. </p>
            </div> */}

            

          </form> 

            <button
              onClick={(
                () => {
                    if(this.state.numberBilling === ""){
                      this.setState({ placeNumberBilling: 'O número da casa', classInput6: 'txtErro' })
                    }

                    else {
                      this.createUser()
                    }
                }
            )}
            className='buttonLogin'>Cadastrar</button>
            <p>já tem uma conta? <a href='/login' className='linkLogin'>Fazer login</a></p>

        </div>

      </div>
    );
  }
}

export default register;