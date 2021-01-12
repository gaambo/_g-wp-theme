<?php
/**
 * _G themes functions.php
 *
 * Creates a new instance of the main theme class
 * which initializes the theme and Timber.
 *
 * @package  _G
 * @since   0.1.0
 */

namespace UnderscoreG;

require_once __DIR__ . "/vendor/autoload.php";

define('UNDERSCOREG_VERSION', '0.1.0');
define('UNDERSCOREG_DIR', \plugin_dir_path(__FILE__));

require_once UNDERSCOREG_DIR . 'includes/theme.php';

require_once UNDERSCOREG_DIR . 'includes/assets.php';
require_once UNDERSCOREG_DIR . 'includes/editor.php';


$theme = new Theme();
