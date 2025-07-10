import React from 'react';




//Imagens
import utiliderImg from '../../assets/utilider.png';
// Icones
import {
  FaStar,
  FaCcMastercard,
  FaCcVisa,
  FaCcAmex,
  FaCcJcb,
  FaCcDiscover,
  FaHome,
  FaShoppingCart,
  
} from 'react-icons/fa';

// Components


//mudança de páginas
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Divider from '@mui/material/Divider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';



const Transition2 = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="dom" ref={ref} {...props} />;
});

const Transition3 = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});




export default function Carrinho() {

  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);


  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const handleClickOpen3 = () => {
    setOpen3(true);
  };

  const handleClose3 = () => {
    setOpen3(false);
  };


  return (

    <div className='App-header' >
      <div className='utilider-container'>
        <div className='utilider-header'>
          <a href='/'  ><FaHome className='utilider-icon' /></a>
          <img className='utilider-img'
          alt='logo marca utilider'
            onClick={
              () => {
                window.location.href = "/utilider"
              }
            }
            src={utiliderImg}></img>
          <a href='/carrinho'  >< FaShoppingCart className='utilider-icon' /></a>
        </div>
        <div className="ProdutoCardUtilider">
          <img alt='produto' src='https://utilider.com/wp-content/uploads/2022/04/BATERIA-ALFACELL-LITHIUM-3V-CARTELA-C-2.webp'>
          </img>
          <div className="ProdutoCardUtilider-desc">
            <div className="ProdutoCardUtilider-Titulo">
              <p>Titulo do produto</p>
            </div>
            <div className="ProdutoUtilider-cd-desc">
              <p>R$ 190,00</p>
              <p>Descrição do produto</p>
            </div>



          </div>
        </div>
        <div className="ProdutoCardUtilider">
          <img alt='produto' src='https://utilider.com/wp-content/uploads/2022/04/BATERIA-ALFACELL-LITHIUM-3V-CARTELA-C-2.webp'>
          </img>
          <div className="ProdutoCardUtilider-desc">
            <div className="ProdutoCardUtilider-Titulo">
              <p>Titulo do produto</p>
            </div>
            <div className="ProdutoUtilider-cd-desc">
              <p>R$ 190,00</p>
              <p>Descrição do produto</p>
            </div>



          </div>
        </div>
       



        <div class="FreteCardUtilider">
          <h5>Entrega</h5>
          <FormControl>

            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
            >
              <FormControlLabel sx={{ color: "#c7c7c7", marginLeft: '10px', }} value="Taxa Fixa - R$ 25,00" control={<Radio />} label="Taxa Fixa - R$ 25,00" />
              <FormControlLabel sx={{ color: "#c7c7c7", marginLeft: '10px', }} value="Retirada no local" control={<Radio />} label="Retirada no local" />

            </RadioGroup>
          </FormControl>
        </div>

        <div className='price-buttomUtilider' >
          <div >
            <h5 >Subtotal</h5>
            <h5 >R$ 60,00</h5>

          </div>

          <input onClick={handleClickOpen2}
            type='button' value="Comprar" />
        </div>
      </div>


      <Dialog
        fullScreen
        open={open2}
        onClose={handleClose2}
        TransitionComponent={Transition2}
      >
        <div className='utilider-header'>
          <a href='/'  ><FaHome className='utilider-icon' /></a>
          <img className='utilider-img'  alt='logo marca utilider' src={utiliderImg}></img>
          <a href='/carrinho'  ><FaShoppingCart className='utilider-icon' /></a>
        </div>

        <AppBar sx={{
          position: 'relative',
          boxShadow: '0px 2px 4px -1px rgb(255, 255, 255),0px 4px 5px 0px rgb(255, 255, 255),0px 1px 10px 0px rgb(255, 255, 255)'

        }}>
          <Toolbar sx={{ backgroundColor: '#fff' }}>
            <IconButton
              edge="start"
              onClick={handleClose2}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <div >
              <Typography sx={{ ml: 1, color: '#000', marginTop: '0px' }} variant="h6" component="div" >
                Realizar Pagamento
              </Typography>


            </div>

          </Toolbar>
        </AppBar>
        <List sx={{ marginBottom: '90px' }}>
          <Divider />
          <div className="divPagamento">
            <div>
              <Typography sx={{ ml: 1, color: '#000', marginTop: '8px' }} variant="h7" component="div" >
                Seu serviço
              </Typography>
              <Typography sx={{ ml: 1, color: '#797979', marginTop: '5px' }} variant="p" component="div" >
                Serviço
              </Typography>
              <Typography sx={{ ml: 1, color: '#797979', marginTop: '5px' }} variant="p" component="div" >
                Taxa de serviço
              </Typography>
              <Typography sx={{ ml: 1, color: '#797979', marginTop: '25px', marginBottom: '8px' }} variant="p" component="div" >
                total
              </Typography>
            </div>
            <div>

              <Typography sx={{ ml: 1, color: '#797979', marginTop: '28px' }} variant="p" component="div" >
                R$ 60,00
              </Typography>
              <Typography sx={{ ml: 1, color: '#797979', marginTop: '5px' }} variant="p" component="div" >
                R$ 6,00
              </Typography>
              <Typography sx={{ ml: 1, color: '#797979', marginTop: '25px', marginBottom: '8px' }} variant="p" component="div" >
                R$ 66,00
              </Typography>
            </div>
          </div>
          <Divider />
          <div className="divPagamento">
            <div>
              <Typography sx={{ ml: 1, color: '#000', marginTop: '8px' }} variant="h7" component="div" >
                Pagar com :   ViSA 8888
              </Typography>
              <Typography sx={{ ml: 1, color: '#797979', marginTop: '5px', marginBottom: '10px' }} variant="p" component="div" >
                Cartão de crédito ou debito
              </Typography>
              <FaCcMastercard className='Cards' ></FaCcMastercard>
              <FaCcVisa className='Cards' ></FaCcVisa>
              <FaCcAmex className='Cards' ></FaCcAmex>
              <FaCcJcb className='Cards' ></FaCcJcb>
              <FaCcDiscover className='Cards' ></FaCcDiscover>
            </div>
            <div> <button onClick={handleClickOpen3}>adicionar</button></div>
          </div>
          <Divider />
          <div>
            <Typography sx={{ ml: 1, color: '#000', marginTop: '8px' }} variant="h7" component="div" >
              Politica de cancelamento
            </Typography>
            <Typography sx={{ ml: 1, color: '#797979', marginTop: '5px' }} variant="p" component="div" >
              Cancelamento gratuito poderá ser solicitado 12 horas antes do horário agendado. Você reberá o reembolso menos a taxa de serviço.
            </Typography>
          </div>
        </List>


        {/* <Button autoFocus color="inherit" onClick={handleClose}>
              Horários
            </Button> */}

        <div className='price-buttom price-buttom-calendar' backgroundColor='white' >

          <div >
            <h5>R$ 60,00</h5>
            <h5> <FaStar color='#FF7A00' /> 4,9</h5>
          </div>

          <input
            onClick={
              () => {
                window.location.href = "/pagamentoUtilider"
                // this.setState({id: aviso.id}, () => {
                // (this.props.clickButton(this.state))
                //   }
              }
            }

            type='button' value="Concluir" />
        </div>

      </Dialog>

      <Dialog
        fullScreen
        open={open3}
        onClose={handleClose3}
        TransitionComponent={Transition3}
      >
        <div className='utilider-header'>
          <a href='/'  ><FaHome className='utilider-icon' /></a>
          <img className='utilider-img'  alt='logo marca utilider' src={utiliderImg}></img>
          <a href='/carrinho'  ><FaShoppingCart className='utilider-icon' /></a>
        </div>

        <AppBar sx={{
          position: 'relative',
          boxShadow: '0px 2px 4px -1px rgb(255, 255, 255),0px 4px 5px 0px rgb(255, 255, 255),0px 1px 10px 0px rgb(255, 255, 255)'

        }}>
          <Toolbar sx={{ backgroundColor: '#fff' }}>
            <IconButton
              edge="start"
              onClick={handleClose3}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <div >
              <Typography sx={{ ml: 1, color: '#000', marginTop: '0px' }} variant="h6" component="div" >
                Informações de  Pagamento
              </Typography>


            </div>

          </Toolbar>
        </AppBar>
        <List sx={{ marginBottom: '90px' }}>
          <form className='cartao'>
            <input type="number" placeholder="Número do cartão" className='inputCartao' />
            <div  >
              <input type="number" placeholder="Validade" className='inputCartao' />
              <input type="number" placeholder="CVV" className='inputCartao' />
            </div>

            <input type="text" placeholder="Nome" className='inputCartao' />
            <input type="text" placeholder="Sobre Nome" className='inputCartao' />
            <input type="number" placeholder="CPF" className='inputCartao' />

          </form>
          <Divider />
          <div>
            <Typography sx={{ ml: 1, color: '#000', marginTop: '8px' }} variant="h7" component="div" >
              Politica de cancelamento
            </Typography>
            <Typography sx={{ ml: 1, color: '#797979', marginTop: '5px' }} variant="p" component="div" >
              Cancelamento gratuito poderá ser solicitado 12 horas antes do horário agendado. Você reberá o reembolso menos a taxa de serviço.
            </Typography>
          </div>
        </List>


        {/* <Button autoFocus color="inherit" onClick={handleClose}>
              Horários
            </Button> */}

        <div className='price-buttom price-buttom-calendar' backgroundColor='white' >

          <div >
            <h5>R$ 60,00</h5>
            <h5> <FaStar color='#FF7A00' /> 4,9</h5>
          </div>

          <input
            onClick={handleClose3}

            type='button' value="Adicionar cartão" />
        </div>

      </Dialog>
    </div>
  );

}

