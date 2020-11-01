import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link,useParams } from 'react-router-dom';
import Loading from '../componentes/Loading';
import {useAlumno} from '../Context/alumnoContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit,faIdCard, faCheckCircle,faTimesCircle, faCircle, faPlusSquare,faDotCircle,faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons';
import { faPlus,faMinus, faWindowClose,faAngleRight,faAngleLeft, faTrash, faSync,faEquals, faGreaterThanEqual,faEnvelopeSquare, faListOl, faMailBulk,faUserCheck,faEnvelope } from '@fortawesome/free-solid-svg-icons';
import AbmObrero from '../abms/Abm-obrero';
import AbmIglesia from '../abms/Abm-iglesia';
import FormularioMail from '../abms/FormularioMail';
import Swal from 'sweetalert2';
import {obtenerFechaDiamenosN} from '../Helpers/fechas';
import Prueba from '../abms/prueba';
import CredencialesModificacion from '../componentes/Credenciales-modificacion';
import {scrollTop, hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import { text } from '@fortawesome/fontawesome-svg-core';
import Estadisticas from '../componentes/Estadisticas'

const anchoPaginacion = 50;

export default function Cursos({match,history}){
    const [cursos,setCursos] = useState([])
    const [cursosAmostrar,setCursosAmostrar]=useState([])
    const {toggle, isShowing } = useModal();
    const [criterio, setCriterio ] = useState('original');
    const [buscandoIglesiasObrero,setBuscandoIglesiasObrero] = useState(false)
    const [estadoImpresion,setEstadoImpresion]=useState("1")
    const [persona,setPersona]=useState(-1);
    const [tipoPersonal,setTipoPersonal]=useState(-1);
    const [permiso,setPermiso]=useState(-1);
    const [cantidad,setCantidad]=useState(-1);

    const [ministerios,setMinisterios]=useState([])
    const [rangosAbreviados,setRangosAbreviados]=useState([])
    const [tipoIglesias,setTipoIglesias]=useState([])
    const [estadoCredenciales,setEstadoCredenciales]=useState([])
    const [rangoObreros,setRangoObreros]=useState([])
    const [motivoSolicitudes,setMotivoSolicitudes]=useState([])
    const [periodosFiscales,setPeriodosFiscales]=useState([])

    const [iglesiasObrero,setIglesiasObrero]=useState([])

    const [ministerioSeleccion,setMinisterioSeleccion]=useState(-1)
    const [tipoIglesiaSeleccion,setTipoIglesiaSeleccion]=useState(-1)
    const [estadoCredencialSeleccion,setEstadoCredencialSeleccion]=useState(-1)
    const [rangoObreroSeleccion,setRangoObreroSeleccion]=useState(-1)
    const [rangoObreroAbreviadoSeleccion,setRangoObreroAbreviadoSeleccion]=useState(-1)
    const [motivoSolicitudSeleccion,setMotivoSolicitudSeleccion]=useState(-1)
    const [estadoBalanceSeleccion,setEstadoBalanceSeleccion]=useState('-1')

    const [estadoBalances,setEstadosBalances] = useState(['Si','No'])
    const [obreroSeleccionado,setObreroSeleccionado] = useState(null);
    const [obreroSeleccionadoCredencial,setObreroSeleccionadoCredencial] = useState(null);
    
    const [iglesiaSeleccionada,setIglesiaSeleccionada] = useState(null);
    const [crearObrero,setCrearObrero] = useState(false);
    const [crearIglesia,setCrearIglesia] = useState(false);
    const [enviarCorreo,setEnviarCorreo] = useState(false);
    
    const [exactamenteIgual, setExactamenteIgual ] = useState(true);

    const [usuarioSeleccionado,setUsuarioSeleccionado]=useState(null)
    const [solicitudSeleccionada,setSolicitudSeleccionada]=useState(null)
    const [periodoSeleccionado,setPeriodoSeleccionado]=useState(0)

    const [tipoCurso,setTipoCurso]=useState(-1); // 0 Regular 1 Recuperatorio
    const [cursosRecuperatorios,setCursosRecuperatorios]= useState(-1);
    // para activar el modal llamar a la función toggle en con alguna condicion o un evento...
    const [cargandoCursos,setCargandoCursos] = useState(false);
    const {cuatrimestreActivo,desHabilitarBusquedaAlumnos, usuario} = useAlumno();
   // const {alumno, cambiarAlumno} = useAlumno();
    const [crearCurso,setCrearCurso]=useState(false);
    const [cursoAcopiar,setCursoAcopiar]=useState(null);
    const [copiarUnCurso, setCopiarUnCurso] = useState(false);
    const [contadorOperaciones, setContadorOperaciones]= useState(0);
    const [ultimosCursosCreados, setUltimosCursosCreados ]= useState([]);
    const [listaEmails, setListaEmails]=useState([])
    const [listaEmailsSeleccion, setListaEmailsSeleccion]=useState([])
    const [hayFiltrosActivos,setHayFiltrosActivos]=useState(false)
    const [iIni, setIini]=useState(0)
    const [iFin, setIfin]=useState(anchoPaginacion-1)
    const [textoNombre,setTextoNombre]=useState("");
    const [textoLocalidad,setTextoLocalidad]=useState("");
    const [textoProvincia,setTextoProvincia]=useState("");
    const [textoPastor,setTextoPastor]=useState("");
    const [textoEncargado,setTextoEncargado]=useState("");
    const [huboError,setHuboError]=useState(false)
    const [orden,setOrden]=useState(null)
    const [nuevoCampo,setNuevoCampo]=useState(true)
    const [contadorOrden,setContadorOrden]=useState(0)
    const etiqueta = useRef(null)

    const [verIglesias,setVerIglesias]=useState(false)
    const [meses,setMeses] =useState([])
    const [anios,setAnios] =useState([])
    const [dias,setDias] =useState([])

    const [ingresos,setIngresos] =useState([])
    const [seleccionIngresos,setSeleccionIngresos] =useState({dia_d:1,dia_h:1,mes_d:0,mes_h:0,anio_d:0,anio_h:0})

    const parametros = useParams();

    useEffect(()=>{
        completarAniosMeses(setDias,setMeses,setAnios,setSeleccionIngresos)
        buscarPeriodosFiscales()
        .then(data=>{
            const periodosOrdenados = data.sort((a,b)=>b.id_año_fiscal-a.id_año_fiscal)
            setPeriodoSeleccionado(periodosOrdenados[0].id_año_fiscal)
        })
    },[])

    useEffect(()=>{
    
    desHabilitarBusquedaAlumnos();   
    setCargandoCursos(true)
    setEstadoImpresion("1")

    const buscarCursos = async ()=>{

        let url = buscarApi(parametros.vista,usuario,estadoImpresion,periodoSeleccionado,seleccionIngresos);

        setCargandoCursos(true)
        try{          
//            const {data} = await Axios.get(`${url}/${usuario.id_region}`)
            const {data} = await Axios.get(`${url}`)
            const data_mas_selector = data.map((item)=>{return{...item,seleccion:false}})
            setCursos(data_mas_selector)
            setCargandoCursos(false)
        }catch(err){
            console.log(err)    
            setCargandoCursos(false)
        }
    }
        setTextoNombre("")
        setTextoLocalidad("")
        setTextoProvincia("")
        setTextoPastor("")
        setTextoEncargado("")
        setCursos([]) 
        setMinisterioSeleccion(-1)
        setTipoIglesiaSeleccion(-1)
        setEstadoCredencialSeleccion(-1)
        setRangoObreroSeleccion(-1)
        setMotivoSolicitudSeleccion(-1)
        setRangoObreroAbreviadoSeleccion(-1)
        setEstadoBalanceSeleccion(-1)

        buscarCursos() 
       
        
    },[parametros.vista,usuario,periodoSeleccionado,seleccionIngresos]) // agregué usuario porque necesito que se dispare el evento cuando no sea vacío usuario, al principio es vacío por unos milisegundos...

   useEffect(()=>{

        if (cursos.length==0){
            return
        }

        definirValoresPaginacion(cursosAmostrar,setIini,setIfin,anchoPaginacion)

        if (cursosAmostrar.length != cursos.length){
            setHayFiltrosActivos(true)
        }else{
            setHayFiltrosActivos(false)
        }

    },[cursosAmostrar])


    useEffect(()=>{
        if (obreroSeleccionadoCredencial){
            toggle()
            setVerIglesias(true)

            buscarIglesiasPorObrero().then(data=>{
                
            })
        }
    },[obreroSeleccionadoCredencial])    

    useEffect(()=>{
        
        switch(parametros.vista){
            case 'iglesias' :
                    const tipos = tiposDeIglesias()
                    setTipoIglesias(tipos)
                    break;
            case 'ministros' :
                    const ministerios = ministeriosDeLosObreros()
                    setMinisterios(ministerios)

                    const rangosab = rangosAbreviadosDeLosObreros()
                    setRangosAbreviados(rangosab)

                    break;
            case 'credenciales':
                const estados = estadosDeCredenciales()
                setEstadoCredenciales(estados)
                
                const rangos = rangosObreros()
                setRangoObreros(rangos)
                
                const motivos = motivosCredenciales()
                setMotivoSolicitudes(motivos)

                break
        }
        setCursosAmostrar(cursos)
    },[cursos])

  /*  return <>
        <Modal hide={toggle} isShowing={isShowing}>
            <h1>SOY UN MODAL</h1>
        </Modal>
    </>
*/

useEffect(()=>{
    
    if(parametros.vista=="credenciales"){

        setTextoNombre("");
        setMotivoSolicitudSeleccion(-1);
        setRangoObreroSeleccion(-1);
        
        buscarCursosSinRenderizar()
    }


},[estadoImpresion])

useEffect(()=>{
    if(cantidad==-1){
        setExactamenteIgual(true)
  
    }else{
        modificarListaPorCantidadCursos()
    }
},[cantidad,exactamenteIgual])

useEffect(()=>{
    resetLista()
},[contadorOrden])

useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        if (solicitudSeleccionada){
            setSolicitudSeleccionada(null)
        }
        if (obreroSeleccionado){
            setObreroSeleccionado(null)
        }
        if (iglesiaSeleccionada){
            setIglesiaSeleccionada(null)
        }        
        if (crearObrero){
            setCrearObrero(false)
        }   
        if (crearIglesia){
            setCrearIglesia(false)
        }  
        if (enviarCorreo){
            setEnviarCorreo(false)
        }  
        if (verIglesias){
            setVerIglesias(false)
        }  
        
    }
},[isShowing])

useEffect(()=>{
    resetLista()
},[textoEncargado,
   textoLocalidad,
   textoNombre,
   textoPastor,
   rangoObreroAbreviadoSeleccion,
   ministerioSeleccion,
   tipoIglesiaSeleccion,
   rangoObreroSeleccion,
   motivoSolicitudSeleccion,
   estadoCredencialSeleccion,
   estadoBalanceSeleccion])


const setUltimoPeriodo = ()=>{

    if (!periodosFiscales){
        return
    }

    const periodosOrdenados = periodosFiscales.sort((a,b)=>b.id_año_fiscal-a.id_año_fiscal)
    setPeriodoSeleccionado(periodosOrdenados[0].id_año_fiscal)
}

const marcarTodo =()=>{
    const aux = cursosAmostrar.map(item=>{return {...item,seleccion:true}})
    setCursosAmostrar(aux)
}

const desMarcarTodo =()=>{
    const aux = cursosAmostrar.map(item=>{return {...item,seleccion:false}})
    setCursosAmostrar(aux)
}


const cambiarCheck =(e)=>{

    const aux3 = cursosAmostrar.map(item=>{
        if (item.id_obrero!=e.target.value){
            return item
        }else{
            return {...item,seleccion:!item.seleccion}
        }
    })

    setCursosAmostrar(aux3)
}

const buscarPeriodosFiscales = async ()=>{

    const url = `/api/tablasgenerales/periodosfiscales`
    try{
        const { data } = await Axios.get(url)
        setPeriodosFiscales(data)
        return data
    }catch(err){
        console.log('Error al buscar los periodos fiscales')
        setHuboError(true)
        return null
    }


}

const buscarIglesiasPorObrero = async ()=>{

    setBuscandoIglesiasObrero(true)

    const url = `/api/tablasgenerales/iglesiasobrero/${obreroSeleccionadoCredencial.id_obrero}`
    try{
        const { data } = await Axios.get(url)
        setIglesiasObrero(data)
        setBuscandoIglesiasObrero(false)
        return data
    }catch(err){
        console.log('Error al buscar las iglesias de un ministro')
        setBuscandoIglesiasObrero(false)
        setHuboError(true)
        return null
    }


}
/*function finalizarAltaOcopia (confirmado){
    // puede finalizar porque confirmó y creó un curso nuevo o porque lo canceló

    setCopiarUnCurso(false);
    setCrearCurso(false);
    

    if(confirmado){ // si finalizar porque creó incrementamos contadorOperaciones para que se
                    // active el useEffect que trae los datos de los cursos otra vez
        setContadorOperaciones(contadorOperaciones+1);
    }

    scrollTop()
}*/

const refrescarLista = ()=>{
    setContadorOperaciones(contadorOperaciones+1)
}

