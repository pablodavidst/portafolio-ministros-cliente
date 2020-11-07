import React, { useState, useEffect } from 'react';
import { Link, withRouter,NavLink  } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyCheckAlt, faIdCard, faSearchDollar, faChurch, faPowerOff, faBars, faCalendarAlt as calendar2, faClone,faUsers, faUserTie, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import {faCompass, faChartBar, faUser, faUserCircle, faCaretSquareUp, faCaretSquareDown, faCalendarAlt,faWindowClose,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import useModal from '../hooks/useModal';

export default function Nav({ usuario, logout, cuatrimestreActivo }) {

  const {toggle, isShowing } = useModal();
  const [componenteModal,setComponenteModal]= useState(null)
  const [titulo,setTitulo]= useState('')
  const [abrirMenuVertical,setAbrirMenuVertical]= useState(false)


  const toggleMenuVertical = ()=>{
    setAbrirMenuVertical(!abrirMenuVertical)
  }

  return (
    <div>
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
                      setComponenteModal={setComponenteModal} 
                      setTitulo={setTitulo}
                      abrirMenuVertical={abrirMenuVertical} 
                      toggleMenuVertical={toggleMenuVertical} />}
      </ul>
      {/*usuario && <p className="text-right text-larger mr-4 mt-2 fw-100 w-300 ml-auto">Sesión de {usuario.nombre} {usuario.id_region ? `Región ${usuario.id_region}` : ``}</p>*/}
    </nav>
    </div>

  );
}

function LoginRoutes({ usuario, 
                        logout, 
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


