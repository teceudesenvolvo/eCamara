import {OPEN_SERVICE, VISIT_REGISTER, USER_LOGGED_IN, USER_LOGGED_OUT, OPEN_PRODUCT} from './actionType'
import axios from 'axios'

const authBaseURL = 'https://www.googleapis.com/identitytookit/v3/realyingparty'
const API_KEY = 'AIzaSyARJhClRUouS0OCKm1YzdNna-ayyTRZjwU'

export const clickButton = product => ({
  type: OPEN_PRODUCT,
  payload: product,
})

export const openServico = service => ({
  type: OPEN_SERVICE,
  payload: service,
})

export const visitRegister = (event) => ({
  type: VISIT_REGISTER,
  payload: event.target.value
})

export const LoggedIn = user => ({
  type: USER_LOGGED_IN,
  payload: user
})

export const LoggedOut = () => ({
  type: USER_LOGGED_OUT
})


export const createUser = user => {
  return dispatch => {
    axios.post(`${authBaseURL}/signupNewUser?key${API_KEY}`, {
      email: user.email,
      password: user.password,
      returnSecureToken: true
    })
    .catch(err => console.log(err))
    .then(res => {
      if(res.data.localId){
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
