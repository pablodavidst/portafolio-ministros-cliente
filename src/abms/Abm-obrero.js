import React from 'react';
import {useState, useEffect} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faDotCircle,faCheckCircle,faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import {hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import useModal from '../hooks/useModal';
import Modal from '../componentes/Modal';
import AbmIglesias from '../abms/Abm-iglesia';

export default function AbmObrero({id_obrero, finalizarAltaOcopia,esModal,id_copia, usuario}){

    const provinciaDefault = [{id_provincia:-1, nombre:"Seleccionar país"}]

    // estados flags 
    const [cargandoDatosTablasGenerales,setCargandoTablasGenerales] = useState(false);
    const [cargandoDatosObrero,setCargandoDatosObrero] = useState(false);
    const [grabandoDatosObrero,setGrabandoDatosObrero] = useState(false);
    const [tablasCargadas,setTablasCargadas]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

    const [vectorDias, setVectorDias] = useState([]);
    const [vectorMeses, setVectorMeses]=useState([]);
    const [vectorAnios, setVectorAnios] = useState([]);
    
    // vectores de selección de otras operaciones
    const [provincias,setProvincias] = useState([]); 
    const [nacionalidades, setNacionalidades]= useState([]);
    const [estadosCiviles, setEstadosCiviles]= useState([]);
    const [regiones, setRegiones]= useState([]);
    const [rangos, setRangos]= useState([]);
    const [tiposDocumentos, setTiposDocumentos]= useState([]);

    const [iglesiaSeleccionada,setIglesiaSeleccionada]= useState(null);
    // Variables para manejar otras operaciones

    const [materiaSeleccionada,setMateriaSeleccionada]=useState(-1)
    const [instrumentoSeleccionado,setInstrumentoSeleccionado]=useState(-1)
    const [agregarInstrumento,setAgregarInstrumento]=useState(false)
    const [agregarMateria,setAgregarMateria]=useState(false)
    const [materiasTestAlumno, setMateriasTestAlumno]= useState([]);
    const [instrumentosAlumno, setInstrumentosAlumno]= useState([]);
    const [errorMateria,setErrorMateria]=useState(null)
    const [errorInstrumento,setErrorInstrumento]=useState(null)
    const [backupInstrumentosAlumno,setBackupInstrumentosAlumno]=useState([]);
    const [backupMateriasTestAlumno,setBackupMateriasTestAlumno]=useState([]);
    const [huboCambiosInstrumentos,setHuboCambiosInstrumentos]=useState(false);
    const [huboCambiosMaterias,setHuboCambiosMaterias]=useState(false);
    const [buscarHistorial,setBuscarHistorial]=useState(false);
    const [contadorModificaciones,setContadorModificaciones]=useState(0);
    const[datosParaImpresiones,setDatosParaImpresiones]=useState(null);
    const[historial,setHistorial]=useState([]);
    const [iglesias,setIglesias]=useState([]);
    const [tiposUsuario, setTiposUsuario]= useState([]);
    const [permisosUsuario, setPermisosUsuario]= useState([]);

    const {toggle, isShowing } = useModal();

  
    // estado objeto de inicialización que inicializa los valores del abm 
    // en el alta o es cargado con los valores de la base de datos en una modificación
    // este objeto se pasa al formulario Formik para que el estado del formulario se inicialice
    // con este objeto. Luego el resto del trabajo se hace sobre el estado del formulario  
    const [objetoInicializacion,setObjetoInicializacion]=useState({
        nombre:'',
        direccion:'',
        barrio:'',
        cod_postal:'',
        localidad:'',
        id_provincia:'',        
        email:'',
        telefono:'',
        celular:'',
        conyuge:'',
        anio:"2020",
        mes:"01",
        dia:"01",
        sexo:'M',
        pastor:false,
        maestro:false,
        evangelista:false,
        misionero:false,
        otro:false,
        id_estado_civil:0,
        oficio:'',
        desc_ministerio:'',
        nombre_pst_resp:'',
        contacto_pst_resp:'',
        nombre_igl_resp:'',
        contacto_igl_resp:'',
        id_nacionalidad:0,
        id_region:usuario.id_region,
        id_rango:0,
        rango:'',
        id_tipo_doc:0,
        nro_documento:''
    })

    useEffect(()=>{

        const cargarTablasGenerales = async ()=>{

            setCargandoTablasGenerales(true);
        
            try{
                const vectorResultado = await Promise.all([
                    Axios.get('/api/tablasgenerales/nacionalidades'),
                    Axios.get('/api/tablasgenerales/estadosciviles'),
                    Axios.get('/api/tablasgenerales/regiones'),
                    Axios.get('/api/tablasgenerales/rangos'),
                    Axios.get('/api/tablasgenerales/provincias'),
                    Axios.get('/api/tablasgenerales/tiposdocumento'),    
                    Axios.get(`/api/tablasgenerales/iglesiasobrero/${id_obrero ? id_obrero : 0}`)                                        
                ])

               
                setNacionalidades(vectorResultado[0].data);
                setEstadosCiviles(vectorResultado[1].data);
                setRegiones(vectorResultado[2].data);
                setRangos(vectorResultado[3].data);
                setProvincias(vectorResultado[4].data);
                setTiposDocumentos(vectorResultado[5].data);
                setIglesias(vectorResultado[6].data);
                cargarVectorDias(setVectorDias);
                cargarVectorMeses(setVectorMeses);
                cargarVectorAnios(setVectorAnios);

                setCargandoTablasGenerales(false); 
                setTablasCargadas(true)
            }catch(err){
        
                    console.log(err)
                   // const mensaje_html = `<p>La busqueda de tablas generales falló</p><p>${err.response.data.message}</p>`
                    const mensaje_html = `${err}`

                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   
                    setHuboError(true)
                    setCargandoTablasGenerales(false);
    
                }
            }

            cargarTablasGenerales()
     },[id_obrero])

     useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
        if (!isShowing){
           
            if (iglesiaSeleccionada){
                setIglesiaSeleccionada(null)
            }        
        }
    },[isShowing])

