import React from 'react';
import {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import Loading from './Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faDotCircle } from '@fortawesome/free-regular-svg-icons';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';

export default function AbmAula({solicitud, finalizarAltaOcopia}){

    const _id = solicitud.id_solicitud;
    // estados flags 
    const [cargandoDatos,setCargandoDatos] = useState(false);
    const [grabandoDatos,setGrabandoDatos] = useState(false);
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

       const [objetoInicializacion,setObjetoInicializacion]=useState({
        nombre:''
        })


useEffect(()=>{

    const completarDatosAbm = async (id)=>{   
        setCargandoDatos(true)
        try{
            
                const {data} = await Axios.get(`/api/tablasgenerales/aula/${id}`)
                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para el aula ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatos(false)
                    setHuboError(true)
                    return
                }

                const datosDelRecordset = data;

                const datosUpdate = {
                    nombre:datosDelRecordset.descripcion
                }
                  
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                setObjetoInicializacion({...objetoInicializacion,...datosUpdate}) 

                setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
                setCargandoDatos(false)
                // bugsol 1
                // return datosDelRecordset // retorno un valor para que pueda hacerse algo en el .then ya que al ser async devuelva una promesa
            }catch(err){

                console.log(err)
               // const mensaje_html = `<p>La busqueda de datos del alumno falló</p><p>${err.response.data.message}</p>`
                const mensaje_html = `${err}`
                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
            
                setCargandoDatos(false)
                setHuboError(true)
            }

    }


        if (_id){ //  si es una modificación
            
            setTituloAbm(`Autorización de credencial`);
            setTituloCerrar('Cerrar la ficha del aula');
            //completarDatosAbm(_id); 
            hacerfocoEnPrimerInput('abm-nombre')

        }else{
            console.log("Falta el id de la solicitud")
            setHuboError(true)
        }

},[_id])     
  
const grabarDatos = async (values)=>{

    let resultado;
    let _id_interno;
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const objetoAgrabar = { 
                observacion: values.nombre,
                autorizado:true,
                responsable:''
        }

    setGrabandoDatos(true)

    let mensaje_html = `<p>La operación se realizó con éxito</p>`

    try{

        resultado= await Axios.put(`/api/tablasgenerales/credenciales/autorizacion/${_id}`,objetoAgrabar)

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })
        .then(()=>{
            finalizarAltaOcopia()
        })   

        setGrabandoDatos(false)
    }catch(err){    

        let mensaje_html_error;

        console.log('err.response.status',err.response.status)

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del aula</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del aula</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del aula</p><p>${err.response}</p>`
        }

        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatos(false)
    }
   

}

const iniciarGrabar = (values)=>{
    let texto;
    let textoConfirmacion;
    const tipoOperacion = solicitud.estado.includes("Revisión") ? 'revision' : 'impresion';

    if (tipoOperacion=="revision"){
        texto = `¿Autoriza la impresión?`
        textoConfirmacion = 'Si, autorizo la impresión'
    }else{
        texto = `La autorización de impresión aún no se a implementado`
        textoConfirmacion = 'Entendido'
    }

    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirmButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value && tipoOperacion=="revision"){
                grabarDatos(values);
            }else{
                console.log("Se canceló la operación de la solicitud")
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

const validationSchema = Yup.object({

nombre:Yup.string().max(2000,'El nombre debe tener como máximo 2000 caracteres')
})                 

const onsubmit = values =>{
    iniciarGrabar(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatos){
        return <Main center><div><Loading/><span className="cargando">Cargando cargando datos ...</span></div></Main>
    };

  {/*  if (grabandoDatosAlumno){
        return <Main center><div><Loading/><span className="cargando">Grabando datos...</span></div></Main>
    };
*/}
    return (
        <Main> 
        { grabandoDatos && <Main><div><Loading/><span className="cargando">Grabando datos...</span></div></Main>}

  <div className={grabandoDatos? "hidden": ''} >
            <div><div>
            {/*<div className="AnaliticoContainer relative">
                <div className="FormAnaliticoContainer relative">
                    <div  className="mb-2 titulo-cab-modal titulo-abm-modal flex f-row">{tituloAbm}
                    </div>
                <button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm"><FontAwesomeIcon icon={faWindowClose}/></button> 
                */}
                <Formik validateOnMount 
                enableReinitialize initialValues={objetoInicializacion}
    validationSchema={validationSchema} onSubmit={onsubmit}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty }) =>{ 
    return (
    <Form id="ref-ficha">

    <div className="">
        <div  className="">{tituloAbm}</div>
        {/*<button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm-modal"><FontAwesomeIcon icon={faWindowClose}/></button>*/} 
        <div className="FormAbmContainer-x1">
            <div className="flex f-col">
            {/*_id && dirty && <span type="button" title="Restaurar valores iniciales" className="cursor-pointer restaurar-b" onClick={() => resetForm(initialValues)}>Restaurar</span>*/}
            <div className="flex f-col">
                <div className="flex f-col">
                    <label className="Form__labels__abmcursos_corto mt-4 mb-4" htmlFor="abm-nombre">{`Detalle alguna aclaración que quiera hacer sobre ${solicitud.nombre} a la SEDE`}</label>
                    <Field 
                        id="abm-nombre"
                        component="textarea"
                        rows="4"
                        autoComplete="off" 
                        maxLength="1000"
                        name="nombre" 
                        onFocus={()=>seleccionarTextoInput("abm-nombre")} 
                        onClick={()=>seleccionarTextoInput("abm-nombre")} 
                        className={values.nombre ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="nombre"/></div> 
            </div> 
            </div>  
            {/* dirty && <button className="Form__submit" type="submit">Grabar</button>*/}
        {solicitud.estado.includes("Revisión") && <button className="Form__submit mt-4" type="submit">Autorizar impresión</button>}
        </div>
      
    </div>    
    </Form>) } }

    </Formik>
        </div>
        </div>
        </div>

    </Main>
    )
}
















