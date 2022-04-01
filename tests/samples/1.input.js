// @if NODE_ENV !== 'production'
import config from 'core/config'
import { warn } from 'core/util/index'
import { mark, measure } from 'core/util/perf'
// @endif
import { cached } from 'core/util/index'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
    const el = query(id)
    return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
    el,
    hydrating
) {
    el = el && query(el)

    if (el === document.body || el === document.documentElement) {
        // @if NODE_ENV !== 'production'
        warn(`Do not mount Vue to <html> or <body> - mount to normal elements instead.`)
        // @endif
        return this
    }

    const options = this.$options
    // resolve template/el and convert to render function
    if (!options.render) {
        let template = options.template
        if (template) {
            if (typeof template === 'string') {
                if (template.charAt(0) === '#') {
                    template = idToTemplate(template)
                    // @if NODE_ENV !== 'production'
                    if (!template) {
                        warn(`Template element not found or is empty: ${options.template}`, this)
                    }
                    // @endif
                }
            } else if (template.nodeType) {
                template = template.innerHTML
            } else {
                // @if NODE_ENV !== 'production'
                warn('invalid template option:' + template, this)
                // @endif
                return this
            }
        } else if (el) {
            template = getOuterHTML(el)
        }
        if (template) {
            // @if NODE_ENV !== 'production'
            if (config.performance && mark) {
                mark('compile')
            }
            // @endif

            // @if NODE_ENV !== 'production'
            const outputSourceRange = true;
            // @else
            const outputSourceRange = false;
            // @endif

            const { render, staticRenderFns } = compileToFunctions(template, {
                outputSourceRange,
                shouldDecodeNewlines,
                shouldDecodeNewlinesForHref,
                delimiters: options.delimiters,
                comments: options.comments
            }, this)
            options.render = render
            options.staticRenderFns = staticRenderFns

            // @if NODE_ENV !== 'production'
            if (config.performance && mark) {
                mark('compile end')
                measure(`vue ${this._name} compile`, 'compile', 'compile end')
            }
            // @endif
        }
    }
    return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el) {
    if (el.outerHTML) {
        return el.outerHTML
    } else {
        const container = document.createElement('div')
        container.appendChild(el.cloneNode(true))
        return container.innerHTML
    }
}

Vue.compile = compileToFunctions

export default Vue