const handleChangeInputNombre = (e)=> {
    
    /* if (e.target.value.trim() === "" ){
         return 
     }
 */

    let filtrarVectorCursosOriginal =[]

    setTextoNombre(e.target.value)
    /*setTextoLocalidad("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)*/
    
    switch(parametros.vista){
        case 'ministros' :
                /*filtrarVectorCursosOriginal = cursos.filter(item=>
                item.nombre_obrero.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)*/

                filtrarVectorCursosOriginal = cursos.filter(item=>
                    item.nombre_obrero.toUpperCase().includes(e.target.value.toUpperCase())
                    && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
                    && ((item.ministerio == ministerioSeleccion && ministerioSeleccion!='-1')||
                        ministerioSeleccion=='-1')
                    && ((item.rango == rangoObreroAbreviadoSeleccion && rangoObreroAbreviadoSeleccion != '-1') ||
                    rangoObreroAbreviadoSeleccion=='-1')) 
                setCursosAmostrar(filtrarVectorCursosOriginal)

                break;

        case 'iglesias' :
                filtrarVectorCursosOriginal = cursos.filter(item=>
                    item.nombre_igl.toUpperCase().includes(e.target.value.toUpperCase())
                    && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
                    && item.pastor.toUpperCase().includes(textoPastor.toUpperCase())
                    && item.encargado.toUpperCase().includes(textoEncargado.toUpperCase())
                    && ((item.tipo_iglesia == tipoIglesiaSeleccion && tipoIglesiaSeleccion!='-1')||
                        tipoIglesiaSeleccion=='-1')
                    && ((item.balance == estadoBalanceSeleccion && estadoBalanceSeleccion != '-1') ||
                        estadoBalanceSeleccion=='-1')) 
                setCursosAmostrar(filtrarVectorCursosOriginal)
                break;

        case 'credenciales':
                /*filtrarVectorCursosOriginal = cursos.filter(item=>
                item.nombre.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)*/

                filtrarVectorCursosOriginal = cursos.filter(item=>
                    item.nombre.toUpperCase().includes(e.target.value.toUpperCase())
                    && ((item.motivo == motivoSolicitudSeleccion && motivoSolicitudSeleccion!='-1')||
                    motivoSolicitudSeleccion=='-1')
                    && ((item.rango == rangoObreroSeleccion && rangoObreroSeleccion != '-1') ||
                    rangoObreroSeleccion=='-1')) 
                setCursosAmostrar(filtrarVectorCursosOriginal)

                break;

        case 'ingresos':
            filtrarVectorCursosOriginal = cursos.filter(item=>
            (item.contribuyente.toUpperCase().includes(e.target.value.toUpperCase())
            || item.titular.toUpperCase().includes(e.target.value.toUpperCase()))) 

            setCursosAmostrar(filtrarVectorCursosOriginal)

            break;                
    }
 }

 const pepe = (e)=> {
    setTextoNombre(e.target.value)
    console.log('pepe',e.target.value)
 }

 const handleChangeInputLocalidad = (e)=> {
    
    /* if (e.target.value.trim() === "" ){
         return 
     }
 */

    let filtrarVectorCursosOriginal =[]

    setTextoLocalidad(e.target.value)
    /*setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)*/

    switch(parametros.vista){
        case 'ministros' :
                /*filtrarVectorCursosOriginal = cursos.filter(item=>
                item.ubicacion.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)*/

                filtrarVectorCursosOriginal = cursos.filter(item=>
                    item.nombre_obrero.toUpperCase().includes(textoNombre.toUpperCase())
                    && item.ubicacion.toUpperCase().includes(e.target.value.toUpperCase())
                    && ((item.ministerio == ministerioSeleccion && ministerioSeleccion!='-1')||
                        ministerioSeleccion=='-1')
                    && ((item.rango == rangoObreroAbreviadoSeleccion && rangoObreroAbreviadoSeleccion != '-1') ||
                    rangoObreroAbreviadoSeleccion=='-1')) 
                setCursosAmostrar(filtrarVectorCursosOriginal)

                break;

        case 'iglesias' :
              
                filtrarVectorCursosOriginal = cursos.filter(item=>
                    item.nombre_igl.toUpperCase().includes(textoNombre.toUpperCase())
                    && item.ubicacion.toUpperCase().includes(e.target.value.toUpperCase())
                    && item.pastor.toUpperCase().includes(textoPastor.toUpperCase())
                    && item.encargado.toUpperCase().includes(textoEncargado.toUpperCase())
                    && ((item.tipo_iglesia == tipoIglesiaSeleccion && tipoIglesiaSeleccion!='-1')||
                        tipoIglesiaSeleccion=='-1')
                    && ((item.balance == estadoBalanceSeleccion && estadoBalanceSeleccion != '-1') ||
                        estadoBalanceSeleccion=='-1')) 
                setCursosAmostrar(filtrarVectorCursosOriginal)
                break;
    }
 }

 const handleChangeInputPastor = (e)=> {
    
    /* if (e.target.value.trim() === "" ){
         return 
     }
 */

    let filtrarVectorCursosOriginal =[]

    setTextoPastor(e.target.value)
/*    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)*/

    /*filtrarVectorCursosOriginal = cursos.filter(item=>
    item.pastor.toUpperCase().includes(e.target.value.toUpperCase())) */

    filtrarVectorCursosOriginal = cursos.filter(item=>
        item.nombre_igl.toUpperCase().includes(textoNombre.toUpperCase())
        && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
        && item.pastor.toUpperCase().includes(e.target.value.toUpperCase())
        && item.encargado.toUpperCase().includes(textoEncargado.toUpperCase())
        && ((item.tipo_iglesia == tipoIglesiaSeleccion && tipoIglesiaSeleccion!='-1')||
            tipoIglesiaSeleccion=='-1')
        && ((item.balance == e.target.value && estadoBalanceSeleccion != '-1') ||
            estadoBalanceSeleccion=='-1')) 

    setCursosAmostrar(filtrarVectorCursosOriginal)

 }

 const handleChangeSeleccionIngresos = (e)=>{

    setSeleccionIngresos({...seleccionIngresos,[e.target.name]:e.target.value})

 }

 const handleChangeInputEncargado = (e)=> {
    
    /* if (e.target.value.trim() === "" ){
         return 
     }
 */

    let filtrarVectorCursosOriginal =[]

    setTextoEncargado(e.target.value)

/*    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoPastor("")
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)*/

    /*filtrarVectorCursosOriginal = cursos.filter(item=>
    item.encargado.toUpperCase().includes(e.target.value.toUpperCase())) */

    filtrarVectorCursosOriginal = cursos.filter(item=>
        item.nombre_igl.toUpperCase().includes(textoNombre.toUpperCase())
        && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
        && item.pastor.toUpperCase().includes(textoPastor.toUpperCase())
        && item.encargado.toUpperCase().includes(e.target.value.toUpperCase())
        && ((item.tipo_iglesia == tipoIglesiaSeleccion && tipoIglesiaSeleccion!='-1')||
            tipoIglesiaSeleccion=='-1')
        && ((item.balance == e.target.value && estadoBalanceSeleccion != '-1') ||
            estadoBalanceSeleccion=='-1')) 

    setCursosAmostrar(filtrarVectorCursosOriginal)

 }
 
 const handleChangeInputProvincia = (e)=> {
    
    /* if (e.target.value.trim() === "" ){
         return 
     }
 */

    let filtrarVectorCursosOriginal =[]

    setTextoProvincia(e.target.value)
    setTextoNombre("")
    setTextoLocalidad("")
    setTextoEncargado("")
    setTextoPastor("")
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)

    switch(parametros.vista){
        case 'ministros' :
                filtrarVectorCursosOriginal = cursos.filter(item=>
                item.provincia.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)
                break;

        case 'iglesias' :
                filtrarVectorCursosOriginal = cursos.filter(item=>
                item.provincia.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)
                break;
    }
 }

const buscarCursosSinRenderizar = async ()=>{

    let url = buscarApi(parametros.vista,usuario,estadoImpresion,periodoSeleccionado,seleccionIngresos);
        
    try{          
        const {data} = await Axios.get(`${url}`)
        setCursos([])
        setCursos(data)
    }catch(err){
        console.log(err)
    }
}

function finalizarAltaOcopiaCredencial (){

    buscarCursosSinRenderizar() 
    toggle()
    limpiarFiltros()
    setSolicitudSeleccionada(null)

}

function finalizarAltaOcopiaObrero (alta,id){

    buscarCursosSinRenderizar() 
    //toggle()
    limpiarFiltros()
    //setSolicitudSeleccionada(null)
    //setObreroSeleccionado(null)
    //setIglesiaSeleccionada(null)
    if (alta){
        toggle()
        setCrearObrero(false)
    }

}

function finalizarAltaOcopiaIglesia (alta,id){

    buscarCursosSinRenderizar() 
    //toggle()
    limpiarFiltros()
    //setSolicitudSeleccionada(null)
    //setObreroSeleccionado(null)
    //setIglesiaSeleccionada(null)
    if (alta){
        toggle()
        setCrearIglesia(false)
    }

}

function finalizarEnvio (){
   toggle()
   setEnviarCorreo(false)

}

const iniciarEnviarCorreo = ()=>{
let mensaje_html = ''; 

    const seleccionados = cursosAmostrar
                .filter(item=>item.seleccion)
                .map(item=>item.email)

    if (seleccionados.length==0){
        mensaje_html ='</p>No hay ministros seleccionados para enviar un mail</p>';


        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })

        return
    }

    const con_mail = cursosAmostrar
    .filter(item=>item.seleccion && item.email.trim()!='')
    .map(item=>item.email)

    if (con_mail.length==0){
        mensaje_html ='</p>El o los ministros seleccionados no poseen e-mail</p>';


        Swal.fire({
        html:mensaje_html,
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        })

        return
    }
    
    setEnviarCorreo(true);
    
    toggle()

}

