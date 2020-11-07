import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faCircle, faEdit,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import { v4 as uuidv4 } from 'uuid';

export default function IngresosIgl({finalizar,id_iglesia}){

    const [ingresos,setIngresos]=useState([]);
    const [diezmos,setDiezmos]=useState([]);
    const [promedio,setPromedio]=useState(0);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [total,setTotal] = useState(0)

    useEffect(()=>{
       
        setBuscando(true)

        const buscarIngresos = async ()=>{

           try{
               // const {data}= await Axios.get(`/api/tablasgenerales/ingresosigl/${id_iglesia}`)
                const vectorResultados = await Promise.all([
                    Axios.get(`/api/tablasgenerales/ingresosigl/${id_iglesia}`),
                    Axios.get(`/api/tablasgenerales/mesesdiezmados/${id_iglesia ? id_iglesia : 0}`)
                ])
              
                setIngresos(vectorResultados[0].data)
                setDiezmos(vectorResultados[1].data)
                setBuscando(false)
            }catch(err){
                setBuscando(false)
                setHuboError(true)
            }
        }
        
        buscarIngresos()
    },[])

    useEffect(()=>{
        if (ingresos.length>0 && diezmos.length>0){

            const registros_sin_null = ingresos.filter(item=>item.monto!=null && item.comprobante!=">>>>")
            const nueva_data = registros_sin_null.map(item=>{return {...item,monto:parseFloat(item.monto.replace(",",""))}})

            const suma = nueva_data.reduce((ac,item)=>{
                return ac + item.monto
            },0)

            setTotal(suma)

            const meses_diezmados = diezmos.filter(item=>Number(item.diezmo)>0).length
            let prom;

            if (meses_diezmados>0){
                prom = suma / meses_diezmados
            }else{
                prom = suma / 1
            }
            setPromedio(prom)

        }else{
            setTotal(0)
        }
    },[ingresos,diezmos])

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los ingresos...</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando ingresos...</span></div></Main>
    };

    if (ingresos.length==0){
        return <div className="listado-al text-center" >
                <span className="p-4 color-tomato inline-block-1 text-large">No se encontraron ingresos en el último año</span>
            </div> 
       
    }

    return(
        <> 
        <Listado ingresos={ingresos} total={total} promedio={promedio}/>
        </>
    )
}

function Listado({ingresos,total,promedio}){

    return (
    <div className="text-center mb-4 ml-4">
        <div className="text-center text-smaller fw-100 flex f-row items-center">
            <span className="p-4 color-tomato inline-block-1 text-large">{`Ingresos del último año : $ ${total.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`}</span>
            <span className="p-4 color-tomato inline-block-1 text-small">{`Promedio : $ ${promedio.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`}</span>
        </div>
        {ingresos
            .map(item=><div key={uuidv4()}>
            <div className="listado-al" >
                <FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/>
                <span title="Fecha" className='filas-lista-nw ti-fecha'>
                    {item.fecha}
                </span>
                <span title="Comprobante" className='filas-lista-nw ti-detalle'>
                    {item.comprobante}
                </span>
                <span title="Detalle" className='filas-lista-nw ti-provincia text-left'>
                    {item.det_rc}
                </span>
                <span title="Monto" className='filas-lista-nw ti-monto'>
                    {item.monto}
                </span>
            </div> 
            </div>)
        }
    </div>
    )
}
