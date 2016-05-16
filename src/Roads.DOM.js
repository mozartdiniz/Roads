var Ro = Ro || {};

/*
 *  DOM
 *
 * */

Ro.DOM = {

    vanish: function (initialRootElement, rootElement) {

        var el = rootElement || initialRootElement;

        if (el) {
            if (el.children && el.children.length) {

                for (var i = 0, l = el.children.length; i<l; i++) {
                    if (el.children[i]) {
                        Ro.DOM.vanish (initialRootElement, el.children[i]);
                    }
                }

            } else {
                if (el) {
                    el.innerHTML = '';
                    if (el.parentNode) {

                        if (initialRootElement !== el) {

                            var parent = el.parentNode;

                            el.parentNode.removeChild (el);

                            Ro.DOM.vanish (initialRootElement, parent);
                        }
                    }
                }
            }
        }
    },

    purge: function (d) {

        if (d) {
            var a = d.attributes, i, l, n;
            if (a) {
                for (i = a.length - 1; i >= 0; i -= 1) {
                    n = a[i].name;
                    if (typeof d[n] === 'function') {
                        d[n] = null;
                    }
                }
            }
            a = d.childNodes;
            if (a) {
                l = a.length;
                for (i = 0; i < l; i += 1) {
                    Ro.DOM.purge(d.childNodes[i]);
                }
            }
        }
    }
};