const personasDelPersonal = ()=>{

    return cursos.map(item=>item.descripcion).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const cantidadCursosDelPersonal = ()=>{

    return cursos.map(item=>item.cursos).sort((a,b)=>a-b).filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const tiposDeIglesias = ()=>{

    return cursos.map(item=>item.tipo_iglesia).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const estadosDeCredenciales = ()=>{

    return cursos.map(item=>item.estado).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const rangosObreros = ()=>{

    return cursos.map(item=>item.rango).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const rangosAbreviadosDeLosObreros = ()=>{

    return cursos.map(item=>item.rango).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const motivosCredenciales = ()=>{

    return cursos.map(item=>item.Motivo).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const ministeriosDeLosObreros = ()=>{
   
    /*const textTitle = "this is a test";
    const result = textTitle.replace(regEx , '%20');

    var str = "This is sample text for a sample replace";  
    str = str.replace(/sample/g, "lovely");  
    alert(str);  */

    //    la barra invertida se usa para escapara el corchete porque es un caracter especial 
    
    try{
        const ministerios = cursos.map(item=>item.ministerio.replace(/\[/g, " ").replace(/\]/g, " ")).sort().filter((item,index,vector)=>
        item != vector[index-1])

        const ministerios_filtrados = ministerios.toString().split(" ").sort().filter((item,index,vector)=>
        item != vector[index-1] && item!="" && item!=",").map(item=>`[${item}]`)

        return ministerios_filtrados
    }catch(err){
        console.log(err)
    }

}

const provinciasDeLosCursos = ()=>{

    return cursos.map(item=>item.provincia).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const limpiarNombre = ()=> {
    
    setTextoNombre("")
    //setCursosAmostrar(cursos)

}

const limpiarFiltros = ()=>{
    setTextoNombre("")
    setTextoLocalidad("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)
    setEstadoBalanceSeleccion(-1)
    setCursosAmostrar(cursos)
}

const limpiarPastor = ()=> {
    
    setTextoPastor("")
    //setCursosAmostrar(cursos)
    //resetLista()
}

const limpiarEncargado = ()=> {
    
    setTextoEncargado("")
    //setCursosAmostrar(cursos)
    //resetLista()
}

const limpiarLocalidad = ()=> {
    
    setTextoLocalidad("")
    //setCursosAmostrar(cursos)
    //resetLista()
}

const limpiarProvincia = ()=> {
    
    setTextoProvincia("")
    //setCursosAmostrar(cursos)
    resetLista()
}

const modificarListaPorCantidadCursos = ()=>{


    let filtrarVectorCursosOriginal=[];

    if(exactamenteIgual){
        filtrarVectorCursosOriginal = cursos.filter(item=>item.cursos == cantidad)
    }else{
        filtrarVectorCursosOriginal = cursos.filter(item=>item.cursos >= cantidad)
    }

    setCursosAmostrar(filtrarVectorCursosOriginal)
}

const handleChangeSelectTiposPersonal = (e)=> {
    
    if (e.target.value === "-1" ){
        return 
    }

    setTipoPersonal(e.target.value)
    setPersona(-1);
    setPermiso(-1);
    setCantidad(-1);
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.Tipo_usuario===e.target.value)
    setCursosAmostrar(filtrarVectorCursosOriginal)


}

const handleChangeSelectTipoIgl = (e)=> {
    
   /* if (e.target.value === "-1" ){
        return 
    }*/

    setTipoIglesiaSeleccion(e.target.value)
    /*setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")*/

    /*const filtrarVectorCursosOriginal = cursos.filter(item=>item.tipo_iglesia===e.target.value)
    setCursosAmostrar(filtrarVectorCursosOriginal)*/

    const filtrarVectorCursosOriginal = cursos.filter(item=>
        item.nombre_igl.toUpperCase().includes(textoNombre.toUpperCase())
        && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
        && item.pastor.toUpperCase().includes(textoPastor.toUpperCase())
        && item.encargado.toUpperCase().includes(textoEncargado.toUpperCase())
        && ((item.tipo_iglesia == e.target.value && e.target.value!='-1')||
        e.target.value=='-1')
        && ((item.balance == estadoBalanceSeleccion && estadoBalanceSeleccion != '-1') ||
        estadoBalanceSeleccion=='-1')) 

        setCursosAmostrar(filtrarVectorCursosOriginal)
}

const handleChangeSelectMinisterio = (e)=> {
    
    /*if (e.target.value === "-1" ){
        return 
    }

    setMinisterioSeleccion(e.target.value)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")
    setRangoObreroAbreviadoSeleccion(-1)

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.ministerio.includes(e.target.value))
    setCursosAmostrar(filtrarVectorCursosOriginal)*/

    setMinisterioSeleccion(e.target.value)
    
    const filtrarVectorCursosOriginal = cursos.filter(item=>
        item.nombre_obrero.toUpperCase().includes(textoNombre.toUpperCase())
        && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
        && ((item.ministerio == e.target.value && e.target.value!='-1')||
        e.target.value=='-1')
        && ((item.rango == rangoObreroAbreviadoSeleccion && rangoObreroAbreviadoSeleccion != '-1') ||
            rangoObreroAbreviadoSeleccion=='-1')) 

        setCursosAmostrar(filtrarVectorCursosOriginal)


}

const resetLista=()=>{

    let filtrarVectorCursosOriginal;

    if (parametros.vista=='iglesias'){
        filtrarVectorCursosOriginal = cursos.filter(item=>
            item.nombre_igl.toUpperCase().includes(textoNombre.toUpperCase())
            && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
            && item.pastor.toUpperCase().includes(textoPastor.toUpperCase())
            && item.encargado.toUpperCase().includes(textoEncargado.toUpperCase())
            && ((item.tipo_iglesia == tipoIglesiaSeleccion && tipoIglesiaSeleccion!='-1')||
                tipoIglesiaSeleccion=='-1')
            && ((item.balance == estadoBalanceSeleccion && estadoBalanceSeleccion != '-1') ||
            estadoBalanceSeleccion=='-1')) 
            .sort((a,b)=>{return comparacion(a,b)})
    }else if(parametros.vista=='ministros'){
        filtrarVectorCursosOriginal = cursos.filter(item=>
            item.nombre_obrero.toUpperCase().includes(textoNombre.toUpperCase())
            && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
            && ((item.ministerio == ministerioSeleccion && ministerioSeleccion!='-1')||
            ministerioSeleccion=='-1')
            && ((item.rango == rangoObreroAbreviadoSeleccion && rangoObreroAbreviadoSeleccion != '-1') ||
            rangoObreroAbreviadoSeleccion=='-1')) 
            .sort((a,b)=>{return comparacion(a,b)})
    }else if(parametros.vista=='credenciales'){
        filtrarVectorCursosOriginal = cursos.filter(item=>
            item.nombre.toUpperCase().includes(textoNombre.toUpperCase())
            && ((item.motivo == motivoSolicitudSeleccion && motivoSolicitudSeleccion!='-1')||
            motivoSolicitudSeleccion=='-1')
            && ((item.rango == rangoObreroSeleccion && rangoObreroSeleccion != '-1') ||
            rangoObreroSeleccion=='-1')) 
            .sort((a,b)=>{return comparacion(a,b)})
    }else if(parametros.vista=='ingresos'){
        filtrarVectorCursosOriginal = cursos.filter(item=>
            (item.contribuyente.toUpperCase().includes(textoNombre.toUpperCase()) ||
            item.titular.toUpperCase().includes(textoNombre.toUpperCase())))
 
    }


         setCursosAmostrar(filtrarVectorCursosOriginal)

}
const handleChangeSelectEstadoBalance = (e)=> {
    
    /*if (e.target.value === "Estado del balance" ){
        return 
    }*/

    setEstadoBalanceSeleccion(e.target.value)

/*    setMinisterioSeleccion(-1)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")
    setRangoObreroAbreviadoSeleccion(-1)*/

    /*const filtrarVectorCursosOriginal = cursos.filter(item=>item.balance.includes(e.target.value))
    setCursosAmostrar(filtrarVectorCursosOriginal)*/

    const filtrarVectorCursosOriginal = cursos.filter(item=>
        item.nombre_igl.toUpperCase().includes(textoNombre.toUpperCase())
        && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
        && item.pastor.toUpperCase().includes(textoPastor.toUpperCase())
        && item.encargado.toUpperCase().includes(textoEncargado.toUpperCase())
        && ((item.tipo_iglesia == tipoIglesiaSeleccion && tipoIglesiaSeleccion!='-1')||
            tipoIglesiaSeleccion=='-1')
        && ((item.balance == e.target.value && e.target.value != '-1') ||
            e.target.value=='-1')) 

        setCursosAmostrar(filtrarVectorCursosOriginal)


}

const handleChangeSelectRango = (e)=> {
    
   /* if (e.target.value === "-1" ){
        return 
    }*/

    setRangoObreroSeleccion(e.target.value)
   /* setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")*/

    /*const filtrarVectorCursosOriginal = cursos.filter(item=>item.rango===e.target.value)
    setCursosAmostrar(filtrarVectorCursosOriginal)*/

    /*const filtrarVectorCursosOriginal = cursos.filter(item=>
        item.nombre_obrero.toUpperCase().includes(textoNombre.toUpperCase())
        && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
        && ((item.ministerio == ministerioSeleccion && ministerioSeleccion!='-1')||
             ministerioSeleccion=='-1')
        && ((item.rango == e.target.value && e.target.value != '-1') ||
            e.target.value=='-1')) */

       const  filtrarVectorCursosOriginal = cursos.filter(item=>
                item.nombre.toUpperCase().includes(textoNombre.toUpperCase())
                && ((item.motivo == motivoSolicitudSeleccion && motivoSolicitudSeleccion!='-1')||
                motivoSolicitudSeleccion=='-1')
                && ((item.rango == e.target.value && e.target.value != '-1') ||
                e.target.value=='-1')) 


        setCursosAmostrar(filtrarVectorCursosOriginal)

}

const ordenUbicacion = ()=>{
    alert (1)
}

const comparacion = (a,b)=>{

switch (orden){
    case null : return 0 
    case 'edad':

    if(nuevoCampo==true){
            return a[orden]- b[orden]
        }else{
            if (contadorOrden%2==0){
                return b[orden] - a[orden]
            }else{
                return a[orden] - b[orden]
            }
        }
        case 'f_solicitud':

            const dia_a = Number(a[orden].substring(0,2));
            const mes_a  = Number(a[orden].substring(3,5));
            const anio_a = Number(a[orden].substring(6,10));

            const fa = new Date(anio_a,mes_a,dia_a);

            const dia_b = Number(b[orden].substring(0,2));
            const mes_b  = Number(b[orden].substring(3,5));
            const anio_b = Number(b[orden].substring(6,10));

            const fb = new Date(anio_b,mes_b,dia_b);

            if(nuevoCampo==true){
                return fa-fb
            }else{
                if (contadorOrden%2==0){
                    return fb-fa
                }else{
                    return fa-fb
                }
            }        
    default : 
        if(nuevoCampo==true){
            return a[orden].localeCompare(b[orden])
        }else{
            if (contadorOrden%2==0){
                return b[orden].localeCompare(a[orden])
            }else{
                return a[orden].localeCompare(b[orden])
            }
        }
}


}
/*switch (orden){

   // case 1 :return a.nombre_obrero.localeCompare(b.nombre_obrero)
   // case 2 :return b.nombre_obrero.localeCompare(a.nombre_obrero)
    case 1 :return a['nombre_obrero'].localeCompare(b['nombre_obrero'])
    case 2 :return b['nombre_obrero'].localeCompare(a['nombre_obrero'])
    }

}*/

const funcionOrden = (nombre_campo)=>{

    if (orden==nombre_campo){
        setNuevoCampo(false)
    }else{
        setNuevoCampo(true)
    }

    setOrden(nombre_campo)
    setContadorOrden(contadorOrden+1)

}

const handleChangeSelectMotivo = (e)=> {
    
    setMotivoSolicitudSeleccion(e.target.value)

    /*
    if (e.target.value === "-1" ){
        return 
    }

    setMotivoSolicitudSeleccion(e.target.value)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.Motivo===e.target.value)
    */
    const filtrarVectorCursosOriginal = cursos.filter(item=>
        item.nombre.toUpperCase().includes(textoNombre.toUpperCase())
        && ((item.motivo == e.target.value && e.target.value!='-1')||
        e.target.value=='-1')
        && ((item.rango == rangoObreroSeleccion && rangoObreroSeleccion != '-1') ||
        rangoObreroSeleccion=='-1')) 

    setCursosAmostrar(filtrarVectorCursosOriginal)




}

const handleChangeSelectEstado = (e)=> {
    
   /* if (e.target.value === "-1" ){
        return 
    }

    setEstadoCredencialSeleccion(e.target.value)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.estado===e.target.value)
    */

   setEstadoCredencialSeleccion(e.target.value)

   const filtrarVectorCursosOriginal = cursos.filter(item=>
    item.nombre.toUpperCase().includes(textoNombre.toUpperCase())
    && ((item.motivo == motivoSolicitudSeleccion && motivoSolicitudSeleccion!='-1')||
    motivoSolicitudSeleccion=='-1')
    && ((item.estado == e.target.value && e.target.value!='-1')||
    e.target.value=='-1')                    
    && ((item.rango == rangoObreroSeleccion && rangoObreroSeleccion != '-1') ||
    rangoObreroSeleccion=='-1')) 

    setCursosAmostrar(filtrarVectorCursosOriginal)

}

const handleChangeSelectRangoAbreviado = (e)=> {
    
   /* if (e.target.value === "-1" ){
        return 
    }

    setRangoObreroAbreviadoSeleccion(e.target.value)
    setMinisterioSeleccion(-1)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.rango===e.target.value)
    setCursosAmostrar(filtrarVectorCursosOriginal)*/
    setRangoObreroAbreviadoSeleccion(e.target.value)

    const filtrarVectorCursosOriginal = cursos.filter(item=>
        item.nombre_obrero.toUpperCase().includes(textoNombre.toUpperCase())
        && item.ubicacion.toUpperCase().includes(textoLocalidad.toUpperCase())
        && ((item.ministerio == ministerioSeleccion && ministerioSeleccion!='-1')||
             ministerioSeleccion=='-1')
        && ((item.rango == e.target.value && e.target.value != '-1') ||
            e.target.value=='-1')) 

        setCursosAmostrar(filtrarVectorCursosOriginal)
}

const handleChangeEstadoImpresion = (e)=>{
    setEstadoImpresion(e.target.value)

}

const crearListaEmails = ()=>{

    const cant_seleccionados_ok = cursosAmostrar
                .filter(item=>item.seleccion && item.email.trim()!='').length

    const sin_email = cursosAmostrar
                .filter(item=>item.seleccion && item.email.trim()=='')
                .map(item=>{return {nombre:item.nombre_obrero,telefono:item.telefono}})

    const aux = cursosAmostrar
                .filter(item=>item.seleccion && item.email.trim()!='')
                .map(item=>item.email)
                .toString()

    return {destinatarios:aux,seleccionados:cant_seleccionados_ok, sin_email:sin_email}
}

const copiarCurso = (id)=>{
    setCopiarUnCurso(true)
    setCrearCurso(false)
    setCursoAcopiar(id)
    setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);
}

const limpiarTipoIglesia=()=>{
    setTipoIglesiaSeleccion(-1)
}

const limpiarRangos=()=>{
    setRangoObreroAbreviadoSeleccion(-1)
}

const limpiarMinisterios=()=>{
    setMinisterioSeleccion(-1)
}

const limpiarMotivoSolicitud=()=>{
    setMotivoSolicitudSeleccion(-1)
}

const limpiarEstadoSolicitud=()=>{
    setEstadoCredencialSeleccion(-1)
}

const limpiarRangoObrero=()=>{
    setRangoObreroSeleccion(-1)
}

const limpiarEstadoBalance=()=>{
    setEstadoBalanceSeleccion(-1)
}

const cambiarTipoCurso = (e)=>{
    // viene Standard, Ensamble o Instrumental
    setTipoCurso(e.target.value)
}

const iniciarCrearUsuario = ()=>{
    setUsuarioSeleccionado(null);
    toggle();
}

const paginar = (ini,fin)=>{
    setIini(ini)
    setIfin(fin)
}



const cambiarCursosRecuperatorios = (e)=>{
    // viene 1 o 0 para indicar si es o no recuperatorio 
    setCursosRecuperatorios(e.target.value)
}

const iniciarNuevoCurso = ()=>{
    setCrearCurso(true);
    
    setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);
}


if (huboError){
    return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
}

if (cargandoCursos){
    return <Main center><Loading/><span className="cargando">Cargando registros...</span></Main>
  };

  //`/curso/${curso.nro_curso}`
return(
    <Main>

        { isShowing && enviarCorreo && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'transparent'}}>
            <FormularioMail seleccionados={crearListaEmails()} 
                       finalizarEnvio={finalizarEnvio}
                       usuario={usuario}
                       />    
        </Modal>}

        { isShowing && solicitudSeleccionada && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'transparent'}}>
            <CredencialesModificacion solicitud={solicitudSeleccionada ? solicitudSeleccionada : null} 
                       finalizarAltaOcopia={finalizarAltaOcopiaCredencial}
                       esModal={true}/>    
        </Modal>}
        { isShowing && obreroSeleccionado && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1250px'}} estiloWrapper={{background:'transparent'}}>
            <AbmObrero id_obrero={obreroSeleccionado ? obreroSeleccionado : null} 
                       finalizarAltaOcopia={finalizarAltaOcopiaObrero}
                       esModal={true} usuario={usuario}/>      
        </Modal>}
        { isShowing && crearObrero && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'transparent'}}>
            <AbmObrero id_obrero={null ? obreroSeleccionado : null} 
                       finalizarAltaOcopia={finalizarAltaOcopiaObrero}
                       esModal={true} usuario={usuario}/>      
        </Modal>}   
        { isShowing && crearIglesia && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'transparent'}}>
            <AbmIglesia id_iglesia={null ? iglesiaSeleccionada : null} 
                       finalizarAltaOcopia={finalizarAltaOcopiaIglesia}
                       esModal={true} usuario={usuario}/>      
        </Modal>}  
        { isShowing && iglesiaSeleccionada && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1250px'}} estiloWrapper={{background:'transparent'}}>
            <AbmIglesia id_iglesia={iglesiaSeleccionada ? iglesiaSeleccionada : null} 
                       finalizarAltaOcopia={finalizarAltaOcopiaIglesia}
                       esModal={true} usuario={usuario}/>      
        </Modal>}     
        
        { isShowing && verIglesias && <Modal hide={toggle} 
                                             isShowing={isShowing} 
                                             estilo={{width:'500px'}} 
                                             estiloWrapper={{background:'transparent'}}
                                             closeOnclickOutside={true}>
            <SolicitudImpresion obrero={obreroSeleccionadoCredencial}/>                                                 
            <IglesiasObrero iglesiasObrero={iglesiasObrero} 
                       buscandoIglesiasObrero={buscandoIglesiasObrero}
                       obrero={obreroSeleccionadoCredencial}
                       esModal={true}/>    
            <OtrasIglesiasObrero obrero={obreroSeleccionadoCredencial}/>             
        </Modal>} 

        <div className="bg-blue text-whitexxx p-4 rounded relative ml-auto mr-auto"> 
        {cuatrimestreActivo && <Cabecera cuatrimestreActivo={cuatrimestreActivo} 
                                         iniciarCrearUsuario={iniciarCrearUsuario}
                                         refrescarLista={refrescarLista}/>}

