from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import os
from werkzeug.utils import secure_filename
from datetime import date, time, datetime, timedelta
from decimal import Decimal
# ==========================================================
# CONFIGURACIÓN PRINCIPAL
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


app = Flask(
    __name__,
    static_folder=BASE_DIR,
    static_url_path=""
)

CORS(app)


# ==========================================================
# CONFIGURACIÓN DE CARPETAS
# ==========================================================

CARPETA_IMAGENES = os.path.join(
    BASE_DIR,
    "IMG"
)

CARPETA_PERFILES = os.path.join(
    BASE_DIR,
    "Perfiles"
)


os.makedirs(
    CARPETA_IMAGENES,
    exist_ok=True
)

os.makedirs(
    CARPETA_PERFILES,
    exist_ok=True
)


# ==========================================================
# EXTENSIONES PERMITIDAS
# ==========================================================

EXTENSIONES_PERMITIDAS = {
    "png",
    "jpg",
    "jpeg",
    "webp"
}


# ==========================================================
# CONEXIÓN CON MYSQL
# ==========================================================

def conectar_bd():

    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Root",
        database="harvestx"
    )

    return conexion


# ==========================================================
# PÁGINA PRINCIPAL
# ==========================================================

@app.route("/")
def inicio():

    return send_from_directory(
        BASE_DIR,
        "login.html"
    )


# ==========================================================
# ARCHIVOS ESTÁTICOS
# ==========================================================

@app.route("/<path:nombre_archivo>")
def archivos_estaticos(nombre_archivo):

    ruta = os.path.join(
        BASE_DIR,
        nombre_archivo
    )

    if os.path.isfile(ruta):

        return send_from_directory(
            BASE_DIR,
            nombre_archivo
        )

    return jsonify({
        "exito": False,
        "mensaje": "Archivo no encontrado."
    }), 404


# ==========================================================
# SERVIR IMÁGENES DESDE IMG
# ==========================================================

@app.route("/IMG/<path:nombre_archivo>")
def servir_imagen(nombre_archivo):

    return send_from_directory(
        CARPETA_IMAGENES,
        nombre_archivo
    )


# ==========================================================
# SERVIR PERFILES
# ==========================================================

@app.route("/Perfiles/<path:nombre_archivo>")
def servir_perfil(nombre_archivo):

    return send_from_directory(
        CARPETA_PERFILES,
        nombre_archivo
    )


# ==========================================================
# FUNCIONES PARA IMÁGENES
# ==========================================================

def extension_permitida(nombre_archivo):

    if "." not in nombre_archivo:

        return False

    extension = (
        nombre_archivo
        .rsplit(".", 1)[1]
        .lower()
    )

    return extension in EXTENSIONES_PERMITIDAS


# ==========================================================
# LOGIN
# ==========================================================

@app.route(
    "/login",
    methods=["POST"]
)
def iniciar_sesion():

    datos = request.get_json()

    if not datos:

        return jsonify({
            "exito": False,
            "mensaje": "No se recibieron datos."
        }), 400

    usuario = datos.get("usuario")
    contrasena = datos.get("contrasena")

    if not usuario or not contrasena:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Usuario y contraseña "
                "son obligatorios."
            )
        }), 400

    usuario = usuario.strip()

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql = """
        SELECT
            id,
            nombre,
            usuario,
            contrasena,
            rol,
            estado,
            foto,
            fecha_creacion
        FROM usuarios
        WHERE usuario = %s
    """

    cursor.execute(
        sql,
        (usuario,)
    )

    usuario_bd = cursor.fetchone()

    cursor.close()
    conexion.close()

    if usuario_bd is None:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Usuario o contraseña "
                "incorrectos."
            )
        }), 401

    if usuario_bd["estado"] != "activo":

        return jsonify({
            "exito": False,
            "mensaje": (
                "Este usuario se encuentra "
                "inactivo."
            )
        }), 403

    if contrasena != usuario_bd["contrasena"]:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Usuario o contraseña "
                "incorrectos."
            )
        }), 401

    return jsonify({

        "exito": True,

        "mensaje": (
            "Inicio de sesión correcto."
        ),

        "usuario": {

            "id": usuario_bd["id"],

            "nombre": usuario_bd["nombre"],

            "usuario": usuario_bd["usuario"],

            "rol": usuario_bd["rol"],

            "estado": usuario_bd["estado"],

            "foto": usuario_bd["foto"],

            "fecha_creacion": (
                usuario_bd["fecha_creacion"]
            )

        }

    })


# ==========================================================
# REGISTRO DE USUARIOS
# ==========================================================

