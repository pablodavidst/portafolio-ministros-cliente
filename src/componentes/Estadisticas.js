import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faCircle, faEdit,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import AbmAula from '../abms/Abm-aula'
import { v4 as uuidv4 } from 'uuid';

export default function Estadisticas({usuario}){

    const [iglesias,setIglesias]=useState([]);
    const [obreros,setObreros]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
   
    const referencia1 = React.useRef();

    useEffect(()=>{
       
        let mounted = true;

        setBuscando(true)

        const buscarEstadisticas = async ()=>{

           try{
                const vector_promesas = await Promise.all([Axios.get(`/api/tablasgenerales/estadisticas/iglesias/${usuario.id_region}`),
                Axios.get(`/api/tablasgenerales/estadisticas/obreros/${usuario.id_region}`)])
        
                if (mounted){
                   setIglesias(vector_promesas[0].data)
                   setObreros(vector_promesas[1].data)
                   setBuscando(false)
                }
            //    setIglesias(vector_promesas[0].data)
            //    setObreros(vector_promesas[1].data)
            //    setBuscando(false)
            }catch(err){
              //  console.log(err.response.data)
                setBuscando(false)
                setHuboError(true)
            }
        }

            buscarEstadisticas()

            return ()=> mounted = false
    },[])



    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando estadísticas...</span></div></Main>
    };

    return(
        <div> 
        {iglesias.length > 0 && <div className="flex f-col">
            <span className="inline-block1 text-larger fw-100 mb-2 mt-4 tit-est">{iglesias.reduce((ac,item)=>{return ac + Number(item.cantidad) },0)} iglesias</span>
            <div className="flex f-row mt-2"> 
            {iglesias.sort((a,b)=>b.cantidad-a.cantidad).map(item=><div key={uuidv4()} className="flex f-col"><Spinner item={item} todos={iglesias}/>
            <p className="pgf-dm">{item.titulo}</p></div> )}   
        </div></div>}
        {obreros.length > 0 && <div className="flex f-col">
            <span className="inline-block1 text-larger fw-100 mb-2 mt-4 tit-est">{obreros.reduce((ac,item)=>{return ac + Number(item.cantidad) },0)} ministros</span>
            <div className="flex f-row mt-2"> 
            {obreros.sort((a,b)=>b.cantidad-a.cantidad).map(item=><div key={uuidv4()} className="flex f-col"><Spinner item={item} todos={obreros}/>
            <p className="pgf-dm">{item.titulo}</p></div> )}   
        </div></div>}
        </div>
    )
}



function Spinner({item, todos}) {

    const maximo = todos.map(item=>item.cantidad).sort((a,b)=>b-a)[0]
    let nueva_altura = (Number(maximo)) + 20 // antes era 140

    if (nueva_altura > 150) {
        nueva_altura = 150
    }

    let alto = Number(item.cantidad)

    if (alto==0){
        alto = 1
    }

    const total = todos.reduce((ac,item)=>{return ac + Number(item.cantidad) },0)
    const porcentaje = ((Number(item.cantidad)/Number(total))*100).toFixed(1)

    return (
        <div>
      <svg width="70" height={nueva_altura} fontFamily="sans-serif" fontSize="10" textAnchor="end">
  
    <rect  x="0" y={nueva_altura-20-alto} fill={alto==1 ? "red" : "steelblue"} width="60" height={alto}></rect>
    <text fontSize="20px" fill="black" x="50" y={nueva_altura}>{item.cantidad}</text>
    <text fill="black" fontSize="15px" x="50" y={nueva_altura-50}>{porcentaje} %</text>

   </svg>
        </div>

    );
  }

 function Porcentajes({todos}) {

    const maximo = todos.reduce((ac,item)=>{return ac + item.cantidad },0)
    let nueva_altura = (Number(maximo)) + 20 // antes era 140

    if (nueva_altura > 150) {
        nueva_altura = 150
    }

    let alto = Number(250)

    if (alto==0){
        alto = 1
    }


    const porc = (alto / maximo)*500
    return (
        <div>
            <svg width="70" height={1000} fontFamily="sans-serif" fontSize="10" textAnchor="end">
  
                {todos.map((item,index)=>
                    <rect x="0" fill={color(index)} width="60" height={(item.cantidad/maximo)*500}></rect>)}
                {todos.map((item,index)=>
                    <text fill="black" y={(item.cantidad/maximo)*300} >{item.titulo}</text>)}
   
            </svg>
        </div>

    );
  }

  function color (i){
      switch(i){
          case 0 : return 'red';
          case 1 : return 'blue';
          case 2 : return 'yellow';
          case 3 : return 'pink';
          case 4 : return 'violet';
          case 5 : return 'black';
          default: return 'gray'
      }
  }