{     /*   <div className="flex f-row resultados absolute">*/}
        <div className="">

            { 
            parametros.vista=='credenciales' && <div className="flex f-row">


                <span className="cursor-pointer acciones-lista-cabecera botonNc w-100 inline-block-1 border-bottom-dotted-gray" >
                     Estado de la credencial
                </span>                
                <select title="Estado de la credencial" value={estadoImpresion}
                    onChange={(e)=>{handleChangeEstadoImpresion(e)}}
                    className="ml-4 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="">
                    <option value="1">Pendiente de revisión</option>
                    <option value="2">Pendiente de impresión</option>
                    <option value="3">Impreso</option>
                </select>
                </div>
            }

            {
                parametros.vista=='credenciales' && 
                <div className="flex f-col">
                    <div>

                        <div className="mt-6 flex f-row">
                           
                            <TextoInput nombre={'Nombre'} textoid={"texto-nombre"} texto={textoNombre} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/>

                            <div className="flex f-col">
                                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                            Rango
                                </span>
                                <div className="flex f-row">
                                    { rangoObreroSeleccion!="-1" && <button><FontAwesomeIcon 
                                                    className="ic-abm"
                                                    icon={faWindowClose} 
                                                    onClick={limpiarRangoObrero}/>
                                                </button>}
                                    <Seleccionador  nombre='Todos' valor={rangoObreroSeleccion} onchange={handleChangeSelectRango} vector = {rangoObreros}/>
                                </div>

                            </div>
                            <div className="flex f-col">
                                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                            Motivo
                                </span>
                                <div className="flex f-row">
                                <div className="flex f-row">
                                    { motivoSolicitudSeleccion!="-1" && <button><FontAwesomeIcon 
                                                    className="ic-abm"
                                                    icon={faWindowClose} 
                                                    onClick={limpiarMotivoSolicitud}/>
                                                </button>}
                                    <Seleccionador  nombre='Todos' valor={motivoSolicitudSeleccion} onchange={handleChangeSelectMotivo} vector = {motivoSolicitudes}/>
                                </div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            }            
            {
                parametros.vista=='obreros_old' && <div>
                    <span onClick={()=>{setCrearObrero(true);toggle()}} className="cursor-pointer botonNc ml-6" >
                        <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo ministro
                    </span>
                </div>
            }
            {
                parametros.vista=='ministros' && 
                <CabeceraMinistros 
                    rangoObreroAbreviadoSeleccion={rangoObreroAbreviadoSeleccion}
                    handleChangeSelectRangoAbreviado={handleChangeSelectRangoAbreviado}
                    rangosAbreviados={rangosAbreviados}
                    limpiarRangos={limpiarRangos}
                    ministerios={ministerios}
                    handleChangeSelectMinisterio={handleChangeSelectMinisterio}
                    ministerioSeleccion={ministerioSeleccion}
                    limpiarMinisterios={limpiarMinisterios}
                    limpiarLocalidad={limpiarLocalidad}
                    handleChangeInputLocalidad={handleChangeInputLocalidad}
                    textoLocalidad={textoLocalidad}
                    textoNombre={textoNombre}
                    handleChangeInputNombre={handleChangeInputNombre}
                    limpiarNombre={limpiarNombre}
                    iniciarEnviarCorreo={iniciarEnviarCorreo}
                    setEnviarCorreo={setEnviarCorreo}
                />
            }
            {
                parametros.vista=='ministros' && 
                <div className="flex f-col">
                    <div className="centro-w100pc">
                        <span onClick={()=>{setCrearObrero(true);toggle()}} className="cursor-pointer botonNc ml-6" >
                            <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo ministro
                        </span>
                        <span onClick={iniciarEnviarCorreo} className="cursor-pointer botonNc ml-6" >
                            <FontAwesomeIcon onClick={()=>{setEnviarCorreo(true);toggle()}} className="color-tomato" icon={faPlusSquare}/> Enviar un mail
                        </span>             
                    </div>
                    <div>

                        <div className="mt-6 flex f-row">
                           
                            <TextoInput nombre={'Nombre'} textoid={"texto-nombre"} texto={textoNombre} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/>
                            <TextoInput nombre={'Localidad'} textoid={"texto-localidad"} texto={textoLocalidad} onchange={handleChangeInputLocalidad} limpiarTexto={limpiarLocalidad}/>


                            <div className="flex f-col">
                                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                            Ministerio
                                </span>
                                <div className="flex f-row">
                                    { ministerioSeleccion!="-1" && <button><FontAwesomeIcon 
                                                    className="ic-abm"
                                                    icon={faWindowClose} 
                                                    onClick={limpiarMinisterios}/>
                                                </button>}
                                    <Seleccionador  nombre='Todos' valor={ministerioSeleccion} onchange={handleChangeSelectMinisterio} vector = {ministerios}/>
                                </div>

                            </div>
                            <div className="flex f-col">
                                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                            Rango
                                </span>
                                <div className="flex f-row">
                                <div className="flex f-row">
                                    { rangoObreroAbreviadoSeleccion!="-1" && <button><FontAwesomeIcon 
                                                    className="ic-abm"
                                                    icon={faWindowClose} 
                                                    onClick={limpiarRangos}/>
                                                </button>}
                                    <Seleccionador  nombre='Todos' valor={rangoObreroAbreviadoSeleccion} onchange={handleChangeSelectRangoAbreviado} vector = {rangosAbreviados}/>
                                </div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            }

            {
                parametros.vista=='ingresos' && 
                <div className="flex f-col">
                    <div>

                        <div className="mt-6 flex f-row">
                           
                              <div className="flex f-col">
                                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                            Desde:
                                </span>
                                <div className="flex f-row">
                                    <Seleccionador  nombre='Todos' valor={seleccionIngresos.dia_d} onchange={handleChangeSeleccionIngresos} vector = {dias} noDefault={true} name={'dia_d'}/>
                                    <SeleccionadorMes nombre='Todos' valor={seleccionIngresos.mes_d} onchange={handleChangeSeleccionIngresos} vector = {meses} noDefault={true} name={'mes_d'}/>
                                    <Seleccionador  nombre='Todos' valor={seleccionIngresos.anio_d} onchange={handleChangeSeleccionIngresos} vector = {anios} noDefault={true} name={'anio_d'}/>
                                </div>

                            </div>

                            <div className="flex f-col ml-4">
                                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                            Hasta:
                                </span>
                                <div className="flex f-row">
                                    <Seleccionador  nombre='Todos' valor={seleccionIngresos.dia_h} onchange={handleChangeSeleccionIngresos} vector = {dias} noDefault={true} name={'dia_h'}/>
                                    <SeleccionadorMes nombre='Todos' valor={seleccionIngresos.mes_h} onchange={handleChangeSeleccionIngresos} vector = {meses} noDefault={true} name={'mes_h'}/>
                                    <Seleccionador  nombre='Todos' valor={seleccionIngresos.anio_h} onchange={handleChangeSeleccionIngresos} vector = {anios} noDefault={true} name={'anio_h'}/>
                                </div>

                            </div>
                            <TextoInput nombre={'Nombre'} textoid={"texto-nombre"} texto={textoNombre} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/>
                        </div>

                     </div>
                </div>
            }
         
            {
                parametros.vista=='iglesias' && 
                <div className="flex f-col">
                    <div className="centro-w300">
                        <span onClick={()=>{setCrearIglesia(true);toggle()}} className="cursor-pointer botonNc ml-6" >
                            <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear una nueva iglesia
                        </span>
                    </div>
                    <div>
                        <span className="cursor-pointer acciones-lista-cabecera botonNc w-100 inline-block-1 border-bottom-dotted-gray" >
                            Año fiscal
                        </span>
                        <SelectPeriodosFicales periodosFiscales={periodosFiscales} periodoSeleccionado={periodoSeleccionado} setPeriodoSeleccionado={setPeriodoSeleccionado}/>

                        <div className="mt-6 flex f-row">
                            <TextoInput nombre={'Nombre Iglesia'} textoid={"texto-nombre"} texto={textoNombre} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/>
                            <TextoInput nombre={'Pastor'} textoid={"texto-pastor"} texto={textoPastor} onchange={handleChangeInputPastor} limpiarTexto={limpiarPastor}/>
                            <TextoInput nombre={'Encargado'} textoid={"texto-encargado"} texto={textoEncargado} onchange={handleChangeInputEncargado} limpiarTexto={limpiarEncargado}/>
                            <TextoInput nombre={'Ubicación'} textoid={"texto-localidad"} texto={textoLocalidad} onchange={handleChangeInputLocalidad} limpiarTexto={limpiarLocalidad}/>
                            
                            <div className="flex f-col">
                                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                            Tipo de iglesia
                                </span>
                                <div className="flex f-row">
                                    { tipoIglesiaSeleccion!="-1" && <button><FontAwesomeIcon 
                                                    className="ic-abm"
                                                    icon={faWindowClose} 
                                                    onClick={limpiarTipoIglesia}/>
                                                </button>}
                                    <Seleccionador  nombre='Todos' valor={tipoIglesiaSeleccion} onchange={handleChangeSelectTipoIgl} vector = {tipoIglesias}/>
                                </div>

                            </div>
                            <div className="flex f-col">
                                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                            Estado del balance
                                </span>
                                <div className="flex f-row">
                                     { estadoBalanceSeleccion!="-1" && <button><FontAwesomeIcon 
                                                className="ic-abm"
                                                icon={faWindowClose} 
                                                onClick={limpiarEstadoBalance}/>
                                            </button>}
                                    <SeleccionadorBalance  nombre='Todos' valor={estadoBalanceSeleccion} onchange={handleChangeSelectEstadoBalance} vector = {estadoBalances}/>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            }
            { hayFiltrosActivos && 
            <div className="centro-w300 text-center mt-2 mb-2">
                <a onClick={limpiarFiltros} 
                    title="Limpiar todos los filtros" 
                    className="tdec-none cursor-pointer ml-6 color-63 ">
                    <FontAwesomeIcon className="cursor-pointer color-tomato" icon={faTrash}/> Limpiar Filtros
                </a> 
            </div>
               
            }   
            {/* hayFiltrosActivos && 
            <div className="centro-w300 text-center">
                <a onClick={limpiarFiltros} 
                    title="Limpiar todos los filtros" 
                    className="tdec-none cursor-pointer ml-6 color-63 ">
                    <FontAwesomeIcon className="cursor-pointer color-tomato" icon={faTrash}/> Limpiar Filtros
                </a> 
            </div>
               
            */}

        {parametros.vista !="estadisticas" && <div className="flex f-col centro-w300 mt-4 res-lista">
                <div>
                    <span className="text-xl">{cursosAmostrar.length}</span><span className="text-large">{cursosAmostrar.length== 1 ? ` registro encontrado`:` registros encontrados`}</span> 
                </div>
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={cursosAmostrar.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>}
        </div>
        {/*cursosAmostrar.length >0 && parametros.vista == 'ingresos' && <div className="text-center text-smaller mt-2 fw-100"><span>{`${seleccionIngresos.dia_d}-${meses[seleccionIngresos.mes_d-1].nombre.substring(0,3)}-${seleccionIngresos.anio_d} al `}</span> <span>{`${seleccionIngresos.dia_h}-${meses[seleccionIngresos.mes_h-1].nombre.substring(0,3)}-${seleccionIngresos.anio_h}`}</span> <p className="mt-2">Total de ingresos : $ {cursosAmostrar[0].monto}</p></div>*/}
        {cursosAmostrar.length >0 && parametros.vista == 'ingresos' && 
                <TotalIngresos registros={cursosAmostrar} seleccion={seleccionIngresos} meses={meses}/>
        }
         <Tabla vista={parametros.vista} 
                cursosAmostrar ={cursosAmostrar} 
                iIni={iIni} 
                iFin={iFin} 
                toggle={toggle} 
                setUsuarioSeleccionado={setUsuarioSeleccionado} 
                handleChangeInputNombre={handleChangeInputNombre} 
                handleChangeInputLocalidad={handleChangeInputLocalidad} 
                handleChangeInputProvincia={handleChangeInputProvincia} 
                handleChangeInputPastor={handleChangeInputPastor} 
                handleChangeInputEncargado={handleChangeInputEncargado} 
                limpiarNombre={limpiarNombre} 
                limpiarLocalidad={limpiarLocalidad} 
                limpiarProvincia={limpiarProvincia} 
                limpiarPastor={limpiarPastor} 
                limpiarEncargado={limpiarEncargado} 
                textoLocalidad={textoLocalidad} 
                textoProvincia={textoProvincia} 
                textoPastor={textoPastor}
                textoEncargado={textoEncargado}
                ministerios={ministerios}
                tiposIgl={tipoIglesias} 
                estados={estadoCredenciales} 
                rangos={rangoObreros}
                rangosAbreviados={rangosAbreviados}                
                motivos={motivoSolicitudes}
                texto={textoNombre}
                handleChangeSelectMinisterio={handleChangeSelectMinisterio}
                rangoObreroAbreviadoSeleccion={rangoObreroAbreviadoSeleccion}
                ministerioSeleccion={ministerioSeleccion}
                ministerios={ministerios}
                tipoIglesiaSeleccion={tipoIglesiaSeleccion}
                handleChangeSelectTipoIgl={handleChangeSelectTipoIgl}
                rangoObreroSeleccion={rangoObreroSeleccion}
                motivoSolicitudSeleccion={motivoSolicitudSeleccion}
                estadoCredencialSeleccion={estadoCredencialSeleccion}
                handleChangeSelectRango={handleChangeSelectRango}
                handleChangeSelectRangoAbreviado={handleChangeSelectRangoAbreviado}
                handleChangeSelectMotivo={handleChangeSelectMotivo}
                handleChangeSelectEstado={handleChangeSelectEstado}
                rangosObreros={rangosObreros}
                motivoSolicitudes={motivoSolicitudes}
                estadoCredenciales={estadoCredenciales}
                tipoIglesias={tipoIglesias}
                setObreroSeleccionado={setObreroSeleccionado}
                setSolicitudSeleccionada={setSolicitudSeleccionada}
                setIglesiaSeleccionada={setIglesiaSeleccionada}
                periodosFiscales={periodosFiscales}
                setPeriodoSeleccionado={setPeriodoSeleccionado}
                handleChangeSelectEstadoBalance ={handleChangeSelectEstadoBalance}
                estadoBalances ={estadoBalances}
                estadoBalanceSeleccion = {estadoBalanceSeleccion}
                limpiarTipoIglesia={limpiarTipoIglesia}
                limpiarEstadoBalance={limpiarEstadoBalance}
                funcionOrden={funcionOrden}
                orden ={orden}
                cambiarCheck={cambiarCheck}
                marcarTodo={marcarTodo}
                desMarcarTodo={desMarcarTodo}
                usuario={usuario}
                obreroSeleccionadoCredencial={obreroSeleccionadoCredencial}
                setObreroSeleccionadoCredencial={setObreroSeleccionadoCredencial}
                iglesiasObrero={iglesiasObrero}
                buscandoIglesiasObrero={buscandoIglesiasObrero}
                />
      </div>
     </Main>
)
    }



