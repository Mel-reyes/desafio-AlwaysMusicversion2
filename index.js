const { Pool } = require('pg'); // Importar la clase Pool desde pg
const process = require('process');

const argumentos = JSON.parse(process.argv[2]); // Obtener los argumentos de la línea de comandos

// Configuración de la conexión a la base de datos
const pool = new Pool({
    user: "melireyes",
    host: "localhost",
    database: "estudiantes",
    password: "1234",
    port: 5432,
});

// Manejar errores en el pool
pool.on('error', (err, client) => {
    console.error('Error inesperado', err);
    process.exit(-1);
});

async function main() {
    try {
        const metodo = argumentos.metodo;
        const datos = argumentos.datos;
        
        if (metodo === 'nuevo') {
            await agregarEstudiante(datos);
        } else if (metodo === 'consulta') {
            const registros = await consultarEstudiantes();
            console.log("Registros de estudiantes:");
            console.log(registros);
        } else if (metodo === 'rut') {
            const registros = await consultarEstudiantePorRut(datos);
            console.log("Registros:");
            console.log(registros);
        } else if (metodo === 'editar') {
            await actualizarEstudiante(datos);
        } else if (metodo === 'eliminar') {
            await eliminarEstudiante(datos);
        } else {
            console.log("Método no válido");
        }
    } catch (error) {
        console.error('Error en la ejecución:', error);
    } finally {
        await pool.end();
    }
}

main();

async function agregarEstudiante(datos) {
    try {
        const query = 'INSERT INTO estudiantes (nombre, rut, curso, nivel) VALUES ($1, $2, $3, $4) RETURNING *;';
        const values = [datos.nombre, datos.rut, datos.curso, datos.nivel];
        const res = await pool.query(query, values);
        console.log('Registro agregado:', res.rows[0]);
        console.log('Campos del registro:', Object.keys(res.rows[0]).join(" - "));
    } catch (error) {
        console.error('Error al agregar el estudiante:', error);
    }
}

async function consultarEstudiantes() {
    try {
        const query = 'SELECT * FROM estudiantes;';
        const res = await pool.query(query);
        return res.rows;
    } catch (error) {
        console.error('Error al consultar los estudiantes:', error);
        return []; // Retornar un arreglo vacío en caso de error
    }
}

async function consultarEstudiantePorRut(datos) {
    try {
        const query = 'SELECT * FROM estudiantes WHERE rut=$1;';
        const values = [datos.rut];
        const res = await pool.query(query, values);
        return res.rows;
    } catch (error) {
        console.error('Error al consultar el estudiante por rut:', error);
        return []; // Retornar un arreglo vacío en caso de error
    }
}

async function actualizarEstudiante(datos) {
    try {
        const query = 'UPDATE estudiantes SET nombre=$1, curso=$2, nivel=$3 WHERE rut=$4 RETURNING *;';
        const values = [datos.nombre, datos.curso, datos.nivel, datos.rut];
        const res = await pool.query(query, values);
        console.log("Registro modificado:", res.rows[0]);
        console.log("Cantidad de registros afectados:", res.rowCount);
    } catch (error) {
        console.error('Error al actualizar el estudiante:', error);
    }
}

async function eliminarEstudiante(datos) {
    try {
        const query = 'DELETE FROM estudiantes WHERE rut=$1;';
        const values = [datos.rut];
        const res = await pool.query(query, values);
        console.log("Cantidad de registros afectados:", res.rowCount);
    } catch (error) {
        console.error('Error al eliminar el estudiante:', error);
    }
}
