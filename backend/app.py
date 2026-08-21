from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import os
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app)


# ==========================================
# CONFIGURACIÓN DE ARCHIVOS
# ==========================================

CARPETA_IMAGENES = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "IMG"
    )
)

os.makedirs(
    CARPETA_IMAGENES,
    exist_ok=True
)


# ==========================================
# SERVIR IMÁGENES DESDE FLASK
# ==========================================

@app.route("/IMG/<path:nombre_archivo>")
def servir_imagen(nombre_archivo):

    return send_from_directory(
        CARPETA_IMAGENES,
        nombre_archivo
    )


# ==========================================
# EXTENSIONES PERMITIDAS
# ==========================================

EXTENSIONES_PERMITIDAS = {
    "png",
    "jpg",
    "jpeg",
    "webp"
}


# ==========================================
# CONEXIÓN CON MYSQL
# ==========================================

def conectar_bd():

    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Root",
        database="harvestx"
    )

    return conexion


# ==========================================
# FUNCIONES PARA IMÁGENES
# ==========================================

def extension_permitida(nombre_archivo):

    if "." not in nombre_archivo:
        return False

    extension = (
        nombre_archivo
        .rsplit(".", 1)[1]
        .lower()
    )

    return extension in EXTENSIONES_PERMITIDAS


# ==========================================
# INICIO
# ==========================================

@app.route("/")
def inicio():

    conexion = conectar_bd()

    if conexion.is_connected():

        conexion.close()

        return "HarvestX Backend + MySQL funcionando 🌱🗄️"

    return "No se pudo conectar con MySQL"


# ==========================================================
# LOGIN
# ==========================================================

@app.route("/login", methods=["POST"])
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
            "mensaje": "Usuario y contraseña son obligatorios."
        }), 400

    usuario = usuario.strip()

    conexion = conectar_bd()
    cursor = conexion.cursor(dictionary=True)

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
            "mensaje": "Usuario o contraseña incorrectos."
        }), 401

    if usuario_bd["estado"] != "activo":

        return jsonify({
            "exito": False,
            "mensaje": "Este usuario se encuentra inactivo."
        }), 403

    if contrasena != usuario_bd["contrasena"]:

        return jsonify({
            "exito": False,
            "mensaje": "Usuario o contraseña incorrectos."
        }), 401

    return jsonify({

        "exito": True,

        "mensaje": "Inicio de sesión correcto.",

        "usuario": {

            "id": usuario_bd["id"],
            "nombre": usuario_bd["nombre"],
            "usuario": usuario_bd["usuario"],
            "rol": usuario_bd["rol"],
            "estado": usuario_bd["estado"],
            "foto": usuario_bd["foto"],
            "fecha_creacion": usuario_bd["fecha_creacion"]

        }

    })


# ==========================================================
# REGISTRO DE USUARIOS
# ==========================================================

@app.route("/registro", methods=["POST"])
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
            "mensaje": "Todos los campos son obligatorios."
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
            "mensaje": "Todos los campos son obligatorios."
        }), 400

    conexion = conectar_bd()
    cursor = conexion.cursor(dictionary=True)

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
            "mensaje": "El nombre de usuario ya está registrado."
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

        "mensaje": "Cuenta creada correctamente.",

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
            "mensaje": "El nombre es obligatorio."
        }), 400

    if len(nombre) > 100:

        return jsonify({
            "exito": False,
            "mensaje": "El nombre no puede superar los 100 caracteres."
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
                "mensaje": "No se seleccionó ninguna imagen."
            }), 400

        if not extension_permitida(
            foto.filename
        ):

            cursor.close()
            conexion.close()

            return jsonify({
                "exito": False,
                "mensaje": (
                    "Formato de imagen no permitido. "
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
                "mensaje": "El nombre de la imagen no es válido."
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
            CARPETA_IMAGENES,
            nuevo_nombre_archivo
        )

        foto.save(
            ruta_archivo
        )

        nueva_foto = nuevo_nombre_archivo

        if (
            foto_actual
            and foto_actual.startswith("perfil_")
            and foto_actual != nuevo_nombre_archivo
        ):

            ruta_foto_anterior = os.path.join(
                CARPETA_IMAGENES,
                foto_actual
            )

            if os.path.exists(
                ruta_foto_anterior
            ):

                try:

                    os.remove(
                        ruta_foto_anterior
                    )

                except OSError:

                    pass

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

        "mensaje": "Perfil actualizado correctamente.",

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

def finca_existe(finca_id, usuario_id):

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
            "mensaje": "No se recibieron datos."
        }), 400

    usuario_id = datos.get("usuario_id")

    nombre = datos.get("nombre")
    tipo = datos.get("tipo")
    agua = datos.get("agua")
    cosecha = datos.get("cosecha")

    finca_id = datos.get("finca_id")

    catalogo_cultivo_id = datos.get(
        "catalogo_cultivo_id"
    )

    # ==========================================
    # VALIDAR USUARIO
    # ==========================================

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": "No se indicó el usuario del cultivo."
        }), 400

    if not usuario_existe(usuario_id):

        return jsonify({
            "exito": False,
            "mensaje": "El usuario no existe o está inactivo."
        }), 400

    # ==========================================
    # VALIDAR CULTIVO
    # ==========================================

    if (
        not nombre
        or not tipo
        or not agua
        or not cosecha
    ):

        return jsonify({
            "exito": False,
            "mensaje": (
                "Todos los campos del cultivo "
                "son obligatorios."
            )
        }), 400

    # ==========================================
    # VALIDAR FINCA SI SE INDICA
    # ==========================================

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

        "mensaje": "Cultivo agregado correctamente.",

        "id": nuevo_id

    }), 201


