const isProduction = process.env.NODE_ENV === 'production';

const scriptType = new Set([
  'module',
  'text/javascript',
  'application/javascript',
]);

/**
 * @typedef {{
 * getHeadComponents(): any[]
 * replaceHeadComponents(head: any[]): void
 * getPostBodyComponents(): any[]
 * replacePostBodyComponents(postBody: any[]): void
 * }} Api
 *
 * @typedef {{
 * noScript?: boolean
 * noSourcemaps?: boolean
 * removeGeneratorTag?: boolean
 * removeReactHelmetAttrs?: boolean
 * noInlineStyles?: boolean
 * removeGatsbyAnnouncer?: boolean
 * }} Options
 *
 * @param {Api} api
 * @param {Options} options
 */
exports.onPreRenderHTML = (
  {
    getHeadComponents,
    replaceHeadComponents,
    getPostBodyComponents,
    replacePostBodyComponents,
  },
  {
    noScript = true,
    removeGeneratorTag = true,
    removeReactHelmetAttrs = true,
    noInlineStyles = false,
  },
) => {
  if (isProduction) {
    let head = getHeadComponents();
    let postBody = getPostBodyComponents();

    if (noScript) {
      head = head.filter(
        (i) => i.type !== 'link' || i.props.rel !== 'preload' || !(i.props.as === 'script' || i.props.as === 'fetch'),
      );

      postBody = postBody.filter(
        (i) => i.type !== 'script' || ('type' in i.props && !scriptType.has(i.props.type)),
      );
    }

    if (removeGeneratorTag) {
      head = head.filter(
        (i) => i.type !== 'meta' || i.props.name !== 'generator',
      );
    }

    if (removeReactHelmetAttrs) {
      const key = 'data-react-helmet';

      head.forEach((i) => {
        if ('props' in i && key in i.props) {
          delete i.props[key];
        }
      });
    }

    if (noInlineStyles) {
      const key = 'data-href';

      head.forEach((i) => {
        if (i.type === 'style' && key in i.props) {
          i.type = 'link';
          i.props = {
            rel: 'stylesheet',
            href: i.props[key],
          };
        }
      });
    }

    replaceHeadComponents(head);
    replacePostBodyComponents(postBody);
  }
};

/**
 * @param {{ element: Record<string, any> }} api
 * @param {Options} options
 * @returns {Record<string, any> | undefined}
 */
exports.wrapRootElement = (
  {
    element,
  },
  {
    removeGatsbyAnnouncer = false,
  },
) => {
  if (isProduction) {

    if (removeGatsbyAnnouncer) {
      element.props.children = element.props.children.filter(
        (i) => i.props.id !== 'gatsby-announcer',
      );
    }

    return element;
  }
};