useEffect(()=>{

    const completarDatosDelObrero = async (id)=>{   
        setCargandoDatosObrero(true)
        try{
            
                const {data} = await Axios.get(`/api/tablasgenerales/obrero/${id}`)

                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para el ministro ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatosObrero(false)
                    setHuboError(true)
                    return
                }

                const datosDelRecordset = data[0];

                const datosObrero = {
                    id_provincia:noNullNumber(datosDelRecordset.id_provincia),
                    nombre:datosDelRecordset.nombre.trim(),
                    fecha:datosDelRecordset.f_nac,
                    anio:datosDelRecordset.f_nac.slice(0,4),
                    dia:datosDelRecordset.f_nac.slice(8,10),
                    mes:Number(datosDelRecordset.f_nac.slice(5,7)),
                    direccion:noNull(datosDelRecordset.direccion),
                    localidad:noNull(datosDelRecordset.localidad),
                    cod_postal:noNull(datosDelRecordset.cod_postal),
                    email:noNull(datosDelRecordset.email),
                    telefono:noNull(datosDelRecordset.telefono),
                    celular:noNull(datosDelRecordset.celular),
                    barrio:noNull(datosDelRecordset.barrio),
                    id_estado_civil:noNullNumber(datosDelRecordset.id_estado_civil),
                    id_nacionalidad:noNullNumber(datosDelRecordset.id_nacionalidad), 
                    oficio:noNull(datosDelRecordset.oficio),
                    desc_ministerio:noNull(datosDelRecordset.desc_ministerio),
                    conyuge:noNull(datosDelRecordset.conyuge),
                    nombre_pst_resp:noNull(datosDelRecordset.nombre_pst_resp),
                    contacto_pst_resp:noNull(datosDelRecordset.contacto_pst_resp),
                    nombre_igl_resp:noNull(datosDelRecordset.nombre_igl_resp),
                    contacto_igl_resp:noNull(datosDelRecordset.contacto_igl_resp),
                    sexo:noNull(datosDelRecordset.sexo),
                    id_region:noNullNumber(datosDelRecordset.id_region),
                    id_rango:noNullNumber(datosDelRecordset.id_rango),
                    region:noNull(datosDelRecordset.region),
                    pastor:datosDelRecordset.pastor,
                    maestro:datosDelRecordset.maestro,
                    evangelista:datosDelRecordset.evangelista,
                    misionero:datosDelRecordset.misionero,
                    otro:datosDelRecordset.otro,
                    nro_documento:noNullNumber(datosDelRecordset.nro_documento),
                    id_tipo_doc : noNullNumber(datosDelRecordset.id_tipo_doc),
                    f_alta:noNullNumber(datosDelRecordset.f_alta),
                    cod_seguridad: noNullNumber(datosDelRecordset.cod_seguridad)
                }
                  
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                
                setObjetoInicializacion({...objetoInicializacion,...datosObrero}) 

                setDatosParaImpresiones(datosDelRecordset)

                //setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
                setCargandoDatosObrero(false)
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
            
                setCargandoDatosObrero(false)
                setHuboError(true)
            }

    }

    if (tablasCargadas ){ // este useEffect se dispara solo si ya se cargaron las tablas generales

        if (id_obrero){ //  si se recibió el nùmero de alumno por propiedad es decir si es una modificación
            
            setTituloAbm(`Editar el ministro #${id_obrero}`);
            setTituloCerrar('Cerrar la ficha del ministro');
            completarDatosDelObrero(id_obrero); 
            
        }
        else if (id_copia){
            setTituloAbm(`Crear un ministro como copia del ministro #${id_copia}`);
            setTituloCerrar('Cerrar la ficha del ministro');
            completarDatosDelObrero(id_copia); 
            const rangoPermitidoAlta = filtrarRangoPermitidoParaAlta(rangos,setRangos)
        }
        else{ //  si no recibió el nùmero de curso por propiedad, es decir un alta
            setTituloAbm(`Crear un nuevo ministro`);
            setTituloCerrar('Cancelar');
            hacerScroll("nuevo-obrero");
            const rangoPermitidoAlta = filtrarRangoPermitidoParaAlta(rangos,setRangos)
            const regionPermitidaAlta = filtrarRegionPermitidaParaAlta(regiones,setRegiones,usuario.id_region)
            let anioNacimientoDefaultAlta=anioNacimientoAlta();

            setObjetoInicializacion({...objetoInicializacion,
                                     anio:anioNacimientoDefaultAlta,
                                     id_rango:rangoPermitidoAlta,
                                     id_region:regionPermitidaAlta }) 
            document.getElementById('abm-nombre').focus()

        }

    }

},[tablasCargadas,id_obrero,contadorModificaciones])     
  
/*useEffect(()=>{
    
   buscarAlgoDelUsuario()
   .then(()=> hacerScroll('ref-ficha'))

},[contadorOperaciones])


useEffect(()=>{ // hago esto para evitar el warning de can't perform... creo un effect para el mismo evento para que se ejecuten llamadas asincrónicas en distintos threads
                // podría haberlo agregado el effect que también se dispara con el mismo cambio contadorOperaciones pero para que sea más claro lo hice en dos efectos distintos pero disparados por el mismo cambio
    let mounted = true;

    if (mounted && id_prof){ // buscar el historial solo si esta montado y si hay un id_alumno, si es un alta no buscar todavía el historial
        setBuscarHistorial(true)
    }
    
    return ()=> mounted = false
 },[contadorOperaciones]) 
*/



