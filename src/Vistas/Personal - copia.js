import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link,useParams } from 'react-router-dom';
import Loading from '../componentes/Loading';
import {useAlumno} from '../Context/alumnoContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit,faCopy, faCircle, faPlusSquare,faDotCircle,faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons';
import { faWindowClose,faAngleRight,faAngleLeft, faTrash, faSync,faEquals, faGreaterThanEqual,faEnvelopeSquare, faListOl, faMailBulk,faUserCheck,faEnvelope } from '@fortawesome/free-solid-svg-icons';
import AbmObrero from '../abms/Abm-obrero';
import AbmIglesia from '../abms/Abm-iglesia';
import Prueba from '../abms/prueba';
import CredencialesModificacion from '../componentes/Credenciales-modificacion';
import {scrollTop, hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
const anchoPaginacion = 50;

export default function Cursos({match,history}){
    const [cursos,setCursos] = useState([])
    const [cursosAmostrar,setCursosAmostrar]=useState([])
    const {toggle, isShowing } = useModal();
    const [criterio, setCriterio ] = useState('original');

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

    const [ministerioSeleccion,setMinisterioSeleccion]=useState(-1)
    const [tipoIglesiaSeleccion,setTipoIglesiaSeleccion]=useState(-1)
    const [estadoCredencialSeleccion,setEstadoCredencialSeleccion]=useState(-1)
    const [rangoObreroSeleccion,setRangoObreroSeleccion]=useState(-1)
    const [rangoObreroAbreviadoSeleccion,setRangoObreroAbreviadoSeleccion]=useState(-1)
    const [motivoSolicitudSeleccion,setMotivoSolicitudSeleccion]=useState(-1)
    const [estadoBalanceSeleccion,setEstadoBalanceSeleccion]=useState('Estado del balance')

    const [estadoBalances,setEstadosBalances] = useState(['Estado del balance','Si','No'])
    const [obreroSeleccionado,setObreroSeleccionado] = useState(null);
    const [iglesiaSeleccionada,setIglesiaSeleccionada] = useState(null);
    const [crearObrero,setCrearObrero] = useState(false);
    const [crearIglesia,setCrearIglesia] = useState(false);

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

    const parametros = useParams();

    useEffect(()=>{
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

        let url = buscarApi(parametros.vista,usuario,estadoImpresion,periodoSeleccionado);

        setCargandoCursos(true)
        try{          
//            const {data} = await Axios.get(`${url}/${usuario.id_region}`)
            const {data} = await Axios.get(`${url}`)
            setCursos(data)
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

        buscarCursos() 
       
        
    },[parametros.vista,usuario,periodoSeleccionado]) // agregué usuario porque necesito que se dispare el evento cuando no sea vacío usuario, al principio es vacío por unos milisegundos...

    useEffect(()=>{
        definirValoresPaginacion(cursosAmostrar,setIini,setIfin,anchoPaginacion)

        if (cursosAmostrar.length != cursos.length){
            setHayFiltrosActivos(true)
        }else{
            setHayFiltrosActivos(false)
        }

    },[cursosAmostrar])

    useEffect(()=>{
        
        switch(parametros.vista){
            case 'iglesias' :
                    const tipos = tiposDeIglesias()
                    setTipoIglesias(tipos)
                    break;
            case 'obreros' :
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
    }
},[isShowing])

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
    setTextoLocalidad("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)
    
    switch(parametros.vista){
        case 'obreros' :
                filtrarVectorCursosOriginal = cursos.filter(item=>
                item.nombre_obrero.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)
                break;

        case 'iglesias' :
                filtrarVectorCursosOriginal = cursos.filter(item=>
                item.nombre_igl.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)
                break;

        case 'credenciales':
                filtrarVectorCursosOriginal = cursos.filter(item=>
                item.nombre.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)
                break;
    }
 }

 const handleChangeInputLocalidad = (e)=> {
    
    /* if (e.target.value.trim() === "" ){
         return 
     }
 */

    let filtrarVectorCursosOriginal =[]

    setTextoLocalidad(e.target.value)
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)

    switch(parametros.vista){
        case 'obreros' :
                filtrarVectorCursosOriginal = cursos.filter(item=>
                item.ubicacion.toUpperCase().includes(e.target.value.toUpperCase())) 
                setCursosAmostrar(filtrarVectorCursosOriginal)
                break;

        case 'iglesias' :
                filtrarVectorCursosOriginal = cursos.filter(item=>
                item.ubicacion.toUpperCase().includes(e.target.value.toUpperCase())) 
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

    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor(e.target.value)
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)

    filtrarVectorCursosOriginal = cursos.filter(item=>
    item.pastor.toUpperCase().includes(e.target.value.toUpperCase())) 
    setCursosAmostrar(filtrarVectorCursosOriginal)

 }

 const handleChangeInputEncargado = (e)=> {
    
    /* if (e.target.value.trim() === "" ){
         return 
     }
 */

    let filtrarVectorCursosOriginal =[]

    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado(e.target.value)
    setTextoPastor("")
    setMinisterioSeleccion(-1)
    setTipoIglesiaSeleccion(-1)
    setEstadoCredencialSeleccion(-1)
    setRangoObreroSeleccion(-1)
    setMotivoSolicitudSeleccion(-1)
    setRangoObreroAbreviadoSeleccion(-1)

    filtrarVectorCursosOriginal = cursos.filter(item=>
    item.encargado.toUpperCase().includes(e.target.value.toUpperCase())) 
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
        case 'obreros' :
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

    let url = buscarApi(parametros.vista,usuario,estadoImpresion);
        
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
        setCrearIglesia(false)
    }

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
    setCursosAmostrar(cursos)

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
    setCursosAmostrar(cursos)
}

const limpiarPastor = ()=> {
    
    setTextoPastor("")
    setCursosAmostrar(cursos)

}

const limpiarEncargado = ()=> {
    
    setTextoEncargado("")
    setCursosAmostrar(cursos)

}

const limpiarLocalidad = ()=> {
    
    setTextoLocalidad("")
    setCursosAmostrar(cursos)

}

const limpiarProvincia = ()=> {
    
    setTextoProvincia("")
    setCursosAmostrar(cursos)

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
    
    if (e.target.value === "-1" ){
        return 
    }

    setTipoIglesiaSeleccion(e.target.value)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.tipo_iglesia===e.target.value)
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

const handleChangeSelectMinisterio = (e)=> {
    
    if (e.target.value === "-1" ){
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
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

const handleChangeSelectEstadoBalance = (e)=> {
    
    if (e.target.value === "Estado del balance" ){
        return 
    }

    setMinisterioSeleccion(-1)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")
    setRangoObreroAbreviadoSeleccion(-1)
    setEstadoBalanceSeleccion(e.target.value)

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.balance.includes(e.target.value))
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

const handleChangeSelectRango = (e)=> {
    
    if (e.target.value === "-1" ){
        return 
    }

    setRangoObreroSeleccion(e.target.value)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.rango===e.target.value)
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

const handleChangeSelectMotivo = (e)=> {
    
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
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

const handleChangeSelectEstado = (e)=> {
    
    if (e.target.value === "-1" ){
        return 
    }

    setEstadoCredencialSeleccion(e.target.value)
    setTextoLocalidad("")
    setTextoNombre("")
    setTextoProvincia("")
    setTextoEncargado("")
    setTextoPastor("")

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.estado===e.target.value)
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

const handleChangeSelectRangoAbreviado = (e)=> {
    
    if (e.target.value === "-1" ){
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
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

const handleChangeEstadoImpresion = (e)=>{
    setEstadoImpresion(e.target.value)

}

const copiarCurso = (id)=>{
    setCopiarUnCurso(true)
    setCrearCurso(false)
    setCursoAcopiar(id)
    setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);
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

        { isShowing && solicitudSeleccionada && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'transparent'}}>
            <CredencialesModificacion solicitud={solicitudSeleccionada ? solicitudSeleccionada : null} 
                       finalizarAltaOcopia={finalizarAltaOcopiaCredencial}
                       esModal={true}/>    
        </Modal>}
        { isShowing && obreroSeleccionado && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'transparent'}}>
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
        { isShowing && iglesiaSeleccionada && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'transparent'}}>
            <AbmIglesia id_iglesia={iglesiaSeleccionada ? iglesiaSeleccionada : null} 
                       finalizarAltaOcopia={finalizarAltaOcopiaIglesia}
                       esModal={true} usuario={usuario}/>      
        </Modal>}               
        <div className="bg-blue text-whitexxx p-4 rounded relative ml-auto mr-auto"> 
        {cuatrimestreActivo && <Cabecera cuatrimestreActivo={cuatrimestreActivo} 
                                         iniciarCrearUsuario={iniciarCrearUsuario}
                                         refrescarLista={refrescarLista}/>}

        <div className="flex f-row resultados absolute">
            <div className="flex f-col">
                <span>{cursosAmostrar.length== 1 ? `1 registro encontrado`:`${cursosAmostrar.length} registros encontrados`}</span> 
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={cursosAmostrar.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>
{  /* <ListaUltimosCursos cursos={ultimosCursosCreados} />  
            <a title="Enviar un mail solo a los usuarios seleccionados con un filtro" className="tdec-none cursor-pointer mr-2 ml-6 relative color-63 " onClick={(e)=>e.preventDefault()} href={crearMailToListaEmails(listaEmailsSeleccion)}>
                <FontAwesomeIcon className="cursor-pointer color-tomato" icon={faUserCheck}/><FontAwesomeIcon className="color-tomato cursor-pointer absolute left--10" icon={faEnvelope}/> Mail a los seleccionados
            </a> 
            <a title="Enviar un mail a todos los usuarios de la lista" onClick={(e)=>e.preventDefault()} className="tdec-none cursor-pointer mr-2 ml-2 color-63 " href={crearMailToListaEmails(listaEmails)}>
                <FontAwesomeIcon className="color-tomato" icon={faMailBulk}/> Mail grupal
            </a> 
*/ }
            { hayFiltrosActivos && <a onClick={limpiarFiltros} title="Limpiar todos los filtros" className="tdec-none cursor-pointer ml-6 color-63 ">
                <FontAwesomeIcon className="cursor-pointer color-tomato" icon={faTrash}/> Limpiar Filtros
            </a> }
            { 
            parametros.vista=='credenciales' && <div className="flex f-row">

                <span className="ml-6 color-gray">Estado de la credencial</span>
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
                parametros.vista=='obreros' && <div>
                    <span onClick={()=>{setCrearObrero(true);toggle()}} className="cursor-pointer acciones-lista-cabecera botonNc ml-6" >
                        <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo obrero
                    </span>
                </div>
            }
            {
                parametros.vista=='iglesias' && <div>
                    <span onClick={()=>{setCrearIglesia(true);toggle()}} className="cursor-pointer acciones-lista-cabecera botonNc ml-6" >
                        <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear una nueva iglesia
                    </span>
                    <span className="cursor-pointer acciones-lista-cabecera botonNc ml-6 w-100 inline-block-1 border-bottom-dotted-gray" >
                         Año fiscal
                    </span>
                    <SelectPeriodosFicales periodosFiscales={periodosFiscales} periodoSeleccionado={periodoSeleccionado} setPeriodoSeleccionado={setPeriodoSeleccionado}/>
                </div>
            }
        </div>  
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
                />
      </div>
     </Main>
)
    }



