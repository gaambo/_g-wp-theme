<?php

namespace UnderscoreG\Blocks;

use Timber\Timber;

function getCustomBlocks()
{
    return [
        // CustomBlock::getFullName() => CustomBlock::class,
    ];
}

function initBlocks()
{
    foreach (getCustomBlocks() as $blockName => $blockClass) {
        $blockClass::init();
    }
}
add_action('init', __NAMESPACE__ . '\initBlocks', 0);

function registerBlockTemplates()
{
    $template = [
        ['core/heading']
    ];

    $postPostType = get_post_type_object('post');
    $postPostType->template = $template;

    $pagePostType = get_post_type_object('page');
    $pagePostType->template = $template;
}
add_action('init', __NAMESPACE__ . '\registerBlockTemplates');

/**
 * Reads blocks className and searches for "is-style-" classes
 * To set the helper attribute "style" to it
 */
add_filter('render_block_data', function ($block) {

    if (!isset($block['attrs'])) {
        $block['attrs'] = [];
    }

    if (isset($block['className']) || isset($block['attrs']['className'])) {
        $className = $block['className'] ?? $block['attrs']['className'];
        preg_match('/is-style-([a-zA-Z0-9\-]*)/', $className, $styles);
        if ($styles && count($styles) > 0) {
            $block['style'] = $styles[1];
            $block['attrs']['style'] = $styles[1];  // set in attrs, because js blocks render_callback only gets attributes
        }
    }

    return $block;
}, 1);

function getRenderedTemplate($templateName, $context, $echo = false)
{
    ob_start();
    $templateName = array_map(function ($template) {
        return $template . '.twig';
    }, (array) $templateName);
    Timber::render($templateName, $context);

    if ($echo) {
        return ob_get_flush();
    }
    return ob_get_clean();
}