function Seleccionador({vector,onchange,valor,nombre,noDefault,name}){

    return (            
        <div className="input-field col s12">
            <select value={valor}  name={name? name : ''} onChange = {onchange} className="block appearance-none w-full select-titulo rounded shadow leading-tight">
                { noDefault ? null : <option value="-1" key="-1">{nombre}</option>}
                {vector.map(item=><option value={item} key={item}>{item}</option> )}
            </select>
        </div>
        )
        
}    

function SeleccionadorMes({vector,onchange,valor,nombre,noDefault,name}){

    return (            
        <div className="input-field col s12">
            <select value={valor} name={name? name : ''} onChange = {onchange} className="block appearance-none w-full select-titulo rounded shadow leading-tight">
                { noDefault ? null : <option value="-1" key="-1">{nombre}</option>}
                {vector.map(item=><option value={item.id} key={item.id}>{item.nombre}</option> )}
            </select>
        </div>
        )
        
}    


function SeleccionadorBalance({onchange,valor}){

    return (            
        <div className="input-field col s12">
            <select value={valor} onChange = {onchange} className="block appearance-none w-full select-titulo rounded shadow leading-tight">
                <option value="-1" key="-1">Todos</option>
                <option value="Si" key="Si">Presentado</option>
                <option value="No" key="No">No presentado</option>
            </select>
        </div>
        )
        
}  

function Cabecera({cuatrimestreActivo,iniciarCrearUsuario,refrescarLista}){
    return <div className="absolute cableft">
        <span className="cabecera mr-4">{`Listado de profesores y administrativos`}</span> 
        <span title="Refrescar la lista" onClick={()=>refrescarLista()} 
                        className="cursor-pointer acciones-lista-cabecera mr-4" >
                            <FontAwesomeIcon className="color-tomato" icon={faSync}/> Refrescar
        </span>
        <span className="cursor-pointer ml-4 mr-4" onClick={iniciarCrearUsuario} >
                <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo usuario
        </span>
   </div>   
}



/*
function TipoCursos({cambiarTipoCurso}){

    return 
    (
        <div className="input-field col s12">
            <select onChange = {cambiarTipoCurso} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                <option value="-1" key="1">Regular</option>
                <option value="-1" key="21">Recuperatorio</option>
            </select>
        </div>
    )
    //<span className="absolute selecTipoCurso">Tipo de curso</span>

}*/

function listarUltimoCursosCreados(cursos,setUltimosCursosCreados){
    console.log(cursos)
    const cursos_filtrados = cursos.map(item=>{return {id:item.nro_curso,
                                                       materia:item.campo_auxiliar,
                                                       profesor:item.nombre,
                                                       fecha:item.columna}}).sort((a,b)=> b.id - a.id).slice(0,10)
    setUltimosCursosCreados(cursos_filtrados)
}

function ListaUltimosCursos({cursos}){
    
    return(<div className="contenedor-uc"> Ultimos cursos creados
        {
            cursos.map(item=>{
                return (
                <Link  key={`ult-cur${item.id}`} className="text-whitexxx" 
                                to={{
                                    pathname: `/curso/${item.id}`,
                                    state: {nro_curso:item.id}
                                }}> 
                <span className="ultimos-cursos" title={`${item.materia}\n${item.profesor}\nCreado el ${item.fecha}`}>{item.id}</span>
                            </Link> 
            )
                })
        }
    </div>

    )
}

function crearMailToIndividual(email){
    return email!=null && email!='' ? `mailto: ${email}` : ``
}

function armarListaEmails(usuarios,setListaEmails){

    //const emails = usuarios.filter(item=>item.email.trim()!='').map(item=>item.email)
    const emails = ['uno','dos']
    setListaEmails(emails)
}

function crearMailToListaEmails(listaEmails){
    return listaEmails.length>0 ? `mailto: ${listaEmails}` : ``
}

function definirValoresPaginacion(vector,setinicial,setfinal,anchoPaginacion){

    const longitud = vector.length;

    if (longitud>anchoPaginacion){
        setinicial(0);
        setfinal(anchoPaginacion-1)
    }else{
        setinicial(0);
        setfinal(longitud-1)
    }

}

function Paginacion({longitud,iIni,iFin,paginar,anchoPaginacion}){

    let imas, fmas,imenos, fmenos;

    let mostrar=true;
    let mostrarMenos = true;
    let mostrarMas = true;

    const hayMasParaMostrar = (longitud - 1) - iFin;
    const hayMenosParaMostrar = iIni;

    if (longitud<anchoPaginacion){
        mostrar=false
    }{
       if (hayMasParaMostrar==0){
            mostrarMas=false
       } 
       else if (hayMasParaMostrar<=anchoPaginacion){
            fmas = iFin + hayMasParaMostrar;
            imas = iFin + 1;
       }else if (hayMasParaMostrar>anchoPaginacion){
            fmas = iFin + anchoPaginacion;
            imas = iFin + 1;
       }

        if (hayMenosParaMostrar==0){
                mostrarMenos=false
        } 
        else if (hayMenosParaMostrar<=anchoPaginacion){
                fmenos = iIni - 1;
                imenos = 0;
        }else if (hayMenosParaMostrar>anchoPaginacion){
                fmenos = iIni - 1;
                imenos = iIni - anchoPaginacion;
        }
    }

    return <div>
        {mostrar && mostrarMenos && 
            <span   title={`${imenos+1}-${fmenos+1}`} 
                    className="cursor-pointer ml-2 mr-2" 
                    onClick={()=>paginar(imenos,fmenos)}>
                        <FontAwesomeIcon icon={faAngleLeft}/>
            </span>}
        <span>{iIni+1} - {iFin+1}</span>
        {mostrar && mostrarMas && 
            <span title={`${imas+1}-${fmas+1}`} 
                    className="cursor-pointer ml-2" 
                    onClick={()=>paginar(imas,fmas)}>
                           <FontAwesomeIcon icon={faAngleRight}/>
            </span>}
</div>
}


