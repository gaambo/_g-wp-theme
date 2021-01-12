(() => {
  const { Fragment, cloneElement } = wp.element;
  const { PanelBody, ToggleControl } = wp.components;
  const { InspectorControls } = wp.blockEditor;
  const { __ } = wp.i18n;
  const { registerBlockStyle } = wp.blocks;
  const { addFilter } = wp.hooks;

  // registerBlockStyle("core/media-text", {name: "custom", label: "Custom"});

  // addFilter("editor.BlockEdit", "underscoreg/media-text/custom", (BlockEdit) => (props) => {
  //   if(props.name !== "core/media-text") {
  //     return <BlockEdit {...props} />
  //   }

  //   const {attributes, setAttributes} = props;
  //   return (
  //     <Fragment>
  //       <BlockEdit {...props} />
  //       <InspectorControls>
  //       </InspectorControls>
  //     </Fragment>
  //   )
  // });
})();
