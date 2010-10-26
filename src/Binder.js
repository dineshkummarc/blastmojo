/*!
 * The BlastMojoLite Framework
 *
 * Copyright (c) 2010 Blast Radius
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

Joose.Class('Mojolite.Binder', {
    has: {
        __context: { is: "ro", required: true },
        __eventMap: { is: "ro", init: []},
        delegated: {init: []},
        bound: {init: []}
    },
    methods : {
        BUILD: function(context, options) {
            if (options.context) {
                throw "Attempt to set reserved context parameter in " + this.my.className;
            }
            return $.extend({context: context}, options);
        },
        initialize: function(props) {
            var context = props.context;
            var binders = this.my.getBinders(context); 
            if (this.my.registeredToContext(context)) {
                return; //Already bound this binder to this elements
            } else {
                this.my.getBinders(context)[this.meta.name] = this;
            }
        },
        detach: function() {
            var binders = this.my.getBinders(this.context);
            delete binders[this.my.className];
        },
        bindEventMap: function() {
            var eventMap = this.getEventMap();
            Joose.A.each(eventMap, jQuery.proxy(this, 'bindDomEvent'));
        },
        bindDomEvent: function(args) {
            var binder = this, root = args[0], selector = args[1], event = args[2], handler = args[3];
            root = jQuery((root === "context") ? this.getContext() : document);

            if (typeof event === "function") event = event.call(this);
            if (typeof selector === "function") selector = selector.call(this);

            var shouldDelegate = (typeof selector === "string") && selector.length;

            if (!selector) selector = root;
            var data = {context: this.getContext(), binder: this}
            
            if (shouldDelegate) {
                binder.delegated.push([root, selector, event, binder[handler]]);
                root.delegate(selector, event, data, binder[handler]);
            } else {
                if (typeof selector === "string") selector = jQuery(selector, root);
                binder.bound.push([selector, event, binder[handler]]);
                selector.bind(event, data, binder[handler]);
            }
        },
        unbindEventMap: function() {
            Joose.A.each(this.delegated, function(d) {
                d[0].undelegate(d[1], d[2], d[3]);
            });
            this.delegated = [];
            
            Joose.A.each(this.bound, function(d) {
                d[0].unbind(d[1], d[2], d[3]);
            });
            this.bound = [];
        }
    },
    after: {
        initialize: function() {
           this.bindEventMap();
        }
    },
    before: {
        detach: function() {
            this.unbindEventMap();
        }
    },
    my: {
        has : {
            HOST: null
        },
        methods: {
            getBinders: function(context) {
                var data = context.data('mojolite');
                if (!data) { 
                    context.data('mojolite', data = {})
                }
                return (data.binders = data.binders || {});
            },
            registeredToContext: function(context) {
                return this.getBinders(context)[this.HOST.toString()];
            }
        }
    }
});