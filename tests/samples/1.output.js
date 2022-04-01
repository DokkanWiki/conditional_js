
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

                }
            } else if (template.nodeType) {
                template = template.innerHTML
            } else {

                return this
            }
        } else if (el) {
            template = getOuterHTML(el)
        }
        if (template) {



            const outputSourceRange = false;


            const { render, staticRenderFns } = compileToFunctions(template, {
                outputSourceRange,
                shouldDecodeNewlines,
                shouldDecodeNewlinesForHref,
                delimiters: options.delimiters,
                comments: options.comments
            }, this)
            options.render = render
            options.staticRenderFns = staticRenderFns


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