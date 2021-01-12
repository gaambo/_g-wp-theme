<?php

namespace UnderscoreG\Editor;

add_action('enqueue_block_editor_assets', function () {
    $assets_url = \get_template_directory_uri() . '/assets/';
    wp_enqueue_script(
        'underscoreg-editor',
        $assets_url . 'js/editor.js',
        ['wp-blocks', 'wp-i18n', 'wp-block-editor', 'wp-blocks', 'wp-dom-ready', 'wp-hooks', 'wp-element', 'wp-components', 'wp-compose', 'wp-edit-post'],
        filemtime(get_stylesheet_directory() . '/assets/js/editor.js')
    );
});

add_action('init', function () {
    register_block_pattern_category('underscoreg', [
        'label' => _x('UnderscoreG', 'Block pattern category', 'underscoreg'),
    ]);

    // If using GenerateBlocks in a pattern: remove uniqueId und gridIds (from attributes and classes, just leave dash in front)
    // ~~escape via https://codebeautify.org/json-escape-unescape, remove \n (?)~~ (to avoid empty spaces/lines in inserted content)
    // put in template file

    register_block_pattern('underscoreg/custom-pattern', [
        'title' => __('Custom Pattern', 'underscoreg'),
        'content' => file_get_contents(UNDERSCOREG_DIR . '/template-parts/block-patterns/custom-pattern.html'),
        'categories' => ['underscoreg']
    ]);
});