const buscarAlgoDelUsuario = async ()=>{

    return true
    /*try{
        setCargandoMateriasInstrumentos(true)
        const vectorResultado = await Promise.all([Axios.get(`/api/alumnos/materiastest/${id_alumno}`),
                                                Axios.get(`/api/alumnos/instrumentos/${id_alumno}`),
                                                Axios.get(`/api/alumnos/historial/${id_alumno}/1`)])
    

        if (vectorResultado[1].data.some(item=>item.id_instrumento>1))
        {
            setInstrumentosAlumno(vectorResultado[1].data)
            setBackupInstrumentosAlumno(vectorResultado[1].data)
        }            

        setMateriasTestAlumno(vectorResultado[0].data)
        setBackupMateriasTestAlumno(vectorResultado[0].data)

        setHistorial(vectorResultado[2].data)

        setCargandoMateriasInstrumentos(false)
        setHuboCambiosInstrumentos(false)
        setHuboCambiosMaterias(false)

        return(true)

    }catch(err){
        console.log(err)
        //const mensaje_html = `<p>La busqueda de instrumentos del alumno y materias aprobadas por test falló</p><p>${err.response.data.message}</p>`
        const mensaje_html = 'ddd'
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setCargandoMateriasInstrumentos(false)
        setHuboError(true)
    }*/
}