@app.route(
    "/registro",
    methods=["POST"]
)
def registrar_usuario():

    datos = request.get_json()

    if not datos:

        return jsonify({
            "exito": False,
            "mensaje": "No se recibieron datos."
        }), 400

    nombre = datos.get("nombre")
    usuario = datos.get("usuario")
    contrasena = datos.get("contrasena")

    if not nombre or not usuario or not contrasena:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Todos los campos "
                "son obligatorios."
            )
        }), 400

    nombre = nombre.strip()
    usuario = usuario.strip()
    contrasena = contrasena.strip()

    if (
        nombre == ""
        or usuario == ""
        or contrasena == ""
    ):

        return jsonify({
            "exito": False,
            "mensaje": (
                "Todos los campos "
                "son obligatorios."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql_buscar = """
        SELECT id
        FROM usuarios
        WHERE usuario = %s
    """

    cursor.execute(
        sql_buscar,
        (usuario,)
    )

    usuario_existente = cursor.fetchone()

    if usuario_existente is not None:

        cursor.close()
        conexion.close()

        return jsonify({
            "exito": False,
            "mensaje": (
                "El nombre de usuario "
                "ya está registrado."
            )
        }), 409

    sql_insertar = """
        INSERT INTO usuarios
        (
            nombre,
            usuario,
            contrasena,
            rol,
            estado,
            foto
        )
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    valores = (
        nombre,
        usuario,
        contrasena,
        "usuario",
        "activo",
        None
    )

    cursor.execute(
        sql_insertar,
        valores
    )

    conexion.commit()

    nuevo_id = cursor.lastrowid

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": (
            "Cuenta creada correctamente."
        ),

        "usuario": {

            "id": nuevo_id,

            "nombre": nombre,

            "usuario": usuario,

            "rol": "usuario",

            "estado": "activo",

            "foto": None

        }

    }), 201


# ==========================================================
# OBTENER USUARIO
# ==========================================================

@app.route(
    "/usuarios/<int:id>",
    methods=["GET"]
)
def obtener_usuario(id):

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql = """
        SELECT
            id,
            nombre,
            usuario,
            rol,
            estado,
            foto,
            fecha_creacion
        FROM usuarios
        WHERE id = %s
    """

    cursor.execute(
        sql,
        (id,)
    )

    usuario = cursor.fetchone()

    cursor.close()
    conexion.close()

    if usuario is None:

        return jsonify({
            "exito": False,
            "mensaje": "Usuario no encontrado."
        }), 404

    return jsonify({
        "exito": True,
        "usuario": usuario
    })


# ==========================================================
# ACTUALIZAR PERFIL
# ==========================================================

@app.route(
    "/usuarios/<int:id>/perfil",
    methods=["PUT"]
)
def actualizar_perfil(id):

    nombre = request.form.get(
        "nombre",
        ""
    ).strip()

    foto = request.files.get("foto")

    if nombre == "":

        return jsonify({
            "exito": False,
            "mensaje": (
                "El nombre es obligatorio."
            )
        }), 400

    if len(nombre) > 100:

        return jsonify({
            "exito": False,
            "mensaje": (
                "El nombre no puede superar "
                "los 100 caracteres."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql_buscar = """
        SELECT
            id,
            nombre,
            usuario,
            rol,
            estado,
            foto
        FROM usuarios
        WHERE id = %s
    """

    cursor.execute(
        sql_buscar,
        (id,)
    )

    usuario_bd = cursor.fetchone()

    if usuario_bd is None:

        cursor.close()
        conexion.close()

        return jsonify({
            "exito": False,
            "mensaje": "Usuario no encontrado."
        }), 404

    foto_actual = usuario_bd["foto"]

    nueva_foto = foto_actual

    if foto:

        if not foto.filename:

            cursor.close()
            conexion.close()

            return jsonify({
                "exito": False,
                "mensaje": (
                    "No se seleccionó "
                    "ninguna imagen."
                )
            }), 400

        if not extension_permitida(
            foto.filename
        ):

            cursor.close()
            conexion.close()

            return jsonify({
                "exito": False,
                "mensaje": (
                    "Formato de imagen "
                    "no permitido. "
                    "Usa JPG, JPEG, PNG o WEBP."
                )
            }), 400

        nombre_archivo = secure_filename(
            foto.filename
        )

        if not nombre_archivo:

            cursor.close()
            conexion.close()

            return jsonify({
                "exito": False,
                "mensaje": (
                    "El nombre de la imagen "
                    "no es válido."
                )
            }), 400

        extension = (
            nombre_archivo
            .rsplit(".", 1)[1]
            .lower()
        )

        nuevo_nombre_archivo = (
            f"perfil_{id}.{extension}"
        )

        ruta_archivo = os.path.join(
            CARPETA_PERFILES,
            nuevo_nombre_archivo
        )

        foto.save(
            ruta_archivo
        )

        nueva_foto = (
            f"Perfiles/{nuevo_nombre_archivo}"
        )

    sql_actualizar = """
        UPDATE usuarios
        SET
            nombre = %s,
            foto = %s
        WHERE id = %s
    """

    valores = (
        nombre,
        nueva_foto,
        id
    )

    cursor.execute(
        sql_actualizar,
        valores
    )

    conexion.commit()

    sql_actualizado = """
        SELECT
            id,
            nombre,
            usuario,
            rol,
            estado,
            foto,
            fecha_creacion
        FROM usuarios
        WHERE id = %s
    """

    cursor.execute(
        sql_actualizado,
        (id,)
    )

    usuario_actualizado = cursor.fetchone()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": (
            "Perfil actualizado "
            "correctamente."
        ),

        "usuario": usuario_actualizado

    })


# ==========================================================
# VERIFICAR USUARIO
# ==========================================================

def usuario_existe(usuario_id):

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        SELECT id
        FROM usuarios
        WHERE id = %s
        AND estado = 'activo'
    """

    cursor.execute(
        sql,
        (usuario_id,)
    )

    usuario = cursor.fetchone()

    cursor.close()
    conexion.close()

    return usuario is not None


# ==========================================================
# VERIFICAR FINCA
# ==========================================================

def finca_existe(
    finca_id,
    usuario_id
):

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        SELECT id
        FROM fincas
        WHERE id = %s
        AND usuario_id = %s
    """

    cursor.execute(
        sql,
        (
            finca_id,
            usuario_id
        )
    )

    finca = cursor.fetchone()

    cursor.close()
    conexion.close()

    return finca is not None


# ==========================================================
# AGREGAR CULTIVO
# ==========================================================

@app.route(
    "/cultivos",
    methods=["POST"]
)
def agregar_cultivo():

    datos = request.get_json()

    if not datos:

        return jsonify({
            "exito": False,
            "mensaje": (
                "No se recibieron datos."
            )
        }), 400

    usuario_id = datos.get(
        "usuario_id"
    )

    nombre = datos.get("nombre")
    tipo = datos.get("tipo")
    agua = datos.get("agua")
    cosecha = datos.get("cosecha")

    finca_id = datos.get(
        "finca_id"
    )

    catalogo_cultivo_id = datos.get(
        "catalogo_cultivo_id"
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "No se indicó el "
                "usuario del cultivo."
            )
        }), 400

    if not usuario_existe(
        usuario_id
    ):

        return jsonify({
            "exito": False,
            "mensaje": (
                "El usuario no existe "
                "o está inactivo."
            )
        }), 400

    if (
        not nombre
        or not tipo
        or not agua
        or not cosecha
    ):

        return jsonify({
            "exito": False,
            "mensaje": (
                "Todos los campos del "
                "cultivo son obligatorios."
            )
        }), 400

    if finca_id is not None:

        if not finca_existe(
            finca_id,
            usuario_id
        ):

            return jsonify({
                "exito": False,
                "mensaje": (
                    "La finca no existe "
                    "o no pertenece al usuario."
                )
            }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        INSERT INTO cultivos
        (
            nombre,
            tipo,
            agua,
            cosecha,
            finca_id,
            catalogo_cultivo_id,
            usuario_id
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    valores = (
        nombre,
        tipo,
        agua,
        cosecha,
        finca_id,
        catalogo_cultivo_id,
        usuario_id
    )

    cursor.execute(
        sql,
        valores
    )

    conexion.commit()

    nuevo_id = cursor.lastrowid

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": (
            "Cultivo agregado "
            "correctamente."
        ),

        "id": nuevo_id

    }), 201


# ==========================================================
# OBTENER CULTIVOS
# ==========================================================

@app.route(
    "/cultivos",
    methods=["GET"]
)
def obtener_cultivos():

    usuario_id = request.args.get(
        "usuario_id",
        type=int
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql = """
        SELECT
            cultivos.id,
            cultivos.nombre,
            cultivos.tipo,
            cultivos.agua,
            cultivos.cosecha,
            cultivos.estado,
            cultivos.finca_id,
            cultivos.catalogo_cultivo_id,
            cultivos.usuario_id,
            catalogo_cultivos.imagen
        FROM cultivos
        LEFT JOIN catalogo_cultivos
            ON cultivos.catalogo_cultivo_id =
               catalogo_cultivos.id
        WHERE cultivos.usuario_id = %s
        ORDER BY cultivos.id DESC
    """

    cursor.execute(
        sql,
        (usuario_id,)
    )

    cultivos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(cultivos)


# ==========================================================
# CATÁLOGO DE CULTIVOS
# ==========================================================

@app.route(
    "/catalogo-cultivos",
    methods=["GET"]
)
def obtener_catalogo_cultivos():

    buscar = request.args.get(
        "buscar",
        ""
    )

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql = """
        SELECT *
        FROM catalogo_cultivos
        WHERE nombre LIKE %s
    """

    cursor.execute(
        sql,
        (f"%{buscar}%",)
    )

    cultivos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(cultivos)


# ==========================================================
# OBTENER UN CULTIVO
# ==========================================================

@app.route(
    "/cultivos/<int:id>",
    methods=["GET"]
)
def obtener_cultivo(id):

    usuario_id = request.args.get(
        "usuario_id",
        type=int
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql = """
        SELECT *
        FROM cultivos
        WHERE id = %s
        AND usuario_id = %s
    """

    cursor.execute(
        sql,
        (
            id,
            usuario_id
        )
    )

    cultivo = cursor.fetchone()

    cursor.close()
    conexion.close()

    if cultivo is None:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Cultivo no encontrado."
            )
        }), 404

    return jsonify(cultivo)


# ==========================================================
# EDITAR CULTIVO
# ==========================================================

@app.route(
    "/cultivos/<int:id>",
    methods=["PUT"]
)
def editar_cultivo(id):

    datos = request.get_json()

    if not datos:

        return jsonify({
            "exito": False,
            "mensaje": (
                "No se recibieron datos."
            )
        }), 400

    usuario_id = datos.get(
        "usuario_id"
    )

    nombre = datos.get("nombre")
    tipo = datos.get("tipo")
    agua = datos.get("agua")
    cosecha = datos.get("cosecha")

    finca_id = datos.get(
        "finca_id"
    )

    catalogo_cultivo_id = datos.get(
        "catalogo_cultivo_id"
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    if (
        not nombre
        or not tipo
        or not agua
        or not cosecha
    ):

        return jsonify({
            "exito": False,
            "mensaje": (
                "Todos los campos del "
                "cultivo son obligatorios."
            )
        }), 400

    if finca_id is not None:

        if not finca_existe(
            finca_id,
            usuario_id
        ):

            return jsonify({
                "exito": False,
                "mensaje": (
                    "La finca no existe "
                    "o no pertenece al usuario."
                )
            }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        UPDATE cultivos
        SET
            nombre = %s,
            tipo = %s,
            agua = %s,
            cosecha = %s,
            finca_id = %s,
            catalogo_cultivo_id = %s
        WHERE id = %s
        AND usuario_id = %s
    """

    valores = (
        nombre,
        tipo,
        agua,
        cosecha,
        finca_id,
        catalogo_cultivo_id,
        id,
        usuario_id
    )

    cursor.execute(
        sql,
        valores
    )

    if cursor.rowcount == 0:

        cursor.close()
        conexion.close()

        return jsonify({
            "exito": False,
            "mensaje": (
                "Cultivo no encontrado."
            )
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": (
            "Cultivo actualizado "
            "correctamente."
        )

    })


# ==========================================================
# ELIMINAR CULTIVO
# ==========================================================

@app.route(
    "/cultivos/<int:id>",
    methods=["DELETE"]
)
def eliminar_cultivo(id):

    usuario_id = request.args.get(
        "usuario_id",
        type=int
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        DELETE FROM cultivos
        WHERE id = %s
        AND usuario_id = %s
    """

    cursor.execute(
        sql,
        (
            id,
            usuario_id
        )
    )

    if cursor.rowcount == 0:

        cursor.close()
        conexion.close()

        return jsonify({
            "exito": False,
            "mensaje": (
                "Cultivo no encontrado."
            )
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": (
            "Cultivo eliminado "
            "correctamente."
        )

    })


# ==========================================================
# AGREGAR FINCA
# ==========================================================

@app.route(
    "/fincas",
    methods=["POST"]
)
def agregar_finca():

    datos = request.get_json()

    if not datos:

        return jsonify({
            "exito": False,
            "mensaje": (
                "No se recibieron datos."
            )
        }), 400

    usuario_id = datos.get(
        "usuario_id"
    )

    nombre = datos.get("nombre")
    ubicacion = datos.get("ubicacion")
    area_total = datos.get("area_total")
    descripcion = datos.get("descripcion")

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    if not usuario_existe(
        usuario_id
    ):

        return jsonify({
            "exito": False,
            "mensaje": (
                "El usuario no existe "
                "o está inactivo."
            )
        }), 400

    if not nombre or not ubicacion:

        return jsonify({
            "exito": False,
            "mensaje": (
                "El nombre y la ubicación "
                "son obligatorios."
            )
        }), 400

    if area_total is None:

        return jsonify({
            "exito": False,
            "mensaje": (
                "El área total es obligatoria."
            )
        }), 400

    try:

        area_total = float(
            area_total
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "exito": False,
            "mensaje": (
                "El área debe ser un "
                "número válido."
            )
        }), 400

    if area_total <= 0:

        return jsonify({
            "exito": False,
            "mensaje": (
                "El área debe ser "
                "mayor que 0."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        INSERT INTO fincas
        (
            nombre,
            ubicacion,
            area_total,
            descripcion,
            usuario_id
        )
        VALUES (%s, %s, %s, %s, %s)
    """

    valores = (
        nombre.strip(),
        ubicacion.strip(),
        area_total,
        (
            descripcion.strip()
            if descripcion
            else None
        ),
        usuario_id
    )

    cursor.execute(
        sql,
        valores
    )

    conexion.commit()

    nuevo_id = cursor.lastrowid

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": (
            "Finca agregada "
            "correctamente."
        ),

        "id": nuevo_id

    }), 201


