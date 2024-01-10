import React, { Component } from 'react';



//Imagens

// Icones

// Components


//mudança de páginas

class Perfil extends Component {
    render() {
        return (

            <div className='App-header' >
                <div className='favoritos agendarConsulta'>



                    <ul className='vistosHome'>

                        {/* Informações Pessoais */}
                        <h1 className='titleList'>Informações Pessoais</h1>
                        <li className="favoritoItem vacinaItem">
                            <div className='areaTextDescProduct' >
                                <p className='descricaoProduct' ><b>Nome Completo</b></p>
                                <p className='descricaoProduct authorProduct' >Nascimento: 03/11/1997</p>
                                <p className='descricaoProduct' >Sexo: <b>Masculino</b></p>
                                <p className='descricaoProduct' >Tipo Sanguineo: <b>O-</b></p>
                                <p className='descricaoProduct' >CPF:</p>
                                <p className='descricaoProduct' >RG:</p>
                                <p className='descricaoProduct' >CNS: <b>123 1234 1234 1234</b></p>
                                <p className='descricaoProduct' >Endereço: Rua Qualquer de nós, 1234 - Bairro</p>
                                <p className='descricaoProduct' >Telefone: 85 99999-1213</p>
                                <p className='descricaoProduct' >Email: teste@teste.com</p>
                            </div>
                        </li>


                        {/* Alergias List */}
                        <h1 className='titleList'>Alergias</h1>
                        <li className="favoritoItem vacinaItem">
                            <div className='areaTextDescProduct' >
                                <ul className='vistosHome'>
                                    <li><p className='descricaoProduct'>Alergia 1</p></li>
                                    <li><p className='descricaoProduct'>Alergia 2</p></li>
                                    <li><p className='descricaoProduct'>Alergia 3</p></li>
                                </ul>

                            </div>
                        </li>


                        {/* Medicações COntroladas */}
                        <h1 className='titleList'>Medicações Controladas</h1>
                        <li className="favoritoItem vacinaItem">
                            <div className='areaTextDescProduct' >
                                <ul className='vistosHome'>
                                    <li><p className='descricaoProduct'>Medicação Controlada 1</p></li>
                                    <li><p className='descricaoProduct'>Medicação Controlada 2</p></li>
                                    <li><p className='descricaoProduct'>Medicação Controlada 3</p></li>
                                </ul>

                            </div>
                        </li>


                        {/* Tratamentos */}
                        <h1 className='titleList'>Tratamentos</h1>
                        <li className="favoritoItem vacinaItem">
                            <div className='areaTextDescProduct' >
                                <ul className='vistosHome'>
                                    <li><p className='descricaoProduct'>Tratamento: Protocolo Num</p></li>
                                    <li><p className='descricaoProduct'>Tratamento: Protocolo Num</p></li>
                                    <li><p className='descricaoProduct'>Tratamento: Protocolo Num</p></li>
                                </ul>

                            </div>
                        </li>




                        {/* Vacinas */}
                        <h1 className='titleList'>Vacinas Aplicadas</h1>
                        <li className="favoritoItem vacinaItem">
                            <div className='areaTextDescProduct' >
                                <ul className='vistosHome'>
                                    <li><p className='descricaoProduct'>Vacina Covid ASTRAZENECA</p></li>
                                    <li><p className='descricaoProduct'>Vacina Covid 19 - RNAM</p></li>
                                    <li><p className='descricaoProduct'>Triplice Viral</p></li>
                                </ul>

                            </div>
                        </li>



                    </ul>
                    <input className='btnHomeAcess btnCadastroHome buttonLogin' type="button" value="Medicamentos"
                        onClick={
                            () => {
                                window.location.pathname = '/login'
                            }
                        }
                    />
                    <p><a href='/' className='linkLogin'>Sair da conta</a></p>
                </div>
            </div>

        );
    }
}

export default Perfil;