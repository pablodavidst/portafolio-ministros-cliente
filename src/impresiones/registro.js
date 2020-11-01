import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Axios from 'axios';
import {_imagenLogo} from '../imagenesBase64/logo'
import Swal from 'sweetalert2';


    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    var docDefinition = { content: 'This is an sample PDF printed with pdfMake' };

    export async function imprimir(individual,curso,pcuatrimestre){
        //pdfMake.createPdf(docDefinition).open();
        Swal.fire({
            html: 'Buscando...',
            onBeforeOpen: () => {
                Swal.showLoading()
            },
        })
        

        const ObjetoCurso = {id:curso.nro_curso,
                            diahora:curso.DiaHora,
                            descripcion:curso.Materia,
                            profesor:curso.Profesor,
                            aula:curso.Aula}

        try{
            const prueba = await buscarAlumnosDeUnCurso(ObjetoCurso, individual,pcuatrimestre);

            Swal.close();

        }catch(err){

            const mensaje_html = `<p>Hubo un error al imprimir el registro</p><p>${err}</p>`

            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })
        }
    }

    async function crearVectorDias(dia) {

    //var vector_de_fechas = await this.buscarCuatrimestre(dia) // originalmente recibía solo un vector de días ahora recibe un objeto con 2 vectores uno de días y otro de meses
    
    var objetoDevueltoPorFuncion = await buscarCuatrimestre(dia) // agrego el await para que no siga hasta que no reciba el vector que envía la función...


    //{ text: 'campo 1 de 5 columnas', colSpan: 5 }, { }


    var nuevo_vector_meses = [];
    var mes=0;

    objetoDevueltoPorFuncion.vector_de_meses.forEach((item,index)=>{
        if (mes == item) {
            nuevo_vector_meses.push({})
        } else {
            var mes_piloto = item;

            var columnasOcupadas = objetoDevueltoPorFuncion.vector_de_meses.filter(item => item == mes_piloto).length;

            var mesTexto = obtenerMes(mes_piloto);

            nuevo_vector_meses.push({ text: mesTexto, colSpan: columnasOcupadas })
            mes = item;
        }
    })

    // Ejemplo de array de meses generado ( esun array que sirve para crear una cabecera de meses que sea compatible con pdfmake)

    //{ text: "AGO", colSpan: 4 }
    //1: { }
    //2: { }
    //3: { }
    //4: { text: "SEP", colSpan: 4 }
    //5: { }
    //6: { }
    //7: { }
    //8: { text: "OCT", colSpan: 4 }
    //9: { }
    //10: { }
    //11: { }
    //12: { text: "NOV", colSpan: 5 }
    //13: { }
    //14: { }
    //15: { }
    //16: { }
    //17: { text: "DIC", colSpan: 2 }
    //18: { }

    //objetoDevueltoPorFuncion.vector_de_meses.map((item,index)=>{
        
    //    })

    nuevo_vector_meses.push({ text: "NOTAS", colSpan: 5 }, {}, {}, {}, {}, {}) //agrego los campos de notas de atrás

    nuevo_vector_meses.unshift({ text: "", colSpan: 2},{}) //agrego los campos de posición y alumno de adelante

    console.log('nuevo_vector_meses', nuevo_vector_meses)

    return { vector_de_dias: objetoDevueltoPorFuncion.vector_de_fechas, vector_de_meses: nuevo_vector_meses}

}


function obtenerMes(mes) {
    switch (mes) {

        case 1: return 'ENE'; break
        case 2: return 'FEB'; break
        case 3: return 'MAR'; break
        case 4: return 'ABR'; break
        case 5: return 'MAY'; break
        case 6: return 'JUN'; break
        case 7: return 'JUL'; break
        case 8: return 'AGO'; break
        case 9: return 'SEP'; break
        case 10: return 'OCT'; break
        case 11: return 'NOV'; break
        default: return 'DIC';
    }
}