# ==========================================================
# OBTENER FINCAS
# ==========================================================

@app.route(
    "/fincas",
    methods=["GET"]
)
def obtener_fincas():

    usuario_id = request.args.get(
        "usuario_id",
        type=int
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql = """
        SELECT
            id,
            nombre,
            ubicacion,
            area_total,
            descripcion,
            usuario_id
        FROM fincas
        WHERE usuario_id = %s
        ORDER BY id DESC
    """

    cursor.execute(
        sql,
        (usuario_id,)
    )

    fincas = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "fincas": fincas

    })


# ==========================================================
# OBTENER UNA FINCA
# ==========================================================

@app.route(
    "/fincas/<int:id>",
    methods=["GET"]
)
def obtener_finca(id):

    usuario_id = request.args.get(
        "usuario_id",
        type=int
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql = """
        SELECT
            id,
            nombre,
            ubicacion,
            area_total,
            descripcion,
            usuario_id
        FROM fincas
        WHERE id = %s
        AND usuario_id = %s
    """

    cursor.execute(
        sql,
        (
            id,
            usuario_id
        )
    )

    finca = cursor.fetchone()

    cursor.close()
    conexion.close()

    if finca is None:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Finca no encontrada."
            )
        }), 404

    return jsonify({

        "exito": True,

        "finca": finca

    })


