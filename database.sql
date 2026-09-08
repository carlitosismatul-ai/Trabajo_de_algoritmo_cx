-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-08-2026 a las 02:50:17
-- Versión del servidor: 8.0.45
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `harvestx`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `catalogo_cultivos`
--

CREATE TABLE `catalogo_cultivos` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `agua` varchar(50) NOT NULL,
  `cosecha` varchar(100) NOT NULL,
  `descripcion` text,
  `imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `catalogo_cultivos`
--

INSERT INTO `catalogo_cultivos` (`id`, `nombre`, `tipo`, `agua`, `cosecha`, `descripcion`, `imagen`) VALUES
(1, 'Tomate', 'Hortaliza', 'Media', '60 - 80 días', 'Cultivo hortícola utilizado ampliamente para consumo fresco y procesamiento.', 'tomate.jpg'),
(2, 'Maíz', 'Cereal', 'Media', '90 - 120 días', 'Cereal de gran importancia alimentaria y agrícola.', 'maiz.jpg'),
(3, 'Frijol', 'Leguminosa', 'Media', '70 - 100 días', 'Leguminosa de gran importancia alimentaria y agrícola.', 'frijol.jpg'),
(4, 'Papa', 'Hortaliza', 'Media', '90 - 120 días', 'Tubérculo utilizado ampliamente para consumo y procesamiento.', 'papa.jpg'),
(5, 'Zanahoria', 'Hortaliza', 'Media', '70 - 100 días', 'Hortaliza de raíz cultivada para consumo fresco y procesamiento.', 'zanahoria.jpg'),
(6, 'Lechuga', 'Hortaliza', 'Media', '45 - 70 días', 'Hortaliza de hojas utilizada principalmente en ensaladas y consumo fresco.', 'lechuga.jpg'),
(7, 'Cebolla', 'Hortaliza', 'Media', '90 - 150 días', 'Hortaliza de bulbo utilizada ampliamente como alimento y condimento.', 'cebolla.jpg'),
(8, 'Brócoli', 'Hortaliza', 'Media', '60 - 90 días', 'Hortaliza de inflorescencia cultivada para consumo fresco y procesamiento.', 'brocoli.jpg'),
(9, 'Chile pimiento', 'Hortaliza', 'Media', '70 - 100 días', 'Hortaliza de fruto utilizada en diferentes preparaciones alimenticias.', 'chile-pimiento.jpg'),
(10, 'Pepino', 'Hortaliza', 'Alta', '50 - 70 días', 'Hortaliza de fruto cultivada principalmente para consumo fresco.', 'pepino.jpg'),
(11, 'Aguacate', 'Frutal', 'Media', '2 - 4 años', 'Fruto tropical de alto valor alimentario y comercial.', 'aguacate.jpg'),
(12, 'Banano', 'Frutal', 'Alta', '9 - 12 meses', 'Fruto tropical de gran importancia alimentaria y comercial.', 'banano.jpg'),
(13, 'Mango', 'Frutal', 'Media', '3 - 5 meses', 'Fruto tropical cultivado ampliamente para consumo fresco y procesamiento.', 'mango.jpg'),
(14, 'Papaya', 'Frutal', 'Alta', '7 - 11 meses', 'Fruto tropical de pulpa dulce utilizado principalmente para consumo fresco.', 'papaya.jpg'),
(15, 'Piña', 'Frutal', 'Media', '12 - 18 meses', 'Fruto tropical cultivado para consumo fresco y procesamiento.', 'pina.jpg'),
(16, 'Naranja', 'Frutal', 'Media', '2 - 4 años', 'Fruto cítrico utilizado para consumo fresco y producción de jugos.', 'naranja.jpg'),
(17, 'Limón', 'Frutal', 'Media', '2 - 4 años', 'Fruto cítrico utilizado principalmente como condimento y para bebidas.', 'limon.jpg'),
(18, 'Sandía', 'Frutal', 'Alta', '70 - 100 días', 'Fruto de gran tamaño y alto contenido de agua, cultivado para consumo fresco.', 'sandia.jpg'),
(19, 'Melón', 'Frutal', 'Media', '70 - 100 días', 'Fruto de pulpa dulce cultivado principalmente para consumo fresco.', 'melon.jpg'),
(20, 'Café', 'Cultivo permanente', 'Media', '2 - 4 años', 'Cultivo de gran importancia económica y comercial para la producción de café.', 'cafe.jpg'),
(21, 'Cacao', 'Cultivo permanente', 'Alta', '2 - 5 años', 'Cultivo tropical utilizado principalmente para la producción de chocolate y derivados.', 'cacao.jpg'),
(22, 'Cardamomo', 'Cultivo permanente', 'Alta', '2 - 3 años', 'Especia tropical de importancia comercial utilizada en alimentos y bebidas.', 'cardamomo.jpg'),
(23, 'Caña de azúcar', 'Cultivo permanente', 'Alta', '10 - 18 meses', 'Cultivo utilizado principalmente para la producción de azúcar y derivados.', 'cana-azucar.jpg'),
(24, 'Arroz', 'Cereal', 'Alta', '100 - 150 días', 'Cereal de gran importancia alimentaria cultivado principalmente para consumo humano.', 'arroz.jpg'),
(25, 'Sorgo', 'Cereal', 'Baja', '90 - 120 días', 'Cereal resistente a condiciones secas utilizado para alimentación humana y animal.', 'sorgo.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cultivos`
--