function Tabla({vista,
                cursosAmostrar,
                iIni,
                iFin,
                toggle, 
                setUsuarioSeleccionado,
                setSolicitudSeleccionada,
                texto,
                textoLocalidad,
                textoProvincia,
                textoEncargado,
                textoPastor,
                handleChangeInputEncargado,
                handleChangeInputPastor,
                limpiarPastor,
                limpiarEncargado,
                handleChangeInputNombre,
                handleChangeInputLocalidad,
                handleChangeInputProvincia,
                limpiarNombre, limpiarLocalidad,limpiarProvincia,
                handleChangeSelectMinisterio,
                ministerioSeleccion,
                ministerios,
                tipoIglesiaSeleccion,
                handleChangeSelectTipoIgl,
                rangoObreroSeleccion,
                motivoSolicitudSeleccion,
                estadoCredencialSeleccion,
                handleChangeSelectRango,
                handleChangeSelectMotivo,
                handleChangeSelectEstado,
                rangos,
                motivos,
                estados,
                tiposIgl,
                handleChangeSelectRangoAbreviado,
                rangosAbreviados,
                rangoObreroAbreviadoSeleccion,
                setObreroSeleccionado,
                setIglesiaSeleccionada,
                handleChangeSelectEstadoBalance,
                estadoBalances,
                estadoBalanceSeleccion,
                limpiarEstadoBalance,
                limpiarTipoIglesia,
                funcionOrden,
                orden,
                cambiarCheck,
                marcarTodo,
                desMarcarTodo,
                usuario,
                obreroSeleccionadoCredencial,
                setObreroSeleccionadoCredencial,
                iglesiasObrero,
                buscandoIglesiasObrero
                }){

const gestionarChecks = (marcarTodos)=>{

    if (marcarTodos){
        marcarTodo();
    }else{
        desMarcarTodo();
    }
}   

    switch (vista){
        case 'estadisticas':
            return <div className="cont-grp-dm">
            <Estadisticas usuario={usuario}/>
        </div>


case 'ministros':
    return <>
    <table className="table mt-8 table-cent">
        <thead className="text-white">
            <tr>
                    <td>
                        <a onClick={()=>gestionarChecks(true)} 
                            title="Marcar todos para recibir un mail" 
                            className="tdec-none cursor-pointer ml-2 color-63 ">
                            <FontAwesomeIcon className="cursor-pointer color-tomato" icon={faCheckCircle}/> 
                        </a> 

                        <a onClick={()=>gestionarChecks(false)} 
                            title="Desmarcar todos para recibir un mail" 
                            className="tdec-none cursor-pointer ml-2 mr-2 color-63 ">
                            <FontAwesomeIcon className="cursor-pointer color-tomato" icon={faCircle}/> 
                        </a> 
                    </td>
                    <td className="color-63 fw-x text-large">
                        <span className={ orden == 'nombre_obrero' ? "filas-lista-nwx p-2 cursor-pointer ti-nombre orden-activo" : "filas-lista-nwx p-2 cursor-pointer ti-nombre"}
                        onClick={()=>funcionOrden('nombre_obrero')}>
                                Nombre
                        </span>                        
                        <span className={ orden == 'edad' ? "filas-lista-nwx p-2 ti-edad cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-edad cursor-pointer"} onClick={()=>funcionOrden('edad')}>Edad</span>
                        <span className={ orden == 'direccion' ? "filas-lista-nwx p-2 ti-domicilio cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-domicilio cursor-pointer"} onClick={()=>funcionOrden('direccion')}>Dirección</span>
                        <span className={ orden == 'ubicacion' ? "filas-lista-nwx p-2 ti-ubicacion cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-ubicacion cursor-pointer"}
                        onClick={()=>funcionOrden('ubicacion')}>Localidad</span>
                        <span className={ orden == 'email' ? "filas-lista-nwx p-2 ti-email cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-email cursor-pointer"} onClick={()=>funcionOrden('email')}>Email</span>
                        <span className={ orden == 'telefono' ? "filas-lista-nwx p-2 ti-telefono cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-telefono cursor-pointer"} onClick={()=>funcionOrden('telefono')}>Teléfono</span>
                        <span className={ orden == 'ministerio' ? "filas-lista-nwx ti-tipo cursor-pointer orden-activo" : "filas-lista-nwx ti-tipo cursor-pointer"} onClick={()=>funcionOrden('ministerio')}>Ministerio</span>
                        <span className={ orden == 'rango' ? "filas-lista-nwx cursor-pointer orden-activo" : "filas-lista-nwx ti-balance cursor-pointer"} onClick={()=>funcionOrden('rango')}>Rango</span>
                        <span className= "filas-lista-nwx ti-credencial cursor-pointer">Credencial</span>
                    </td>
                    <td>

                    </td>
                </tr>
        </thead>
        {
            cursosAmostrar
            .map((item,index)=>{return {...item,indice:index+1}})
            .filter((item,index)=>{
                return index>= iIni && index<=iFin
            })
            .map(curso => {
            return (
                <tbody key={curso.id_obrero}>
                   <tr  className="border-bottom-solid cursor-pointer">
                    <td className="text-center"><input value={curso.id_obrero} 
                        checked={curso.seleccion} 
                        onChange={(e)=>cambiarCheck(e)} type="checkbox" 
                        title="Marque o desmarque para que ésta persona reciba un mail"/></td>

                    <td onClick={()=>{setObreroSeleccionado(curso.id_obrero);
                    toggle()}}>
                        
                        <span className="filas-lista-nw ti-nombre" >
                                {curso.nombre_obrero}
                        </span>         
          
                        <span className="filas-lista-nw ti-edad">{curso.edad}</span>
                        <span className="filas-lista-nw ti-domicilio">{curso.direccion}</span>
                        <span className="filas-lista-nw ti-ubicacion">{curso.ubicacion}</span>
                        <span className="filas-lista-nw ti-email">{curso.email}</span>
                        <span className="filas-lista-nw ti-telefono">{curso.telefono}</span>
                        <span className="filas-lista-nw ti-tipo">{curso.ministerio}</span>
                        <span className="filas-lista-nw ti-balance">{curso.rango}</span>
                        <span className="filas-lista-nw ti-credencial">{curso.credencial}</span>
                    </td>
                    <td>
                        <a onClick={()=>setObreroSeleccionadoCredencial(curso)} 
                            title="Verificar condición para solicitar la credencial" 
                            className="tdec-none cursor-pointer ml-2 mr-2 color-63 text-large">
                            <FontAwesomeIcon className="cursor-pointer color-tomato" icon={faIdCard}/> 
                        </a> 
                    </td>
                </tr>
                {curso.id_obrero==obreroSeleccionadoCredencial && 
                    <tr>
                        <td></td>
                        <td>
                            <IglesiasObrero iglesiasObrero={iglesiasObrero} 
                                            buscandoIglesiasObrero={buscandoIglesiasObrero}
                                            obrero={curso}/>
                        </td>
                    </tr>
                }
                </tbody>
                
            )
            })
        }
    </table>
    </>        
      case 'iglesias':
        return <>
            {/*<div className="mt-6 flex f-row">
               <TextoInput nombre={'Nombre_Igl'} textoid={"texto-nombre"} texto={texto} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/>
               <TextoInput nombre={'Pastor'} textoid={"texto-pastor"} texto={textoPastor} onchange={handleChangeInputPastor} limpiarTexto={limpiarPastor}/>
               <TextoInput nombre={'Encargado'} textoid={"texto-encargado"} texto={textoEncargado} onchange={handleChangeInputEncargado} limpiarTexto={limpiarEncargado}/>
               <TextoInput nombre={'Ubicación'} textoid={"texto-localidad"} texto={textoLocalidad} onchange={handleChangeInputLocalidad} limpiarTexto={limpiarLocalidad}/>
            </div>
            <div className="mt-6 flex f-row">
            <div className="flex f-row">
                    { tipoIglesiaSeleccion!="-1" && <button><FontAwesomeIcon 
                                className="ic-abm"
                                icon={faWindowClose} 
                                onClick={limpiarTipoIglesia}/>
                            </button>}
                    <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                Tipo de iglesia
                    </span>
                    <Seleccionador  nombre='Todos' valor={tipoIglesiaSeleccion} onchange={handleChangeSelectTipoIgl} vector = {tiposIgl}/>
               </div>
            <div className="flex f-row">
                { estadoBalanceSeleccion!="-1" && <button><FontAwesomeIcon 
                                className="ic-abm"
                                icon={faWindowClose} 
                                onClick={limpiarEstadoBalance}/>
                            </button>}
                    <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                Estado del balance
                    </span>
                    <SeleccionadorBalance  nombre='Todos' valor={estadoBalanceSeleccion} onchange={handleChangeSelectEstadoBalance} vector = {estadoBalances}/>
               </div>
               </div>*/}
        <table className="table mt-8 table-cent">
            <thead className="text-white ">
                <tr>
                        <div className="border-bottom-dotted-gray color-63 fw-x text-large">
                            <span className={ orden == 'nombre_igl' ? "filas-lista-nwx cursor-pointer ti-nombre orden-activo" : "filas-lista-nwx cursor-pointer ti-nombre" } onClick={()=>funcionOrden('nombre_igl')} >
                                    Nombre
                            </span>                        
                            <span className={ orden == 'pastor' ? "filas-lista-nwx p-2 ti-pastor cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-pastor cursor-pointer" } onClick={()=>funcionOrden('pastor')}>Pastor</span>
                            <span className={ orden == 'encargado' ? "filas-lista-nwx p-2 ti-encargado cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-encargado cursor-pointer"  } onClick={()=>funcionOrden('encargado')}>Encargado</span>
                            <span className={ orden == 'domicilio' ? "filas-lista-nwx p-2 ti-domicilio cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-domicilio cursor-pointer"  } onClick={()=>funcionOrden('domicilio')}>Domicilio</span>
                            <span className={ orden == 'ubicacion' ? "filas-lista-nwx p-2 ti-ubicacion cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-ubicacion cursor-pointer" } onClick={()=>funcionOrden('ubicacion')}>Ubicación</span>
                            <span className={ orden == 'telefono' ? "filas-lista-nwx p-2 ti-telefono cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-telefono cursor-pointer" } onClick={()=>funcionOrden('telefono')}>Teléfono</span>
                            <span className={ orden == 'tipo_iglesia' ? "filas-lista-nwx p-2 ti-tipo cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-tipo cursor-pointer" } onClick={()=>funcionOrden('tipo_iglesia')}>Tipo</span>
                            <span className={ orden == 'balance' ? "filas-lista-nwx p-2 cursor-pointer orden-activo" : "filas-lista-nwx p-2 ti-balance cursor-pointer"  } onClick={()=>funcionOrden('balance')}>Balance</span>
                            <span className="filas-lista-nwx p-2 cursor-copy p-iconos-listas ti-acciones" >
                                        Acciones
                            </span>
                        </div>
                    </tr>
            </thead>
            <tbody>
            {
                cursosAmostrar
                .map((item,index)=>{return {...item,indice:index+1}})
                .filter((item,index)=>{
                    return index>= iIni && index<=iFin
                })
                .map(curso => {
                return (
                    <tr onClick={()=>{setIglesiaSeleccionada(curso.id_iglesia);
                        toggle()}} key={curso.id_iglesia} className="border-bottom-solid cursor-pointer">
                        <div className="border-bottom-dotted-gray">
                            
                            <span className="filas-lista-nw ti-nombre" >
                                    {curso.nombre_igl}
                            </span>         
              
                            <span className="filas-lista-nw ti-pastor">{curso.pastor}</span>
                            <span className="filas-lista-nw ti-encargado">{curso.encargado}</span>
                            <span className="filas-lista-nw ti-domicilio">{curso.domicilio}</span>
                            <span className="filas-lista-nw ti-ubicacion">{curso.ubicacion}</span>
                            <span className="filas-lista-nw ti-telefono">{curso.telefono}</span>
                            <span className="filas-lista-nw ti-tipo">{curso.tipo_iglesia}</span>
                            <span className="filas-lista-nw ti-balance">{curso.balance}</span>
                            <span onClick={()=>{setIglesiaSeleccionada(curso.id_iglesia);
                                            toggle()}} title={`Abrir la ficha de la iglesia ${curso.nombre_igl}`} className="filas-lista-nw cursor-copy p-iconos-listas ti-acciones" >
                                        <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                            </span>
                        </div>
                    </tr>
                )
                })
            }
            </tbody>
        </table>
        </>
   case 'iglesias_old':
    return <table className="table mt-6">
    <thead className="bg-blue-500 text-white ">
       <tr className="titulo-lista">
            <th scope="col"><TextoInput nombre={'Nombre_Igl'} textoid={"texto-nombre"} texto={texto} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/></th>
            <th scope="col"><TextoInput nombre={'Pastor'} textoid={"texto-nombre"} texto={textoPastor} onchange={handleChangeInputPastor} limpiarTexto={limpiarProvincia}/></th>
            <th scope="col"><TextoInput nombre={'Encargado'} textoid={"texto-nombre"} texto={textoEncargado} onchange={handleChangeInputEncargado} limpiarTexto={limpiarEncargado}/></th>
            <th scope="col">Domicilio </th>
            <th scope="col"><TextoInput nombre={'Ubicación'} textoid={"texto-localidad"} texto={textoLocalidad} onchange={handleChangeInputLocalidad} limpiarTexto={limpiarLocalidad}/></th>
            <th scope="col">Teléfono</th>
            <th scope="col"><Seleccionador  nombre='Tipo' valor={tipoIglesiaSeleccion} onchange={handleChangeSelectTipoIgl} vector = {tiposIgl}/></th>
            <th colspan="2" className="pad-list1" scope="col"><span>Acciones</span></th>
        </tr>
    </thead>
    <tbody>
    {
        cursosAmostrar
        .map((item,index)=>{return {...item,indice:index+1}})
        .filter((item,index)=>{
            return index>= iIni && index<=iFin
        })
        .map(curso => {
        return (
            <tr key={curso.id_iglesia} className="bg-blueTabla border-bottom-solid">
                <td onClick={()=>{setIglesiaSeleccionada(curso.id_iglesia);
                                 toggle()}} className="filas-lista cursor-pointer" >
                        {curso.nombre_igl}
                </td>                        
                <td className="filas-lista">{curso.pastor}</td>
                <td className="filas-lista">{curso.encargado}</td>
                <td className="filas-lista">{curso.domicilio}</td>
                <td className="filas-lista">{curso.ubicacion}</td>
                <td className="filas-lista">{curso.telefono}</td>
                <td className="filas-lista">{curso.tipo_iglesia}</td>
                <td onClick={()=>{setIglesiaSeleccionada(curso.id_iglesia);
                                 toggle()}} title={`Abrir la ficha de la iglesia ${curso.nombre_igl}`} className="filas-lista cursor-copy p-iconos-listas width-35" >
                            <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                </td>
             </tr>
           )
        })
    }
    </tbody>
</table>

    case 'diezmos' : 
        return <table className="table mt-12">
        <thead className="bg-blue-500 text-white ">
           <tr className="titulo-lista">
                <th scope="col">Diezmo</th>
                <th scope="col">Edad</th>
                <th scope="col">Localidad</th>
                <th scope="col">Provincia </th>
                <th scope="col">Ministerio</th>
                <th scope="col">Cumpleaños</th>
                <th colspan="2" className="pad-list1" scope="col"><span>Acciones</span></th>
            </tr>
        </thead>
        <tbody>
        {
            cursosAmostrar
            .map((item,index)=>{return {...item,indice:index+1}})
            .filter((item,index)=>{
                return index>= iIni && index<=iFin
            })
            .map(curso => {
            return (
                <tr key={curso.id_obrero} className="bg-blueTabla border-bottom-solid">
                    <td title={`Modificar el estado de la solicitud de ${curso.nombre_obrero}`} onClick={()=>{setUsuarioSeleccionado(curso);
                                 toggle()}} title={curso.descripcion} className="filas-lista-principal cursor-pointer" >
                            {curso.nombre_obrero}
                    </td>                        
                    <td className="filas-lista">{curso.edad}</td>
                    <td className="filas-lista">{curso.localidad}</td>
                    <td className="filas-lista">{curso.provincia}</td>
                    <td className="filas-lista">{curso.ministerio}</td>
                    <td className="filas-lista">{curso.cumpleaños}</td>
                    <td onClick={()=>{setUsuarioSeleccionado(curso);
                                 toggle()}} title={`Modificar el estado de la solicitud de ${curso.nombre_obrero}`} className="filas-lista cursor-copy p-iconos-listas width-35" >
                            <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                    </td>   
                 </tr>
               )
            })
        }
        </tbody>
    </table>

case 'credenciales':
    return <>
    <table className="table mt-8 table-cent">
        <thead className="text-white ">
            <tr>
                    <div className="border-bottom-dotted-gray color-63 fw-x text-large">
                        <span className={ orden == 'nombre' ? "filas-lista-nwx cursor-pointer ticr-nombre orden-activo" : "filas-lista-nwx cursor-pointer ticr-nombre"} onClick={()=>funcionOrden('nombre')} >
                                Nombre
                        </span>               
                        <span className={ orden == 'rango' ? "filas-lista-nwx p-2 ticr-rango cursor-pointer orden-activo" : "filas-lista-nwx p-2 ticr-rango cursor-pointer"} onClick={()=>funcionOrden('rango')}>Rango</span>
                        <span className={ orden == 'region' ? "filas-lista-nwx p-2 ticr-region cursor-pointer orden-activo" : "filas-lista-nwx p-2 ticr-region cursor-pointer" } onClick={()=>funcionOrden('region')}>Region</span>
                        <span className={ orden == 'Motivo' ? "filas-lista-nwx p-2 ticr-motivo cursor-pointer orden-activo" : "filas-lista-nwx p-2 ticr-motivo cursor-pointer"} onClick={()=>funcionOrden('Motivo')}>Motivo</span>
                        <span className={ orden == 'f_solicitud' ? "filas-lista-nwx p-2 ticr-fecha cursor-pointer orden-activo" : "filas-lista-nwx p-2 ticr-fecha cursor-pointer" } onClick={()=>funcionOrden('f_solicitud')}>Fecha</span>
                        <span className={ orden == 'estado' ? "filas-lista-nwx p-2 cursor-pointer orden-activo" : "filas-lista-nwx p-2 ticr-estado cursor-pointer"} onClick={()=>funcionOrden('estado')}>Estado</span>

                    </div>
                </tr>
        </thead>
        <tbody>
        {
            cursosAmostrar
            .map((item,index)=>{return {...item,indice:index+1}})
            .filter((item,index)=>{
                return index>= iIni && index<=iFin
            })
            .map(curso => {
            return (
                <tr onClick={()=>{
                    if (!curso.estado.includes('Revisi')){
                        return
                    }
                    setSolicitudSeleccionada(curso);
                    toggle()}} key={curso.id_solicitud} className="border-bottom-solid cursor-pointer">
                    <div className="border-bottom-dotted-gray">
                        
                        <span className="filas-lista-nw ticr-nombre" >
                                {curso.nombre}
                        </span>         
          
                        <span className="filas-lista-nw ticr-rango">{curso.rango}</span>
                        <span className="filas-lista-nw ticr-region">{curso.region}</span>
                        <span className="filas-lista-nw ticr-motivo">{curso.Motivo}</span>
                        <span className="filas-lista-nw ticr-fecha">{curso.f_solicitud}</span>
                        <span className="filas-lista-nw ticr-estado">{curso.estado}</span>
                    </div>
                </tr>
            )
            })
        }
        </tbody>
    </table>
    </>        
    case 'credenciales_old' :
        return <table className="table mt-6">
        <thead className="bg-blue-500 text-white ">
           <tr className="titulo-lista">
                <th scope="col"><TextoInput nombre={'Nombre'} texto={texto} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/></th>
                <th scope="col"><Seleccionador  nombre='Rango' valor={rangoObreroSeleccion} onchange={handleChangeSelectRango} vector = {rangos}/></th>
                <th scope="col">Región</th>
                <th scope="col"><Seleccionador  nombre='Motivo' valor={motivoSolicitudSeleccion} onchange={handleChangeSelectMotivo} vector = {motivos}/></th>
                <th scope="col">F_solicitud</th>
                <th scope="col"><Seleccionador  nombre='Estado' valor={estadoCredencialSeleccion} onchange={handleChangeSelectEstado} vector = {estados}/></th>
                <th colspan="2" className="pad-list1" scope="col"><span>Acciones</span></th>
            </tr>
        </thead>
        <tbody>
        {
            cursosAmostrar
            .map((item,index)=>{return {...item,indice:index+1}})
            .filter((item,index)=>{
                return index>= iIni && index<=iFin
            })
            .map(curso => {
            return (
                <tr key={curso.id_solicitud} className="bg-blueTabla border-bottom-solid">
                    {curso.estado && <td title={`Autorizar impresion para ${curso.nombre}`} 
                        onClick={()=>{
                            if (!curso.estado.includes('Revisi')){
                                return
                            }
                            setSolicitudSeleccionada(curso);
                            toggle()}}

                            className="filas-lista-principal cursor-pointer" >
                            {curso.nombre}
                        </td> }                       
                    <td className="filas-lista">{curso.rango}</td>
                    <td className="filas-lista">{curso.region}</td>
                    <td className="filas-lista">{curso.Motivo}</td>
                    <td className="filas-lista">{curso.f_solicitud}</td>
                    <td className="filas-lista">{curso.estado}</td>
                    {curso.estado && <td onClick={()=>{
                        if (!curso.estado.includes('Revisi')){
                            return
                        }
                                    setSolicitudSeleccionada(curso);
                                 toggle()}} 
                                 title={`Autorizar impresion para ${curso.nombre}`} 
                                 className="filas-lista cursor-copy p-iconos-listas width-35" >
                            {curso.estado.includes('Revisi') && <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>}
                    </td>}   
                 </tr>
               )
            })
        }
        </tbody>
    </table>

    case 'ingresos' :

        return <table className="table mt-8 table-cent">
            <thead className="text-white ">
                <tr>
                        <div className="border-bottom-dotted-gray color-63 fw-x text-large">
                            <span className="filas-lista-nwx p-2 ti-fecha">Fecha</span>
                            <span className="filas-lista-nwx p-2 ti-contribuyente">Contribuyente</span>
                            <span className="filas-lista-nwx p-2 ti-titular">Titular</span>
                            <span className="filas-lista-nwx p-2 ti-domicilio">Domicilio</span>
                            <span className="filas-lista-nwx p-2 ti-provincia">Provincia</span>
                            <span className="filas-lista-nwx p-2 ti-monto">Monto</span>
                        </div>
                    </tr>
            </thead>
        <tbody>
        {
            cursosAmostrar.filter((item,index)=>item.comprobante!='>>>>')
            //.map((item,index)=>{return {...item,indice:index+1}})
            .filter((item,index)=>{
                return index>= iIni && index<=iFin
            })
            .map((curso,index) => {
            return (
                <tr key={curso.comprobante+''+index} className="border-bottom-solid cursor-pointer">
                    <div className="border-bottom-dotted-gray">
                        <span className="filas-lista-nw ti-fecha">{curso.fecha}</span>
                        <span className="filas-lista-nw ti-contribuyente">{curso.contribuyente}</span>
                        <span className="filas-lista-nw ti-titular">{curso.titular}</span>
                        <span className="filas-lista-nw ti-domicilio">{curso.domicilio}</span>
                        <span className="filas-lista-nw ti-provincia">{curso.provincia}</span>
                        <span className="filas-lista-nw ti-monto">{curso.monto}</span>
                    </div>
                </tr>
            )
            })
        }
       </tbody>     
    </table>

    }
}