# ==========================================================
# EDITAR FINCA
# ==========================================================

@app.route(
    "/fincas/<int:id>",
    methods=["PUT"]
)
def editar_finca(id):

    datos = request.get_json()

    if not datos:

        return jsonify({
            "exito": False,
            "mensaje": (
                "No se recibieron datos."
            )
        }), 400

    usuario_id = datos.get(
        "usuario_id"
    )

    nombre = datos.get("nombre")
    ubicacion = datos.get("ubicacion")
    area_total = datos.get("area_total")
    descripcion = datos.get("descripcion")

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    if not nombre or not ubicacion:

        return jsonify({
            "exito": False,
            "mensaje": (
                "El nombre y la ubicación "
                "son obligatorios."
            )
        }), 400

    if area_total is None:

        return jsonify({
            "exito": False,
            "mensaje": (
                "El área total es obligatoria."
            )
        }), 400

    try:

        area_total = float(
            area_total
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "exito": False,
            "mensaje": (
                "El área debe ser "
                "un número válido."
            )
        }), 400

    if area_total <= 0:

        return jsonify({
            "exito": False,
            "mensaje": (
                "El área debe ser "
                "mayor que 0."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        UPDATE fincas
        SET
            nombre = %s,
            ubicacion = %s,
            area_total = %s,
            descripcion = %s
        WHERE id = %s
        AND usuario_id = %s
    """

    valores = (
        nombre.strip(),
        ubicacion.strip(),
        area_total,
        (
            descripcion.strip()
            if descripcion
            else None
        ),
        id,
        usuario_id
    )

    cursor.execute(
        sql,
        valores
    )

    if cursor.rowcount == 0:

        cursor.close()
        conexion.close()

        return jsonify({
            "exito": False,
            "mensaje": (
                "Finca no encontrada."
            )
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": (
            "Finca actualizada "
            "correctamente."
        )

    })


# ==========================================================
# ELIMINAR FINCA
# ==========================================================

@app.route(
    "/fincas/<int:id>",
    methods=["DELETE"]
)
def eliminar_finca(id):

    usuario_id = request.args.get(
        "usuario_id",
        type=int
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        DELETE FROM fincas
        WHERE id = %s
        AND usuario_id = %s
    """

    cursor.execute(
        sql,
        (
            id,
            usuario_id
        )
    )

    if cursor.rowcount == 0:

        cursor.close()
        conexion.close()

        return jsonify({
            "exito": False,
            "mensaje": (
                "Finca no encontrada."
            )
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": (
            "Finca eliminada "
            "correctamente."
        )

    })


# ==========================================================
# ESTADÍSTICAS DE FINCAS
# ==========================================================

@app.route(
    "/fincas/estadisticas",
    methods=["GET"]
)
def estadisticas_fincas():

    usuario_id = request.args.get(
        "usuario_id",
        type=int
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": (
                "Se necesita el usuario."
            )
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql_fincas = """
        SELECT
            COUNT(*) AS total_fincas,
            COALESCE(
                SUM(area_total),
                0
            ) AS area_total
        FROM fincas
        WHERE usuario_id = %s
    """

    cursor.execute(
        sql_fincas,
        (usuario_id,)
    )

    datos_fincas = cursor.fetchone()

    sql_cultivos = """
        SELECT
            COUNT(*) AS cultivos_activos
        FROM cultivos
        WHERE usuario_id = %s
        AND estado = 'Activo'
    """

    cursor.execute(
        sql_cultivos,
        (usuario_id,)
    )

    datos_cultivos = cursor.fetchone()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "estadisticas": {

            "total_fincas": (
                datos_fincas[
                    "total_fincas"
                ]
            ),

            "area_total": float(
                datos_fincas[
                    "area_total"
                ]
            ),

            "cultivos_activos": (
                datos_cultivos[
                    "cultivos_activos"
                ]
            )

        }

    })


# ==========================================================
# ALERTAS
# ==========================================================

