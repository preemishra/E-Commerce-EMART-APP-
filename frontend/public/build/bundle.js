var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update$1(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.57.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.57.0 */

    const { Error: Error_1, Object: Object_1, console: console_1$b } = globals;

    // (267:0) {:else}
    function create_else_block$7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(267:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (260:0) {#if componentParams}
    function create_if_block$f(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(260:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$f, create_else_block$7];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$b.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		restoreScroll,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getProductFromDb = async () => {
        try {
          const res = await fetch(
            `http://localhost:4000/api/product`,
            {
              method: "GET",
              headers: {
                "content-type": "application/json" 
                // "x-access-token": sessionStorage.getItem("authorization"),
              },
            }
          );
          const product = await res.json();
          return await product
        } catch (error) {
          console.log(error);
        } 
      };

      const searchProductFromDb = async (searchData) => {
        try {
          const res = await fetch(
            `http://localhost:4000/api/product/search/${searchData}`,
            {
              method: "GET",
              headers: {
                "content-type": "application/json" 
                // "x-access-token": sessionStorage.getItem("authorization"),
              },
            }
          );
          const product = await res.json();
          return await product
        } catch (error) {
          console.log(error);
        } 
      };
      

      const getSingleProductFromDb = async (produtId) => {
        try {
          const res = await fetch(
            `http://localhost:4000/api/product/${produtId}`,
            {
              method: "GET",
              headers: {
                "content-type": "application/json" 
                // "x-access-token": sessionStorage.getItem("authorization"),
              },
            }
          );
          const product = await res.json();
          return await product
        } catch (error) {
          console.log(error);
        } 
      };

    const CartItemsStore = writable({});
    const getSingleProductStore = writable({});
    const userDetail = writable();
    const loginStore = writable(localStorage.getItem('loggedInDetails'));

    // get all products
    class Product {
      async allProduct() {
        try {
          let productData = await getProductFromDb();
          return await productData;
        } catch (error) {
          console.log(error);
        }
      }

      async searchProduct(searchData) {
        try {
          let search = await searchProductFromDb(searchData);
          return await search;
        } catch (error) {}
      }

      async singleProductData(id) {
        try {
          let singleProduct = await getSingleProductFromDb(id);
          return await singleProduct;
        } catch (error) {
          console.log(error);
        }
      }

      async addToCartInLocal(cartData) {
        try {
          let totalCart = JSON.parse(localStorage.getItem("userCart")) || [];
          cartData.qty = 1;
          if (totalCart.length === 0) {
            totalCart.push(await cartData);
            localStorage.setItem("userCart", JSON.stringify(totalCart));
            return;
          } else {
            for (let index = 0; index < totalCart.length; index++) {
              if (totalCart[index].product_id === cartData.product_id) {
                totalCart[index].qty = totalCart[index].qty + 1;
                localStorage.setItem("userCart", JSON.stringify(totalCart));
                break;
              } else if (index === totalCart.length - 1) {
                totalCart.push(await cartData);
                localStorage.setItem("userCart", JSON.stringify(totalCart));
                break;
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      }

      async reduceFromCartInLocal(cartData) {
        try {
          let totalCart = JSON.parse(localStorage.getItem("userCart")) || [];
          
            for (let index = 0; index < totalCart.length; index++) {
              if (totalCart[index].product_id === cartData.product_id ) {
                if(totalCart[index].qty>1){
                  totalCart[index].qty = totalCart[index].qty - 1;
                  localStorage.setItem("userCart", JSON.stringify(totalCart));
                  break;
                }
              } 
            }
          
        } catch (error) {
          console.log(error);
        }
      }

      async removeFromLocal(cartData) {
        try {
          let totalCart = JSON.parse(localStorage.getItem("userCart")) || [];
            for (let index = 0; index < totalCart.length; index++) {
              if (totalCart[index].product_id === cartData.product_id ) {
                totalCart.splice(index,1);    
                localStorage.setItem("userCart", JSON.stringify(totalCart));
                break;
              }
            }
        } catch (error) {
          console.log(error);
        }
    }

      
      
      
      
      
      
      
      async itemsInLocalCart() {
        let cartItems = 0;
        try {
          let totalCart =
            (await JSON.parse(localStorage.getItem("userCart"))) || [];
          cartItems = await totalCart;
          console.log(cartItems);
          return await cartItems;
        } catch (error) {
          console.log(error);
        }
      }
    }

    /* src\components\shared\Navbar.svelte generated by Svelte v3.57.0 */

    const { console: console_1$a } = globals;

    const file$q = "src\\components\\shared\\Navbar.svelte";

    // (56:13) <a href="#/cart"                >
    function fallback_block$2(ctx) {
    	let a;
    	let span0;
    	let t0;
    	let span1;
    	let t1;

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			span0 = element("span");
    			t0 = text("Cart\r\n              ");
    			span1 = element("span");
    			t1 = text(/*cartItem*/ ctx[1]);
    			attr_dev(span0, "class", "glyphicon glyphicon-shopping-cart ");
    			add_location(span0, file$q, 56, 15, 1800);
    			attr_dev(span1, "class", "cartQty svelte-1bl05dk");
    			add_location(span1, file$q, 57, 14, 1871);
    			attr_dev(a, "href", "#/cart");
    			attr_dev(a, "class", "svelte-1bl05dk");
    			add_location(a, file$q, 55, 13, 1767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span0);
    			append_dev(a, t0);
    			append_dev(a, span1);
    			append_dev(span1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cartItem*/ 2) set_data_dev(t1, /*cartItem*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(56:13) <a href=\\\"#/cart\\\"                >",
    		ctx
    	});

    	return block_1;
    }

    // (74:31) 
    function create_if_block_1$6(ctx) {
    	let ul;
    	let li5;
    	let a0;
    	let svg;
    	let path0;
    	let path1;
    	let t0;
    	let div;
    	let li0;
    	let p;
    	let t4;
    	let li1;
    	let a1;
    	let t6;
    	let li2;
    	let a2;
    	let t8;
    	let li3;
    	let a3;
    	let t10;
    	let li4;
    	let a4;
    	let mounted;
    	let dispose;

    	const block_1 = {
    		c: function create() {
    			ul = element("ul");
    			li5 = element("li");
    			a0 = element("a");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			div = element("div");
    			li0 = element("li");
    			p = element("p");
    			p.textContent = `     ${JSON.parse(localStorage.getItem('loggedInDetails')).email}!`;
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Edit Profile";
    			t6 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "My Orders";
    			t8 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Change Password";
    			t10 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Log Out";
    			attr_dev(path0, "d", "M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z");
    			add_location(path0, file$q, 94, 18, 3361);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "d", "M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z");
    			add_location(path1, file$q, 95, 18, 3428);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "40");
    			attr_dev(svg, "height", "40");
    			attr_dev(svg, "fill", "currentColor");
    			attr_dev(svg, "class", "bi bi-person-circle");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			add_location(svg, file$q, 86, 16, 3078);
    			attr_dev(a0, "class", "nav-link dropdown-toggle svelte-1bl05dk");
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "id", "navbarDropdownMenuLink");
    			attr_dev(a0, "role", "button");
    			attr_dev(a0, "data-toggle", "dropdown");
    			attr_dev(a0, "aria-haspopup", "true");
    			attr_dev(a0, "aria-expanded", "false");
    			add_location(a0, file$q, 77, 14, 2772);
    			attr_dev(p, "class", "dropdown-item");
    			attr_dev(p, "href", "#");
    			add_location(p, file$q, 106, 18, 3867);
    			add_location(li0, file$q, 105, 16, 3843);
    			attr_dev(a1, "class", "dropdown-item svelte-1bl05dk");
    			attr_dev(a1, "href", "#/login/user/myprofile");
    			add_location(a1, file$q, 110, 20, 4082);
    			add_location(li1, file$q, 110, 16, 4078);
    			attr_dev(a2, "class", "dropdown-item svelte-1bl05dk");
    			attr_dev(a2, "href", "#/login/user/myorders");
    			add_location(a2, file$q, 111, 20, 4180);
    			add_location(li2, file$q, 111, 16, 4176);
    			attr_dev(a3, "class", "dropdown-item svelte-1bl05dk");
    			attr_dev(a3, "href", "#/login/user/changepassword");
    			add_location(a3, file$q, 112, 20, 4274);
    			add_location(li3, file$q, 112, 16, 4270);
    			attr_dev(a4, "class", "dropdown-item svelte-1bl05dk");
    			attr_dev(a4, "href", "#/");
    			add_location(a4, file$q, 113, 20, 4380);
    			add_location(li4, file$q, 113, 16, 4376);
    			attr_dev(div, "class", "dropdown-menu");
    			attr_dev(div, "aria-labelledby", "navbarDropdownMenuLink");
    			add_location(div, file$q, 101, 14, 3707);
    			attr_dev(li5, "class", "nav-item dropdown");
    			add_location(li5, file$q, 76, 12, 2726);
    			attr_dev(ul, "class", "navbar-nav svelte-1bl05dk");
    			add_location(ul, file$q, 75, 10, 2689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li5);
    			append_dev(li5, a0);
    			append_dev(a0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(li5, t0);
    			append_dev(li5, div);
    			append_dev(div, li0);
    			append_dev(li0, p);
    			append_dev(div, t4);
    			append_dev(div, li1);
    			append_dev(li1, a1);
    			append_dev(div, t6);
    			append_dev(div, li2);
    			append_dev(li2, a2);
    			append_dev(div, t8);
    			append_dev(div, li3);
    			append_dev(li3, a3);
    			append_dev(div, t10);
    			append_dev(div, li4);
    			append_dev(li4, a4);

    			if (!mounted) {
    				dispose = listen_dev(a4, "click", /*click_handler*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(74:31) ",
    		ctx
    	});

    	return block_1;
    }

    // (62:8) {#if (loginDetail===null ||loginDetail===undefined||loginDetail.length===0)}
    function create_if_block$e(ctx) {
    	let li2;
    	let a0;
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let ul;
    	let li0;
    	let a1;
    	let t3;
    	let li1;
    	let a2;

    	const block_1 = {
    		c: function create() {
    			li2 = element("li");
    			a0 = element("a");
    			span0 = element("span");
    			t0 = text(" Login");
    			span1 = element("span");
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Login as User";
    			t3 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Login as Seller";
    			attr_dev(span0, "class", "glyphicon glyphicon-log-in");
    			add_location(span0, file$q, 64, 15, 2176);
    			attr_dev(span1, "class", "caret");
    			add_location(span1, file$q, 64, 64, 2225);
    			attr_dev(a0, "class", "dropdown-toggle svelte-1bl05dk");
    			attr_dev(a0, "data-toggle", "dropdown");
    			attr_dev(a0, "href", "#/login");
    			add_location(a0, file$q, 63, 12, 2095);
    			attr_dev(a1, "href", "#/login/user");
    			attr_dev(a1, "class", "svelte-1bl05dk");
    			add_location(a1, file$q, 69, 18, 2357);
    			add_location(li0, file$q, 69, 14, 2353);
    			attr_dev(a2, "href", "#/login/seller");
    			attr_dev(a2, "class", "svelte-1bl05dk");
    			add_location(a2, file$q, 70, 18, 2422);
    			add_location(li1, file$q, 70, 14, 2418);
    			attr_dev(ul, "class", "dropdown-menu svelte-1bl05dk");
    			add_location(ul, file$q, 68, 12, 2311);
    			attr_dev(li2, "class", "dropdown");
    			add_location(li2, file$q, 62, 10, 2060);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li2, anchor);
    			append_dev(li2, a0);
    			append_dev(a0, span0);
    			append_dev(a0, t0);
    			append_dev(a0, span1);
    			append_dev(li2, t1);
    			append_dev(li2, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(62:8) {#if (loginDetail===null ||loginDetail===undefined||loginDetail.length===0)}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$q(ctx) {
    	let main;
    	let nav;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let ul;
    	let li0;
    	let a0;
    	let t2;
    	let li1;
    	let a1;
    	let t4;
    	let li2;
    	let t5;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	const default_slot_or_fallback = default_slot || fallback_block$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*loginDetail*/ ctx[0] === null || /*loginDetail*/ ctx[0] === undefined || /*loginDetail*/ ctx[0].length === 0) return create_if_block$e;
    		if (/*loginDetail*/ ctx[0]) return create_if_block_1$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block_1 = {
    		c: function create() {
    			main = element("main");
    			nav = element("nav");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t2 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "About";
    			t4 = space();
    			li2 = element("li");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t5 = space();
    			if (if_block) if_block.c();
    			attr_dev(img, "class", "navbar-brand svelte-1bl05dk");
    			if (!src_url_equal(img.src, img_src_value = logo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "EMART");
    			add_location(img, file$q, 47, 8, 1431);
    			attr_dev(div0, "class", "navbar-header");
    			add_location(div0, file$q, 46, 6, 1394);
    			attr_dev(a0, "href", "#/");
    			attr_dev(a0, "class", "svelte-1bl05dk");
    			add_location(a0, file$q, 51, 27, 1619);
    			attr_dev(li0, "class", "active");
    			add_location(li0, file$q, 51, 8, 1600);
    			attr_dev(a1, "href", "#/about");
    			attr_dev(a1, "class", "svelte-1bl05dk");
    			add_location(a1, file$q, 52, 27, 1674);
    			attr_dev(li1, "class", "active");
    			add_location(li1, file$q, 52, 8, 1655);
    			attr_dev(li2, "class", "active");
    			add_location(li2, file$q, 53, 8, 1716);
    			attr_dev(ul, "class", "nav navbar-nav navbar-right svelte-1bl05dk");
    			add_location(ul, file$q, 50, 6, 1550);
    			attr_dev(div1, "class", "container-fluid svelte-1bl05dk");
    			add_location(div1, file$q, 45, 4, 1357);
    			attr_dev(nav, "class", "navbar navbar-inverse svelte-1bl05dk");
    			add_location(nav, file$q, 44, 2, 1316);
    			attr_dev(main, "class", "svelte-1bl05dk");
    			add_location(main, file$q, 43, 0, 1306);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t4);
    			append_dev(ul, li2);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(li2, null);
    			}

    			append_dev(ul, t5);
    			if (if_block) if_block.m(ul, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*cartItem*/ 2)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(ul, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    const logo = "https://res.cloudinary.com/dgb9aajxo/image/upload/v1679737882/logo_ffaqcn.png";

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, ['default']);
    	const productClass = new Product();

    	// let loginDetail = JSON.parse(sessionStorage.getItem("user"));
    	// let user_id = loginDetail.user_id;
    	// let full_name = loginDetail.full_name;
    	let block;

    	// let loginDetail=null
    	onMount(async () => {
    		let product = await productClass.itemsInLocalCart();
    		$$invalidate(1, cartItem = product);
    		increment(cartItem);
    	});

    	let loginDetail;

    	loginStore.subscribe(value => {
    		console.log(value);
    		$$invalidate(0, loginDetail = value);
    	});

    	// getSingleProductStore.subscribe((value) => {
    	//   localStorage.getItem('loggedInDetails')
    	// })
    	let cartItem;

    	CartItemsStore.subscribe(value => {
    		$$invalidate(1, cartItem = value.length);
    		console.log(cartItem);
    	});

    	let increment = async cartItems => {
    		CartItemsStore.set(await cartItems);
    	};

    	const navData = async id => {
    		let singleProduct = await productClass.getSingleProductFromDb(id);
    		console.log(singleProduct);
    		return await singleProduct;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$a.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		localStorage.setItem("loggedInDetails", []);
    		loginStore.set([]);
    	};

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Product,
    		CartItemsStore,
    		getSingleProductStore,
    		loginStore,
    		productClass,
    		logo,
    		block,
    		loginDetail,
    		cartItem,
    		increment,
    		navData
    	});

    	$$self.$inject_state = $$props => {
    		if ('block' in $$props) block = $$props.block;
    		if ('loginDetail' in $$props) $$invalidate(0, loginDetail = $$props.loginDetail);
    		if ('cartItem' in $$props) $$invalidate(1, cartItem = $$props.cartItem);
    		if ('increment' in $$props) increment = $$props.increment;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loginDetail, cartItem, $$scope, slots, click_handler];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src\components\Cart.svelte generated by Svelte v3.57.0 */

    const { console: console_1$9 } = globals;
    const file$p = "src\\components\\Cart.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (63:2) {:else}
    function create_else_block$6(ctx) {
    	let div9;
    	let div8;
    	let div7;
    	let h1;
    	let t1;
    	let div6;
    	let div5;
    	let t2;
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let h4;
    	let t3;
    	let t4_value = /*calculateTotalPrice*/ ctx[2]() + "";
    	let t4;
    	let t5;
    	let a;
    	let div1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*$CartItemsStore*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Your Shopping Cart";
    			t1 = space();
    			div6 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t3 = text("Total: ₹");
    			t4 = text(t4_value);
    			t5 = space();
    			a = element("a");
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Proceed to Buy";
    			add_location(h1, file$p, 66, 10, 2305);
    			add_location(h4, file$p, 118, 22, 4604);
    			attr_dev(div0, "class", "col-md-8");
    			add_location(div0, file$p, 117, 20, 4558);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-success btn-lg btn-block svelte-1psq2kd");
    			add_location(button, file$p, 122, 24, 4787);
    			attr_dev(div1, "class", "col-md-4");
    			add_location(div1, file$p, 121, 22, 4739);
    			attr_dev(a, "href", "#/cart/buy");
    			add_location(a, file$p, 120, 20, 4694);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$p, 116, 18, 4519);
    			attr_dev(div3, "class", "panel-footer");
    			add_location(div3, file$p, 115, 16, 4473);
    			attr_dev(div4, "class", "panel panel-default");
    			add_location(div4, file$p, 114, 14, 4422);
    			attr_dev(div5, "class", "col-md-12");
    			add_location(div5, file$p, 68, 12, 2375);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$p, 67, 10, 2344);
    			attr_dev(div7, "class", "col-md-12");
    			add_location(div7, file$p, 65, 8, 2270);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$p, 64, 6, 2243);
    			attr_dev(div9, "class", "container");
    			add_location(div9, file$p, 63, 4, 2212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, h1);
    			append_dev(div7, t1);
    			append_dev(div7, div6);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div5, null);
    				}
    			}

    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t3);
    			append_dev(h4, t4);
    			append_dev(div2, t5);
    			append_dev(div2, a);
    			append_dev(a, div1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*buyNow*/ ctx[6], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$CartItemsStore, removeItemFromCart, AddItemInCart, reduceFromCart*/ 57) {
    				each_value = /*$CartItemsStore*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*calculateTotalPrice*/ 4 && t4_value !== (t4_value = /*calculateTotalPrice*/ ctx[2]() + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(63:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#if cartItemData.length === 0}
    function create_if_block$d(ctx) {
    	let h1;
    	let b;
    	let t1;
    	let h5;
    	let t3;
    	let h6;
    	let a;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			b = element("b");
    			b.textContent = "OOPS! Your Cart is Empty!";
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = "Looks like you haven't added anything to your cart yet.";
    			t3 = space();
    			h6 = element("h6");
    			a = element("a");
    			a.textContent = "Shop Now";
    			add_location(b, file$p, 59, 52, 2006);
    			attr_dev(h1, "class", "space-above text-danger text-center svelte-1psq2kd");
    			add_location(h1, file$p, 59, 4, 1958);
    			attr_dev(h5, "class", "text-center");
    			add_location(h5, file$p, 60, 4, 2049);
    			attr_dev(a, "href", "#/");
    			add_location(a, file$p, 61, 29, 2164);
    			attr_dev(h6, "class", "text-center");
    			add_location(h6, file$p, 61, 4, 2139);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, b);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h6, anchor);
    			append_dev(h6, a);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(59:2) {#if cartItemData.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (70:14) {#each $CartItemsStore as cartItem, index}
    function create_each_block$6(ctx) {
    	let div6;
    	let div5;
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let h40;
    	let t1_value = /*cartItem*/ ctx[11].product_name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*cartItem*/ ctx[11].descriptions + "";
    	let t3;
    	let t4;
    	let div1;
    	let button0;
    	let t6;
    	let button1;
    	let t7_value = /*cartItem*/ ctx[11].qty + "";
    	let t7;
    	let t8;
    	let button2;
    	let t10;
    	let button3;
    	let t12;
    	let div3;
    	let h41;
    	let t13;
    	let t14_value = /*cartItem*/ ctx[11].qty * /*cartItem*/ ctx[11].price + "";
    	let t14;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*cartItem*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			h40 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "-";
    			t6 = space();
    			button1 = element("button");
    			t7 = text(t7_value);
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "+";
    			t10 = space();
    			button3 = element("button");
    			button3.textContent = "Remove";
    			t12 = space();
    			div3 = element("div");
    			h41 = element("h4");
    			t13 = text("Price: ₹");
    			t14 = text(t14_value);
    			if (!src_url_equal(img.src, img_src_value = /*cartItem*/ ctx[11].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-responsive");
    			attr_dev(img, "alt", "Product Image");
    			add_location(img, file$p, 75, 24, 2733);
    			attr_dev(div0, "class", "col-md-2");
    			add_location(div0, file$p, 73, 22, 2614);
    			add_location(h40, file$p, 82, 24, 3014);
    			add_location(p, file$p, 83, 24, 3072);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-default svelte-1psq2kd");
    			add_location(button0, file$p, 85, 26, 3192);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-default svelte-1psq2kd");
    			add_location(button1, file$p, 92, 26, 3498);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "btn btn-default svelte-1psq2kd");
    			add_location(button2, file$p, 95, 26, 3653);
    			attr_dev(div1, "class", "btn-group");
    			attr_dev(div1, "role", "group");
    			add_location(div1, file$p, 84, 24, 3128);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "btn btn-danger  svelte-1psq2kd");
    			add_location(button3, file$p, 101, 24, 3917);
    			attr_dev(div2, "class", "col-md-6");
    			add_location(div2, file$p, 81, 22, 2966);
    			add_location(h41, file$p, 108, 24, 4227);
    			attr_dev(div3, "class", "col-md-4");
    			add_location(div3, file$p, 107, 22, 4179);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$p, 72, 20, 2573);
    			attr_dev(div5, "class", "panel-body");
    			add_location(div5, file$p, 71, 18, 2527);
    			attr_dev(div6, "class", "panel panel-default");
    			add_location(div6, file$p, 70, 16, 2474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, h40);
    			append_dev(h40, t1);
    			append_dev(div2, t2);
    			append_dev(div2, p);
    			append_dev(p, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t6);
    			append_dev(div1, button1);
    			append_dev(button1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, button2);
    			append_dev(div2, t10);
    			append_dev(div2, button3);
    			append_dev(div4, t12);
    			append_dev(div4, div3);
    			append_dev(div3, h41);
    			append_dev(h41, t13);
    			append_dev(h41, t14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false, false),
    					listen_dev(
    						button2,
    						"click",
    						function () {
    							if (is_function(/*AddItemInCart*/ ctx[3](/*cartItem*/ ctx[11]))) /*AddItemInCart*/ ctx[3](/*cartItem*/ ctx[11]).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button3,
    						"click",
    						function () {
    							if (is_function(/*removeItemFromCart*/ ctx[5](/*cartItem*/ ctx[11]))) /*removeItemFromCart*/ ctx[5](/*cartItem*/ ctx[11]).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$CartItemsStore*/ 1 && !src_url_equal(img.src, img_src_value = /*cartItem*/ ctx[11].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$CartItemsStore*/ 1 && t1_value !== (t1_value = /*cartItem*/ ctx[11].product_name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$CartItemsStore*/ 1 && t3_value !== (t3_value = /*cartItem*/ ctx[11].descriptions + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$CartItemsStore*/ 1 && t7_value !== (t7_value = /*cartItem*/ ctx[11].qty + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$CartItemsStore*/ 1 && t14_value !== (t14_value = /*cartItem*/ ctx[11].qty * /*cartItem*/ ctx[11].price + "")) set_data_dev(t14, t14_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(70:14) {#each $CartItemsStore as cartItem, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let main;

    	function select_block_type(ctx, dirty) {
    		if (/*cartItemData*/ ctx[1].length === 0) return create_if_block$d;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			add_location(main, file$p, 57, 0, 1911);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let calculateTotalPrice;
    	let $CartItemsStore;
    	validate_store(CartItemsStore, 'CartItemsStore');
    	component_subscribe($$self, CartItemsStore, $$value => $$invalidate(0, $CartItemsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cart', slots, []);
    	const productClass = new Product();

    	const AddItemInCart = async cartItem => {
    		await productClass.addToCartInLocal(cartItem);
    		let totalData = await productClass.itemsInLocalCart();
    		increment(totalData);
    	};

    	const reduceFromCart = async CartItem => {
    		await productClass.reduceFromCartInLocal(CartItem);
    		let totalData = await productClass.itemsInLocalCart();
    		increment(totalData);
    	};

    	const removeItemFromCart = async cartItem => {
    		await productClass.removeFromLocal(cartItem);
    		let totalData = await productClass.itemsInLocalCart();
    		increment(totalData);
    	};

    	let increment = async totalData => {
    		CartItemsStore.set(await totalData);
    		sessionStorage.setItem("productId", JSON.stringify(totalData));
    	};

    	let cartItemData;
    	let totalCart = JSON.parse(localStorage.getItem("userCart")) || [];
    	CartItemsStore.set(totalCart);

    	CartItemsStore.subscribe(value => {
    		let cartItem = value;
    		$$invalidate(1, cartItemData = cartItem);
    		console.log(cartItemData.length);
    	});

    	const buyNow = async () => {
    		({
    			product_id: totalCart[0].product_id,
    			product_name: cartItemData.product_name,
    			price: cartItemData.price,
    			descriptions: cartItemData.descriptions,
    			ordered_qty: cartItemData.product_qty,
    			picture: cartItemData.picture,
    			isAddress: ""
    		});

    		sessionStorage.setItem("productId", JSON.stringify(totalCart));
    		push("/cart/buy");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$9.warn(`<Cart> was created with unknown prop '${key}'`);
    	});

    	const click_handler = cartItem => {
    		reduceFromCart(cartItem);
    	};

    	$$self.$capture_state = () => ({
    		Product,
    		CartItemsStore,
    		getSingleProductStore,
    		push,
    		pop,
    		replace,
    		productClass,
    		AddItemInCart,
    		reduceFromCart,
    		removeItemFromCart,
    		increment,
    		cartItemData,
    		totalCart,
    		buyNow,
    		calculateTotalPrice,
    		$CartItemsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('increment' in $$props) increment = $$props.increment;
    		if ('cartItemData' in $$props) $$invalidate(1, cartItemData = $$props.cartItemData);
    		if ('totalCart' in $$props) totalCart = $$props.totalCart;
    		if ('calculateTotalPrice' in $$props) $$invalidate(2, calculateTotalPrice = $$props.calculateTotalPrice);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$CartItemsStore*/ 1) {
    			$$invalidate(2, calculateTotalPrice = () => {
    				let totalPrice = 0;

    				$CartItemsStore.forEach(item => {
    					totalPrice += item.price * item.qty;
    				});

    				return totalPrice;
    			});
    		}
    	};

    	return [
    		$CartItemsStore,
    		cartItemData,
    		calculateTotalPrice,
    		AddItemInCart,
    		reduceFromCart,
    		removeItemFromCart,
    		buyNow,
    		click_handler
    	];
    }

    class Cart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cart",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    class User {
      async saveAddressServices(address) {
        console.log(address);
        try {
          const res = await fetch(
            `http://localhost:4000/api/user/user-address-login`,
            {
              method: "Post",
              headers: {
                "content-type": "application/json",
                // "x-access-token": sessionStorage.getItem("authorization"),
              },
              body: JSON.stringify(address),
            }
          );
          const result = await res.json();
          return await result;
        } catch (error) {
          console.log(error);
          return await error;
        }
      }

      async createUserServices(userData) {
        console.log(userData);
        try {
          const res = await fetch(`http://localhost:4000/api/user/user-login`, {
            method: "Post",
            headers: {
              "content-type": "application/json",
              // "x-access-token": sessionStorage.getItem("authorization"),
            },
            body: JSON.stringify(userData),
          });
          const result = await res.json();
          return await result;
        } catch (error) {
          console.log(error);
          return await error;
        }
      }

      async getAddressServices(userId) {
        console.log(userId);
        try {
          const res = await fetch(`http://localhost:4000/api/user/${userId}`, {
            method: "GET",
            headers: {
              "content-type": "application/json",
              // "x-access-token": sessionStorage.getItem("authorization"),
            },
          });
          const result = await res.json();
          return await result;
        } catch (error) {
          console.log(error);
          return await error;
        }
      }

      async checkUserExistServices(email) {
        console.log(email);
        try {
          const res = await fetch(`http://localhost:4000/api/user/is-exist`, {
            method: "Post",
            headers: {
              "content-type": "application/json",
              // "x-access-token": sessionStorage.getItem("authorization"),
            },
            body: JSON.stringify({ email: email }),
          });
          const result = await res.json();
          return await result;
        } catch (error) {
          console.log(error);
          return await error;
        }
      }

      async placeOrderServices(orderDetails) {
        console.log(orderDetails);
        try {
          const res = await fetch(`http://localhost:4000/api/order`, {
            method: "Post",
            headers: {
              "content-type": "application/json",
              // "x-access-token": sessionStorage.getItem("authorization"),
            },
            body: JSON.stringify(orderDetails),
          });
          const result = await res.json();
          return await result;
        } catch (error) {
          console.log(error);
          return await error;
        }
      }

      async paymentDetailServices(paymentDetail) {
        console.log(paymentDetail);
        try {
          const res = await fetch(`http://localhost:4000/api/order/pay`, {
            method: "Post",
            headers: {
              "content-type": "application/json",
              // "x-access-token": sessionStorage.getItem("authorization"),
            },
            body: JSON.stringify(paymentDetail),
          });
          const result = await res.json();
          return await result;
        } catch (error) {
          console.log(error);
          return await error;
        }
      }

      // async editProfileService(
      //   fullName,email
      // ) {
      //   try {
          
      //     console.log(res);
      //     return await res.json();
      //   } catch (error) {
      //     return error;
      //   }
      // }

      async changePasswordService(
        oldPassword,
        newPassword,
        confirmNewPassword
      ) {
        try {
          const res = await fetch(
            `http://localhost:4000/api/user/my-profile/change-password`,
            {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
                // "x-access-token": sessionStorage.getItem("authorization"),
              },
              body: JSON.stringify({
                currentPassword: oldPassword,
                newPassword: newPassword,
                confirmPassword: confirmNewPassword,
                email: JSON.parse(localStorage.loggedInDetails).email,
              }),
            }
          );
          console.log(res);
          return await res.json();
        } catch (error) {
          return error;
        }
      }
    }

    const userServicesClass = new User();
    // get all products
    class UserController {
      async saveAddressController(address) {
        try {
          let addressResp = await userServicesClass.saveAddressServices(address);

          return await addressResp;
        } catch (error) {
          console.log(error);
        }
      }

      // async editProfileController(fullName, email) {
      //   try {
      //     const response = await userServicesClass.editProfileService(
      //       fullName,
      //       email
      //     );
      //     console.log(response);
      //     return await response;
      //   } catch (error) {}
      // }

      async changePasswordController(oldPassword, newPassword, confirmNewPassword) {
        console.log(oldPassword, newPassword);
        console.log(confirmNewPassword);
        try {
          const response = await userServicesClass.changePasswordService(
            oldPassword,
            newPassword,
            confirmNewPassword
          );
          console.log(response);
          return await response;
        } catch (error) {}
      }

      async createUserController(userData) {
        try {
          let userResp = await userServicesClass.createUserServices(userData);
          console.log(userResp);
          let userDetails = {
            user_id: userResp.data.user_id,
            full_name: userResp.data.email,
          };
          userDetail.set(userDetails);
          sessionStorage.setItem("user", JSON.stringify(userDetail));
          return await userResp;
        } catch (error) {
          console.log(error);
        }
      }

      async getAddressController(userId) {
        try {
          let address = await userServicesClass.getAddressServices(userId);
          return await address;
        } catch (error) {
          console.log(error);
        }
      }

      async checkUserExistController(email) {
        try {
          let userStatus = await userServicesClass.checkUserExistServices(email);
          return await userStatus;
        } catch (error) {
          console.log(error);
        }
      }

      async placeOrderController(orderDetails) {
        try {
          let orderResp = await userServicesClass.placeOrderServices(orderDetails);
          console.log(orderResp);
          return await orderResp;
        } catch (error) {
          console.log(error);
        }
      }

      async paymentDetailController(paymentDetail) {
        try {
          let paymentResp = await userServicesClass.paymentDetailServices(
            paymentDetail
          );
          console.log(paymentResp);
          return await paymentResp;
        } catch (error) {
          console.log(error);
        }
      }
    }

    /**
     * @external Store
     * @see [Svelte stores](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values-store-contract)
     */

    /**
     * Create a store similar to [Svelte's `derived`](https://svelte.dev/docs#run-time-svelte-store-writable),
     * but which has its own `set` and `update` methods and can send values back to the origin stores.
     * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#default-export-writablederived)
     * 
     * @param {Store|Store[]} origins One or more stores to derive from. Same as
     * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 1st parameter.
     * @param {!Function} derive The callback to determine the derived value. Same as
     * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 2nd parameter.
     * @param {!Function} reflect Called when the derived store gets a new value via its `set` or
     * `update` methods, and determines new values for the origin stores.
     * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#new-parameter-reflect)
     * @param [initial] The new store's initial value. Same as
     * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 3rd parameter.
     * 
     * @returns {Store} A writable store.
     */
    function writableDerived(origins, derive, reflect, initial) {
    	var childDerivedSetter, originValues, blockNextDerive = false;
    	var reflectOldValues = reflect.length >= 2;
    	var wrappedDerive = (got, set) => {
    		childDerivedSetter = set;
    		if (reflectOldValues) {
    			originValues = got;
    		}
    		if (!blockNextDerive) {
    			let returned = derive(got, set);
    			if (derive.length < 2) {
    				set(returned);
    			} else {
    				return returned;
    			}
    		}
    		blockNextDerive = false;
    	};
    	var childDerived = derived(origins, wrappedDerive, initial);
    	
    	var singleOrigin = !Array.isArray(origins);
    	function doReflect(reflecting) {
    		var setWith = reflect(reflecting, originValues);
    		if (singleOrigin) {
    			blockNextDerive = true;
    			origins.set(setWith);
    		} else {
    			setWith.forEach( (value, i) => {
    				blockNextDerive = true;
    				origins[i].set(value);
    			} );
    		}
    		blockNextDerive = false;
    	}
    	
    	var tryingSet = false;
    	function update(fn) {
    		var isUpdated, mutatedBySubscriptions, oldValue, newValue;
    		if (tryingSet) {
    			newValue = fn( get_store_value(childDerived) );
    			childDerivedSetter(newValue);
    			return;
    		}
    		var unsubscribe = childDerived.subscribe( (value) => {
    			if (!tryingSet) {
    				oldValue = value;
    			} else if (!isUpdated) {
    				isUpdated = true;
    			} else {
    				mutatedBySubscriptions = true;
    			}
    		} );
    		newValue = fn(oldValue);
    		tryingSet = true;
    		childDerivedSetter(newValue);
    		unsubscribe();
    		tryingSet = false;
    		if (mutatedBySubscriptions) {
    			newValue = get_store_value(childDerived);
    		}
    		if (isUpdated) {
    			doReflect(newValue);
    		}
    	}
    	return {
    		subscribe: childDerived.subscribe,
    		set(value) { update( () => value ); },
    		update,
    	};
    }

    const TOAST_LIMIT = 20;
    const toasts = writable([]);
    const pausedAt = writable(null);
    const toastTimeouts = new Map();
    const addToRemoveQueue = (toastId) => {
        if (toastTimeouts.has(toastId)) {
            return;
        }
        const timeout = setTimeout(() => {
            toastTimeouts.delete(toastId);
            remove(toastId);
        }, 1000);
        toastTimeouts.set(toastId, timeout);
    };
    const clearFromRemoveQueue = (toastId) => {
        const timeout = toastTimeouts.get(toastId);
        if (timeout) {
            clearTimeout(timeout);
        }
    };
    function update(toast) {
        if (toast.id) {
            clearFromRemoveQueue(toast.id);
        }
        toasts.update(($toasts) => $toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t)));
    }
    function add(toast) {
        toasts.update(($toasts) => [toast, ...$toasts].slice(0, TOAST_LIMIT));
    }
    function upsert(toast) {
        if (get_store_value(toasts).find((t) => t.id === toast.id)) {
            update(toast);
        }
        else {
            add(toast);
        }
    }
    function dismiss(toastId) {
        toasts.update(($toasts) => {
            if (toastId) {
                addToRemoveQueue(toastId);
            }
            else {
                $toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id);
                });
            }
            return $toasts.map((t) => t.id === toastId || toastId === undefined ? { ...t, visible: false } : t);
        });
    }
    function remove(toastId) {
        toasts.update(($toasts) => {
            if (toastId === undefined) {
                return [];
            }
            return $toasts.filter((t) => t.id !== toastId);
        });
    }
    function startPause(time) {
        pausedAt.set(time);
    }
    function endPause(time) {
        let diff;
        pausedAt.update(($pausedAt) => {
            diff = time - ($pausedAt || 0);
            return null;
        });
        toasts.update(($toasts) => $toasts.map((t) => ({
            ...t,
            pauseDuration: t.pauseDuration + diff
        })));
    }
    const defaultTimeouts = {
        blank: 1000,
        error: 1000,
        success: 1000,
        loading: Infinity,
        custom: 1000
    };
    function useToasterStore(toastOptions = {}) {
        const mergedToasts = writableDerived(toasts, ($toasts) => $toasts.map((t) => ({
            ...toastOptions,
            ...toastOptions[t.type],
            ...t,
            duration: t.duration ||
                toastOptions[t.type]?.duration ||
                toastOptions?.duration ||
                defaultTimeouts[t.type],
            style: [toastOptions.style, toastOptions[t.type]?.style, t.style].join(';')
        })), ($toasts) => $toasts);
        return {
            toasts: mergedToasts,
            pausedAt
        };
    }

    const isFunction = (valOrFunction) => typeof valOrFunction === 'function';
    const resolveValue = (valOrFunction, arg) => (isFunction(valOrFunction) ? valOrFunction(arg) : valOrFunction);

    const genId = (() => {
        let count = 0;
        return () => {
            count += 1;
            return count.toString();
        };
    })();
    const prefersReducedMotion = (() => {
        // Cache result
        let shouldReduceMotion;
        return () => {
            if (shouldReduceMotion === undefined && typeof window !== 'undefined') {
                const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
                shouldReduceMotion = !mediaQuery || mediaQuery.matches;
            }
            return shouldReduceMotion;
        };
    })();

    const createToast = (message, type = 'blank', opts) => ({
        createdAt: Date.now(),
        visible: true,
        type,
        ariaProps: {
            role: 'status',
            'aria-live': 'polite'
        },
        message,
        pauseDuration: 0,
        ...opts,
        id: opts?.id || genId()
    });
    const createHandler = (type) => (message, options) => {
        const toast = createToast(message, type, options);
        upsert(toast);
        return toast.id;
    };
    const toast = (message, opts) => createHandler('blank')(message, opts);
    toast.error = createHandler('error');
    toast.success = createHandler('success');
    toast.loading = createHandler('loading');
    toast.custom = createHandler('custom');
    toast.dismiss = (toastId) => {
        dismiss(toastId);
    };
    toast.remove = (toastId) => remove(toastId);
    toast.promise = (promise, msgs, opts) => {
        const id = toast.loading(msgs.loading, { ...opts, ...opts?.loading });
        promise
            .then((p) => {
            toast.success(resolveValue(msgs.success, p), {
                id,
                ...opts,
                ...opts?.success
            });
            return p;
        })
            .catch((e) => {
            toast.error(resolveValue(msgs.error, e), {
                id,
                ...opts,
                ...opts?.error
            });
        });
        return promise;
    };

    function calculateOffset(toast, $toasts, opts) {
        const { reverseOrder, gutter = 8, defaultPosition } = opts || {};
        const relevantToasts = $toasts.filter((t) => (t.position || defaultPosition) === (toast.position || defaultPosition) && t.height);
        const toastIndex = relevantToasts.findIndex((t) => t.id === toast.id);
        const toastsBefore = relevantToasts.filter((toast, i) => i < toastIndex && toast.visible).length;
        const offset = relevantToasts
            .filter((t) => t.visible)
            .slice(...(reverseOrder ? [toastsBefore + 1] : [0, toastsBefore]))
            .reduce((acc, t) => acc + (t.height || 0) + gutter, 0);
        return offset;
    }
    const handlers = {
        startPause() {
            startPause(Date.now());
        },
        endPause() {
            endPause(Date.now());
        },
        updateHeight: (toastId, height) => {
            update({ id: toastId, height });
        },
        calculateOffset
    };
    function useToaster(toastOptions) {
        const { toasts, pausedAt } = useToasterStore(toastOptions);
        const timeouts = new Map();
        let _pausedAt;
        const unsubscribes = [
            pausedAt.subscribe(($pausedAt) => {
                if ($pausedAt) {
                    for (const [, timeoutId] of timeouts) {
                        clearTimeout(timeoutId);
                    }
                    timeouts.clear();
                }
                _pausedAt = $pausedAt;
            }),
            toasts.subscribe(($toasts) => {
                if (_pausedAt) {
                    return;
                }
                const now = Date.now();
                for (const t of $toasts) {
                    if (timeouts.has(t.id)) {
                        continue;
                    }
                    if (t.duration === Infinity) {
                        continue;
                    }
                    const durationLeft = (t.duration || 0) + t.pauseDuration - (now - t.createdAt);
                    if (durationLeft < 0) {
                        if (t.visible) {
                            // FIXME: This causes a recursive cycle of updates.
                            toast.dismiss(t.id);
                        }
                        return null;
                    }
                    timeouts.set(t.id, setTimeout(() => toast.dismiss(t.id), durationLeft));
                }
            })
        ];
        onDestroy(() => {
            for (const unsubscribe of unsubscribes) {
                unsubscribe();
            }
        });
        return { toasts, handlers };
    }

    /* node_modules\svelte-french-toast\dist\components\CheckmarkIcon.svelte generated by Svelte v3.57.0 */

    const file$o = "node_modules\\svelte-french-toast\\dist\\components\\CheckmarkIcon.svelte";

    function create_fragment$o(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-11kvm4p");
    			set_style(div, "--primary", /*primary*/ ctx[0]);
    			set_style(div, "--secondary", /*secondary*/ ctx[1]);
    			add_location(div, file$o, 5, 0, 148);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*primary*/ 1) {
    				set_style(div, "--primary", /*primary*/ ctx[0]);
    			}

    			if (dirty & /*secondary*/ 2) {
    				set_style(div, "--secondary", /*secondary*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CheckmarkIcon', slots, []);
    	let { primary = "#61d345" } = $$props;
    	let { secondary = "#fff" } = $$props;
    	const writable_props = ['primary', 'secondary'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CheckmarkIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('primary' in $$props) $$invalidate(0, primary = $$props.primary);
    		if ('secondary' in $$props) $$invalidate(1, secondary = $$props.secondary);
    	};

    	$$self.$capture_state = () => ({ primary, secondary });

    	$$self.$inject_state = $$props => {
    		if ('primary' in $$props) $$invalidate(0, primary = $$props.primary);
    		if ('secondary' in $$props) $$invalidate(1, secondary = $$props.secondary);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [primary, secondary];
    }

    class CheckmarkIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { primary: 0, secondary: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckmarkIcon",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get primary() {
    		throw new Error("<CheckmarkIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<CheckmarkIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<CheckmarkIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<CheckmarkIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-french-toast\dist\components\ErrorIcon.svelte generated by Svelte v3.57.0 */

    const file$n = "node_modules\\svelte-french-toast\\dist\\components\\ErrorIcon.svelte";

    function create_fragment$n(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-1ee93ns");
    			set_style(div, "--primary", /*primary*/ ctx[0]);
    			set_style(div, "--secondary", /*secondary*/ ctx[1]);
    			add_location(div, file$n, 5, 0, 148);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*primary*/ 1) {
    				set_style(div, "--primary", /*primary*/ ctx[0]);
    			}

    			if (dirty & /*secondary*/ 2) {
    				set_style(div, "--secondary", /*secondary*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ErrorIcon', slots, []);
    	let { primary = "#ff4b4b" } = $$props;
    	let { secondary = "#fff" } = $$props;
    	const writable_props = ['primary', 'secondary'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ErrorIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('primary' in $$props) $$invalidate(0, primary = $$props.primary);
    		if ('secondary' in $$props) $$invalidate(1, secondary = $$props.secondary);
    	};

    	$$self.$capture_state = () => ({ primary, secondary });

    	$$self.$inject_state = $$props => {
    		if ('primary' in $$props) $$invalidate(0, primary = $$props.primary);
    		if ('secondary' in $$props) $$invalidate(1, secondary = $$props.secondary);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [primary, secondary];
    }

    class ErrorIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { primary: 0, secondary: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorIcon",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get primary() {
    		throw new Error("<ErrorIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<ErrorIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<ErrorIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<ErrorIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-french-toast\dist\components\LoaderIcon.svelte generated by Svelte v3.57.0 */

    const file$m = "node_modules\\svelte-french-toast\\dist\\components\\LoaderIcon.svelte";

    function create_fragment$m(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-1j7dflg");
    			set_style(div, "--primary", /*primary*/ ctx[0]);
    			set_style(div, "--secondary", /*secondary*/ ctx[1]);
    			add_location(div, file$m, 5, 0, 151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*primary*/ 1) {
    				set_style(div, "--primary", /*primary*/ ctx[0]);
    			}

    			if (dirty & /*secondary*/ 2) {
    				set_style(div, "--secondary", /*secondary*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoaderIcon', slots, []);
    	let { primary = "#616161" } = $$props;
    	let { secondary = "#e0e0e0" } = $$props;
    	const writable_props = ['primary', 'secondary'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoaderIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('primary' in $$props) $$invalidate(0, primary = $$props.primary);
    		if ('secondary' in $$props) $$invalidate(1, secondary = $$props.secondary);
    	};

    	$$self.$capture_state = () => ({ primary, secondary });

    	$$self.$inject_state = $$props => {
    		if ('primary' in $$props) $$invalidate(0, primary = $$props.primary);
    		if ('secondary' in $$props) $$invalidate(1, secondary = $$props.secondary);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [primary, secondary];
    }

    class LoaderIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { primary: 0, secondary: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoaderIcon",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get primary() {
    		throw new Error("<LoaderIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<LoaderIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<LoaderIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<LoaderIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-french-toast\dist\components\ToastIcon.svelte generated by Svelte v3.57.0 */
    const file$l = "node_modules\\svelte-french-toast\\dist\\components\\ToastIcon.svelte";

    // (13:27) 
    function create_if_block_2$3(ctx) {
    	let div;
    	let loadericon;
    	let t;
    	let current;
    	const loadericon_spread_levels = [/*iconTheme*/ ctx[0]];
    	let loadericon_props = {};

    	for (let i = 0; i < loadericon_spread_levels.length; i += 1) {
    		loadericon_props = assign(loadericon_props, loadericon_spread_levels[i]);
    	}

    	loadericon = new LoaderIcon({ props: loadericon_props, $$inline: true });
    	let if_block = /*type*/ ctx[2] !== 'loading' && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(loadericon.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "indicator svelte-1kgeier");
    			add_location(div, file$l, 13, 1, 390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(loadericon, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const loadericon_changes = (dirty & /*iconTheme*/ 1)
    			? get_spread_update(loadericon_spread_levels, [get_spread_object(/*iconTheme*/ ctx[0])])
    			: {};

    			loadericon.$set(loadericon_changes);

    			if (/*type*/ ctx[2] !== 'loading') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*type*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loadericon.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loadericon.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(loadericon);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(13:27) ",
    		ctx
    	});

    	return block;
    }

    // (11:38) 
    function create_if_block_1$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*icon*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 2 && switch_value !== (switch_value = /*icon*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(11:38) ",
    		ctx
    	});

    	return block;
    }

    // (9:0) {#if typeof icon === 'string'}
    function create_if_block$c(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*icon*/ ctx[1]);
    			attr_dev(div, "class", "animated svelte-1kgeier");
    			add_location(div, file$l, 9, 1, 253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 2) set_data_dev(t, /*icon*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(9:0) {#if typeof icon === 'string'}",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#if type !== 'loading'}
    function create_if_block_3$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_4$1, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*type*/ ctx[2] === 'error') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "status svelte-1kgeier");
    			add_location(div, file$l, 16, 3, 476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(16:2) {#if type !== 'loading'}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {:else}
    function create_else_block$5(ctx) {
    	let checkmarkicon;
    	let current;
    	const checkmarkicon_spread_levels = [/*iconTheme*/ ctx[0]];
    	let checkmarkicon_props = {};

    	for (let i = 0; i < checkmarkicon_spread_levels.length; i += 1) {
    		checkmarkicon_props = assign(checkmarkicon_props, checkmarkicon_spread_levels[i]);
    	}

    	checkmarkicon = new CheckmarkIcon({
    			props: checkmarkicon_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(checkmarkicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkmarkicon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkmarkicon_changes = (dirty & /*iconTheme*/ 1)
    			? get_spread_update(checkmarkicon_spread_levels, [get_spread_object(/*iconTheme*/ ctx[0])])
    			: {};

    			checkmarkicon.$set(checkmarkicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkmarkicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkmarkicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkmarkicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(20:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if type === 'error'}
    function create_if_block_4$1(ctx) {
    	let erroricon;
    	let current;
    	const erroricon_spread_levels = [/*iconTheme*/ ctx[0]];
    	let erroricon_props = {};

    	for (let i = 0; i < erroricon_spread_levels.length; i += 1) {
    		erroricon_props = assign(erroricon_props, erroricon_spread_levels[i]);
    	}

    	erroricon = new ErrorIcon({ props: erroricon_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(erroricon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(erroricon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const erroricon_changes = (dirty & /*iconTheme*/ 1)
    			? get_spread_update(erroricon_spread_levels, [get_spread_object(/*iconTheme*/ ctx[0])])
    			: {};

    			erroricon.$set(erroricon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(erroricon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(erroricon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(erroricon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(18:4) {#if type === 'error'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$c, create_if_block_1$5, create_if_block_2$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (typeof /*icon*/ ctx[1] === 'string') return 0;
    		if (typeof /*icon*/ ctx[1] !== 'undefined') return 1;
    		if (/*type*/ ctx[2] !== 'blank') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let type;
    	let icon;
    	let iconTheme;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastIcon', slots, []);
    	let { toast } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (toast === undefined && !('toast' in $$props || $$self.$$.bound[$$self.$$.props['toast']])) {
    			console.warn("<ToastIcon> was created without expected prop 'toast'");
    		}
    	});

    	const writable_props = ['toast'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('toast' in $$props) $$invalidate(3, toast = $$props.toast);
    	};

    	$$self.$capture_state = () => ({
    		CheckmarkIcon,
    		ErrorIcon,
    		LoaderIcon,
    		toast,
    		iconTheme,
    		icon,
    		type
    	});

    	$$self.$inject_state = $$props => {
    		if ('toast' in $$props) $$invalidate(3, toast = $$props.toast);
    		if ('iconTheme' in $$props) $$invalidate(0, iconTheme = $$props.iconTheme);
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*toast*/ 8) {
    			$$invalidate(2, { type, icon, iconTheme } = toast, type, ($$invalidate(1, icon), $$invalidate(3, toast)), ($$invalidate(0, iconTheme), $$invalidate(3, toast)));
    		}
    	};

    	return [iconTheme, icon, type, toast];
    }

    class ToastIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { toast: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastIcon",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get toast() {
    		throw new Error("<ToastIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toast(value) {
    		throw new Error("<ToastIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-french-toast\dist\components\ToastMessage.svelte generated by Svelte v3.57.0 */

    const file$k = "node_modules\\svelte-french-toast\\dist\\components\\ToastMessage.svelte";

    // (7:1) {:else}
    function create_else_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*toast*/ ctx[0].message;

    	function switch_props(ctx) {
    		return {
    			props: { toast: /*toast*/ ctx[0] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*toast*/ 1) switch_instance_changes.toast = /*toast*/ ctx[0];

    			if (dirty & /*toast*/ 1 && switch_value !== (switch_value = /*toast*/ ctx[0].message)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(7:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (5:1) {#if typeof toast.message === 'string'}
    function create_if_block$b(ctx) {
    	let t_value = /*toast*/ ctx[0].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*toast*/ 1 && t_value !== (t_value = /*toast*/ ctx[0].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(5:1) {#if typeof toast.message === 'string'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$b, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (typeof /*toast*/ ctx[0].message === 'string') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let div_levels = [{ class: "message" }, /*toast*/ ctx[0].ariaProps];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "svelte-1nauejd", true);
    			add_location(div, file$k, 3, 0, 37);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [{ class: "message" }, dirty & /*toast*/ 1 && /*toast*/ ctx[0].ariaProps]));
    			toggle_class(div, "svelte-1nauejd", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastMessage', slots, []);
    	let { toast } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (toast === undefined && !('toast' in $$props || $$self.$$.bound[$$self.$$.props['toast']])) {
    			console.warn("<ToastMessage> was created without expected prop 'toast'");
    		}
    	});

    	const writable_props = ['toast'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastMessage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('toast' in $$props) $$invalidate(0, toast = $$props.toast);
    	};

    	$$self.$capture_state = () => ({ toast });

    	$$self.$inject_state = $$props => {
    		if ('toast' in $$props) $$invalidate(0, toast = $$props.toast);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toast];
    }

    class ToastMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { toast: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastMessage",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get toast() {
    		throw new Error("<ToastMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toast(value) {
    		throw new Error("<ToastMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-french-toast\dist\components\ToastBar.svelte generated by Svelte v3.57.0 */
    const file$j = "node_modules\\svelte-french-toast\\dist\\components\\ToastBar.svelte";
    const get_default_slot_changes$1 = dirty => ({ toast: dirty & /*toast*/ 1 });

    const get_default_slot_context$1 = ctx => ({
    	ToastIcon,
    	ToastMessage,
    	toast: /*toast*/ ctx[0]
    });

    // (28:1) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, toast*/ 129)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*toast*/ 1)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(28:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:1) {#if Component}
    function create_if_block$a(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*Component*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: {
    					message: [create_message_slot],
    					icon: [create_icon_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty & /*$$scope, toast*/ 129) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (dirty & /*Component*/ 4 && switch_value !== (switch_value = /*Component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(23:1) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (29:43)     
    function fallback_block$1(ctx) {
    	let toasticon;
    	let t;
    	let toastmessage;
    	let current;

    	toasticon = new ToastIcon({
    			props: { toast: /*toast*/ ctx[0] },
    			$$inline: true
    		});

    	toastmessage = new ToastMessage({
    			props: { toast: /*toast*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toasticon.$$.fragment);
    			t = space();
    			create_component(toastmessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toasticon, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(toastmessage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toasticon_changes = {};
    			if (dirty & /*toast*/ 1) toasticon_changes.toast = /*toast*/ ctx[0];
    			toasticon.$set(toasticon_changes);
    			const toastmessage_changes = {};
    			if (dirty & /*toast*/ 1) toastmessage_changes.toast = /*toast*/ ctx[0];
    			toastmessage.$set(toastmessage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toasticon.$$.fragment, local);
    			transition_in(toastmessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toasticon.$$.fragment, local);
    			transition_out(toastmessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toasticon, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(toastmessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(29:43)     ",
    		ctx
    	});

    	return block;
    }

    // (25:3) 
    function create_icon_slot(ctx) {
    	let toasticon;
    	let current;

    	toasticon = new ToastIcon({
    			props: { toast: /*toast*/ ctx[0], slot: "icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toasticon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toasticon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toasticon_changes = {};
    			if (dirty & /*toast*/ 1) toasticon_changes.toast = /*toast*/ ctx[0];
    			toasticon.$set(toasticon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toasticon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toasticon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toasticon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_icon_slot.name,
    		type: "slot",
    		source: "(25:3) ",
    		ctx
    	});

    	return block;
    }

    // (26:3) 
    function create_message_slot(ctx) {
    	let toastmessage;
    	let current;

    	toastmessage = new ToastMessage({
    			props: { toast: /*toast*/ ctx[0], slot: "message" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toastmessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toastmessage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toastmessage_changes = {};
    			if (dirty & /*toast*/ 1) toastmessage_changes.toast = /*toast*/ ctx[0];
    			toastmessage.$set(toastmessage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastmessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastmessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toastmessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_message_slot.name,
    		type: "slot",
    		source: "(26:3) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	const if_block_creators = [create_if_block$a, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*Component*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();

    			attr_dev(div, "class", div_class_value = "base " + (/*toast*/ ctx[0].height
    			? /*animation*/ ctx[4]
    			: 'transparent') + " " + (/*toast*/ ctx[0].className || '') + " svelte-ug60r4");

    			attr_dev(div, "style", div_style_value = "" + (/*style*/ ctx[1] + "; " + /*toast*/ ctx[0].style));
    			set_style(div, "--factor", /*factor*/ ctx[3]);
    			add_location(div, file$j, 17, 0, 540);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*toast, animation*/ 17 && div_class_value !== (div_class_value = "base " + (/*toast*/ ctx[0].height
    			? /*animation*/ ctx[4]
    			: 'transparent') + " " + (/*toast*/ ctx[0].className || '') + " svelte-ug60r4")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style, toast*/ 3 && div_style_value !== (div_style_value = "" + (/*style*/ ctx[1] + "; " + /*toast*/ ctx[0].style))) {
    				attr_dev(div, "style", div_style_value);
    			}

    			const style_changed = dirty & /*style, toast*/ 3;

    			if (style_changed || dirty & /*factor, style, toast*/ 11) {
    				set_style(div, "--factor", /*factor*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastBar', slots, ['default']);
    	let { toast } = $$props;
    	let { position = void 0 } = $$props;
    	let { style = "" } = $$props;
    	let { Component = void 0 } = $$props;
    	let factor;
    	let animation;

    	$$self.$$.on_mount.push(function () {
    		if (toast === undefined && !('toast' in $$props || $$self.$$.bound[$$self.$$.props['toast']])) {
    			console.warn("<ToastBar> was created without expected prop 'toast'");
    		}
    	});

    	const writable_props = ['toast', 'position', 'style', 'Component'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('toast' in $$props) $$invalidate(0, toast = $$props.toast);
    		if ('position' in $$props) $$invalidate(5, position = $$props.position);
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('Component' in $$props) $$invalidate(2, Component = $$props.Component);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ToastIcon,
    		prefersReducedMotion,
    		ToastMessage,
    		toast,
    		position,
    		style,
    		Component,
    		factor,
    		animation
    	});

    	$$self.$inject_state = $$props => {
    		if ('toast' in $$props) $$invalidate(0, toast = $$props.toast);
    		if ('position' in $$props) $$invalidate(5, position = $$props.position);
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('Component' in $$props) $$invalidate(2, Component = $$props.Component);
    		if ('factor' in $$props) $$invalidate(3, factor = $$props.factor);
    		if ('animation' in $$props) $$invalidate(4, animation = $$props.animation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*toast, position*/ 33) {
    			{
    				const top = (toast.position || position || "top-center").includes("top");
    				$$invalidate(3, factor = top ? 1 : -1);

    				const [enter, exit] = prefersReducedMotion()
    				? ["fadeIn", "fadeOut"]
    				: ["enter", "exit"];

    				$$invalidate(4, animation = toast.visible ? enter : exit);
    			}
    		}
    	};

    	return [toast, style, Component, factor, animation, position, slots, $$scope];
    }

    class ToastBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			toast: 0,
    			position: 5,
    			style: 1,
    			Component: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastBar",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get toast() {
    		throw new Error("<ToastBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toast(value) {
    		throw new Error("<ToastBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<ToastBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<ToastBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ToastBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ToastBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Component() {
    		throw new Error("<ToastBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Component(value) {
    		throw new Error("<ToastBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-french-toast\dist\components\ToastWrapper.svelte generated by Svelte v3.57.0 */
    const file$i = "node_modules\\svelte-french-toast\\dist\\components\\ToastWrapper.svelte";
    const get_default_slot_changes = dirty => ({ toast: dirty & /*toast*/ 1 });
    const get_default_slot_context = ctx => ({ toast: /*toast*/ ctx[0] });

    // (34:1) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, toast*/ 129)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*toast*/ 1)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(34:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:1) {#if toast.type === 'custom'}
    function create_if_block$9(ctx) {
    	let toastmessage;
    	let current;

    	toastmessage = new ToastMessage({
    			props: { toast: /*toast*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toastmessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toastmessage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toastmessage_changes = {};
    			if (dirty & /*toast*/ 1) toastmessage_changes.toast = /*toast*/ ctx[0];
    			toastmessage.$set(toastmessage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastmessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastmessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toastmessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(32:1) {#if toast.type === 'custom'}",
    		ctx
    	});

    	return block;
    }

    // (35:16)     
    function fallback_block(ctx) {
    	let toastbar;
    	let current;

    	toastbar = new ToastBar({
    			props: {
    				toast: /*toast*/ ctx[0],
    				position: /*toast*/ ctx[0].position
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toastbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toastbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toastbar_changes = {};
    			if (dirty & /*toast*/ 1) toastbar_changes.toast = /*toast*/ ctx[0];
    			if (dirty & /*toast*/ 1) toastbar_changes.position = /*toast*/ ctx[0].position;
    			toastbar.$set(toastbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toastbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(35:16)     ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$9, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*toast*/ ctx[0].type === 'custom') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "wrapper svelte-v01oml");
    			toggle_class(div, "active", /*toast*/ ctx[0].visible);
    			toggle_class(div, "transition", !prefersReducedMotion());
    			set_style(div, "--factor", /*factor*/ ctx[3]);
    			set_style(div, "--offset", /*toast*/ ctx[0].offset);
    			set_style(div, "top", /*top*/ ctx[5]);
    			set_style(div, "bottom", /*bottom*/ ctx[4]);
    			set_style(div, "justify-content", /*justifyContent*/ ctx[2]);
    			add_location(div, file$i, 20, 0, 630);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			/*div_binding*/ ctx[9](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*toast*/ 1) {
    				toggle_class(div, "active", /*toast*/ ctx[0].visible);
    			}

    			if (dirty & /*factor*/ 8) {
    				set_style(div, "--factor", /*factor*/ ctx[3]);
    			}

    			if (dirty & /*toast*/ 1) {
    				set_style(div, "--offset", /*toast*/ ctx[0].offset);
    			}

    			if (dirty & /*top*/ 32) {
    				set_style(div, "top", /*top*/ ctx[5]);
    			}

    			if (dirty & /*bottom*/ 16) {
    				set_style(div, "bottom", /*bottom*/ ctx[4]);
    			}

    			if (dirty & /*justifyContent*/ 4) {
    				set_style(div, "justify-content", /*justifyContent*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			/*div_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let top;
    	let bottom;
    	let factor;
    	let justifyContent;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastWrapper', slots, ['default']);
    	let { toast } = $$props;
    	let { setHeight } = $$props;
    	let wrapperEl;

    	onMount(() => {
    		setHeight(wrapperEl.getBoundingClientRect().height);
    	});

    	$$self.$$.on_mount.push(function () {
    		if (toast === undefined && !('toast' in $$props || $$self.$$.bound[$$self.$$.props['toast']])) {
    			console.warn("<ToastWrapper> was created without expected prop 'toast'");
    		}

    		if (setHeight === undefined && !('setHeight' in $$props || $$self.$$.bound[$$self.$$.props['setHeight']])) {
    			console.warn("<ToastWrapper> was created without expected prop 'setHeight'");
    		}
    	});

    	const writable_props = ['toast', 'setHeight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastWrapper> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrapperEl = $$value;
    			$$invalidate(1, wrapperEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('toast' in $$props) $$invalidate(0, toast = $$props.toast);
    		if ('setHeight' in $$props) $$invalidate(6, setHeight = $$props.setHeight);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		prefersReducedMotion,
    		ToastBar,
    		ToastMessage,
    		toast,
    		setHeight,
    		wrapperEl,
    		justifyContent,
    		factor,
    		bottom,
    		top
    	});

    	$$self.$inject_state = $$props => {
    		if ('toast' in $$props) $$invalidate(0, toast = $$props.toast);
    		if ('setHeight' in $$props) $$invalidate(6, setHeight = $$props.setHeight);
    		if ('wrapperEl' in $$props) $$invalidate(1, wrapperEl = $$props.wrapperEl);
    		if ('justifyContent' in $$props) $$invalidate(2, justifyContent = $$props.justifyContent);
    		if ('factor' in $$props) $$invalidate(3, factor = $$props.factor);
    		if ('bottom' in $$props) $$invalidate(4, bottom = $$props.bottom);
    		if ('top' in $$props) $$invalidate(5, top = $$props.top);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*toast*/ 1) {
    			$$invalidate(5, top = (toast.position?.includes("top")) ? 0 : null);
    		}

    		if ($$self.$$.dirty & /*toast*/ 1) {
    			$$invalidate(4, bottom = (toast.position?.includes("bottom")) ? 0 : null);
    		}

    		if ($$self.$$.dirty & /*toast*/ 1) {
    			$$invalidate(3, factor = (toast.position?.includes("top")) ? 1 : -1);
    		}

    		if ($$self.$$.dirty & /*toast*/ 1) {
    			$$invalidate(2, justifyContent = toast.position?.includes("center") && "center" || toast.position?.includes("right") && "flex-end" || null);
    		}
    	};

    	return [
    		toast,
    		wrapperEl,
    		justifyContent,
    		factor,
    		bottom,
    		top,
    		setHeight,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class ToastWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { toast: 0, setHeight: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastWrapper",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get toast() {
    		throw new Error("<ToastWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toast(value) {
    		throw new Error("<ToastWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setHeight() {
    		throw new Error("<ToastWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setHeight(value) {
    		throw new Error("<ToastWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-french-toast\dist\components\Toaster.svelte generated by Svelte v3.57.0 */
    const file$h = "node_modules\\svelte-french-toast\\dist\\components\\Toaster.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (29:1) {#each _toasts as toast (toast.id)}
    function create_each_block$5(key_1, ctx) {
    	let first;
    	let toastwrapper;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[10](/*toast*/ ctx[11], ...args);
    	}

    	toastwrapper = new ToastWrapper({
    			props: {
    				toast: /*toast*/ ctx[11],
    				setHeight: func
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(toastwrapper.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(toastwrapper, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const toastwrapper_changes = {};
    			if (dirty & /*_toasts*/ 4) toastwrapper_changes.toast = /*toast*/ ctx[11];
    			if (dirty & /*_toasts*/ 4) toastwrapper_changes.setHeight = func;
    			toastwrapper.$set(toastwrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(toastwrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(29:1) {#each _toasts as toast (toast.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*_toasts*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*toast*/ ctx[11].id;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", div_class_value = "toaster " + (/*containerClassName*/ ctx[1] || '') + " svelte-1phplh9");
    			attr_dev(div, "style", /*containerStyle*/ ctx[0]);
    			add_location(div, file$h, 22, 0, 617);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseenter", /*handlers*/ ctx[4].startPause, false, false, false, false),
    					listen_dev(div, "mouseleave", /*handlers*/ ctx[4].endPause, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*_toasts, handlers*/ 20) {
    				each_value = /*_toasts*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}

    			if (!current || dirty & /*containerClassName*/ 2 && div_class_value !== (div_class_value = "toaster " + (/*containerClassName*/ ctx[1] || '') + " svelte-1phplh9")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*containerStyle*/ 1) {
    				attr_dev(div, "style", /*containerStyle*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $toasts;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toaster', slots, []);
    	let { reverseOrder = false } = $$props;
    	let { position = "top-center" } = $$props;
    	let { toastOptions = void 0 } = $$props;
    	let { gutter = 8 } = $$props;
    	let { containerStyle = void 0 } = $$props;
    	let { containerClassName = void 0 } = $$props;
    	const { toasts, handlers } = useToaster(toastOptions);
    	validate_store(toasts, 'toasts');
    	component_subscribe($$self, toasts, value => $$invalidate(9, $toasts = value));
    	let _toasts;

    	const writable_props = [
    		'reverseOrder',
    		'position',
    		'toastOptions',
    		'gutter',
    		'containerStyle',
    		'containerClassName'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toaster> was created with unknown prop '${key}'`);
    	});

    	const func = (toast, height) => handlers.updateHeight(toast.id, height);

    	$$self.$$set = $$props => {
    		if ('reverseOrder' in $$props) $$invalidate(5, reverseOrder = $$props.reverseOrder);
    		if ('position' in $$props) $$invalidate(6, position = $$props.position);
    		if ('toastOptions' in $$props) $$invalidate(7, toastOptions = $$props.toastOptions);
    		if ('gutter' in $$props) $$invalidate(8, gutter = $$props.gutter);
    		if ('containerStyle' in $$props) $$invalidate(0, containerStyle = $$props.containerStyle);
    		if ('containerClassName' in $$props) $$invalidate(1, containerClassName = $$props.containerClassName);
    	};

    	$$self.$capture_state = () => ({
    		useToaster,
    		ToastWrapper,
    		reverseOrder,
    		position,
    		toastOptions,
    		gutter,
    		containerStyle,
    		containerClassName,
    		toasts,
    		handlers,
    		_toasts,
    		$toasts
    	});

    	$$self.$inject_state = $$props => {
    		if ('reverseOrder' in $$props) $$invalidate(5, reverseOrder = $$props.reverseOrder);
    		if ('position' in $$props) $$invalidate(6, position = $$props.position);
    		if ('toastOptions' in $$props) $$invalidate(7, toastOptions = $$props.toastOptions);
    		if ('gutter' in $$props) $$invalidate(8, gutter = $$props.gutter);
    		if ('containerStyle' in $$props) $$invalidate(0, containerStyle = $$props.containerStyle);
    		if ('containerClassName' in $$props) $$invalidate(1, containerClassName = $$props.containerClassName);
    		if ('_toasts' in $$props) $$invalidate(2, _toasts = $$props._toasts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$toasts, position, reverseOrder, gutter*/ 864) {
    			$$invalidate(2, _toasts = $toasts.map(toast => ({
    				...toast,
    				position: toast.position || position,
    				offset: handlers.calculateOffset(toast, $toasts, {
    					reverseOrder,
    					gutter,
    					defaultPosition: position
    				})
    			})));
    		}
    	};

    	return [
    		containerStyle,
    		containerClassName,
    		_toasts,
    		toasts,
    		handlers,
    		reverseOrder,
    		position,
    		toastOptions,
    		gutter,
    		$toasts,
    		func
    	];
    }

    class Toaster extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			reverseOrder: 5,
    			position: 6,
    			toastOptions: 7,
    			gutter: 8,
    			containerStyle: 0,
    			containerClassName: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toaster",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get reverseOrder() {
    		throw new Error("<Toaster>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverseOrder(value) {
    		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Toaster>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toastOptions() {
    		throw new Error("<Toaster>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toastOptions(value) {
    		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gutter() {
    		throw new Error("<Toaster>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gutter(value) {
    		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyle() {
    		throw new Error("<Toaster>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyle(value) {
    		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerClassName() {
    		throw new Error("<Toaster>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerClassName(value) {
    		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Function to check the string contains alphabet only and string should not be empty
    let containsAlphabets = (field) => {
        return /^[a-zA-Z ]*$/.test(field);
      };
      // Function to validate the email
      let validateEmail = (mail) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
          return true;
        }
        return false;
      };
      // Function to validate the phone number
      let validatePhoneNumber = (input) => {
        var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
        return regex.test(input);
      };
      // Function to validate the zip code
      let isZipNumber = (zip) => {
        if (isNaN(zip)) {
          return false;
        }
        if (zip.toString().length !== 6) {
          return false;
        }
        return true;
      };
      // Function to validate the password
      let checkPassword = (str) => {
        if (
          str.length < 8 ||
          str.length > 50 ||
          str.search(/\d/) == -1 ||
          str.search(/[a-zA-Z]/) == -1 ||
          str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) != -1
        ) {
          return false;
        } else {
          return true;
        }
      };

    /* src\components\Login.svelte generated by Svelte v3.57.0 */
    const file$g = "src\\components\\Login.svelte";

    // (52:6) {#if firstLoad && !validateEmail(email)}
    function create_if_block$8(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter valid email";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$g, 52, 6, 1545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(52:6) {#if firstLoad && !validateEmail(email)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div1;
    	let form;
    	let h3;
    	let b;
    	let t1;
    	let div0;
    	let label;
    	let t2;
    	let span;
    	let t4;
    	let t5;
    	let input;
    	let t6;
    	let show_if = /*firstLoad*/ ctx[0] && !validateEmail(/*email*/ ctx[1]);
    	let t7;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = show_if && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			form = element("form");
    			h3 = element("h3");
    			b = element("b");
    			b.textContent = "Login";
    			t1 = space();
    			div0 = element("div");
    			label = element("label");
    			t2 = text("Email address ");
    			span = element("span");
    			span.textContent = "*";
    			t4 = text(" :");
    			t5 = space();
    			input = element("input");
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			button = element("button");
    			button.textContent = "NEXT";
    			add_location(b, file$g, 36, 8, 1032);
    			add_location(h3, file$g, 36, 4, 1028);
    			attr_dev(span, "class", "star-mark");
    			add_location(span, file$g, 41, 23, 1229);
    			attr_dev(label, "class", "form-label");
    			add_location(label, file$g, 40, 6, 1179);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "placeholder", "Email Address");
    			attr_dev(input, "title", "Enter a unique and valid email id");
    			attr_dev(input, "class", "form-control");
    			input.required = true;
    			add_location(input, file$g, 43, 6, 1287);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn-block btn-myStyle");
    			add_location(button, file$g, 54, 6, 1619);
    			attr_dev(div0, "class", "form-outline");
    			add_location(div0, file$g, 38, 4, 1081);
    			add_location(form, file$g, 35, 2, 1016);
    			attr_dev(div1, "class", "container1");
    			set_style(div1, "width", "30%");
    			set_style(div1, "margin-top", "5%");
    			set_style(div1, "margin-left", "33.33%");
    			add_location(div1, file$g, 31, 0, 923);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, form);
    			append_dev(form, h3);
    			append_dev(h3, b);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, label);
    			append_dev(label, t2);
    			append_dev(label, span);
    			append_dev(label, t4);
    			append_dev(div0, t5);
    			append_dev(div0, input);
    			set_input_value(input, /*email*/ ctx[1]);
    			append_dev(div0, t6);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t7);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(button, "click", prevent_default(/*checkUserExist*/ ctx[2]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 2 && input.value !== /*email*/ ctx[1]) {
    				set_input_value(input, /*email*/ ctx[1]);
    			}

    			if (dirty & /*firstLoad, email*/ 3) show_if = /*firstLoad*/ ctx[0] && !validateEmail(/*email*/ ctx[1]);

    			if (show_if) {
    				if (if_block) ; else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div0, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let userExist;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	const userControllerClass = new UserController();
    	let firstLoad = false;
    	let email;
    	let password;

    	const checkUserExist = async () => {
    		$$invalidate(0, firstLoad = true);
    		let result = await userControllerClass.checkUserExistController(email);

    		if (result.data.email === null) {
    			localStorage.setItem("loginDetails", JSON.stringify({ email }));
    			push("/login/EmailPasswordForm");
    		} else {
    			localStorage.setItem("loginDetails", JSON.stringify({ email }));
    			push("/login/PasswordForm");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	$$self.$capture_state = () => ({
    		UserController,
    		userControllerClass,
    		push,
    		pop,
    		replace,
    		toast,
    		Toaster,
    		validateEmail,
    		firstLoad,
    		email,
    		password,
    		checkUserExist,
    		userExist
    	});

    	$$self.$inject_state = $$props => {
    		if ('firstLoad' in $$props) $$invalidate(0, firstLoad = $$props.firstLoad);
    		if ('email' in $$props) $$invalidate(1, email = $$props.email);
    		if ('password' in $$props) password = $$props.password;
    		if ('userExist' in $$props) userExist = $$props.userExist;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	userExist = "checkExist";
    	return [firstLoad, email, checkUserExist, input_input_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\About.svelte generated by Svelte v3.57.0 */

    const file$f = "src\\components\\About.svelte";

    function create_fragment$f(ctx) {
    	let main;
    	let h2;
    	let b;
    	let t1;
    	let h5;
    	let t3;
    	let p;
    	let t5;
    	let br;
    	let t6;
    	let h4;
    	let t8;
    	let div;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h2 = element("h2");
    			b = element("b");
    			b.textContent = "Welcome To EMART";
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = "EMART is a Professional e-commerce Platform. Here we will provide you only interesting content, which you will\r\n    like very much. We're dedicated to providing you the best of\r\n    e-commerce, with a focus on dependability and\r\n    buy products and sell products. We're working to\r\n    turn our passion for e-commerce into a booming\r\n    \r\n    We hope you enjoy our e-commerce as much as we enjoy\r\n    offering them to you.";
    			t3 = space();
    			p = element("p");
    			p.textContent = "I will keep posting more important posts on my Website for all of you.\r\n    Please give your support and love.";
    			t5 = space();
    			br = element("br");
    			t6 = space();
    			h4 = element("h4");
    			h4.textContent = "Thanks For Visiting Our Site";
    			t8 = space();
    			div = element("div");
    			div.textContent = "Have a nice day!";
    			add_location(b, file$f, 2, 4, 58);
    			attr_dev(h2, "class", "text-center");
    			add_location(h2, file$f, 1, 2, 28);
    			add_location(h5, file$f, 4, 2, 94);
    			add_location(p, file$f, 14, 2, 541);
    			add_location(br, file$f, 18, 2, 672);
    			attr_dev(h4, "class", "text-center");
    			add_location(h4, file$f, 19, 2, 681);
    			attr_dev(div, "class", "about svelte-1hsitkk");
    			add_location(div, file$f, 20, 4, 744);
    			attr_dev(main, "class", "container");
    			add_location(main, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(h2, b);
    			append_dev(main, t1);
    			append_dev(main, h5);
    			append_dev(main, t3);
    			append_dev(main, p);
    			append_dev(main, t5);
    			append_dev(main, br);
    			append_dev(main, t6);
    			append_dev(main, h4);
    			append_dev(main, t8);
    			append_dev(main, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\NotFound.svelte generated by Svelte v3.57.0 */

    const file$e = "src\\components\\NotFound.svelte";

    function create_fragment$e(ctx) {
    	let main;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "404 : Page Not Found";
    			add_location(h1, file$e, 1, 4, 12);
    			add_location(main, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\Card.svelte generated by Svelte v3.57.0 */

    const { console: console_1$8 } = globals;
    const file$d = "src\\components\\Card.svelte";

    function create_fragment$d(ctx) {
    	let div2;
    	let div1;
    	let a;
    	let div0;
    	let t0;
    	let h6;
    	let t1;
    	let t2;
    	let h5;
    	let t3;
    	let t4;
    	let t5;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			a = element("a");
    			div0 = element("div");
    			t0 = space();
    			h6 = element("h6");
    			t1 = text(/*product_name*/ ctx[1]);
    			t2 = space();
    			h5 = element("h5");
    			t3 = text("₹");
    			t4 = text(/*price*/ ctx[2]);
    			t5 = space();
    			button = element("button");
    			button.textContent = "Add to cart";
    			attr_dev(div0, "class", "image svelte-1av7dah");
    			set_style(div0, "background-image", "url(" + /*picture*/ ctx[0] + ")");
    			add_location(div0, file$d, 42, 7, 1452);
    			attr_dev(a, "href", "#");
    			add_location(a, file$d, 41, 4, 1432);
    			add_location(h6, file$d, 48, 4, 1592);
    			add_location(h5, file$d, 49, 4, 1621);
    			attr_dev(button, "class", "btn svelte-1av7dah");
    			add_location(button, file$d, 50, 4, 1644);
    			attr_dev(div1, "class", "card svelte-1av7dah");
    			add_location(div1, file$d, 39, 2, 1346);
    			add_location(div2, file$d, 38, 0, 1337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, div0);
    			append_dev(div1, t0);
    			append_dev(div1, h6);
    			append_dev(h6, t1);
    			append_dev(div1, t2);
    			append_dev(div1, h5);
    			append_dev(h5, t3);
    			append_dev(h5, t4);
    			append_dev(div1, t5);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*getSingleProduct*/ ctx[4], false, false, false, false),
    					listen_dev(button, "click", prevent_default(/*AddIProductInCart*/ ctx[3]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*picture*/ 1) {
    				set_style(div0, "background-image", "url(" + /*picture*/ ctx[0] + ")");
    			}

    			if (dirty & /*product_name*/ 2) set_data_dev(t1, /*product_name*/ ctx[1]);
    			if (dirty & /*price*/ 4) set_data_dev(t4, /*price*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	const productClass = new Product();
    	let { picture } = $$props;
    	let { product_id } = $$props;
    	let { descriptions } = $$props;
    	let { product_name } = $$props;
    	let { price } = $$props;
    	let CartItems;

    	const AddIProductInCart = async () => {
    		let cart = {
    			product_id,
    			picture,
    			product_name,
    			price,
    			descriptions
    		};

    		CartItems = await productClass.addToCartInLocal(cart);
    		let totalData = await productClass.itemsInLocalCart();
    		increment(totalData);
    	};

    	let increment = async CartItems => {
    		CartItemsStore.set(await CartItems);
    	};

    	//  export const handleCartOnClick=async()=>{
    	//   let product=(await itemsInLocalCart())
    	//    cartItem=await product.lengths
    	//   }
    	const getSingleProduct = async () => {

    		let result = await productClass.singleProductData(product_id);
    		sessionStorage.setItem("singleProduct", JSON.stringify(result.data));

    		// localStorage.setItem("productId", JSON.stringify(result.data));
    		push("#/product");

    		console.log(await result);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (picture === undefined && !('picture' in $$props || $$self.$$.bound[$$self.$$.props['picture']])) {
    			console_1$8.warn("<Card> was created without expected prop 'picture'");
    		}

    		if (product_id === undefined && !('product_id' in $$props || $$self.$$.bound[$$self.$$.props['product_id']])) {
    			console_1$8.warn("<Card> was created without expected prop 'product_id'");
    		}

    		if (descriptions === undefined && !('descriptions' in $$props || $$self.$$.bound[$$self.$$.props['descriptions']])) {
    			console_1$8.warn("<Card> was created without expected prop 'descriptions'");
    		}

    		if (product_name === undefined && !('product_name' in $$props || $$self.$$.bound[$$self.$$.props['product_name']])) {
    			console_1$8.warn("<Card> was created without expected prop 'product_name'");
    		}

    		if (price === undefined && !('price' in $$props || $$self.$$.bound[$$self.$$.props['price']])) {
    			console_1$8.warn("<Card> was created without expected prop 'price'");
    		}
    	});

    	const writable_props = ['picture', 'product_id', 'descriptions', 'product_name', 'price'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$8.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('picture' in $$props) $$invalidate(0, picture = $$props.picture);
    		if ('product_id' in $$props) $$invalidate(5, product_id = $$props.product_id);
    		if ('descriptions' in $$props) $$invalidate(6, descriptions = $$props.descriptions);
    		if ('product_name' in $$props) $$invalidate(1, product_name = $$props.product_name);
    		if ('price' in $$props) $$invalidate(2, price = $$props.price);
    	};

    	$$self.$capture_state = () => ({
    		Product,
    		onMount,
    		push,
    		pop,
    		replace,
    		CartItemsStore,
    		getSingleProductStore,
    		productClass,
    		picture,
    		product_id,
    		descriptions,
    		product_name,
    		price,
    		CartItems,
    		AddIProductInCart,
    		increment,
    		getSingleProduct
    	});

    	$$self.$inject_state = $$props => {
    		if ('picture' in $$props) $$invalidate(0, picture = $$props.picture);
    		if ('product_id' in $$props) $$invalidate(5, product_id = $$props.product_id);
    		if ('descriptions' in $$props) $$invalidate(6, descriptions = $$props.descriptions);
    		if ('product_name' in $$props) $$invalidate(1, product_name = $$props.product_name);
    		if ('price' in $$props) $$invalidate(2, price = $$props.price);
    		if ('CartItems' in $$props) CartItems = $$props.CartItems;
    		if ('increment' in $$props) increment = $$props.increment;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		picture,
    		product_name,
    		price,
    		AddIProductInCart,
    		getSingleProduct,
    		product_id,
    		descriptions
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			picture: 0,
    			product_id: 5,
    			descriptions: 6,
    			product_name: 1,
    			price: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get picture() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set picture(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get product_id() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set product_id(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get descriptions() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set descriptions(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get product_name() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set product_name(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\views\Dashboard.svelte generated by Svelte v3.57.0 */
    const file$c = "src\\views\\Dashboard.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (45:4) {#each productList as products}
    function create_each_block$4(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				product_id: /*products*/ ctx[6].product_id,
    				descriptions: /*products*/ ctx[6].descriptions,
    				product_name: /*products*/ ctx[6].product_name,
    				picture: /*products*/ ctx[6].picture,
    				price: /*products*/ ctx[6].price
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*productList*/ 1) card_changes.product_id = /*products*/ ctx[6].product_id;
    			if (dirty & /*productList*/ 1) card_changes.descriptions = /*products*/ ctx[6].descriptions;
    			if (dirty & /*productList*/ 1) card_changes.product_name = /*products*/ ctx[6].product_name;
    			if (dirty & /*productList*/ 1) card_changes.picture = /*products*/ ctx[6].picture;
    			if (dirty & /*productList*/ 1) card_changes.price = /*products*/ ctx[6].price;
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(45:4) {#each productList as products}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let main;
    	let toaster;
    	let t0;
    	let div0;
    	let input;
    	let t1;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	toaster = new Toaster({ $$inline: true });
    	let each_value = /*productList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(toaster.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			input = element("input");
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "search");
    			attr_dev(input, "id", "form1");
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "placeholder", "Search Product");
    			attr_dev(input, "aria-label", "Search");
    			add_location(input, file$c, 29, 4, 856);
    			attr_dev(div0, "class", "container form-outline svelte-18hw0wx");
    			add_location(div0, file$c, 28, 2, 814);
    			attr_dev(div1, "class", "product-list svelte-18hw0wx");
    			add_location(div1, file$c, 43, 2, 1157);
    			add_location(main, file$c, 23, 0, 745);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(toaster, main, null);
    			append_dev(main, t0);
    			append_dev(main, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*searchByName*/ ctx[1]);
    			append_dev(main, t1);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchByName*/ 2 && input.value !== /*searchByName*/ ctx[1]) {
    				set_input_value(input, /*searchByName*/ ctx[1]);
    			}

    			if (dirty & /*productList*/ 1) {
    				each_value = /*productList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toaster.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toaster.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(toaster);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dashboard', slots, []);
    	const productClass = new Product();
    	let productList = [];
    	let searchByName = "";

    	onMount(async () => {
    		let product = await productClass.allProduct();
    		$$invalidate(0, productList = await product.data);
    	});

    	const searchValue = async () => {
    		let result = await productClass.searchProduct(searchByName);

    		if (result.status === true) {
    			$$invalidate(0, productList = result.data);
    		} else {
    			toast(`${result.message}`, {
    				style: "border-radius: 200px; background: white; color:black;"
    			});
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dashboard> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchByName = this.value;
    		$$invalidate(1, searchByName);
    	}

    	const keypress_handler = e => {
    		if (e.key === "Enter") {
    			searchValue();
    		}
    	};

    	$$self.$capture_state = () => ({
    		Card,
    		onMount,
    		Product,
    		toast,
    		Toaster,
    		productClass,
    		productList,
    		searchByName,
    		searchValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('productList' in $$props) $$invalidate(0, productList = $$props.productList);
    		if ('searchByName' in $$props) $$invalidate(1, searchByName = $$props.searchByName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [productList, searchByName, searchValue, input_input_handler, keypress_handler];
    }

    class Dashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dashboard",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\views\OrderSummary.svelte generated by Svelte v3.57.0 */

    const { console: console_1$7 } = globals;
    const file$b = "src\\views\\OrderSummary.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (118:6) {#if fillAddress}
    function create_if_block_3$1(ctx) {
    	let div;
    	let t0;
    	let b;

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			t0 = text("    ");
    			b = element("b");
    			b.textContent = "Please fill your delivery address";
    			add_location(b, file$b, 118, 66, 3950);
    			attr_dev(div, "class", "fill-add text-danger");
    			add_location(div, file$b, 118, 8, 3892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, b);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(118:6) {#if fillAddress}",
    		ctx
    	});

    	return block_1;
    }

    // (150:38) 
    function create_if_block_2$2(ctx) {
    	let div1;
    	let div0;

    	const block_1 = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "col-md-3");
    			add_location(div0, file$b, 151, 8, 4957);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$b, 150, 6, 4930);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(150:38) ",
    		ctx
    	});

    	return block_1;
    }

    // (123:4) {#if block === "savedData"}
    function create_if_block_1$4(ctx) {
    	let div2;
    	let div0;
    	let p0;
    	let t1;
    	let div1;
    	let t2_value = /*loginUserAddress*/ ctx[2].full_name + "";
    	let t2;
    	let t3;
    	let div5;
    	let div3;
    	let p1;
    	let t5;
    	let div4;
    	let p2;
    	let t6_value = /*loginUserAddress*/ ctx[2].apartment + "";
    	let t6;
    	let t7;
    	let t8_value = /*loginUserAddress*/ ctx[2].street + "";
    	let t8;
    	let t9;
    	let t10_value = /*loginUserAddress*/ ctx[2].landmark + "";
    	let t10;
    	let t11;
    	let p3;
    	let t12_value = /*loginUserAddress*/ ctx[2].city + "";
    	let t12;
    	let t13;
    	let t14_value = /*loginUserAddress*/ ctx[2].state + "";
    	let t14;
    	let t15;
    	let t16_value = /*loginUserAddress*/ ctx[2].pin_code + "";
    	let t16;
    	let t17;
    	let p4;
    	let t18_value = /*loginUserAddress*/ ctx[2].address_type + "";
    	let t18;
    	let t19;
    	let div8;
    	let div6;
    	let p5;
    	let t21;
    	let div7;
    	let t22_value = /*loginUserAddress*/ ctx[2].contact + "";
    	let t22;

    	const block_1 = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Full Name :";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "Address:";
    			t5 = space();
    			div4 = element("div");
    			p2 = element("p");
    			t6 = text(t6_value);
    			t7 = text(", ");
    			t8 = text(t8_value);
    			t9 = text(",");
    			t10 = text(t10_value);
    			t11 = space();
    			p3 = element("p");
    			t12 = text(t12_value);
    			t13 = text(" ,");
    			t14 = text(t14_value);
    			t15 = text(" , ");
    			t16 = text(t16_value);
    			t17 = space();
    			p4 = element("p");
    			t18 = text(t18_value);
    			t19 = space();
    			div8 = element("div");
    			div6 = element("div");
    			p5 = element("p");
    			p5.textContent = "Contact :";
    			t21 = space();
    			div7 = element("div");
    			t22 = text(t22_value);
    			add_location(p0, file$b, 125, 10, 4125);
    			attr_dev(div0, "class", "col-md-3");
    			add_location(div0, file$b, 124, 8, 4091);
    			attr_dev(div1, "class", "col-md-9");
    			add_location(div1, file$b, 127, 8, 4169);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$b, 123, 6, 4064);
    			add_location(p1, file$b, 131, 10, 4308);
    			attr_dev(div3, "class", "col-md-3");
    			add_location(div3, file$b, 130, 8, 4274);
    			add_location(p2, file$b, 134, 10, 4383);
    			add_location(p3, file$b, 137, 10, 4511);
    			add_location(p4, file$b, 140, 10, 4635);
    			attr_dev(div4, "class", "col-md-9");
    			add_location(div4, file$b, 133, 8, 4349);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$b, 129, 6, 4247);
    			add_location(p5, file$b, 145, 10, 4772);
    			attr_dev(div6, "class", "col-md-3");
    			add_location(div6, file$b, 144, 8, 4738);
    			attr_dev(div7, "class", "col-md-9");
    			add_location(div7, file$b, 147, 8, 4814);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$b, 143, 6, 4711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, p1);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, p2);
    			append_dev(p2, t6);
    			append_dev(p2, t7);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(p2, t10);
    			append_dev(div4, t11);
    			append_dev(div4, p3);
    			append_dev(p3, t12);
    			append_dev(p3, t13);
    			append_dev(p3, t14);
    			append_dev(p3, t15);
    			append_dev(p3, t16);
    			append_dev(div4, t17);
    			append_dev(div4, p4);
    			append_dev(p4, t18);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div6);
    			append_dev(div6, p5);
    			append_dev(div8, t21);
    			append_dev(div8, div7);
    			append_dev(div7, t22);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*loginUserAddress*/ 4 && t2_value !== (t2_value = /*loginUserAddress*/ ctx[2].full_name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*loginUserAddress*/ 4 && t6_value !== (t6_value = /*loginUserAddress*/ ctx[2].apartment + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*loginUserAddress*/ 4 && t8_value !== (t8_value = /*loginUserAddress*/ ctx[2].street + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*loginUserAddress*/ 4 && t10_value !== (t10_value = /*loginUserAddress*/ ctx[2].landmark + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*loginUserAddress*/ 4 && t12_value !== (t12_value = /*loginUserAddress*/ ctx[2].city + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*loginUserAddress*/ 4 && t14_value !== (t14_value = /*loginUserAddress*/ ctx[2].state + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*loginUserAddress*/ 4 && t16_value !== (t16_value = /*loginUserAddress*/ ctx[2].pin_code + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*loginUserAddress*/ 4 && t18_value !== (t18_value = /*loginUserAddress*/ ctx[2].address_type + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*loginUserAddress*/ 4 && t22_value !== (t22_value = /*loginUserAddress*/ ctx[2].contact + "")) set_data_dev(t22, t22_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(123:4) {#if block === \\\"savedData\\\"}",
    		ctx
    	});

    	return block_1;
    }

    // (203:4) {:else}
    function create_else_block$1(ctx) {
    	let h4;
    	let b;
    	let t1;
    	let div16;
    	let div15;
    	let div2;
    	let div0;
    	let p0;
    	let t3;
    	let div1;
    	let t4_value = /*buyingProductDetail*/ ctx[0].product_name + "";
    	let t4;
    	let t5;
    	let div5;
    	let div3;
    	let p1;
    	let t7;
    	let div4;
    	let t8_value = /*buyingProductDetail*/ ctx[0].ordered_qty + "";
    	let t8;
    	let t9;
    	let div8;
    	let div6;
    	let p2;
    	let t11;
    	let div7;
    	let t12;
    	let t13_value = /*buyingProductDetail*/ ctx[0].price + "";
    	let t13;
    	let t14;
    	let div11;
    	let div9;
    	let p3;
    	let t16;
    	let div10;
    	let t18;
    	let div14;
    	let div12;
    	let p4;
    	let t20;
    	let div13;
    	let t21;
    	let t22_value = /*buyingProductDetail*/ ctx[0].price * /*buyingProductDetail*/ ctx[0].ordered_qty + "";
    	let t22;

    	const block_1 = {
    		c: function create() {
    			h4 = element("h4");
    			b = element("b");
    			b.textContent = "Price Details:";
    			t1 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Product Name:";
    			t3 = space();
    			div1 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "Product Quantity:";
    			t7 = space();
    			div4 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div8 = element("div");
    			div6 = element("div");
    			p2 = element("p");
    			p2.textContent = "Price (1 item):";
    			t11 = space();
    			div7 = element("div");
    			t12 = text("₹ ");
    			t13 = text(t13_value);
    			t14 = space();
    			div11 = element("div");
    			div9 = element("div");
    			p3 = element("p");
    			p3.textContent = "Delivery Charges:";
    			t16 = space();
    			div10 = element("div");
    			div10.textContent = "Free Delivery";
    			t18 = space();
    			div14 = element("div");
    			div12 = element("div");
    			p4 = element("p");
    			p4.textContent = "Total Amount:";
    			t20 = space();
    			div13 = element("div");
    			t21 = text("₹ ");
    			t22 = text(t22_value);
    			add_location(b, file$b, 203, 8, 6631);
    			add_location(h4, file$b, 203, 4, 6627);
    			add_location(p0, file$b, 208, 14, 6795);
    			attr_dev(div0, "class", "col-md-6");
    			add_location(div0, file$b, 207, 12, 6757);
    			attr_dev(div1, "class", "col-md-6");
    			add_location(div1, file$b, 210, 12, 6849);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$b, 206, 10, 6726);
    			add_location(p1, file$b, 214, 14, 7010);
    			attr_dev(div3, "class", "col-md-6");
    			add_location(div3, file$b, 213, 12, 6972);
    			attr_dev(div4, "class", "col-md-6");
    			add_location(div4, file$b, 216, 12, 7068);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$b, 212, 10, 6941);
    			add_location(p2, file$b, 220, 14, 7228);
    			attr_dev(div6, "class", "col-md-6");
    			add_location(div6, file$b, 219, 12, 7190);
    			attr_dev(div7, "class", "col-md-6");
    			add_location(div7, file$b, 222, 12, 7284);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$b, 218, 10, 7159);
    			add_location(p3, file$b, 227, 14, 7442);
    			attr_dev(div9, "class", "col-md-6");
    			add_location(div9, file$b, 226, 12, 7404);
    			attr_dev(div10, "class", "col-md-6");
    			add_location(div10, file$b, 229, 12, 7500);
    			attr_dev(div11, "class", "row");
    			add_location(div11, file$b, 225, 10, 7373);
    			add_location(p4, file$b, 234, 14, 7642);
    			attr_dev(div12, "class", "col-md-6");
    			add_location(div12, file$b, 233, 12, 7604);
    			attr_dev(div13, "class", "col-md-6");
    			add_location(div13, file$b, 236, 12, 7696);
    			attr_dev(div14, "class", "row");
    			add_location(div14, file$b, 232, 10, 7573);
    			attr_dev(div15, "class", "col-md-6");
    			add_location(div15, file$b, 205, 8, 6692);
    			attr_dev(div16, "class", "row");
    			add_location(div16, file$b, 204, 6, 6665);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, b);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div15);
    			append_dev(div15, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, t4);
    			append_dev(div15, t5);
    			append_dev(div15, div5);
    			append_dev(div5, div3);
    			append_dev(div3, p1);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, t8);
    			append_dev(div15, t9);
    			append_dev(div15, div8);
    			append_dev(div8, div6);
    			append_dev(div6, p2);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, t12);
    			append_dev(div7, t13);
    			append_dev(div15, t14);
    			append_dev(div15, div11);
    			append_dev(div11, div9);
    			append_dev(div9, p3);
    			append_dev(div11, t16);
    			append_dev(div11, div10);
    			append_dev(div15, t18);
    			append_dev(div15, div14);
    			append_dev(div14, div12);
    			append_dev(div12, p4);
    			append_dev(div14, t20);
    			append_dev(div14, div13);
    			append_dev(div13, t21);
    			append_dev(div13, t22);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*buyingProductDetail*/ 1 && t4_value !== (t4_value = /*buyingProductDetail*/ ctx[0].product_name + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*buyingProductDetail*/ 1 && t8_value !== (t8_value = /*buyingProductDetail*/ ctx[0].ordered_qty + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*buyingProductDetail*/ 1 && t13_value !== (t13_value = /*buyingProductDetail*/ ctx[0].price + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*buyingProductDetail*/ 1 && t22_value !== (t22_value = /*buyingProductDetail*/ ctx[0].price * /*buyingProductDetail*/ ctx[0].ordered_qty + "")) set_data_dev(t22, t22_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div16);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(203:4) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (160:4) {#if buyingProductDetail.length >= 1}
    function create_if_block$7(ctx) {
    	let each_1_anchor;
    	let each_value = /*buyingProductDetail*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block_1 = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*buyingProductDetail*/ 1) {
    				each_value = /*buyingProductDetail*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(160:4) {#if buyingProductDetail.length >= 1}",
    		ctx
    	});

    	return block_1;
    }

    // (161:6) {#each buyingProductDetail as buyingProductDetail, index}
    function create_each_block$3(ctx) {
    	let div13;
    	let div12;
    	let div2;
    	let div0;
    	let b0;
    	let p0;
    	let t1;
    	let div1;
    	let b1;
    	let t2_value = /*buyingProductDetail*/ ctx[0].product_name + "";
    	let t2;
    	let t3;
    	let div5;
    	let div3;
    	let p1;
    	let t5;
    	let div4;
    	let t6;
    	let t7_value = /*buyingProductDetail*/ ctx[0].price + "";
    	let t7;
    	let t8;
    	let div8;
    	let div6;
    	let p2;
    	let t10;
    	let div7;
    	let t12;
    	let div11;
    	let div9;
    	let p3;
    	let t13;
    	let t14_value = /*buyingProductDetail*/ ctx[0].qty + "";
    	let t14;
    	let t15;
    	let t16;
    	let div10;
    	let t17;
    	let t18_value = /*buyingProductDetail*/ ctx[0].price * /*buyingProductDetail*/ ctx[0].qty + "";
    	let t18;
    	let t19;

    	const block_1 = {
    		c: function create() {
    			div13 = element("div");
    			div12 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			b0 = element("b");
    			p0 = element("p");
    			p0.textContent = "Product Name:";
    			t1 = space();
    			div1 = element("div");
    			b1 = element("b");
    			t2 = text(t2_value);
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "Unit Price :";
    			t5 = space();
    			div4 = element("div");
    			t6 = text("₹ ");
    			t7 = text(t7_value);
    			t8 = space();
    			div8 = element("div");
    			div6 = element("div");
    			p2 = element("p");
    			p2.textContent = "Delivery Charges:";
    			t10 = space();
    			div7 = element("div");
    			div7.textContent = "Free Delivery";
    			t12 = space();
    			div11 = element("div");
    			div9 = element("div");
    			p3 = element("p");
    			t13 = text("Total Amount (");
    			t14 = text(t14_value);
    			t15 = text(" item):");
    			t16 = space();
    			div10 = element("div");
    			t17 = text("₹ ");
    			t18 = text(t18_value);
    			t19 = space();
    			add_location(p0, file$b, 165, 19, 5393);
    			add_location(b0, file$b, 165, 16, 5390);
    			attr_dev(div0, "class", "col-md-6");
    			add_location(div0, file$b, 164, 14, 5350);
    			add_location(b1, file$b, 168, 16, 5495);
    			attr_dev(div1, "class", "col-md-6");
    			add_location(div1, file$b, 167, 14, 5455);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$b, 163, 12, 5317);
    			add_location(p1, file$b, 179, 16, 5896);
    			attr_dev(div3, "class", "col-md-6");
    			add_location(div3, file$b, 178, 14, 5856);
    			attr_dev(div4, "class", "col-md-6");
    			add_location(div4, file$b, 181, 14, 5953);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$b, 177, 12, 5823);
    			add_location(p2, file$b, 186, 16, 6119);
    			attr_dev(div6, "class", "col-md-6");
    			add_location(div6, file$b, 185, 14, 6079);
    			attr_dev(div7, "class", "col-md-6");
    			add_location(div7, file$b, 188, 14, 6181);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$b, 184, 12, 6046);
    			add_location(p3, file$b, 193, 16, 6331);
    			attr_dev(div9, "class", "col-md-6");
    			add_location(div9, file$b, 192, 14, 6291);
    			attr_dev(div10, "class", "col-md-6");
    			add_location(div10, file$b, 195, 14, 6422);
    			attr_dev(div11, "class", "row");
    			add_location(div11, file$b, 191, 12, 6258);
    			attr_dev(div12, "class", "col-md-6");
    			add_location(div12, file$b, 162, 10, 5281);
    			attr_dev(div13, "class", "row");
    			add_location(div13, file$b, 161, 8, 5252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div12);
    			append_dev(div12, div2);
    			append_dev(div2, div0);
    			append_dev(div0, b0);
    			append_dev(b0, p0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, b1);
    			append_dev(b1, t2);
    			append_dev(div12, t3);
    			append_dev(div12, div5);
    			append_dev(div5, div3);
    			append_dev(div3, p1);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, t6);
    			append_dev(div4, t7);
    			append_dev(div12, t8);
    			append_dev(div12, div8);
    			append_dev(div8, div6);
    			append_dev(div6, p2);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    			append_dev(div12, t12);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, p3);
    			append_dev(p3, t13);
    			append_dev(p3, t14);
    			append_dev(p3, t15);
    			append_dev(div11, t16);
    			append_dev(div11, div10);
    			append_dev(div10, t17);
    			append_dev(div10, t18);
    			append_dev(div13, t19);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*buyingProductDetail*/ 1 && t2_value !== (t2_value = /*buyingProductDetail*/ ctx[0].product_name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*buyingProductDetail*/ 1 && t7_value !== (t7_value = /*buyingProductDetail*/ ctx[0].price + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*buyingProductDetail*/ 1 && t14_value !== (t14_value = /*buyingProductDetail*/ ctx[0].qty + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*buyingProductDetail*/ 1 && t18_value !== (t18_value = /*buyingProductDetail*/ ctx[0].price * /*buyingProductDetail*/ ctx[0].qty + "")) set_data_dev(t18, t18_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(161:6) {#each buyingProductDetail as buyingProductDetail, index}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$b(ctx) {
    	let main;
    	let div8;
    	let h2;
    	let t1;
    	let div2;
    	let div0;
    	let h40;
    	let b0;
    	let t3;
    	let div1;
    	let a;
    	let button0;
    	let t5;
    	let t6;
    	let t7;
    	let hr;
    	let t8;
    	let h41;
    	let b1;
    	let t10;
    	let t11;
    	let div7;
    	let div6;
    	let div5;
    	let div3;
    	let h42;
    	let t12;
    	let t13_value = /*calculateTotalPrice*/ ctx[4]() + "";
    	let t13;
    	let t14;
    	let div4;
    	let button1;
    	let mounted;
    	let dispose;
    	let if_block0 = /*fillAddress*/ ctx[3] && create_if_block_3$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*block*/ ctx[1] === "savedData") return create_if_block_1$4;
    		if (/*block*/ ctx[1] === "defaultData") return create_if_block_2$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*buyingProductDetail*/ ctx[0].length >= 1) return create_if_block$7;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1(ctx);

    	const block_1 = {
    		c: function create() {
    			main = element("main");
    			div8 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Order Summary";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h40 = element("h4");
    			b0 = element("b");
    			b0.textContent = "Confirm Address:";
    			t3 = space();
    			div1 = element("div");
    			a = element("a");
    			button0 = element("button");
    			button0.textContent = "Add Address";
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			hr = element("hr");
    			t8 = space();
    			h41 = element("h4");
    			b1 = element("b");
    			b1.textContent = "Price Details:";
    			t10 = space();
    			if_block2.c();
    			t11 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			h42 = element("h4");
    			t12 = text("Grand total: ₹ ");
    			t13 = text(t13_value);
    			t14 = space();
    			div4 = element("div");
    			button1 = element("button");
    			button1.textContent = "Confirm Order";
    			add_location(h2, file$b, 106, 4, 3566);
    			add_location(b0, file$b, 109, 12, 3656);
    			add_location(h40, file$b, 109, 8, 3652);
    			attr_dev(div0, "class", "col-md-10");
    			add_location(div0, file$b, 108, 6, 3619);
    			attr_dev(button0, "class", "btn-myStyle");
    			add_location(button0, file$b, 114, 10, 3781);
    			attr_dev(a, "href", "#/cart/buy/address");
    			add_location(a, file$b, 113, 8, 3740);
    			attr_dev(div1, "class", "col-md-2");
    			add_location(div1, file$b, 112, 6, 3708);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$b, 107, 4, 3594);
    			add_location(hr, file$b, 156, 4, 5090);
    			add_location(b1, file$b, 158, 8, 5108);
    			add_location(h41, file$b, 158, 4, 5104);
    			add_location(h42, file$b, 247, 12, 8025);
    			attr_dev(div3, "class", "col-md-8");
    			add_location(div3, file$b, 246, 10, 7989);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-myStyle btn-lg btn-block");
    			add_location(button1, file$b, 253, 12, 8170);
    			attr_dev(div4, "class", "col-md-4");
    			add_location(div4, file$b, 252, 10, 8134);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$b, 245, 8, 7960);
    			attr_dev(div6, "class", "panel-footer");
    			add_location(div6, file$b, 244, 6, 7924);
    			attr_dev(div7, "class", "panel panel-default");
    			add_location(div7, file$b, 243, 4, 7882);
    			attr_dev(div8, "class", "container");
    			add_location(div8, file$b, 105, 2, 3537);
    			add_location(main, file$b, 104, 0, 3527);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div8);
    			append_dev(div8, h2);
    			append_dev(div8, t1);
    			append_dev(div8, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h40);
    			append_dev(h40, b0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, button0);
    			append_dev(div2, t5);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div8, t6);
    			if (if_block1) if_block1.m(div8, null);
    			append_dev(div8, t7);
    			append_dev(div8, hr);
    			append_dev(div8, t8);
    			append_dev(div8, h41);
    			append_dev(h41, b1);
    			append_dev(div8, t10);
    			if_block2.m(div8, null);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h42);
    			append_dev(h42, t12);
    			append_dev(h42, t13);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, button1);

    			if (!mounted) {
    				dispose = listen_dev(button1, "click", prevent_default(/*placeOrderDetail*/ ctx[5]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*fillAddress*/ ctx[3]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(div2, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div8, t7);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div8, t11);
    				}
    			}

    			if (dirty & /*calculateTotalPrice*/ 16 && t13_value !== (t13_value = /*calculateTotalPrice*/ ctx[4]() + "")) set_data_dev(t13, t13_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let calculateTotalPrice;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OrderSummary', slots, []);
    	const userControllerClass = new UserController();
    	let block;
    	let loginUserAddress;
    	let buyingProductDetail;
    	let user_id;
    	let product_id;
    	let product_name;
    	let unit_price;
    	let order_status;
    	let descriptions;
    	let ordered_qty;
    	let address_id;
    	buyingProductDetail = JSON.parse(sessionStorage.getItem("productId"));
    	loginUserAddress = JSON.parse(sessionStorage.getItem("address"));

    	// loginUserAddress = buyingProductDetail;
    	console.log(buyingProductDetail);

    	let totalPrice;
    	let count;
    	console.log(totalPrice);

    	if (loginUserAddress === null) {
    		block = "defaultData";
    	} else {
    		block = "savedData";
    	}

    	let fillAddress = false;

    	const placeOrderDetail = async () => {
    		if (loginUserAddress === null) {
    			$$invalidate(3, fillAddress = true);
    		} else {
    			let qty;

    			if (buyingProductDetail.ordered_qty === null) {
    				qty = buyingProductDetail.qty;
    			} else {
    				qty = buyingProductDetail.ordered_qty;
    			}

    			let orderDetail = {
    				user_id: loginUserAddress.user_id,
    				product_id: buyingProductDetail.product_id,
    				address_id: loginUserAddress.address_id,
    				unit_price: buyingProductDetail.price * qty,
    				created_by: loginUserAddress.email,
    				updated_by: loginUserAddress.email,
    				ordered_qty: qty
    			};

    			let result = await userControllerClass.placeOrderController(orderDetail);
    			console.log(result);

    			if (result.status === true) {
    				let data = {
    					full_name: loginUserAddress.full_name,
    					email: loginUserAddress.email,
    					product_id: buyingProductDetail.product_id,
    					product_name: buyingProductDetail.product_name,
    					price: buyingProductDetail.price,
    					descriptions: buyingProductDetail.descriptions,
    					ordered_qty: buyingProductDetail.ordered_qty,
    					picture: buyingProductDetail.picture,
    					contact: loginUserAddress.contact,
    					apartment: loginUserAddress.apartment,
    					street: loginUserAddress.street,
    					landmark: loginUserAddress.landmark,
    					city: loginUserAddress.city,
    					state: loginUserAddress.state,
    					pin_code: loginUserAddress.pin_code,
    					address_type: loginUserAddress.address_type,
    					user_id: loginUserAddress.user_id,
    					address_id: loginUserAddress.address_id,
    					order_id: result.data.order_id
    				};

    				sessionStorage.setItem("address", JSON.stringify(data));
    				push("/cart/buy/payment");
    			} else {
    				push("/cart/buy");
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$7.warn(`<OrderSummary> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		UserController,
    		push,
    		pop,
    		replace,
    		getSingleProductStore,
    		onMount,
    		userControllerClass,
    		block,
    		loginUserAddress,
    		buyingProductDetail,
    		user_id,
    		product_id,
    		product_name,
    		unit_price,
    		order_status,
    		descriptions,
    		ordered_qty,
    		address_id,
    		totalPrice,
    		count,
    		fillAddress,
    		placeOrderDetail,
    		calculateTotalPrice
    	});

    	$$self.$inject_state = $$props => {
    		if ('block' in $$props) $$invalidate(1, block = $$props.block);
    		if ('loginUserAddress' in $$props) $$invalidate(2, loginUserAddress = $$props.loginUserAddress);
    		if ('buyingProductDetail' in $$props) $$invalidate(0, buyingProductDetail = $$props.buyingProductDetail);
    		if ('user_id' in $$props) user_id = $$props.user_id;
    		if ('product_id' in $$props) product_id = $$props.product_id;
    		if ('product_name' in $$props) product_name = $$props.product_name;
    		if ('unit_price' in $$props) unit_price = $$props.unit_price;
    		if ('order_status' in $$props) order_status = $$props.order_status;
    		if ('descriptions' in $$props) descriptions = $$props.descriptions;
    		if ('ordered_qty' in $$props) ordered_qty = $$props.ordered_qty;
    		if ('address_id' in $$props) address_id = $$props.address_id;
    		if ('totalPrice' in $$props) $$invalidate(15, totalPrice = $$props.totalPrice);
    		if ('count' in $$props) count = $$props.count;
    		if ('fillAddress' in $$props) $$invalidate(3, fillAddress = $$props.fillAddress);
    		if ('calculateTotalPrice' in $$props) $$invalidate(4, calculateTotalPrice = $$props.calculateTotalPrice);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*buyingProductDetail*/ 1) {
    			// for (let index = 0; index < buyingProductDetail.length; index++) {
    			//   totalPrice =
    			//     totalPrice +
    			//     buyingProductDetail[index].price * buyingProductDetail[index].qty;
    			// }
    			$$invalidate(4, calculateTotalPrice = () => {
    				let totalPrice = 0;

    				if (buyingProductDetail.length >= 1) {
    					buyingProductDetail.forEach(item => {
    						totalPrice += item.price * item.qty;
    					});

    					return totalPrice;
    				} else {
    					totalPrice = buyingProductDetail.price * buyingProductDetail.ordered_qty;
    					return totalPrice;
    				}
    			});
    		}
    	};

    	return [
    		buyingProductDetail,
    		block,
    		loginUserAddress,
    		fillAddress,
    		calculateTotalPrice,
    		placeOrderDetail
    	];
    }

    class OrderSummary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OrderSummary",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\views\Payment.svelte generated by Svelte v3.57.0 */
    const file$a = "src\\views\\Payment.svelte";

    // (59:6) {#if payment_method === "Select Payment Method"}
    function create_if_block$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please select payment method";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$a, 59, 8, 2099);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(59:6) {#if payment_method === \\\"Select Payment Method\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div2;
    	let form;
    	let h1;
    	let t1;
    	let div0;
    	let label0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t9;
    	let t10;
    	let div1;
    	let label1;
    	let t11;
    	let span1;
    	let t13;
    	let t14;
    	let input;
    	let t15;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = /*payment_method*/ ctx[0] === "Select Payment Method" && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "PAYMENT";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			t2 = text("Payment Method ");
    			span0 = element("span");
    			span0.textContent = "*";
    			t4 = text(" :");
    			t5 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Select Payment Method";
    			option1 = element("option");
    			option1.textContent = "Cash on Delivery";
    			option2 = element("option");
    			option2.textContent = "Online";
    			t9 = space();
    			if (if_block) if_block.c();
    			t10 = space();
    			div1 = element("div");
    			label1 = element("label");
    			t11 = text("Total Amount ");
    			span1 = element("span");
    			span1.textContent = "*";
    			t13 = text(" :");
    			t14 = space();
    			input = element("input");
    			t15 = space();
    			button = element("button");
    			button.textContent = "PAY";
    			attr_dev(h1, "class", "svelte-117ux3g");
    			add_location(h1, file$a, 42, 4, 1462);
    			attr_dev(span0, "class", "text-danger svelte-117ux3g");
    			add_location(span0, file$a, 46, 24, 1633);
    			attr_dev(label0, "class", "form-label svelte-117ux3g");
    			add_location(label0, file$a, 45, 6, 1582);
    			option0.__value = "Select Payment Method";
    			option0.value = option0.__value;
    			add_location(option0, file$a, 54, 8, 1832);
    			option1.__value = "Cash On Delivery";
    			option1.value = option1.__value;
    			add_location(option1, file$a, 55, 8, 1910);
    			option2.__value = "Online";
    			option2.value = option2.__value;
    			add_location(option2, file$a, 56, 8, 1978);
    			attr_dev(select, "id", "payment");
    			attr_dev(select, "name", "payment");
    			attr_dev(select, "class", "form-control");
    			if (/*payment_method*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$a, 48, 6, 1693);
    			attr_dev(div0, "class", "form-outline");
    			add_location(div0, file$a, 43, 4, 1484);
    			attr_dev(span1, "class", "text-danger svelte-117ux3g");
    			add_location(span1, file$a, 66, 22, 2338);
    			attr_dev(label1, "class", "form-label svelte-117ux3g");
    			add_location(label1, file$a, 65, 6, 2289);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*total_amount*/ ctx[1]);
    			attr_dev(input, "class", "form-control");
    			input.readOnly = true;
    			add_location(input, file$a, 68, 6, 2398);
    			attr_dev(div1, "class", "form-outline");
    			add_location(div1, file$a, 63, 4, 2191);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary btn-block btn-myStyle svelte-117ux3g");
    			add_location(button, file$a, 78, 4, 2569);
    			add_location(form, file$a, 41, 2, 1450);
    			attr_dev(div2, "class", "container1");
    			set_style(div2, "width", "30%");
    			set_style(div2, "margin-top", "5%");
    			set_style(div2, "margin-left", "33.33%");
    			add_location(div2, file$a, 37, 0, 1357);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, form);
    			append_dev(form, h1);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t2);
    			append_dev(label0, span0);
    			append_dev(label0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*payment_method*/ ctx[0], true);
    			append_dev(div0, t9);
    			if (if_block) if_block.m(div0, null);
    			append_dev(form, t10);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(label1, t11);
    			append_dev(label1, span1);
    			append_dev(label1, t13);
    			append_dev(div1, t14);
    			append_dev(div1, input);
    			append_dev(form, t15);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[3]),
    					listen_dev(button, "click", /*selectPaymentMethod*/ ctx[2], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*payment_method*/ 1) {
    				select_option(select, /*payment_method*/ ctx[0]);
    			}

    			if (/*payment_method*/ ctx[0] === "Select Payment Method") {
    				if (if_block) ; else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*total_amount*/ 2) {
    				attr_dev(input, "placeholder", /*total_amount*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Payment', slots, []);
    	const userControllerClass = new UserController();
    	let payment_method = "Select Payment Method";
    	let paymentDetails;
    	let total_amount;
    	let productDetail = JSON.parse(sessionStorage.getItem("productId"));
    	let addressDetail = JSON.parse(sessionStorage.getItem("address"));
    	paymentDetails = productDetail;
    	total_amount = productDetail.price * productDetail.ordered_qty;

    	const selectPaymentMethod = async () => {
    		// if(payment_method !== "Select Payment Method")
    		try {
    			let paymentData = {
    				created_by: addressDetail.email,
    				updated_by: addressDetail.email,
    				pay_method: payment_method,
    				total_amount,
    				payment_status: "Success",
    				order_id: addressDetail.order_id,
    				order_status: "Placed"
    			};

    			let result = await userControllerClass.paymentDetailController(paymentData);

    			if (await result.status === true) {
    				push("/cart/buy/payment/success");
    			} // replace("/cart/buy/payment")
    			// window.history.go(-1); return false;
    		} catch(error) {
    			push("/cart/buy/payment");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Payment> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		payment_method = select_value(this);
    		$$invalidate(0, payment_method);
    	}

    	$$self.$capture_state = () => ({
    		push,
    		pop,
    		replace,
    		UserController,
    		getSingleProductStore,
    		userControllerClass,
    		payment_method,
    		paymentDetails,
    		total_amount,
    		productDetail,
    		addressDetail,
    		selectPaymentMethod
    	});

    	$$self.$inject_state = $$props => {
    		if ('payment_method' in $$props) $$invalidate(0, payment_method = $$props.payment_method);
    		if ('paymentDetails' in $$props) paymentDetails = $$props.paymentDetails;
    		if ('total_amount' in $$props) $$invalidate(1, total_amount = $$props.total_amount);
    		if ('productDetail' in $$props) productDetail = $$props.productDetail;
    		if ('addressDetail' in $$props) addressDetail = $$props.addressDetail;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [payment_method, total_amount, selectPaymentMethod, select_change_handler];
    }

    class Payment extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Payment",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\views\AddAddressForm.svelte generated by Svelte v3.57.0 */

    const file$9 = "src\\views\\AddAddressForm.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (181:8) {#if firstLoad && !containsAlphabets(address.full_name)}
    function create_if_block_9(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Only alphabets are allowed";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 181, 10, 6608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(181:8) {#if firstLoad && !containsAlphabets(address.full_name)}",
    		ctx
    	});

    	return block;
    }

    // (200:8) {#if firstLoad && !validateEmail(address.email)}
    function create_if_block_8(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter a valid email";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 200, 10, 7202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(200:8) {#if firstLoad && !validateEmail(address.email)}",
    		ctx
    	});

    	return block;
    }

    // (218:8) {#if firstLoad && !validatePhoneNumber(address.contact)}
    function create_if_block_7(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter a valid contact";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 218, 10, 7810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(218:8) {#if firstLoad && !validatePhoneNumber(address.contact)}",
    		ctx
    	});

    	return block;
    }

    // (237:8) {#if firstLoad && address.apartment.length === 0}
    function create_if_block_6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Apartment cannot be empty";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 237, 10, 8451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(237:8) {#if firstLoad && address.apartment.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (254:8) {#if firstLoad && address.street.length === 0}
    function create_if_block_5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Street name cannot be empty";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 254, 10, 9040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(254:8) {#if firstLoad && address.street.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (272:8) {#if firstLoad && address.landmark.length === 0}
    function create_if_block_4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Landmark cannot be empty";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 272, 10, 9661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(272:8) {#if firstLoad && address.landmark.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (333:8) {#if firstLoad && address.state === "Select State"}
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please select your state";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 333, 10, 12471);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(333:8) {#if firstLoad && address.state === \\\"Select State\\\"}",
    		ctx
    	});

    	return block;
    }

    // (352:10) {#each getCitiesByState(address.state) as cityName}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*cityName*/ ctx[18] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*cityName*/ ctx[18];
    			option.value = option.__value;
    			add_location(option, file$9, 352, 12, 13139);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*address*/ 2 && t_value !== (t_value = /*cityName*/ ctx[18] + "")) set_data_dev(t, t_value);

    			if (dirty & /*address*/ 2 && option_value_value !== (option_value_value = /*cityName*/ ctx[18])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(352:10) {#each getCitiesByState(address.state) as cityName}",
    		ctx
    	});

    	return block;
    }

    // (356:8) {#if firstLoad && address.city === "Select City"}
    function create_if_block_2$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please select your city";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 356, 10, 13292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(356:8) {#if firstLoad && address.city === \\\"Select City\\\"}",
    		ctx
    	});

    	return block;
    }

    // (376:8) {#if firstLoad && !isZipNumber(address.pin_code)}
    function create_if_block_1$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter valid pincode";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 376, 10, 13925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(376:8) {#if firstLoad && !isZipNumber(address.pin_code)}",
    		ctx
    	});

    	return block;
    }

    // (399:6) {#if firstLoad && address.address_type === "Select Address Type"}
    function create_if_block$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please select a address type";
    			attr_dev(div, "class", "text-danger svelte-6bllsv");
    			add_location(div, file$9, 399, 8, 14731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(399:6) {#if firstLoad && address.address_type === \\\"Select Address Type\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let main;
    	let div12;
    	let h1;
    	let t1;
    	let div9;
    	let div0;
    	let label0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let input0;
    	let t6;
    	let show_if_3 = /*firstLoad*/ ctx[0] && !containsAlphabets(/*address*/ ctx[1].full_name);
    	let t7;
    	let div1;
    	let label1;
    	let t8;
    	let span1;
    	let t10;
    	let t11;
    	let input1;
    	let t12;
    	let show_if_2 = /*firstLoad*/ ctx[0] && !validateEmail(/*address*/ ctx[1].email);
    	let t13;
    	let div2;
    	let label2;
    	let t14;
    	let span2;
    	let t16;
    	let t17;
    	let input2;
    	let t18;
    	let show_if_1 = /*firstLoad*/ ctx[0] && !validatePhoneNumber(/*address*/ ctx[1].contact);
    	let t19;
    	let div3;
    	let label3;
    	let t20;
    	let span3;
    	let t22;
    	let t23;
    	let input3;
    	let t24;
    	let t25;
    	let div4;
    	let label4;
    	let t26;
    	let span4;
    	let t28;
    	let t29;
    	let input4;
    	let t30;
    	let t31;
    	let div5;
    	let label5;
    	let t32;
    	let span5;
    	let t34;
    	let t35;
    	let input5;
    	let t36;
    	let t37;
    	let div6;
    	let label6;
    	let t38;
    	let span6;
    	let t40;
    	let t41;
    	let select0;
    	let option0;
    	let t42_value = /*address*/ ctx[1].state + "";
    	let t42;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let option11;
    	let option12;
    	let option13;
    	let option14;
    	let option15;
    	let option16;
    	let option17;
    	let option18;
    	let option19;
    	let option20;
    	let option21;
    	let option22;
    	let option23;
    	let option24;
    	let option25;
    	let option26;
    	let option27;
    	let option28;
    	let option29;
    	let option30;
    	let option31;
    	let option32;
    	let option33;
    	let option34;
    	let option35;
    	let t78;
    	let t79;
    	let div7;
    	let label7;
    	let t80;
    	let span7;
    	let t82;
    	let t83;
    	let select1;
    	let option36;
    	let t84_value = /*address*/ ctx[1].city + "";
    	let t84;
    	let option36_value_value;
    	let select1_class_value;
    	let t85;
    	let t86;
    	let div8;
    	let label8;
    	let t87;
    	let span8;
    	let t89;
    	let t90;
    	let input6;
    	let t91;
    	let show_if = /*firstLoad*/ ctx[0] && !isZipNumber(/*address*/ ctx[1].pin_code);
    	let t92;
    	let div10;
    	let label9;
    	let t93;
    	let span9;
    	let t95;
    	let t96;
    	let select2;
    	let option37;
    	let option38;
    	let option39;
    	let t100;
    	let t101;
    	let div11;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = show_if_3 && create_if_block_9(ctx);
    	let if_block1 = show_if_2 && create_if_block_8(ctx);
    	let if_block2 = show_if_1 && create_if_block_7(ctx);
    	let if_block3 = /*firstLoad*/ ctx[0] && /*address*/ ctx[1].apartment.length === 0 && create_if_block_6(ctx);
    	let if_block4 = /*firstLoad*/ ctx[0] && /*address*/ ctx[1].street.length === 0 && create_if_block_5(ctx);
    	let if_block5 = /*firstLoad*/ ctx[0] && /*address*/ ctx[1].landmark.length === 0 && create_if_block_4(ctx);
    	let if_block6 = /*firstLoad*/ ctx[0] && /*address*/ ctx[1].state === "Select State" && create_if_block_3(ctx);
    	let each_value = /*getCitiesByState*/ ctx[3](/*address*/ ctx[1].state);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	let if_block7 = /*firstLoad*/ ctx[0] && /*address*/ ctx[1].city === "Select City" && create_if_block_2$1(ctx);
    	let if_block8 = show_if && create_if_block_1$3(ctx);
    	let if_block9 = /*firstLoad*/ ctx[0] && /*address*/ ctx[1].address_type === "Select Address Type" && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div12 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ADD ADDRESS";
    			t1 = space();
    			div9 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			t2 = text("Full Name ");
    			span0 = element("span");
    			span0.textContent = "*";
    			t4 = text(" :");
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			div1 = element("div");
    			label1 = element("label");
    			t8 = text("Email ");
    			span1 = element("span");
    			span1.textContent = "*";
    			t10 = text(":");
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			div2 = element("div");
    			label2 = element("label");
    			t14 = text("Contact ");
    			span2 = element("span");
    			span2.textContent = "*";
    			t16 = text(":");
    			t17 = space();
    			input2 = element("input");
    			t18 = space();
    			if (if_block2) if_block2.c();
    			t19 = space();
    			div3 = element("div");
    			label3 = element("label");
    			t20 = text("Apartment ");
    			span3 = element("span");
    			span3.textContent = "*";
    			t22 = text(" :");
    			t23 = space();
    			input3 = element("input");
    			t24 = space();
    			if (if_block3) if_block3.c();
    			t25 = space();
    			div4 = element("div");
    			label4 = element("label");
    			t26 = text("Street Name ");
    			span4 = element("span");
    			span4.textContent = "*";
    			t28 = text(" :");
    			t29 = space();
    			input4 = element("input");
    			t30 = space();
    			if (if_block4) if_block4.c();
    			t31 = space();
    			div5 = element("div");
    			label5 = element("label");
    			t32 = text("Landmark ");
    			span5 = element("span");
    			span5.textContent = "*";
    			t34 = text(":");
    			t35 = space();
    			input5 = element("input");
    			t36 = space();
    			if (if_block5) if_block5.c();
    			t37 = space();
    			div6 = element("div");
    			label6 = element("label");
    			t38 = text("State ");
    			span6 = element("span");
    			span6.textContent = "*";
    			t40 = text(" :");
    			t41 = space();
    			select0 = element("select");
    			option0 = element("option");
    			t42 = text(t42_value);
    			option1 = element("option");
    			option1.textContent = "Andhra Pradesh";
    			option2 = element("option");
    			option2.textContent = "Andaman and Nicobar Islands";
    			option3 = element("option");
    			option3.textContent = "Arunachal Pradesh";
    			option4 = element("option");
    			option4.textContent = "Assam";
    			option5 = element("option");
    			option5.textContent = "Bihar";
    			option6 = element("option");
    			option6.textContent = "Chhattisgarh";
    			option7 = element("option");
    			option7.textContent = "Dadra and Nagar Haveli";
    			option8 = element("option");
    			option8.textContent = "Daman and Diu";
    			option9 = element("option");
    			option9.textContent = "Delhi";
    			option10 = element("option");
    			option10.textContent = "Lakshadweep";
    			option11 = element("option");
    			option11.textContent = "Puducherry";
    			option12 = element("option");
    			option12.textContent = "Goa";
    			option13 = element("option");
    			option13.textContent = "Gujarat";
    			option14 = element("option");
    			option14.textContent = "Haryana";
    			option15 = element("option");
    			option15.textContent = "Himachal Pradesh";
    			option16 = element("option");
    			option16.textContent = "Jammu and Kashmir";
    			option17 = element("option");
    			option17.textContent = "Jharkhand";
    			option18 = element("option");
    			option18.textContent = "Karnataka";
    			option19 = element("option");
    			option19.textContent = "Kerala";
    			option20 = element("option");
    			option20.textContent = "Madhya Pradesh";
    			option21 = element("option");
    			option21.textContent = "Maharashtra";
    			option22 = element("option");
    			option22.textContent = "Manipur";
    			option23 = element("option");
    			option23.textContent = "Meghalaya";
    			option24 = element("option");
    			option24.textContent = "Mizoram";
    			option25 = element("option");
    			option25.textContent = "Nagaland";
    			option26 = element("option");
    			option26.textContent = "Odisha";
    			option27 = element("option");
    			option27.textContent = "Punjab";
    			option28 = element("option");
    			option28.textContent = "Rajasthan";
    			option29 = element("option");
    			option29.textContent = "Sikkim";
    			option30 = element("option");
    			option30.textContent = "Tamil Nadu";
    			option31 = element("option");
    			option31.textContent = "Telangana";
    			option32 = element("option");
    			option32.textContent = "Tripura";
    			option33 = element("option");
    			option33.textContent = "Uttar Pradesh";
    			option34 = element("option");
    			option34.textContent = "Uttarakhand";
    			option35 = element("option");
    			option35.textContent = "West Bengal";
    			t78 = space();
    			if (if_block6) if_block6.c();
    			t79 = space();
    			div7 = element("div");
    			label7 = element("label");
    			t80 = text("City ");
    			span7 = element("span");
    			span7.textContent = "*";
    			t82 = text(" :");
    			t83 = space();
    			select1 = element("select");
    			option36 = element("option");
    			t84 = text(t84_value);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t85 = space();
    			if (if_block7) if_block7.c();
    			t86 = space();
    			div8 = element("div");
    			label8 = element("label");
    			t87 = text("Pin Code ");
    			span8 = element("span");
    			span8.textContent = "*";
    			t89 = text(" :");
    			t90 = space();
    			input6 = element("input");
    			t91 = space();
    			if (if_block8) if_block8.c();
    			t92 = space();
    			div10 = element("div");
    			label9 = element("label");
    			t93 = text("Address Type ");
    			span9 = element("span");
    			span9.textContent = "*";
    			t95 = text(":");
    			t96 = space();
    			select2 = element("select");
    			option37 = element("option");
    			option37.textContent = "Select Address Type";
    			option38 = element("option");
    			option38.textContent = "Home";
    			option39 = element("option");
    			option39.textContent = "Office";
    			t100 = space();
    			if (if_block9) if_block9.c();
    			t101 = space();
    			div11 = element("div");
    			button = element("button");
    			button.textContent = "ADD";
    			attr_dev(h1, "class", "svelte-6bllsv");
    			add_location(h1, file$9, 164, 4, 5984);
    			attr_dev(span0, "class", "required svelte-6bllsv");
    			add_location(span0, file$9, 169, 20, 6185);
    			attr_dev(label0, "for", "firstName");
    			attr_dev(label0, "class", "form-group fl fontLabel");
    			add_location(label0, file$9, 168, 8, 6108);
    			attr_dev(input0, "title", "Only Alphabets Are Allowed");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "full_name");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "placeholder", "First Name + Last Name");
    			add_location(input0, file$9, 172, 8, 6293);
    			attr_dev(div0, "class", "col-md-12 col-sm-12");
    			add_location(div0, file$9, 167, 6, 6065);
    			attr_dev(span1, "class", "required svelte-6bllsv");
    			add_location(span1, file$9, 188, 16, 6852);
    			attr_dev(label1, "for", "email");
    			attr_dev(label1, "class", "fl form-label svelte-6bllsv");
    			add_location(label1, file$9, 187, 8, 6793);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "placeholder", "Email");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$9, 191, 8, 6964);
    			attr_dev(div1, "class", "col-md-6 col-sm-6");
    			add_location(div1, file$9, 186, 6, 6752);
    			attr_dev(span2, "class", "required svelte-6bllsv");
    			add_location(span2, file$9, 207, 18, 7448);
    			attr_dev(label2, "for", "Contact");
    			attr_dev(label2, "class", "fl form-label svelte-6bllsv");
    			add_location(label2, file$9, 206, 8, 7385);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "Contact");
    			attr_dev(input2, "placeholder", "Contact");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$9, 210, 8, 7560);
    			attr_dev(div2, "class", "col-md-6 col-sm-6");
    			add_location(div2, file$9, 205, 6, 7344);
    			attr_dev(span3, "class", "required svelte-6bllsv");
    			add_location(span3, file$9, 225, 20, 8071);
    			attr_dev(label3, "for", "address");
    			attr_dev(label3, "class", "fl form-label svelte-6bllsv");
    			add_location(label3, file$9, 224, 8, 8006);
    			attr_dev(input3, "title", "Enter your address");
    			attr_dev(input3, "type", "Location");
    			input3.required = true;
    			attr_dev(input3, "name", "Location");
    			attr_dev(input3, "placeholder", "Building/Apartment");
    			attr_dev(input3, "class", "form-control");
    			add_location(input3, file$9, 227, 8, 8132);
    			attr_dev(div3, "class", "col-md-6 col-sm-6");
    			add_location(div3, file$9, 223, 6, 7965);
    			attr_dev(span4, "class", "required svelte-6bllsv");
    			add_location(span4, file$9, 244, 22, 8727);
    			attr_dev(label4, "for", "street1");
    			attr_dev(label4, "class", "fl form-label svelte-6bllsv");
    			add_location(label4, file$9, 243, 8, 8660);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "street1");
    			attr_dev(input4, "placeholder", "Street Name/Locality");
    			attr_dev(input4, "class", "form-control");
    			add_location(input4, file$9, 246, 8, 8788);
    			attr_dev(div4, "class", "col-md-6 col-sm-6");
    			add_location(div4, file$9, 242, 6, 8619);
    			attr_dev(span5, "class", "required svelte-6bllsv");
    			add_location(span5, file$9, 261, 19, 9305);
    			attr_dev(label5, "for", "street2");
    			attr_dev(label5, "class", "fl form-label svelte-6bllsv");
    			add_location(label5, file$9, 260, 8, 9241);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "name", "street1");
    			attr_dev(input5, "placeholder", "Landmark");
    			attr_dev(input5, "class", "form-control");
    			add_location(input5, file$9, 264, 8, 9417);
    			attr_dev(div5, "class", "col-md-6 col-sm-6");
    			add_location(div5, file$9, 259, 6, 9200);
    			attr_dev(span6, "class", "required svelte-6bllsv");
    			add_location(span6, file$9, 279, 16, 9900);
    			attr_dev(label6, "for", "State");
    			attr_dev(label6, "class", "fl form-label svelte-6bllsv");
    			add_location(label6, file$9, 278, 8, 9841);
    			option0.__value = "Select State";
    			option0.value = option0.__value;
    			add_location(option0, file$9, 291, 10, 10226);
    			option1.__value = "Andhra Pradesh";
    			option1.value = option1.__value;
    			add_location(option1, file$9, 292, 10, 10291);
    			option2.__value = "Andaman and Nicobar Islands";
    			option2.value = option2.__value;
    			add_location(option2, file$9, 293, 10, 10357);
    			option3.__value = "Arunachal Pradesh";
    			option3.value = option3.__value;
    			add_location(option3, file$9, 296, 10, 10475);
    			option4.__value = "Assam";
    			option4.value = option4.__value;
    			add_location(option4, file$9, 297, 10, 10547);
    			option5.__value = "Bihar";
    			option5.value = option5.__value;
    			add_location(option5, file$9, 298, 10, 10595);
    			option6.__value = "Chhattisgarh";
    			option6.value = option6.__value;
    			add_location(option6, file$9, 299, 10, 10643);
    			option7.__value = "Dadar and Nagar Haveli";
    			option7.value = option7.__value;
    			add_location(option7, file$9, 300, 10, 10705);
    			option8.__value = "Daman and Diu";
    			option8.value = option8.__value;
    			add_location(option8, file$9, 301, 10, 10787);
    			option9.__value = "Delhi";
    			option9.value = option9.__value;
    			add_location(option9, file$9, 302, 10, 10851);
    			option10.__value = "Lakshadweep";
    			option10.value = option10.__value;
    			add_location(option10, file$9, 303, 10, 10899);
    			option11.__value = "Puducherry";
    			option11.value = option11.__value;
    			add_location(option11, file$9, 304, 10, 10959);
    			option12.__value = "Goa";
    			option12.value = option12.__value;
    			add_location(option12, file$9, 305, 10, 11017);
    			option13.__value = "Gujarat";
    			option13.value = option13.__value;
    			add_location(option13, file$9, 306, 10, 11061);
    			option14.__value = "Haryana";
    			option14.value = option14.__value;
    			add_location(option14, file$9, 307, 10, 11113);
    			option15.__value = "Himachal Pradesh";
    			option15.value = option15.__value;
    			add_location(option15, file$9, 308, 10, 11165);
    			option16.__value = "Jammu and Kashmir";
    			option16.value = option16.__value;
    			add_location(option16, file$9, 309, 10, 11235);
    			option17.__value = "Jharkhand";
    			option17.value = option17.__value;
    			add_location(option17, file$9, 310, 10, 11307);
    			option18.__value = "Karnataka";
    			option18.value = option18.__value;
    			add_location(option18, file$9, 311, 10, 11363);
    			option19.__value = "Kerala";
    			option19.value = option19.__value;
    			add_location(option19, file$9, 312, 10, 11419);
    			option20.__value = "Madhya Pradesh";
    			option20.value = option20.__value;
    			add_location(option20, file$9, 313, 10, 11469);
    			option21.__value = "Maharashtra";
    			option21.value = option21.__value;
    			add_location(option21, file$9, 314, 10, 11535);
    			option22.__value = "Manipur";
    			option22.value = option22.__value;
    			add_location(option22, file$9, 315, 10, 11595);
    			option23.__value = "Meghalaya";
    			option23.value = option23.__value;
    			add_location(option23, file$9, 316, 10, 11647);
    			option24.__value = "Mizoram";
    			option24.value = option24.__value;
    			add_location(option24, file$9, 317, 10, 11703);
    			option25.__value = "Nagaland";
    			option25.value = option25.__value;
    			add_location(option25, file$9, 318, 10, 11755);
    			option26.__value = "Odisha";
    			option26.value = option26.__value;
    			add_location(option26, file$9, 319, 10, 11809);
    			option27.__value = "Punjab";
    			option27.value = option27.__value;
    			add_location(option27, file$9, 320, 10, 11859);
    			option28.__value = "Rajasthan";
    			option28.value = option28.__value;
    			add_location(option28, file$9, 321, 10, 11909);
    			option29.__value = "Sikkim";
    			option29.value = option29.__value;
    			add_location(option29, file$9, 322, 10, 11965);
    			option30.__value = "Tamil Nadu";
    			option30.value = option30.__value;
    			add_location(option30, file$9, 323, 10, 12015);
    			option31.__value = "Telangana";
    			option31.value = option31.__value;
    			add_location(option31, file$9, 324, 10, 12073);
    			option32.__value = "Tripura";
    			option32.value = option32.__value;
    			add_location(option32, file$9, 325, 10, 12129);
    			option33.__value = "Uttar Pradesh";
    			option33.value = option33.__value;
    			add_location(option33, file$9, 326, 10, 12181);
    			option34.__value = "Uttarakhand";
    			option34.value = option34.__value;
    			add_location(option34, file$9, 327, 10, 12245);
    			option35.__value = "West Bengal";
    			option35.value = option35.__value;
    			add_location(option35, file$9, 328, 10, 12305);
    			attr_dev(select0, "title", "Select State");
    			attr_dev(select0, "name", "state");
    			attr_dev(select0, "id", "state");
    			attr_dev(select0, "class", "form-control");
    			if (/*address*/ ctx[1].state === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[10].call(select0));
    			add_location(select0, file$9, 281, 8, 9961);
    			attr_dev(div6, "class", "col-md-6 col-sm-6");
    			add_location(div6, file$9, 277, 6, 9800);
    			attr_dev(span7, "class", "required svelte-6bllsv");
    			add_location(span7, file$9, 339, 15, 12684);
    			attr_dev(label7, "for", "City");
    			attr_dev(label7, "class", "fl form-label svelte-6bllsv");
    			add_location(label7, file$9, 338, 8, 12627);
    			option36.__value = option36_value_value = /*address*/ ctx[1].city;
    			option36.value = option36.__value;
    			add_location(option36, file$9, 350, 10, 13010);
    			attr_dev(select1, "title", "Select City");
    			attr_dev(select1, "name", "state");
    			attr_dev(select1, "id", "state");

    			attr_dev(select1, "class", select1_class_value = /*address*/ ctx[1].city === "Select City"
    			? "form-control is-invalid"
    			: "form-control");

    			if (/*address*/ ctx[1].city === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[12].call(select1));
    			add_location(select1, file$9, 341, 8, 12745);
    			attr_dev(div7, "class", "col-md-6 col-sm-6");
    			add_location(div7, file$9, 337, 6, 12586);
    			attr_dev(span8, "class", "required svelte-6bllsv");
    			add_location(span8, file$9, 363, 19, 13534);
    			attr_dev(label8, "for", "pinCode");
    			attr_dev(label8, "class", "fl form-label svelte-6bllsv");
    			add_location(label8, file$9, 362, 8, 13470);
    			attr_dev(input6, "title", "Enter Pin Code");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "name", "pin");
    			attr_dev(input6, "class", "form-control");
    			attr_dev(input6, "placeholder", "Pin Code");
    			attr_dev(input6, "pattern", "[0-9]" + 4);
    			attr_dev(input6, "maxlength", "6");
    			add_location(input6, file$9, 365, 8, 13595);
    			attr_dev(div8, "class", "col-md-6 col-sm-6");
    			add_location(div8, file$9, 361, 6, 13429);
    			attr_dev(div9, "class", "row g-3");
    			add_location(div9, file$9, 165, 4, 6010);
    			attr_dev(span9, "class", "required svelte-6bllsv");
    			add_location(span9, file$9, 384, 21, 14184);
    			attr_dev(label9, "for", "address_type");
    			attr_dev(label9, "class", "fl form-label svelte-6bllsv");
    			add_location(label9, file$9, 383, 6, 14113);
    			option37.__value = "Select Address Type";
    			option37.value = option37.__value;
    			add_location(option37, file$9, 394, 8, 14475);
    			option38.__value = "Home";
    			option38.value = option38.__value;
    			add_location(option38, file$9, 395, 8, 14549);
    			option39.__value = "Office";
    			option39.value = option39.__value;
    			add_location(option39, file$9, 396, 8, 14593);
    			attr_dev(select2, "type", "text");
    			attr_dev(select2, "name", "address_type");
    			attr_dev(select2, "placeholder", "address type");
    			attr_dev(select2, "class", "form-control");
    			if (/*address*/ ctx[1].address_type === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[14].call(select2));
    			add_location(select2, file$9, 387, 6, 14290);
    			attr_dev(div10, "class", "col-md-10s");
    			add_location(div10, file$9, 382, 4, 14081);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary btn-block btn-myStyle svelte-6bllsv");
    			add_location(button, file$9, 405, 6, 14915);
    			set_style(div11, "text-align", "center");
    			add_location(div11, file$9, 403, 4, 14844);
    			attr_dev(div12, "class", "container");
    			set_style(div12, "width", "30%");
    			set_style(div12, "margin-top", "3%");
    			set_style(div12, "margin-left", "33.33%");
    			add_location(div12, file$9, 160, 2, 5884);
    			add_location(main, file$9, 159, 0, 5874);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div12);
    			append_dev(div12, h1);
    			append_dev(div12, t1);
    			append_dev(div12, div9);
    			append_dev(div9, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t2);
    			append_dev(label0, span0);
    			append_dev(label0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*address*/ ctx[1].full_name);
    			append_dev(div0, t6);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div9, t7);
    			append_dev(div9, div1);
    			append_dev(div1, label1);
    			append_dev(label1, t8);
    			append_dev(label1, span1);
    			append_dev(label1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, input1);
    			set_input_value(input1, /*address*/ ctx[1].email);
    			append_dev(div1, t12);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div9, t13);
    			append_dev(div9, div2);
    			append_dev(div2, label2);
    			append_dev(label2, t14);
    			append_dev(label2, span2);
    			append_dev(label2, t16);
    			append_dev(div2, t17);
    			append_dev(div2, input2);
    			set_input_value(input2, /*address*/ ctx[1].contact);
    			append_dev(div2, t18);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div9, t19);
    			append_dev(div9, div3);
    			append_dev(div3, label3);
    			append_dev(label3, t20);
    			append_dev(label3, span3);
    			append_dev(label3, t22);
    			append_dev(div3, t23);
    			append_dev(div3, input3);
    			set_input_value(input3, /*address*/ ctx[1].apartment);
    			append_dev(div3, t24);
    			if (if_block3) if_block3.m(div3, null);
    			append_dev(div9, t25);
    			append_dev(div9, div4);
    			append_dev(div4, label4);
    			append_dev(label4, t26);
    			append_dev(label4, span4);
    			append_dev(label4, t28);
    			append_dev(div4, t29);
    			append_dev(div4, input4);
    			set_input_value(input4, /*address*/ ctx[1].street);
    			append_dev(div4, t30);
    			if (if_block4) if_block4.m(div4, null);
    			append_dev(div9, t31);
    			append_dev(div9, div5);
    			append_dev(div5, label5);
    			append_dev(label5, t32);
    			append_dev(label5, span5);
    			append_dev(label5, t34);
    			append_dev(div5, t35);
    			append_dev(div5, input5);
    			set_input_value(input5, /*address*/ ctx[1].landmark);
    			append_dev(div5, t36);
    			if (if_block5) if_block5.m(div5, null);
    			append_dev(div9, t37);
    			append_dev(div9, div6);
    			append_dev(div6, label6);
    			append_dev(label6, t38);
    			append_dev(label6, span6);
    			append_dev(label6, t40);
    			append_dev(div6, t41);
    			append_dev(div6, select0);
    			append_dev(select0, option0);
    			append_dev(option0, t42);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			append_dev(select0, option5);
    			append_dev(select0, option6);
    			append_dev(select0, option7);
    			append_dev(select0, option8);
    			append_dev(select0, option9);
    			append_dev(select0, option10);
    			append_dev(select0, option11);
    			append_dev(select0, option12);
    			append_dev(select0, option13);
    			append_dev(select0, option14);
    			append_dev(select0, option15);
    			append_dev(select0, option16);
    			append_dev(select0, option17);
    			append_dev(select0, option18);
    			append_dev(select0, option19);
    			append_dev(select0, option20);
    			append_dev(select0, option21);
    			append_dev(select0, option22);
    			append_dev(select0, option23);
    			append_dev(select0, option24);
    			append_dev(select0, option25);
    			append_dev(select0, option26);
    			append_dev(select0, option27);
    			append_dev(select0, option28);
    			append_dev(select0, option29);
    			append_dev(select0, option30);
    			append_dev(select0, option31);
    			append_dev(select0, option32);
    			append_dev(select0, option33);
    			append_dev(select0, option34);
    			append_dev(select0, option35);
    			select_option(select0, /*address*/ ctx[1].state, true);
    			append_dev(div6, t78);
    			if (if_block6) if_block6.m(div6, null);
    			append_dev(div9, t79);
    			append_dev(div9, div7);
    			append_dev(div7, label7);
    			append_dev(label7, t80);
    			append_dev(label7, span7);
    			append_dev(label7, t82);
    			append_dev(div7, t83);
    			append_dev(div7, select1);
    			append_dev(select1, option36);
    			append_dev(option36, t84);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select1, null);
    				}
    			}

    			select_option(select1, /*address*/ ctx[1].city, true);
    			append_dev(div7, t85);
    			if (if_block7) if_block7.m(div7, null);
    			append_dev(div9, t86);
    			append_dev(div9, div8);
    			append_dev(div8, label8);
    			append_dev(label8, t87);
    			append_dev(label8, span8);
    			append_dev(label8, t89);
    			append_dev(div8, t90);
    			append_dev(div8, input6);
    			set_input_value(input6, /*address*/ ctx[1].pin_code);
    			append_dev(div8, t91);
    			if (if_block8) if_block8.m(div8, null);
    			append_dev(div12, t92);
    			append_dev(div12, div10);
    			append_dev(div10, label9);
    			append_dev(label9, t93);
    			append_dev(label9, span9);
    			append_dev(label9, t95);
    			append_dev(div10, t96);
    			append_dev(div10, select2);
    			append_dev(select2, option37);
    			append_dev(select2, option38);
    			append_dev(select2, option39);
    			select_option(select2, /*address*/ ctx[1].address_type, true);
    			append_dev(div10, t100);
    			if (if_block9) if_block9.m(div10, null);
    			append_dev(div12, t101);
    			append_dev(div12, div11);
    			append_dev(div11, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[7]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[8]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[9]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[10]),
    					listen_dev(select0, "change", /*change_handler*/ ctx[11], false, false, false, false),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[12]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[13]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[14]),
    					listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[15]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*address*/ 2 && input0.value !== /*address*/ ctx[1].full_name) {
    				set_input_value(input0, /*address*/ ctx[1].full_name);
    			}

    			if (dirty & /*firstLoad, address*/ 3) show_if_3 = /*firstLoad*/ ctx[0] && !containsAlphabets(/*address*/ ctx[1].full_name);

    			if (show_if_3) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*address*/ 2 && input1.value !== /*address*/ ctx[1].email) {
    				set_input_value(input1, /*address*/ ctx[1].email);
    			}

    			if (dirty & /*firstLoad, address*/ 3) show_if_2 = /*firstLoad*/ ctx[0] && !validateEmail(/*address*/ ctx[1].email);

    			if (show_if_2) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*address*/ 2 && input2.value !== /*address*/ ctx[1].contact) {
    				set_input_value(input2, /*address*/ ctx[1].contact);
    			}

    			if (dirty & /*firstLoad, address*/ 3) show_if_1 = /*firstLoad*/ ctx[0] && !validatePhoneNumber(/*address*/ ctx[1].contact);

    			if (show_if_1) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_7(ctx);
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*address*/ 2) {
    				set_input_value(input3, /*address*/ ctx[1].apartment);
    			}

    			if (/*firstLoad*/ ctx[0] && /*address*/ ctx[1].apartment.length === 0) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_6(ctx);
    					if_block3.c();
    					if_block3.m(div3, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*address*/ 2 && input4.value !== /*address*/ ctx[1].street) {
    				set_input_value(input4, /*address*/ ctx[1].street);
    			}

    			if (/*firstLoad*/ ctx[0] && /*address*/ ctx[1].street.length === 0) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_5(ctx);
    					if_block4.c();
    					if_block4.m(div4, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*address*/ 2 && input5.value !== /*address*/ ctx[1].landmark) {
    				set_input_value(input5, /*address*/ ctx[1].landmark);
    			}

    			if (/*firstLoad*/ ctx[0] && /*address*/ ctx[1].landmark.length === 0) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_4(ctx);
    					if_block5.c();
    					if_block5.m(div5, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*address*/ 2 && t42_value !== (t42_value = /*address*/ ctx[1].state + "")) set_data_dev(t42, t42_value);

    			if (dirty & /*address*/ 2) {
    				select_option(select0, /*address*/ ctx[1].state);
    			}

    			if (/*firstLoad*/ ctx[0] && /*address*/ ctx[1].state === "Select State") {
    				if (if_block6) ; else {
    					if_block6 = create_if_block_3(ctx);
    					if_block6.c();
    					if_block6.m(div6, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (dirty & /*address*/ 2 && t84_value !== (t84_value = /*address*/ ctx[1].city + "")) set_data_dev(t84, t84_value);

    			if (dirty & /*address*/ 2 && option36_value_value !== (option36_value_value = /*address*/ ctx[1].city)) {
    				prop_dev(option36, "__value", option36_value_value);
    				option36.value = option36.__value;
    			}

    			if (dirty & /*getCitiesByState, address*/ 10) {
    				each_value = /*getCitiesByState*/ ctx[3](/*address*/ ctx[1].state);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*address*/ 2 && select1_class_value !== (select1_class_value = /*address*/ ctx[1].city === "Select City"
    			? "form-control is-invalid"
    			: "form-control")) {
    				attr_dev(select1, "class", select1_class_value);
    			}

    			if (dirty & /*address*/ 2) {
    				select_option(select1, /*address*/ ctx[1].city);
    			}

    			if (/*firstLoad*/ ctx[0] && /*address*/ ctx[1].city === "Select City") {
    				if (if_block7) ; else {
    					if_block7 = create_if_block_2$1(ctx);
    					if_block7.c();
    					if_block7.m(div7, null);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (dirty & /*address*/ 2 && input6.value !== /*address*/ ctx[1].pin_code) {
    				set_input_value(input6, /*address*/ ctx[1].pin_code);
    			}

    			if (dirty & /*firstLoad, address*/ 3) show_if = /*firstLoad*/ ctx[0] && !isZipNumber(/*address*/ ctx[1].pin_code);

    			if (show_if) {
    				if (if_block8) ; else {
    					if_block8 = create_if_block_1$3(ctx);
    					if_block8.c();
    					if_block8.m(div8, null);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (dirty & /*address*/ 2) {
    				select_option(select2, /*address*/ ctx[1].address_type);
    			}

    			if (/*firstLoad*/ ctx[0] && /*address*/ ctx[1].address_type === "Select Address Type") {
    				if (if_block9) ; else {
    					if_block9 = create_if_block$5(ctx);
    					if_block9.c();
    					if_block9.m(div10, null);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddAddressForm', slots, []);
    	const userControllerClass = new UserController();
    	let firstLoad = false;

    	let address = {
    		full_name: "",
    		email: "",
    		contact: "",
    		apartment: "",
    		street: "",
    		landmark: "",
    		city: "Select City",
    		state: "Select State",
    		pin_code: "",
    		address_type: ""
    	};

    	const saveAddress = async saveAddress => {
    		try {
    			$$invalidate(0, firstLoad = true);

    			if (firstLoad && containsAlphabets(address.full_name) && validateEmail(address.email) && validatePhoneNumber(address.contact) && !(address.apartment.length === 0) && !(address.street.length === 0) && !(address.landmark.length === 0) && !(address.state === "Select State") && !(address.city === "Select City") && isZipNumber(address.pin_code) && !(address.address_type.length === 0)) {
    				let result = await userControllerClass.saveAddressController(saveAddress);

    				if (result.status === true) {
    					let productDetail = JSON.parse(sessionStorage.getItem("productId")) || [];

    					let data = {
    						full_name: address.full_name,
    						email: address.email,
    						product_id: productDetail.product_id,
    						product_name: productDetail.product_name,
    						price: productDetail.price,
    						descriptions: productDetail.descriptions,
    						ordered_qty: productDetail.ordered_qty,
    						picture: productDetail.picture,
    						contact: address.contact,
    						apartment: address.apartment,
    						street: address.street,
    						landmark: address.landmark,
    						city: address.city,
    						state: address.state,
    						pin_code: address.pin_code,
    						address_type: address.address_type,
    						user_id: result.data.user_id,
    						address_id: result.data.address_id
    					};

    					sessionStorage.setItem("address", JSON.stringify(data));
    					push("#/cart/buy/");
    				} else {
    					pop("#/cart/buy/");
    				}
    			}
    		} catch(e) {
    			throw e;
    		}
    	};

    	const citiesByState = {
    		"Select State": ["Select City"],
    		"Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    		"Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Roing", "Tawang"],
    		Assam: ["Guwahati", "Silchar", "Dibrugarh", "Tezpur", "Jorhat"],
    		Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    		Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    		Goa: ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda"],
    		Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    		Haryana: ["Chandigarh", "Faridabad", "Gurgaon", "Panipat", "Yamunanagar"],
    		"Himachal Pradesh": ["Shimla", "Mandi", "Solan", "Baddi", "Dharamshala"],
    		Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    		Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    		Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    		"Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
    		Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    		Manipur: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
    		Meghalaya: ["Shillong", "Tura", "Jowai", "Williamnagar", "Baghmara"],
    		Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
    		Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Phek"],
    		Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Puri"],
    		Punjab: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
    		Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    		Sikkim: ["Gangtok", "Namchi", "Ravangla", "Singtam", "Mangan"],
    		"Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    		Telangana: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"],
    		Tripura: ["Agartala", "Udaipur", "Belonia", "Dharmanagar", "Kailashahar"],
    		"Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
    		Uttarakhand: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur"],
    		"West Bengal": ["Kolkata", "Asansol", "Durgapur", "Siliguri", "Darjeeling"],
    		"Andaman and Nicobar Islands": ["Port Blair", "Car Nicobar", "Bombooflat", "Mayabunder", "Diglipur"],
    		Chandigarh: ["Chandigarh"],
    		"Dadra and Nagar Haveli": ["Silvassa", "Daman", "Diu", "Nani Daman", "Moti Daman"],
    		"Daman and Diu": ["Silvassa", "Daman", "Diu", "Nani Daman", "Moti Daman"],
    		Delhi: ["New Delhi", "Gurgaon", "Noida", "Faridabad", "Ghaziabad"],
    		"Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
    		Ladakh: ["Leh", "Kargil", "Nubra Valley", "Zanskar", "Dras"],
    		Lakshadweep: ["Kavaratti", "Agatti", "Amini", "Andrott", "Kalpeni"],
    		Puducherry: ["Pondicherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai"]
    	};

    	let getCitiesByState = stateName => {
    		return citiesByState[stateName] || [];
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddAddressForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		address.full_name = this.value;
    		$$invalidate(1, address);
    	}

    	function input1_input_handler() {
    		address.email = this.value;
    		$$invalidate(1, address);
    	}

    	function input2_input_handler() {
    		address.contact = this.value;
    		$$invalidate(1, address);
    	}

    	function input3_input_handler() {
    		address.apartment = this.value;
    		$$invalidate(1, address);
    	}

    	function input4_input_handler() {
    		address.street = this.value;
    		$$invalidate(1, address);
    	}

    	function input5_input_handler() {
    		address.landmark = this.value;
    		$$invalidate(1, address);
    	}

    	function select0_change_handler() {
    		address.state = select_value(this);
    		$$invalidate(1, address);
    	}

    	const change_handler = () => {
    		$$invalidate(1, address.city = "Select City", address);
    	};

    	function select1_change_handler() {
    		address.city = select_value(this);
    		$$invalidate(1, address);
    	}

    	function input6_input_handler() {
    		address.pin_code = this.value;
    		$$invalidate(1, address);
    	}

    	function select2_change_handler() {
    		address.address_type = select_value(this);
    		$$invalidate(1, address);
    	}

    	const click_handler = () => {
    		saveAddress(address);
    	};

    	$$self.$capture_state = () => ({
    		UserController,
    		OrderSummary,
    		push,
    		pop,
    		replace,
    		containsAlphabets,
    		isZipNumber,
    		validateEmail,
    		validatePhoneNumber,
    		userControllerClass,
    		firstLoad,
    		address,
    		saveAddress,
    		citiesByState,
    		getCitiesByState
    	});

    	$$self.$inject_state = $$props => {
    		if ('firstLoad' in $$props) $$invalidate(0, firstLoad = $$props.firstLoad);
    		if ('address' in $$props) $$invalidate(1, address = $$props.address);
    		if ('getCitiesByState' in $$props) $$invalidate(3, getCitiesByState = $$props.getCitiesByState);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		firstLoad,
    		address,
    		saveAddress,
    		getCitiesByState,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		select0_change_handler,
    		change_handler,
    		select1_change_handler,
    		input6_input_handler,
    		select2_change_handler,
    		click_handler
    	];
    }

    class AddAddressForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddAddressForm",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\Login\EmailPasswordForm.svelte generated by Svelte v3.57.0 */

    const { console: console_1$6 } = globals;

    const file$8 = "src\\components\\Login\\EmailPasswordForm.svelte";

    // (51:6) {#if firstLoad && !validateEmail(email)}
    function create_if_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter valid email";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$8, 51, 8, 1674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(51:6) {#if firstLoad && !validateEmail(email)}",
    		ctx
    	});

    	return block;
    }

    // (70:6) {#if firstLoad && password === "" && ! checkPassword (password)}
    function create_if_block$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter password";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$8, 70, 8, 2290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(70:6) {#if firstLoad && password === \\\"\\\" && ! checkPassword (password)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let form;
    	let h3;
    	let b;
    	let t1;
    	let div0;
    	let label0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let input0;
    	let t6;
    	let show_if_1 = /*firstLoad*/ ctx[2] && !validateEmail(/*email*/ ctx[0]);
    	let t7;
    	let div1;
    	let label1;
    	let t8;
    	let span1;
    	let t10;
    	let t11;
    	let input1;
    	let t12;
    	let show_if = /*firstLoad*/ ctx[2] && /*password*/ ctx[1] === "" && !checkPassword(/*password*/ ctx[1]);
    	let t13;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = show_if_1 && create_if_block_1$2(ctx);
    	let if_block1 = show_if && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			form = element("form");
    			h3 = element("h3");
    			b = element("b");
    			b.textContent = "Sign Up Form";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			t2 = text("Email address ");
    			span0 = element("span");
    			span0.textContent = "*";
    			t4 = text(" :");
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			div1 = element("div");
    			label1 = element("label");
    			t8 = text("Password ");
    			span1 = element("span");
    			span1.textContent = "*";
    			t10 = text(" :");
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			button = element("button");
    			button.textContent = "SUBMIT";
    			add_location(b, file$8, 35, 8, 1151);
    			add_location(h3, file$8, 35, 4, 1147);
    			attr_dev(span0, "class", "star-mark");
    			add_location(span0, file$8, 40, 23, 1356);
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$8, 39, 6, 1306);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "placeholder", "Email Address");
    			attr_dev(input0, "title", "Enter a unique and valid email id");
    			attr_dev(input0, "class", "form-control");
    			input0.required = true;
    			add_location(input0, file$8, 42, 6, 1414);
    			attr_dev(div0, "class", "form-outline");
    			add_location(div0, file$8, 37, 4, 1208);
    			attr_dev(span1, "class", "star-mark");
    			add_location(span1, file$8, 59, 18, 1958);
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$8, 58, 6, 1913);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "title", "Enter a valid password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "form-control");
    			input1.required = true;
    			add_location(input1, file$8, 61, 6, 2016);
    			attr_dev(div1, "class", "form-outline");
    			add_location(div1, file$8, 56, 4, 1815);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn-block btn-myStyle");
    			add_location(button, file$8, 75, 4, 2430);
    			add_location(form, file$8, 34, 2, 1135);
    			attr_dev(div2, "class", "container1");
    			set_style(div2, "width", "30%");
    			set_style(div2, "margin-top", "5%");
    			set_style(div2, "margin-left", "33.33%");
    			add_location(div2, file$8, 30, 0, 1042);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, form);
    			append_dev(form, h3);
    			append_dev(h3, b);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t2);
    			append_dev(label0, span0);
    			append_dev(label0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(div0, t6);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(form, t7);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(label1, t8);
    			append_dev(label1, span1);
    			append_dev(label1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(div1, t12);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(form, t13);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button, "click", prevent_default(/*createUser*/ ctx[3]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*firstLoad, email*/ 5) show_if_1 = /*firstLoad*/ ctx[2] && !validateEmail(/*email*/ ctx[0]);

    			if (show_if_1) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}

    			if (dirty & /*firstLoad, password*/ 6) show_if = /*firstLoad*/ ctx[2] && /*password*/ ctx[1] === "" && !checkPassword(/*password*/ ctx[1]);

    			if (show_if) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EmailPasswordForm', slots, []);
    	const userControllerClass = new UserController();
    	let loginDetail = JSON.parse(localStorage.getItem("loginDetails"));
    	let email = loginDetail.email;
    	let password = "";
    	let firstLoad = false;

    	const createUser = async () => {
    		$$invalidate(2, firstLoad = true);
    		let userData = { email, pwd: password };
    		console.log(userData);
    		let result = await userControllerClass.createUserController(userData);

    		if (result.status === true) {
    			console.log(result);
    			loginStore.set(await result.data);
    			localStorage.setItem("loggedInDetails", JSON.stringify(result.data));
    			push("/");
    		} else {
    			console.log(result);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<EmailPasswordForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		UserController,
    		push,
    		pop,
    		replace,
    		checkPassword,
    		validateEmail,
    		userControllerClass,
    		CartItemsStore,
    		getSingleProductStore,
    		loginStore,
    		loginDetail,
    		email,
    		password,
    		firstLoad,
    		createUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('loginDetail' in $$props) loginDetail = $$props.loginDetail;
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    		if ('firstLoad' in $$props) $$invalidate(2, firstLoad = $$props.firstLoad);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		email,
    		password,
    		firstLoad,
    		createUser,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class EmailPasswordForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmailPasswordForm",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Login\PasswordForm.svelte generated by Svelte v3.57.0 */

    const { console: console_1$5 } = globals;

    const file$7 = "src\\components\\Login\\PasswordForm.svelte";

    // (46:6) {#if firstLoad && password === "" && ! checkPassword (password)}
    function create_if_block$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter valid password";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$7, 46, 6, 1624);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(46:6) {#if firstLoad && password === \\\"\\\" && ! checkPassword (password)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div1;
    	let form;
    	let h3;
    	let b;
    	let t1;
    	let div0;
    	let label;
    	let t2;
    	let span;
    	let t4;
    	let t5;
    	let input;
    	let t6;
    	let show_if = /*firstLoad*/ ctx[0] && /*password*/ ctx[1] === "" && !checkPassword(/*password*/ ctx[1]);
    	let t7;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = show_if && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			form = element("form");
    			h3 = element("h3");
    			b = element("b");
    			b.textContent = "Login";
    			t1 = space();
    			div0 = element("div");
    			label = element("label");
    			t2 = text("Password ");
    			span = element("span");
    			span.textContent = "*";
    			t4 = text(" :");
    			t5 = space();
    			input = element("input");
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			button = element("button");
    			button.textContent = "SUBMIT";
    			add_location(b, file$7, 31, 8, 1128);
    			add_location(h3, file$7, 31, 4, 1124);
    			attr_dev(span, "class", "star-mark");
    			add_location(span, file$7, 35, 18, 1294);
    			attr_dev(label, "class", "form-label");
    			add_location(label, file$7, 34, 6, 1249);
    			attr_dev(input, "type", "password");
    			attr_dev(input, "title", "Enter a valid password");
    			attr_dev(input, "placeholder", "Password");
    			attr_dev(input, "class", "form-control");
    			input.required = true;
    			add_location(input, file$7, 37, 6, 1352);
    			attr_dev(div0, "class", "form-outline");
    			add_location(div0, file$7, 32, 4, 1151);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn-block btn-myStyle");
    			add_location(button, file$7, 50, 4, 1740);
    			add_location(form, file$7, 30, 2, 1112);
    			attr_dev(div1, "class", "container1");
    			set_style(div1, "width", "30%");
    			set_style(div1, "margin-top", "5%");
    			set_style(div1, "margin-left", "33.33%");
    			add_location(div1, file$7, 26, 0, 1019);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, form);
    			append_dev(form, h3);
    			append_dev(h3, b);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, label);
    			append_dev(label, t2);
    			append_dev(label, span);
    			append_dev(label, t4);
    			append_dev(div0, t5);
    			append_dev(div0, input);
    			set_input_value(input, /*password*/ ctx[1]);
    			append_dev(div0, t6);
    			if (if_block) if_block.m(div0, null);
    			append_dev(form, t7);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(button, "click", prevent_default(/*createUser*/ ctx[2]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*password*/ 2 && input.value !== /*password*/ ctx[1]) {
    				set_input_value(input, /*password*/ ctx[1]);
    			}

    			if (dirty & /*firstLoad, password*/ 3) show_if = /*firstLoad*/ ctx[0] && /*password*/ ctx[1] === "" && !checkPassword(/*password*/ ctx[1]);

    			if (show_if) {
    				if (if_block) ; else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PasswordForm', slots, []);
    	const userControllerClass = new UserController();
    	let firstLoad = false;
    	let loginDetail = JSON.parse(localStorage.getItem("loginDetails"));
    	let email = loginDetail.email;
    	let password = "";

    	const createUser = async () => {
    		$$invalidate(0, firstLoad = true);
    		let userData = { email, pwd: password };
    		console.log(userData);
    		let result = await userControllerClass.createUserController(userData);

    		if (result.status === true) {
    			console.log(result);
    			loginStore.set(await result.data);
    			localStorage.setItem("loggedInDetails", JSON.stringify(result.data));
    			push("/");
    		} else {
    			console.log(result);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<PasswordForm> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		UserController,
    		push,
    		pop,
    		replace,
    		checkPassword,
    		validateEmail,
    		CartItemsStore,
    		getSingleProductStore,
    		loginStore,
    		userControllerClass,
    		firstLoad,
    		loginDetail,
    		email,
    		password,
    		createUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('firstLoad' in $$props) $$invalidate(0, firstLoad = $$props.firstLoad);
    		if ('loginDetail' in $$props) loginDetail = $$props.loginDetail;
    		if ('email' in $$props) email = $$props.email;
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [firstLoad, password, createUser, input_input_handler];
    }

    class PasswordForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PasswordForm",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\views\MyProfile.svelte generated by Svelte v3.57.0 */

    const { console: console_1$4 } = globals;
    const file$6 = "src\\views\\MyProfile.svelte";

    // (32:6) {#if !containsAlphabets(profile.full_name) && firstLoad}
    function create_if_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter valid name";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$6, 32, 8, 918);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(32:6) {#if !containsAlphabets(profile.full_name) && firstLoad}",
    		ctx
    	});

    	return block;
    }

    // (47:6) {#if firstLoad && !validateEmail(profile.email) && profile.email === ""}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter valid email";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$6, 47, 8, 1399);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(47:6) {#if firstLoad && !validateEmail(profile.email) && profile.email === \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let form;
    	let h3;
    	let b;
    	let t1;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let show_if_1 = !containsAlphabets(/*profile*/ ctx[1].full_name) && /*firstLoad*/ ctx[0];
    	let t5;
    	let div1;
    	let label1;
    	let t7;
    	let input1;
    	let t8;
    	let show_if = /*firstLoad*/ ctx[0] && !validateEmail(/*profile*/ ctx[1].email) && /*profile*/ ctx[1].email === "";
    	let t9;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = show_if_1 && create_if_block_1$1(ctx);
    	let if_block1 = show_if && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			form = element("form");
    			h3 = element("h3");
    			b = element("b");
    			b.textContent = "MY PROFILE";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Full Name :";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email :";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			button = element("button");
    			button.textContent = "EDIT PROFILE";
    			add_location(b, file$6, 20, 8, 488);
    			attr_dev(h3, "class", "svelte-1518y01");
    			add_location(h3, file$6, 20, 4, 484);
    			attr_dev(label0, "class", "form-label svelte-1518y01");
    			add_location(label0, file$6, 23, 6, 614);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Enter First Name + Last Name");
    			attr_dev(input0, "class", "form-control");
    			input0.required = true;
    			add_location(input0, file$6, 24, 6, 667);
    			attr_dev(div0, "class", "form-outline");
    			add_location(div0, file$6, 21, 4, 516);
    			attr_dev(label1, "class", "form-label svelte-1518y01");
    			add_location(label1, file$6, 38, 6, 1103);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "placeholder", "Enter Email");
    			attr_dev(input1, "class", "form-control");
    			input1.required = true;
    			add_location(input1, file$6, 39, 6, 1152);
    			attr_dev(div1, "class", "form-outline");
    			add_location(div1, file$6, 36, 4, 1005);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary btn-block btn-myStyle svelte-1518y01");
    			add_location(button, file$6, 52, 4, 1515);
    			add_location(form, file$6, 19, 2, 472);
    			attr_dev(div2, "class", "container1");
    			set_style(div2, "width", "30%");
    			set_style(div2, "margin-top", "5%");
    			set_style(div2, "margin-left", "33.33%");
    			add_location(div2, file$6, 15, 0, 379);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, form);
    			append_dev(form, h3);
    			append_dev(h3, b);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*profile*/ ctx[1].full_name);
    			append_dev(div0, t4);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(form, t5);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t7);
    			append_dev(div1, input1);
    			set_input_value(input1, /*profile*/ ctx[1].email);
    			append_dev(div1, t8);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(form, t9);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[5]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*profile*/ 2 && input0.value !== /*profile*/ ctx[1].full_name) {
    				set_input_value(input0, /*profile*/ ctx[1].full_name);
    			}

    			if (dirty & /*profile, firstLoad*/ 3) show_if_1 = !containsAlphabets(/*profile*/ ctx[1].full_name) && /*firstLoad*/ ctx[0];

    			if (show_if_1) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*profile*/ 2 && input1.value !== /*profile*/ ctx[1].email) {
    				set_input_value(input1, /*profile*/ ctx[1].email);
    			}

    			if (dirty & /*firstLoad, profile*/ 3) show_if = /*firstLoad*/ ctx[0] && !validateEmail(/*profile*/ ctx[1].email) && /*profile*/ ctx[1].email === "";

    			if (show_if) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MyProfile', slots, []);
    	let firstLoad = false;

    	let profile = {
    		full_name: "",
    		email: JSON.parse(localStorage.getItem("loggedInDetails")).email
    	};

    	const editProfile = async profile => {
    		$$invalidate(0, firstLoad = true);
    		console.log(profile);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<MyProfile> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		profile.full_name = this.value;
    		$$invalidate(1, profile);
    	}

    	function input1_input_handler() {
    		profile.email = this.value;
    		$$invalidate(1, profile);
    	}

    	const click_handler = () => {
    		editProfile(profile);
    	};

    	$$self.$capture_state = () => ({
    		containsAlphabets,
    		validateEmail,
    		firstLoad,
    		profile,
    		editProfile
    	});

    	$$self.$inject_state = $$props => {
    		if ('firstLoad' in $$props) $$invalidate(0, firstLoad = $$props.firstLoad);
    		if ('profile' in $$props) $$invalidate(1, profile = $$props.profile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		firstLoad,
    		profile,
    		editProfile,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler
    	];
    }

    class MyProfile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MyProfile",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\views\MyOrders.svelte generated by Svelte v3.57.0 */

    const { console: console_1$3 } = globals;
    const file$5 = "src\\views\\MyOrders.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (17:4) {:else}
    function create_else_block(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let h1;
    	let t1;
    	let div1;
    	let div0;
    	let each_value = /*$CartItemsStore*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "My Orders";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$5, 20, 12, 615);
    			attr_dev(div0, "class", "col-md-12");
    			add_location(div0, file$5, 22, 14, 680);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$5, 21, 12, 647);
    			attr_dev(div2, "class", "col-md-12");
    			add_location(div2, file$5, 19, 10, 578);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$5, 18, 8, 549);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$5, 17, 6, 516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$CartItemsStore*/ 2) {
    				each_value = /*$CartItemsStore*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(17:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#if cartItemData.length === 0}
    function create_if_block$1(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "OOPS! You haven't ordered anything yet!";
    			attr_dev(h1, "class", "text-center");
    			add_location(h1, file$5, 15, 6, 427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(15:4) {#if cartItemData.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (24:16) {#each $CartItemsStore as cartItem, index}
    function create_each_block$1(ctx) {
    	let div5;
    	let div4;
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h40;
    	let b0;
    	let t2;
    	let h41;
    	let b1;
    	let t3_value = /*cartItem*/ ctx[3].product_name + "";
    	let t3;
    	let t4;
    	let p;
    	let t5_value = /*cartItem*/ ctx[3].descriptions + "";
    	let t5;
    	let t6;
    	let h42;
    	let b2;
    	let t7;
    	let t8_value = /*cartItem*/ ctx[3].price + "";
    	let t8;
    	let t9;
    	let div2;
    	let h5;
    	let b3;
    	let button;
    	let t12;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h40 = element("h4");
    			b0 = element("b");
    			b0.textContent = "Order Placed";
    			t2 = space();
    			h41 = element("h4");
    			b1 = element("b");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			h42 = element("h4");
    			b2 = element("b");
    			t7 = text("Price: ₹ ");
    			t8 = text(t8_value);
    			t9 = space();
    			div2 = element("div");
    			h5 = element("h5");
    			b3 = element("b");
    			b3.textContent = "Invoice: ";
    			button = element("button");
    			button.textContent = "Download";
    			t12 = space();
    			if (!src_url_equal(img.src, img_src_value = /*cartItem*/ ctx[3].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-responsive");
    			attr_dev(img, "alt", "Product Image");
    			add_location(img, file$5, 29, 26, 1052);
    			attr_dev(div0, "class", "col-md-2");
    			add_location(div0, file$5, 27, 24, 929);
    			add_location(b0, file$5, 36, 30, 1351);
    			add_location(h40, file$5, 36, 26, 1347);
    			add_location(b1, file$5, 38, 30, 1409);
    			add_location(h41, file$5, 38, 26, 1405);
    			add_location(p, file$5, 39, 26, 1472);
    			add_location(b2, file$5, 40, 30, 1534);
    			add_location(h42, file$5, 40, 26, 1530);
    			attr_dev(div1, "class", "col-md-8");
    			add_location(div1, file$5, 35, 24, 1297);
    			add_location(b3, file$5, 44, 30, 1711);
    			attr_dev(button, "class", "btn svelte-i46tqt");
    			add_location(button, file$5, 44, 46, 1727);
    			add_location(h5, file$5, 44, 26, 1707);
    			attr_dev(div2, "class", "col-md-2");
    			add_location(div2, file$5, 43, 24, 1657);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$5, 26, 22, 886);
    			attr_dev(div4, "class", "panel-body");
    			add_location(div4, file$5, 25, 20, 838);
    			attr_dev(div5, "class", "panel panel-default");
    			add_location(div5, file$5, 24, 18, 783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, h40);
    			append_dev(h40, b0);
    			append_dev(div1, t2);
    			append_dev(div1, h41);
    			append_dev(h41, b1);
    			append_dev(b1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(div1, t6);
    			append_dev(div1, h42);
    			append_dev(h42, b2);
    			append_dev(b2, t7);
    			append_dev(b2, t8);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, h5);
    			append_dev(h5, b3);
    			append_dev(h5, button);
    			append_dev(div5, t12);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$CartItemsStore*/ 2 && !src_url_equal(img.src, img_src_value = /*cartItem*/ ctx[3].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$CartItemsStore*/ 2 && t3_value !== (t3_value = /*cartItem*/ ctx[3].product_name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$CartItemsStore*/ 2 && t5_value !== (t5_value = /*cartItem*/ ctx[3].descriptions + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$CartItemsStore*/ 2 && t8_value !== (t8_value = /*cartItem*/ ctx[3].price + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(24:16) {#each $CartItemsStore as cartItem, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;

    	function select_block_type(ctx, dirty) {
    		if (/*cartItemData*/ ctx[0].length === 0) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			add_location(main, file$5, 13, 2, 376);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $CartItemsStore;
    	validate_store(CartItemsStore, 'CartItemsStore');
    	component_subscribe($$self, CartItemsStore, $$value => $$invalidate(1, $CartItemsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MyOrders', slots, []);
    	const productClass = new Product();
    	let cartItemData;

    	CartItemsStore.subscribe(value => {
    		let cartItem = value;
    		$$invalidate(0, cartItemData = cartItem);
    	});

    	console.log(cartItemData);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<MyOrders> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Product,
    		CartItemsStore,
    		getSingleProductStore,
    		productClass,
    		cartItemData,
    		$CartItemsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('cartItemData' in $$props) $$invalidate(0, cartItemData = $$props.cartItemData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cartItemData, $CartItemsStore];
    }

    class MyOrders extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MyOrders",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\views\ChangePassword.svelte generated by Svelte v3.57.0 */

    const { console: console_1$2 } = globals;
    const file$4 = "src\\views\\ChangePassword.svelte";

    // (54:8) {#if firstLoad && ! checkPassword(pass.old_password)}
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Please enter valid password";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$4, 54, 10, 1769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(54:8) {#if firstLoad && ! checkPassword(pass.old_password)}",
    		ctx
    	});

    	return block;
    }

    // (68:8) {#if firstLoad && ! checkPassword(pass.new_password)}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Password should be greater than 8 digits and at must contain 1 number,1 special character, 1 upper and 1 lower case letter";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$4, 68, 10, 2281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(68:8) {#if firstLoad && ! checkPassword(pass.new_password)}",
    		ctx
    	});

    	return block;
    }

    // (84:8) {#if firstLoad && pass.confirm_password !== pass.new_password}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Mismatch new password and confirm password.";
    			attr_dev(div, "class", "text-danger");
    			add_location(div, file$4, 84, 10, 2931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(84:8) {#if firstLoad && pass.confirm_password !== pass.new_password}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div3;
    	let form;
    	let h3;
    	let b;
    	let t1;
    	let div0;
    	let label0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let input0;
    	let t6;
    	let show_if_1 = /*firstLoad*/ ctx[0] && !checkPassword(/*pass*/ ctx[1].old_password);
    	let t7;
    	let div1;
    	let label1;
    	let t8;
    	let span1;
    	let t10;
    	let t11;
    	let input1;
    	let t12;
    	let show_if = /*firstLoad*/ ctx[0] && !checkPassword(/*pass*/ ctx[1].new_password);
    	let t13;
    	let div2;
    	let label2;
    	let t14;
    	let span2;
    	let t16;
    	let t17;
    	let input2;
    	let t18;
    	let t19;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = show_if_1 && create_if_block_2(ctx);
    	let if_block1 = show_if && create_if_block_1(ctx);
    	let if_block2 = /*firstLoad*/ ctx[0] && /*pass*/ ctx[1].confirm_password !== /*pass*/ ctx[1].new_password && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			form = element("form");
    			h3 = element("h3");
    			b = element("b");
    			b.textContent = "Change Password";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			t2 = text("Old Password ");
    			span0 = element("span");
    			span0.textContent = "*";
    			t4 = text(" :");
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			div1 = element("div");
    			label1 = element("label");
    			t8 = text("New Password ");
    			span1 = element("span");
    			span1.textContent = "*";
    			t10 = text(" :");
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			div2 = element("div");
    			label2 = element("label");
    			t14 = text("Confirm Password ");
    			span2 = element("span");
    			span2.textContent = "*";
    			t16 = text(" :");
    			t17 = space();
    			input2 = element("input");
    			t18 = space();
    			if (if_block2) if_block2.c();
    			t19 = space();
    			button = element("button");
    			button.textContent = "CHANGE PASSWORD";
    			add_location(b, file$4, 42, 10, 1317);
    			attr_dev(h3, "class", "svelte-1a4ktra");
    			add_location(h3, file$4, 42, 6, 1313);
    			attr_dev(span0, "class", "svelte-1a4ktra");
    			add_location(span0, file$4, 46, 47, 1497);
    			attr_dev(label0, "class", "form-label svelte-1a4ktra");
    			add_location(label0, file$4, 46, 8, 1458);
    			attr_dev(input0, "type", "password");
    			attr_dev(input0, "placeholder", "Enter Old Password");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$4, 47, 8, 1531);
    			attr_dev(div0, "class", "form-outline");
    			add_location(div0, file$4, 44, 6, 1356);
    			attr_dev(span1, "class", "svelte-1a4ktra");
    			add_location(span1, file$4, 60, 47, 2009);
    			attr_dev(label1, "class", "form-label svelte-1a4ktra");
    			add_location(label1, file$4, 60, 8, 1970);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Enter New Password");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$4, 61, 8, 2043);
    			attr_dev(div1, "class", "form-outline");
    			add_location(div1, file$4, 58, 6, 1868);
    			attr_dev(span2, "class", "svelte-1a4ktra");
    			add_location(span2, file$4, 75, 28, 2632);
    			attr_dev(label2, "class", "form-label svelte-1a4ktra");
    			add_location(label2, file$4, 74, 8, 2577);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "placeholder", "Enter Confirm Password");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$4, 77, 8, 2676);
    			attr_dev(div2, "class", "form-outline");
    			add_location(div2, file$4, 72, 6, 2475);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary btn-block btn-myStyle svelte-1a4ktra");
    			add_location(button, file$4, 89, 6, 3076);
    			add_location(form, file$4, 41, 4, 1299);
    			attr_dev(div3, "class", "container1");
    			set_style(div3, "width", "30%");
    			set_style(div3, "margin-top", "5%");
    			set_style(div3, "margin-left", "33.33%");
    			add_location(div3, file$4, 37, 2, 1198);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, form);
    			append_dev(form, h3);
    			append_dev(h3, b);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t2);
    			append_dev(label0, span0);
    			append_dev(label0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*pass*/ ctx[1].old_password);
    			append_dev(div0, t6);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(form, t7);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(label1, t8);
    			append_dev(label1, span1);
    			append_dev(label1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, input1);
    			set_input_value(input1, /*pass*/ ctx[1].new_password);
    			append_dev(div1, t12);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(form, t13);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(label2, t14);
    			append_dev(label2, span2);
    			append_dev(label2, t16);
    			append_dev(div2, t17);
    			append_dev(div2, input2);
    			set_input_value(input2, /*pass*/ ctx[1].confirm_password);
    			append_dev(div2, t18);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(form, t19);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[6]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pass*/ 2 && input0.value !== /*pass*/ ctx[1].old_password) {
    				set_input_value(input0, /*pass*/ ctx[1].old_password);
    			}

    			if (dirty & /*firstLoad, pass*/ 3) show_if_1 = /*firstLoad*/ ctx[0] && !checkPassword(/*pass*/ ctx[1].old_password);

    			if (show_if_1) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*pass*/ 2 && input1.value !== /*pass*/ ctx[1].new_password) {
    				set_input_value(input1, /*pass*/ ctx[1].new_password);
    			}

    			if (dirty & /*firstLoad, pass*/ 3) show_if = /*firstLoad*/ ctx[0] && !checkPassword(/*pass*/ ctx[1].new_password);

    			if (show_if) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*pass*/ 2 && input2.value !== /*pass*/ ctx[1].confirm_password) {
    				set_input_value(input2, /*pass*/ ctx[1].confirm_password);
    			}

    			if (/*firstLoad*/ ctx[0] && /*pass*/ ctx[1].confirm_password !== /*pass*/ ctx[1].new_password) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ChangePassword', slots, []);
    	let firstLoad = false;

    	let pass = {
    		old_password: "",
    		new_password: "",
    		confirm_password: ""
    	};

    	const userControllerClass = new UserController();

    	const changePassword = async body => {
    		$$invalidate(0, firstLoad = true);
    		console.log(pass.new_password !== pass.confirm_password);

    		if (firstLoad && checkPassword(pass.old_password) && checkPassword(pass.new_password) && pass.new_password === pass.confirm_password && pass.new_password !== pass.old_password) {
    			let result = await userControllerClass.changePasswordController(pass.old_password, pass.new_password, pass.confirm_password);
    			console.log(result);

    			if (result.status === true) {
    				push("/");
    			} else {
    				console.log(result.message);
    			}
    		} else {
    			console.log("Password Update Failed");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<ChangePassword> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		pass.old_password = this.value;
    		$$invalidate(1, pass);
    	}

    	function input1_input_handler() {
    		pass.new_password = this.value;
    		$$invalidate(1, pass);
    	}

    	function input2_input_handler() {
    		pass.confirm_password = this.value;
    		$$invalidate(1, pass);
    	}

    	const click_handler = () => {
    		changePassword();
    	};

    	$$self.$capture_state = () => ({
    		toast,
    		UserController,
    		checkPassword,
    		push,
    		firstLoad,
    		pass,
    		userControllerClass,
    		changePassword
    	});

    	$$self.$inject_state = $$props => {
    		if ('firstLoad' in $$props) $$invalidate(0, firstLoad = $$props.firstLoad);
    		if ('pass' in $$props) $$invalidate(1, pass = $$props.pass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		firstLoad,
    		pass,
    		changePassword,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler
    	];
    }

    class ChangePassword extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChangePassword",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\views\PaymentSuccess.svelte generated by Svelte v3.57.0 */

    const file$3 = "src\\views\\PaymentSuccess.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let h20;
    	let b;
    	let t3;
    	let h21;
    	let t5;
    	let hr;
    	let t6;
    	let h4;
    	let t9;
    	let h60;
    	let t10;
    	let a0;
    	let t12;
    	let t13;
    	let h61;
    	let a1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "✅";
    			t1 = space();
    			h20 = element("h2");
    			b = element("b");
    			b.textContent = "Thank You.";
    			t3 = space();
    			h21 = element("h2");
    			h21.textContent = "Yay! Order Placed Successfully.";
    			t5 = space();
    			hr = element("hr");
    			t6 = space();
    			h4 = element("h4");
    			h4.textContent = `Your Order Number is ${/*order_id*/ ctx[0]}`;
    			t9 = space();
    			h60 = element("h6");
    			t10 = text("Please ");
    			a0 = element("a");
    			a0.textContent = "Register";
    			t12 = text(" to track order status.");
    			t13 = space();
    			h61 = element("h6");
    			a1 = element("a");
    			a1.textContent = "Continue Shopping?";
    			add_location(h1, file$3, 4, 4, 101);
    			add_location(b, file$3, 5, 8, 121);
    			add_location(h20, file$3, 5, 4, 117);
    			add_location(h21, file$3, 6, 4, 149);
    			add_location(hr, file$3, 7, 4, 195);
    			add_location(h4, file$3, 8, 4, 207);
    			attr_dev(a0, "href", "#/login/user");
    			add_location(a0, file$3, 10, 13, 284);
    			attr_dev(h60, "class", "gap svelte-1xldrdf");
    			add_location(h60, file$3, 9, 4, 253);
    			attr_dev(a1, "href", "#/");
    			add_location(a1, file$3, 12, 8, 363);
    			add_location(h61, file$3, 12, 4, 359);
    			attr_dev(div, "class", "container text-center");
    			add_location(div, file$3, 3, 2, 60);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, h20);
    			append_dev(h20, b);
    			append_dev(div, t3);
    			append_dev(div, h21);
    			append_dev(div, t5);
    			append_dev(div, hr);
    			append_dev(div, t6);
    			append_dev(div, h4);
    			append_dev(div, t9);
    			append_dev(div, h60);
    			append_dev(h60, t10);
    			append_dev(h60, a0);
    			append_dev(h60, t12);
    			append_dev(div, t13);
    			append_dev(div, h61);
    			append_dev(h61, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PaymentSuccess', slots, []);
    	let order_id = "82626832683";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PaymentSuccess> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ order_id });

    	$$self.$inject_state = $$props => {
    		if ('order_id' in $$props) $$invalidate(0, order_id = $$props.order_id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [order_id];
    }

    class PaymentSuccess extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaymentSuccess",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Search.svelte generated by Svelte v3.57.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\components\\Search.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (31:10) {#each productList as products}
    function create_each_block(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				product_id: /*products*/ ctx[6].product_id,
    				product_name: /*products*/ ctx[6].product_name,
    				picture: /*products*/ ctx[6].picture,
    				price: /*products*/ ctx[6].price
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*productList*/ 1) card_changes.product_id = /*products*/ ctx[6].product_id;
    			if (dirty & /*productList*/ 1) card_changes.product_name = /*products*/ ctx[6].product_name;
    			if (dirty & /*productList*/ 1) card_changes.picture = /*products*/ ctx[6].picture;
    			if (dirty & /*productList*/ 1) card_changes.price = /*products*/ ctx[6].price;
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(31:10) {#each productList as products}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div0;
    	let input;
    	let t;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*productList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			input = element("input");
    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "search");
    			attr_dev(input, "id", "form1");
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "placeholder", "Search Product");
    			attr_dev(input, "aria-label", "Search");
    			add_location(input, file$2, 15, 6, 438);
    			attr_dev(div0, "class", "container form-outline  svelte-39w06j");
    			add_location(div0, file$2, 14, 4, 393);
    			attr_dev(div1, "class", "product-list svelte-39w06j");
    			add_location(div1, file$2, 29, 4, 767);
    			add_location(main, file$2, 13, 2, 381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*searchByName*/ ctx[1]);
    			append_dev(main, t);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchByName*/ 2 && input.value !== /*searchByName*/ ctx[1]) {
    				set_input_value(input, /*searchByName*/ ctx[1]);
    			}

    			if (dirty & /*productList*/ 1) {
    				each_value = /*productList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search', slots, []);
    	const productClass = new Product();
    	let productList = [];
    	let searchByName = "";

    	const searchValue = async () => {
    		let result = await productClass.searchProduct(searchByName);
    		console.log(await result);
    		$$invalidate(0, productList = result.data);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchByName = this.value;
    		$$invalidate(1, searchByName);
    	}

    	const keypress_handler = e => {
    		if (e.key === "Enter") {
    			searchValue();
    		}
    	};

    	$$self.$capture_state = () => ({
    		Card,
    		Product,
    		productClass,
    		productList,
    		searchByName,
    		searchValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('productList' in $$props) $$invalidate(0, productList = $$props.productList);
    		if ('searchByName' in $$props) $$invalidate(1, searchByName = $$props.searchByName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [productList, searchByName, searchValue, input_input_handler, keypress_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\singleProduct\SingleProduct.svelte generated by Svelte v3.57.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\components\\singleProduct\\SingleProduct.svelte";

    function create_fragment$1(ctx) {
    	let div14;
    	let div13;
    	let div12;
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div11;
    	let h2;
    	let b0;
    	let t1_value = /*cartItem*/ ctx[0].product_name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*cartItem*/ ctx[0].descriptions + "";
    	let t3;
    	let t4;
    	let h4;
    	let b1;
    	let t5;
    	let t6_value = /*cartItem*/ ctx[0].price + "";
    	let t6;
    	let t7;
    	let h50;
    	let b2;
    	let t9;
    	let div3;
    	let h51;
    	let t11;
    	let div7;
    	let div4;
    	let button0;
    	let t13;
    	let div5;
    	let button1;
    	let t14;
    	let t15;
    	let div6;
    	let button2;
    	let t17;
    	let div10;
    	let a;
    	let div8;
    	let button3;
    	let t19;
    	let div9;
    	let button4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div14 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div11 = element("div");
    			h2 = element("h2");
    			b0 = element("b");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			h4 = element("h4");
    			b1 = element("b");
    			t5 = text("Price: ₹");
    			t6 = text(t6_value);
    			t7 = space();
    			h50 = element("h5");
    			b2 = element("b");
    			b2.textContent = "Free Delivery";
    			t9 = space();
    			div3 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Select Quantity:";
    			t11 = space();
    			div7 = element("div");
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "-";
    			t13 = space();
    			div5 = element("div");
    			button1 = element("button");
    			t14 = text(/*orderQty*/ ctx[1]);
    			t15 = space();
    			div6 = element("div");
    			button2 = element("button");
    			button2.textContent = "+";
    			t17 = space();
    			div10 = element("div");
    			a = element("a");
    			div8 = element("div");
    			button3 = element("button");
    			button3.textContent = "Buy Now";
    			t19 = space();
    			div9 = element("div");
    			button4 = element("button");
    			button4.textContent = "Add to cart";
    			if (!src_url_equal(img.src, img_src_value = /*cartItem*/ ctx[0].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "id", "main_product_image");
    			attr_dev(img, "width", "250");
    			add_location(img, file$1, 82, 12, 2634);
    			attr_dev(div0, "class", "main_image");
    			add_location(div0, file$1, 80, 10, 2537);
    			attr_dev(div1, "class", "d-flex flex-column justify-content-center");
    			add_location(div1, file$1, 79, 8, 2470);
    			attr_dev(div2, "class", "col-md-6 border-end");
    			add_location(div2, file$1, 78, 6, 2427);
    			add_location(b0, file$1, 119, 12, 3725);
    			add_location(h2, file$1, 119, 8, 3721);
    			add_location(p, file$1, 120, 8, 3770);
    			add_location(b1, file$1, 121, 12, 3814);
    			add_location(h4, file$1, 121, 8, 3810);
    			add_location(b2, file$1, 122, 12, 3864);
    			add_location(h50, file$1, 122, 8, 3860);
    			add_location(h51, file$1, 124, 10, 3932);
    			attr_dev(div3, "class", "mt-xl-5");
    			add_location(div3, file$1, 123, 8, 3899);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "qty svelte-wroibj");
    			add_location(button0, file$1, 128, 12, 4057);
    			attr_dev(div4, "class", "col-md-1 col-sm-4");
    			add_location(div4, file$1, 127, 10, 4012);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "qty svelte-wroibj");
    			add_location(button1, file$1, 133, 12, 4232);
    			attr_dev(div5, "class", "col-md-1 col-sm-4");
    			add_location(div5, file$1, 132, 10, 4187);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "qty svelte-wroibj");
    			add_location(button2, file$1, 136, 12, 4361);
    			attr_dev(div6, "class", "col-md-1 col-sm-4");
    			add_location(div6, file$1, 135, 10, 4315);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$1, 126, 8, 3983);
    			attr_dev(button3, "class", "btn btn-lg svelte-wroibj");
    			add_location(button3, file$1, 143, 14, 4601);
    			attr_dev(div8, "class", "col-md-6");
    			add_location(div8, file$1, 142, 12, 4563);
    			attr_dev(a, "href", "#/cart/buy");
    			add_location(a, file$1, 141, 10, 4528);
    			attr_dev(button4, "class", "btn btn-lg svelte-wroibj");
    			add_location(button4, file$1, 149, 12, 4795);
    			attr_dev(div9, "class", "col-md-6");
    			add_location(div9, file$1, 148, 10, 4759);
    			attr_dev(div10, "class", "top-buffer row svelte-wroibj");
    			add_location(div10, file$1, 140, 8, 4488);
    			attr_dev(div11, "class", "col-md-6");
    			add_location(div11, file$1, 118, 6, 3689);
    			attr_dev(div12, "class", "row g-0");
    			add_location(div12, file$1, 77, 4, 2398);
    			attr_dev(div13, "class", "card");
    			add_location(div13, file$1, 76, 2, 2374);
    			attr_dev(div14, "class", "container mt-5 mb-5");
    			add_location(div14, file$1, 75, 0, 2337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div12, t0);
    			append_dev(div12, div11);
    			append_dev(div11, h2);
    			append_dev(h2, b0);
    			append_dev(b0, t1);
    			append_dev(div11, t2);
    			append_dev(div11, p);
    			append_dev(p, t3);
    			append_dev(div11, t4);
    			append_dev(div11, h4);
    			append_dev(h4, b1);
    			append_dev(b1, t5);
    			append_dev(b1, t6);
    			append_dev(div11, t7);
    			append_dev(div11, h50);
    			append_dev(h50, b2);
    			append_dev(div11, t9);
    			append_dev(div11, div3);
    			append_dev(div3, h51);
    			append_dev(div11, t11);
    			append_dev(div11, div7);
    			append_dev(div7, div4);
    			append_dev(div4, button0);
    			append_dev(div7, t13);
    			append_dev(div7, div5);
    			append_dev(div5, button1);
    			append_dev(button1, t14);
    			append_dev(div7, t15);
    			append_dev(div7, div6);
    			append_dev(div6, button2);
    			append_dev(div11, t17);
    			append_dev(div11, div10);
    			append_dev(div10, a);
    			append_dev(a, div8);
    			append_dev(div8, button3);
    			append_dev(div10, t19);
    			append_dev(div10, div9);
    			append_dev(div9, button4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*reduceFromCart*/ ctx[3], false, false, false, false),
    					listen_dev(button2, "click", /*AddItemInCart*/ ctx[2], false, false, false, false),
    					listen_dev(button3, "click", prevent_default(/*buyNow*/ ctx[4]), false, true, false, false),
    					listen_dev(button4, "click", prevent_default(/*AddItemInCart*/ ctx[2]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cartItem*/ 1 && !src_url_equal(img.src, img_src_value = /*cartItem*/ ctx[0].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*cartItem*/ 1 && t1_value !== (t1_value = /*cartItem*/ ctx[0].product_name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*cartItem*/ 1 && t3_value !== (t3_value = /*cartItem*/ ctx[0].descriptions + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*cartItem*/ 1 && t6_value !== (t6_value = /*cartItem*/ ctx[0].price + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*orderQty*/ 2) set_data_dev(t14, /*orderQty*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let orderQty;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SingleProduct', slots, []);
    	const productClass = new Product();
    	let picture;
    	let cartItem = "";
    	let isAddress = ""; // from this in order page i will change address from default to new address

    	onMount(async () => {
    		$$invalidate(0, cartItem = JSON.parse(sessionStorage.getItem("singleProduct")));
    	});

    	if (cartItem.product_qty === 1 || cartItem.ordered_qty === 0) {
    		orderQty = 1;
    	} else {
    		orderQty = cartItem.ordered_qty;
    	}

    	const AddItemInCart = async () => {
    		$$invalidate(1, orderQty = orderQty + 1);
    		let cart;
    		console.log(cart);
    		cart = cartItem;

    		let addCart = {
    			product_id: cart.product_id,
    			picture: cart.picture,
    			product_name: cart.product_name,
    			price: cart.price,
    			descriptions: cart.descriptions
    		};

    		console.log(cartItem);
    		await productClass.addToCartInLocal(addCart);
    		let totalData = await productClass.itemsInLocalCart();
    		increment(totalData);
    	};

    	const reduceFromCart = async CartItem => {
    		if (orderQty <= 1) {
    			return;
    		} else {
    			$$invalidate(1, orderQty = orderQty - 1);
    		}

    		await productClass.reduceFromCartInLocal(CartItem);
    		let totalData = await productClass.itemsInLocalCart();
    		increment(totalData);
    	};

    	let increment = async totalData => {
    		CartItemsStore.set(await totalData);
    		sessionStorage.setItem("productId", JSON.stringify(totalData));
    	};

    	// for buy selected product
    	const buyNow = async () => {
    		let buyingProductDetail = {
    			product_id: cartItem.product_id,
    			product_name: cartItem.product_name,
    			price: cartItem.price,
    			descriptions: cartItem.descriptions,
    			ordered_qty: orderQty,
    			picture: cartItem.picture,
    			isAddress: ""
    		};

    		sessionStorage.setItem("productId", JSON.stringify(buyingProductDetail));

    		// localStorage.setItem("productId", JSON.stringify(buyingProductDetail));
    		getSingleProductStore.set(buyingProductDetail);

    		push("/cart/buy");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<SingleProduct> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Product,
    		onMount,
    		CartItemsStore,
    		getSingleProductStore,
    		push,
    		pop,
    		replace,
    		productClass,
    		picture,
    		cartItem,
    		isAddress,
    		AddItemInCart,
    		reduceFromCart,
    		increment,
    		buyNow,
    		orderQty
    	});

    	$$self.$inject_state = $$props => {
    		if ('picture' in $$props) picture = $$props.picture;
    		if ('cartItem' in $$props) $$invalidate(0, cartItem = $$props.cartItem);
    		if ('isAddress' in $$props) isAddress = $$props.isAddress;
    		if ('increment' in $$props) increment = $$props.increment;
    		if ('orderQty' in $$props) $$invalidate(1, orderQty = $$props.orderQty);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, orderQty = 1);
    	return [cartItem, orderQty, AddItemInCart, reduceFromCart, buyNow];
    }

    class SingleProduct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SingleProduct",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const routes = {
        "/" : Dashboard,
        "/about" : About,
        "/cart" : Cart,
        "/cart/buy" : OrderSummary,
        "/cart/buy/address": AddAddressForm,
        "/cart/buy/payment":Payment,
        "/cart/buy/payment/success":PaymentSuccess,
        "/login/user" : Login,
        "/login/user/myprofile": MyProfile,
        "/login/user/myorders": MyOrders,
        "/login/user/changepassword": ChangePassword,
         "/login/EmailPasswordForm" : EmailPasswordForm,
         "/login/PasswordForm" :PasswordForm,
        "/login/seller" : Login,
        "/search" : Search,
        "/product" : SingleProduct,
        "*" : NotFound
    };

    /* src\App.svelte generated by Svelte v3.57.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let navbar;
    	let t;
    	let router;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(router.$$.fragment);
    			add_location(main, file, 5, 0, 178);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, link, Navbar, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map