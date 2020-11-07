import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faAngleDoubleRight, faAngleDoubleLeft,faPlusCircle, faMobile, faEnvelopeOpenText, faEdit } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare, faMinusSquare, faUser,faWindowClose  } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import {useAlumno} from '../Context/contextoGlobal';
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';

export default function PiePagina({children}){

    return (
        <div className="ap-2">
            {children}
        </div>
        

    )
}