@app.route(
    "/api/alertas",
    methods=["GET"]
)
def obtener_alertas():

    conexion = None
    cursor = None

    try:

        conexion = conectar_bd()

        cursor = conexion.cursor(
            dictionary=True
        )

        sql = """
            SELECT
                id,
                tipo,
                nivel,
                mensaje,
                estado,
                fecha
            FROM alertas
            ORDER BY fecha DESC
        """

        cursor.execute(sql)

        alertas = cursor.fetchall()

        for alerta in alertas:

            if alerta["fecha"]:

                alerta["fecha"] = (
                    alerta["fecha"]
                    .strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                )

        return jsonify({

            "status": "ok",

            "alertas": alertas

        }), 200

    except Exception as e:

        print(
            f"Error al obtener alertas: {e}"
        )

        return jsonify({

            "status": "error",

            "mensaje": (
                "No se pudieron "
                "obtener las alertas."
            ),

            "error": str(e)

        }), 500

    finally:

        if cursor:

            cursor.close()

        if conexion:

            conexion.close()


# ==========================================================
# CREAR ALERTA
# ==========================================================

@app.route(
    "/api/alertas",
    methods=["POST"]
)
def crear_alerta():

    conexion = None
    cursor = None

    try:

        datos = request.get_json()

        if not datos:

            return jsonify({

                "status": "error",

                "mensaje": (
                    "No se recibieron datos."
                )

            }), 400

        tipo = datos.get("tipo")
        nivel = datos.get("nivel")
        mensaje = datos.get("mensaje")

        if (
            not tipo
            or not nivel
            or not mensaje
        ):

            return jsonify({

                "status": "error",

                "mensaje": (
                    "Tipo, nivel y mensaje "
                    "son obligatorios."
                )

            }), 400

        conexion = conectar_bd()

        cursor = conexion.cursor()

        fecha_actual = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        sql = """
            INSERT INTO alertas
            (
                tipo,
                nivel,
                mensaje,
                estado,
                fecha
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """

        valores = (
            tipo,
            nivel,
            mensaje,
            "Activa",
            fecha_actual
        )

        cursor.execute(
            sql,
            valores
        )

        conexion.commit()

        nuevo_id = cursor.lastrowid

        return jsonify({

            "status": "ok",

            "mensaje": (
                "Alerta creada "
                "correctamente."
            ),

            "id": nuevo_id

        }), 201

    except Exception as e:

        if conexion:

            conexion.rollback()

        print(
            f"Error al crear alerta: {e}"
        )

        return jsonify({

            "status": "error",

            "mensaje": (
                "No se pudo crear "
                "la alerta."
            ),

            "error": str(e)

        }), 500

    finally:

        if cursor:

            cursor.close()

        if conexion:

            conexion.close()


# ==========================================================
# ACTUALIZAR ALERTA
# ==========================================================

@app.route(
    "/api/alertas/<int:id>",
    methods=["PUT"]
)
def actualizar_alerta(id):

    conexion = None
    cursor = None

    try:

        datos = request.get_json()

        if not datos:

            return jsonify({

                "status": "error",

                "mensaje": (
                    "No se recibieron datos."
                )

            }), 400

        estado = datos.get("estado")

        if estado not in [
            "Activa",
            "Resuelta"
        ]:

            return jsonify({

                "status": "error",

                "mensaje": (
                    "El estado debe ser "
                    "Activa o Resuelta."
                )

            }), 400

        conexion = conectar_bd()

        cursor = conexion.cursor()

        sql = """
            UPDATE alertas
            SET estado = %s
            WHERE id = %s
        """

        cursor.execute(
            sql,
            (
                estado,
                id
            )
        )

        if cursor.rowcount == 0:

            cursor.close()
            conexion.close()

            return jsonify({

                "status": "error",

                "mensaje": (
                    "Alerta no encontrada."
                )

            }), 404

        conexion.commit()

        return jsonify({

            "status": "ok",

            "mensaje": (
                "Alerta actualizada "
                "correctamente."
            )

        }), 200

    except Exception as e:

        if conexion:

            conexion.rollback()

        print(
            f"Error al actualizar alerta: {e}"
        )

        return jsonify({

            "status": "error",

            "mensaje": (
                "No se pudo actualizar "
                "la alerta."
            ),

            "error": str(e)

        }), 500

    finally:

        if cursor:

            cursor.close()

        if conexion:

            conexion.close()


# ==========================================================
# RESOLVER TODAS LAS ALERTAS
# ==========================================================

@app.route(
    "/api/alertas/resolver-todas",
    methods=["PUT"]
)
def resolver_todas_alertas():

    conexion = None
    cursor = None

    try:

        conexion = conectar_bd()

        cursor = conexion.cursor()

        sql = """
            UPDATE alertas
            SET estado = 'Resuelta'
            WHERE estado = 'Activa'
        """

        cursor.execute(sql)

        cantidad = cursor.rowcount

        conexion.commit()

        return jsonify({

            "status": "ok",

            "mensaje": (
                "Todas las alertas activas "
                "fueron resueltas."
            ),

            "actualizadas": cantidad

        }), 200

    except Exception as e:

        if conexion:

            conexion.rollback()

        print(
            f"Error al resolver todas las alertas: {e}"
        )

        return jsonify({

            "status": "error",

            "mensaje": (
                "No se pudieron resolver "
                "las alertas."
            ),

            "error": str(e)

        }), 500

    finally:

        if cursor:

            cursor.close()

        if conexion:

            conexion.close()


# ==========================================================
# CREAR ALERTA AUTOMÁTICA
# ==========================================================

def crear_alerta_automatica(
    tipo,
    nivel,
    mensaje
):

    conexion = None
    cursor = None

    try:

        conexion = conectar_bd()

        cursor = conexion.cursor()

        fecha_actual = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        sql = """
            INSERT INTO alertas
            (
                tipo,
                nivel,
                mensaje,
                estado,
                fecha
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """

        valores = (
            tipo,
            nivel,
            mensaje,
            "Activa",
            fecha_actual
        )

        cursor.execute(
            sql,
            valores
        )

        conexion.commit()

        nuevo_id = cursor.lastrowid

        print(
            f"Alerta automática creada: {mensaje}"
        )

        return nuevo_id

    except Exception as e:

        if conexion:

            conexion.rollback()

        print(
            f"Error al generar alerta automática: {e}"
        )

        return None

    finally:

        if cursor:

            cursor.close()

        if conexion:

            conexion.close()


# ==========================================================
# PROGRAMACIÓN DE RIEGO — HARVESTX
# ==========================================================