async function buscarCuatrimestre(dia) {

    var vector_de_fechas = [];
    var vector_de_meses = []; // armo un vector de meses para luego transformarlo en un vector que vamos a usar como cabecera de meses ajustando dinamicamente el colSpan según cuantas columnas debe ocupar ese mes...el primer paso es colocar el Nro de mes en el vector

    const aux = await Axios.get(`/api/cursos/cuatrimestre/46`);
    const cuatrimestre_json = aux.data;

    console.log("flauta",cuatrimestre_json)
    //const cuatrimestre_obj_json = await cuatrimestre_json.json().then(
    //    (cuatrimestre_obj_json) => {

            var x = cuatrimestre_json[0];

            //var fechaDesde = new Date(parseInt(x.f_desde.substr(6)));
            //var fechaHasta = new Date(parseInt(x.f_hasta.substr(6)));
            var fechaDesde = new Date(x.f_desde);
            var fechaHasta = new Date(x.f_hasta);

            console.log("las fechas del cuatrimestre",fechaDesde + ' /// ' + fechaHasta)


            var comienzo = new Date(fechaDesde.getFullYear(), fechaDesde.getMonth(), fechaDesde.getDate());
            var fin = new Date(fechaHasta.getFullYear(), fechaHasta.getMonth(), fechaHasta.getDate());

            if (comienzo.getDay() == dia) {
                //vector_de_fechas.push(comienzo.getDate() + '/' + (comienzo.getMonth() + 1)) // originalmente guardaba dia/mes ahora guardo solo día
                vector_de_fechas.push(comienzo.getDate())
                vector_de_meses.push(comienzo.getMonth() + 1)
            }

            while (fin.getTime() > comienzo.getTime()) {
                comienzo.setDate(comienzo.getDate() + 1);

                if (comienzo.getDay() == dia) {
                //vector_de_fechas.push(comienzo.getDate() + '/' + (comienzo.getMonth() + 1)) // originalmente guardaba dia/mes ahora guardo solo día
                    vector_de_fechas.push(comienzo.getDate())
                    vector_de_meses.push(comienzo.getMonth() + 1) // el vector de meses lo voy a transformar en un vector que represente una cabecera del tipo... [Enero       ][Febrero     ]...etc cada mes ocupará N columnas según corresopnda
                }
            }


    //    }
   // )

    //return vector_de_fechas // originalmente devolvía solo un vector con N elementos dia/mes ahora devuelvo un objeto con 2 vectores uno de días y otro de meses
    return {vector_de_fechas: vector_de_fechas, vector_de_meses: vector_de_meses}

}


