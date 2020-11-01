import React from 'react';
import ReactDOM from 'react-dom';
import '../modal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-regular-svg-icons';

const estiloDefault = {width:'500px'}
const estiloWDefault = {}

const Modal = ({ isShowing, hide, children, titulo, estilo, estiloWrapper,closeOnclickOutside }) => isShowing ? ReactDOM.createPortal(
    <React.Fragment>
        <div className="modal-overlay"/>
        <div className="modal-wrapper" id={'mwp'} onClick={(e)=>cerrar(e,hide,closeOnclickOutside)} aria-modal aria-hidden tabIndex={-1} role="dialog" style={!estiloWrapper ? estiloWDefault : estiloWrapper }>
            <div className="modal" onClick={(e)=>{stopClick(e)}} style={!estilo ? estiloDefault : estilo }>
                <div className={titulo ? "modal-header border-bottom-solid-light" : ""}>
                <div className="px-6 py-4">
                        <div id="titulo-modal" className={titulo ? "mb-2 cabecera rder-bottom-solid-light" : "hide"}>{titulo ? titulo : ''}</div>
                        <p className="text-gray-700 text-base">
                            
                        </p>
                    </div> 
                    <button onClick={hide} data-dismiss="modal" aria-label="Close" title="Cancelar" className="absolute botonAbm"><FontAwesomeIcon icon={faWindowClose}/></button> 
                </div>
                    {children}
            </div>
        </div>
    </React.Fragment>, document.body
) : null;

export default Modal;

function cerrar(e,hide,closeOnclickOutside){
    e.preventDefault()
    if (e.target.id="mwp" && closeOnclickOutside){
        hide()
    }
}

function stopClick(e){
    e.stopPropagation();
}