const grabarObrero = async (values)=>{

    let resultado;
    let id_obrero_interno;
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo


    const objetoAgrabar = { 
                nombre: values.nombre.trim(),
                anio:Number(values.anio),
                mes:Number(values.mes),
                dia:Number(values.dia),
                direccion:values.direccion.trim(),
                barrio:values.barrio.trim(),
                localidad:values.localidad.trim(),
                cod_postal:values.cod_postal.trim(),
                celular:values.celular.trim(),
                telefono:values.telefono.trim(),
                email:values.email.trim(),
                oficio:values.oficio.trim(),
                id_provincia:Number(values.id_provincia),
                id_estado_civil:Number(values.id_estado_civil),
                id_nacionalidad:Number(values.id_nacionalidad),                
                id_region:Number(usuario.id_region),   // en un alta de un obrero solo dejamos que se le asigne la región del usuario logueado             
                desc_ministerio:values.desc_ministerio.trim(),
                conyuge:values.conyuge.trim(),
                nombre_pst_resp:values.nombre_pst_resp.trim(),
                contacto_pst_resp:values.contacto_pst_resp.trim(),
                nombre_igl_resp:values.nombre_igl_resp.trim(),
                contacto_igl_resp:values.contacto_igl_resp.trim(),
                sexo:values.sexo.trim(),
                pastor:values.pastor,
                maestro:values.maestro,
                evangelista:values.evangelista,
                misionero:values.misionero,
                otro:values.otro,
                id_rango:values.id_rango,
                id_tipo_doc:Number(values.id_tipo_doc),
                id_usuario:usuario.id_usuario,
                nro_documento:values.nro_documento.trim()!="" ? Number(values.nro_documento.trim()) : 0
        }

    setGrabandoDatosObrero(true)

    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`

    try{
        if (id_obrero){
            resultado= await Axios.put(`/api/tablasgenerales/obrero/${id_obrero}`,objetoAgrabar)
            id_obrero_interno = id_obrero; // es el id del id_obrero a modificar
        }else{
            resultado= await Axios.post(`/api/tablasgenerales/obrero`,objetoAgrabar)
            id_obrero_interno = resultado.data.id_obrero; // es el id del nuevo obrero 
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nuevo ministro #${resultado.data.id_obrero})</p>`
        }

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   

        setGrabandoDatosObrero(false)

        if (esModal){
            if(id_obrero){ // si es modal y es una modificación
                setContadorModificaciones(contadorModificaciones+1)
                finalizarAltaOcopia(false)
            }else{ // si es modal y es un alta
                finalizarAltaOcopia(true,id_obrero_interno)
            }

        }else{ // si no es modal
            finalizarAltaOcopia(true); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso
        }

    }catch(err){
        console.log(err.response)
        let mensaje_html_error;

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del obrero</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del obrero</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del obrero</p><p>${err.response}</p>`
        }


        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatosObrero(false)
    }
   

}

const seleccionarIglesia = (id_iglesia)=>{
    setIglesiaSeleccionada(id_iglesia);
    toggle();
}

const cerrarModalIglesia = ()=>{
    setIglesiaSeleccionada(null)
    toggle()
}

const iniciarGrabarObrero = (values)=>{
    let texto;
    let textoConfirmacion;

    if (id_obrero){
        texto = `Confirma la modificación del obrero
            ${id_obrero}?`
        textoConfirmacion = 'Si, modificar al obrero'
    }else{
        texto = `Confirma la creación del nuevo obrero? (${values.nombre})`
        textoConfirmacion = 'Si, crear el obrero'
    }

    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                grabarObrero(values);

            }else{
                console.log("Se canceló la modificación o creación del obrero")
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

const validationSchemaObrero = Yup.object({

nombre:Yup.string().max(100,'El nombre debe tener como máximo 100 caracteres')
        .required('Falta completar el nombre y apellido'),
conyuge:Yup.string().max(100,'El conyuge debe tener como máximo 100 caracteres'),
dia:Yup.number()
    .required('Falta seleccionar el día de nacimiento'),
mes:Yup.number()
    .required('Falta seleccionar el mes de nacimiento'),
anio:Yup.number()
    .min(1920,'El año no es válido')
    .required('Falta seleccionar el año de nacimiento'),        
direccion:Yup.string().max(500,'La dirección debe tener como máximo 500 caracteres'),            
localidad:Yup.string().max(500,'La localidad debe tener como máximo 500 caracteres')
    .required('Falta completar la localidad'),    
cod_postal:Yup.string().max(10,'El código postal debe tener como máximo 10 caracteres'), 
barrio:Yup.string().max(500,'El barrio debe tener como máximo 500 caracteres'),            
telefono:Yup.string().max(500,'El teléfono debe tener como máximo 500 caracteres'),
celular:Yup.string().max(100,'El número de celular debe tener como máximo 100 caracteres'),
email:Yup.string().email('El email no es válido').max(100,'El email debe tener como máximo 100 caracteres'),            
oficio:Yup.string().max(100,'El oficio debe tener como máximo 100 caracteres'),
desc_ministerio:Yup.string().max(200,'La descripción del ministerio debe tener como máximo 200 caracteres'),
nombre_pst_resp:Yup.string().max(300,'El nombre del pastor responsable debe tener como máximo 300 caracteres'),
contacto_pst_resp:Yup.string().max(500,'Los datos de contacto del pastor responsable deben tener como máximo 500 caracteres'),
nombre_igl_resp:Yup.string().max(300,'El nombre de la iglesia responsable debe tener como máximo 300 caracteres'),
contacto_igl_resp:Yup.string().max(500,'Los datos de contacto de la iglesia responsable deben tener como máximo 500 caracteres'),
pastor:Yup.boolean().required(),
maestro:Yup.boolean().required(),
evangelista:Yup.boolean().required(),
misionero:Yup.boolean().required(),
otro:Yup.boolean().required(),
id_region:Yup.number().integer().required(),
id_rango:Yup.number().integer().required(),
id_estado_civil:Yup.number()
    .integer()
    .required('Falta seleccionar el estado civil')
    .test("prueba","El estado civil del ministro debe ser mayor a o igual a cero",value => value >= 0),
id_provincia:Yup.number()
    .integer()
    .required('Falta seleccionar la provincia'),
nro_documento:Yup.number().typeError('El documento debe ser un número').min(1000000,'El documento debe tener como mínimo 7 dígitos')
    .max(99999999,'El documento debe tener como máximo 8 dígitos').required('El número de documento es un dato requerido'),
id_tipo_doc:Yup.number('El documento debe ser un número')
    .integer()
    .required('Falta seleccionar el tipo de documento')
})                 

const onsubmitObrero = values =>{
    console.log(values)
    iniciarGrabarObrero(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatosTablasGenerales){
        return <Main center><div><Loading/><span className="cargando">Cargando cargando datos generales...</span></div></Main>
    };

    if (cargandoDatosObrero){
        return <Main center><div><Loading /><span className="cargando">Cargando datos personales del obrero...</span></div></Main>
    };

  {/*  if (grabandoDatosAlumno){
        return <Main center><div><Loading/><span className="cargando">Grabando datos...</span></div></Main>
    };
*/}
    return (
        <Main> 
        { grabandoDatosObrero && <Main><div><Loading blanco={true}/><span className="cargando text-white">Grabando datos...</span></div></Main>}
       
        { isShowing && iglesiaSeleccionada && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'transparent'}} closeOnclickOutside={true}>
            <AbmIglesias id_iglesia={iglesiaSeleccionada} usuario={usuario} finalizarAltaOcopia={cerrarModalIglesia} esVisualizacion={true}/>    
        </Modal>}

  <div className={grabandoDatosObrero ? "hidden": 'pt-4 rounded flex flex-wrap container-mult-flex-center'} >
             <div className="flex f-row">
                 <div>
            {/*<div className="AnaliticoContainer relative">
                <div className="FormAnaliticoContainer relative">
                    <div  className="mb-2 titulo-cab-modal titulo-abm flex f-row">{tituloAbm}
                </div>*/}
                     {/*el botòn de cancelar solo lo habilito cuando es un alta o copia*/}
                { !esModal && <button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm"><FontAwesomeIcon icon={faWindowClose}/></button> }
                <Formik validateOnMount 
                enableReinitialize initialValues={objetoInicializacion}
    validationSchema={validationSchemaObrero} onSubmit={onsubmitObrero}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty }) =>{ 
    return (
    <Form id="ref-ficha">
{  /*   <div style={{width: "200px"}}><p>{JSON.stringify(values, null, "\t")}</p></div> */} 
<div  className="mb-2 titulo-cab-modal titulo-abm">
    <div className="flex f-row justify-content-space-around">
        <span className="inline-block-1">{tituloAbm}</span>
    </div>
</div>
    <div className="flex f-col">
    <div className="AnaliticoContainer relative">
            <div className="FormAbmContainerLargo">
                <div className="flex f-col">
                {id_obrero && dirty && 
                    <span type="button" title="Deshacer los cambios y restaurar valores iniciales" 
                        className="cursor-pointer absolute botonRestaurar boton-restaurar-abm-form" 
                        onClick={() => resetForm(initialValues)}>Restaurar
                    </span>
                }
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre">Nombre (apellido nombre)</label>
                        <Field 
                            id="abm-nombre"
                            type="text" 
                            autoComplete="off" 
                            maxLength="100"
                            name="nombre" 
                            onFocus={()=>seleccionarTextoInput("abm-nombre")} 
                            onClick={()=>seleccionarTextoInput("abm-nombre")}                         
                            className={values.nombre ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="nombre"/></div> 
                </div>
                <div className="flex f-row xmt-2"> 
                <div className="flex f-col el-abm-sel-pos">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-sexo">Sexo</label>
                        <select onChange={handleChange} value={values.sexo} name="sexo" className="w-selabmct" id="abm-alumno-sexo">
                                <option  value="M">Hombre</option>
                                <option  value="F">Mujer</option>
                        </select>
                </div>  
                <div className="flex f-col">
                    <div className="flex f-col el-abm-sel-pos">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Nacionalidad</label>
                        <select onChange={handleChange} value={values.id_nacionalidad} 
                                name="id_nacionalidad" 
                                className="w-selabmct" id="abm-curso-profesor">
                                <option disabled value="-1">Seleccionar</option>
                                {
                                    nacionalidades.map(item=>
                                        <option key={`abmcurso-permiso${item.id_nacionalidad}`} 
                                            value={item.id_nacionalidad}>{item.nombre}</option>
                                    )
                                }
                        </select>
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="id_nacionalidad"/></div> 
                </div>   
                <div className="flex f-col">
                    <div className="flex f-col el-abm-sel-pos">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-tipoUsuario">Estado civil</label>
                        <select onChange={handleChange} value={values.id_estado_civil} name="id_estado_civil" className="w-selabmct" id="abm-curso-tipoUsuario">
                                <option disabled value="-1">Seleccionar</option>
                                {
                                    estadosCiviles.map(item=>
                                        <option key={`abmcurso-profes${item.id_estado_civil}`} 
                                            value={item.id_estado_civil}>{item.nombre}</option>
                                    )
                                }
                        </select>
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="id_estado_civil"/></div> 
                </div>
                </div>
                <div className="flex f-row xmt-2"> 
                <div className="flex f-col">
                    <div className="flex f-col el-abm-sel-pos">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Tipo documento</label>
                        <select onChange={handleChange} value={values.id_tipo_doc} 
                                name="id_tipo_doc" 
                                className="w-selabmct" id="abm-curso-profesor">
                                <option value="0">No asignado</option>
                                {
                                    tiposDocumentos.map(item=>
                                        <option key={`abmcurso-permiso${item.id_tipo_doc}`} 
                                            value={item.id_tipo_doc}>{item.nombre}</option>
                                    )
                                }
                        </select>
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="id_tipo_doc"/></div> 
                </div>   
                <div className="flex f-col">
                    <div className="flex f-col el-abm-sel-pos">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-nro_documento">Nro. documento</label>
                        <Field 
                            id="abm-nro_documento"
                            type="text" 
                            autoComplete="off" 
                            maxLength="8"
                            name="nro_documento" 
                            onFocus={()=>seleccionarTextoInput("abm-nro_documento")} 
                            onClick={()=>seleccionarTextoInput("abm-nro_documento")}                         
                            className={values.nro_documento ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="nro_documento"/></div> 
                </div>
                </div>
                <div className="flex f-row el-abm-sel-pos">
                <label className="Form__labels__abmcursos_corto" htmlFor="fecha">Fecha de nacimiento</label>
                <div className="flex f-col">
                    <div className="flex f-row justify-content-center" id="fecha">
                            <select onChange={handleChange} 
                                    value={values.dia}
                                    name='dia' 
                                    className="block appearance-none w-40 bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                    {vectorDias.map(item=><option value={item} key={item}>{item}</option> )}
                            </select>                       
                            <select onChange={handleChange} 
                                    value={values.mes} 
                                    name='mes'
                                    className="block appearance-none w-100 bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                {vectorMeses.map(item=><option value={item.id} key={item.id}>{item.mes}</option> )}
                            </select>
                            <select onChange={handleChange} 
                                    value={values.anio} 
                                    name='anio'
                                    
                                    className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                {vectorAnios.map(item=><option 
                                disabled = {item==1900}  value={item} key={item}>{item}</option> )}
                            </select>
                            
                        </div>
                            <div className="error_formulario"><ErrorMessage name="dia"/></div> 
                            <div className="error_formulario"><ErrorMessage name="mes"/></div> 
                            <div className="error_formulario"><ErrorMessage name="anio"/></div>   
                    </div> 
                </div>
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-oficio">Oficio</label>
                        <Field 
                            id="abm-oficio"
                            autoComplete="off" 
                            maxLength="100"
                            name="oficio" 
                            onFocus={()=>seleccionarTextoInput("abm-oficio")} 
                            onClick={()=>seleccionarTextoInput("abm-oficio")}                         
                            className={values.oficio ? 'input-cvalor' : 'input-vacio'}
                            component="textarea"
                            rows={determinarFilas(values.oficio)}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="oficio"/></div> 
                </div> 
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre">Cónyuge</label>
                        <Field 
                            id="abm-conyuge"
                            type="text" 
                            autoComplete="off" 
                            maxLength="100"
                            name="conyuge" 
                            onFocus={()=>seleccionarTextoInput("abm-conyuge")} 
                            onClick={()=>seleccionarTextoInput("abm-conyuge")}                         
                            className={values.conyuge ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="conyuge"/></div> 
                </div>  
                <div className="flex f-col btd1g mt-6">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-direccion">Dirección</label>
                        <Field 
                            id="abm-direccion"
                            type="text" 
                            autoComplete="off" 
                            maxLength="100"
                            name="direccion" 
                            onFocus={()=>seleccionarTextoInput("abm-direccion")} 
                            onClick={()=>seleccionarTextoInput("abm-direccion")}                         
                            className={values.direccion ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="direccion"/></div> 
                </div>   
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-barrio">Barrio</label>
                        <Field 
                            id="abm-barrio"
                            type="text" 
                            autoComplete="off" 
                            maxLength="100"
                            name="barrio" 
                            onFocus={()=>seleccionarTextoInput("abm-barrio")} 
                            onClick={()=>seleccionarTextoInput("abm-barrio")}                         
                            className={values.barrio ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="barrio"/></div> 
                </div> 
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-localidad">Localidad</label>
                        <Field 
                            id="abm-localidad"
                            type="text" 
                            autoComplete="off" 
                            maxLength="500"
                            name="localidad" 
                            onFocus={()=>seleccionarTextoInput("abm-localidad")} 
                            onClick={()=>seleccionarTextoInput("abm-localidad")}                         
                            className={values.localidad ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="localidad"/></div> 
                </div> 
                <div className="flex f-col">
                    <div className="flex f-row el-abm-sel-pos mt-2">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-cod_postal">Código Postal</label>
                        <Field 
                            id="abm-cod_postal"
                            type="text" 
                            autoComplete="off" 
                            maxLength="10"
                            name="cod_postal" 
                            onFocus={()=>seleccionarTextoInput("abm-cod_postal")} 
                            onClick={()=>seleccionarTextoInput("abm-cod_postal")}                         
                            className={values.cod_postal ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="cod_postal"/></div> 
                </div>                                                                                   
                <div className="flex f-col">
                    <div className="flex f-col el-abm-sel-pos">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Provincia</label>
                        <select onChange={handleChange} value={values.id_provincia} 
                                name="id_provincia" 
                                className="w-100pc" id="abm-curso-profesor">
                                <option disabled value="-1">Seleccionar</option>
                                {
                                    provincias.map(item=>
                                        <option key={`abmcurso-permiso${item.id_provincia}`} 
                                            value={item.id_provincia}>{item.nombre}</option>
                                    )
                                }
                        </select>
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="id_provincia"/></div> 
                </div>   
                                    
            

                </div>  

                <div>
                <div className="flex f-col btd1g mt-6">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telefono">Teléfono</label>
                        <Field 
                            id="abm-alumno-telefono"
                            type="text" 
                            autoComplete="off" 
                            onFocus={()=>seleccionarTextoInput("abm-alumno-telefono")} 
                            onClick={()=>seleccionarTextoInput("abm-alumno-telefono")}                            
                            maxLength="500"
                            name="telefono" 
                            className={values.telefono ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="telefono"/></div> 
                </div>  
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-celular">Celular</label>
                        <Field 
                            id="abm-alumno-celular"
                            type="text" 
                            autoComplete="off" 
                            onFocus={()=>seleccionarTextoInput("abm-alumno-celular")} 
                            onClick={()=>seleccionarTextoInput("abm-alumno-celular")}                            
                            maxLength="500"
                            name="celular" 
                            className={values.celular ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="celular"/></div> 
                </div>     
                </div>
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email">E-mail</label>
                        <Field 
                            id="abm-alumno-email"
                            type="email" 
                            autoComplete="off" 
                            maxLength="100"
                            onFocus={()=>seleccionarTextoInput("abm-alumno-email")} 
                            onClick={()=>seleccionarTextoInput("abm-alumno-email")}                           
                            name="email" 
                            value={values.email.toLowerCase()}
                            className={values.email ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="email"/></div> 
                </div>
            {/* <div className="flex f-col">
                    <div className="flex f-row">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-provincia">Provincia</label>
                        <Field 
                            id="abm-alumno-provincia"
                            type="text" 
                            autoComplete="off" 
                            onFocus={()=>seleccionarTextoInput("abm-alumno-provincia")} 
                            onClick={()=>seleccionarTextoInput("abm-alumno-provincia")}                           
                            maxLength="100"
                            name="provincia" 
                            className={values.provincia ? '' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="provincia"/></div> 
                                </div>     */}   
      
    { /*            
                <div className="flex f-col">
                    <div className="flex f-row">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-pais">País</label>
                        <select onChange={(e)=>{handleChange(e);buscarProvincias(e,setFieldValue)}} value={values.pais} name="pais" className="w-selabm" id="abm-alumno-pais">
                                <option disabled value="-1">Seleccionar</option>
                                {
                                    paises.map(item=>
                                        <option key={uuidv4()} 
                                            value={item.id_pais}>{item.nombre}</option>
                                    )
                                }
                        </select>
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="pais"/></div> 
                </div> 
    */}            
    { /*           
                <div className="flex f-col">
                    <div className="flex f-row">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-provincia">Provincia</label>
                        <select onChange={handleChange} 
                                value={values.provincia} 
                                name="provincia"
                                title={values.pais==-2 ? 'No se encontraron provincias para el país seleccionado':''} 
                                disabled = {values.pais===-1}
                                className="w-selabm" id="abm-curso-provincia">
                            
                                {
                                    provincias.map(item=>
                                        <option key={uuidv4()} 
                                        value={item.id_provincia}>{item.nombre}</option>
                                    )
                                }
                        </select>
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="provincia"/></div> 
                </div> 
    */}
            
            </div>
            <div className="FormAbmContainerLargo">
            <div className="flex f-col">
                        <div className="flex f-col el-abm-sel-pos">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Región</label>
                            <select onChange={handleChange} value={values.id_region} 
                                    name="id_region" 
                                    
                                    className="w-100pc" id="abm-curso-id_region">
                                    {/*<option value="-1" disabled>Seleccionar</option>*/}
                                    {
                                        regiones.map(item=>
                                            <option key={`abmcurso-permiso${item.id_region}`} 
                                                disabled
                                                value={item.id_region}>{item.nombre}</option>
                                        )
                                    }
                            </select>
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="id_region"/></div> 
                </div>   
                <div className="flex f-col">
                    <div className="flex f-col el-abm-sel-pos">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Rango</label>
                        <select onChange={handleChange} value={values.id_rango} 
                                name="id_rango" 
                                className="w-100pc" id="abm-curso-id_rango">
                                {/*<option value="-1" disabled>Seleccionar</option>*/}
                                    {
                                    rangos.map(item=>
                                        <option key={`abmcurso-permiso${item.id_rango}`} 
                                        disabled value={item.id_rango}>{item.nombre}</option>
                                    )
                                }
                        </select>
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="id_rango"/></div> 
                </div>       

                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-desc_ministerio">Ministerio (Breve descripción)</label>
                        {/*<Field 
                            id="abm-desc_ministerio"
                            type="text" 
                            autoComplete="off" 
                            maxLength="200"
                            name="desc_ministerio" 
                            onFocus={()=>seleccionarTextoInput("abm-desc_ministerio")} 
                            onClick={()=>seleccionarTextoInput("abm-desc_ministerio")}                         
                            className={values.desc_ministerio ? 'input-cvalor' : 'input-vacio'}
                            />*/}

                        <Field
                            name="desc_ministerio"
                            component="textarea"
                            maxLength="200"
                            rows="3"
                            id="abm-desc_ministerio"
                            onFocus={()=>seleccionarTextoInput("abm-desc_ministerio")} 
                            onClick={()=>seleccionarTextoInput("abm-desc_ministerio")}                         
                            className={values.desc_ministerio ? 'input-cvalor' : 'input-vacio'}
                        />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="desc_ministerio"/></div> 
                </div> 
                <div className="mt-4 mb-4">
                    <div className="flex f-col items-center">
                        <div className="flex f-row">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-pastor">Pastor</label>
                            <Field 
                                id="abm-pastor"
                                type="checkbox" 
                                className="ml-4"
                                name="pastor" 
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="pastor"/></div> 
                    </div>           
                    <div className="flex f-col items-center">
                        <div className="flex f-row">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-maestro">Maestro</label>
                            <Field 
                                id="abm-maestro"
                                type="checkbox" 
                                className="ml-4"
                                name="maestro" 
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="maestro"/></div> 
                    </div>           
                    <div className="flex f-col items-center">
                        <div className="flex f-row">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-evangelista">Evangelista</label>
                            <Field 
                                id="abm-evangelista"
                                type="checkbox" 
                                className="ml-4"
                                name="evangelista" 
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="evangelista"/></div> 
                    </div>           
                    <div className="flex f-col items-center">
                        <div className="flex f-row">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-misionero">Misionero</label>
                            <Field 
                                id="abm-misionero"
                                type="checkbox" 
                                className="ml-4"
                                name="misionero" 
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="misionero"/></div> 
                    </div>           
                    <div className="flex f-col items-center">
                        <div className="flex f-row">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-otro">Otro</label>
                            <Field 
                                id="abm-otro"
                                type="checkbox" 
                                className="ml-4"
                                name="otro" 
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="otro"/></div> 
                    </div>      
                </div>     

                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre_pst_resp">Pastor responsable</label>
                        <Field 
                            id="abm-nombre_pst_resp"
                            type="text" 
                            autoComplete="off" 
                            maxLength="300"
                            name="nombre_pst_resp" 
                            onFocus={()=>seleccionarTextoInput("abm-nombre_pst_resp")} 
                            onClick={()=>seleccionarTextoInput("abm-nombre_pst_resp")}                         
                            className={values.nombre_pst_resp ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="nombre_pst_resp"/></div> 
                </div>   
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-contacto_pst_resp">Email/Tel</label>
                        <Field 
                            id="abm-contacto_pst_resp"
                            type="text" 
                            autoComplete="off" 
                            maxLength="500"
                            name="contacto_pst_resp" 
                            onFocus={()=>seleccionarTextoInput("abm-contacto_pst_resp")} 
                            onClick={()=>seleccionarTextoInput("abm-contacto_pst_resp")}                         
                            className={values.contacto_pst_resp ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="contacto_pst_resp"/></div> 
                </div>   
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre_igl_resp">Iglesia del ptor. responsable</label>
                        <Field 
                            id="abm-nombre_igl_resp"
                            type="text" 
                            autoComplete="off" 
                            maxLength="300"
                            name="nombre_igl_resp" 
                            onFocus={()=>seleccionarTextoInput("abm-nombre_igl_resp")} 
                            onClick={()=>seleccionarTextoInput("abm-nombre_igl_resp")}                         
                            className={values.nombre_igl_resp ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="nombre_igl_resp"/></div> 
                </div>   
                <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-contacto_igl_resp">Dirección</label>
                        <Field 
                            id="abm-contacto_igl_resp"
                            type="text" 
                            autoComplete="off" 
                            maxLength="500"
                            name="contacto_igl_resp" 
                            onFocus={()=>seleccionarTextoInput("abm-contacto_igl_resp")} 
                            onClick={()=>seleccionarTextoInput("abm-contacto_igl_resp")}                         
                            className={values.contacto_igl_resp ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="contacto_igl_resp"/></div> 
                </div>   

                <br></br>       
                { dirty && <button className="Form__submit" type="submit">Grabar</button> }
            </div>
        </div>   
        <div className="">
            {/*<div style={{width: "100%"}}><p>{JSON.stringify(values, null, "\t")}</p></div>*/}
      </div>
    </div>
 
    </Form>) } }

    </Formik>
           
    </div>
        {id_obrero && <div className="FormAbmContainer flex f-col ml-2">
                    {/*<div className="flex f-col">
                        <span className="p-2 mb-2 text-white bg-tomato inline-block-1 text-center">Balances</span>
                        {balances.map(item=><span className={item.estado ==0 ? 'bal-np' : 'bal-pr'}>{item.periodo}</span>)}
                    </div>*/}
                    <div className="flex f-col">
                    <span className="p-2 mt-2 mb-2 text-white bg-tomato inline-block-1 text-center">Iglesias autónomas</span>
                        {iglesias.length >0 && 
                            <div>
                                {iglesias.map(item=><div className="diezmos"><span onClick={()=>seleccionarIglesia(item.id_iglesia)} className="border-bottom-dotted-gray cursor-pointer">{item.nombre}</span><CondicionIglesia iglesia={item}/></div>)}
                            </div>
                        }
                        {iglesias.length==0 && 
                            <span className="diezmos"> Ninguna
                            </span>
                        }               
                    </div>
                    <div>
                        <OtrasIglesiasObrero seleccionarIglesia={seleccionarIglesia} id_obrero={id_obrero} iglesiasAutonomas={iglesias}/>
                    </div>
                   
            </div>} 
    </div>
    </div>

    </Main>
    )
}

function cargarVectorHoras() {
    let hora;
    let vector_horas = []

    for (var i = 8; i < 23; i++) {
        if (i < 10) {
            hora = `0${i}`;
        } else {
            hora = `${i}`;
        }
        vector_horas.push(hora);
    }

    return vector_horas
}

function cargarCapacidades() {
    let capacidad;
    let vector_capacidad = []

    for (var i = 1; i < 100; i++) {
        vector_capacidad.push(i);
    }

    return vector_capacidad
}
function cargarVectorMinutos() {
    let vector_minutos = []

    vector_minutos.push('00');
    vector_minutos.push('30');

    return vector_minutos
}


function diferencia(horai,horaf,minutoi,minutof) {
    var resultado = true;
    var mensaje = '';

    var hora_desde = horai;
    var hora_hasta = horaf;
    var min_desde = minutoi;
    var min_hasta = minutof;

    var hora_desde_nummerica = Number(hora_desde + min_desde)
    var hora_hasta_nummerica = Number(hora_hasta + min_hasta)


    if (hora_desde_nummerica >= hora_hasta_nummerica) {
        resultado = false;
        mensaje = 'La hora de inicio debe ser anterior a la hora de fín'
    }

    return (hora_hasta_nummerica > hora_desde_nummerica  )

}

function hacerScroll(id){
    let element = document.getElementById(id);

    if(!element){return}
    element.scrollIntoView(false);
}

function cargarVectorDias(setDias) {
    var dia;
    var vectoDiasAux=[];

    for (var i = 1; i < 32; i++) {
        if (i < 10) {
            dia = `0${i}`;
        } else {
            dia = `${i}`;
        }
        vectoDiasAux.push(dia);
    }
    setDias(vectoDiasAux)
}

function  cargarVectorMeses(setMeses) {
    var meses = [{ id: 1, mes: 'Enero' },
    { id: 2, mes: 'Febrero' },
    { id: 3, mes: 'Marzo' },
    { id: 4, mes: 'Abril' },
    { id: 5, mes: 'Mayo' },
    { id: 6, mes: 'Junio' },
    { id: 7, mes: 'Julio' },
    { id: 8, mes: 'Agosto' },
    { id: 9, mes: 'Septiembre' },
    { id: 10, mes: 'Octubre' },
    { id: 11, mes: 'Noviembre' },
    { id: 12, mes: 'Diciembre' }];
    setMeses(meses);
}

function anioNacimientoAlta(){
    let fecha_actual = new Date();
    let anio_hasta = Number(fecha_actual.getFullYear() - 3);

    return anio_hasta
}

function cargarVectorAnios(setAnios) {
    var anios = [];
    var anio;

    var fecha_actual = new Date();
    var anio_hasta = Number(fecha_actual.getFullYear() - 10);
    var anio_desde = anio_hasta - 80;

    for (var i = anio_hasta; i > anio_desde; i--) {
        anio = i.toString();
        anios.push(anio);
    }

    anios.push(1900); // agrego porque en la tabla hay fechas vacias que sql server los transforma a una fecha nula 1900-01-01 00:00:00.000
                      // para que tome las fechas 1900-01-01 00:00:00.000 y que el usuario vea que es un año invalido 

    setAnios(anios);
}

function noNull(valor){
    if (!valor){
        return ''
    }else{
        return valor.trim()
    }
}

function noNullNumber(valor){
    if (!valor){
        return 0
    }else{
        return valor
    }
}



function filtrarRangoPermitidoParaAlta(rangos,setRangos){
    const rangosPermitidos = rangos.filter(item=>item.nombre.includes('sin credencial'))
    setRangos(rangosPermitidos)

    if (rangosPermitidos.length>0){
        return rangosPermitidos[0].id_rango
    }else{
        return null
    }
}

function filtrarRegionPermitidaParaAlta(regiones,setRegiones,id_region_usuario){
    const regionesPermitidas = regiones.filter(item=>item.id_region===id_region_usuario)
    setRegiones(regionesPermitidas)

    if (regionesPermitidas.length>0){
        return regionesPermitidas[0].id_region
    }else{
        return null
    }
}

function determinarFilas(palabra){
    if (palabra.length>69){
        return 2
    }else{
        return 1
    }

}

function CondicionIglesia({iglesia}){
    return <div className="flex f-row jfc-fe text-smaller mt-2">  
        <div className="ml-4"><span>Balances:</span>{ iglesia.estado_balances==1 && <span><FontAwesomeIcon className="mr-2 ml2 color-green" icon={faCheckCircle}/>Al día</span>}
             { iglesia.estado_balances==0 && <span><FontAwesomeIcon className="mr-2 ml2 color-red" icon={faTimesCircle}/>Adeuda</span>}
        </div>
        <div className="ml-4"><span>Diezmos:</span> {iglesia.detalle_diezmos==1 && <span><FontAwesomeIcon className="mr-2 ml2 color-green" icon={faCheckCircle}/>Al día</span>}
              {iglesia.detalle_diezmos==0 && <span><FontAwesomeIcon className="mr-2 ml2 color-red" icon={faTimesCircle}/>Adeuda</span>}
        </div>
    </div>
}

function OtrasIglesiasObrero({id_obrero, iglesiasAutonomas,seleccionarIglesia}){
    const [iglesias,setIglesias]=useState([]);
    const [buscandoDatos,setBuscandoDatos]=useState(false)
    const [huboError,setHuboError] =useState(false)

    useEffect(()=>{
        let mounted=true

        const buscarOtrasIglesias = async ()=>{
            try{
                setBuscandoDatos(true)
                const vectorResultados = await Promise.all([
                    Axios.get(`/api/tablasgenerales/iglesiasobreroall/${id_obrero ? id_obrero : 0}`),
                ])

                if (mounted){ // para evitar el warning can't perform...

                    const iglesiasNoAutonomas = excluirIglesiasAutonomas(vectorResultados[0].data,iglesiasAutonomas)
                    setIglesias(iglesiasNoAutonomas)
                    setBuscandoDatos(false)
                }

            }catch(error){
                setHuboError(true)
                setBuscandoDatos(false)
            }
        }

        buscarOtrasIglesias();

        return ()=>{mounted=false} // para evitar el warning can't perform...
    },[])

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }
    
    if (buscandoDatos){
        return <Main center><Loading/><span className="cargando">Buscando iglesias...</span></Main>
    }

    return <div className="flex f-col">
    <span className="p-2 mt-2 mb-2 text-white bg-tomato inline-block-1 text-center">Otras iglesias <span>({iglesias.length})</span></span>
        {iglesias.length >0 && 
            <div>
                {iglesias.map(item=><div className="diezmos mb-2"><span className="text-smaller mr-2 tipo-iglesia whitespace-no-wrap">{item.tipo_iglesia}</span><span className="border-bottom-dotted-gray cursor-pointer" onClick={()=>seleccionarIglesia(item.id_iglesia)}>{item.iglesia}</span><br />
                <FontAwesomeIcon className="mt-2 mr-2" icon={faMapMarkerAlt}/>
                <span className="text-smaller whitespace-no-wrap">{item.provincia}</span></div>)}
            </div>
        }
        {iglesias.length == 0 && 
            <div>
                <span className="diezmos">Ninguna</span>
            </div>
        }        

    {/*<div className="flex f-col text-large">

    <span className="inline-block1 text-larger fw-100 mb-2 mt-4">Otras iglesias asociadas al ministro</span>
               
            {iglesias.map(item=><div className="ig-min"><span className="border-bottom-dotted-gray">{item.iglesia}</span>
            <span className="border-bottom-dotted-gray">{item.provincia}</span>
            </div>)}
        </div> */}                     
    </div>

  }

  function excluirIglesiasAutonomas(todas,autonomas){

    const excluirAutonomas = todas.filter(item=>!autonomas.some(iglesia=>iglesia.cod_iglesia==item.cod_iglesia))

    return excluirAutonomas
}