async function buscarAlumnosDeUnCurso(curso,individual,pcuatrimestre) {

    var nro_curso = curso.id;

    if (!curso.dia) {
        curso.dia = obtenerDia(curso.diahora)
    };

    var vector_alumnos_con_pocos_campos_objeto = [];
    const aux = await Axios.get(`/api/cursos/alumnos/${nro_curso}`);
    const alumnos_obj_js = aux.data;

    console.log("alumnos_json",alumnos_obj_js)
   // const alumnos_obj_js = await alumnos_json.data.json();

    // el json trae un array de objetos con la información de los N alumnos del curso

    //[{periodo:46, descripcion: 'regular', nota:null, nombre:"Recagno, Bruno",instrumentos:'Batería'},
    //[{periodo:46, descripcion: 'libre', nota:null, nombre:"Perez, Juan",instrumentos:'Saxo'},
    //[{periodo:46, descripcion: 'recuperatorio', nota:null, nombre:"Lopez, Gabriela",instrumentos:'Piano'}]

    //COMIENZO C1 antes si no tenía alumnos mostraba un mensaje de alerta y no imprimia el registro, ahora creo un registro vacío con 10 posiciones y se imprime igual aunque sin alumnos

    //if (alumnos_obj_js.length == 0) {
    //    Swal.fire({
    //        timer: 2000,
    //        html: 'El curso # ' + curso.id + ' , ' + curso.descripcion + ' no tiene alumnos inscriptos...'
    //    })
        
    //    this.cursosSeleccionados[indice].sinAlumnos=true;
    //    return
    //}

    //vector_alumnos_con_pocos_campos_objeto = alumnos_obj_js.map((item, index) => { return { pos: index + 1, nombre: item.nombre + '\n' + item.instrumentos } }); // transformo los campos originales de cada objeto del array en un array de objetos con propiedades específicas


    if (alumnos_obj_js.length == 0) {
        for (var i = 0; i < 14; i++) {
            //vector_alumnos_con_pocos_campos_objeto.push({ pos: i + 1, nombre: '.' + '\n .'})
            vector_alumnos_con_pocos_campos_objeto.push({ pos: i + 1, nombre: {text: '.' + '\n .', style:'blanco'}}) // creo posiciones vacias con 2 puntos para ajustar el alto aunque seguramente se puede hacer con el estilo, le doy el estilo blanco para que tome el color blanco para que no se vean los 2 puntos, cuando haya mas tiempo habría que reemplazar los 2 puntos por un alto en el estilo...

        }
    } else if (alumnos_obj_js[0].tipo=='INDIVIDUAL') {
        vector_alumnos_con_pocos_campos_objeto = alumnos_obj_js.map((item, index) => { return { pos: item.comienzo, nombre: item.nombre + '\n' + item.instrumentos } }); // transformo los campos originales de cada objeto del array en un array de objetos con propiedades específicas
    } else {
        vector_alumnos_con_pocos_campos_objeto = alumnos_obj_js.map((item, index) => { return { pos: index + 1, nombre: item.nombre + '\n' + item.instrumentos } }); // transformo los campos originales de cada objeto del array en un array de objetos con propiedades específicas
    }


    //FINAL C1 

    // de todos los campos me quedo con nombre, id_alumno e instrumentos, para ello uso la función .map

    //[
    //    0: { nombre: "(4211)Recagno, Bruno", instrumentos: "Batería" }
    //    1: { nombre: "(3576)Marcori, Ivan", instrumentos: "Batería" }
    //    2: { nombre: "(3852)Aguilar, Melisa", instrumentos: "Batería" }
    //]

    // al vector le agrego una cabecera 




    vector_alumnos_con_pocos_campos_objeto.unshift(['', { text: 'Alumno', style: 'tableHeader', alignment: 'center'}])

    //vector_alumnos_con_pocos_campos_objeto.unshift([{ text: 'Alumno', style: 'tableHeader', alignment: 'center', colSpan: 5 }])


    // el vector tiene N alumnos pero sus datos están estructurados como un objeto, voy a transformar cada item en un array con la función .map y la función Object.Values
    console.log(vector_alumnos_con_pocos_campos_objeto)
    var vector_de_alumnos_vector = vector_alumnos_con_pocos_campos_objeto.map(item => { return Object.values(item) }) // transformo el array de objetos en un array de arrays para que ses pueda usar en el cuerpo de pdf


    //[
    //    0: ["(4211)Recagno, Bruno", "Batería"]
    //    1: ["(3576)Marcori, Ivan", "Batería" ]
    //    2: ["(3852)Aguilar, Melisa", "Batería" ]
    //]


    // luego creamos un vector de dias correspondiente a las fechas de todos los días de cursada entre la fecha de inicio y fin de cuatrimestre, habrá N fechas
    // el método crearvectorDias lo hice asincrònico agregando la directiva async para que me devuelva una promesa automáticamente así puedo usar el .then para continuar con la operación una vez que esté creado el vector de días

    // originalmente me devolvía un vector, ahora me va a devolver un objeto formado por 2 vectores, el primero es de días, el segundo es de meses...

    crearVectorDias(curso.dia).then(objetoEnviadoPorFuncion => {

        // agrego 4 columnas de NOTAS a la derecha de las columnas de fechas.

        var vector_de_dias = [];

        vector_de_dias = objetoEnviadoPorFuncion.vector_de_dias;

        vector_de_dias.push('','','','','','') // agrego las columnas de notas

        var vector_celdas_vacias = vector_de_dias.map(item => '');


        vector_de_alumnos_vector.forEach(
            (elemento, indice) => {
                if (indice == 0) {
                    elemento.push(...vector_de_dias) // desestructuro el array para que inserte solo su contenido y no su contenedor, quiero los items solamente como elementos independientes y no un array que contiene esos elementos
                } else if (indice>0) {
                    elemento.push(...vector_celdas_vacias) // desestructuro el array para que inserte solo su contenido y no su contenedor, quiero los items solamente como elementos independientes y no un array que contiene esos elementos
                }
            }

        );

        //vector_de_alumnos_vector.unshift([{ text: 'Alumno', style: 'tableHeader', alignment: 'center', colSpan: 24 },'hola'])


        var cant_columnas = vector_de_alumnos_vector[1].length;

        var posicion_col_notas = cant_columnas - 5;

        var vector_ancho_columnas = vector_de_alumnos_vector[1].map((item,index ) => {
        
            if (index == 1) {
             return 120   
            }
            else if (index < 2) {
                return 'auto'                               // ancho de las columnas 0 y 1 es decir posición y alumno
            } else if (index < posicion_col_notas)
                {
                return 15                                   // ancho de las columnas de días para tomar asistencia
            } else {
                return 12                                   // ancho de las columnas de notas
                }
            })

        // lògica de los span de columnas suponiendo que haya 25 columnas siempre que un campo ocupe N columnas, luego a su derecha debe haber N-1 columnas vacías, contando a si mimsma la columna que tiene el colSpan, es decir que en total debe haber la misma cantidad de objetos columna. 
        // Ejemplo voy a agregar a la posición 0 una fila en la que el primer campo ocupa 5 columnas y el segundo campo ocupa 3 columnas

        //vector_de_alumnos_vector.splice(0, 0, [{ text: 'campo 1 de 5 columnas', colSpan: 5 }, {}, {}, {}, {}, { text: 'campo 2 de 3 cols', colSpan: 3 }, {}, {}, { text: 'Alumno' }, { text: 'Alumno' }
        //    , { text: 'Alumno' }, { text: 'Alumno' }, { text: 'Alumno' }, { text: 'Alumno' }, { text: 'Alumno' }, { text: 'campo de 6 columnas',colSpan:6 }, {}, {}, {}, {}, {}, { text: 'Alumno' }, { text: 'Alumno' }, { text: 'Alumno' }, { text: 'Alumno' }])

        // explicación: el primer campo ocupa 5 columnas por lo tanto reemplazo 4 columnas a su derecha por un objeto vacío ... { text: 'campo 1 de 5 columnas', colSpan: 5 }, {}, {}, {}, {},...
        // el segundo campo ocupa 3 columnas por lo tanto reemplazo 2 columnas a su derecha por un objeto vacío... { text: 'campo 2 de 3 cols', colSpan: 3 }, {}, {},....
        // el tercer campo ocupa 6 columnas por lo tanto reemplazo 5 columnas a su derecha por un objeto vacìo... { text: 'campo de 6 columnas',colSpan:6 }, {}, {}, {}, {}, {},...
        // contándose a si misma la columna con texto + las columnas vacías a la derecha deben sumar el colSpan definido en la columna que tiene el texto...

        //vector_cabecera_meses = vector_de_alumnos_vector[0].map((item,index)=>{
            

        //})

        vector_de_alumnos_vector.splice(0, 0, objetoEnviadoPorFuncion.vector_de_meses)

        console.log(vector_de_alumnos_vector)

       setTimeout(
            () => {
                generarRegistros(vector_de_alumnos_vector, curso, individual, vector_ancho_columnas,pcuatrimestre);
            }, 200
        )

    }
    );


}


   function generarRegistros(vector_alumnos, curso, individual, vector_ancho_columnas,pcuatrimestre) {

        var docDefinition = {
           pageOrientation: 'landscape',
           content: [

               {
                   columns: [
                       {
                           image: _imagenLogo,
                           width: 200,
                       },
                       {
                           text: `${curso.descripcion} (# ${curso.id})`, margin: [100, 25], style: 'titulo'
                       },
                   ]
               },

               

               {
                   columns: [

                       {
                           type: 'none',
                           ol: [
                               {
                                   margin: [0, 5],

                                   columns: [
                                       { text: `Profesor:`, decoration: 'underline', width: 60, bold: true }, { text: `${curso.profesor}`, style: '' },
                                   ]
                               },
                               {
                                   margin: [0, 5],

                                   columns: [
                                       { text: `Día y hora:`, decoration: 'underline', width: 60, bold: true }, { text: `${curso.diahora}`, style: '' },
                                   ]
                               },]
                       },

                       {
                           type: 'none',
                           ol: [
                               {
                                   margin: [0, 5],
                                   columns: [
                                       { text: `Aula:`, decoration: 'underline', width: 100, bold: true }, { text: `${curso.aula}`, style: '' },
                                   ]
                               },
                               {
                                   margin: [0, 5],
                                   columns: [
                                       { text: `Cuatrimestre:`, decoration: 'underline', width: 100, bold: true }, { text: pcuatrimestre, style: '' },
                                   ]
                               },
                           ]
                       },

                   ]


               },

               {
                   style: 'tableExample',
                   bold: false,
                   fontSize: 8,
                   margin: [0, 30],
                   table: {
                       //widths: ['auto', 'auto', 'auto', 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 15, 15, 15, 15, 15], // generar dinàmicamente este vector para todas las columnas creadas dinamicamente, si no da un error, no sabemos de antemano cuantas columnas va a haber
                       widths: vector_ancho_columnas,
                       headerRows: 2,
                       body:
                           vector_alumnos
                   },     
                   //	layout: {
                   //        hLineWidth: function (i, node) { return (i === 1 || i === 0 ) ? 2 : 1; },
                   //        vLineWidth: function (i, node) { return (i === 1 || i === 0 ) ? 2 : 1; },
                   //        hLineColor: function (i, node) { return (i === 1 || i === 0 ) ? 'black' : 'gray'; },
                   //        vLineColor: function (i, node) { return (i === 1 || i === 0 ) ? 'black' : 'gray'; }

                   //}
               }

           ],

           styles: {
               header: {
                   alignment: 'right'
               },
               center: {
                   alignment: 'center',
                   decoration: 'underline'

               },
               blanco:{
                   color:'white'
               },
               titulo: {
                   fontSize: 16,
                   bold: true,
               },
               body: {
                   lineHeight: 1.5,color:'red'
               },
               tableHeader: {
                   bold: true,
                   fontSize: 10
               }
           },
           images: {
               building: 'data:/Content/img/logo1.jpg'
           }
       };
       //pdfMake.createPdf(docDefinition).open();

       var nombre = `${curso.descripcion.slice(0, 10)} #${curso.id} registro curso ${curso.diahora.slice(0, -10)}${curso.profesor.slice(0, 5)}`

       if (individual) {
           pdfMake.createPdf(docDefinition).open();
       } else {
           pdfMake.createPdf(docDefinition).download(nombre);
       }
   }

   function obtenerDia(diaString) {
    var dia_auxiliar = diaString.slice(0, 2).toUpperCase();

    switch (dia_auxiliar) {

        case 'LU':
            return 1;
            break;
        case 'MA':
            return 2;
            break;
        case 'MI':
            return 3;
            break;
        case 'JU':
            return 4;
            break;
        case 'VI':
            return 5;
            break;
        default:
            return 0;
            break;
    }
}