function buscarApi(vista,usuario,estado_credencial,periodoFiscal,seleccionIngresos){
    let url;

    switch (vista){
        case 'ministros': 
            url= `/api/tablasgenerales/obreros/${usuario.id_region}`;
            break;
        case 'iglesias' :
            url= `/api/tablasgenerales/iglesias/${usuario.id_region}/${periodoFiscal}`;
            break;
        case 'diezmos' :
            url= `/api/tablasgenerales/diezmos/${usuario.id_region}`;
            break;
        case 'credenciales' :
            url= `/api/tablasgenerales/credenciales/${usuario.id_region}/${estado_credencial}`;
            break;            
        case 'ingresos' :
            if (seleccionIngresos.mes_d==0 || seleccionIngresos.anio_d==0){
                url=null
            }else{
                url= `/api/tablasgenerales/ingresos/${usuario.id_region}/${seleccionIngresos.mes_d}/${seleccionIngresos.mes_h}/${seleccionIngresos.anio_d}/${seleccionIngresos.anio_h}/${seleccionIngresos.dia_d}/${seleccionIngresos.dia_h}`;
            }
            break;
       }

       return url
}

function pantalla(){
    const alto = window.screen.height;
    const ancho = window.screen.width;
    const viewportwidth = document.documentElement.clientWidth
    const viewportheight = document.documentElement.clientHeight
    return {alto:viewportheight,ancho:viewportwidth}
}

function TextoInput({onchange,texto,limpiarTexto,nombre}){

    return <div className="flex f-col">
                <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                      {nombre}
                </span>
                <div className="flex f-row">
                    { texto!="" && 
                        <button>
                            <FontAwesomeIcon className="ic-abm"
                                            icon={faWindowClose} 
                                            onClick={limpiarTexto}/>
                        </button>}
                    <input autoComplete="off"  
                        type="text" 
                        onChange={onchange} 
                       // placeholder={nombre}
                        value={texto} 
                        className="texto-busqueda-alumno" />
            </div>
    </div>
   

}

function SelectPeriodosFicales({periodosFiscales,periodoSeleccionado,setPeriodoSeleccionado}){

        return <select onChange={(e)=>{setPeriodoSeleccionado(e.target.value)}} value={periodoSeleccionado} className="w-selabm" id="abm-alumno-nacionalidad">
            {
            periodosFiscales.map(item=>
            <option key={`abm-alumno-instrumentos${item.id_año_fiscal}`} 
            value={item.id_año_fiscal}>{item.nombre_corto}</option>
            )
            }
        </select>
}    


