<?php

namespace UnderscoreG\Blocks;

abstract class AbstractACFBlock
{

    protected static $name = '';

    protected static $innerBlocksConfiguration;

    protected $block;
    protected $innerBlocks;
    protected $fields;
    protected $isPreview;
    protected $postId;

    abstract public static function init();

    public static function getName()
    {
        return static::$name;
    }

    public static function getFullName()
    {
        return 'acf/' . static::$name;
    }

    protected static function register($settings)
    {
        $settings = wp_parse_args($settings, [
            'name' => static::$name,
            'render_callback' => [static::class, 'renderCallback'],
        ]);
        if (function_exists('acf_register_block_type')) {
            acf_register_block_type($settings);
        }
    }

    public static function renderCallback($blockData, $innerHTML, $isPreview, $postId)
    {
        $block = new static($blockData, $innerHTML, $postId, $isPreview);
        return $block->render();
    }

    public function __construct($block, $innerBlocks, $postId, $isPreview)
    {
        $this->block = $block;
        $this->innerBlocks = $innerBlocks;
        $this->fields = get_fields();
        $this->isPreview = $isPreview;
        $this->postId = $postId;
    }

    protected function render($template = null)
    {
        // TODO: maybe do not call render when edit page gets loaded first?
        if (!$template) {
            $template = static::$name;
        }
        $templates = [$template];

        if ($this->isPreview) {
            array_unshift($templates, static::$name. '-preview');
        }

        $renderContext = $this->getRenderContext();
        getRenderedTemplate($templates, $renderContext, true);
    }

    protected function getRenderContext()
    {
        $context = [];
        $context['block'] = $this->block;
        $context['innerBlocks'] = $this->innerBlocks;
        $context['isPreview'] = $this->isPreview;

        $postId = $this->postId;
        if ($postId) {
            $postId = get_the_ID();
        }

        if ($postId) {
            $context['postId'] = $postId;
        }

        $context['fields'] = $this->fields;

        if (static::$innerBlocksConfiguration) {
            $innerBlocksConfiguration = '';

            foreach (static::$innerBlocksConfiguration as $k => $v) {
                $innerBlocksConfiguration .= ' ' . $k . '="' . esc_attr(wp_json_encode($v)) . '"';
            }

            $context['innerBlocksConfiguration']   = $innerBlocksConfiguration;
        }
        return $context;
    }
}
