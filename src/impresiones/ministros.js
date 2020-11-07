import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {_imagenLogo} from '../imagenesBase64/logo'
import Swal from 'sweetalert2';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function imprimir(cursadas){
    try{
        generarDocumento(cursadas)
    }catch(err){

            const mensaje_html = `<p>Hubo un error al generar el documento</p><p>${err}</p>`

            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })
        }
}

function generarDocumento(cursadas) {

    const fecha = fechaDelDia();

    console.log('cursadas',cursadas)
    var cursadas_mapeadas = cursadas.map(item => { return { nombre_obrero: item.nombre_obrero, rango: item.rango}}) // uso .map para transformar un array de objetos a un nuevo array de objetos pero elijiendo los campos.
                                            // El array cursadas que viene como propiedad del abm de alumnos trae las cursadas con muchos campos pero solo queremos 4 campos para armar la grilla

    var cursadas_mapeadas_vector = cursadas_mapeadas.map(item=>{return Object.values(item)}) // uso .map para transformar un array de objetos en un nuevo array pero ahora no de objetos sino de arrays porque apliquè la funciòn Object.values. Hago esto porque para armar el pdf necesito un array de arrays y no array de objetos
    
    cursadas_mapeadas_vector.unshift([{ text: 'nombre_obrero', style: 'tableHeader' }, 
                                        { text: 'rango', style: 'tableHeader' }])

    var docDefinition = {

        content: [

            {
                columns: [
                    {
                        image: _imagenLogo,
                        width: 200,
                    },
                ]
            },

            {
                text: `Comprobante de inscripción`, margin: [2, 35], style: 'center'
            },

            {
                columns: [

                    {
                        type: 'none',
                        ol: [
                            {
                                margin: [0, 5],

                                columns: [
                                    { text: `Alumno:`, decoration: 'underline', width: 60, bold: true }, { text: `(${"alumno.id_alumno"}) ${"alumno.alumno"}`, style: '' },
                                ]
                            },
                            {
                                margin: [0, 5],

                                columns: [
                                    { text: `Período:`, decoration: 'underline', width: 60, bold: true }, { text: `${"periodo"}`, style: '' },
                                ]
                            },]
                    },

                    {
                        type: 'none',
                        ol: [
                            {
                                margin: [0, 5],
                                columns: [
                                    { text: `Fecha:`, decoration: 'underline', width: 60, bold: true }, { text: `${"fecha"}`, style: '' },
                                ]
                            },
                        ]
                    },

                ]


            },

            {
                style: 'tableExample',
                bold:false,
                fontSize:9,
                margin:[0,30],
                widths: [200, 'auto', 'auto',50,'auto'],
                table: {
                    headerRows: 1,
                    body:
                        cursadas_mapeadas_vector

                },
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
            anotherStyle: {
                fontSize: 15,
                bold: true,
            },
            body: {
                lineHeight: 1.5
            },
            tableHeader: {
                bold:true,
                fontSize:12
            }
        },
        images: {
            building: 'data:/Content/img/logo1.jpg'
        }
    };

    var dd = {
        content: [
            'First paragraph',
            'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
        ]
        
    }
    pdfMake.createPdf(docDefinition).open();
    //pdfMake.createPdf(dd).download('nombre');

}

function fechaDelDia(){
    let fecha;

    const fecha_aux  = new Date()
    const dia = fecha_aux.getDate() < 10 ? `0${fecha_aux.getDate()}` : fecha_aux.getDate();
    let mes = fecha_aux.getMonth() + 1 ;
    mes = mes < 10 ? `0${mes}` : mes;
    fecha = `${dia}/${mes}/${fecha_aux.getUTCFullYear()}`

    return fecha;
}