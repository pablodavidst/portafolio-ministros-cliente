import React from 'react';
import {useState, useEffect, useRef} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import Loading from '../componentes/Loading';
import Busqueda from '../componentes/Busqueda';
import BusquedaSinForm from '../componentes/BusquedaSinForm';
import BusquedaProvincias from '../componentes/BusquedaProvincias';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage, useFormikContext} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faDotCircle } from '@fortawesome/free-regular-svg-icons';
import { faUserCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import {hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import Abmaula from '../abms/Abm-aula';
import ReactTooltip from 'react-tooltip';

export default function AbmIglesia({id_iglesia, finalizarAltaOcopia,esModal,id_copia, usuario, esVisualizacion}){

    const provinciaDefault = [{id_provincia:-1, nombre:"Seleccionar país"}]

    // estados flags 
    const [cargandoDatosTablasGenerales,setCargandoTablasGenerales] = useState(false);
    const [cargandoDatosIglesia,setCargandoDatosIglesia] = useState(false);
    const [grabandoDatosIglesia,setGrabandoDatosIglesia] = useState(false);
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
    const [tiposIglesias, setTiposIglesias]= useState([]);
    const [obrerosUad, setObrerosUad]= useState([]);

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
    const [huboCambiosInstrumentos,setHuboCambiosInstrumentos]=useState(false)
    const [huboCambiosMaterias,setHuboCambiosMaterias]=useState(false)
    const [buscarHistorial,setBuscarHistorial]=useState(false)
    const [contadorModificaciones,setContadorModificaciones]=useState(0)
    const[datosParaImpresiones,setDatosParaImpresiones]=useState(null)
    const[historial,setHistorial]=useState([])

    const [tiposUsuario, setTiposUsuario]= useState([]);
    const [permisosUsuario, setPermisosUsuario]= useState([]);
    const [buscarPastorUad,setBuscarPastorUad] = useState(false)
    const [buscarEncargadoUad,setBuscarEncargadoUad] = useState(false)
    const [buscarProvincias,setBuscarProvincias] = useState(false)

    const [balances,setBalances] = useState([])
    const [diezmos,setDiezmos] = useState([])

    const {toggle, isShowing } = useModal();
    const [aula, setAula ] = useState(false);
    const [valoresFormulario,setValoresFormulario] = useState(null)
    const pruebaRef = useRef(null)

    // estado objeto de inicialización que inicializa los valores del abm 
    // en el alta o es cargado con los valores de la base de datos en una modificación
    // este objeto se pasa al formulario Formik para que el estado del formulario se inicialice
    // con este objeto. Luego el resto del trabajo se hace sobre el estado del formulario  
    const [objetoInicializacion,setObjetoInicializacion]=useState({
        nombre_iglesia:'',
        direccion:'',
        barrio:'',
        cod_postal:'',
        localidad:'',
        id_provincia:'',        
        fax:'',
        telefono:'',
        cant_miembros:0,
        fich_culto:false,
        libro_cont:false,
        seguro:false,
        hab_municip:false,
        dispensario:false,
        comedor:false,
        colegio:false,
        rehabilit:false,
        hogar_niños:false,
        predio_recreat:false,
        encargado_uad:false,
        pastor_uad:false,
        pag_web:'',
        nombre_pastor:'',
        nombre_encargado:'',
        id_pastor_UAD:-1,
        id_encargado_UAD:-1,
        id_region:usuario.id_region,
        id_tipo_iglesia:0,
    })

    useEffect(()=>{

        const cargarTablasGenerales = async ()=>{

            setCargandoTablasGenerales(true);
        
            try{
                const vectorResultado = await Promise.all([
                    Axios.get('/api/tablasgenerales/tiposiglesias'),
                    Axios.get('/api/tablasgenerales/regiones'),
                    Axios.get('/api/tablasgenerales/provincias'),
                    Axios.get('/api/tablasgenerales/listado/obreros'),
                    Axios.get(`/api/tablasgenerales/balances/${id_iglesia ? id_iglesia : 0}`),
                    Axios.get(`/api/tablasgenerales/mesesdiezmados/${id_iglesia ? id_iglesia : 0}`)
                ])

               
                setTiposIglesias(vectorResultado[0].data);
                setRegiones(vectorResultado[1].data);
                setProvincias(vectorResultado[2].data);
                setObrerosUad(vectorResultado[3].data);
                setBalances(vectorResultado[4].data);
                setDiezmos(vectorResultado[5].data);

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
     },[id_iglesia])

useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        if (buscarEncargadoUad){
            setBuscarEncargadoUad(false)
        }
        if (buscarProvincias){
            setBuscarProvincias(false)
        }
        if (buscarPastorUad){
            setBuscarPastorUad(false)
        }        
    }
},[isShowing])

useEffect(()=>{

    const completarDatosDeLaIglesia = async (id)=>{   
        setCargandoDatosIglesia(true)
        try{
            
                const {data} = await Axios.get(`/api/tablasgenerales/iglesia/${id}`)

                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para la iglesia ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatosIglesia(false)
                    setHuboError(true)
                    return
                }

                const datosDelRecordset = data[0];

                const datosIglesia = {
                    id_provincia:noNullNumber(datosDelRecordset.id_provincia),
                    nombre_iglesia:datosDelRecordset.nombre.trim(),
                    direccion:noNull(datosDelRecordset.direccion),
                    localidad:noNull(datosDelRecordset.localidad),
                    cod_postal:noNull(datosDelRecordset.cod_postal),
                    fax:noNull(datosDelRecordset.fax),
                    telefono:noNull(datosDelRecordset.telefono),
                    pag_web:noNull(datosDelRecordset.pagina_web),
                    barrio:noNull(datosDelRecordset.barrio),
                    id_tipo_iglesia:noNullNumber(datosDelRecordset.id_tipo_iglesia),
                    nombre_pastor:noNull(datosDelRecordset.pastor),
                    nombre_encargado:noNull(datosDelRecordset.encargado),
                    cant_miembros:noNullNumber(datosDelRecordset.cant_miembros),
                    id_region:noNullNumber(datosDelRecordset.id_region),
                    id_pastor_UAD:datosDelRecordset.id_pastor_uad,
                    id_encargado_UAD:datosDelRecordset.id_encargado_uad,
                    fich_culto: datosDelRecordset.fich_culto,
                    libro_cont: datosDelRecordset.libro_cont,
                    seguro: datosDelRecordset.seguro,
                    hab_municip :datosDelRecordset.hab_municip,
                    colegio: datosDelRecordset.colegio,
                    comedor: datosDelRecordset.comedor,
                    dispensario: datosDelRecordset.dispensario,
                    rehabilit: datosDelRecordset.rehabilit,
                    hogar_niños: datosDelRecordset.hogar_niños,
                    predio_recreat: datosDelRecordset.predio_recreat,
                    pastor_uad: datosDelRecordset.id_pastor_uad ? true:false,
                    encargado_uad: datosDelRecordset.id_encargado_uad ? true:false,
                }
                  
                console.log('datosIglesia',datosIglesia)
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                
                setObjetoInicializacion({...objetoInicializacion,...datosIglesia}) 

                setDatosParaImpresiones(datosDelRecordset)

                //setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
                setCargandoDatosIglesia(false)
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
            
                setCargandoDatosIglesia(false)
                setHuboError(true)
            }

    }

    if (tablasCargadas ){ // este useEffect se dispara solo si ya se cargaron las tablas generales

        if (id_iglesia){ //  si se recibió el nùmero de alumno por propiedad es decir si es una modificación
            
            setTituloAbm(esVisualizacion ? `Visualizar la iglesia #${id_iglesia}` : `Editar la iglesia #${id_iglesia}`);
            setTituloCerrar('Cerrar la ficha de la iglesia');
            completarDatosDeLaIglesia(id_iglesia); 
            
        }
        else if (id_copia){
            setTituloAbm(`Crear una iglesia como copia de la iglesia #${id_copia}`);
            setTituloCerrar('Cerrar la ficha de la iglesia');
            completarDatosDeLaIglesia(id_copia); 
            const rangoPermitidoAlta = filtrarRangoPermitidoParaAlta(tiposIglesias,setTiposIglesias)
        }
        else{ //  si no recibió el nùmero de curso por propiedad, es decir un alta
            setTituloAbm(`Crear una nueva Iglesia`);
            setTituloCerrar('Cancelar');
            hacerScroll("nuevo-Iglesia");
            const tipoIglesiaPermitidaAlta = filtrarRangoPermitidoParaAlta(tiposIglesias,setTiposIglesias)
            const regionPermitidaAlta = filtrarRegionPermitidaParaAlta(regiones,setRegiones,usuario.id_region)

            setObjetoInicializacion({...objetoInicializacion,
                                     id_tipo_iglesia:tipoIglesiaPermitidaAlta,
                                     id_region:regionPermitidaAlta }) 
            document.getElementById('abm-nombre_iglesia').focus()

        }

    }

},[tablasCargadas,id_iglesia,contadorModificaciones])     
  
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

useEffect(()=>{

    if (!isShowing){
        
        if (valoresFormulario){
            console.log(valoresFormulario)
        }
    }

},[isShowing])

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

const grabarIglesia = async (values)=>{

    let resultado;
    let id_iglesia_interno;
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    console.log('los valores', values)
    const objetoAgrabar = { 
                nombre_iglesia: values.nombre_iglesia.trim(),
                direccion:values.direccion.trim(),
                barrio:values.barrio.trim(),
                localidad:values.localidad.trim(),
                cod_postal:values.cod_postal.trim(),
                fax:values.fax.trim(),
                telefono:values.telefono.trim(),
                pag_web:values.pag_web.trim(),
                id_provincia:Number(values.id_provincia),
                id_pastor_UAD:values.id_pastor_UAD >0 ? Number(values.id_pastor_UAD) : null,
                id_encargado_UAD:values.id_encargado_UAD > 0 ? Number(values.id_encargado_UAD) : null,                
                id_region:Number(usuario.id_region),   // en un alta de un Iglesia solo dejamos que se le asigne la región del usuario logueado             
                cant_miembros:values.cant_miembros,
                nombre_pastor:values.nombre_pastor.trim(),
                nombre_encargado:values.nombre_encargado.trim(),
                fich_culto:values.fich_culto,
                libro_cont:values.libro_cont,
                seguro:values.seguro,
                hab_municip:values.hab_municip,
                dispensario:values.dispensario,
                comedor:values.comedor,
                colegio:values.colegio,
                rehabilit:values.rehabilit,
                hogar_niños:values.hogar_niños,
                predio_recreat:values.predio_recreat,

                id_tipo_iglesia:Number(values.id_tipo_iglesia),
                id_usuario:usuario.id_usuario
        }

    setGrabandoDatosIglesia(true)

    console.log('grabo esto ',objetoAgrabar)
    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`

    try{
        if (id_iglesia){
            resultado= await Axios.put(`/api/tablasgenerales/iglesia/${id_iglesia}`,objetoAgrabar)
            id_iglesia_interno = id_iglesia; // es el id del id_iglesia a modificar
        }else{
            resultado= await Axios.post(`/api/tablasgenerales/iglesia`,objetoAgrabar)
            id_iglesia_interno = resultado.data.id_iglesia; // es el id del nuevo Iglesia 
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nueva iglesia #${resultado.data.id_iglesia})</p>`
        }

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   

        setGrabandoDatosIglesia(false)

        if (esModal){
            if(id_iglesia){ // si es modal y es una modificación
                setContadorModificaciones(contadorModificaciones+1)
                finalizarAltaOcopia(false)
            }else{ // si es modal y es un alta
                finalizarAltaOcopia(true,id_iglesia_interno)
            }

        }else{ // si no es modal
            finalizarAltaOcopia(true); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso
        }

    }catch(err){
        console.log(err.response)
        let mensaje_html_error;

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos de la iglesia</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos de la iglesia</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos de la iglesia</p><p>${err.response}</p>`
        }


        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatosIglesia(false)
    }
   

}

const cambiarTipoPastor = (e,setFieldValue,values)=>{

    console.log('e.target.value',e.target.value)

    setValoresFormulario(values)

    if (e.target.value=='true'){

            setFieldValue('id_pastor_UAD',-1)
            //setFieldValue('nombre_pastor',"")
            setTimeout(() => {
                hacerfocoEnPrimerInput("abm-nombre_pastor")
            }, 200);

    }else{
            //setFieldValue('nombre_pastor',"")
            setBuscarPastorUad(true)
            //toggle()     
    }    
       

}

const buscarObrero = (pastor)=>{

    if (pastor){
        setBuscarPastorUad(true)
    }else{
        setBuscarEncargadoUad(true)
    }
    toggle()     
       
}

const BusquedaPastor = (setFieldValue)=>{
    setFieldValue('id_pastor_UAD',-1)
    setBuscarPastorUad(true)
   // hacerfocoEnPrimerInput("abm-nombre_pastor")
}

const BusquedaEncargado = (setFieldValue)=>{
    setFieldValue('id_encargado_UAD',-1)
    setBuscarEncargadoUad(setFieldValue)
    //hacerfocoEnPrimerInput("abm-nombre_encargado")
}

const cerrarBusquedaPastor = ()=>{
    setBuscarPastorUad(false)
}

const cerrarBusquedaEncargado = ()=>{
    setBuscarEncargadoUad(false)
}

const finalizarSeleccion = (obrero,objetoModificacion)=>{

    objetoModificacion.funcion(objetoModificacion.id,obrero.id_obrero)
    objetoModificacion.funcion(objetoModificacion.nombre,obrero.nom_simple)


    if (buscarPastorUad){
        setBuscarPastorUad(false)
        /*toggle()
        setTimeout(() => {
            hacerfocoEnPrimerInput("abm-nombre_pastor")
        }, 200);*/
    }
    if (buscarEncargadoUad){
        setBuscarEncargadoUad(false)
       /* toggle()
        setTimeout(() => {
            hacerfocoEnPrimerInput("abm-nombre_encargado")
        }, 200);*/
    }

}





const finalizarSeleccionProvincia = (obrero,objetoModificacion)=>{

    objetoModificacion.funcion(objetoModificacion.id,obrero.id_provincia)


        setBuscarProvincias(false)
        toggle()


}

const cambiarTipoEncargado = (e,setFieldValue,values)=>{

    console.log('e.target.value',e.target.value)

    setValoresFormulario(values)

    if (e.target.value=='true'){

        setFieldValue('id_encargado_UAD',-1)
            //setFieldValue('nombre_encargado',"")
            setTimeout(() => {
                hacerfocoEnPrimerInput("abm-nombre_encargado")
            }, 200);
        
    }else{
            //setFieldValue('nombre_encargado',"")
            setBuscarEncargadoUad(true)
            //toggle()
    }    
       

}

const cancelarAbm = ()=>{
    if (!id_iglesia){ // solo cancelo si es un alta o una copia ya que se hacen en la vista de cursos. La edición de un curso se hace en la vista de curso y siempre lo muestro
        finalizarAltaOcopia(false)
    }
}

const iniciarGrabarIglesia = (values)=>{
    let texto;
    let textoConfirmacion;

    if (id_iglesia){
        texto = `Confirma la modificación de la Iglesia
            ${id_iglesia}?`
        textoConfirmacion = 'Si, modificar la Iglesia'
    }else{
        texto = `Confirma la creación de la nueva iglesia? (${values.nombre_iglesia})`
        textoConfirmacion = 'Si, crear la iglesia'
    }

    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                grabarIglesia(values);

            }else{
                console.log("Se canceló la modificación o creación de la iglesia")
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

const escapeListaE = (e)=>{
    if (e.keyCode === 27) {
        e.preventDefault();
        setBuscarEncargadoUad(false)
    }
}

const escapeListaP = (e, )=>{
    if (e.keyCode === 27) {
        e.preventDefault();
        setBuscarPastorUad(false)
    }
}

const onsubmitIglesia = values =>{
    console.log(values)
    iniciarGrabarIglesia(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatosTablasGenerales){
        return <Main center><div><Loading/><span className="cargando">Cargando cargando datos generales...</span></div></Main>
    };

    if (cargandoDatosIglesia){
        return <Main center><div><Loading /><span className="cargando">Cargando datos personales del Iglesia...</span></div></Main>
    };
    
    const validationSchemaIglesia = Yup.object({

        nombre_iglesia:Yup.string().max(200,'El nombre debe tener como máximo 100 caracteres')
                .required('Falta completar el nombre de la iglesia'),
        direccion:Yup.string().max(500,'La dirección debe tener como máximo 500 caracteres'),            
        localidad:Yup.string().max(200,'La localidad debe tener como máximo 200 caracteres')
            .required('Falta completar la localidad'),    
        cod_postal:Yup.string().max(10,'El código postal debe tener como máximo 10 caracteres'), 
        barrio:Yup.string().max(200,'El barrio debe tener como máximo 200 caracteres'),            
        telefono:Yup.string().max(200,'El teléfono debe tener como máximo 200 caracteres'),
        fax:Yup.string().max(200,'El fax debe tener como máximo 200 caracteres'),            
        nombre_pastor:Yup.string().max(200,'El nombre del pastor debe tener como máximo 200 caracteres'),
        nombre_encargado:Yup.string().max(200,'El nombre del encargado debe tener como máximo 200 caracteres'),
        fich_culto:Yup.boolean().required(),
        libro_cont:Yup.boolean().required(),
        seguro:Yup.boolean().required(),
        hab_municip:Yup.boolean().required(),
        dispensario:Yup.boolean().required(),
        comedor:Yup.boolean().required(),
        colegio:Yup.boolean().required(),
        rehabilit:Yup.boolean().required(),
        hogar_niños:Yup.boolean().required(),
        predio_recreat:Yup.boolean().required(),
        cant_miembros:Yup.number().required('Falta indicar la cantidad de miembros. Mínimo 0 Máximo 10000').test("cant_miembros",'La cantidad de miembros debe ser un número entre 0 y 10000',value=>value>=0 && value<=10000),
        id_region:Yup.number().integer().required(),
        id_tipo_iglesia:Yup.number()
            .integer()
            .required('Falta seleccionar el tipo de iglesia')
            .test("prueba","El id de tipo de iglesia debe ser mayor a cero",value => value >= 0),
        id_provincia:Yup.number()
            .integer()
            .required('Falta seleccionar la provincia'),
  /*      id_pastor_UAD : 
            Yup.string().nullable().when("pastor_uad", {
            is: true,
            then: Yup.string().test("prueba","Falta seleccionar un obrero UAD",value => { console.log(value); return Number(value) >= 0})
        }),*/
        id_pastor_UAD :Yup.number().integer().required(),
        id_encargado_UAD :Yup.number().integer().required(),
        /*id_encargado_UAD :
            Yup.string().nullable().when("encargado_uad", {
                is: true,
                then: Yup.string().test("prueba","Falta seleccionar un obrero UAD",value => Number(value) >= 0)               
            }),*/            
        pastor_uad:Yup.boolean().required(),
        encargado_uad:Yup.boolean().required()
        })    
        
        return (
            <Main> 

            { grabandoDatosIglesia && <Main><div><Loading blanco={true}/><span className="cargando text-white">Grabando datos...</span></div></Main>}
      <div className={grabandoDatosIglesia ? "hidden": 'pt-4 rounded flex flex-wrap container-mult-flex-center'} >
                 <div className="flex f-row">
    <div>
                {/*<div className="AnaliticoContainer relative">
                    <div className="FormAnaliticoContainer relative">
                        <div  className="mb-2 titulo-cab-modal titulo-abm flex f-row">{tituloAbm}
                    </div>*/}
                         {/*el botòn de cancelar solo lo habilito cuando es un alta o copia*/}
                    { !esModal && <button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm"><FontAwesomeIcon icon={faWindowClose}/></button> }
                    <Formik validateOnMount={true}  validateOnChange={true}  validateOnBlur={true}
                    enableReinitialize={true} initialValues={objetoInicializacion} 
        validationSchema={validationSchemaIglesia} onSubmit={onsubmitIglesia} >
    { ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty,validateForm }) =>{ 
        return (
        <Form id="ref-ficha">


        {/*isShowing && buscarPastorUad && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'transparent'}}>
            <BusquedaSinForm texto={values.nombre_pastor} finalizarSeleccion={finalizarSeleccion} objetoModificacion={{funcion:setFieldValue, id:'id_pastor_UAD', nombre:'nombre_pastor'}}/>    
        </Modal>}

        { isShowing && buscarEncargadoUad && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'transparent'}}>
            <BusquedaSinForm texto={values.nombre_encargado} finalizarSeleccion={finalizarSeleccion} objetoModificacion={{funcion:setFieldValue, id:'id_encargado_UAD', nombre:'nombre_encargado'}}/>    
        </Modal>*/}

        { isShowing && buscarProvincias && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'transparent'}}>
            <BusquedaProvincias finalizarSeleccion={finalizarSeleccionProvincia} objetoModificacion={{funcion:setFieldValue, id:'id_provincia', nombre:'nombre_encargado'}}/>    
        </Modal>}
        
        { isShowing && aula && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'transparent'}}>
            <Abmaula id_aula={null}/>    
        </Modal>}

    {/*<div style={{width: "100%"}}><p>{JSON.stringify(values, null, "\t")}</p></div>*/} 
    {/*<div style={{width: "100%"}}><p>{JSON.stringify(touched, null, "\t")}</p></div>*/} 

    <div  className="mb-2 titulo-cab-modal titulo-abm flex f-row">{tituloAbm}</div>
        <div className="flex f-col">
        <div className="AnaliticoContainer relative">
        
                <div className="FormAbmContainerLargo">
                    <div className="flex f-col">
                    {id_iglesia && dirty && !esVisualizacion &&
                        <span type="button" title="Deshacer los cambios y restaurar valores iniciales" 
                            className="cursor-pointer absolute botonRestaurar boton-restaurar-abm-form" 
                            onClick={() => resetForm(initialValues)}>Restaurar
                        </span>
                    }
                    <div className="flex f-col">
                        <div className="flex f-col">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre_iglesia">Nombre</label>
                            <Field 
                                id="abm-nombre_iglesia"
                                type="text" 
                                autoComplete="off" 
                                maxLength="100"
                                disabled ={esVisualizacion}
                                name="nombre_iglesia" 
                                onFocus={()=>seleccionarTextoInput("abm-nombre_iglesia")} 
                                onClick={()=>seleccionarTextoInput("abm-nombre_iglesia")}                         
                                className={values.nombre_iglesia ? 'input-cvalor' : 'input-vacio'}
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="nombre_iglesia"/></div> 
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
                                disabled ={esVisualizacion}
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
                                disabled ={esVisualizacion}
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
                                disabled ={esVisualizacion}
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
                                disabled ={esVisualizacion}
                                onFocus={()=>seleccionarTextoInput("abm-cod_postal")} 
                                onClick={()=>seleccionarTextoInput("abm-cod_postal")}                         
                                className={values.cod_postal ? 'input-cvalor' : 'input-vacio'}
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="cod_postal"/></div> 
                    </div>                                                                                   
                    <div className="flex f-col">
                        <div className="flex f-col el-abm-sel-pos">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Provincia</label>
                                {!esVisualizacion && <span title="Buscar provincias" onClick={()=>{setBuscarProvincias(true);toggle()}} className="cursor-pointer acciones-lista-cabecera botonNc ml-6" >
                                        <FontAwesomeIcon className="color-tomato" icon={faSearch}/> 
                                </span>}
                            </div>

                            
                            <select onChange={handleChange} value={values.id_provincia} 
                                    name="id_provincia" 
                                    disabled ={esVisualizacion}
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
                                disabled ={esVisualizacion}
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
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-fax">Fax</label>
                            <Field 
                                id="abm-fax"
                                type="text" 
                                autoComplete="off" 
                                disabled ={esVisualizacion}
                                onFocus={()=>seleccionarTextoInput("abm-fax")} 
                                onClick={()=>seleccionarTextoInput("abm-fax")}                            
                                maxLength="500"
                                name="fax" 
                                className={values.fax ? 'input-cvalor' : 'input-vacio'}
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="fax"/></div> 
                    </div>     
                    </div>
                    <div className="flex f-col">
                        <div className="flex f-col">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-pag_web">Sitio web</label>
                            <Field 
                                id="abm-pag_web"
                                type="text" 
                                autoComplete="off" 
                                maxLength="500"
                                disabled ={esVisualizacion}
                                onFocus={()=>seleccionarTextoInput("abm-pag_web")} 
                                onClick={()=>seleccionarTextoInput("abm-pag_web")}                           
                                name="pag_web" 
                                value={values.pag_web.toLowerCase()}
                                className={values.email ? 'input-cvalor' : 'input-vacio'}
                                />
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="pag_web"/></div> 
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
                                <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-id_tipo_iglesia">Tipo de Iglesia</label>
                                <select onChange={handleChange} value={values.id_tipo_iglesia} 
                                        name="id_tipo_iglesia" 
                                        disabled ={esVisualizacion}
                                        className="w-100pc" id="abm-curso-id_tipo_iglesia">
                                        {/*<option value="-1" disabled>Seleccionar</option>*/}
                                        {
                                            tiposIglesias.map(item=>
                                                <option key={`abmcurso-permiso${item.id_tipo_iglesia}`} 
                                                    disabled
                                                    value={item.id_tipo_iglesia}>{item.nombre}</option>
                                            )
                                        }
                                </select>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="id_tipo_iglesia"/></div> 
                    </div>   
                <div className="flex f-col">
                            <div className="flex f-col el-abm-sel-pos">
                                <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Región</label>
                                <select onChange={handleChange} value={values.id_region} 
                                        name="id_region" 
                                        disabled ={esVisualizacion}
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
                    {/*<div className="flex f-col">
                        <div className="flex f-col el-abm-sel-pos">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Encargado</label>
                            <select onChange={handleChange} value={values.id_encargado_UAD} 
                                    name="id_encargado_UAD" 
                                    className="w-100pc" id="abm-curso-id_rango">
                                    <option value="-1" disabled>Seleccione un obrero de la UAD</option>
                                        {
                                        obrerosUad.map(item=>
                                            <option key={`abmcurso-permiso${item.id_obrero}`} 
                                            value={item.id_obrero}>{item.obrero}</option>
                                        )
                                    }
                            </select>
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="id_encargado_UAD"/></div> 
                    </div>*/   }    
                    {/*<div className="flex f-col">
                        <div className="flex f-col el-abm-sel-pos">
                            <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Pastor</label>
                            <select onChange={handleChange} value={values.id_pastor_UAD} 
                                    name="id_pastor_UAD" 
                                    className="w-100pc" id="abm-curso-id_rango">
                                    <option value="-1" disabled>Seleccione un obrero de la UAD</option>
                                        {
                                        obrerosUad.map(item=>
                                            <option key={`abmcurso-permiso${item.id_obrero}`} 
                                            value={item.id_obrero}>{item.obrero}</option>
                                        )
                                    }
                            </select>
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="id_pastor_UAD"/></div> 
                    </div> */}     

                    <div className="flex f-col">
                        <div className="flex f-col">
                            <div className="flex f-row jfc-sb">
                                <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre_pastor">Pastor</label>
                                    {/*<label className="text-xxsmall color-gray as-center" htmlFor="abm-pastor_uad">Es obrero UAD</label>
                                    <Field 
                                    id="abm-pastor_uad"
                                    type="checkbox" 
                                    className="ml-4"
                                    onChange={(e)=>{handleChange(e);cambiarTipoPastor(e,setFieldValue,values)}}
                                    name="pastor_uad" 
                                    />*/}
                                    {!buscarPastorUad && values.id_pastor_UAD > 0 && <span className="text-xsmall as-center border-bottom-dotted-gray color-gray">Pastor <span className="obuad">Es obrero UAD Id#{values.id_pastor_UAD}</span></span>}
                                    {!buscarPastorUad && values.id_pastor_UAD ==-1 && values.nombre_pastor !="" && <span className="text-xsmall as-center border-bottom-dotted-gray color-gray">Pastor <span className="obext">Es externo</span></span>}
                            </div>
                            <div className="flex f-row">
                                <Field
                                    name="nombre_pastor"
                                    type="text"
                                    maxLength="200"
                                    id="abm-nombre_pastor"
                                    data-tip 
                                    disabled ={esVisualizacion}
                                    data-for= "tooltip_n_pastor"
                                    placeholder={'Escriba el nombre del pastor'}
                                    autoComplete="off" 
                                    onKeyDown={(e)=>escapeListaP(e)}
                                    onInput={()=>{BusquedaPastor(setFieldValue)}}                      
                                    onFocus={()=>seleccionarTextoInput("abm-nombre_pastor")} 
                                    //onClick={()=>seleccionarTextoInput("abm-nombre_pastor")}   
                                    //disabled = {values.pastor_uad ? true : false}                      
                                    className={values.nombre_pastor ? 'input-cvalor w-100pc' : 'input-vacio w-100pc'}
                                />
                                {/* true && <span title="Buscar obreros UAD" onClick={()=>{BusquedaPastor(true)}} className="cursor-pointer icbs botonNc" >
                                            <FontAwesomeIcon className="color-tomato" icon={faSearch}/> 
                                </span>*/}
                            </div>
                           
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="nombre_pastor"/></div> 
                        <div className="error_formulario"><ErrorMessage name="id_pastor_UAD"/></div> 
                    
                        {buscarPastorUad && <div className="listbusqueda">
                            <span title="Cerrar el listado sin seleccionar" onClick={()=>{cerrarBusquedaPastor()}} className="cursor-pointer acciones-lista-cabecera inline-block-1 botonNc ml-6 mt-4 mb-4" >
                                <FontAwesomeIcon className="color-tomato ml-2 text-larger" icon={faWindowClose}/> Cerrar
                            </span>  
                            { values.nombre_pastor !="" && <span title="Aceptar el nombre ingresado. No es obrero UAD" onClick={()=>{cerrarBusquedaPastor()}} className="cursor-pointer boton-aceptar ml-6 mt-4 mb-4" >
                                Aceptar 
                            </span>}   
                            {values.nombre_pastor !="" && <span className="text-xsmall"> (No es obrero UAD)</span>  
                            }                                              
                            <BusquedaSinForm texto={values.nombre_pastor} finalizarSeleccion={finalizarSeleccion} objetoModificacion={{funcion:setFieldValue, id:'id_pastor_UAD', nombre:'nombre_pastor'}}/>    
                        </div>}
                    </div> 
                    <div className="flex f-col">
                        <div className="flex f-col">
                            <div className="flex f-row jfc-sb">
                                <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre_encargado">Encargado</label>
                                    {/*<label className="text-xxsmall color-gray as-center" htmlFor="abm-nombre_encargado">Es obrero UAD</label>
                                    <Field 
                                    id="abm-encargado_uad"
                                    type="checkbox" 
                                    className="ml-4"
                                    onChange={(e)=>{handleChange(e);cambiarTipoEncargado(e,setFieldValue,values)}}
                                    name="encargado_uad" 
                                    />*/}

                                    {!buscarEncargadoUad && values.id_encargado_UAD > 0 && <span className="text-xsmall as-center border-bottom-dotted-gray color-gray">Encargado <span className="obuad"> Es obrero UAD Id#{values.id_encargado_UAD}</span></span>}
                                    {!buscarEncargadoUad && values.id_encargado_UAD ==-1 && values.nombre_encargado !="" && <span className="text-xsmall as-center border-bottom-dotted-gray color-gray">Encargado <span className="obext">Es externo</span></span>}
                            </div>       
                            <div className="flex f-row">
                                <Field
                                    name="nombre_encargado"
                                    type="text"
                                    maxLength="200"
                                    onKeyDown={(e)=>escapeListaE(e)}
                                    placeholder={'Escriba el nombre del encargado'}
                                    autoComplete="off" 
                                    disabled ={esVisualizacion}
                                    id="abm-nombre_encargado"
                                    data-tip 
                                    data-for= "tooltip_n_encargado"
                                    //disabled = {values.encargado_uad ? true : false}
                                    onInput={()=>{BusquedaEncargado(setFieldValue)}}                      
                                    onFocus={()=>seleccionarTextoInput("abm-nombre_encargado")} 
                                    //onClick={()=>seleccionarTextoInput("abm-nombre_encargado")}                         
                                    className={values.nombre_encargado ? 'input-cvalor w-100pc' : 'input-vacio w-100pc'}
                                />

                                    {/* true && <span title="Buscar obreros UAD" onClick={()=>{BusquedaEncargado(false)}} className="cursor-pointer icbs botonNc" >
                                            <FontAwesomeIcon className="color-tomato" icon={faSearch}/> 
                                </span>*/}    
                            </div>                    
                            
                        </div>  
                        <div className="error_formulario"><ErrorMessage name="nombre_encargado"/></div> 
                        <div className="error_formulario"><ErrorMessage name="id_encargado_UAD"/></div> 
                        { buscarEncargadoUad && <div className="listbusqueda">
                        <span title="Cerrar el listado sin seleccionar" onClick={()=>{cerrarBusquedaEncargado()}} className="cursor-pointer acciones-lista-cabecera inline-block-1 botonNc ml-6 mt-4 mb-4" >
                                <FontAwesomeIcon className="color-tomato ml-2 text-larger" icon={faWindowClose}/> Cerrar
                        </span>  
                        { values.nombre_encargado !="" && <span title="Aceptar el nombre ingresado. No es obrero UAD" onClick={()=>{cerrarBusquedaEncargado()}} className="cursor-pointer boton-aceptar ml-6 mt-4 mb-4" >
                                Aceptar {values.nombre_encargado}
                            </span>}   
                        {values.nombre_encargado !="" && <span className="text-xsmall"> (No es obrero UAD)</span>  
                        }                          
                        <BusquedaSinForm  texto={values.nombre_encargado} finalizarSeleccion={finalizarSeleccion} objetoModificacion={{funcion:setFieldValue, id:'id_encargado_UAD', nombre:'nombre_encargado'}}/>    
                    </div>}
                       {/*<p>{values.id_encargado_UAD}</p>
                        <p>{values.id_pastor_UAD}</p>
                        <p>{values.pastor_uad}</p>
                <p>{values.encargado_uad}</p>*/}
                    </div>       
                    <div className="flex f-col">
                    <div className="flex f-col">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-cantidad">Cantidad de miembros</label>
                        <Field 
                            id="abm-cantidad"
                            type="number" 
                            autoComplete="off" 
                            maxLength="2"
                            min={0}
                            disabled ={esVisualizacion}
                            max={10000}
                            name="cant_miembros" 
                            onFocus={()=>seleccionarTextoInput("abm-cantidad")} 
                            onClick={()=>seleccionarTextoInput("abm-cantidad")}                         
                            className={values.nombre ? 'input-cvalor' : 'input-vacio'}
                            />
                    </div>  
                    <div className="error_formulario"><ErrorMessage name="cant_miembros"/></div> 
                </div>              
                    <div className="mt-4 mb-4 pl-8">
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-fich_culto">¿Tiene fichero de culto?</label>
                                <Field 
                                    id="abm-fich_culto"
                                    type="checkbox" 
                                    className="ml-4"
                                    disabled ={esVisualizacion}
                                    name="fich_culto" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.fich_culto ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="fich_culto"/></div> 
                        </div>           
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-maestro">¿Lleva libros contables?</label>
                                <Field 
                                    id="abm-libro_cont"
                                    type="checkbox" 
                                    disabled ={esVisualizacion}
                                    className="ml-4"
                                    name="libro_cont" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.libro_cont ? 'SI' : 'NO'}</span>
                                   
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="libro_cont"/></div> 
                        </div>           
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-evangelista">¿Posee algún tipo de seguro?</label>
                                <Field 
                                    id="abm-seguro"
                                    type="checkbox" 
                                    disabled ={esVisualizacion}
                                    className="ml-4"
                                    name="seguro" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.seguro ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="seguro"/></div> 
                        </div>           
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-hab_municip">¿Tiene habilitación municipal?</label>
                                <Field 
                                    id="abm-hab_municip"
                                    type="checkbox" 
                                    className="ml-4"
                                    disabled ={esVisualizacion}
                                    name="hab_municip" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.hab_municip ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="hab_municip"/></div> 
                        </div>           
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-dispensario">¿Posee algún dispensario a cargo?</label>
                                <Field 
                                    id="abm-dispensario"
                                    type="checkbox" 
                                    disabled ={esVisualizacion}
                                    className="ml-4"
                                    name="dispensario" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.dispensario ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="dispensario"/></div> 
                        </div>    
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-comedor">¿Posee algún comedor a cargo?</label>
                                <Field 
                                    id="abm-comedor"
                                    type="checkbox" 
                                    className="ml-4"
                                    disabled ={esVisualizacion}
                                    name="comedor" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.comedor ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="comedor"/></div> 
                        </div>    
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-colegio">¿Posee algún colegio a cargo?</label>
                                <Field 
                                    id="abm-colegio"
                                    type="checkbox" 
                                    disabled ={esVisualizacion}
                                    className="ml-4"
                                    name="colegio" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.colegio ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="colegio"/></div> 
                        </div>    
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-rehabilit">¿Posee algún centro de rehabilitación?</label>
                                <Field 
                                    id="abm-rehabilit"
                                    type="checkbox" 
                                    className="ml-4"
                                    disabled ={esVisualizacion}
                                    name="rehabilit" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.rehabilit ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="rehabilit"/></div> 
                        </div>    
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-hogar_niños">¿Posee algún hogar de niños a cargo?</label>
                                <Field 
                                    id="abm-hogar_niños"
                                    type="checkbox" 
                                    disabled ={esVisualizacion}
                                    className="ml-4"
                                    name="hogar_niños" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.hogar_niños ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="hogar_niños"/></div> 
                        </div>    
                        <div className="flex f-col items-centerx">
                            <div className="flex f-row">
                                <label className="Form__labels__abmcursos_corto w-300" htmlFor="abm-predio_recreat">¿Posee algún predio recreativo?</label>
                                <Field 
                                    id="abm-predio_recreat"
                                    type="checkbox" 
                                    disabled ={esVisualizacion}
                                    className="ml-4"
                                    name="predio_recreat" 
                                    />
                                <span className="text-xxsmall color-gray as-center ml-4">{values.predio_recreat ? 'SI' : 'NO'}</span>
                            </div>  
                            <div className="error_formulario"><ErrorMessage name="predio_recreat"/></div> 
                        </div>      
                    </div>     

                    <br></br>       
                    { dirty && !esVisualizacion && <button className="Form__submit" type="submit">Grabar</button> }
                </div>
               
            
            </div>   
            <div className="">
                {/*<div style={{width: "100%"}}><p>{JSON.stringify(values, null, "\t")}</p></div>*/}
          </div>
        </div>
     
        </Form>) } }
               
        </Formik>
            </div>
            {id_iglesia && <div className="FormAbmContainer flex f-col ml-2">
                    <div className="flex f-col">
                        <span className="p-2 mb-2 text-white bg-tomato inline-block-1 text-center">Balances</span>
                        {balances.map(item=><span className={item.estado ==0 ? 'bal-np' : 'bal-pr'}>{item.periodo}</span>)}
                    </div>
                    <div className="flex f-col">
                    <span className="p-2 mt-2 mb-2 text-white bg-tomato inline-block-1 text-center">Diezmos</span>
                        {diezmos.map(item=><div className="diezmos"><span className={Number(item.diezmo)>0 ? "dm-pr mes-dm" : 'dm-np mes-dm'}>{item.periodo}</span></div>)}
                    </div>
                    {diezmos.length==0 && <span className="dm-np">0.00</span>}
            </div>}
        </div> 

        {diezmos.length>0 && <div className="cont-grp-dm">
            <p>Resumen de diezmos (Últimos 12 meses) </p>
         <div className="flex f-row mt-2">
          {diezmos.reverse().map(item=><div className="flex f-col"><Spinner item={item} todos={diezmos}/><p className="pgf-dm">{item.periodo}</p></div> )}   
         </div>
     
        </div>}


        </div>
        
        <ReactTooltip  id="tooltip_n_pastor" 
            type="info">
                <p>Escriba el nombre del pastor para seleccionarlo en la lista de obreros UAD</p>
                <br></br>
                <p>Si no es un obrero UAD solo escriba su nombre y luego click en Aceptar</p>
        </ReactTooltip>

        <ReactTooltip  id="tooltip_n_encargado" 
            type="info">
                <p>Escriba el nombre del encargado para seleccionarlo en la lista de obreros UAD</p>
                <br></br>
                <p>Si no es un obrero UAD solo escriba su nombre y luego click en Aceptar</p>
        </ReactTooltip>
        
        <ReactTooltip  id="tooltip_n_pastor_normal" type="info">
                    Normal
        </ReactTooltip>

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

function Spinner({item, todos}) {

    const maximo = todos.map(item=>item.diezmo).sort((a,b)=>b-a)[0]
    let nueva_altura = (Number(maximo)/100) + 20 // antes era 140

    if (nueva_altura > 150) {
        nueva_altura = 150
    }

    let alto = Number(item.diezmo) / 100

    if (alto==0){
        alto = 1
    }
    return (
        <div>
      <svg width="70" height={nueva_altura} font-family="sans-serif" font-size="10" textAnchor="end">
  
    <rect  x="0" y={nueva_altura-20-alto} fill={alto==1 ? "red" : "steelblue"} width="60" height={alto}></rect>
    <text fill="black" x="50" y={nueva_altura-10}>{item.diezmo.toFixed(2)}</text>

   </svg>
        </div>

    );
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

    console.log('hora desde: ' + hora_desde_nummerica)
    console.log('hora hasta: ' + hora_hasta_nummerica)

    if (hora_desde_nummerica >= hora_hasta_nummerica) {
        resultado = false;
        mensaje = 'La hora de inicio debe ser anterior a la hora de fín'
    }

    console.log('hora_hasta_nummerica',hora_hasta_nummerica)
    console.log('hora_desde_nummerica',hora_desde_nummerica)

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



function filtrarRangoPermitidoParaAlta(tiposIglesias,setTipoIglesia){
    const tiposPermitidos = tiposIglesias.filter(item=>item.nombre.includes('trámite regional'))
    setTipoIglesia(tiposPermitidos)

    if (tiposPermitidos.length>0){
        return tiposPermitidos[0].id_tipo_iglesia
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