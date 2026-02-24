import {OPEN_SERVICE, VISIT_REGISTER, USER_LOGGED_IN, USER_LOGGED_OUT, OPEN_PRODUCT} from './actionType'
import axios from 'axios'
import { Dispatch } from 'redux';

const authBaseURL = 'https://www.googleapis.com/identitytookit/v3/realyingparty'
const API_KEY = 'AIzaSyARJhClRUouS0OCKm1YzdNna-ayyTRZjwU'

export const clickButton = (product: any) => ({
  type: OPEN_PRODUCT,
  payload: product,
})

export const openServico = (service: any) => ({
  type: OPEN_SERVICE,
  payload: service,
})

export const visitRegister = (event: React.ChangeEvent<HTMLInputElement>) => ({
  type: VISIT_REGISTER,
  payload: event.target.value
})

export const LoggedIn = (user: any) => ({
  type: USER_LOGGED_IN,
  payload: user
})

export const LoggedOut = () => ({
  type: USER_LOGGED_OUT
})

interface UserData {
  email: string;
  password?: string;
  name?: string;
  telefone?: string;
}

export const createUser = (user: UserData) => {
  return (dispatch: Dispatch) => {
    axios.post(`${authBaseURL}/signupNewUser?key${API_KEY}`, {
      email: user.email,
      password: user.password,
      returnSecureToken: true
    })
    .catch(err => console.log(err))
    .then(res => {
      if(res && res.data && res.data.localId){
        axios.put(`/users/${res.data.localId}.json`,{
          name: user.name,
          telefone: user.telefone
        })
        .catch(err => console.log(err))
        .then(res => {
          console.log('Bem vindo ao eudesenvolvo.com')
        })
      }
    })
  }
}