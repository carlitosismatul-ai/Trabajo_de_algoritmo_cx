from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)


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
# INICIO
# ==========================================

@app.route("/")
def inicio():

    conexion = conectar_bd()

    if conexion.is_connected():

        conexion.close()

        return "HarvestX Backend + MySQL funcionando 🌱🗄️"

    return "No se pudo conectar con MySQL"


# ==========================================
# AGREGAR CULTIVO
# ==========================================

@app.route("/cultivos", methods=["POST"])
def agregar_cultivo():

    datos = request.get_json()

    nombre = datos["nombre"]
    tipo = datos["tipo"]
    agua = datos["agua"]
    cosecha = datos["cosecha"]

    # ID del cultivo que viene del catálogo
    # Puede ser NULL si es personalizado
    catalogo_cultivo_id = datos.get("catalogo_cultivo_id")

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        INSERT INTO cultivos
        (nombre, tipo, agua, cosecha, catalogo_cultivo_id)
        VALUES (%s, %s, %s, %s, %s)
    """

    valores = (
        nombre,
        tipo,
        agua,
        cosecha,
        catalogo_cultivo_id
    )

    cursor.execute(sql, valores)

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({
        "mensaje": "Cultivo agregado correctamente"
    })


# ==========================================
# OBTENER CULTIVOS
# ==========================================

@app.route("/cultivos", methods=["GET"])
def obtener_cultivos():

    conexion = conectar_bd()

    cursor = conexion.cursor(dictionary=True)

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
            catalogo_cultivos.imagen
        FROM cultivos
        LEFT JOIN catalogo_cultivos
            ON cultivos.catalogo_cultivo_id = catalogo_cultivos.id
    """

    cursor.execute(sql)

    cultivos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(cultivos)

# ==========================================
# BUSCAR CULTIVOS DEL CATÁLOGO
# ==========================================

@app.route("/catalogo-cultivos", methods=["GET"])
def obtener_catalogo_cultivos():

    buscar = request.args.get("buscar", "")

    conexion = conectar_bd()

    cursor = conexion.cursor(dictionary=True)

    sql = """
        SELECT *
        FROM catalogo_cultivos
        WHERE nombre LIKE %s
    """

    cursor.execute(sql, (f"%{buscar}%",))

    cultivos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(cultivos)


# ==========================================
# OBTENER UN CULTIVO POR ID
# ==========================================

@app.route("/cultivos/<int:id>", methods=["GET"])
def obtener_cultivo(id):

    conexion = conectar_bd()

    cursor = conexion.cursor(dictionary=True)

    sql = """
        SELECT *
        FROM cultivos
        WHERE id = %s
    """

    cursor.execute(sql, (id,))

    cultivo = cursor.fetchone()

    cursor.close()
    conexion.close()

    if cultivo is None:

        return jsonify({
            "mensaje": "Cultivo no encontrado"
        }), 404

    return jsonify(cultivo)


# ==========================================
# EDITAR CULTIVO
# ==========================================

@app.route("/cultivos/<int:id>", methods=["PUT"])
def editar_cultivo(id):

    datos = request.get_json()

    nombre = datos["nombre"]
    tipo = datos["tipo"]
    agua = datos["agua"]
    cosecha = datos["cosecha"]

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        UPDATE cultivos
        SET nombre = %s,
            tipo = %s,
            agua = %s,
            cosecha = %s
        WHERE id = %s
    """

    valores = (
        nombre,
        tipo,
        agua,
        cosecha,
        id
    )

    cursor.execute(sql, valores)

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({
        "mensaje": "Cultivo actualizado correctamente"
    })


# ==========================================
# ELIMINAR CULTIVO
# ==========================================

@app.route("/cultivos/<int:id>", methods=["DELETE"])
def eliminar_cultivo(id):

    conexion = conectar_bd()

    cursor = conexion.cursor()

    sql = """
        DELETE FROM cultivos
        WHERE id = %s
    """

    cursor.execute(sql, (id,))

    # Verificar si realmente existía
    if cursor.rowcount == 0:

        cursor.close()
        conexion.close()

        return jsonify({
            "mensaje": "Cultivo no encontrado"
        }), 404

    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({
        "mensaje": "Cultivo eliminado correctamente"
    })


# ==========================================
# EJECUTAR SERVIDOR
# ==========================================

if __name__ == "__main__":

    app.run(debug=True)