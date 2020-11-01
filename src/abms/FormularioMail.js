import React from 'react';
import {useState, useEffect, useRef} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faDotCircle } from '@fortawesome/free-regular-svg-icons';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';

export default function AbmAula({seleccionados, finalizarEnvio, usuario}){

    // estados flags 
    const [cargandoDatos,setCargandoDatos] = useState(false);
    const [grabandoDatos,setGrabandoDatos] = useState(false);
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [adjunto,setAdjunto]=useState(null)
    const [mail,setMail]=useState({asunto:'',mensaje:'',adjunto:null})
    const [camposValidos,setCamposValidos]=useState(false)
    const [errores,setErrores]=useState({asunto:'',mensaje:'',adjunto:null})
    // vectores de selección de formulario

       const [objetoInicializacion,setObjetoInicializacion]=useState({
        asunto:'', mensaje:'', cc: '', bcc :'',adjunto:''
        })


const formikRef = React.useRef();

useEffect(()=>{

    if (seleccionados.destinatarios.length==0){
        Swal.fire({
            html:'<p>No hay direcciones de correo válidas para poder enviar un mensaje</p>',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })
        setHuboError(true)
        return
    }

    const mails = seleccionados.destinatarios.split(',')

    if (mails.length===0){
        Swal.fire({
            html:'<p>No hay direcciones de correo válidas para poder enviar un mensaje</p>',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })
        setHuboError(true)
        return
    }

    setTimeout(() => {
        hacerfocoEnPrimerInput('abm-asunto')
    }, 100);

},[])

useEffect(()=>{

  if (mail.asunto!="" && mail.mensaje!=""){
      setCamposValidos(true)
  }else{
      setCamposValidos(false)
  }

  if (mail.asunto.length>100 || mail.mensajelength>1000){
    setCamposValidos(false)
}

},[mail])


const grabarDatos = async (values)=>{

    const data = new FormData();

    console.log('usuario',usuario)

    data.append('adjunto', mail.adjunto);
    data.append('asunto', mail.asunto);
    data.append('mensaje', mail.mensaje);
    data.append('destinatarios', seleccionados.destinatarios);
    data.append('usuario',usuario.nombre);
    data.append('id_region',usuario.id_region);

  //  console.log('objetoAgrabar',objetoAgrabar)
    setGrabandoDatos(true)

    let mensaje_html = `<p>El mensaje se envió correctamente</p>`

    try{

        const respuesta = await Axios.post('/api/tablasgenerales/enviarmail',data)
        const resultado = ''

            if (respuesta.data.rejected.length>0){
            resultado = respuesta.rejected.reduce((ac,valor)=>{
                return ac + '' + valor
            })
            mensaje_html = `<p>Hay correos que no recibieron el mensaje ${resultado}</p>`
        }

        
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })
        .then(()=>{
            finalizarEnvio(true)
        })   

        setGrabandoDatos(false)
    }catch(err){    

        let mensaje_html_error;

        if (err.response.data.message){
            mensaje_html_error = 
            `<p>No se envió el mensaje</p>
            <p>${err.response.data.message}</p>`
        }else{
            mensaje_html_error = 
            `<p>No se envió el mensaje</p>
            <p>${err}</p>`
        }


        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatos(false)
    }
   

}


const validarMail = ()=>{

    let mensaje_html_error = ""; 

    if (mail.adjunto){
        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(mail.adjunto.type)) {
           
            mensaje_html_error = 
            `<p>El tipo de archivo no es válido</p>
            <p>Por favor adjunte solo archivos de imágenes o documentos pdf</p>`
    
            Swal.fire({
                html:mensaje_html_error,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })   
    
            
            return false
        }

        const size = mail.adjunto.size / 1024 / 1024

        if ( size > 5) {
           
            mensaje_html_error = 
            `<p>El tamaño del archivo es demasiado grande</p>
            <p>Por favor seleccione un archivo que no supere los 5MG</p>`
   
            Swal.fire({
                html:mensaje_html_error,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })   
    
            
            return false
        }
    }

    if (mail.asunto.trim()==="" || mail.mensaje.trim()===""){
        mensaje_html_error = 
        `<p>Los campos asunto y mensaje son obligatorios</p>
        <p>Por favor complete todos los campos</p>`

        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   

        return false
    }

    return true
}

const iniciarGrabar = (e)=>{

    e.preventDefault()

    if (!validarMail()){
        return
    }

   
    let texto;
    let textoConfirmacion;

        texto = `¿Confirma el envío del mensaje?`
        textoConfirmacion = 'Si, enviar el mensaje'

    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
//                grabarDatos(values);
                grabarDatos();

            }else{
                console.log("Se canceló el envío del mensaje")
            }
        }
    )
}

// Se carga directamente al traer los datos del alumno
/*const initialValuesAlumno = {

} */ 

// es un objeto cuyas propiedades deben coincidir con el nombre
                              // de los Fields y con el nombre del validationSchema

// algunas entidades comienzan de 1 y otras aceptan el valor 0 por eso
// en algunos casos valido con .positive() para los que comienzan de 1, porque positive() excluye el cero
// en otros valido con min(0) para los que comienzan de 0                              
// el .test lo dejo como ejemplo para notar que se pueden hacer validaciones más específicas

function handleChangeText(e){
    
    setMail({...mail, [e.target.name]:e.target.value})
}

function handleChangeFile(e){
    
    setMail({...mail, adjunto:e.target.files[0]})
}

const onsubmit = values =>{
    iniciarGrabar(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatos){
        return <Main center><div><Loading/><span className="cargando">Cargando cargando datos ...</span></div></Main>
    };

return (
    <Main> 
    { grabandoDatos && <Main><div><Loading/><span className="cargando">Enviando mensaje...</span></div></Main>}
<div className={grabandoDatos? "hidden": 'p-4 rounded flex flex-wrap container-mult-flex-center'} >
        <div><div>

 <div className="AnaliticoContainer relative">
    <form onSubmit={iniciarGrabar}>
<div  className="titulo-cab-modal flex f-row">Formulario de envío de mail <span className="text-small ml-6 as-center"> ({seleccionados.seleccionados > 1 ? `${seleccionados.seleccionados} destinatarios` : `${seleccionados.seleccionados} destinatario`})</span></div>
    <div className="FormAbmContainerLargo">
        <div className="flex f-col">
            <div className="flex f-col">
                <div className="flex f-col">
                    <label title="El asunto es obligatorio" className="Form__labels__abmcursos_corto" htmlFor="abm-asunto">Asunto</label>
                    <input 
                        type="text" 
                        name="asunto" 
                        maxLength="80"
                        required
                        autoComplete="off"
                        className='input-cvalor'
                        onChange={(e)=>handleChangeText(e)}
                        id="abm-asunto"/>
                </div>
            </div>
            <div className="error_formulario">{errores.asunto}</div> 
        </div>
        <div className="flex f-col">
            <div className="flex f-col">
                <div className="flex f-col">
                    <label title="El mensaje es obligatorio" className="Form__labels__abmcursos_corto" htmlFor="abm-mensaje">Mensaje</label>
                    <textarea 
                        maxLength="1000"
                        rows="7" 
                        name="mensaje" 
                        required
                        autoComplete="off"
                        className='input-cvalor'
                        onChange={(e)=>handleChangeText(e)}
                        id="abm-mensaje"/>
                </div>
            </div>
            <div className="error_formulario">{errores.mensaje}</div> 
        </div>
        <div className="flex f-col">
            <div className="flex f-col">
                <div className="flex f-col">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-adjunto">Archivo adjunto (pdf o imágenes hasta 5 MB)</label>
                    <input 
                        type="file" 
                        name="adjunto" 
                        accept="application/pdf,image/x-png,image/jpeg"
                        onChange={(e)=>handleChangeFile(e)}
                        className='input-cvalor'
                        id="abm-adjunto"/>
                </div>
            </div>
        </div>
    </div>
    {camposValidos && <button className="Form__submit" type="submit" >Enviar mail</button>}

    </form>
 </div>

     
    </div>
    </div>
    </div>
    {seleccionados.sin_email.length > 0 && <div>
        <p className="error_formulario mb-2">{ seleccionados.sin_email.length == 1 ? 'Hay 1 obrero seleccionado que no posee e-mail' : `Hay ${seleccionados.sin_email.length} obreros seleccionados que no poseen e-mail`}</p>
           {seleccionados.sin_email.map(item=><div><span className="lis-col1-lg">{item.nombre} </span> <span className="text-smaller">{item.telefono==0 ? '--' : `(${item.telefono})`}</span></div>)}
    </div>}

</Main>
)
}
