function completarAniosMeses(setDias,setMeses,setAnios,setSeleccionIngresos){
    const fecha_actual = new Date()

    const anio_actual = fecha_actual.getFullYear();
    const mes_actual = fecha_actual.getMonth() + 1;
    const dia_actual = fecha_actual.getDate();
    const anios_aux = [];
    const meses_aux = [];



        const fecha_menos_3 = obtenerFechaDiamenosN(3)

        setSeleccionIngresos({dia_d:fecha_menos_3.desglose.dia,
                             dia_h:dia_actual,
                             mes_d:fecha_menos_3.desglose.mes,
                             mes_h:mes_actual,
                             anio_d:fecha_menos_3.desglose.anio,
                             anio_h:anio_actual})
  /*  if (mes_actual==1){
        setSeleccionIngresos({dia_d:1,dia_h:1,mes_d:12,mes_h:1,anio_d:anio_actual-1,anio_h:anio_actual})
    }else{
        setSeleccionIngresos({dia_d:1,dia_h:1,mes_d:mes_actual-1,mes_h:mes_actual,anio_d:anio_actual,anio_h:anio_actual})
    }
*/

    

   meses_aux[0]={id:1,nombre:'Enero'}
   meses_aux[1]={id:2,nombre:'Febrero'}
   meses_aux[2]={id:3,nombre:'Marzo'}
   meses_aux[3]={id:4,nombre:'Abril'}
   meses_aux[4]={id:5,nombre:'Mayo'}
   meses_aux[5]={id:6,nombre:'Junio'}
   meses_aux[6]={id:7,nombre:'Julio'}
   meses_aux[7]={id:8,nombre:'Agosto'}
   meses_aux[8]={id:9,nombre:'Septiembre'}
   meses_aux[9]={id:10,nombre:'Octubre'}
   meses_aux[10]={id:11,nombre:'Noviembre'}
   meses_aux[11]={id:12,nombre:'Diciembre'}

   setMeses(meses_aux)
   
   for (let anio=anio_actual-10;anio<anio_actual+1;anio++){
        anios_aux.push(anio)
   }

   setAnios(anios_aux.reverse())

   cargarVectorDias(setDias)
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

function TotalIngresos({seleccion,registros,meses}){

    console.log(registros)
    // este algoritmo es complejo porque hay que convertir los montos que llegan como strings en formato "xx,xxx.xx" y no se pueden sumar
    // para poder sumarlos primero hay que remover la coma y dejar el numero plano con los 2 decimales que ya trae con punto decimal 
    // luego con parseFloat lo transfomamos de string a número
    const registros_sin_null = registros.filter(item=>item.monto!=null && item.comprobante!=">>>>")
    const nuevo_registro = registros_sin_null.map(item=>{return {...item,monto:parseFloat(item.monto.replace(",",""))}})

    // luego sumamos

    const total = nuevo_registro.reduce((total,item)=>{return total+item.monto},0)

    // luego mostramos el total con un un patron (tomado de stackoverflow) para formatear el importe a un tipo moneda

    return <div className="text-center text-smaller mt-2 fw-100">
            <span>{`${seleccion.dia_d}-${meses[seleccion.mes_d-1].nombre.substring(0,3)}-${seleccion.anio_d} al `}</span> 
            <span>{`${seleccion.dia_h}-${meses[seleccion.mes_h-1].nombre.substring(0,3)}-${seleccion.anio_h}`}</span> 
            <p className="mt-2">Total de ingresos : $ {total.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</p>
      </div>

}

function invertirComasPuntos(importeString){

  let importeAvector=[...importeString];

  const vectorTransformado =  importeAvector.map((item)=>{
       if(item=="."){
            return item
       }else if (item==","){
           return ""
       }else{
           return item
       }
    })

  return vectorTransformado.join('')
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
      <svg width="70" height={nueva_altura} fontFamily="sans-serif" font-size="10">
  
    <rect  x="0" y={nueva_altura-20-alto} fill={alto==1 ? "red" : "steelblue"} width="60" height={alto}></rect>
    <text fill="black" x="50" y={nueva_altura-10}>{item.diezmo.toFixed(2)}</text>

   </svg>
        </div>

    );
  }

  function IglesiasObrero({iglesiasObrero, buscandoIglesiasObrero,obrero}){
    const [verDetalle,setVerDetalle]=useState(false)

    const switchDetalle = () => {
        if (verDetalle){
            setVerDetalle(false)
        }else{
            setVerDetalle(true)
        }
    }

      return <div className="FormAbmContainer flex f-col ml-2">
          {buscandoIglesiasObrero && <div><Loading align={"right"}/><span className="cargando">Buscando iglesias...</span></div>}
                    {/*<div className="flex f-col">
                        <span className="p-2 mb-2 text-white bg-tomato inline-block-1 text-center">Balances</span>
                        {balances.map(item=><span className={item.estado ==0 ? 'bal-np' : 'bal-pr'}>{item.periodo}</span>)}
                    </div>*/}
                    {iglesiasObrero.length > 0 && <div className="flex f-col text-large">

                <span className="inline-block1 text-larger fw-100 mb-2 mt-4">Iglesias autónomas de <span className="ia-no border-bottom-dotted-gray">{obrero.nombre_obrero}</span></span>
                    { !verDetalle && <span onClick={switchDetalle} className="cursor-pointer botonNc text-small color-gray" >
                                <FontAwesomeIcon onClick={switchDetalle} className="color-tomato" icon={faPlus}/> Ver el detalles de balances y diezmos
                    </span>}  
                    { verDetalle &&<span onClick={switchDetalle} className="cursor-pointer botonNc text-small color-gray" >
                                <FontAwesomeIcon onClick={switchDetalle} className="color-tomato" icon={faMinus}/> Ocultar el detalles de balances y diezmos
                    </span> }                 
                        {iglesiasObrero.map(item=><div className="ig-min"><span className="border-bottom-dotted-gray">{item.nombre}</span><CondicionIglesia iglesia={item}/>
                            {verDetalle && <BalancesYdiezmos id_iglesia={item.id_iglesia}/>}
                        </div>)}
                    </div>}
                    {iglesiasObrero.length == 0 && !buscandoIglesiasObrero && <div className="flex f-col text-large">
                        <div className="ig-min"><span>{`No hay iglesias autónomas a nombre de ${obrero.nombre_obrero}`}</span></div>
                </div>}                 
            </div>

  }

  function CondicionIglesia({iglesia}){
      return <div className="flex f-row jfc-fe text-smaller mt-2 border-bottom-dotted-gray">  
          <div className="ml-4"><span>Balance:</span>{ iglesia.estado_balances==1 && <span><FontAwesomeIcon className="mr-2 ml2 color-green" icon={faCheckCircle}/>Al día</span>}
               { iglesia.estado_balances==0 && <span><FontAwesomeIcon className="mr-2 ml2 color-red" icon={faTimesCircle}/>Adeuda</span>}
          </div>
          <div className="ml-4"><span>Diezmos:</span> {iglesia.detalle_diezmos==1 && <span><FontAwesomeIcon className="mr-2 ml2 color-green" icon={faCheckCircle}/>Al día</span>}
                {iglesia.detalle_diezmos==0 && <span><FontAwesomeIcon className="mr-2 ml2 color-red" icon={faTimesCircle}/>Adeuda</span>}
          </div>
      </div>
  }

  function BalancesYdiezmos({id_iglesia}){
    const [balances,setBalances]=useState([]);
    const [diezmos,setDiezmos]=useState([]);
    const [buscandoDatos,setBuscandoDatos]=useState(false)
    const [huboError,setHuboError] =useState(false)

    useEffect(()=>{
        let mounted=true

        const buscarBalancesYdiezmos = async ()=>{
            try{
                setBuscandoDatos(true)
                const vectorResultados = await Promise.all([
                    Axios.get(`/api/tablasgenerales/balances/${id_iglesia ? id_iglesia : 0}`),
                    Axios.get(`/api/tablasgenerales/mesesdiezmados/${id_iglesia ? id_iglesia : 0}`)
                ])

                if (mounted){ // para evitar el warning can't perform...
                    setBalances(vectorResultados[0].data)
                    setDiezmos(vectorResultados[1].data)
                    setBuscandoDatos(false)
                }

            }catch(error){
                setHuboError(true)
                setBuscandoDatos(false)
            }
        }

        buscarBalancesYdiezmos();

        return ()=>{mounted=false} // para evitar el warning can't perform...
    },[])

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }
    
    if (buscandoDatos){
        return <Main center><Loading/><span className="cargando">Buscando balances y diezmos...</span></Main>
    }

    return <div className="FormAbmContainer flex f-row ml-2 justify-center mt-4">
            <div className="flex f-col">
                <span className="text-small text-center">Balances</span>
                {balances.map(item=><span className={item.estado ==0 ? 'bal-dm-np' : 'bal-dm-pr'}>{item.periodo}</span>)}
            </div>
            <div className="flex f-col ml-4">
                <span className="text-small text-center">Diezmos</span>
                {diezmos.map(item=><span className={Number(item.diezmo)>0 ? "bal-dm-pr" : 'bal-dm-np'}>{item.periodo}</span>)}
            </div>
            {diezmos.length==0 && <span className="dm-np">0.00</span>}
    </div>

  }

  function OtrasIglesiasObrero({obrero}){
    const [iglesias,setIglesias]=useState([]);
    const [buscandoDatos,setBuscandoDatos]=useState(false)
    const [huboError,setHuboError] =useState(false)

    useEffect(()=>{
        let mounted=true

        const buscarOtrasIglesias = async ()=>{
            try{
                setBuscandoDatos(true)
                const vectorResultados = await Promise.all([
                    Axios.get(`/api/tablasgenerales/iglesiasobreroall/${obrero.id_obrero ? obrero.id_obrero : 0}`),
                ])

                if (mounted){ // para evitar el warning can't perform...
                    setIglesias(vectorResultados[0].data)
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

    return <div className="flex f-col text-large">

    <span className="inline-block1 text-larger fw-100 mb-2 mt-4">Otras iglesias asociadas a <span className="ia-no border-bottom-dotted-gray">{obrero.nombre_obrero}</span></span>
               
            {iglesias.map(item=><div className="ig-min"><span className="border-bottom-dotted-gray">{item.iglesia}</span>
            <span className="border-bottom-dotted-gray">{item.provincia}</span>
            </div>)}
        </div>

  }

  async function solicitarImpresion(id_obrero,imp_anual){
        const objetoAenviar = {id_obrero:id_obrero,imp_anual:imp_anual}
        
        try{
            const respuesta = await Axios.post(`/api/tablasgenerales/credenciales/solicitarimpresion`,objetoAenviar);

            console.log('respuesta',respuesta)
            return respuesta.data.mensaje;

        }catch(err){
            console.log('error ',err)
            throw new Error('Error al procesar la solicitud de impresión')
        }
  }

/*
const { value: accept } = await Swal.fire({
  title: 'Terms and conditions',
  input: 'checkbox',
  inputValue: 1,
  inputPlaceholder:
    'I agree with the terms and conditions',
  confirmButtonText:
    'Continue<i class="fa fa-arrow-right"></i>',
  inputValidator: (result) => {
    return !result && 'You need to agree with T&C'
  }
})

if (accept) {
  Swal.fire('You agreed with T&C :)')
}
*/

function SolicitudImpresion ({obrero}) {
    const [solicitar,setSolicitar]=useState(false)
    let imp_anual = true;

    const iniciarSolicitud = ()=>{

        Swal.fire({
            html: '<p>Por favor confirme...</p>',
            input: 'checkbox',
            inputValue: 0,
            showCancelButton: true,
            cancelButtonText:'Cancelar',
            inputPlaceholder:
              'El motivo de la solicitud es la reimpresión anual',
            confirmButtonText:
              'Solicitar'
          }).then(resultado=>{
              if(resultado.isConfirmed){
                    if (resultado.value===1){
                        imp_anual = true
                    }else if (resultado.value===0){
                        imp_anual = false
                    }

                    solicitarImpresion(obrero.id_obrero,imp_anual)
                    .then(resultado=>{
                        let mensajeHTML = 'La solicitud se procesó correctamente';
                        let icono = 'info'
    
                        if (resultado!=""){
                            mensajeHTML=`<p>${resultado}</p><p>No se pudo completar la solicitud</p>`
                            icono = 'error'
                        }
    
                        Swal.fire({
                            html:mensajeHTML,
                            icon: icono,
                            confirmButtonColor: '#3085d6',
                        }) 
                    })
                    .catch(err=>{
                        Swal.fire({
                            html:`<p>${err.message}</p>`,
                            icon: 'error',
                            confirmButtonColor: '#3085d6',
                        }) 
                    })
              }
          })
    }

    return <div>
        <span onClick={iniciarSolicitud} className="cursor-pointer botonNc ml-6 color-gray text-center mb-4 inline-block1" >
            <FontAwesomeIcon className="color-tomato blink text-xlarge" icon={faIdCard}/> Solicitar Impresión de credencial
        </span>
    </div>
}                                               

function CabeceraMinistros({setCrearObrero,toggle,setEnviarCorreo,iniciarEnviarCorreo,limpiarNombre,
    handleChangeInputNombre,textoNombre,textoLocalidad,handleChangeInputLocalidad,limpiarLocalidad,
    limpiarMinisterios,ministerioSeleccion,handleChangeSelectMinisterio,ministerios,limpiarRangos,
    rangosAbreviados,handleChangeSelectRangoAbreviado,rangoObreroAbreviadoSeleccion}){
 
return        <div className="flex f-col">
            <div className="centro-w100pc">
                <span onClick={()=>{setCrearObrero(true);toggle()}} className="cursor-pointer botonNc ml-6" >
                    <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo ministro
                </span>
                <span onClick={iniciarEnviarCorreo} className="cursor-pointer botonNc ml-6" >
                    <FontAwesomeIcon onClick={()=>{setEnviarCorreo(true);toggle()}} className="color-tomato" icon={faPlusSquare}/> Enviar un mail
                </span>             
            </div>
            <div>

                <div className="mt-6 flex f-row">
                   
                    <TextoInput nombre={'Nombre'} textoid={"texto-nombre"} texto={textoNombre} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/>
                    <TextoInput nombre={'Localidad'} textoid={"texto-localidad"} texto={textoLocalidad} onchange={handleChangeInputLocalidad} limpiarTexto={limpiarLocalidad}/>


                    <div className="flex f-col">
                        <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                    Ministerio
                        </span>
                        <div className="flex f-row">
                            { ministerioSeleccion!="-1" && <button><FontAwesomeIcon 
                                            className="ic-abm"
                                            icon={faWindowClose} 
                                            onClick={limpiarMinisterios}/>
                                        </button>}
                            <Seleccionador  nombre='Todos' valor={ministerioSeleccion} onchange={handleChangeSelectMinisterio} vector = {ministerios}/>
                        </div>

                    </div>
                    <div className="flex f-col">
                        <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                    Rango
                        </span>
                        <div className="flex f-row">
                        <div className="flex f-row">
                            { rangoObreroAbreviadoSeleccion!="-1" && <button><FontAwesomeIcon 
                                            className="ic-abm"
                                            icon={faWindowClose} 
                                            onClick={limpiarRangos}/>
                                        </button>}
                            <Seleccionador  nombre='Todos' valor={rangoObreroAbreviadoSeleccion} onchange={handleChangeSelectRangoAbreviado} vector = {rangosAbreviados}/>
                        </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    
}