def serializar_fecha(valor):
    if valor is None:
        return None

    if isinstance(valor, datetime):
        return valor.isoformat()

    if isinstance(valor, date):
        return valor.isoformat()

    if isinstance(valor, time):
        return valor.strftime("%H:%M:%S")

    if isinstance(valor, timedelta):
        total_segundos = int(valor.total_seconds())
        horas, resto = divmod(total_segundos, 3600)
        minutos, segundos = divmod(resto, 60)
        return f"{horas:02d}:{minutos:02d}:{segundos:02d}"

    if isinstance(valor, Decimal):
        return float(valor)

    return valor




def respuesta_error_riego(mensaje, codigo=400):
    return jsonify({
        "exito": False,
        "mensaje": mensaje
    }), codigo


def obtener_usuario_riego(datos):
    """Obtiene y valida el ID del usuario."""

    try:
        usuario_id = int(datos)
    except (TypeError, ValueError):
        return None

    if usuario_id <= 0:
        return None

    return usuario_id


# ==========================================================
# LISTAR PROGRAMACIONES DE RIEGO
# GET /api/riego?usuario_id=1
# ==========================================================

@app.route("/api/riego", methods=["GET"])
def obtener_programaciones_riego():

    conexion = None
    cursor = None

    try:
        usuario_id = obtener_usuario_riego(
            request.args.get("usuario_id")
        )

        if not usuario_id:
            return respuesta_error_riego(
                "Se necesita un usuario válido."
            )

        conexion = conectar_bd()

        cursor = conexion.cursor(dictionary=True)

        sql = """
            SELECT
                p.id,
                p.usuario_id,
                p.cultivo_id,
                COALESCE(
                    NULLIF(p.cultivo_nombre, ''),
                    c.nombre,
                    'Cultivo eliminado'
                ) AS cultivo_nombre,
                p.fecha,
                p.hora,
                p.duracion,
                p.litros_estimados,
                p.estado,
                p.modo,
                p.fecha_creacion,
                p.fecha_actualizacion
            FROM programaciones_riego AS p
            LEFT JOIN cultivos AS c
                ON p.cultivo_id = c.id
            WHERE p.usuario_id = %s
            ORDER BY p.fecha DESC, p.hora DESC, p.id DESC
        """

        cursor.execute(sql, (usuario_id,))

        programaciones = cursor.fetchall()

        for registro in programaciones:
            for campo, valor in registro.items():
                registro[campo] = serializar_fecha(valor)

        return jsonify({
            "exito": True,
            "programaciones": programaciones
        }), 200

    except Exception as e:

        app.logger.exception(
            "Error al consultar las programaciones de riego"
        )

        return jsonify({
            "exito": False,
            "mensaje": "No se pudieron consultar las programaciones.",
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()


# ==========================================================
# CREAR PROGRAMACIÓN DE RIEGO
# POST /api/riego
# ==========================================================

@app.route("/api/riego", methods=["POST"])
def crear_programacion_riego():

    conexion = None
    cursor = None

    try:
        datos = request.get_json(silent=True) or {}

        usuario_id = obtener_usuario_riego(
            datos.get("usuario_id")
        )

        if not usuario_id:
            return respuesta_error_riego(
                "El usuario indicado no es válido."
            )

        try:
            cultivo_id = int(datos.get("cultivo_id"))
            duracion = int(datos.get("duracion"))
        except (TypeError, ValueError):
            return respuesta_error_riego(
                "Selecciona un cultivo y una duración válidos."
            )

        fecha_texto = str(datos.get("fecha", "")).strip()
        hora_texto = str(datos.get("hora", "")).strip()

        modo = datos.get("modo", "Manual")

        if modo not in ("Manual", "Automatico"):
            return respuesta_error_riego(
                "El modo de riego no es válido."
            )

        if duracion < 1 or duracion > 1440:
            return respuesta_error_riego(
                "La duración debe estar entre 1 y 1440 minutos."
            )

        try:
            fecha_riego = datetime.strptime(
                fecha_texto, "%Y-%m-%d"
            ).date()

            hora_riego = datetime.strptime(
                hora_texto[:5], "%H:%M"
            ).time()

        except ValueError:
            return respuesta_error_riego(
                "La fecha o la hora tienen un formato incorrecto."
            )

        if fecha_riego < date.today():
            return respuesta_error_riego(
                "No puedes programar un riego para una fecha pasada."
            )

        if (
            fecha_riego == date.today()
            and hora_riego < datetime.now().time().replace(
                second=0, microsecond=0
            )
        ):
            return respuesta_error_riego(
                "La hora seleccionada ya pasó."
            )

        conexion = conectar_bd()
        cursor = conexion.cursor(dictionary=True)

        # Verificar que el cultivo pertenece al usuario.
        cursor.execute(
            """
            SELECT id, nombre
            FROM cultivos
            WHERE id = %s
              AND usuario_id = %s
            """,
            (cultivo_id, usuario_id)
        )

        cultivo = cursor.fetchone()

        if not cultivo:
            return respuesta_error_riego(
                "El cultivo no existe o no pertenece a tu cuenta.",
                404
            )

        litros_estimados = datos.get("litros_estimados", 0)

        try:
            litros_estimados = float(litros_estimados)
        except (TypeError, ValueError):
            return respuesta_error_riego(
                "La cantidad estimada de agua no es válida."
            )

        if (
            litros_estimados < 0
            or litros_estimados > 10000000
        ):
            return respuesta_error_riego(
                "La cantidad de agua está fuera del rango permitido."
            )

        # Insertar la programación en MySQL.
        cursor.execute(
            """
            INSERT INTO programaciones_riego
            (
                usuario_id,
                cultivo_id,
                cultivo_nombre,
                fecha,
                hora,
                duracion,
                litros_estimados,
                estado,
                modo
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                usuario_id,
                cultivo_id,
                cultivo["nombre"],
                fecha_riego,
                hora_riego,
                duracion,
                litros_estimados,
                "Programado",
                modo
            )
        )

        nuevo_id = cursor.lastrowid
        conexion.commit()

        return jsonify({
            "exito": True,
            "mensaje": "Riego programado correctamente.",
            "id": nuevo_id
        }), 201

    except Exception as e:

        if conexion and conexion.is_connected():
            conexion.rollback()

        app.logger.exception(
            "Error al crear una programación de riego"
        )

        return jsonify({
            "exito": False,
            "mensaje": "No se pudo guardar la programación.",
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()


# ==========================================================
# ACTUALIZAR ESTADO DE UNA PROGRAMACIÓN
# PUT /api/riego/<id>
# ==========================================================

@app.route("/api/riego/<int:id>", methods=["PUT"])
def actualizar_programacion_riego(id):

    conexion = None
    cursor = None

    try:
        datos = request.get_json(silent=True) or {}

        usuario_id = obtener_usuario_riego(
            datos.get("usuario_id")
        )

        if not usuario_id:
            return respuesta_error_riego(
                "Se necesita un usuario válido."
            )

        nuevo_estado = datos.get("estado")

        estados_validos = (
            "Programado",
            "Completado",
            "Cancelado"
        )

        if nuevo_estado not in estados_validos:
            return respuesta_error_riego(
                "El estado indicado no es válido."
            )

        conexion = conectar_bd()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT *
            FROM programaciones_riego
            WHERE id = %s
              AND usuario_id = %s
            FOR UPDATE
            """,
            (id, usuario_id)
        )

        programacion = cursor.fetchone()

        if not programacion:
            return respuesta_error_riego(
                "La programación no existe.",
                404
            )

        estado_anterior = programacion["estado"]

        if estado_anterior == nuevo_estado:
            conexion.rollback()

            return jsonify({
                "exito": True,
                "mensaje": "La programación ya tiene ese estado."
            }), 200

        if estado_anterior != "Programado":
            conexion.rollback()

            return respuesta_error_riego(
                "Solo puedes cambiar el estado de un riego programado."
            )

        # Actualizar el estado.
        cursor.execute(
            """
            UPDATE programaciones_riego
            SET estado = %s
            WHERE id = %s
              AND usuario_id = %s
            """,
            (nuevo_estado, id, usuario_id)
        )

        # Registrar en el historial cuando finaliza o se cancela.
        if nuevo_estado in ("Completado", "Cancelado"):

            cursor.execute(
                """
                INSERT INTO historial_riego
                (
                    usuario_id,
                    cultivo_id,
                    programacion_id,
                    fecha_riego,
                    duracion,
                    agua_utilizada,
                    estado,
                    observaciones
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    usuario_id,
                    programacion["cultivo_id"],
                    id,
                    datetime.now(),
                    programacion["duracion"],
                    (
                        programacion["litros_estimados"]
                        if nuevo_estado == "Completado"
                        else 0
                    ),
                    nuevo_estado,
                    (
                        "Riego completado desde Programación de Riego."
                        if nuevo_estado == "Completado"
                        else "Riego cancelado desde Programación de Riego."
                    )
                )
            )

        conexion.commit()

        return jsonify({
            "exito": True,
            "mensaje": "Estado actualizado correctamente."
        }), 200

    except Exception as e:

        if conexion and conexion.is_connected():
            conexion.rollback()

        app.logger.exception(
            "Error al actualizar una programación de riego"
        )

        return jsonify({
            "exito": False,
            "mensaje": "No se pudo actualizar la programación.",
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()


# ==========================================================
# ELIMINAR PROGRAMACIÓN DE RIEGO
# DELETE /api/riego/<id>?usuario_id=1
# ==========================================================

@app.route("/api/riego/<int:id>", methods=["DELETE"])
def eliminar_programacion_riego(id):

    conexion = None
    cursor = None

    try:
        usuario_id = obtener_usuario_riego(
            request.args.get("usuario_id")
        )

        if not usuario_id:
            return respuesta_error_riego(
                "Se necesita un usuario válido."
            )

        conexion = conectar_bd()
        cursor = conexion.cursor()

        cursor.execute(
            """
            DELETE FROM programaciones_riego
            WHERE id = %s
              AND usuario_id = %s
              AND estado = 'Programado'
            """,
            (id, usuario_id)
        )

        if cursor.rowcount == 0:
            conexion.rollback()

            return respuesta_error_riego(
                "No se encontró el riego programado o ya fue finalizado.",
                404
            )

        conexion.commit()

        return jsonify({
            "exito": True,
            "mensaje": "Programación eliminada correctamente."
        }), 200

    except Exception as e:

        if conexion and conexion.is_connected():
            conexion.rollback()

        app.logger.exception(
            "Error al eliminar una programación de riego"
        )

        return jsonify({
            "exito": False,
            "mensaje": "No se pudo eliminar la programación.",
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()


# ==========================================================
# CONSULTAR HISTORIAL DE RIEGO
# GET /api/riego/historial?usuario_id=1
# ==========================================================

@app.route("/api/riego/historial", methods=["GET"])
def obtener_historial_riego():

    conexion = None
    cursor = None

    try:
        usuario_id = obtener_usuario_riego(
            request.args.get("usuario_id")
        )

        if not usuario_id:
            return respuesta_error_riego(
                "Se necesita un usuario válido."
            )

        conexion = conectar_bd()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                h.id,
                h.usuario_id,
                h.cultivo_id,
                h.programacion_id,
                COALESCE(
                    c.nombre,
                    'Cultivo eliminado'
                ) AS cultivo_nombre,
                h.fecha_riego,
                h.duracion,
                h.agua_utilizada,
                h.estado,
                h.observaciones
            FROM historial_riego AS h
            LEFT JOIN cultivos AS c
                ON h.cultivo_id = c.id
            WHERE h.usuario_id = %s
            ORDER BY h.fecha_riego DESC, h.id DESC
            """,
            (usuario_id,)
        )

        historial = cursor.fetchall()

        for registro in historial:
            for campo, valor in registro.items():
                registro[campo] = serializar_fecha(valor)

        return jsonify({
            "exito": True,
            "historial": historial
        }), 200

    except Exception as e:

        app.logger.exception(
            "Error al consultar el historial de riego"
        )

        return jsonify({
            "exito": False,
            "mensaje": "No se pudo consultar el historial.",
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()


# ==========================================================
# HISTORIAL GENERAL DE ACTIVIDADES — HARVESTX
# GET /api/historial-actividades?usuario_id=1
# ==========================================================

@app.route("/api/historial-actividades", methods=["GET"])
def obtener_historial_actividades():

    conexion = None
    cursor = None

    try:
        usuario_id = request.args.get("usuario_id", type=int)

        if not usuario_id or usuario_id <= 0:
            return jsonify({
                "exito": False,
                "mensaje": "Se necesita un usuario válido."
            }), 400

        conexion = conectar_bd()
        cursor = conexion.cursor(dictionary=True)

        actividades = []

        # --------------------------------------------------
        # 1. RIEGOS FINALIZADOS
        # --------------------------------------------------

        cursor.execute("""
            SELECT
                h.id,
                h.fecha_riego,
                h.duracion,
                h.agua_utilizada,
                h.estado,
                h.observaciones,
                COALESCE(c.nombre, 'Cultivo eliminado')
                    AS cultivo_nombre,
                COALESCE(u.nombre, 'Usuario')
                    AS usuario_nombre
            FROM historial_riego AS h
            LEFT JOIN cultivos AS c
                ON h.cultivo_id = c.id
            LEFT JOIN usuarios AS u
                ON h.usuario_id = u.id
            WHERE h.usuario_id = %s
            ORDER BY h.fecha_riego DESC, h.id DESC
        """, (usuario_id,))

        for registro in cursor.fetchall():

            estado_original = str(
                registro["estado"] or ""
            )

            estado_normalizado = estado_original.lower()

            if estado_normalizado == "completado":
                estado = "completada"
            else:
                estado = "atendida"

            actividades.append({
                "id": f"riego-{registro['id']}",
                "tipo": "riego",
                "estado": estado,
                "estado_texto": estado_original,
                "titulo": "Riego registrado",
                "descripcion": (
                    f"Riego de {registro['cultivo_nombre']}. "
                    f"Duración: {registro['duracion']} minutos. "
                    f"Agua utilizada: "
                    f"{registro['agua_utilizada']} litros."
                ),
                "fecha": serializar_fecha(
                    registro["fecha_riego"]
                ),
                "usuario": registro["usuario_nombre"],
                "icono": "fa-droplet"
            })

        # --------------------------------------------------
        # 2. RIEGOS PROGRAMADOS
        # --------------------------------------------------

        cursor.execute("""
            SELECT
                p.id,
                p.cultivo_nombre,
                p.fecha,
                p.hora,
                p.duracion,
                p.estado,
                COALESCE(u.nombre, 'Usuario')
                    AS usuario_nombre
            FROM programaciones_riego AS p
            LEFT JOIN usuarios AS u
                ON p.usuario_id = u.id
            WHERE p.usuario_id = %s
              AND p.estado = 'Programado'
            ORDER BY p.fecha DESC, p.hora DESC, p.id DESC
        """, (usuario_id,))

        for registro in cursor.fetchall():

            fecha = registro["fecha"]
            hora = registro["hora"]

            if fecha and hora:
                fecha_completa = (
                    f"{serializar_fecha(fecha)} "
                    f"{serializar_fecha(hora)}"
                )
            else:
                fecha_completa = serializar_fecha(fecha)

            actividades.append({
                "id": f"programacion-{registro['id']}",
                "tipo": "riego",
                "estado": "pendiente",
                "estado_texto": "Programado",
                "titulo": "Riego programado",
                "descripcion": (
                    f"Se programó un riego para "
                    f"{registro['cultivo_nombre']}. "
                    f"Duración: {registro['duracion']} minutos."
                ),
                "fecha": fecha_completa,
                "usuario": registro["usuario_nombre"],
                "icono": "fa-clock"
            })

        # --------------------------------------------------
        # 3. ALERTAS RESUELTAS
        # --------------------------------------------------

        # La tabla alertas no contiene usuario_id.
        # Por ello, se consultan las alertas globales.

        cursor.execute("""
            SELECT
                id,
                tipo,
                nivel,
                mensaje,
                estado,
                fecha
            FROM alertas
            WHERE estado = 'Resuelta'
            ORDER BY fecha DESC, id DESC
        """)

        for alerta in cursor.fetchall():

            actividades.append({
                "id": f"alerta-{alerta['id']}",
                "tipo": "alerta",
                "estado": "atendida",
                "estado_texto": "Resuelta",
                "titulo": "Alerta atendida",
                "descripcion": (
                    f"{alerta['mensaje']} "
                    f"Nivel: {alerta['nivel']}."
                ),
                "fecha": serializar_fecha(
                    alerta["fecha"]
                ),
                "usuario": "Sistema HarvestX",
                "icono": "fa-bell"
            })

        # --------------------------------------------------
        # 4. ORDENAR ACTIVIDADES
        # --------------------------------------------------

        actividades.sort(
            key=lambda actividad: (
                actividad["fecha"] or ""
            ),
            reverse=True
        )

        # --------------------------------------------------
        # 5. CALCULAR ESTADÍSTICAS
        # --------------------------------------------------

        hoy = date.today()

        inicio_semana = (
            hoy - timedelta(days=hoy.weekday())
        )

        total_hoy = 0
        total_semana = 0
        total_riegos = 0
        total_alertas = 0

        for actividad in actividades:

            fecha_texto = actividad["fecha"]

            if not fecha_texto:
                continue

            try:
                fecha_actividad = datetime.fromisoformat(
                    fecha_texto
                ).date()

            except (ValueError, TypeError):
                continue

            if fecha_actividad == hoy:
                total_hoy += 1

            if inicio_semana <= fecha_actividad <= hoy:
                total_semana += 1

            if (
                actividad["tipo"] == "riego"
                and actividad["estado"] == "completada"
            ):
                total_riegos += 1

            if (
                actividad["tipo"] == "alerta"
                and actividad["estado"] == "atendida"
            ):
                total_alertas += 1

        # --------------------------------------------------
        # 6. RESPUESTA
        # --------------------------------------------------

        return jsonify({
            "exito": True,
            "actividades": actividades,
            "estadisticas": {
                "actividades_hoy": total_hoy,
                "actividades_semana": total_semana,
                "riegos_realizados": total_riegos,
                "alertas_atendidas": total_alertas
            }
        }), 200

    except Exception as e:

        app.logger.exception(
            "Error al consultar el historial general."
        )

        return jsonify({
            "exito": False,
            "mensaje": (
                "No se pudo obtener el historial "
                "de actividades."
            ),
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()



# ==========================================================
# EJECUTAR SERVIDOR
# ==========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )