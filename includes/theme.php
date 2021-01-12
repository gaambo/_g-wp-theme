<?php

namespace UnderscoreG;

use \Timber\Site;
use \Timber\Timber;

/**
 * Theme main class extending Timber\Site class
 *
 * Theme is the main class for the active theme of the project/website.
 * It extends Timbers Site class which sets up the theme supports,
 * registers post types, and configures Timber and Twig.
 *
 * It gets created in the themes functions.php
 *
 * @package UnderscoreG
 * @author  Fabian Todt <fabian@fabiantodt.at>
 * @since   0.1.0
 */
class Theme extends Site
{

    /**
     * Initialize the theme
     *
     * Sets Timber template directory
     * and adds WordPress actions & filters for this class,
     * then calls parent constructor.
     */
    public function __construct()
    {
        Timber::$dirname = ['templates'];

        add_action('after_setup_theme', array( $this, 'addThemeSupports' ));
        add_action('after_setup_theme', array( $this, 'contentWidth' ));
        add_action('after_setup_theme', array( $this, 'registerImageSizes' ));
        add_action('after_setup_theme', array( $this, 'registerMenus' ));
        add_action('widgets_init', array( $this, 'registerWidgetAreas' ));

        add_filter('timber/context', array( $this, 'addToContext' ));
        add_filter('timber/twig', array( $this, 'addToTwig' ));


        parent::__construct();
    }

    /**
     * Adds WordPress theme supports for this theme
     *
     * Fires on WordPress after_setup_theme
     *
     * @link https://developer.wordpress.org/reference/functions/add_theme_support/
     *
     * @return void
     */
    public function addThemeSupports()
    {
        add_theme_support('post-thumbnails');
        add_theme_support(
            'html5',
            [
                'comment-form',
                'comment-list',
                'gallery',
                'caption',
                'search-form',
            ]
        );
        add_theme_support('title-tag');
        add_theme_support('menus');
        add_theme_support('sidebar');

        add_theme_support('wp-block-styles');

        add_theme_support('editor-styles');
        add_editor_style('assets/css/editor.css');

        // TODO: Edit colors
        add_theme_support('editor-color-palette', [
            [
                'name' => __('Primär', 'underscoreg'),
                'slug' => 'primary',
                'color' => '#477da0'
            ],
            [
                'name' => __('Weiss', 'underscoreg'),
                'slug' => 'white',
                'color' => '#ffffff'
            ],
            [
                'name' => __('Dunkel', 'underscoreg'),
                'slug' => 'dark',
                'color' => '#201e1d'
            ],
            [
                'name' => __('Dark Blue', 'underscoreg'),
                'slug' => 'blue-dark',
                'color' => '#1e3759'
            ],
            [
                'name' => __('Light Blue', 'underscoreg'),
                'slug' => 'blue-light',
                'color' => '#99d4de'
            ],
        ]);

        // add_theme_support('editor-font-sizes', [
        //     [
        //         'name' => __('Normal', 'underscoreg'),
        //         'slug' => 'normal',
        //         'size' => 16,
        //     ],
        // ]);
    }

    /**
     * Set the content width in pixels, based on the theme's design and stylesheet.
     *
     * Fires on after_setup_theme - priority 0 to make it available to lower priority callbacks.
     * @see https://codex.wordpress.org/Content_Width
     *
     * @global int $content_width
     * @return void
     */
    public function setContentWidth()
    {
        $GLOBALS['content_width'] = null;
    }

    /**
     * Registers Nav Menus
     *
     * Fires on after_setup_theme
     * @see https://codex.wordpress.org/Function_Reference/register_nav_menus
     *
     * @return void
     */
    public function registerMenus()
    {
        \register_nav_menus(
            [
                'primary' => 'Header Menu',
                'footer'  => 'Footer Menu',
            ]
        );
    }

    /**
     * Registers custom image sizes
     *
     * Fires on after_setup_theme
     * @see https://developer.wordpress.org/reference/functions/add_image_size/
     *
     * @return void
     */
    public function registerImageSizes()
    {
        \add_image_size('job-avatar', 640, 640, true);
    }

    /**
     * Registers widget areas
     *
     * Fires on widgets_init
     * @see https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
     *
     * @return void
     */
    public function registerWidgetAreas()
    {
        \register_sidebar(
            array(
                'name'          => esc_html__('Sidebar', 'underscoreg'),
                'id'            => 'sidebar-1',
                'description'   => esc_html__('Add widgets here.', 'underscoreg'),
                'before_widget' => '<section id="%1$s" class="widget %2$s">',
                'after_widget'  => '</section>',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );
    }
    /**
     * Filters the context object of Timber/Twig templates.
     * Allows for adding "global" data to all templates.
     *
     * Fires on Timbers timber_context action.
     *
     * @param array $context
     * @return array $context
     */
    public function addToContext(array $context)
    {
        $context['headerMenu'] = new \Timber\Menu('header');
        $context['site'] = $this;
        return $context;
    }

    /**
     * Filter Timbers Twig Environment
     *
     * Adds Twig filters and Twig extensions to the Twig_Environment used by Timber
     *
     * @param Twig_Environment $twig
     * @return Twig_Environment $twig
     */
    public function addToTwig(\Twig_Environment $twig)
    {
        // $twig->addExtension( new Twig_Extension_StringLoader() );
        // $twig->addFilter( new Twig_SimpleFilter( 'myfoo', array( $this, 'myfoo' ) ) );
        return $twig;
    }
}
