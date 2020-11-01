import React, { useState, useEffect } from 'react';
import { Link, withRouter,NavLink  } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyCheckAlt, faIdCard, faSearchDollar, faChurch, faPowerOff, faBars, faCalendarAlt as calendar2, faClone,faUsers, faUserTie, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import {faCompass, faChartBar, faUser, faUserCircle, faCaretSquareUp, faCaretSquareDown, faCalendarAlt,faWindowClose,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import {useAlumno} from '../Context/alumnoContext';
import useModal from '../hooks/useModal';
import Modal from './Modal';
import Busqueda from './Busqueda'
import Aulas from './Aulas'
import Instrumentos from './Instrumentos'
import Materias from './Materias'
import Cuatrimestres from './Cuatrimestres'
import imagen from '../logoemc.PNG';

export default function Nav({ usuario, logout, cuatrimestreActivo }) {

  const {mostrarBusquedaAlumnos, habilitarBusquedaAlumnos,desHabilitarBusquedaAlumnos} = useAlumno();
  const {toggle, isShowing } = useModal();
  const [componenteModal,setComponenteModal]= useState(null)
  const [titulo,setTitulo]= useState('')
  const [abrirMenuVertical,setAbrirMenuVertical]= useState(false)
  const [mostrar, setMostrar] = useState(false);


  const toggleMenuVertical = ()=>{
    setAbrirMenuVertical(!abrirMenuVertical)
  }

  const switchVistaBusquedaAlumnos = ()=>{

    if (mostrarBusquedaAlumnos){
          desHabilitarBusquedaAlumnos();
      }else{
         habilitarBusquedaAlumnos()
      }
  }

const switchMostrar=()=>{
    if (mostrar){
        setMostrar(false)
    }else{
        setMostrar(true)
    }
}

const mostrarMenuLateral=()=>{
    setMostrar(true)
}

const noMostrarMenuLateral=()=>{
  setMostrar(false)
}

  useEffect(()=>{
    console.log('se carga el nav')
  },[cuatrimestreActivo])

  

  return (
    <div>
    {usuario && <div onMouseEnter={mostrarMenuLateral} onMouseLeave={noMostrarMenuLateral}  className={mostrar ? "flex f-row wrapper_nav mostrar" : "flex f-row wrapper_nav nomostrar_nav"} onClick={switchMostrar}>
        <div id="slide2">
            <span onClick={switchMostrar} className="cursor-pointer mr-2 ml-2 color-tomato flex justify-content-end" >
                        {/*{ mostrar && <FontAwesomeIcon title="Cerrar" className="mostrar-menu-lateral" icon={faWindowClose}/>}*/}
                        { !mostrar && <FontAwesomeIcon title="Otras operaciones" className="mostrar-menu-lateral_nav" icon={faBars}/>}
            </span>  
            {/*<MenuVertical setComponenteModal={setComponenteModal} toggle={toggle} setTitulo={setTitulo} toggleMenuVertical={toggleMenuVertical} logout={logout} />*/}
        </div>
    </div>}
    <nav className="Nav">
      <ul className="Nav__links">
       {!usuario && <li>
          <Link className="razon-social" to="/">
            Sistema remoto regional - UAD 
          </Link>
       </li>}
        {usuario && <li className="Nav__link-push fw-400 text-smaller"><p className="text-xsmall mb-2">Sesión de {usuario.nombre}</p></li>}
        {usuario && <LoginRoutes toggle={toggle} 
                      usuario={usuario} 
                      logout={logout} 
                      switchVistaBusquedaAlumnos={switchVistaBusquedaAlumnos} 
                      setComponenteModal={setComponenteModal} 
                      setTitulo={setTitulo}
                      abrirMenuVertical={abrirMenuVertical} 
                      toggleMenuVertical={toggleMenuVertical} />}
      </ul>
      {/*usuario && <p className="text-right text-larger mr-4 mt-2 fw-100 w-300 ml-auto">Sesión de {usuario.nombre} {usuario.id_region ? `Región ${usuario.id_region}` : ``}</p>*/}
    </nav>
    { isShowing && <Modal hide={toggle} isShowing={isShowing} titulo={titulo} estiloWrapper={{background:'white'}}>
                           <SeleccionarComponenteModal componente={componenteModal}
                           />
                    </Modal>}      
    
    </div>

  );
}

function LoginRoutes({ usuario, 
                        logout, 
                        switchVistaBusquedaAlumnos,
                        toggle, 
                        setComponenteModal, 
                        setTitulo,
                        abrirMenuVertical,
                        toggleMenuVertical }) {

  const estilo_prueba = {color:'white',background:'tomato',padding:'3px'}

  return (
    <>
      
      <li title="Ministros" className="Nav__link-push">
        <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/regiones/ministros">
            <FontAwesomeIcon icon={faUsers} />
            <p className="text-large color-63 text-center">Ministros</p>
          </NavLink>
        </div>
       
      </li>   
      <li title="Iglesias" className="Nav__link-push">
        <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/regiones/iglesias">
          
            <FontAwesomeIcon icon={faChurch}/>
            <p className="text-large color-63 text-center">Iglesias</p>
          </NavLink>
        </div>
       
      </li>      
      {/*<li title="Meses diezmados" className="Nav__link-push">
        <div className="text-center"> 
          <Link className="Nav__link"  to="/region/diezmos">
            <FontAwesomeIcon icon={faMoneyCheckAlt} />
            <p className="text-small color-63 text-center">Meses diezmados</p>
          </Link>
        </div>
       
      </li> */} 
      <li title="Credenciales" className="Nav__link-push">
        <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/regiones/credenciales">
            <FontAwesomeIcon icon={faIdCard} />
            <p className="text-large color-63 text-center">Credenciales</p>
          </NavLink>
        </div>
       
      </li>  
      <li title="Ingresos" className="Nav__link-push">
        <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/regiones/ingresos">
            <FontAwesomeIcon icon={faSearchDollar} />
            <p className="text-large color-63 text-center">Ingresos</p>
          </NavLink>
        </div>
       
      </li>  
      <li title="Estadísticas" className="Nav__link-push">
        <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/regiones/estadisticas">
            <FontAwesomeIcon icon={faChartBar} />
            <p className="text-large color-63 text-center">Estadísticas</p>
          </NavLink>
        </div>
       
      </li> 
      {/*<li title="Ingresos" className="Nav__link-push">
        <div className="text-center"> 
          <Link className="Nav__link"  to="/region/ingresos">
            <FontAwesomeIcon icon={faSearchDollar} />
            <p className="text-small color-63 text-center">Ingresos</p>
          </Link>
        </div>
       
      </li> */ }  
      
           
      {/*<li className="Nav__link-push relative listado-al">
        <div>
          <span className="listado-al" title="Búsqueda y edición de cuatrimestres, aulas, instrumentos y materias" onClick={()=>toggleMenuVertical()} className="Nav__link">
            <FontAwesomeIcon className={abrirMenuVertical ? 'text-#e17851' : ''} icon={ !abrirMenuVertical ? faCaretSquareDown : faCaretSquareUp} />
          </span>
        </div>
      { abrirMenuVertical && <MenuVertical setComponenteModal={setComponenteModal} toggle={toggle} setTitulo={setTitulo} toggleMenuVertical={toggleMenuVertical} /> }
      </li>*/ }

      <li title="Abrir la aplicación en una nueva pestaña" className="Nav__link-push">
        <div className="text-center"> 
          <Link className="Nav__link" to="/" target="_blank">
            <FontAwesomeIcon icon={faClone} />
            <p className="text-large color-63 text-center">Nueva ventana</p>
          </Link>
        </div>
      </li>
      <li className="Nav__link-push">

      <button className="Perfil__boton-logout" title="Salir" onClick={logout}>
          <FontAwesomeIcon icon={faPowerOff} />
          <span className="text-large color-63 block">Salir</span>
        </button>
      </li>
    
    
    </>
  );
}

function MenuVertical({setComponenteModal, toggle, setTitulo,toggleMenuVertical, logout}){
  return(
<div className="menu-vertical-nav" onMouseLeave={toggleMenuVertical}>
        <ul className="ul-ml-n20">

        <li title="Obreros" className="listado-al p-2">
            <div className="text-center"> 
              <Link className="Nav__link"  to="/regiones/ministros">
                <FontAwesomeIcon icon={faUsers} />
                <p className="text-large color-63 text-center">Ministros</p>
              </Link>
            </div>
        </li>   
        <li title="Iglesias" className="listado-al p-2">
            <div className="text-center"> 
              <Link className="Nav__link"  to="/regiones/iglesias">
                <FontAwesomeIcon icon={faChurch} />
                <p className="text-large color-63 text-center">Iglesias</p>
              </Link>
            </div>
        </li>   
        {/*<li title="Meses diezmados" className="listado-al p-2">
            <div className="text-center"> 
              <Link className="Nav__link"  to="/region/diezmos">
                <FontAwesomeIcon icon={faMoneyCheckAlt} />
                <p className="text-small color-63 text-center">Meses diezmados</p>
              </Link>
            </div>
        </li>*/ }   
        <li title="Credenciales" className="listado-al p-2">
            <div className="text-center"> 
              <Link className="Nav__link"  to="/regiones/credenciales">
                <FontAwesomeIcon icon={faIdCard} />
                <p className="text-large color-63 text-center">Credenciales</p>
              </Link>
            </div>
        </li>
        <li title="Ingresos" className="listado-al p-2">
            <div className="text-center"> 
              <Link className="Nav__link"  to="/regiones/ingresos">
                <FontAwesomeIcon icon={faSearchDollar} />
                <p className="text-large color-63 text-center">Ingresos</p>
              </Link>
            </div>
        </li>            
        {/*<li title="Ingresos" className="listado-al p-2">
            <div className="text-center"> 
              <Link className="Nav__link"  to="/region/ingresos">
                <FontAwesomeIcon icon={faSearchDollar} />
                <p className="text-small color-63 text-center">Ingresos</p>
              </Link>
            </div>
        </li> */}  
     
        <li title="Salir" className="listado-al p-2">
            <div className="text-center"> 
                <button className="Perfil__boton-logout mr-auto ml-auto" title="Salir" onClick={logout}>
                  <FontAwesomeIcon icon={faPowerOff} />
                  <span className="text-large color-63 block">Salir</span>
                </button>
            </div>
        </li>
        
        { /* <li title="Listado y edición de cuatrimestres" className="listado-al p-2" onClick={()=>{setComponenteModal('cuatrimestres')
                          setTitulo('Listado de cuatrimestres')
                           toggle();toggleMenuVertical()}}>Cuatrimestres
          </li>
          <li title="Listado y edición de aulas" className="listado-al  p-2" onClick={()=>{setComponenteModal('aulas')
                            setTitulo('Listado de aulas')
                            toggle();toggleMenuVertical()}}>Aulas
          </li>
          
          <li title="Listado y edición de instrumentos" className="listado-al  p-2" onClick={()=>{setComponenteModal('instrumentos')
                            setTitulo('Listado de instrumentos')
                            toggle();toggleMenuVertical()}}>Instrumentos
          </li>
          <li title="Listado y edición de materias" className="listado-al  p-2" onClick={()=>{setComponenteModal('materias')
                          setTitulo('Listado de materias')
                          toggle();toggleMenuVertical()}}>Materias
          </li>
        */}
        </ul>
    </div>

  )
}

function SeleccionarComponenteModal({componente}){
 
  switch(componente){
    case  'aulas' : return <Aulas/>
    break;
    case 'materias' : return <Materias/>
    break;
    case 'instrumentos' : return <Instrumentos/>
    break;
    case 'cuatrimestres' : return <Cuatrimestres/>
    break;
    default: return null
  }
}