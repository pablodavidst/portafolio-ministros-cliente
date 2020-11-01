import moment from 'moment';

export function fechaActual(){
    const fecha = new moment();
    return fecha
}

export function compararFechas(fecha){
    const fechaActual = new moment();
    const fechaRegistro = new moment(fecha)

    const diferencia = fechaActual.diff(fechaRegistro,'seconds')
    
    return diferencia
}

export function obtenerFechaDiamenosN(n){
    const hoy = new moment()
    const startdate = hoy.subtract(n, 'days');
    const desglose = {dia:startdate.date(),mes:startdate.month()+1,anio:startdate.year()}
    return {diamenosn:startdate.format('DD-MM-YYYY'),desglose}
}