function Seleccionador({vector,onchange,valor,nombre}){

    return (            
        <div className="input-field col s12">
            <select value={valor} onChange = {onchange} className="block appearance-none w-full select-titulo rounded shadow leading-tight">
                <option value="-1" key="-1">{nombre}</option>
                {vector.map(item=><option value={item} key={item}>{item}</option> )}
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
        <span className="cursor-pointer acciones-lista-cabecera ml-4 mr-4" onClick={iniciarCrearUsuario} >
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
                estadoBalanceSeleccion
                }){

    switch (vista){
        case 'obreros':
            return <table className="table mt-6">
            <thead className="bg-blue-500x text-whitex ">
               <tr className="titulo-listax">
                    <th scope="col">Nombre</th>
                    <th scope="col">Edad</th>
                    <th scope="col">Dirección</th>
                    <th scope="col">Localidad</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Teléfono</th>
                    <th scope="col">Ministerio</th>
                    <th scope="col">Rango</th>
                    <th colspan="2" className="pad-list1" scope="col"><span>Acciones</span></th>
                </tr>
                <tr className="titulo-listax">
                    <th scope="col"><TextoInput nombre={''} textoid={"texto-nombre"} texto={texto} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"><TextoInput nombre={''} textoid={"texto-localidad"} texto={textoLocalidad} onchange={handleChangeInputLocalidad} limpiarTexto={limpiarLocalidad}/></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"><Seleccionador  nombre='' valor={ministerioSeleccion} onchange={handleChangeSelectMinisterio} vector = {ministerios}/></th>
                    <th scope="col"><Seleccionador  nombre='' valor={rangoObreroAbreviadoSeleccion} onchange={handleChangeSelectRangoAbreviado} vector = {rangosAbreviados}/></th>
                    {/*<th colspan="2" className="pad-list1" scope="col"><span>Acciones</span></th>*/}
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
                        <td className="filas-lista-principal cursor-pointer" onClick={()=>{setObreroSeleccionado(curso.id_obrero);
                                     toggle()}}>
                                {curso.nombre_obrero}
                        </td>                        
                        <td className="filas-lista">{curso.edad}</td>
                        <td className="filas-lista">{curso.direccion}</td>
                        <td className="filas-lista">{curso.ubicacion}</td>
                        <td className="filas-lista">{curso.email}</td>
                        <td className="filas-lista">{curso.telefono}</td>
                        <td className="filas-lista">{curso.ministerio}</td>
                        <td className="filas-lista">{curso.rango}</td>                       
                        <td onClick={()=>{setObreroSeleccionado(curso.id_obrero);
                                     toggle()}} title={`Abrir la ficha del obrero ${curso.nombre_obrero}`} className="filas-lista cursor-copy p-iconos-listas width-35" >
                                <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                        </td>
                     </tr>
                   )
                })
            }
            </tbody>
        </table>
      case 'iglesias':
        return <table className="table mt-6">
        <thead className="text-white ">
           <tr className="titulo-lista">
               <span>
               <TextoInput nombre={'Nombre_Igl'} textoid={"texto-nombre"} texto={texto} onchange={handleChangeInputNombre} limpiarTexto={limpiarNombre}/>
               <TextoInput nombre={'Pastor'} textoid={"texto-pastor"} texto={textoPastor} onchange={handleChangeInputPastor} limpiarTexto={limpiarProvincia}/>
               <TextoInput nombre={'Encargado'} textoid={"texto-encargado"} texto={textoEncargado} onchange={handleChangeInputEncargado} limpiarTexto={limpiarEncargado}/>
               <TextoInput nombre={'Ubicación'} textoid={"texto-localidad"} texto={textoLocalidad} onchange={handleChangeInputLocalidad} limpiarTexto={limpiarLocalidad}/>
               <div className="flex f-row">
                    <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                Tipo de iglesia
                    </span>
                    <Seleccionador  nombre='Tipo de iglesia' valor={tipoIglesiaSeleccion} onchange={handleChangeSelectTipoIgl} vector = {tiposIgl}/>
               </div>
               <div className="flex f-row">
                    <span className="cursor-pointer p-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray" >
                                Estado del balance
                    </span>
                    <Seleccionador  nombre='Estado del balance' valor={estadoBalanceSeleccion} onchange={handleChangeSelectEstadoBalance} vector = {estadoBalances}/>
               </div>
               </span>
                
            </tr>
            <tr>
                    <div className="border-bottom-dotted-gray color-63 fw-x text-large">
                        <span className="filas-lista-nwx cursor-pointer ti-nombre" >
                                Nombre
                        </span>                        
                        <span className="filas-lista-nwx ti-pastor">Pastor</span>
                        <span className="filas-lista-nwx ti-encargado">Encargado</span>
                        <span className="filas-lista-nwx ti-domicilio">Domicilio</span>
                        <span className="filas-lista-nwx ti-ubicacion">Ubicación</span>
                        <span className="filas-lista-nwx ti-telefono">Teléfono</span>
                        <span className="filas-lista-nwx ti-tipo">Tipo</span>
                        <span className="filas-lista-nwx ti-tipo">Balance</span>
                        <span className="filas-lista-nwx cursor-copy p-iconos-listas ti-acciones" >
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
                <tr key={curso.id_iglesia} className="border-bottom-solid">
                    <div className="border-bottom-dotted-gray">
                        <span onClick={()=>{setIglesiaSeleccionada(curso.id_iglesia);
                                        toggle()}} className="filas-lista-nw cursor-pointer ti-nombre" >
                                {curso.nombre_igl}
                        </span>                        
                        <span className="filas-lista-nw ti-pastor">{curso.pastor}</span>
                        <span className="filas-lista-nw ti-encargado">{curso.encargado}</span>
                        <span className="filas-lista-nw ti-domicilio">{curso.domicilio}</span>
                        <span className="filas-lista-nw ti-ubicacion">{curso.ubicacion}</span>
                        <span className="filas-lista-nw ti-telefono">{curso.telefono}</span>
                        <span className="filas-lista-nw ti-tipo">{curso.tipo_iglesia}</span>
                        <span className="filas-lista-nw ti-tipo">{curso.balance}</span>
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

    case 'credenciales' :
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

        return <table className="table mt-12">
        <thead className="bg-blue-500 text-white ">
           <tr className="titulo-lista">
                <th scope="col">Ingreso</th>
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
                    <td onClick={()=>{setUsuarioSeleccionado(curso);
                                 toggle()}} title={curso.descripcion} className="filas-lista-principal cursor-pointer" >
                            {curso.nombre_obrero}
                    </td>                        
                    <td className="filas-lista">{curso.edad}</td>
                    <td className="filas-lista">{curso.localidad}</td>
                    <td className="filas-lista">{curso.provincia}</td>
                    <td className="filas-lista">{curso.ministerio}</td>
                    <td className="filas-lista">{curso.cumpleaños}</td>
                    <td onClick={()=>{setUsuarioSeleccionado(curso);
                                 toggle()}} title={`Abrir la ficha del usuario ${curso.descripcion}`} className="filas-lista cursor-copy p-iconos-listas width-35" >
                            <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                    </td>   
                 </tr>
               )
            })
        }
        </tbody>
    </table>

    }
}

function buscarApi(vista,usuario,estado_credencial,periodoFiscal){
    let url;

    switch (vista){
        case 'obreros': 
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
            url= `/api/tablasgenerales/ingresos/${usuario.id_region}`;
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

    return <div className="flex f-row">
        { texto!="" && <button><FontAwesomeIcon 
                                className="ic-abm"
                                icon={faWindowClose} 
                                onClick={limpiarTexto}/>
                            </button>}
                <input autoComplete="off"  
                       type="text" 
                       onChange={onchange} 
                       placeholder={nombre}
                       value={texto} 
                       className="texto-busqueda-alumno" />
                
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