CREATE TABLE `cultivos` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `agua` varchar(20) NOT NULL,
  `cosecha` varchar(100) NOT NULL,
  `estado` varchar(20) DEFAULT 'Activo',
  `finca_id` int DEFAULT NULL,
  `catalogo_cultivo_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cultivos`
--

INSERT INTO `cultivos` (`id`, `nombre`, `tipo`, `agua`, `cosecha`, `estado`, `finca_id`, `catalogo_cultivo_id`, `usuario_id`) VALUES
(17, 'Brócoli', 'Hortaliza', 'Media', '60 - 90 días', 'Activo', NULL, 8, 1),
(19, 'Tomate', 'Hortaliza', 'Media', '60 - 80 días', 'Activo', NULL, 1, 1),
(20, 'Limón', 'Frutal', 'Media', '2 - 4 años', 'Activo', NULL, 17, 1),
(22, 'Lechuga', 'Hortaliza', 'Media', '45 - 70 días', 'Activo', NULL, 6, 2),
(23, 'Chile pimiento', 'Hortaliza', 'Media', '70 - 100 días', 'Activo', NULL, 9, 2),
(24, 'Tomate', 'Hortaliza', 'Media', '60 - 80 días', 'Activo', NULL, 1, 2),
(25, 'Melón', 'Frutal', 'Media', '70 - 100 días', 'Activo', NULL, 19, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fincas`
--

CREATE TABLE `fincas` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `area_total` decimal(10,2) DEFAULT NULL,
  `descripcion` text,
  `usuario_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `fincas`
--

INSERT INTO `fincas` (`id`, `nombre`, `ubicacion`, `area_total`, `descripcion`, `usuario_id`) VALUES
(2, 'friti coral cx', 'guatemla', 519.00, 'lkjhgfdsa', 1),
(3, 'cosas de chill cx', 'mixco cx', 75369.00, 'yuoiprqwefdsajklñ', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('administrador','usuario') NOT NULL DEFAULT 'usuario',
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `foto` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `usuario`, `contrasena`, `rol`, `estado`, `foto`, `fecha_creacion`) VALUES
(1, 'Falltoast98765432', 'carlos', '1234', 'administrador', 'activo', 'perfil_1.jpg', '2026-08-18 22:51:14'),
(2, 'Angie', 'angie', '1234', 'administrador', 'activo', 'perfil_2.jpg', '2026-08-18 22:51:14'),
(3, 'Miguel', 'miguel', '1234', 'administrador', 'activo', NULL, '2026-08-18 22:51:14'),
(4, 'Kally', 'kally', '1234', 'administrador', 'activo', NULL, '2026-08-18 22:51:14'),
(5, 'Helen', 'helen', '1234', 'administrador', 'activo', NULL, '2026-08-18 22:51:14'),
(6, 'Christ', 'christ', '1234', 'administrador', 'activo', NULL, '2026-08-18 22:51:14'),
(7, 'Usuario Prueba', 'prueba', '1234', 'usuario', 'activo', NULL, '2026-08-18 23:55:37'),
(8, 'miau', 'miau', '4564', 'usuario', 'activo', NULL, '2026-08-19 00:06:44'),
(9, 'io', 'io siendo io', '7534', 'usuario', 'activo', NULL, '2026-08-19 00:24:21'),
(10, 'miau', 'miau1', '7897', 'usuario', 'activo', NULL, '2026-08-19 00:48:41');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `catalogo_cultivos`
--
ALTER TABLE `catalogo_cultivos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cultivos`
--
ALTER TABLE `cultivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cultivos_usuario` (`usuario_id`);

--
-- Indices de la tabla `fincas`
--
ALTER TABLE `fincas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario` (`usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `catalogo_cultivos`
--
ALTER TABLE `catalogo_cultivos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `cultivos`
--
ALTER TABLE `cultivos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `fincas`
--
ALTER TABLE `fincas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cultivos`
--
ALTER TABLE `cultivos`
  ADD CONSTRAINT `fk_cultivos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