# ==========================================================
# OBTENER CULTIVOS DEL USUARIO
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
            "mensaje": "Se necesita el usuario."
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
# BUSCAR CULTIVOS DEL CATÁLOGO
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
# OBTENER UN CULTIVO DEL USUARIO
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
            "mensaje": "Se necesita el usuario."
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    sql = """
        SELECT
            *
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
            "mensaje": "Cultivo no encontrado."
        }), 404

    return jsonify(cultivo)


# ==========================================================
# EDITAR CULTIVO DEL USUARIO
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
            "mensaje": "No se recibieron datos."
        }), 400

    usuario_id = datos.get("usuario_id")

    nombre = datos.get("nombre")
    tipo = datos.get("tipo")
    agua = datos.get("agua")
    cosecha = datos.get("cosecha")

    finca_id = datos.get("finca_id")

    catalogo_cultivo_id = datos.get(
        "catalogo_cultivo_id"
    )

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": "Se necesita el usuario."
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
                "Todos los campos del cultivo "
                "son obligatorios."
            )
        }), 400

    # ==========================================
    # VALIDAR FINCA
    # ==========================================

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
            "mensaje": "Cultivo no encontrado."
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": "Cultivo actualizado correctamente."

    })


# ==========================================================
# ELIMINAR CULTIVO DEL USUARIO
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
            "mensaje": "Se necesita el usuario."
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
            "mensaje": "Cultivo no encontrado."
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": "Cultivo eliminado correctamente."

    })


# ==========================================================
# ==========================================================
#                 MÓDULO DE FINCAS
# ==========================================================
# ==========================================================


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
            "mensaje": "No se recibieron datos."
        }), 400

    usuario_id = datos.get("usuario_id")

    nombre = datos.get("nombre")
    ubicacion = datos.get("ubicacion")
    area_total = datos.get("area_total")
    descripcion = datos.get("descripcion")

    # ==========================================
    # VALIDAR USUARIO
    # ==========================================

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": "Se necesita el usuario."
        }), 400

    if not usuario_existe(usuario_id):

        return jsonify({
            "exito": False,
            "mensaje": "El usuario no existe o está inactivo."
        }), 400

    # ==========================================
    # VALIDAR DATOS
    # ==========================================

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
            "mensaje": "El área total es obligatoria."
        }), 400

    try:

        area_total = float(area_total)

    except (TypeError, ValueError):

        return jsonify({
            "exito": False,
            "mensaje": "El área debe ser un número válido."
        }), 400

    if area_total <= 0:

        return jsonify({
            "exito": False,
            "mensaje": "El área debe ser mayor que 0."
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
        descripcion.strip() if descripcion else None,
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

        "mensaje": "Finca agregada correctamente.",

        "id": nuevo_id

    }), 201


# ==========================================================
# OBTENER FINCAS DEL USUARIO
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
            "mensaje": "Se necesita el usuario."
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
# OBTENER UNA FINCA DEL USUARIO
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
            "mensaje": "Se necesita el usuario."
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
            "mensaje": "Finca no encontrada."
        }), 404

    return jsonify({

        "exito": True,

        "finca": finca

    })


# ==========================================================
# EDITAR FINCA DEL USUARIO
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
            "mensaje": "No se recibieron datos."
        }), 400

    usuario_id = datos.get("usuario_id")

    nombre = datos.get("nombre")
    ubicacion = datos.get("ubicacion")
    area_total = datos.get("area_total")
    descripcion = datos.get("descripcion")

    if not usuario_id:

        return jsonify({
            "exito": False,
            "mensaje": "Se necesita el usuario."
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
            "mensaje": "El área total es obligatoria."
        }), 400

    try:

        area_total = float(area_total)

    except (TypeError, ValueError):

        return jsonify({
            "exito": False,
            "mensaje": "El área debe ser un número válido."
        }), 400

    if area_total <= 0:

        return jsonify({
            "exito": False,
            "mensaje": "El área debe ser mayor que 0."
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
        descripcion.strip() if descripcion else None,
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
            "mensaje": "Finca no encontrada."
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": "Finca actualizada correctamente."

    })


# ==========================================================
# ELIMINAR FINCA DEL USUARIO
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
            "mensaje": "Se necesita el usuario."
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
            "mensaje": "Finca no encontrada."
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({

        "exito": True,

        "mensaje": "Finca eliminada correctamente."

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
            "mensaje": "Se necesita el usuario."
        }), 400

    conexion = conectar_bd()

    cursor = conexion.cursor(
        dictionary=True
    )

    # ==========================================
    # TOTAL DE FINCAS Y ÁREA
    # ==========================================

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

    # ==========================================
    # CULTIVOS ACTIVOS
    # ==========================================

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

            "total_fincas": datos_fincas["total_fincas"],

            "area_total": float(
                datos_fincas["area_total"]
            ),

            "cultivos_activos": datos_cultivos[
                "cultivos_activos"
            ]

        }

    })


# ==========================================================
# EJECUTAR SERVIDOR
# ==========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )