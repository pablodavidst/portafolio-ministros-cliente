import React, { useState, useEffect } from 'react';
import { BrowserRouter , Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Nav from './componentes/Nav';
import Main from './componentes/Main';
import Personal from './Vistas/Personal';
import Login from './Vistas/Login';
import Loading from './componentes/Loading';
import Error from './componentes/Error';
import {AlumnoProvider, useAlumno } from './Context/alumnoContext'; // importo proveedor de contexto y luego envuelvo a la aplicación en el mismo
import Axios from 'axios';
import {setToken, deleteToken, getToken, initAxiosInterceptors} from './Helpers/auth-helpers'

initAxiosInterceptors(); // esto se llama apenas se ejecute el archivo principal antes de
                         // cargar la función app para que se active el proceso de analizar
                          // cada request de entrada para ver si hay un error de autorización
                          // y cada request de salida para añadirle el token si es que existe
                          // se añade al header para que el servidor lo reciba en el request y
                          // lo autorice para las rutas protegidas
function App() {

  const [usuario,setUsuario] = useState(null) // es estado inicial del usuario es null o sea no hay usuario
  const [cargandoUsuario,setCargandoUsuario]=useState(true);
  const [cargandoCuatrimestre,setCargandoCuatrimestre]=useState(false);
  const [error,setError] = useState(null);
  const {alumno,
        reinicializarAlumno,
        mensaje,
        reinicializarMensaje,
        cuatrimestreActivo, cambiarCuatrimestreActivo,
        setearUsuario,
        contadorOperacionesGlobales} = useAlumno();

  useEffect(()=>{

    async function cargarUsuario(){

        if(!getToken()){
            setCargandoUsuario(false);
            setCargandoCuatrimestre(false); // si no hay token debe re loguearse
            return;
        }else{
            try{
                const { data } = await Axios.get('/api/usuarios/whoami');
                setUsuario(data.usuario);
                setearUsuario(data.usuario); // para exponerlo en el context
                setCargandoUsuario(false);
            }catch(error){
                console.log(error)
            }
        }
    }
    cargarUsuario();
  },[]); // el segundo parametro [] se pasa para que se ejecute 1 sola vez

  /*useEffect(()=>{

    const buscarCuatrimestres = async ()=>{
      setCargandoCuatrimestre(true);
      try{
        const {data} = await Axios.get('/api/cursos/cuatrimestres/all');

        const cuatrimestre_activo = data.filter(item=>item.activo===true)

        cambiarCuatrimestreActivo(cuatrimestre_activo[0])

        setCargandoCuatrimestre(false);

      }catch(err){
         console.log(error)
         setCargandoCuatrimestre(false);
      }
   }

   if (usuario){
      buscarCuatrimestres()
    }

  },[usuario,contadorOperacionesGlobales])
*/
  function logout(){
      setUsuario(null);
      reinicializarAlumno()
      deleteToken();
  }

  function mostrarError(error){
      setError(error)
  };

  function esconderError(){
      setError(null)
  }

  function esconderMensaje(){
    setError(null)
}

  async function login(username,password){
    try{
      const { data } = await Axios.post( // le digo que espere a que Axios se ejecute
        'api/usuarios/login',{username,password});

        setUsuario(data.usuario);
        setToken(data.token)
        setError(null)
    }catch(err){

        if(err.response.data.message){
          setError(err.response.data.message)
        }else if (err.response.data) {
          setError(err.response.data)
        }else{
          setError(err.response)
        }
    }

  }

  if (cargandoUsuario){
    return <Main center><Loading/><span className="cargando">Cargando usuario...</span></Main>
  };


  if (cargandoCuatrimestre){
    return <Main center><Loading/><span className="cargando">Cargando cuatrimestre...</span></Main>
  };

  return (
    <BrowserRouter>
      <Nav usuario = {usuario} logout={logout} cuatrimestreActivo={cuatrimestreActivo}/>
      {/*usuario && <BuscarAlumnos/>*/}
  {/* <LinkReferencias/> */}
      <Error mensaje={error} esconderError={esconderError}/>
      <Error mensaje={mensaje} esconderError={reinicializarMensaje}/>

        { usuario ?
          <div className= { alumno.id ?  "flex flex-row mt-80" : "flex flex-row mt-80" }>
                  <LoginRoutes mostrarError={mostrarError}/>

          </div>
              :
          <div className="Main center">
            <LogoutRoutes login={login} mostrarError={mostrarError} error={error}/>
            <Redirect to={login}/>
          </div>
         }




      { /*<div>{JSON.stringify(usuario)}</div> */}
    </BrowserRouter>
  );
}

// export default App;
// envuelvo a la aplicación con un proveedor de contexto para que la usen los componentes
// hijos.
export default ()=>
<AlumnoProvider>
    <App></App>
</AlumnoProvider>

function LoginRoutes({mostrarError, logout}){
  return (
    <Switch>

{/*       <Route exact path="/cursos" logout={logout} component={()=><Cursos/>} />
          <Route exact path="/" logout={logout} component={()=><Cursos/>} default />
      Reescribí las rutas de la vista cursos reemplazando component por render
      para evitar que se renderice cada vez que cambia el componente buscarAlumnos al
      cambiar su estado. Si lo dejaba como component se renderizaba también el componente Cursos
  */
}
        <Route default exact path="/personal" render={props => (<Personal {...props}/>)}/>
{/*<Route path="/pepe/:id" component={()=><Prueba objeto={{id:50,nombre:'pepe'}}/>} /> */ }
  </Switch>
  )
}

function LogoutRoutes({login, mostrarError, error}){
  console.log(login)
  return (
    <Switch>
        <Route  exact path="/"
                render={props =><Login {...props}
                login={login} mostrarError={mostrarError} error={error}/>} default/>
        <Route  path="/login"
                render={props =><Login {...props}
                login={login} mostrarError={mostrarError} error={error}/>} default/>
  </Switch>
  )
}
